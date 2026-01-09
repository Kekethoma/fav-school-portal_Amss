import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { calculateTotal, calculateGrade, validateGradeInputs } from '@/lib/grade-calculator'

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER', 'PRINCIPAL'])
        const { searchParams } = new URL(request.url)
        const classId = searchParams.get('classId')
        const subjectId = searchParams.get('subjectId')
        const academicYearId = searchParams.get('academicYearId')
        const term = searchParams.get('term')
        const unapproved = searchParams.get('unapproved') === 'true'

        // If 'unapproved' is true and user is Principal, fetch all unapproved grades
        if (unapproved && session.role === 'PRINCIPAL') {
            const grades = await (db as any).grade.findMany({
                where: { isApproved: false },
                include: {
                    student: { include: { user: true } },
                    subject: true,
                    class: true
                },
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json(grades)
        }

        if (!classId || !subjectId || !academicYearId || !term) {
            return NextResponse.json(
                { error: 'Missing required query parameters' },
                { status: 400 }
            )
        }

        // For Teachers, verify assignment
        if (session.role === 'TEACHER') {
            const teacher = await db.teacher.findUnique({
                where: { userId: session.id }
            })

            if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

            const assignment = await db.teacherAssignment.findFirst({
                where: {
                    teacherId: teacher.id,
                    classId,
                    subjectId,
                    academicYearId
                }
            })

            if (!assignment) {
                return NextResponse.json({ error: 'You are not assigned to this class/subject' }, { status: 403 })
            }
        }

        // Fetch grades for the specific criteria
        const grades = await db.grade.findMany({
            where: {
                classId,
                subjectId,
                academicYearId,
                term: parseInt(term)
            },
            include: {
                student: {
                    include: { user: true }
                }
            }
        })

        return NextResponse.json({ grades })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch grades' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER'])

        // Check if grade submission is open in global config
        const config = await (db as any).schoolConfig.findUnique({
            where: { id: 'singleton' }
        })

        if (config && !config.isGradeSubmissionOpen) {
            return NextResponse.json(
                { error: 'Grade submission is currently closed by the Principal.' },
                { status: 403 }
            )
        }

        const { studentId, subjectId, classId, academicYearId, term, ca1, ca2, exam } = await request.json()

        // Validate inputs
        const validation = validateGradeInputs(ca1, ca2, exam)
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.errors.join(', ') },
                { status: 400 }
            )
        }

        // Calculate total and grade
        const total = calculateTotal(ca1, ca2, exam)
        const { grade, remark } = calculateGrade(total)

        // Find the teacher record for this user
        const teacher = await db.teacher.findUnique({
            where: { userId: session.id }
        })

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
        }

        // Verify assignment
        const assignment = await db.teacherAssignment.findFirst({
            where: {
                teacherId: teacher.id,
                classId,
                subjectId,
                academicYearId
            }
        })

        if (!assignment) {
            return NextResponse.json({ error: 'You are not assigned to grade this class/subject' }, { status: 403 })
        }

        // Upsert the grade
        const savedGrade = await db.grade.upsert({
            where: {
                studentId_subjectId_academicYearId_term: {
                    studentId,
                    subjectId,
                    academicYearId,
                    term: parseInt(term)
                }
            },
            update: {
                ca1,
                ca2,
                exam,
                total,
                grade,
                remark,
                teacherId: teacher.id,
                isApproved: false, // Reset approval on edit
                approvedBy: null
            },
            create: {
                studentId,
                subjectId,
                classId,
                academicYearId,
                term: parseInt(term),
                ca1,
                ca2,
                exam,
                total,
                grade,
                remark,
                teacherId: teacher.id
            }
        })

        return NextResponse.json({ success: true, grade: savedGrade })
    } catch (error: any) {
        console.error('Grade submission error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to save grade' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        )
    }
}

