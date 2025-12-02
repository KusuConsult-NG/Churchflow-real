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
    const month = searchParams.get("month")
    const orgId = searchParams.get("orgId") || session.user.organizationId

    try {
        const where: any = {
            staff: {
                organizationId: orgId || undefined
            }
        }

        if (month) {
            const targetDate = new Date(month)
            where.month = targetDate
        }

        const payrolls = await prisma.payroll.findMany({
            where,
            include: {
                staff: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { month: 'desc' }
        })

        return NextResponse.json(payrolls)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { month, staffIds } = body // Generate for specific month

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User not linked to organization" }, { status: 400 })
        }

        // Get all active staff if no specific staffIds provided
        const targetStaff = staffIds || await prisma.staff.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, baseSalary: true }
        })

        const monthDate = new Date(month)

        // Generate payroll for each staff
        const payrolls = await Promise.all(
            (Array.isArray(targetStaff) ? targetStaff : [targetStaff]).map(async (staff: any) => {
                const staffData = staffIds ? await prisma.staff.findUnique({ where: { id: staff } }) : staff

                if (!staffData) return null

                // Check if payroll already exists for this month
                const existing = await prisma.payroll.findFirst({
                    where: {
                        staffId: staffData.id,
                        month: monthDate
                    }
                })

                if (existing) return existing

                // Simple calculation: baseSalary - no deductions
                const basicSalary = staffData.baseSalary
                const allowances = 0 // Can be customized
                const deductions = 0 // Can be customized
                const netSalary = basicSalary + allowances - deductions

                return await prisma.payroll.create({
                    data: {
                        staffId: staffData.id,
                        month: monthDate,
                        basicSalary,
                        allowances,
                        deductions,
                        netSalary,
                        status: "PENDING"
                    },
                    include: {
                        staff: {
                            include: {
                                user: { select: { name: true } }
                            }
                        }
                    }
                })
            })
        )

        return NextResponse.json(payrolls.filter(p => p !== null))
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to generate payroll" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, action } = body

        let updateData: any = {}

        if (action === 'approve') {
            updateData = { status: "APPROVED" }
        } else if (action === 'pay') {
            updateData = {
                status: "PAID",
                paymentDate: new Date()
            }
        }

        const updated = await prisma.payroll.update({
            where: { id },
            data: updateData,
            include: {
                staff: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update payroll" }, { status: 500 })
    }
}
