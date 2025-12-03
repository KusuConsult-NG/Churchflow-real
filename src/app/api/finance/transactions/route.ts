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
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!orgId) {
        return NextResponse.json({ error: "Organization ID required" }, { status: 400 })
    }

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                account: {
                    organizationId: orgId
                }
            },
            include: {
                account: {
                    select: { name: true }
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: limit
        })

        return NextResponse.json(transactions)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }
}
