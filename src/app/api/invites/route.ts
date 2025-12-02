import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateInviteToken, sendInviteEmail, isTokenExpired } from "@/lib/email"

// POST: Create and send invite
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, name, organizationId, organizationName, role = "ADMIN" } = body

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 })
        }

        // Check for existing pending invites
        const existingInvite = await prisma.inviteToken.findFirst({
            where: {
                email,
                used: false,
                expiresAt: {
                    gt: new Date()
                }
            }
        })

        if (existingInvite) {
            return NextResponse.json({ error: "An invite has already been sent to this email" }, { status: 400 })
        }

        // Generate token and create invite
        const token = generateInviteToken()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

        const invite = await prisma.inviteToken.create({
            data: {
                token,
                email,
                name,
                organizationId,
                name,
                organizationId,
                role,
                position: body.position, // Add position if provided
                expiresAt
            }
        })

        // Send email (currently logs to console)
        await sendInviteEmail(email, name, token, organizationName)

        return NextResponse.json({
            success: true,
            message: "Invite sent successfully",
            inviteId: invite.id
        })
    } catch (error: any) {
        console.error("Invite send error:", error)
        return NextResponse.json({ error: error.message || "Failed to send invite" }, { status: 500 })
    }
}

// GET: Verify token
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get("token")

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 })
        }

        const invite = await prisma.inviteToken.findUnique({
            where: { token }
        })

        if (!invite) {
            return NextResponse.json({ error: "Invalid invite token" }, { status: 404 })
        }

        if (invite.used) {
            return NextResponse.json({ error: "This invite has already been used" }, { status: 400 })
        }

        if (isTokenExpired(invite.expiresAt)) {
            return NextResponse.json({ error: "This invite has expired" }, { status: 400 })
        }

        // Fetch organization details
        const organization = await prisma.organization.findUnique({
            where: { id: invite.organizationId },
            select: { id: true, name: true, type: true }
        })

        return NextResponse.json({
            valid: true,
            invite: {
                email: invite.email,
                name: invite.name,
                role: invite.role,
                organization
            }
        })
    } catch (error: any) {
        console.error("Invite verify error:", error)
        return NextResponse.json({ error: error.message || "Failed to verify invite" }, { status: 500 })
    }
}
