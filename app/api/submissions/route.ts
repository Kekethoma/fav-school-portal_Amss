import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'STUDENT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { activityId, content } = body

        const student = await db.student.findUnique({ where: { userId: session.id } })
        if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })

        const submission = await db.submission.upsert({
            where: {
                activityId_studentId: {
                    activityId,
                    studentId: student.id
                }
            },
            update: {
                content,
                submittedAt: new Date(),
                status: 'SUBMITTED'
            },
            create: {
                activityId,
                studentId: student.id,
                content,
                status: 'SUBMITTED'
            }
        })

        return NextResponse.json(submission)
    } catch (error) {
        console.error('Submission Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'TEACHER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { submissionId, grade, feedback } = body

        const submission = await db.submission.update({
            where: { id: submissionId },
            data: {
                grade,
                feedback,
                status: 'GRADED'
            }
        })

        return NextResponse.json(submission)
    } catch (error) {
        console.error('Grading Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const assignmentId = searchParams.get('assignmentId') || undefined

    try {
        if (assignmentId) {
            const assignment = await db.activity.findUnique({
                where: { id: assignmentId },
                include: { class: { include: { students: { include: { user: { select: { name: true } } } } } } }
            })

            if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

            const submissions = await db.submission.findMany({
                where: { activityId: assignmentId },
                include: { student: { include: { user: { select: { name: true } } } } }
            })

            return NextResponse.json({
                assignment,
                students: assignment.class.students,
                submissions
            })
        }

        const submissions = await db.submission.findMany({
            include: {
                student: { include: { user: { select: { name: true } } } },
                activity: true
            }
        })

        return NextResponse.json(submissions)
    } catch (error) {
        console.error('Submission Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

