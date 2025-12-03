import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileSettings from "@/components/settings/ProfileSettings"
import SecuritySettings from "@/components/settings/SecuritySettings"
import JoinOrganizationModal from "@/components/organizations/JoinOrganizationModal"
import { Button } from "@/components/ui/button"

// ... imports

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account and application preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="organization">Organization</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <ProfileSettings />
                </TabsContent>
                <TabsContent value="security">
                    <SecuritySettings />
                </TabsContent>
                <TabsContent value="organization">
                    <div className="p-6 bg-white rounded-lg border space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">Organization Management</h3>
                            <p className="text-gray-500 mt-1">
                                You can request to join another organization here.
                            </p>
                        </div>

                        <div className="flex justify-center mt-4">
                            <JoinOrganizationModal
                                trigger={
                                    <Button variant="outline">
                                        Join Another Organization
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
