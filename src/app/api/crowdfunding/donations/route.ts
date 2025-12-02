import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { campaignId, amount, donorName, donorEmail, message, paymentMethod, reference } = body

        if (!campaignId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Transaction to create donation and update campaign amount
        const result = await prisma.$transaction(async (tx) => {
            const donation = await tx.donation.create({
                data: {
                    campaignId,
                    amount: parseFloat(amount),
                    donorName: donorName || "Anonymous",
                    donorEmail,
                    message,
                    paymentMethod: paymentMethod || "ONLINE",
                    reference,
                    status: "COMPLETED"
                }
            })

            const updatedCampaign = await tx.campaign.update({
                where: { id: campaignId },
                data: {
                    currentAmount: {
                        increment: parseFloat(amount)
                    }
                }
            })

            // Check if goal met
            if (updatedCampaign.currentAmount >= updatedCampaign.goalAmount && updatedCampaign.status !== "COMPLETED") {
                await tx.campaign.update({
                    where: { id: campaignId },
                    data: { status: "COMPLETED" }
                })
                updatedCampaign.status = "COMPLETED"
            }

            return { donation, campaign: updatedCampaign }
        })

        return NextResponse.json(result)
    } catch (error: any) {
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
