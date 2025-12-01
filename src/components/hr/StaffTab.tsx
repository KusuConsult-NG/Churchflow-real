"use client"

import { useEffect, useState } from "react"
import { Plus, User, Briefcase, Calendar } from "lucide-react"

const CONTRACT_TYPES = ["Permanent", "Temporary", "Contract", "Volunteer"]

export default function StaffTab() {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = () => {
        fetch("/api/hr/staff")
            .then(res => res.json())
            .then(data => {
                setStaff(data)
                setLoading(false)
            })
    }

    if (loading) return <div>Loading staff...</div>

    const totalStaff = staff.length
    const permanentStaff = staff.filter(s => s.contractType === 'Permanent').length

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Staff Management</h2>
                    <p className="text-sm text-gray-500">Manage employee profiles and records</p>
                </div>
                <button className="bg-ecwa-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-900">
                    <Plus size={20} className="mr-2" />
                    Add Staff
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Total Staff</p>
                    <p className="text-3xl font-bold mt-2">{totalStaff}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                    <p className="text-sm opacity-90">Permanent Staff</p>
                    <p className="text-3xl font-bold mt-2">{permanentStaff}</p>
                </div>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Staff ID</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Name</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Department</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Contract Type</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Hire Date</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-700">Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(member => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-sm font-medium text-gray-900">{member.staffId}</td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <User size={16} className="text-ecwa-blue" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                                                <p className="text-xs text-gray-500">{member.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {member.department?.name || "Unassigned"}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.contractType === 'Permanent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {member.contractType}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(member.hireDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm font-semibold text-gray-900">
                                        ₦{member.baseSalary.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No staff records found. Add your first employee to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
