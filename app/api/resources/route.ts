import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { generateResourceTags } from '@/lib/ai'

export async function GET(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER', 'PRINCIPAL'])

        let resources;
        if (session.role === 'TEACHER') {
            const teacher = await db.teacher.findUnique({
                where: { userId: session.id }
            })
            if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

            resources = await db.teachingResource.findMany({
                where: { teacherId: teacher.id },
                orderBy: { uploadedAt: 'desc' }
            })
        } else {
            resources = await db.teachingResource.findMany({
                include: { teacher: { include: { user: true } } },
                orderBy: { uploadedAt: 'desc' }
            })
        }



        const parsedResources = resources!.map(r => ({
            ...r,
            tags: r.tags ? r.tags.split(',') : []
        }))

        return NextResponse.json({ resources: parsedResources })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['TEACHER'])
        const { title, fileType, fileName } = await request.json()

        if (!title || !fileType || !fileName) {
            return NextResponse.json({ error: 'Title, file type, and file name are required' }, { status: 400 })
        }

        const teacher = await db.teacher.findUnique({
            where: { userId: session.id }
        })

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
        }

        // Generate AI tags
        const tags = await generateResourceTags(fileName, fileType)

        // Mock file upload URL
        const fileUrl = `/uploads/${Date.now()}-${fileName}`

        const resource = await db.teachingResource.create({
            data: {
                teacherId: teacher.id,
                title,
                fileUrl,
                fileType,
                tags: tags.join(',')
            }
        })

        return NextResponse.json({ resource })
    } catch (error: any) {
        console.error('Resource upload error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

