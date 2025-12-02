import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, UserPlus } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const user = session.user

  // Handle Orphan Users (No Organization)
  if (!user.organizationId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[var(--color-ecwa-blue)] mb-4">Welcome to ChurchFlow, {user.name}</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            You are currently not connected to any organization. To get started, you can join an existing church or department.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[var(--color-ecwa-blue)]">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                <Building2 className="text-[var(--color-ecwa-blue)] w-8 h-8" />
              </div>
              <CardTitle>Join an Organization</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-500 mb-6">
                Have an invite code? Enter it here to join your Local Church (LC), LCC, or DCC.
              </p>
              <Button className="w-full bg-[var(--color-ecwa-blue)]">
                Enter Invite Code
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[var(--color-ecwa-blue)]">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                <UserPlus className="text-green-600 w-8 h-8" />
              </div>
              <CardTitle>Contact Administrator</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-500 mb-6">
                Don't have a code? Contact your church administrator or secretary to be added to the system.
              </p>
              <Button variant="outline" className="w-full">
                View Support Contacts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-ecwa-blue)]">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/dashboard/settings/leadership">Manage Leadership</a>
          </Button>
        </div>
      </div>

      {/* Leadership Setup Prompt (Simplified) */}
      <Card className="mb-8 border-l-4 border-l-orange-500 bg-orange-50">
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-orange-900">Complete Your Leadership Team</h3>
            <p className="text-sm text-orange-700">
              Your organization profile is incomplete. Please assign key leadership roles (Secretary, Treasurer, etc.) to ensure proper workflow.
            </p>
          </div>
          <Button asChild variant="secondary" className="bg-white text-orange-900 hover:bg-orange-100">
            <a href="/dashboard/settings/leadership">Setup Now</a>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0.00</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
