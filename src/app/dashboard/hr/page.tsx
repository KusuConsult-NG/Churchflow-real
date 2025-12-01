"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StaffTab from "@/components/hr/StaffTab"
import LeaveTab from "@/components/hr/LeaveTab"
import PayrollTab from "@/components/hr/PayrollTab"
import QueriesTab from "@/components/hr/QueriesTab"

export default function HRPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">HR & Payroll Management</h1>

            <Tabs defaultValue="staff" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="leave">Leave</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                    <TabsTrigger value="queries">Queries</TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="mt-6">
                    <StaffTab />
                </TabsContent>

                <TabsContent value="leave" className="mt-6">
                    <LeaveTab />
                </TabsContent>

                <TabsContent value="payroll" className="mt-6">
                    <PayrollTab />
                </TabsContent>

                <TabsContent value="queries" className="mt-6">
                    <QueriesTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
