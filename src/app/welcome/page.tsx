"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return

        if (!session) {
            router.push("/auth/signin")
            return
        }

        // If user has pending organization, show pending message
        if (session.user.pendingOrganizationId && !session.user.organizationId) {
            // User is waiting for approval - stay on this page with message
            return
        }

        // If user already has an organization, redirect to dashboard
        if (session.user.organizationId) {
            router.push("/dashboard")
        }
    }, [session, status, router])

    if (status === "loading" || !session) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-ecwa-blue to-blue-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        )
    }

    // If user is pending approval
    if (session.user.pendingOrganizationId && !session.user.organizationId) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-ecwa-blue to-blue-900 flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-2xl mx-auto text-center">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-12 rounded-2xl">
                        <div className="text-6xl mb-6">⏳</div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Pending Approval
                        </h1>
                        <p className="text-xl text-blue-100 mb-6">
                            Hi {session.user.name}, your request to join an organization is pending admin approval.
                        </p>
                        <p className="text-blue-200">
                            You'll receive access to the dashboard once an administrator approves your request.
                            Please check back later or contact your organization's admin.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-ecwa-blue to-blue-900 flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
                {/* Welcome Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                        Welcome to ChurchFlow!
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
                        Hi {session.user.name}, you're successfully registered. Now let's get you set up.
                    </p>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-3xl mx-auto">
                    {/* Create Organization Card */}
                    <Link
                        href="/create-organization"
                        className="group bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center text-center w-full min-h-[280px]"
                    >
                        <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <Building2 size={48} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Create Organization</h2>
                        <p className="text-blue-100 mb-6">
                            Set up a new church, GCC, DCC, LCC, or LC and invite your team members.
                        </p>
                        <Button className="w-full bg-white text-[var(--color-ecwa-blue)] hover:bg-blue-50 font-semibold">
                            Create New Organization
                        </Button>
                    </Link>

                    {/* Join Organization Card */}
                    <div className="group bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center text-center w-full min-h-[280px]">
                        <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <Users size={48} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Join Organization</h2>
                        <p className="text-blue-100 mb-6">
                            Have an invite from your organization? Check your email for the invitation link.
                        </p>
                        <div className="text-sm text-blue-200 bg-white/5 p-3 rounded-lg">
                            Ask your admin to send you an invite link
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-12 text-center text-blue-200 text-sm max-w-2xl">
                    <p>
                        You need to be part of an organization to access the dashboard and manage finances,
                        HR, campaigns, and reports.
                    </p>
                </div>
            </div>
        </div>
    )
}
