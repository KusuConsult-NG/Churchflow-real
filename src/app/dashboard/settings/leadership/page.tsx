import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganizationType } from "@prisma/client"
import { LeadershipList } from "./list"

// Define required roles per org type
const REQUIRED_ROLES: Record<OrganizationType, { role: string, label: string }[]> = {
    HQ: [
        { role: "PRESIDENT", label: "ECWA President" },
        { role: "VICE_PRESIDENT", label: "Vice President" },
        { role: "GENERAL_SECRETARY", label: "General Secretary" },
        { role: "ASSISTANT_GS", label: "Assistant Gen. Sec." },
        { role: "TREASURER", label: "Treasurer" },
        { role: "FINANCIAL_SECRETARY", label: "Financial Secretary" }
    ],
    GCC: [
        { role: "CHAIRMAN", label: "Chairman" },
        { role: "SECRETARY", label: "Secretary" },
        { role: "TREASURER", label: "Treasurer" }
    ],
    DCC: [
        { role: "CHAIRMAN", label: "DCC Chairman" },
        { role: "SECRETARY", label: "DCC Secretary" },
        { role: "TREASURER", label: "Treasurer" },
        { role: "FINANCIAL_SECRETARY", label: "Financial Secretary" }
    ],
    LCC: [
        { role: "LOCAL_OVERSEER", label: "Local Overseer (LO)" },
        { role: "SECRETARY", label: "Secretary" },
        { role: "TREASURER", label: "Treasurer" },
        { role: "FINANCIAL_SECRETARY", label: "Financial Secretary" }
    ],
    LC: [
        { role: "SENIOR_MINISTER", label: "Senior Minister" },
        { role: "SECRETARY", label: "Secretary" },
        { role: "TREASURER", label: "Treasurer" },
        { role: "FINANCIAL_SECRETARY", label: "Financial Secretary" },
        { role: "ELDER", label: "Elder (Delegate)" }
    ],
    // Fallback for others
    AGENCY: [],
    DEPARTMENT: []
}

export default async function LeadershipPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) redirect("/dashboard")

    const org = await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
        include: {
            users: {
                where: {
                    position: { not: null } // Fetch users with positions
                }
            }
        }
    })

    if (!org) redirect("/dashboard")

    const requiredRoles = REQUIRED_ROLES[org.type] || []

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-ecwa-blue)]">Leadership Team</h1>
                <p className="text-gray-600">
                    Manage the key leadership positions for <span className="font-semibold">{org.name}</span> ({org.type}).
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Required Positions</CardTitle>
                </CardHeader>
                <CardContent>
                    <LeadershipList
                        organizationId={org.id}
                        requiredRoles={requiredRoles}
                        currentLeaders={org.users}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
