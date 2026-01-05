import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth()

        const notifications = await (db as any).notification.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return NextResponse.json(notifications)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await requireAuth()
        const { notificationId } = await request.json()

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
        }

        await (db as any).notification.update({
            where: { id: notificationId, userId: session.id },
            data: { isRead: true }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
    }
}

