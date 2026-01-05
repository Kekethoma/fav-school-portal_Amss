import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])

        const academicYears = await db.academicYear.findMany({
            orderBy: { startDate: 'desc' }
        })

        return NextResponse.json({ academicYears })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

