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
        const accounts = await prisma.account.findMany({
            where: { organizationId: orgId || undefined },
            include: {
                _count: { select: { transactions: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(accounts)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, accountNumber, bankName, balance } = body

        if (!session.user.organizationId) {
            return NextResponse.json({ error: "User not linked to organization" }, { status: 400 })
        }

        const account = await prisma.account.create({
            data: {
                name,
                accountNumber,
                bankName,
                balance: parseFloat(balance) || 0,
                organizationId: session.user.organizationId
            }
        })

        return NextResponse.json(account)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 })
    }
}
