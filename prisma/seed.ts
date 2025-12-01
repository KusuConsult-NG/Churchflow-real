import { PrismaClient, UserRole, OrganizationType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create HQ Organization
    const hq = await prisma.organization.upsert({
        where: { code: 'ECWA-HQ' },
        update: {},
        create: {
            name: 'ECWA Headquarters',
            type: OrganizationType.HQ,
            code: 'ECWA-HQ',
            address: 'Jos, Nigeria',
            email: 'hq@ecwa.org'
        }
    })

    console.log({ hq })

    // Create Super Admin User
    const password = await hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@ecwa.org' },
        update: {},
        create: {
            email: 'admin@ecwa.org',
            name: 'Super Admin',
            password,
            role: UserRole.SUPER_ADMIN,
            organizationId: hq.id,
            position: 'System Administrator'
        }
    })

    console.log({ admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
