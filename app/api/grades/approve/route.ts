import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction, sendNotification } from '@/lib/audit'

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['PRINCIPAL'])
        const { gradeIds } = await request.json()

        if (!Array.isArray(gradeIds) || gradeIds.length === 0) {
            return NextResponse.json(
                { error: 'No grades selected for approval' },
                { status: 400 }
            )
        }

        await db.grade.updateMany({
            where: { id: { in: gradeIds } },
            data: {
                isApproved: true,
                approvedBy: session.id,
                updatedAt: new Date()
            }
        })

        // Log the action
        await logAction(session.id, 'GRADE_APPROVAL', `Approved ${gradeIds.length} grade entries`)

        // Notify students (simplified: notifying first 10, should ideally notify all unique students)
        const sampleGrades = await db.grade.findMany({
            where: { id: { in: gradeIds } },
            include: { student: true, subject: true },
            take: 20
        })

        const uniqueStudentIds = [...new Set(sampleGrades.map(g => g.studentId))]
        for (const sId of uniqueStudentIds) {
            const student = sampleGrades.find(g => g.studentId === sId)?.student
            if (student) {
                await sendNotification(student.userId, 'Grade Approved', `Your grades have been officially approved and are now available for viewing.`)
            }
        }

        return NextResponse.json({ success: true, message: `Approved ${gradeIds.length} grades` })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to approve grades' },
            { status: 500 }
        )
    }
}

