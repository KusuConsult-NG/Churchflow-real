"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, ExternalLink, Calendar, Target } from "lucide-react"
import { useSession } from "next-auth/react"

export default function CampaignList() {
    const { data: session } = useSession()
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!session?.user) {
            setLoading(false)
            return
        }

        if (!session.user.organizationId) {
            setError("You need to create or join an organization first")
            setLoading(false)
            return
        }

        fetch(`/api/crowdfunding/campaigns?orgId=${session.user.organizationId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCampaigns(data)
                } else {
                    setError("Failed to load campaigns")
                }
                setLoading(false)
            })
            .catch(err => {
                setError("Failed to load campaigns")
                setLoading(false)
            })
    }, [session])

    if (loading) return <div className="text-gray-600">Loading campaigns...</div>

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800 mb-4">{error}</p>
                    <Link
                        href="/create-organization"
                        className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg inline-flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                    >
                        Create Organization
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Crowdfunding Campaigns</h1>
                <Link
                    href="/dashboard/crowdfunding/create"
                    className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                    <Plus size={20} className="mr-2" />
                    New Campaign
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(campaign => (
                    <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {campaign.status}
                                </span>
                                <Link href={`/campaigns/${campaign.id}`} target="_blank" className="text-ecwa-blue hover:text-blue-800">
                                    <ExternalLink size={18} />
                                </Link>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{campaign.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Target size={16} className="mr-2" />
                                    <span>Goal: ₦{campaign.goalAmount.toLocaleString()}</span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-ecwa-blue h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                                    ></div>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-ecwa-blue">₦{campaign.currentAmount.toLocaleString()}</span>
                                    <span className="text-gray-500">{Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {campaigns.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Target className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-500 mb-4">No campaigns found. Start fundraising today!</p>
                        <Link
                            href="/dashboard/crowdfunding/create"
                            className="bg-gradient-to-r from-[var(--color-ecwa-blue)] to-blue-700 text-white px-5 py-2.5 rounded-lg inline-flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                        >
                            <Plus size={20} className="mr-2" />
                            Create Your First Campaign
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
