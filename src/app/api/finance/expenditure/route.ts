import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ApprovalStatus } from "@prisma/client"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const orgId = searchParams.get("orgId") || session.user.organizationId

    try {
        const where: any = {}
        if (orgId) where.organizationId = orgId
        if (status) where.status = status as ApprovalStatus

        const requests = await prisma.expenditureRequest.findMany({
            where,
            include: {
                requester: { select: { name: true, email: true } },
                organization: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(requests)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch expenditure requests" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { amount, description, category, beneficiary, bankName, accountNumber } = body

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User not linked to organization" }, { status: 400 })
        }

        const request = await prisma.expenditureRequest.create({
            data: {
                amount: parseFloat(amount),
                description,
                category,
                beneficiaryName: beneficiary,
                bankName,
                accountNumber,
                requesterId: session.user.id,
                organizationId: session.user.organizationId,
                status: ApprovalStatus.PENDING
            } as any,
            include: {
                requester: { select: { name: true } }
            }
        })

        return NextResponse.json(request)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create request" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, action, rejectionReason } = body // action: 'review', 'approve', 'reject', 'pay'

        const request = await prisma.expenditureRequest.findUnique({
            where: { id }
        })

        if (!request) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 })
        }

        let updateData: any = {}

        switch (action) {
            case 'review':
                updateData = {
                    status: ApprovalStatus.REVIEWED,
                    reviewedBy: session.user.id,
                    reviewedAt: new Date()
                }
                break
            case 'approve':
                updateData = {
                    status: ApprovalStatus.APPROVED,
                    approvedBy: session.user.id,
                    approvedAt: new Date()
                }
                break
            case 'reject':
                updateData = {
                    status: ApprovalStatus.REJECTED,
                    rejectionReason
                }
                break
            case 'pay':
                updateData = {
                    status: ApprovalStatus.PAID,
                    paidBy: session.user.id,
                    paidAt: new Date()
                }
                break
            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

        const updated = await prisma.expenditureRequest.update({
            where: { id },
            data: updateData,
            include: {
                requester: { select: { name: true } }
            }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update request" }, { status: 500 })
    }
}
