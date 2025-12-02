import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { OrganizationType } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateOrgForm } from "./form"

// Helper to determine allowed child types
function getAllowedChildTypes(parentType: OrganizationType): OrganizationType[] {
    switch (parentType) {
        case "HQ":
            return ["GCC", "DCC"]
        case "GCC":
            return ["DCC"]
        case "DCC":
            return ["LCC"]
        case "LCC":
            return ["LC"]
        default:
            return []
    }
}

export default async function CreateOrganizationPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) {
        redirect("/dashboard")
    }

    const parentOrg = await prisma.organization.findUnique({
        where: { id: session.user.organizationId }
    })

    if (!parentOrg) {
        redirect("/dashboard")
    }

    const allowedTypes = getAllowedChildTypes(parentOrg.type)

    if (allowedTypes.length === 0) {
        return (
            <div className="p-8">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-800">Permission Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">
                            Your organization type ({parentOrg.type}) cannot create child organizations.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-ecwa-blue)]">Create Sub-Organization</h1>
                <p className="text-gray-600">
                    Add a new branch under <span className="font-semibold">{parentOrg.name}</span> ({parentOrg.type})
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateOrgForm
                        parentId={parentOrg.id}
                        allowedTypes={allowedTypes}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
