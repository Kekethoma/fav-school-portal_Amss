import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { logAction, sendNotification } from '@/lib/audit'

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['PRINCIPAL'])
        const { resourceIds } = await request.json()

        if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
            return NextResponse.json(
                { error: 'No resources selected for approval' },
                { status: 400 }
            )
        }

        await (db as any).teachingResource.updateMany({
            where: { id: { in: resourceIds } },
            data: {
                isApproved: true,
                approvedBy: session.id,
            }
        })

        // Log action
        await logAction(session.id, 'RESOURCE_APPROVAL', `Approved ${resourceIds.length} resources`)

        return NextResponse.json({ success: true, message: `Approved ${resourceIds.length} resources` })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to approve resources' },
            { status: 500 }
        )
    }
}
