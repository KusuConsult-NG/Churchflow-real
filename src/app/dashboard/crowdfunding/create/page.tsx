"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateCampaign() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        goalAmount: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/crowdfunding/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error("Failed to create campaign")

            router.push("/dashboard/crowdfunding")
            router.refresh()
        } catch (error) {
            alert("Error creating campaign")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/dashboard/crowdfunding" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="mr-2" size={20} />
                Back to Campaigns
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Campaign Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                            placeholder="e.g. Church Building Fund"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                            placeholder="Describe the purpose of this fundraiser..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Goal Amount (₦)</label>
                        <input
                            type="number"
                            required
                            min="1000"
                            value={formData.goalAmount}
                            onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-ecwa-blue text-white py-2 px-4 rounded-md hover:bg-blue-900 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Launch Campaign"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
