import Link from "next/link"
import { Building2, LogIn, Activity, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ecwa-blue to-blue-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">ChurchFlow</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
            A closed-loop profitability and financial management system for ECWA denomination.
            Integrated with Gowans Microfinance Bank.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl mx-auto">
          {/* Login Card */}
          <Link
            href="/auth/signin"
            className="group bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center text-center w-full min-h-[300px]"
          >
            <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <LogIn size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-blue-100 mb-6">
              Already have an account? Sign in to access your dashboard.
            </p>
            <Button className="w-full bg-white text-[var(--color-ecwa-blue)] hover:bg-blue-50 font-semibold">
              Login to Dashboard
            </Button>
          </Link>

          {/* Sign Up Card */}
          <Link
            href="/auth/signup"
            className="group bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center justify-center text-center w-full min-h-[300px]"
          >
            <div className="bg-white/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">New Here?</h2>
            <p className="text-blue-100 mb-6">
              Register your organization or join an existing one today.
            </p>
            <Button variant="outline" className="w-full border-white text-white hover:bg-white/10 font-semibold">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Impact Section */}
        <div className="mt-16 w-full max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Platform Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500/20 p-3 rounded-full mb-4">
                  <Activity className="text-blue-300" size={24} />
                </div>
                <span className="text-3xl font-bold text-white mb-1">500+</span>
                <span className="text-blue-200 text-sm">Active Churches</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500/20 p-3 rounded-full mb-4">
                  <Users className="text-purple-300" size={24} />
                </div>
                <span className="text-3xl font-bold text-white mb-1">10k+</span>
                <span className="text-blue-200 text-sm">Members Managed</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-pink-500/20 p-3 rounded-full mb-4">
                  <Heart className="text-pink-300" size={24} />
                </div>
                <span className="text-3xl font-bold text-white mb-1">₦50M+</span>
                <span className="text-blue-200 text-sm">Donations Processed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-blue-200 text-sm">
          © {new Date().getFullYear()} ECWA ChurchFlow. All rights reserved.
        </div>
      </div>
    </div>
  )
}
