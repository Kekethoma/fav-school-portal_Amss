const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const ay = await prisma.academicYear.findMany()
    console.log('Academic Years:', ay)
    const classes = await prisma.class.findMany()
    console.log('Classes:', classes)
}

main().catch(console.error).finally(() => prisma.$disconnect())
