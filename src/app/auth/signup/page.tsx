"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, EyeOff } from "lucide-react"

const TITLES = [
    { value: "MR", label: "Mr." },
    { value: "MRS", label: "Mrs." },
    { value: "MISS", label: "Miss" },
    { value: "REV", label: "Rev." },
    { value: "REV_DR", label: "Rev. Dr." },
    { value: "PASTOR", label: "Pastor" },
    { value: "DR", label: "Dr." },
    { value: "PROF", label: "Prof." },
    { value: "ENGR", label: "Engr." },
    { value: "BARR", label: "Barr." },
]

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        churchName: "",
        lcc: "",
        password: "",
        confirmPassword: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    churchName: formData.churchName,
                    lcc: formData.lcc,
                    password: formData.password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Signup failed")
            }

            router.push("/welcome")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full my-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join ChurchFlow today</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <Label className="text-gray-700">Title</Label>
                            <Select
                                value={formData.title}
                                onValueChange={(val) => setFormData({ ...formData, title: val })}
                            >
                                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                                    <SelectValue placeholder="Title" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-300">
                                    {TITLES.map(t => (
                                        <SelectItem key={t.value} value={t.value} className="text-gray-900 cursor-pointer hover:bg-gray-100">
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-gray-700">Full Name</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-700">Email Address</Label>
                        <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-700">Phone Number</Label>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+234..."
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-700">Address</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="City, State"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-700">Church Name <span className="text-gray-400 font-normal">(Optional)</span></Label>
                            <Input
                                value={formData.churchName}
                                onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                                placeholder="e.g. GoodNews"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-700">LCC <span className="text-gray-400 font-normal">(Optional)</span></Label>
                            <Input
                                value={formData.lcc}
                                onChange={(e) => setFormData({ ...formData, lcc: e.target.value })}
                                placeholder="e.g. HighCost"
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-700">Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="bg-white border-gray-300 text-gray-900 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-700">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="bg-white border-gray-300 text-gray-900 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[var(--color-ecwa-blue)] hover:bg-[var(--color-ecwa-blue)]/90 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-[var(--color-ecwa-blue)] hover:underline font-medium">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    )
}
