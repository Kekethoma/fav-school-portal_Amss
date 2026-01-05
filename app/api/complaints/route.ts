import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])

        const complaints = await (db as any).complaint.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, role: true, email: true } } }
        })

        return NextResponse.json({ complaints })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch complaints' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth()
        const { title, description } = await request.json()

        if (!title || !description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            )
        }

        const complaint = await (db as any).complaint.create({
            data: {
                title,
                description,
                userId: session.id,
                status: 'PENDING'
            }
        })

        return NextResponse.json({ success: true, complaint })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to file complaint' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await requireAuth(['PRINCIPAL'])
        const { complaintId, status } = await request.json()

        if (!complaintId || !status) {
            return NextResponse.json(
                { error: 'Complaint ID and status are required' },
                { status: 400 }
            )
        }

        const complaint = await (db as any).complaint.update({
            where: { id: complaintId },
            data: { status }
        })

        await logAction(session.id, 'COMPLAINT_RESOLVED', `Resolved complaint ID ${complaintId}: ${complaint.title}`)

        return NextResponse.json({ success: true, complaint })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to update complaint' },
            { status: 500 }
        )
    }
}


