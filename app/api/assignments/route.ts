import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')

    try {
        const where: any = {}
        if (classId) where.classId = classId
        if (subjectId) where.subjectId = subjectId

        // Students see assignments for their class
        if (session.role === 'STUDENT') {
            const student = await db.student.findUnique({ where: { userId: session.id } })
            if (student) where.classId = student.classId
        }

        const assignments = await db.activity.findMany({
            where,
            include: {
                subject: true,
                class: true,
                teacher: { include: { user: { select: { name: true } } } },
                submissions: session.role === 'STUDENT' ? {
                    where: { student: { userId: session.id } }
                } : false
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(assignments)
    } catch (error) {
        console.error('Assignment Fetch Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session || session.role !== 'TEACHER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, dueDate, subjectId, classId, points } = body

        const teacher = await db.teacher.findUnique({ where: { userId: session.id } })
        if (!teacher) return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })

        // Get current academic year
        const academicYear = await db.academicYear.findFirst({ where: { isCurrent: true } })
        if (!academicYear) return NextResponse.json({ error: 'Current academic year not set' }, { status: 400 })

        const assignment = await db.activity.create({
            data: {
                title,
                description,
                dueDate: new Date(dueDate),
                subjectId,
                classId,
                teacherId: teacher.id,
                academicYearId: academicYear.id,
                term: 1, // Default or fetch from settings
                points: points || 100
            }
        })

        return NextResponse.json(assignment, { status: 201 })
    } catch (error) {
        console.error('Assignment Creation Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

