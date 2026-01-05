import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateTeacherId, generateRandomPassword } from '@/lib/id-generator'
import { sendInvitationEmail } from '@/lib/email'
import { requireAuth } from '@/lib/session'

export async function GET(_request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])

        const teachers = await db.teacher.findMany({
            include: {
                user: true,
                assignments: {
                    include: {
                        class: true,
                        subject: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ teachers })
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch teachers' },
            { status: error?.message === 'Unauthorized' ? 401 : 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])

        const {
            name, email, phone, qualification, specialization, skills,
            assignments, academicYearId
        } = await request.json()

        // Validate required fields
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and Email are required' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            )
        }

        // Generate teacher ID and password
        const teacherId = await generateTeacherId()
        const password = generateRandomPassword(12)
        const hashedPassword = await hashPassword(password)

        // Create user and teacher in a transaction
        const result = await db.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: teacherId,
                    email,
                    name,
                    password: hashedPassword,
                    role: 'TEACHER'
                }
            })

            const teacher = await (tx as any).teacher.create({
                data: {
                    userId: user.id,
                    teacherId,
                    phone,
                    qualification,
                    specialization,
                    skills
                }
            })

            // Add assignments if provided (class + subject pairs)
            if (assignments && Array.isArray(assignments) && academicYearId) {
                await (tx as any).teacherAssignment.createMany({
                    data: assignments.map((a: any) => ({
                        teacherId: teacher.id,
                        classId: a.classId,
                        subjectId: a.subjectId,
                        academicYearId
                    }))
                })
            }

            return { user, teacher }
        }, {
            timeout: 10000 // 10s timeout
        })

        // Send invitation email
        await sendInvitationEmail(
            email,
            name,
            'Teacher',
            teacherId,
            password
        )

        return NextResponse.json({
            success: true,
            teacher: {
                id: result.teacher.id,
                teacherId: result.teacher.teacherId,
                name: result.user.name,
                email: result.user.email,
                username: result.user.username,
                password // Plain password for success modal
            },
            message: 'Teacher registered successfully.'
        })
    } catch (error: any) {
        console.error('Teacher registration error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to register teacher' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        )
    }
}

