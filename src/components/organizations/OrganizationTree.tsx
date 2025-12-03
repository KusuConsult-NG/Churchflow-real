"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, Plus, Building2, MoreHorizontal, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AddOrganizationModal from "./AddOrganizationModal"
import EditOrganizationModal from "./EditOrganizationModal"

interface Organization {
    id: string
    name: string
    code: string | null
    type: string
    parentId: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    _count?: {
        children: number
        staff: number
        users: number
    }
    children?: Organization[]
}

// ... (previous imports)

export default function OrganizationTree() {
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedParent, setSelectedParent] = useState<Organization | null>(null)
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

    useEffect(() => {
        fetchOrganizations()
    }, [])

    const fetchOrganizations = async () => {
        try {
            const res = await fetch("/api/organizations?hierarchy=true")
            const data = await res.json()
            const tree = buildTree(data)
            setOrganizations(tree)
        } catch (error) {
            console.error("Failed to fetch organizations", error)
        } finally {
            setLoading(false)
        }
    }

    const buildTree = (items: Organization[]) => {
        const rootItems: Organization[] = []
        const lookup: { [key: string]: Organization } = {}

        // First pass: create lookup and initialize children
        for (const item of items) {
            const itemId = item.id
            // Ensure we preserve existing children if any, or init empty array
            // The API returns flat list but we might process it differently
            lookup[itemId] = { ...item, children: [] }
        }

        // Second pass: link children to parents
        for (const item of items) {
            if (item.parentId) {
                const parent = lookup[item.parentId]
                if (parent) {
                    parent.children?.push(lookup[item.id])
                }
            } else {
                rootItems.push(lookup[item.id])
            }
        }

        return rootItems
    }

    const handleAddSubOrg = (org: Organization) => {
        setSelectedParent(org)
        setIsAddModalOpen(true)
    }

    const handleAddRootOrg = () => {
        setSelectedParent(null)
        setIsAddModalOpen(true)
    }

    const handleEdit = (org: Organization) => {
        setSelectedOrg(org)
        setIsEditModalOpen(true)
    }

    const handleDelete = async (org: Organization) => {
        if (!confirm(`Are you sure you want to delete ${org.name}? This action cannot be undone.`)) return

        try {
            const res = await fetch(`/api/organizations?id=${org.id}`, {
                method: "DELETE"
            })

            const data = await res.json()

            if (res.ok) {
                fetchOrganizations()
            } else {
                alert(data.error || "Failed to delete organization")
            }
        } catch (error) {
            console.error("Delete failed", error)
            alert("An error occurred while deleting the organization")
        }
    }

    if (loading) return <div>Loading hierarchy...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Organization Hierarchy</h2>
                <Button onClick={handleAddRootOrg} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Root Organization
                </Button>
            </div>

            <div className="border rounded-lg p-4 bg-white min-h-[400px]">
                {organizations.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        No organizations found. Create your first one!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {organizations.map((org) => (
                            <TreeNode
                                key={org.id}
                                node={org}
                                onAddSubOrg={handleAddSubOrg}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AddOrganizationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchOrganizations}
                parentOrg={selectedParent}
            />

            <EditOrganizationModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchOrganizations}
                organization={selectedOrg}
            />
        </div>
    )
}

function TreeNode({
    node,
    onAddSubOrg,
    onEdit,
    onDelete
}: {
    node: Organization,
    onAddSubOrg: (org: Organization) => void,
    onEdit: (org: Organization) => void,
    onDelete: (org: Organization) => void
}) {
    const [isExpanded, setIsExpanded] = useState(true)
    const hasChildren = node.children && node.children.length > 0

    return (
        <div className="pl-4">
            <div className="flex items-center group py-1">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-1 rounded hover:bg-gray-100 mr-1 ${hasChildren ? "visible" : "invisible"}`}
                >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                <div className="flex items-center flex-1 p-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-md mr-3">
                        <Building2 size={18} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{node.name}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border">
                                {node.type}
                            </span>
                            {node.code && (
                                <span className="text-xs text-gray-400 font-mono">#{node.code}</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                            <span>{node._count?.staff || 0} Staff</span>
                            <span>{node._count?.users || 0} Users</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onAddSubOrg(node)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Sub-Organization
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(node)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(node)}>
                                <Trash className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="ml-4 border-l border-gray-200 pl-2">
                    {node.children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            onAddSubOrg={onAddSubOrg}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
