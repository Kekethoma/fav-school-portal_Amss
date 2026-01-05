import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        await requireAuth(['TEACHER'])
        const { classId, date, attendanceData } = await request.json()

        if (!classId || !date || !attendanceData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const formattedDate = new Date(date)
        formattedDate.setHours(0, 0, 0, 0)

        // Use a transaction to save multiple attendance records
        await db.$transaction(
            attendanceData.map((record: { studentId: string; status: any }) =>
                db.attendance.upsert({
                    where: {
                        studentId_date: {
                            studentId: record.studentId,
                            date: formattedDate
                        }
                    },
                    update: {
                        status: record.status
                    },
                    create: {
                        studentId: record.studentId,
                        classId,
                        date: formattedDate,
                        status: record.status
                    }
                })
            )
        )

        return NextResponse.json({ success: true, message: 'Attendance recorded successfully' })
    } catch (error: any) {
        console.error('Attendance error:', error)
        return NextResponse.json({ error: error.message || 'Failed to record attendance' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        await requireAuth(['TEACHER', 'PRINCIPAL', 'STUDENT'])
        const { searchParams } = new URL(request.url)
        const classId = searchParams.get('classId')
        const date = searchParams.get('date')

        if (!classId || !date) {
            return NextResponse.json({ error: 'Missing classId or date' }, { status: 400 })
        }

        const formattedDate = new Date(date)
        formattedDate.setHours(0, 0, 0, 0)

        const attendance = await db.attendance.findMany({
            where: {
                classId,
                date: formattedDate
            },
            include: {
                student: {
                    include: { user: true }
                }
            }
        })

        return NextResponse.json({ attendance })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

