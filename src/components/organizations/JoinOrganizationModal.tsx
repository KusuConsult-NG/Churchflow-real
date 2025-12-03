"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface JoinOrganizationModalProps {
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function JoinOrganizationModal({ trigger, open, onOpenChange }: JoinOrganizationModalProps) {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [organizations, setOrganizations] = useState<any[]>([])
    const [selectedOrgId, setSelectedOrgId] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetch("/api/organizations/list")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrganizations(data)
                }
            })
            .catch(err => console.error("Failed to load organizations"))
            .finally(() => setFetching(false))
    }, [])

    const handleJoin = async () => {
        if (!selectedOrgId) return

        setLoading(true)
        setError("")

        try {
            // We need an endpoint to update the user's pendingOrganizationId
            // Since we don't have a dedicated endpoint for this yet, let's create one or use an existing one.
            // Actually, we can use a new endpoint /api/users/join-request

            const res = await fetch("/api/users/join-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId: selectedOrgId })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                // Update session to reflect pending status
                await update()
                // Refresh page after a delay
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            } else {
                setError(data.error || "Failed to send join request")
            }
        } catch (err) {
            setError("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join Organization</DialogTitle>
                    <DialogDescription>
                        Select an organization to join. Your request will be sent to the administrator for approval.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Request Sent!</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Your request has been sent to the organization admin. You will be notified once approved.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Organization</Label>
                            <Select
                                value={selectedOrgId}
                                onValueChange={setSelectedOrgId}
                                disabled={fetching}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={fetching ? "Loading..." : "Select organization"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name} ({org.type}) {org.code && `- ${org.code}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleJoin}
                            disabled={!selectedOrgId || loading}
                            className="w-full bg-[var(--color-ecwa-blue)] hover:bg-[var(--color-ecwa-blue)]/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending Request...
                                </>
                            ) : (
                                "Send Request"
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
