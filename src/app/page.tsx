import Link from "next/link"
import { Building2, LogIn } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ecwa-blue to-blue-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">ChurchFlow</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          A closed-loop profitability and financial management system for ECWA denomination.
          Integrated with Gowans Microfinance Bank.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Login Card */}
        <Link
          href="/auth/signin"
          className="group bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <LogIn size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Login</h2>
          <p className="text-blue-100">
            Access your dashboard, manage finances, and view reports.
          </p>
        </Link>

        {/* Create Organization Card */}
        <Link
          href="/create-organization"
          className="group bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <Building2 size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create Organization</h2>
          <p className="text-blue-100">
            Register a new LC, LCC, DCC, or GCC and set up your team.
          </p>
        </Link>
      </div>

      <div className="mt-16 text-blue-200 text-sm">
        © {new Date().getFullYear()} ECWA ChurchFlow. All rights reserved.
      </div>
    </div>
  )
}
