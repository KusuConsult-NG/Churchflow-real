import FinancialSummaryChart from "@/components/reports/FinancialSummaryChart"
import PayrollReport from "@/components/reports/PayrollReport"

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-500">Financial and HR performance overview.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <FinancialSummaryChart />
                <PayrollReport />
            </div>
        </div>
    )
}
