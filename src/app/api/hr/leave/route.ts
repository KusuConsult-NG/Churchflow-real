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
        const requests = await prisma.leaveRequest.findMany({
            where: {
                staff: {
                    organizationId: orgId || undefined
                }
            },
            include: {
                staff: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(requests)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { staffId, type, startDate, endDate, reason } = body

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User not linked to organization" }, { status: 400 })
        }

        // Verify staff belongs to organization
        const staff = await prisma.staff.findFirst({
            where: {
                id: staffId,
                organizationId: session.user.organizationId
            }
        })

        if (!staff) {
            return NextResponse.json({ error: "Staff member not found in your organization" }, { status: 404 })
        }

        const request = await prisma.leaveRequest.create({
            data: {
                staffId,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
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

        return NextResponse.json(request)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create leave request" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, action, rejectionReason } = body

        const updateData: any = {}

        if (action === 'approve') {
            updateData.status = "APPROVED"
            updateData.approvedBy = session.user.id
        } else if (action === 'reject') {
            updateData.status = "REJECTED"
            updateData.rejectionReason = rejectionReason
        }

        const updated = await prisma.leaveRequest.update({
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
        return NextResponse.json({ error: error.message || "Failed to update request" }, { status: 500 })
    }
}
