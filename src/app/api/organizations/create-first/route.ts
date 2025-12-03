import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { OrganizationType } from "@prisma/client"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user already has an organization
        if (session.user.organizationId) {
            return NextResponse.json({ error: "User already belongs to an organization" }, { status: 400 })
        }

        const body = await req.json()
        const { name, type, code, address, email, phone } = body

        if (!name || !type) {
            return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
        }

        // Check if organization code exists
        if (code) {
            const existingOrg = await prisma.organization.findUnique({
                where: { code }
            })

            if (existingOrg) {
                return NextResponse.json({
                    error: "Organization code already exists. Please choose a different code."
                }, { status: 400 })
            }
        }

        // Create Organization and link current user
        const organization = await prisma.organization.create({
            data: {
                name,
                type: type as OrganizationType,
                code,
                email,
                phone,
                address,
            }
        })

        // Update user to link them to this organization as admin
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                organizationId: organization.id,
                role: "ADMIN"
            }
        })

        return NextResponse.json({
            success: true,
            organization,
            message: "Organization created successfully"
        })

    } catch (error: any) {
        console.error("Create first org error:", error)
        return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 })
    }
}
