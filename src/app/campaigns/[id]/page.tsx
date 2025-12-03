"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Building2, Calendar, Target, User, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CampaignPage() {
    const params = useParams()
    const [campaign, setCampaign] = useState<any>(null)
    const [donations, setDonations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [donationAmount, setDonationAmount] = useState("")
    const [donorName, setDonorName] = useState("")
    const [donorEmail, setDonorEmail] = useState("")
    const [isDonating, setIsDonating] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Fetch Campaign Details
        fetch(`/api/crowdfunding/campaigns?id=${params.id}`)
            .then(res => res.json())
            .then(data => {
                // Since the API returns an array, find the specific one or adjust API to fetch single
                // For now, let's assume we filter client side or update API later. 
                // Actually, let's just fetch all and find. Optimally we should have a single fetch endpoint.
                const found = data.find((c: any) => c.id === params.id)
                setCampaign(found)
                setLoading(false)
            })

        // Fetch Donations
        fetch(`/api/crowdfunding/donations?campaignId=${params.id}`)
            .then(res => res.json())
            .then(data => setDonations(data))
    }, [params.id])

    const handleDonate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsDonating(true)

        try {
            const res = await fetch("/api/crowdfunding/donations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId: params.id,
                    amount: donationAmount,
                    donorName,
                    donorEmail,
                    paymentMethod: "ONLINE" // Simulated
                })
            })

            if (!res.ok) throw new Error("Donation failed")

            setSuccess(true)
            // Refresh data
            const updatedCampaign = { ...campaign, currentAmount: campaign.currentAmount + parseFloat(donationAmount) }
            setCampaign(updatedCampaign)

            const newDonation = {
                id: Date.now().toString(),
                amount: parseFloat(donationAmount),
                donorName: donorName || "Anonymous",
                createdAt: new Date().toISOString()
            }
            setDonations([newDonation, ...donations])

        } catch (error) {
            alert("Failed to process donation")
        } finally {
            setIsDonating(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading campaign...</div>
    if (!campaign) return <div className="p-8 text-center">Campaign not found</div>

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-ecwa-blue text-white py-4 px-6 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold">ChurchFlow</Link>
                    <Link href="/auth/signin" className="text-blue-200 hover:text-white">Login</Link>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <div className="flex items-center text-ecwa-blue mb-4">
                            <Building2 size={20} className="mr-2" />
                            <span className="font-medium">{campaign.organization.name}</span>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{campaign.title}</h1>

                        <div className="flex items-center text-gray-500 mb-8 space-x-6">
                            <div className="flex items-center">
                                <User size={18} className="mr-2" />
                                <span>Organized by {campaign.creator.name}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar size={18} className="mr-2" />
                                <span>Created on {new Date(campaign.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="prose max-w-none text-gray-700">
                            <p className="whitespace-pre-wrap">{campaign.description}</p>
                        </div>
                    </div>

                    {/* Recent Donations */}
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Donations</h2>
                        <div className="space-y-4">
                            {donations.map((donation: any) => (
                                <div key={donation.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-ecwa-blue font-bold mr-4">
                                            {donation.donorName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{donation.donorName}</p>
                                            <p className="text-sm text-gray-500">{new Date(donation.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900">₦{donation.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            {donations.length === 0 && <p className="text-gray-500">Be the first to donate!</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar Donation Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border-t-4 border-ecwa-blue">
                        <div className="mb-6">
                            <div className="flex flex-col mb-2 gap-1">
                                <span className="text-3xl font-bold text-gray-900 break-words">
                                    ₦{campaign.currentAmount.toLocaleString()}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    raised of <span className="font-medium">₦{campaign.goalAmount.toLocaleString()}</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-ecwa-blue h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                                <p className="text-gray-600">Your donation has been received.</p>
                                <button
                                    onClick={() => { setSuccess(false); setDonationAmount(""); }}
                                    className="mt-6 text-ecwa-blue font-medium hover:underline"
                                >
                                    Make another donation
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleDonate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                                    <input
                                        type="number"
                                        required
                                        min="100"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                        placeholder="Enter amount"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={donorName}
                                        onChange={(e) => setDonorName(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                        placeholder="Your Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={donorEmail}
                                        onChange={(e) => setDonorEmail(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ecwa-blue focus:border-ecwa-blue"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isDonating}
                                    className="w-full bg-ecwa-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors disabled:opacity-50"
                                >
                                    {isDonating ? "Processing..." : "Donate Now"}
                                </button>

                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Secured by ChurchFlow Payments
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </main >
        </div >
    )
}
