import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(_request: NextRequest) {
    try {
        const session = await requireAuth(['STUDENT'])

        const results = await db.termResult.findMany({
            where: {
                student: {
                    userId: session.id
                }
            },
            include: {
                student: {
                    include: {
                        user: true,
                        class: true,
                        grades: {
                            where: {
                                academicYear: { isCurrent: true },
                                isApproved: true
                            },
                            include: { subject: true }
                        }
                    }
                },
                academicYear: true
            },
            orderBy: {
                term: 'desc'
            }
        })

        // Format for frontend
        const formattedResults = results.map((r) => ({
            term: r.term,
            totalScore: r.totalScore,
            average: r.average,
            position: r.position,
            studentName: r.student.user.name,
            studentId: r.student.studentId,
            className: r.student.class.name,
            academicYear: r.academicYear.name,
            grades: r.student.grades.filter((g) => g.term === r.term)
        }))

        return NextResponse.json({ results: formattedResults })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch results' }, { status: 500 })
    }
}

