"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { OrganizationType } from "@prisma/client"

interface CreateOrgFormProps {
    parentId: string
    allowedTypes: OrganizationType[]
}

export function CreateOrgForm({ parentId, allowedTypes }: CreateOrgFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        type: allowedTypes[0], // Default to first allowed type
        code: "",
        email: "",
        phone: "",
        address: "",
        adminName: "",
        adminEmail: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    parentId
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create organization")
            }

            // Redirect to org list or dashboard
            router.push("/dashboard/organizations")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Organization Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val) => setFormData({ ...formData, type: val as OrganizationType })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {allowedTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Organization Code</Label>
                        <Input
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. DCC-001"
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label>Organization Name</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. ECWA GoodNews HighCost"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="office@example.com"
                        />
                    </div>
                    <div>
                        <Label>Phone</Label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+234..."
                        />
                    </div>
                </div>

                <div>
                    <Label>Address</Label>
                    <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street Address, City, State"
                    />
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Initial Administrator</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Admin Name</Label>
                        <Input
                            value={formData.adminName}
                            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                            placeholder="Full Name"
                            required
                        />
                    </div>
                    <div>
                        <Label>Admin Email</Label>
                        <Input
                            type="email"
                            value={formData.adminEmail}
                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    An invite link will be sent to this email address.
                </p>
            </div>

            <Button
                type="submit"
                className="w-full bg-[var(--color-ecwa-blue)]"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Organization...
                    </>
                ) : (
                    "Create Organization & Invite Admin"
                )}
            </Button>
        </form>
    )
}
