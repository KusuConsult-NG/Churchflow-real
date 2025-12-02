import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Get list of all organizations for signup dropdown
export async function GET() {
    try {
        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                type: true,
                code: true
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(organizations)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
    }
}
