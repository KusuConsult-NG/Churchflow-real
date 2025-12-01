import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfYear, endOfYear, eachMonthOfInterval, format } from "date-fns"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const startParam = searchParams.get("startDate")
        const endParam = searchParams.get("endDate")

        // Default to current year if no dates provided
        const currentYear = new Date().getFullYear()
        const startDate = startParam ? new Date(startParam) : startOfYear(new Date(currentYear, 0, 1))
        const endDate = endParam ? new Date(endParam) : endOfYear(new Date(currentYear, 0, 1))

        // Fetch all income transactions for the period
        const incomeTransactions = await prisma.transaction.findMany({
            where: {
                type: "INCOME",
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        })

        // Fetch all expenditure transactions for the period
        const expenditureTransactions = await prisma.transaction.findMany({
            where: {
                type: "EXPENDITURE",
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        })

        // Aggregate by month
        const months = eachMonthOfInterval({ start: startDate, end: endDate })
        const data = months.map(month => {
            const monthStr = format(month, "MMM")
            const monthIncome = incomeTransactions
                .filter((t: any) => t.date.getMonth() === month.getMonth() && t.date.getFullYear() === month.getFullYear())
                .reduce((sum: number, t: any) => sum + t.amount, 0)

            const monthExpenditure = expenditureTransactions
                .filter((t: any) => t.date.getMonth() === month.getMonth() && t.date.getFullYear() === month.getFullYear())
                .reduce((sum: number, t: any) => sum + t.amount, 0)

            return {
                name: monthStr,
                income: monthIncome,
                expenditure: monthExpenditure
            }
        })

        return NextResponse.json(data)
    } catch (error) {
        console.error("Failed to fetch financial report", error)
        return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 })
    }
}
