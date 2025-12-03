import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { Title } from "@prisma/client"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name, phone, title, address, churchName, lcc, pendingOrganizationId } = body

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        // Validate organization if provided
        if (pendingOrganizationId) {
            const organization = await prisma.organization.findUnique({
                where: { id: pendingOrganizationId }
            })

            if (!organization) {
                return NextResponse.json({ error: "Invalid organization selected" }, { status: 400 })
            }
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user with pending organization
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                phone,
                address,
                churchName,
                lcc,
                title: title as Title,
                pendingOrganizationId: pendingOrganizationId || null,
                isApproved: false // User needs admin approval if they selected an org
            } as any
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            pendingApproval: !!pendingOrganizationId
        })

    } catch (error: any) {
        console.error("Signup error:", error)
        return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
    }
}
