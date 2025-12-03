import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET: List pending user requests for admin's organization
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized - No organization" }, { status: 401 })
        }

        // Only admins can view pending users
        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
        }

        // Fetch users who want to join this organization
        const pendingUsers = await prisma.user.findMany({
            where: {
                pendingOrganizationId: session.user.organizationId,
                isApproved: false,
                organizationId: null // Not yet approved
            } as any,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                title: true,
                position: true,
                churchName: true,
                lcc: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(pendingUsers)
    } catch (error) {
        console.error("Failed to fetch pending users:", error)
        return NextResponse.json({ error: "Failed to fetch pending users" }, { status: 500 })
    }
}

// POST: Approve or reject a user request
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: "Unauthorized - No organization" }, { status: 401 })
        }

        // Only admins can approve users
        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 })
        }

        const body = await req.json()
        const { userId, action, role } = body // action: "approve" or "reject"

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing userId or action" }, { status: 400 })
        }

        // Fetch the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Verify user is requesting to join admin's organization
        if ((user as any).pendingOrganizationId !== session.user.organizationId) {
            return NextResponse.json({ error: "Unauthorized - User not requesting your organization" }, { status: 403 })
        }

        if (action === "approve") {
            // Approve user: move pendingOrganizationId to organizationId
            await prisma.user.update({
                where: { id: userId },
                data: {
                    organizationId: (user as any).pendingOrganizationId,
                    pendingOrganizationId: null,
                    isApproved: true,
                    role: role || "USER" // Set role (default to USER)
                } as any
            })

            return NextResponse.json({
                success: true,
                message: "User approved successfully"
            })
        } else if (action === "reject") {
            // Reject user: clear pendingOrganizationId
            await prisma.user.update({
                where: { id: userId },
                data: {
                    pendingOrganizationId: null,
                    isApproved: false
                } as any
            })

            return NextResponse.json({
                success: true,
                message: "User request rejected"
            })
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

    } catch (error: any) {
        console.error("Failed to process user request:", error)
        return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
    }
}
