import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET() {
    try {
        await requireAuth(['PRINCIPAL', 'TEACHER', 'STUDENT'])

        let config = await (db as any).schoolConfig.findUnique({
            where: { id: 'singleton' }
        })

        if (!config) {
            // Create default config if it doesn't exist
            config = await (db as any).schoolConfig.create({
                data: {
                    id: 'singleton',
                    isGradeSubmissionOpen: true,
                    isRegistrationOpen: true,
                    currentTerm: 1
                }
            })
        }

        return NextResponse.json(config)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])
        const body = await request.json()

        const updatedConfig = await (db as any).schoolConfig.upsert({
            where: { id: 'singleton' },
            update: body,
            create: {
                id: 'singleton',
                ...body
            }
        })

        return NextResponse.json(updatedConfig)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

