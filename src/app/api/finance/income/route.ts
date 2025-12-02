import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TransactionType, PaymentMethod } from "@prisma/client"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get("accountId")

    try {
        const where: any = { type: TransactionType.INCOME }
        if (accountId) where.accountId = accountId

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                account: { select: { name: true } }
            },
            orderBy: { date: 'desc' },
            take: 100
        })

        return NextResponse.json(transactions)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch income" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { accountId, amount, source, category, description, narration, paymentMethod, reference, date } = body

        // Create transaction and update account balance
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    accountId,
                    type: TransactionType.INCOME,
                    amount: parseFloat(amount),
                    source: source || "Anonymous",
                    category,
                    description,
                    narration, // Add narration
                    paymentMethod: paymentMethod as PaymentMethod,
                    reference,
                    date: date ? new Date(date) : new Date()
                } as any
            })

            // Update account balance
            await tx.account.update({
                where: { id: accountId },
                data: {
                    balance: {
                        increment: parseFloat(amount)
                    }
                }
            })

            return transaction
        })

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to record income" }, { status: 500 })
    }
}
