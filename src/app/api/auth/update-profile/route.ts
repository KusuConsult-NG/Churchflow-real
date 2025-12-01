import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { phone, title, address } = body

        // Update user profile
        const user = await prisma.user.update({
            where: { email: session.user.email! },
            data: {
                phone: phone || undefined,
                title: title || undefined,
                address: address || undefined
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                title: user.title
            }
        })
    } catch (error: any) {
        console.error("Profile update error:", error)
        return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 })
    }
}
