"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { hash } from "bcryptjs"

export default function RegisterPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [inviteData, setInviteData] = useState<any>(null)
    const [error, setError] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        verifyToken()
    }, [token])

    const verifyToken = async () => {
        try {
            const res = await fetch(`/api/invites?token=${token}`)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Invalid invite link")
                setLoading(false)
                return
            }

            setInviteData(data.invite)
            setLoading(false)
        } catch (err) {
            setError("Failed to verify invite link")
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setSubmitting(true)

        try {
            // Create user account
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Registration failed")
                setSubmitting(false)
                return
            }

            // Auto sign in
            const signInResult = await signIn("credentials", {
                email: inviteData.email,
                password,
                redirect: false
            })

            if (signInResult?.error) {
                setError("Registration successful but sign-in failed. Please try logging in.")
                setSubmitting(false)
                return
            }

            // Redirect to profile completion
            router.push("/auth/complete-profile")
        } catch (err) {
            setError("An error occurred during registration")
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-lg">Verifying invite...</div>
                </div>
            </div>
        )
    }

    if (error && !inviteData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Invalid Invite</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/auth/signin")} className="w-full">
                            Go to Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Complete Your Registration</CardTitle>
                    <CardDescription>
                        You've been invited to join <strong>{inviteData?.organization?.name}</strong> as {inviteData?.role}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={inviteData?.name || ""} disabled className="bg-gray-50" />
                        </div>

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={inviteData?.email || ""} disabled className="bg-gray-50" />
                        </div>

                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Confirm Password</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Creating Account..." : "Create Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
