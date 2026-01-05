import { NextRequest, NextResponse } from 'next/server'
import { generateProgressReport } from '@/lib/ai'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER'])
        const { studentId, academicYearId, term } = await request.json()

        if (!studentId || !academicYearId || !term) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Fetch student information and grades
        const student = await db.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        })

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 })
        }

        const grades = await db.grade.findMany({
            where: {
                studentId,
                academicYearId,
                term: parseInt(term)
            },
            include: { subject: true }
        })

        if (grades.length === 0) {
            return NextResponse.json({ error: 'No grades found for this student in the selected term' }, { status: 404 })
        }

        // 2. Format grades for AI
        const formattedGrades = grades.map((g: any) => ({
            subject: g.subject.name,
            grade: g.grade,
            total: g.total
        }))

        // 3. Generate report using AI
        const reportContent = await generateProgressReport(student.user.name, formattedGrades)

        // 4. Save the report to the database
        const progressReport = await db.progressReport.create({
            data: {
                studentId,
                teacherId: session.id, // The user ID of the teacher generating it
                content: reportContent,
                term: parseInt(term),
                academicYearId
            },
            include: { student: { include: { user: true } } }
        })

        return NextResponse.json({ success: true, report: progressReport })
    } catch (error: any) {
        console.error('AI Progress Report error:', error)
        return NextResponse.json({ error: error.message || 'Failed to generate progress report' }, { status: 500 })
    }
}

