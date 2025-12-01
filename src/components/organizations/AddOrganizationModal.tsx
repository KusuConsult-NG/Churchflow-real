"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface AddOrganizationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    parentOrg: { id: string, name: string, type: string } | null
}

export default function AddOrganizationModal({ isOpen, onClose, onSuccess, parentOrg }: AddOrganizationModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        type: "",
        code: "",
        email: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "password123", // Default for now
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orgName: formData.name,
                    orgType: formData.type,
                    orgCode: formData.code,
                    orgEmail: formData.email,
                    parentId: parentOrg?.id,
                    adminName: formData.adminName,
                    adminEmail: formData.adminEmail,
                    adminPassword: formData.adminPassword
                })
            })

            if (!res.ok) throw new Error("Failed to create organization")

            onSuccess()
            onClose()
            setFormData({
                name: "", type: "", code: "", email: "",
                adminName: "", adminEmail: "", adminPassword: "password123"
            })
        } catch (error) {
            console.error(error)
            alert("Failed to create organization")
        } finally {
            setLoading(false)
        }
    }

    // Determine allowed types based on parent
    const getAllowedTypes = () => {
        if (!parentOrg) return ["HQ"]
        if (parentOrg.type === "HQ") return ["GCC", "DCC"] // HQ can create GCC or DCC
        if (parentOrg.type === "GCC") return ["DCC"]
        if (parentOrg.type === "DCC") return ["LCC"]
        if (parentOrg.type === "LCC") return ["LC"]
        if (parentOrg.type === "LC") return ["AGENCY", "DEPARTMENT"]
        return []
    }

    const allowedTypes = getAllowedTypes()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {parentOrg ? `Add Sub-Organization to ${parentOrg.name}` : "Create Root Organization"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. ECWA Goodnews"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allowedTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Code (Optional)</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. DCC-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="org@ecwa.org"
                            />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-3">Administrator Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Admin Name</Label>
                                <Input
                                    required
                                    value={formData.adminName}
                                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Admin Email</Label>
                                <Input
                                    required
                                    type="email"
                                    value={formData.adminEmail}
                                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                    placeholder="admin@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading || !formData.type}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Organization
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
