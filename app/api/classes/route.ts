import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL', 'TEACHER'])

        const { searchParams } = new URL(request.url)
        const department = searchParams.get('department')

        const classes = await (db as any).class.findMany({
            where: department ? { department } : {},
            orderBy: [{ gradeLevel: 'asc' }, { section: 'asc' }],
            include: {
                _count: {
                    select: { students: true }
                }
            }
        })

        return NextResponse.json({ classes })
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch classes' },
            { status: 500 }
        )
    }
}

