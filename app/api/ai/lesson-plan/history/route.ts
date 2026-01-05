import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER'])

        const teacher = await db.teacher.findUnique({
            where: { userId: session.id }
        })

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
        }

        const plans = await db.lessonPlan.findMany({
            where: { teacherId: teacher.id },
            include: { subject: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return NextResponse.json({ plans })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch history' },
            { status: 500 }
        )
    }
}

