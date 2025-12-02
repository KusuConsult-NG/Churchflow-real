import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrganizationType } from "@prisma/client"
import { randomBytes } from "crypto"

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
    try {
        const body = await req.json()
        // Consolidate destructuring. Assume the frontend sends these fields.
        const {
            name, type, code, address, email, phone, parentId,
            adminName, adminEmail
        } = body

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
        }

        // Validate parent if provided
        if (parentId) {
            const parentOrg = await prisma.organization.findUnique({
                where: { id: parentId }
            })

            if (!parentOrg) {
                return NextResponse.json({ error: "Parent organization not found" }, { status: 404 })
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
        return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 })
    }
}
