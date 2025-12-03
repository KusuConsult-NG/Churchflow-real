"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Users } from "lucide-react"
import { format } from "date-fns"

interface PendingUser {
    id: string
    name: string
    email: string
    phone: string | null
    title: string | null
    position: string | null
    churchName: string | null
    lcc: string | null
    createdAt: string
}

export default function PendingUsersPage() {
    const { data: session } = useSession()
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchPendingUsers()
    }, [])

    const fetchPendingUsers = async () => {
        try {
            const res = await fetch("/api/users/pending")
            const data = await res.json()

            if (res.ok) {
                setPendingUsers(data)
            } else {
                setError(data.error || "Failed to fetch pending users")
            }
        } catch (err) {
            setError("Failed to fetch pending users")
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (userId: string) => {
        setProcessingId(userId)
        setError("")

        try {
            const res = await fetch("/api/users/pending", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "approve", role: "USER" })
            })

            const data = await res.json()

            if (res.ok) {
                // Remove from list
                setPendingUsers(prev => prev.filter(u => u.id !== userId))
            } else {
                setError(data.error || "Failed to approve user")
            }
        } catch (err) {
            setError("Failed to approve user")
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (userId: string) => {
        if (!confirm("Are you sure you want to reject this user's request?")) return

        setProcessingId(userId)
        setError("")

        try {
            const res = await fetch("/api/users/pending", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "reject" })
            })

            const data = await res.json()

            if (res.ok) {
                // Remove from list
                setPendingUsers(prev => prev.filter(u => u.id !== userId))
            } else {
                setError(data.error || "Failed to reject user")
            }
        } catch (err) {
            setError("Failed to reject user")
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-ecwa-blue)]">Pending User Requests</h1>
                <p className="text-gray-600 mt-2">
                    Review and approve users requesting to join your organization
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {pendingUsers.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                        <p className="text-gray-500">
                            There are no pending user requests at the moment.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingUsers.map((user) => (
                        <Card key={user.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {user.title && `${user.title}. `}{user.name}
                                            </h3>
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                Pending
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Email:</span>
                                                <p className="text-gray-900 font-medium">{user.email}</p>
                                            </div>
                                            {user.phone && (
                                                <div>
                                                    <span className="text-gray-500">Phone:</span>
                                                    <p className="text-gray-900 font-medium">{user.phone}</p>
                                                </div>
                                            )}
                                            {user.churchName && (
                                                <div>
                                                    <span className="text-gray-500">Church:</span>
                                                    <p className="text-gray-900 font-medium">{user.churchName}</p>
                                                </div>
                                            )}
                                            {user.lcc && (
                                                <div>
                                                    <span className="text-gray-500">LCC:</span>
                                                    <p className="text-gray-900 font-medium">{user.lcc}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-500">Requested:</span>
                                                <p className="text-gray-900 font-medium">
                                                    {format(new Date(user.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            onClick={() => handleApprove(user.id)}
                                            disabled={processingId === user.id}
                                            className="bg-green-600 hover:bg-green-700"
                                            size="sm"
                                        >
                                            {processingId === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(user.id)}
                                            disabled={processingId === user.id}
                                            variant="destructive"
                                            size="sm"
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
