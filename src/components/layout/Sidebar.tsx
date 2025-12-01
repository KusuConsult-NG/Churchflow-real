"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Building2,
    Users,
    Wallet,
    FileText,
    Settings,
    LogOut,
    Menu,
    Heart,
    BarChart3
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/dashboard/orgs", icon: Building2 },
    { name: "Crowdfunding", href: "/dashboard/crowdfunding", icon: Heart },
    { name: "Finance", href: "/dashboard/finance", icon: Wallet },
    { name: "HR & Payroll", href: "/dashboard/hr", icon: Users },
    { name: "Reports", href: "/dashboard/all-reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/app-settings", icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-ecwa-blue text-white rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-ecwa-blue text-white transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-auto
      `}>
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold">ChurchFlow</h1>
                        <p className="text-sm text-blue-200 mt-1">ECWA Management</p>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${isActive
                                            ? "bg-white text-ecwa-blue font-medium"
                                            : "text-blue-100 hover:bg-blue-800 hover:text-white"}
                  `}
                                >
                                    <item.icon size={20} className="mr-3" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-blue-800">
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                            className="flex items-center w-full px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors"
                        >
                            <LogOut size={20} className="mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
