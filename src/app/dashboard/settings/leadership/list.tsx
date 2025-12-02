"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Mail, Check } from "lucide-react"
import { User } from "@prisma/client"

interface RoleDef {
    role: string
    label: string
}

interface LeadershipListProps {
    organizationId: string
    requiredRoles: RoleDef[]
    currentLeaders: User[]
}

export function LeadershipList({ organizationId, requiredRoles, currentLeaders }: LeadershipListProps) {
    const [selectedRole, setSelectedRole] = useState<RoleDef | null>(null)
    const [isInviteOpen, setIsInviteOpen] = useState(false)

    // Find user for a role (by position string match for now)
    const getLeaderForRole = (roleLabel: string) => {
        return currentLeaders.find(u => u.position === roleLabel)
    }

    return (
        <div className="space-y-6">
            {requiredRoles.map((role) => {
                const leader = getLeaderForRole(role.label)

                return (
                    <div key={role.role} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div>
                            <h3 className="font-medium text-gray-900">{role.label}</h3>
                            {leader ? (
                                <div className="flex items-center text-sm text-green-600 mt-1">
                                    <Check className="w-4 h-4 mr-1" />
                                    {leader.name} ({leader.email})
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mt-1">Vacant</p>
                            )}
                        </div>

                        {!leader && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedRole(role)
                                    setIsInviteOpen(true)
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Leader
                            </Button>
                        )}
                    </div>
                )
            })}

            <InviteLeaderDialog
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                role={selectedRole}
                organizationId={organizationId}
            />
        </div>
    )
}

function InviteLeaderDialog({ open, onOpenChange, role, organizationId }: any) {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/invites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    name,
                    organizationId,
                    role: "LEADER", // Generic role
                    position: role.label // Specific position
                })
            })

            if (!res.ok) throw new Error("Failed to send invite")

            onOpenChange(false)
            setEmail("")
            setName("")
            // In a real app, we'd trigger a refresh here
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert("Failed to send invite")
        } finally {
            setIsLoading(false)
        }
    }

    if (!role) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite {role.label}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <Label>Full Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Email Address</Label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Mail className="mr-2" />}
                        Send Invitation
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
