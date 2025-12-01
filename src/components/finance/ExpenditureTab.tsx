"use client"

import { useEffect, useState } from "react"
import { Plus, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react"
import { useSession } from "next-auth/react"

const EXPENDITURE_CATEGORIES = [
    "Salary",
    "Maintenance",
    "Utilities",
    "Building",
    "Equipment",
    "Transportation",
    "Events",
    "Other"
]

const STATUS_CONFIG = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending Review", icon: Clock },
    REVIEWED: { color: "bg-blue-100 text-blue-800", label: "Reviewed", icon: CheckCircle },
    APPROVED: { color: "bg-green-100 text-green-800", label: "Approved", icon: CheckCircle },
    REJECTED: { color: "bg-red-100 text-red-800", label: "Rejected", icon: XCircle },
    PAID: { color: "bg-gray-100 text-gray-800", label: "Paid", icon: DollarSign }
}

export default function ExpenditureTab() {
    const { data: session } = useSession()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        category: "Salary",
        beneficiary: "",
        bankName: "",
        accountNumber: ""
    })

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = () => {
        fetch("/api/finance/expenditure")
            .then(res => res.json())
            .then(data => {
                setRequests(data)
                setLoading(false)
            })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch("/api/finance/expenditure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            setShowForm(false)
            setFormData({
                amount: "",
                description: "",
                category: "Salary",
                beneficiary: "",
                bankName: "",
                accountNumber: ""
            })
            fetchRequests()
        }
    }

    const handleAction = async (id: string, action: string, rejectionReason?: string) => {
        const res = await fetch("/api/finance/expenditure", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action, rejectionReason })
        })

        if (res.ok) {
            fetchRequests()
        }
    }

    const totalPending = requests.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0)
    const totalApproved = requests.filter(r => r.status === 'APPROVED' || r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0)

    if (loading) return <div>Loading expenditure requests...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Expenditure Requests</h2>
                    <p className="text-sm text-gray-500">Multi-level approval workflow</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-ecwa-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900"
                >
                    <Plus size={20} className="mr-2" />
                    {showForm ? "Cancel" : "New Request"}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Pending Approval</p>
                    <p className="text-3xl font-bold mt-2">₦{totalPending.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Total Approved</p>
                    <p className="text-3xl font-bold mt-2">₦{totalApproved.toLocaleString()}</p>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold mb-4">Create Expenditure Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                >
                                    {EXPENDITURE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.beneficiary}
                                    onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-ecwa-blue text-white px-6 py-2 rounded-lg hover:bg-blue-900"
                        >
                            Submit Request
                        </button>
                    </form>
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-4">
                {requests.map(request => {
                    const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
                    const Icon = statusConfig.icon

                    return (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{request.category}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                            <Icon size={14} />
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2">{request.description}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                        <div>
                                            <span className="font-medium">Beneficiary:</span> {request.beneficiary}
                                        </div>
                                        <div>
                                            <span className="font-medium">Requested by:</span> {request.requester.name}
                                        </div>
                                        {request.bankName && (
                                            <div>
                                                <span className="font-medium">Bank:</span> {request.bankName}
                                            </div>
                                        )}
                                        {request.accountNumber && (
                                            <div>
                                                <span className="font-medium">Account:</span> {request.accountNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-ecwa-blue">₦{request.amount.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t">
                                {request.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleAction(request.id, 'review')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Review
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
                                    </>
                                )}
                                {request.status === 'REVIEWED' && (
                                    <>
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
                                    </>
                                )}
                                {request.status === 'APPROVED' && (
                                    <button
                                        onClick={() => handleAction(request.id, 'pay')}
                                        className="px-4 py-2 bg-ecwa-blue text-white rounded-lg hover:bg-blue-900 text-sm"
                                    >
                                        Mark as Paid
                                    </button>
                                )}
                                {request.status === 'REJECTED' && request.rejectionReason && (
                                    <div className="text-sm text-red-600">
                                        <span className="font-medium">Reason:</span> {request.rejectionReason}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {requests.length === 0 && !showForm && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No expenditure requests yet. Create your first request to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
