"use client"

import { useEffect, useState } from "react"
import { Plus, Calendar, CheckCircle, XCircle, Clock, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const LEAVE_TYPES = ["Annual", "Sick", "Casual", "Maternity", "Paternity", "Study"]

const STATUS_CONFIG = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending", icon: Clock },
    APPROVED: { color: "bg-green-100 text-green-800", label: "Approved", icon: CheckCircle },
    REJECTED: { color: "bg-red-100 text-red-800", label: "Rejected", icon: XCircle }
}

export default function LeaveTab() {
    const [requests, setRequests] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        staffId: "",
        type: "",
        startDate: "",
        endDate: "",
        reason: ""
    })

    useEffect(() => {
        fetchRequests()
        fetchStaff()
    }, [])

    const fetchRequests = () => {
        fetch("/api/hr/leave")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setRequests(data)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    const fetchStaff = () => {
        fetch("/api/hr/staff")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStaffList(data)
                }
            })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)

        try {
            const res = await fetch("/api/hr/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit request")
            }

            setShowForm(false)
            setFormData({
                staffId: "",
                type: "",
                startDate: "",
                endDate: "",
                reason: ""
            })
            fetchRequests()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleAction = async (id: string, action: string, rejectionReason?: string) => {
        try {
            const res = await fetch("/api/hr/leave", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action, rejectionReason })
            })

            if (res.ok) {
                fetchRequests()
            }
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const totalPending = requests.filter(r => r.status === 'PENDING').length
    const totalApproved = requests.filter(r => r.status === 'APPROVED').length

    if (loading) return <div className="text-gray-600">Loading leave requests...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Leave Management</h2>
                    <p className="text-sm text-gray-500">Track and approve employee leave requests</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
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

            {/* New Request Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-900">New Leave Request</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Label className="text-gray-700">Staff Member *</Label>
                                <Select
                                    value={formData.staffId}
                                    onValueChange={(val) => setFormData({ ...formData, staffId: val })}
                                    required
                                >
                                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                        <SelectValue placeholder="Select staff member" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        {staffList.map(staff => (
                                            <SelectItem key={staff.id} value={staff.id} className="text-gray-900 cursor-pointer hover:bg-gray-100">
                                                {staff.user?.name || "Unknown"} ({staff.staffId})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-gray-700">Leave Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    required
                                >
                                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        {LEAVE_TYPES.map(type => (
                                            <SelectItem key={type} value={type} className="text-gray-900 cursor-pointer hover:bg-gray-100">
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-700">Start Date *</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">End Date *</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-gray-700">Reason *</Label>
                                <Textarea
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="bg-white border-gray-300 text-gray-900"
                                    placeholder="Brief description of leave reason..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white shadow-md hover:shadow-lg"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                        <h3 className="text-lg font-bold text-gray-900">{request.staff?.user?.name || "Unknown Staff"}</h3>
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
