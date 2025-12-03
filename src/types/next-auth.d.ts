import { UserRole, OrganizationType } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: UserRole
            organizationId: string | null
            organizationType: OrganizationType | undefined
            pendingOrganizationId: string | null
        } & DefaultSession["user"]
    }

    interface User {
        role: UserRole
        organizationId: string | null
        organizationType: OrganizationType | undefined
        pendingOrganizationId: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: UserRole
        organizationId: string | null
        organizationType: OrganizationType | undefined
        pendingOrganizationId: string | null
    }
}
