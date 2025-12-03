import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
    // Automatically append pgbouncer=true if using Supabase transaction pooler (port 6543)
    // This fixes the "prepared statement already exists" error
    let url = process.env.DATABASE_URL

    if (url && url.includes('supabase.com') && url.includes('6543') && !url.includes('pgbouncer=true')) {
        url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true'
    }

    return new PrismaClient({
        log: ['query'],
        datasources: url ? {
            db: {
                url: url
            }
        } : undefined
    })
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
