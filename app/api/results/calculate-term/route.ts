import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL', 'TEACHER'])
        const { classId, academicYearId, term } = await request.json()

        if (!classId || !academicYearId || !term) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Fetch all students in the class
        const students = await db.student.findMany({
            where: { classId, status: 'ACTIVE' },
            include: {
                grades: {
                    where: { academicYearId, term: parseInt(term) }
                }
            }
        })

        if (students.length === 0) {
            return NextResponse.json({ error: 'No students found in this class' }, { status: 404 })
        }

        // 2. Calculate average for each student
        const studentAverages = students.map((student) => {
            const grades = student.grades
            const totalScore = grades.reduce((acc: number, curr) => acc + curr.total, 0)
            const average = grades.length > 0 ? totalScore / grades.length : 0

            return {
                studentId: student.id,
                totalScore,
                average
            }
        })

        // 3. Rank students by average score
        const rankedStudents = [...studentAverages].sort((a, b) => b.average - a.average)

        // 4. Update or Create TermResults in a transaction
        await db.$transaction(
            rankedStudents.map((s, index) => {
                return db.termResult.upsert({
                    where: {
                        studentId_academicYearId_term: {
                            studentId: s.studentId,
                            academicYearId,
                            term: parseInt(term)
                        }
                    },
                    update: {
                        totalScore: s.totalScore,
                        average: s.average,
                        position: index + 1,
                        calculatedAt: new Date()
                    },
                    create: {
                        studentId: s.studentId,
                        classId,
                        academicYearId,
                        term: parseInt(term),
                        totalScore: s.totalScore,
                        average: s.average,
                        position: index + 1
                    }
                })
            })
        )

        return NextResponse.json({
            success: true,
            message: `Term ${term} results calculated for ${rankedStudents.length} students.`
        })
    } catch (error: any) {
        console.error('Term calculation error:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to calculate term results' },
            { status: 500 }
        )
    }
}

