"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { format } from "date-fns"

interface PayrollSummary {
    id: string
    month: string
    staffCount: number
    totalAmount: number
    status: string
}

// Mock data for now, or fetch from API if we had an aggregate endpoint
// For simplicity, we'll fetch from /api/hr/payroll and aggregate client-side or just show list
export default function PayrollReport() {
    const [payrolls, setPayrolls] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPayrolls()
    }, [])

    const fetchPayrolls = async () => {
        try {
            const res = await fetch("/api/hr/payroll")
            const json = await res.json()
            setPayrolls(json)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        const headers = ["Month", "Staff Name", "Net Salary (₦)", "Status", "Payment Date"]
        const rows = payrolls.map(payroll => [
            format(new Date(payroll.month), "MMMM yyyy"),
            payroll.staff.user.name,
            payroll.netSalary.toFixed(2),
            payroll.status,
            payroll.paymentDate ? format(new Date(payroll.paymentDate), "dd MMM yyyy") : "Not Paid"
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `payroll_report_${format(new Date(), "yyyy-MM-dd")}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    if (loading) return <div>Loading payrolls...</div>

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Payrolls</CardTitle>
                    <Button onClick={exportToCSV} size="sm" variant="outline" disabled={payrolls.length === 0}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Net Salary</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payrolls.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No payroll records found</TableCell>
                            </TableRow>
                        ) : (
                            payrolls.slice(0, 10).map((payroll) => (
                                <TableRow key={payroll.id}>
                                    <TableCell>{format(new Date(payroll.month), "MMMM yyyy")}</TableCell>
                                    <TableCell>{payroll.staff.user.name}</TableCell>
                                    <TableCell>₦{payroll.netSalary.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${payroll.status === "PAID" ? "bg-green-100 text-green-800" :
                                            payroll.status === "APPROVED" ? "bg-blue-100 text-blue-800" :
                                                "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {payroll.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {payroll.paymentDate ? format(new Date(payroll.paymentDate), "dd MMM yyyy") : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
