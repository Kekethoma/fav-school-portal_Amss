import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const comments = await (db as any).comment.findMany({
            where: { announcementId: id },
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: 'asc' }
        })
        return NextResponse.json(comments)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await requireAuth()
        const { content } = await request.json()

        if (!content) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
        }

        const comment = await (db as any).comment.create({
            data: {
                content,
                announcementId: id,
                userId: session.id
            },
            include: { user: { select: { name: true, role: true } } }
        })

        return NextResponse.json(comment)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
    }
}
