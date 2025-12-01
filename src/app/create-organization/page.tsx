"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, User, ArrowLeft } from "lucide-react"
import Link from "next/link"

const ORG_TYPES = ["HQ", "GCC", "DCC", "LCC", "LC"]
const TITLES = ["REV", "PST", "DR", "PROF", "MR", "MRS", "MISS"]

export default function CreateOrganization() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [parents, setParents] = useState<any[]>([])

    const [formData, setFormData] = useState({
        orgName: "",
        orgType: "LC",
        orgCode: "",
        orgAddress: "",
        orgEmail: "",
        parentId: "",
        adminName: "",
        adminEmail: ""
    })

    // Fetch potential parents when type changes
    useEffect(() => {
        const fetchParents = async () => {
            let parentType = ""
            if (formData.orgType === "LC") parentType = "LCC"
            if (formData.orgType === "LCC") parentType = "DCC"
            if (formData.orgType === "DCC") parentType = "GCC"
            if (formData.orgType === "GCC") parentType = "HQ"

            if (parentType) {
                const res = await fetch(`/api/organizations?type=${parentType}`)
                if (res.ok) {
                    const data = await res.json()
                    setParents(data)
                }
            } else {
                setParents([])
            }
        }

        fetchParents()
    }, [formData.orgType])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const error = await res.json()
                alert(error.error)
                return
            }

            const data = await res.json()
            alert(data.message || `Organization created! An invite has been sent to ${formData.adminEmail}.`)
            router.push("/")
        } catch (error) {
            alert("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-8">
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Home
                </Link>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    <div className="bg-ecwa-blue px-8 py-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <Building2 className="mr-3" />
                            Create Organization
                        </h2>
                        <p className="text-blue-100 mt-2">Step {step} of 2: {step === 1 ? "Organization Details" : "Administrator Profile"}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Organization Type</label>
                                        <select
                                            value={formData.orgType}
                                            onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                        >
                                            {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    {parents.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Parent Organization</label>
                                            <select
                                                required
                                                value={formData.parentId}
                                                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                            >
                                                <option value="">Select Parent...</option>
                                                {parents.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.orgName}
                                            onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                            placeholder="e.g. ECWA GoodNews HighCost"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Code (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.orgCode}
                                            onChange={(e) => setFormData({ ...formData, orgCode: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            value={formData.orgEmail}
                                            onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <textarea
                                            value={formData.orgAddress}
                                            onChange={(e) => setFormData({ ...formData, orgAddress: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="bg-ecwa-blue text-white px-6 py-2 rounded-md hover:bg-blue-900 transition-colors"
                                    >
                                        Next: Admin Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.adminName}
                                            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.adminEmail}
                                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ecwa-blue focus:ring-ecwa-blue p-2 border"
                                        />
                                    </div>

                                    <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            📧 <strong>Invite Email:</strong> An invite link will be sent to <strong>{formData.adminEmail || "the admin email"}</strong> to complete their registration.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-gray-600 hover:text-gray-900 px-6 py-2"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-ecwa-blue text-white px-6 py-2 rounded-md hover:bg-blue-900 transition-colors flex items-center disabled:opacity-50"
                                    >
                                        {loading ? "Creating..." : "Create Organization"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
