import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { campaignId, amount, donorName, donorEmail, message, paymentMethod } = body

        if (!campaignId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (!paymentMethod) {
            return NextResponse.json({ error: "Payment method is required" }, { status: 400 })
        }

        // Generate a unique payment reference
        const paymentReference = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        // Create donation with PENDING status
        // DO NOT update campaign amount yet - only after payment verification
        const donation = await prisma.donation.create({
            data: {
                campaignId,
                amount: parseFloat(amount),
                donorName: donorName || "Anonymous",
                donorEmail,
                message,
                paymentMethod,
                paymentReference,
                status: "PENDING" // Will be updated to COMPLETED after payment verification
            }
        })

        return NextResponse.json({
            success: true,
            donation,
            paymentReference,
            message: "Donation created. Please complete payment."
        })
    } catch (error: any) {
        console.error("Donation creation error:", error)
        return NextResponse.json({ error: error.message || "Failed to process donation" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get("campaignId")

    if (!campaignId) {
        return NextResponse.json({ error: "Campaign ID required" }, { status: 400 })
    }

    try {
        const donations = await prisma.donation.findMany({
            where: { campaignId },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(donations)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }
}
