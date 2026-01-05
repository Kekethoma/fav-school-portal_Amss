import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER'])

        const reports = await db.progressReport.findMany({
            where: {
                teacherId: session.id
            },
            include: {
                student: {
                    include: { user: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        })

        return NextResponse.json({ reports })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

