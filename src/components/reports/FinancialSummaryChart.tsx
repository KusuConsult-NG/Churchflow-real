"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { format } from "date-fns"

interface FinancialData {
    name: string
    income: number
    expenditure: number
}

export default function FinancialSummaryChart() {
    const [data, setData] = useState<FinancialData[]>([])
    const [loading, setLoading] = useState(true)

    // Default to current year
    const currentYear = new Date().getFullYear()
    const [startDate, setStartDate] = useState(`${currentYear}-01-01`)
    const [endDate, setEndDate] = useState(`${currentYear}-12-31`)

    useEffect(() => {
        fetchData()
    }, [startDate, endDate])

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                startDate,
                endDate
            })
            const res = await fetch(`/api/reports/financial?${params}`)
            const json = await res.json()
            setData(json)
        } catch (error) {
            console.error("Failed to fetch chart data", error)
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        const headers = ["Month", "Income (₦)", "Expenditure (₦)", "Net (₦)"]
        const rows = data.map(row => [
            row.name,
            row.income.toFixed(2),
            row.expenditure.toFixed(2),
            (row.income - row.expenditure).toFixed(2)
        ])

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `financial_report_${startDate}_to_${endDate}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    if (loading) return <div>Loading chart...</div>

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Financial Overview</CardTitle>
                    <Button onClick={exportToCSV} size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) => [`₦${value.toLocaleString()}`, "Amount"]}
                            />
                            <Legend />
                            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenditure" name="Expenditure" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
