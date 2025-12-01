"use client"

import { useEffect, useState } from "react"
import { Plus, AlertCircle, MessageSquare, CheckCircle } from "lucide-react"

const STATUS_CONFIG = {
    ISSUED: { color: "bg-red-100 text-red-800", label: "Issued", icon: AlertCircle },
    RESPONDED: { color: "bg-blue-100 text-blue-800", label: "Responded", icon: MessageSquare },
    RESOLVED: { color: "bg-green-100 text-green-800", label: "Resolved", icon: CheckCircle }
}

export default function QueriesTab() {
    const [queries, setQueries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        staffId: "",
        title: "",
        description: ""
    })

    useEffect(() => {
        fetchQueries()
    }, [])

    const fetchQueries = () => {
        fetch("/api/hr/queries")
            .then(res => res.json())
            .then(data => {
                setQueries(data)
                setLoading(false)
            })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch("/api/hr/queries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            setShowForm(false)
            setFormData({ staffId: "", title: "", description: "" })
            fetchQueries()
        }
    }

    const handleAction = async (id: string, action: string, data?: any) => {
        const res = await fetch("/api/hr/queries", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, action, ...data })
        })

        if (res.ok) {
            fetchQueries()
        }
    }

    const totalIssued = queries.filter(q => q.status === 'ISSUED').length
    const totalResolved = queries.filter(q => q.status === 'RESOLVED').length

    if (loading) return <div>Loading queries...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Query Management</h2>
                    <p className="text-sm text-gray-500">Track disciplinary queries and responses</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-ecwa-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900"
                >
                    <Plus size={20} className="mr-2" />
                    {showForm ? "Cancel" : "Issue Query"}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Active Queries</p>
                    <p className="text-3xl font-bold mt-2">{totalIssued}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Resolved</p>
                    <p className="text-3xl font-bold mt-2">{totalResolved}</p>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold mb-4">Issue Disciplinary Query</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member ID</label>
                            <input
                                type="text"
                                required
                                value={formData.staffId}
                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                placeholder="Enter staff ID"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Query Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                placeholder="e.g., Late Arrival"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                placeholder="Describe the issue..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-ecwa-blue text-white px-6 py-2 rounded-lg hover:bg-blue-900"
                        >
                            Issue Query
                        </button>
                    </form>
                </div>
            )}

            {/* Queries List */}
            <div className="space-y-4">
                {queries.map(query => {
                    const statusConfig = STATUS_CONFIG[query.status as keyof typeof STATUS_CONFIG]
                    const Icon = statusConfig.icon

                    return (
                        <div key={query.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{query.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                            <Icon size={14} />
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">
                                        <span className="font-medium">Staff:</span> {query.staff.user.name}
                                        <span className="mx-2">•</span>
                                        <span className="font-medium">Issued:</span> {new Date(query.issuedAt).toLocaleDateString()}
                                    </div>
                                    <p className="text-gray-700 mb-3">{query.description}</p>

                                    {query.response && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm font-medium text-blue-900 mb-1">Staff Response:</p>
                                            <p className="text-sm text-gray-700">{query.response}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Responded on {new Date(query.respondedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {query.resolution && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                            <p className="text-sm font-medium text-green-900 mb-1">Resolution:</p>
                                            <p className="text-sm text-gray-700">{query.resolution}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t">
                                {query.status === 'ISSUED' && (
                                    <button
                                        onClick={() => {
                                            const response = prompt("Staff response:")
                                            if (response) handleAction(query.id, 'respond', { response })
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                    >
                                        Add Response
                                    </button>
                                )}
                                {query.status === 'RESPONDED' && (
                                    <button
                                        onClick={() => {
                                            const resolution = prompt("Resolution/Action taken:")
                                            if (resolution) handleAction(query.id, 'resolve', { resolution })
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        Resolve Query
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}

                {queries.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-500">No queries issued yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
