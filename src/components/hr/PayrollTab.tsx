"use client"

import { useEffect, useState } from "react"
import { Plus, DollarSign, CheckCircle, Clock, Download, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const STATUS_CONFIG = {
    PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending", icon: Clock },
    REVIEWED: { color: "bg-blue-100 text-blue-800", label: "Reviewed", icon: CheckCircle },
    APPROVED: { color: "bg-green-100 text-green-800", label: "Approved", icon: CheckCircle },
    PAID: { color: "bg-gray-100 text-gray-800", label: "Paid", icon: DollarSign }
}

export default function PayrollTab() {
    const [payrolls, setPayrolls] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

    useEffect(() => {
        fetchPayrolls()
    }, [])

    const fetchPayrolls = () => {
        fetch("/api/hr/payroll")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPayrolls(data)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const res = await fetch("/api/hr/payroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month: selectedMonth + "-01" })
            })

            if (res.ok) {
                setShowForm(false)
                fetchPayrolls()
            }
        } catch (error) {
            console.error("Failed to generate payroll", error)
        } finally {
            setGenerating(false)
        }
    }

    const handleAction = async (id: string, action: string) => {
        try {
            const res = await fetch("/api/hr/payroll", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action })
            })

            if (res.ok) {
                fetchPayrolls()
            }
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const totalPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0)
    const pendingCount = payrolls.filter(p => p.status === 'PENDING').length

    if (loading) return <div className="text-gray-600">Loading payroll...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Payroll Management</h2>
                    <p className="text-sm text-gray-500">Generate and manage employee payroll</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                    <Plus size={20} className="mr-2" />
                    {showForm ? "Cancel" : "Generate Payroll"}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Total Payroll</p>
                    <p className="text-3xl font-bold mt-2">₦{totalPayroll.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Pending Payments</p>
                    <p className="text-3xl font-bold mt-2">{pendingCount}</p>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Generate Payroll for Month</h3>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue bg-white text-gray-900"
                            />
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="bg-ecwa-blue text-white px-6 py-2.5 rounded-lg hover:bg-blue-900 h-[42px]"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate"
                            )}
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        This will generate payroll for all active staff for the selected month based on their base salary.
                    </p>
                </div>
            )}

            {/* Payroll List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Employee</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Month</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Basic Salary</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Allowances</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Deductions</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Net Salary</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrolls.map(payroll => {
                                const statusConfig = STATUS_CONFIG[payroll.status as keyof typeof STATUS_CONFIG]
                                const Icon = statusConfig.icon

                                return (
                                    <tr key={payroll.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-sm font-medium text-gray-900">
                                            {payroll.staff?.user?.name || "Unknown"}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(payroll.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                        </td>
                                        <td className="p-4 text-sm text-gray-900">
                                            ₦{payroll.basicSalary.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm text-green-600">
                                            +₦{payroll.allowances.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm text-red-600">
                                            -₦{payroll.deductions.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-ecwa-blue">
                                            ₦{payroll.netSalary.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusConfig.color}`}>
                                                <Icon size={14} />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {payroll.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleAction(payroll.id, 'approve')}
                                                        className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {payroll.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleAction(payroll.id, 'pay')}
                                                        className="text-xs px-3 py-1 bg-ecwa-blue text-white rounded hover:bg-blue-900 transition-colors"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {payroll.status === 'PAID' && (
                                                    <button className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                                                        <Download size={14} className="inline mr-1" />
                                                        Payslip
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {payrolls.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500">
                                        No payroll records yet. Generate payroll for the current month to get started.
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
