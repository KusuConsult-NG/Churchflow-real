import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orgId = searchParams.get("orgId") || session.user.organizationId

    try {
        const staff = await prisma.staff.findMany({
            where: { organizationId: orgId || undefined },
            include: {
                user: { select: { name: true, email: true, phone: true, title: true } },
                department: { select: { name: true } }
            },
            orderBy: { hireDate: 'desc' }
        })

        return NextResponse.json(staff)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            name, email, position,
            staffId, hireDate, contractType, baseSalary,
            bankName, accountNumber
        } = body

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User not linked to organization" }, { status: 400 })
        }

        // Check if user with this email already exists
        let user = await prisma.user.findUnique({
            where: { email }
        })

        // If user doesn't exist, create one
        if (!user) {
            // Generate a temporary password (staff should reset it on first login)
            const bcrypt = require('bcryptjs')
            const tempPassword = Math.random().toString(36).slice(-8) + 'A1!' // Temporary password
            const hashedPassword = await bcrypt.hash(tempPassword, 10)

            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    position,
                    organizationId: session.user.organizationId,
                    role: "USER"
                }
            })

            // TODO: Send email to user with temporary password
            console.log(`Created user ${email} with temp password: ${tempPassword}`)
        }

        // Create staff record linked to user
        const staff = await prisma.staff.create({
            data: {
                userId: user.id,
                organizationId: session.user.organizationId,
                departmentId: null,
                staffId,
                hireDate: new Date(hireDate),
                contractType,
                baseSalary: parseFloat(baseSalary),
                bankName,
                accountNumber
            },
            include: {
                user: { select: { name: true, email: true, position: true } }
            }
        })

        return NextResponse.json(staff)
    } catch (error: any) {
        console.error("Staff creation error:", error)
        return NextResponse.json({ error: error.message || "Failed to create staff" }, { status: 500 })
    }
}
