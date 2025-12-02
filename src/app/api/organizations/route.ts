import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const hierarchy = searchParams.get("hierarchy") === "true"

    try {
        let where: any = {}
        if (type) where.type = type

        if (hierarchy) {
            // Fetch only top-level orgs (HQ) and include children recursively
            // Note: Prisma doesn't support infinite recursion easily, so we fetch all and build tree client-side
            // OR we fetch top level and their immediate children.
            // For now, let's fetch all with parentId to build tree client-side.
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
        const {
            orgName, orgType, orgCode, orgAddress, orgEmail, parentId,
            adminName, adminEmail
        } = body

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
        }

        // Determine Role based on Org Type
        let role = "ADMIN"
        if (orgType === "HQ") role = "SUPER_ADMIN"
        if (orgType === "LC") role = "SENIOR_MINISTER"

        const { name, type, code, email, phone, address, parentId, adminName, adminEmail } = body

        // Validate parent
        const parentOrg = await prisma.organization.findUnique({
            where: { id: parentId }
        })

        if (!parentOrg) {
            return NextResponse.json({ error: "Parent organization not found" }, { status: 404 })
        }

        // Validate hierarchy (Basic check, UI does strict check)
        // HQ -> GCC/DCC, GCC -> DCC, DCC -> LCC, LCC -> LC

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
