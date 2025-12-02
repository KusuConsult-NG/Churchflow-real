"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const ORG_TYPES = [
    { value: "HQ", label: "HQ - Headquarters" },
    { value: "GCC", label: "GCC - General Church Council" },
    { value: "DCC", label: "DCC - District Church Council" },
    { value: "LCC", label: "LCC - Local Church Council" },
    { value: "LC", label: "LC - Local Church" },
]

export default function CreateFirstOrganizationPage() {
    const router = useRouter()
    const { data: session, update } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        type: "",
        code: "",
        email: "",
        phone: "",
        address: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            // Create organization and link current user as admin
            const res = await fetch("/api/organizations/create-first", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create organization")
            }

            // Update session to include new organizationId
            await update()

            // Redirect to dashboard
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (!session) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">Create Your Organization</CardTitle>
                    <p className="text-gray-600 mt-2">Set up your church or council to get started</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label className="text-gray-700">Organization Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                                required
                            >
                                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                    <SelectValue placeholder="Select organization type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-300">
                                    {ORG_TYPES.map(t => (
                                        <SelectItem key={t.value} value={t.value} className="text-gray-900 cursor-pointer hover:bg-gray-100">
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-gray-700">Organization Name *</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., ECWA Jos District"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                            <Label className="text-gray-700">Organization Code</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., JOS-DCC-001"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700">Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="org@example.com"
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-700">Phone</Label>
                                <Input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+234..."
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-700">Address</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Organization address"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[var(--color-ecwa-blue)] hover:bg-[var(--color-ecwa-blue)]/90 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Organization...
                                </>
                            ) : (
                                "Create Organization"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
