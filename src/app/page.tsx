import Link from "next/link"
import { Building2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

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
          className="group bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center text-center mx-auto max-w-md w-full"
        >
          <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <LogIn size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Login</h2>
          <p className="text-blue-100 mb-6">
            Access your dashboard, manage finances, and view reports.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button className="bg-white text-[var(--color-ecwa-blue)] hover:bg-blue-50">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Sign Up
              </Button>
            </Link>
          </div>
        </Link>
      </div>

      <div className="mt-16 text-blue-200 text-sm">
        © {new Date().getFullYear()} ECWA ChurchFlow. All rights reserved.
      </div>
    </div>
  )
}
