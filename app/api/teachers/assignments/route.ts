import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(_request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER'])

        const assignments = await db.teacherAssignment.findMany({
            where: {
                teacher: {
                    userId: session.id
                },
                academicYear: {
                    isCurrent: true
                }
            },
            include: {
                class: true,
                subject: true,
                academicYear: true
            }
        })

        return NextResponse.json({ assignments })
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch assignments' },
            { status: error?.message === 'Unauthorized' ? 401 : 500 }
        )
    }
}

