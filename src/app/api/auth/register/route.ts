import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { UserRole } from "@prisma/client"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { token, password } = body

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
        }

        // Verify and fetch invite
        const invite = await prisma.inviteToken.findUnique({
            where: { token }
        })

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite token" }, { status: 404 })
        }

        if (invite.used) {
            return NextResponse.json({ error: "This invite has already been used" }, { status: 400 })
        }

        if (new Date() > invite.expiresAt) {
            return NextResponse.json({ error: "This invite has expired" }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: invite.email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user and mark invite as used
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name: invite.name,
                    email: invite.email,
                    password: hashedPassword,
                    role: invite.role as UserRole,
                    organizationId: invite.organizationId,
                    position: "Administrator"
                }
            })

            await tx.inviteToken.update({
                where: { id: invite.id },
                data: {
                    used: true,
                    usedAt: new Date()
                }
            })

            return newUser
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })
    } catch (error: any) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 })
    }
}
