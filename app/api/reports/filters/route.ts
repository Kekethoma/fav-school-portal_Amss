import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET() {
    try {
        await requireAuth(['PRINCIPAL'])

        const academicYears = await db.academicYear.findMany({
            orderBy: { startDate: 'desc' }
        })

        const classes = await db.class.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ academicYears, classes })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

