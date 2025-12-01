"use client"

import { useEffect, useState } from "react"
import { Plus, Building2, CreditCard } from "lucide-react"

export default function AccountsTab() {
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        accountNumber: "",
        bankName: "",
        balance: "0"
    })

    useEffect(() => {
        fetchAccounts()
    }, [])

    const fetchAccounts = () => {
        fetch("/api/finance/accounts")
            .then(res => res.json())
            .then(data => {
                setAccounts(data)
                setLoading(false)
            })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch("/api/finance/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            setShowForm(false)
            setFormData({ name: "", accountNumber: "", bankName: "", balance: "0" })
            fetchAccounts()
        }
    }

    if (loading) return <div>Loading accounts...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
                    <p className="text-sm text-gray-500">Manage your organization's financial accounts</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-ecwa-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900"
                >
                    <Plus size={20} className="mr-2" />
                    {showForm ? "Cancel" : "New Account"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold mb-4">Create New Account</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                    placeholder="e.g. General Fund"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                    placeholder="e.g. Gowans Microfinance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                    placeholder="0000000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance (₦)</label>
                                <input
                                    type="number"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-ecwa-blue text-white px-6 py-2 rounded-lg hover:bg-blue-900"
                        >
                            Create Account
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
        </div>
    )
}
