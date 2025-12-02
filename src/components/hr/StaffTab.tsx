"use client"

import { useEffect, useState } from "react"
import { Plus, User, Briefcase, Calendar, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CONTRACT_TYPES = ["Permanent", "Temporary", "Contract", "Volunteer"]

export default function StaffTab() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        position: "",
        staffId: "",
        contractType: "",
        baseSalary: "",
        hireDate: new Date().toISOString().split('T')[0],
        bankName: "",
        accountNumber: ""
    })

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = () => {
        fetch("/api/hr/staff")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStaff(data)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)

        try {
            const res = await fetch("/api/hr/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to add staff")
            }

            setShowForm(false)
            setFormData({
                name: "",
                email: "",
                position: "",
                staffId: "",
                contractType: "",
                baseSalary: "",
                hireDate: new Date().toISOString().split('T')[0],
                bankName: "",
                accountNumber: ""
            })
            fetchStaff()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="text-gray-600">Loading staff...</div>

    const totalStaff = staff.length
    const permanentStaff = staff.filter(s => s.contractType === 'Permanent').length

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
                    <p className="text-sm text-gray-500">Manage employee profiles and records</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                    <Plus size={20} className="mr-2" />
                    Add Staff
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Total Staff</p>
                    <p className="text-3xl font-bold mt-2">{totalStaff}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Permanent Staff</p>
                    <p className="text-3xl font-bold mt-2">{permanentStaff}</p>
                </div>
            </div>

            {/* Add Staff Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Staff Member</h3>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-700">Full Name *</Label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Email *</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Staff ID *</Label>
                                    <Input
                                        required
                                        value={formData.staffId}
                                        onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                        placeholder="EMP001"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Position *</Label>
                                    <Input
                                        required
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                        placeholder="e.g. Accountant"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Contract Type *</Label>
                                    <Select
                                        value={formData.contractType}
                                        onValueChange={(val) => setFormData({ ...formData, contractType: val })}
                                        required
                                    >
                                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-300">
                                            {CONTRACT_TYPES.map(type => (
                                                <SelectItem key={type} value={type} className="text-gray-900 cursor-pointer hover:bg-gray-100">
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-gray-700">Base Salary (₦) *</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.baseSalary}
                                        onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                        placeholder="50000"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Hire Date *</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.hireDate}
                                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Bank Name</Label>
                                    <Input
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                        placeholder="e.g. First Bank"
                                    />
                                </div>
                                <div>
                                    <Label className="text-gray-700">Account Number</Label>
                                    <Input
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                        className="bg-white border-gray-300 text-gray-900"
                                        placeholder="0123456789"
                                    />
                                </div>
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
                                            Adding Staff...
                                        </>
                                    ) : (
                                        "Add Staff Member"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Staff ID</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Name</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Position</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Contract Type</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Hire Date</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-sm font-medium text-gray-900">{member.staffId}</td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <User size={16} className="text-ecwa-blue" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.user?.name || "N/A"}</p>
                                                <p className="text-xs text-gray-500">{member.user?.email || ""}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {member.user?.position || "Unassigned"}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.contractType === 'Permanent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.contractType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(member.hireDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm font-semibold text-gray-900">
                                        ₦{member.baseSalary.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No staff records found. Add your first employee to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
