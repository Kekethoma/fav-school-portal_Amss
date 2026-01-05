import { db } from './db'

/**
 * Determine promotion status based on annual average
 * Students with 50%+ are promoted
 */
export async function processAnnualPromotion(
    studentId: string,
    academicYearId: string,
    annualAverage: number
): Promise<{
    status: 'PROMOTED' | 'REPEATED'
    nextClassId: string | null
}> {
    const student = await db.student.findUnique({
        where: { id: studentId },
        include: { class: true }
    })

    if (!student) {
        throw new Error('Student not found')
    }

    // Promotion threshold is 50%
    if (annualAverage >= 50) {
        // Find next class (same grade level + 1)
        const nextClass = await db.class.findFirst({
            where: {
                gradeLevel: student.class.gradeLevel + 1
            }
        })

        return {
            status: 'PROMOTED',
            nextClassId: nextClass?.id || null
        }
    } else {
        return {
            status: 'REPEATED',
            nextClassId: null
        }
    }
}

/**
 * Calculate term results for a class
 */
export async function calculateTermResults(
    classId: string,
    academicYearId: string,
    term: number
) {
    // Get all students in the class
    const students = await db.student.findMany({
        where: { classId },
        include: {
            grades: {
                where: {
                    academicYearId,
                    term
                }
            }
        }
    })

    const results = students.map(student => {
        const totalScore = student.grades.reduce((sum, grade) => sum + grade.total, 0)
        const average = student.grades.length > 0 ? totalScore / student.grades.length : 0

        return {
            studentId: student.id,
            totalScore,
            average
        }
    })

    // Sort by average descending to assign positions
    results.sort((a, b) => b.average - a.average)

    // Save term results
    for (let i = 0; i < results.length; i++) {
        await db.termResult.upsert({
            where: {
                studentId_academicYearId_term: {
                    studentId: results[i].studentId,
                    academicYearId,
                    term
                }
            },
            create: {
                studentId: results[i].studentId,
                classId,
                academicYearId,
                term,
                totalScore: results[i].totalScore,
                average: results[i].average,
                position: i + 1
            },
            update: {
                totalScore: results[i].totalScore,
                average: results[i].average,
                position: i + 1,
                calculatedAt: new Date()
            }
        })
    }

    return results
}

