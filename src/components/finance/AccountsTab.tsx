"use client"

import { useEffect, useState } from "react"
import { Plus, Building2, CreditCard, Loader2, ArrowUpRight, ArrowDownLeft, PieChart } from "lucide-react"

export default function AccountsTab() {
    const [accounts, setAccounts] = useState<any[]>([])
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        accountNumber: "",
        bankName: "",
        balance: "0"
    })

    useEffect(() => {
        fetchAccounts()
        fetchTransactions()
    }, [])

    const fetchTransactions = () => {
        fetch("/api/finance/transactions?limit=50")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTransactions(data)
                }
            })
    }

    const fetchAccounts = () => {
        fetch("/api/finance/accounts")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAccounts(data)
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
            const res = await fetch("/api/finance/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create account")
            }

            setShowForm(false)
            setFormData({ name: "", accountNumber: "", bankName: "", balance: "0" })
            fetchAccounts()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="text-gray-600">Loading accounts...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
                    <p className="text-sm text-gray-500">Manage your organization's financial accounts</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                    <Plus size={20} className="mr-2" />
                    {showForm ? "Cancel" : "New Account"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Create New Account</h3>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue text-gray-900 bg-white"
                                    placeholder="e.g. General Fund"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue text-gray-900 bg-white"
                                    placeholder="e.g. Gowans Microfinance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue text-gray-900 bg-white"
                                    placeholder="0000000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance (₦)</label>
                                <input
                                    type="number"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue text-gray-900 bg-white"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(account => (
                    <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <CreditCard className="text-ecwa-blue" size={24} />
                            </div>
                            <span className="text-xs text-gray-500">#{account._count.transactions} transactions</span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">{account.name}</h3>

                        {account.bankName && (
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                <Building2 size={14} className="mr-2" />
                                {account.bankName}
                            </div>
                        )}

                        {account.accountNumber && (
                            <p className="text-sm text-gray-500 mb-4">{account.accountNumber}</p>
                        )}

                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500">Current Balance</p>
                            <p className="text-2xl font-bold text-ecwa-blue">₦{account.balance.toLocaleString()}</p>
                        </div>
                    </div>
                ))}

                {accounts.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <CreditCard className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-500">No accounts found. Create your first account to get started.</p>
                    </div>
                )}
            </div>

            {/* Financial Summary & Transactions */}
            {transactions.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Summary Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <PieChart className="mr-2" size={20} />
                            Recent Activity Summary
                        </h3>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <ArrowDownLeft className="text-green-600" size={16} />
                                        </div>
                                        <span className="text-gray-600 font-medium">Income</span>
                                    </div>
                                    <span className="text-green-700 font-bold">
                                        ₦{transactions
                                            .filter(t => t.type === 'INCOME')
                                            .reduce((sum, t) => sum + t.amount, 0)
                                            .toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                            <ArrowUpRight className="text-red-600" size={16} />
                                        </div>
                                        <span className="text-gray-600 font-medium">Expenditure</span>
                                    </div>
                                    <span className="text-red-700 font-bold">
                                        ₦{transactions
                                            .filter(t => t.type === 'EXPENSE')
                                            .reduce((sum, t) => sum + t.amount, 0)
                                            .toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Categories Summary (Simplified) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">Top Categories</h4>
                            <div className="space-y-3">
                                {Object.entries(transactions.reduce((acc: any, t) => {
                                    const cat = t.category || 'Uncategorized';
                                    acc[cat] = (acc[cat] || 0) + 1;
                                    return acc;
                                }, {}))
                                    .sort(([, a]: any, [, b]: any) => b - a)
                                    .slice(0, 5)
                                    .map(([category, count]: any) => (
                                        <div key={category} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">{category}</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{count} txns</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Transactions List */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium">Description</th>
                                            <th className="px-6 py-3 font-medium">Category</th>
                                            <th className="px-6 py-3 font-medium text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(t.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {t.description}
                                                    <div className="text-xs text-gray-400 font-normal">{t.account?.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {t.category || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {t.type === 'INCOME' ? '+' : '-'}₦{t.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>

    )
}
