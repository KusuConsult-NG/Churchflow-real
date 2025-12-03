import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { organizationId } = body

        if (!organizationId) {
            return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
        }

        // Verify organization exists
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId }
        })

        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        // Update user
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                pendingOrganizationId: organizationId,
                isApproved: false,
                // If they had an organizationId, should we clear it? 
                // The user request implies they might be switching or joining for the first time.
                // If they are already in an org, maybe they shouldn't be able to join another without leaving?
                // For now, let's assume this is primarily for users without an org or switching.
                // If we clear organizationId, they lose access immediately. 
                // If we don't, they stay in old org until approved for new one?
                // The requirement says "create a join existing organization option for users to send request... admin should be notified... and should approve".
                // Let's assume this sets pending. The approval logic (which I wrote earlier) moves pending to actual.
            } as any
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Join Request Error:", error)
        return NextResponse.json({ error: error.message || "Failed to send join request" }, { status: 500 })
    }
}
