import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])
        const { academicYearId, classId } = await request.json()

        if (!academicYearId || !classId) {
            return NextResponse.json({ error: 'Missing academicYearId or classId' }, { status: 400 })
        }

        // 1. Fetch all students in the class
        const students = await db.student.findMany({
            where: { classId, status: 'ACTIVE' },
            include: {
                termResults: {
                    where: { academicYearId }
                }
            }
        })

        // 2. Process each student
        const annualResults = students.map((student: any) => {
            const t1 = student.termResults.find((r: any) => r.term === 1)?.average || null
            const t2 = student.termResults.find((r: any) => r.term === 2)?.average || null
            const t3 = student.termResults.find((r: any) => r.term === 3)?.average || null

            // Calculate annual average from available terms
            const terms = [t1, t2, t3].filter(t => t !== null) as number[]
            const annualAverage = terms.length > 0
                ? terms.reduce((acc, curr) => acc + curr, 0) / terms.length
                : 0

            // Promotion Logic: 50% threshold
            const promotionStatus = annualAverage >= 50 ? 'PROMOTED' : 'REPEATED'

            return {
                studentId: student.id,
                term1Average: t1,
                term2Average: t2,
                term3Average: t3,
                annualAverage,
                promotionStatus
            }
        })

        // 3. Batch upsert annual results
        await db.$transaction(
            annualResults.map((res: any) => {
                return db.annualResult.upsert({
                    where: {
                        studentId_academicYearId: {
                            studentId: res.studentId,
                            academicYearId
                        }
                    },
                    update: {
                        term1Average: res.term1Average,
                        term2Average: res.term2Average,
                        term3Average: res.term3Average,
                        annualAverage: res.annualAverage,
                        promotionStatus: res.promotionStatus as any,
                        calculatedAt: new Date()
                    },
                    create: {
                        studentId: res.studentId,
                        classId,
                        academicYearId,
                        term1Average: res.term1Average,
                        term2Average: res.term2Average,
                        term3Average: res.term3Average,
                        annualAverage: res.annualAverage,
                        promotionStatus: res.promotionStatus as any
                    }
                })
            })
        )

        return NextResponse.json({
            success: true,
            message: `Annual results and promotions processed for ${annualResults.length} students.`
        })
    } catch (error: any) {
        console.error('Annual calculation error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to process annual results' },
            { status: 500 }
        )
    }
}

