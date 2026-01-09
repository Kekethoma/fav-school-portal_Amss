import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['PRINCIPAL'])
        const { assignmentIds } = await request.json()

        if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
            return NextResponse.json(
                { error: 'No assignments selected for approval' },
                { status: 400 }
            )
        }

        await (db as any).activity.updateMany({
            where: { id: { in: assignmentIds } },
            data: {
                isApproved: true,
                approvedBy: session.id,
            }
        })

        // Log action
        await logAction(session.id, 'ASSIGNMENT_APPROVAL', `Approved ${assignmentIds.length} assignments`)

        return NextResponse.json({ success: true, message: `Approved ${assignmentIds.length} assignments` })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to approve assignments' },
            { status: 500 }
        )
    }
}
