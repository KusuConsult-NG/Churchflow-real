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

        // Create Organization only
        const org = await prisma.organization.create({
            data: {
                name: orgName,
                type: orgType,
                code: orgCode,
                address: orgAddress,
                email: orgEmail,
                parentId: parentId || null
            }
        })

        // Send invite to admin
        const inviteResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/invites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: adminEmail,
                name: adminName,
                organizationId: org.id,
                organizationName: orgName,
                role
            })
        })

        if (!inviteResponse.ok) {
            // If invite fails, we could optionally delete the org
            // For now, just return error but keep org
            const error = await inviteResponse.json()
            return NextResponse.json({
                org,
                warning: "Organization created but invite failed to send",
                error: error.error
            }, { status: 207 }) // 207 Multi-Status
        }

        return NextResponse.json({
            success: true,
            org,
            message: `Organization created successfully. Invite sent to ${adminEmail}`
        })
    } catch (error: any) {
        console.error("Org Creation Error:", error)
        return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 })
    }
}
