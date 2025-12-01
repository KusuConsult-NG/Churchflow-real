import OrganizationTree from "@/components/organizations/OrganizationTree"

export default function OrganizationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                <p className="text-gray-500">Manage your organization hierarchy and structure.</p>
            </div>

            <OrganizationTree />
        </div>
    )
}
