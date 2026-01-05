import { NextRequest, NextResponse } from 'next/server'
import { chatWithAdvisor } from '@/lib/ai'
import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['STUDENT'])
        const { question } = await request.json()

        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 })
        }

        // Fetch student context for better advice
        const student = await db.student.findUnique({
            where: { userId: session.id },
            include: {
                class: true,
                grades: {
                    include: { subject: true },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        })

        const performanceContext = student?.grades.length
            ? `Student's recent grades: ${student.grades.map((g: any) => `${g.subject.name}: ${g.total}%`).join(', ')}.`
            : 'No grade data available yet.'

        const context = `Student Name: ${session.name}. Class: ${student?.class.name}. ${performanceContext}`

        const answer = await chatWithAdvisor(question, context)

        return NextResponse.json({ answer })
    } catch (error: any) {
        console.error('AI Advisor error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to get advice' },
            { status: 500 }
        )
    }
}

