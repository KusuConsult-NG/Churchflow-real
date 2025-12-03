"use client"

import { useEffect, useState } from "react"
import { Plus, AlertCircle, MessageSquare, CheckCircle, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const STATUS_CONFIG = {
    ISSUED: { color: "bg-red-100 text-red-800", label: "Issued", icon: AlertCircle },
    RESPONDED: { color: "bg-blue-100 text-blue-800", label: "Responded", icon: MessageSquare },
    RESOLVED: { color: "bg-green-100 text-green-800", label: "Resolved", icon: CheckCircle }
}

export default function QueriesTab() {
    const [queries, setQueries] = useState<any[]>([])
    const [staffList, setStaffList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        staffId: "",
        title: "",
        description: ""
    })

    const [organizations, setOrganizations] = useState<any[]>([])
    const [selectedOrg, setSelectedOrg] = useState<string>("")

    useEffect(() => {
        fetchQueries()
        fetchOrganizations()
    }, [])

    useEffect(() => {
        if (selectedOrg) {
            fetchStaff(selectedOrg)
        } else {
            fetchStaff()
        }
    }, [selectedOrg])

    const fetchOrganizations = () => {
        fetch("/api/organizations/list")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrganizations(data)
                }
            })
    }

    const fetchQueries = () => {
        fetch("/api/hr/queries")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setQueries(data)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    const fetchStaff = (orgId?: string) => {
        const url = orgId ? `/api/hr/staff?orgId=${orgId}` : "/api/hr/staff"
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStaffList(data)
                } else {
                    setStaffList([])
                }
            })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)

        try {
            const res = await fetch("/api/hr/queries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to issue query")
            }

            setShowForm(false)
            setFormData({ staffId: "", title: "", description: "" })
            fetchQueries()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleAction = async (id: string, action: string, data?: any) => {
        try {
            const res = await fetch("/api/hr/queries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action, ...data })
            })

            if (res.ok) {
                fetchQueries()
            }
        } catch (error) {
            console.error("Failed to update query", error)
        }
    }

    const totalIssued = queries.filter(q => q.status === 'ISSUED').length
    const totalResolved = queries.filter(q => q.status === 'RESOLVED').length

    if (loading) return <div className="text-gray-600">Loading queries...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Query Management</h2>
                    <p className="text-sm text-gray-500">Track disciplinary queries and responses</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                    <Plus size={20} className="mr-2" />
                    Issue Query
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

            {/* New Query Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-900">Issue Disciplinary Query</h3>
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
                                <Label className="text-gray-700">Organization (Optional)</Label>
                                <Select
                                    value={selectedOrg}
                                    onValueChange={setSelectedOrg}
                                >
                                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                        <SelectValue placeholder="Filter by organization" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-300">
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={org.id} className="text-gray-900 cursor-pointer hover:bg-gray-100">
                                                {org.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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
                                <Label className="text-gray-700">Query Title *</Label>
                                <Input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-white border-gray-300 text-gray-900"
                                    placeholder="e.g., Late Arrival"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-700">Description *</Label>
                                <Textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-white border-gray-300 text-gray-900"
                                    placeholder="Describe the issue..."
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
                                            Issuing...
                                        </>
                                    ) : (
                                        "Issue Query"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
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
                                        <span className="font-medium">Staff:</span> {query.staff?.user?.name || "Unknown"}
                                        <span className="mx-2">•</span>
                                        <span className="font-medium">Issued:</span> {new Date(query.issuedAt).toLocaleDateString()}
                                    </div>
                                    <p className="text-gray-700 mb-3">{query.description}</p>

                                    {query.response && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <p className="text-sm font-medium text-blue-900 mb-1">Staff Response:</p>
                                            <p className="text-sm text-gray-700">{query.response}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Responded on {new Date(query.respondedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {query.resolution && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
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
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
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
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
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
