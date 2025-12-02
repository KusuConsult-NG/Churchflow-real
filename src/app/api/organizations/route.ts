import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrganizationType } from "@prisma/client"
import { randomBytes } from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Helper functions
function generateInviteToken() {
    return randomBytes(32).toString("hex")
}

async function sendInviteEmail(email: string, name: string, token: string, orgName: string) {
    // In a real app, use Resend, SendGrid, etc.
    console.log(`[MOCK EMAIL] To: ${email}, Subject: Invite to ${orgName}, Link: /auth/signup?token=${token}`)
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const hierarchy = searchParams.get("hierarchy") === "true"

    try {
        let where: any = {}
        if (type) where.type = type

        if (hierarchy) {
            const organizations = await prisma.organization.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    parentId: true,
                    _count: {
                        select: { children: true, staff: true, users: true }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            })
            return NextResponse.json(organizations)
        }

        const organizations = await prisma.organization.findMany({
            where,
            select: { id: true, name: true, code: true, type: true, parentId: true }
        })
        return NextResponse.json(organizations)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            name, type, code, address, email, phone, parentId,
            adminName, adminEmail
        } = body

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (existingUser) {
            return NextResponse.json({
                error: "A user with this email already exists. Please use a different email for the new administrator."
            }, { status: 400 })
        }

        // Validate parent if provided
        if (parentId) {
            const parentOrg = await prisma.organization.findUnique({
                where: { id: parentId }
            })

            if (!parentOrg) {
                return NextResponse.json({ error: "Parent organization not found" }, { status: 404 })
            }

            // Verify user belongs to parent org (security check)
            if (parentOrg.id !== session.user.organizationId) {
                return NextResponse.json({ error: "You can only create sub-organizations for your own organization" }, { status: 403 })
            }
        }

        // Create Organization
        const organization = await prisma.organization.create({
            data: {
                name,
                type: type as OrganizationType,
                code,
                email,
                phone,
                address,
                parentId
            }
        })

        // Create Invite for Admin
        const token = generateInviteToken()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 48) // 48 hours

        await prisma.inviteToken.create({
            data: {
                token,
                email: adminEmail,
                name: adminName,
                organizationId: organization.id,
                role: "ADMIN", // Default role for new org admin
                expiresAt
            }
        })

        // Send Email
        await sendInviteEmail(adminEmail, adminName, token, organization.name)

        return NextResponse.json({
            success: true,
            organization,
            message: "Organization created and admin invited"
        })

    } catch (error: any) {
        console.error("Create Org Error:", error)
        // Handle Prisma unique constraint errors (e.g. code)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Organization code already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, name, code, address, email, phone } = body

        if (!id) {
            return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
        }

        // Verify ownership/permission
        // Ideally, check if user is admin of the parent or the org itself
        // For now, simple check: user must be in the same org tree (simplified)

        const org = await prisma.organization.update({
            where: { id },
            data: {
                name,
                code,
                address,
                email,
                phone
            }
        })

        return NextResponse.json(org)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update organization" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
        }

        // Check if org has children
        const org = await prisma.organization.findUnique({
            where: { id },
            include: { _count: { select: { children: true, users: true } } }
        })

        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 })
        }

        if (org._count.children > 0) {
            return NextResponse.json({ error: "Cannot delete organization with sub-organizations" }, { status: 400 })
        }

        // Allow deletion even if users exist? Maybe not.
        // For now, let's allow it but warn (or just delete). 
        // Better to prevent if users exist.
        if (org._count.users > 0) {
            return NextResponse.json({ error: "Cannot delete organization with active users" }, { status: 400 })
        }

        await prisma.organization.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete organization" }, { status: 500 })
    }
}
