"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function CompleteProfilePage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        phone: "",
        title: "",
        address: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/auth/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                throw new Error("Failed to update profile")
            }

            // Update session
            await update()

            // Redirect to dashboard
            router.push("/dashboard")
        } catch (error) {
            console.error(error)
            alert("Failed to update profile. You can complete it later from settings.")
            router.push("/dashboard")
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = () => {
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Complete Your Profile</CardTitle>
                    <CardDescription>
                        Add a few more details to personalize your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+234..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Title <span className="text-gray-400 text-sm">(e.g., Rev., Elder, Pastor)</span></Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Rev., Elder, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Address <span className="text-gray-400 text-sm">(Optional)</span></Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Your address"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleSkip}
                                disabled={loading}
                            >
                                Skip for Now
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save & Continue"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
