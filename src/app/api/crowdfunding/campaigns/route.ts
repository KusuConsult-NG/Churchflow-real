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
    const orgId = searchParams.get("orgId")
    const status = searchParams.get("status")

    try {
        const where: any = {}
        if (orgId) {
            where.organizationId = orgId
        } else {
            // If no orgId specified, fetch campaigns for user's current org OR created by user
            // actually, standard behavior is usually current org. 
            // Let's assume the user might have created it in a different org context or the context is missing.
            // Let's try to be broader: campaigns in user's org.
            where.organizationId = session.user.organizationId
        }
        if (status) where.status = status

        const campaigns = await prisma.campaign.findMany({
            where,
            include: {
                organization: { select: { name: true, type: true } },
                creator: { select: { name: true } },
                _count: { select: { donations: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(campaigns)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, goalAmount, startDate, endDate, organizationId } = body

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User not linked to an organization" }, { status: 400 })
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                description,
                goalAmount: parseFloat(goalAmount),
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                organizationId: organizationId || session.user.organizationId,
                creatorId: session.user.id,
                status: "ACTIVE"
            }
        })

        return NextResponse.json(campaign)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 })
    }
}
