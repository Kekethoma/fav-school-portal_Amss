import { NextRequest, NextResponse } from 'next/server'
import { generateLessonPlan } from '@/lib/ai'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER'])
        const { subjectId, topic } = await request.json()

        if (!subjectId || !topic) {
            return NextResponse.json({ error: 'Subject and Topic are required' }, { status: 400 })
        }

        const subject = await db.subject.findUnique({
            where: { id: subjectId }
        })

        if (!subject) {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
        }

        const lessonPlanContent = await generateLessonPlan(subject.name, topic)

        // Find teacher
        const teacher = await db.teacher.findUnique({
            where: { userId: session.id }
        })

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
        }

        // Save lesson plan to DB
        const lessonPlan = await db.lessonPlan.create({
            data: {
                teacherId: teacher.id,
                subjectId: subject.id,
                topic,
                content: lessonPlanContent
            }
        })

        return NextResponse.json({ lessonPlan })
    } catch (error: any) {
        console.error('AI Lesson Plan error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate lesson plan' },
            { status: 500 }
        )
    }
}

