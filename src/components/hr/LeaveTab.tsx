"use client"

import { useEffect, useState } from "react"
import { Plus, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

const LEAVE_TYPES = ["Annual", "Sick", "Casual", "Maternity", "Paternity", "Study"]

const STATUS_CONFIG = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending", icon: Clock },
    APPROVED: { color: "bg-green-100 text-green-800", label: "Approved", icon: CheckCircle },
    REJECTED: { color: "bg-red-100 text-red-800", label: "Rejected", icon: XCircle }
}

export default function LeaveTab() {
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = () => {
        fetch("/api/hr/leave")
            .then(res => res.json())
            .then(data => {
                setRequests(data)
                setLoading(false)
            })
    }

    const handleAction = async (id: string, action: string, rejectionReason?: string) => {
        const res = await fetch("/api/hr/leave", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action, rejectionReason })
        })

        if (res.ok) {
            fetchRequests()
        }
    }

    const totalPending = requests.filter(r => r.status === 'PENDING').length
    const totalApproved = requests.filter(r => r.status === 'APPROVED').length

    if (loading) return <div>Loading leave requests...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Leave Management</h2>
                    <p className="text-sm text-gray-500">Track and approve employee leave requests</p>
                </div>
                <button className="bg-ecwa-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900">
                    <Plus size={20} className="mr-2" />
                    New Request
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Pending Requests</p>
                    <p className="text-3xl font-bold mt-2">{totalPending}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Approved This Month</p>
                    <p className="text-3xl font-bold mt-2">{totalApproved}</p>
                </div>
            </div>

            {/* Leave Requests */}
            <div className="space-y-4">
                {requests.map(request => {
                    const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
                    const Icon = statusConfig.icon
                    const days = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24))

                    return (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{request.staff.user.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                            <Icon size={14} />
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Type:</span> {request.type}
                                        </div>
                                        <div>
                                            <span className="font-medium">Duration:</span> {days} day{days > 1 ? 's' : ''}
                                        </div>
                                        <div>
                                            <span className="font-medium">From:</span> {new Date(request.startDate).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">To:</span> {new Date(request.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {request.reason}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {request.status === 'PENDING' && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => handleAction(request.id, 'approve')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt("Rejection reason:")
                                            if (reason) handleAction(request.id, 'reject', reason)
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                            {request.status === 'REJECTED' && request.rejectionReason && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-red-600">
                                        <span className="font-medium">Rejection Reason:</span> {request.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}

                {requests.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-500">No leave requests yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
