import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { Title } from "@prisma/client"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, name, phone, title, address, churchName, lcc } = body

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user
        // Note: churchName and lcc are currently not in the User model. 
        // We might need to add them or store them in a metadata field if required.
        // For now, we'll store what we can.

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                phone,
                address,
                churchName,
                lcc,
                title: title as Title,
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })

    } catch (error: any) {
        console.error("Signup error:", error)
        return NextResponse.json({ error: error.message || "Signup failed" }, { status: 500 })
    }
}
