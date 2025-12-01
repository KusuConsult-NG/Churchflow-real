import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const queries = await prisma.query.findMany({
            include: {
                staff: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { issuedAt: 'desc' }
        })

        return NextResponse.json(queries)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch queries" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { staffId, title, description } = body

        const query = await prisma.query.create({
            data: {
                staffId,
                title,
                description,
                issuedBy: session.user.id,
                status: "ISSUED"
            },
            include: {
                staff: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        })

        return NextResponse.json(query)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create query" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { id, action, response, resolution } = body

        let updateData: any = {}

        if (action === 'respond') {
            updateData = {
                response,
                respondedAt: new Date(),
                status: "RESPONDED"
            }
        } else if (action === 'resolve') {
            updateData = {
                resolution,
                status: "RESOLVED"
            }
        }

        const updated = await prisma.query.update({
            where: { id },
            data: updateData,
            include: {
                staff: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update query" }, { status: 500 })
    }
}
