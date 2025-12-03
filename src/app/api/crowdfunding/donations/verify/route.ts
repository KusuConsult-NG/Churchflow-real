import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { paymentReference } = body

        if (!paymentReference) {
            return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
        }

        // Find the donation
        const donation = await prisma.donation.findUnique({
            where: { paymentReference },
            include: { campaign: true }
        })

        if (!donation) {
            return NextResponse.json({ error: "Donation not found" }, { status: 404 })
        }

        if (donation.status === "COMPLETED") {
            return NextResponse.json({ error: "Donation already verified" }, { status: 400 })
        }

        // In a real implementation, you would verify with Paystack/Flutterwave API here
        // For now, we'll simulate verification

        // Update donation and campaign in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update donation status
            const updatedDonation = await tx.donation.update({
                where: { paymentReference },
                data: { status: "COMPLETED" }
            })

            // Update campaign amount
            const updatedCampaign = await tx.campaign.update({
                where: { id: donation.campaignId },
                data: {
                    currentAmount: {
                        increment: donation.amount
                    }
                }
            })

            // Check if goal met
            if (updatedCampaign.currentAmount >= updatedCampaign.goalAmount && updatedCampaign.status !== "COMPLETED") {
                await tx.campaign.update({
                    where: { id: donation.campaignId },
                    data: { status: "COMPLETED" }
                })
                updatedCampaign.status = "COMPLETED"
            }

            return { donation: updatedDonation, campaign: updatedCampaign }
        })

        return NextResponse.json({
            success: true,
            ...result,
            message: "Payment verified successfully"
        })

    } catch (error: any) {
        console.error("Payment verification error:", error)
        return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 })
    }
}
