import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction, sendNotification } from '@/lib/audit'

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth()

        let audienceFilter: string[] = ['ALL']
        if (session.role === 'TEACHER') audienceFilter.push('TEACHERS')
        if (session.role === 'STUDENT') audienceFilter.push('STUDENTS')
        if (session.role === 'PRINCIPAL') audienceFilter = ['ALL', 'TEACHERS', 'STUDENTS']

        const announcements = await db.announcement.findMany({
            where: session.role === 'PRINCIPAL'
                ? {}
                : { audience: { in: audienceFilter } },
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true, role: true } } }
        })

        return NextResponse.json({ announcements })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch announcements' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['PRINCIPAL'])
        const { title, content, audience } = await request.json()

        if (!title || !content || !audience) {
            return NextResponse.json(
                { error: 'Title, content, and audience are required' },
                { status: 400 }
            )
        }

        const announcement = await db.announcement.create({
            data: {
                title,
                content,
                audience,
                authorId: session.id
            }
        })

        // Log the action
        await logAction(session.id, 'ANNOUNCEMENT_CREATED', `Created announcement: ${title} for ${audience}`)

        // Send notifications based on audience
        const notifyRole = audience === 'ALL' ? undefined : (audience === 'TEACHERS' ? 'TEACHER' : 'STUDENT')
        const usersToNotify = await db.user.findMany({
            where: notifyRole ? { role: notifyRole } : { role: { in: ['STUDENT', 'TEACHER'] } },
            select: { id: true }
        })

        // Simplified: notify first 50 users to avoid timeout
        for (const user of usersToNotify.slice(0, 50)) {
            await sendNotification(user.id, 'New Announcement', title)
        }

        return NextResponse.json({ success: true, announcement })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to create announcement' },
            { status: 500 }
        )
    }
}

