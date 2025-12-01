"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AccountsTab from "@/components/finance/AccountsTab"
import IncomeTab from "@/components/finance/IncomeTab"
import ExpenditureTab from "@/components/finance/ExpenditureTab"

export default function FinancePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>

            <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="expenditure">Expenditure</TabsTrigger>
                </TabsList>

                <TabsContent value="accounts" className="mt-6">
                    <AccountsTab />
                </TabsContent>

                <TabsContent value="income" className="mt-6">
                    <IncomeTab />
                </TabsContent>

                <TabsContent value="expenditure" className="mt-6">
                    <ExpenditureTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
