"use client"

import { useEffect, useState } from "react"
import { Plus, Download, Calendar } from "lucide-react"

const INCOME_CATEGORIES = [
    "Tithe",
    "Offering",
    "Donation",
    "Harvest",
    "Building Fund",
    "Special Giving",
    "Other"
]

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHECK", "ONLINE"]

export default function IncomeTab() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        accountId: "",
        amount: "",
        source: "",
        category: "Tithe",
        description: "",
        paymentMethod: "CASH",
        reference: "",
        date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const [incomeRes, accountsRes] = await Promise.all([
            fetch("/api/finance/income"),
            fetch("/api/finance/accounts")
        ])

        const [incomeData, accountsData] = await Promise.all([
            incomeRes.json(),
            accountsRes.json()
        ])

        setTransactions(incomeData)
        setAccounts(accountsData)
        if (accountsData.length > 0 && !formData.accountId) {
            setFormData(prev => ({ ...prev, accountId: accountsData[0].id }))
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch("/api/finance/income", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            setShowForm(false)
            setFormData({
                accountId: formData.accountId,
                amount: "",
                source: "",
                category: "Tithe",
                description: "",
                paymentMethod: "CASH",
                reference: "",
                date: new Date().toISOString().split('T')[0]
            })
            fetchData()
        }
    }

    const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0)

    if (loading) return <div>Loading income data...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Income Tracking</h2>
                    <p className="text-sm text-gray-500">Record and monitor all incoming funds</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center hover:bg-gray-50">
                        <Download size={20} className="mr-2" />
                        Export
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-ecwa-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900"
                    >
                        <Plus size={20} className="mr-2" />
                        {showForm ? "Cancel" : "Record Income"}
                    </button>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-90">Total Income</p>
                <p className="text-3xl font-bold mt-2">₦{totalIncome.toLocaleString()}</p>
                <p className="text-sm opacity-75 mt-1">{transactions.length} transactions</p>
            </div>

            {showForm && accounts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold mb-4">Record Income Transaction</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                                <select
                                    required
                                    value={formData.accountId}
                                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source (Giver Name)</label>
                                <input
                                    type="text"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                    placeholder="Optional"
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
                                    {INCOME_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                >
                                    {PAYMENT_METHODS.map(pm => (
                                        <option key={pm} value={pm}>{pm.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description/Narration</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-ecwa-blue text-white px-6 py-2 rounded-lg hover:bg-blue-900"
                        >
                            Record Income
                        </button>
                    </form>
                </div>
            )}

            {accounts.length === 0 && (
                <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-yellow-800">Please create an account first in the Accounts tab before recording income.</p>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Date</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Source</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Category</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Account</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Amount</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(transaction => (
                                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-sm text-gray-900">
                                        {new Date(transaction.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-900">{transaction.source || "Anonymous"}</td>
                                    <td className="p-4 text-sm text-gray-600">{transaction.category}</td>
                                    <td className="p-4 text-sm text-gray-600">{transaction.account.name}</td>
                                    <td className="p-4 text-sm font-semibold text-green-600">
                                        ₦{transaction.amount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {transaction.paymentMethod.replace('_', ' ')}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No income recorded yet. Start tracking your income today.
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
