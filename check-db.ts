import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const ay = await (prisma as any).academicYear.findMany()
    console.log('Academic Years:', ay)
    const classes = await (prisma as any).class.findMany()
    console.log('Classes:', classes)
}

main().catch(console.error).finally(() => prisma.$disconnect())

