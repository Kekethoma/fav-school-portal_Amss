import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL', 'TEACHER'])
        const { searchParams } = new URL(request.url)
        const department = searchParams.get('department')

        const subjects = await (db as any).subject.findMany({
            where: department ? {
                OR: [
                    { department },
                    { department: 'GENERAL' }
                ]
            } : {},
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json({ subjects })
    } catch (error: any) {
        console.error('Error fetching subjects:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch subjects' },
            { status: error.status || 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])
        const body = await request.json()
        const { name, code, department, description } = body

        if (!name || !code) {
            return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 })
        }

        const subject = await (db as any).subject.create({
            data: {
                name,
                code,
                department: department || 'GENERAL',
                description
            }
        })

        return NextResponse.json({ subject })
    } catch (error: any) {
        console.error('Error creating subject:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create subject' },
            { status: 500 }
        )
    }
}

