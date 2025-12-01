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
        const { userId, departmentId, staffId, hireDate, contractType, baseSalary, bankName, accountNumber } = body

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User not linked to organization" }, { status: 400 })
        }

        const staff = await prisma.staff.create({
            data: {
                userId,
                organizationId: session.user.organizationId,
                departmentId: departmentId || null,
                staffId,
                hireDate: new Date(hireDate),
                contractType,
                baseSalary: parseFloat(baseSalary),
                bankName,
                accountNumber
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        })

        return NextResponse.json(staff)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create staff" }, { status: 500 })
    }
}
