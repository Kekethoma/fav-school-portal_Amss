import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateStudentId, generateRandomPassword } from '@/lib/id-generator'
import { sendInvitationEmail } from '@/lib/email'
import { requireAuth } from '@/lib/session'
import { logAction } from '@/lib/audit'

export async function GET(_request: NextRequest) {
    try {
        const session = await requireAuth(['PRINCIPAL', 'TEACHER'])

        // Teachers can only see students in their assigned classes
        if (session.role === 'TEACHER') {
            const teacher = await db.teacher.findUnique({
                where: { userId: session.id },
                include: {
                    assignments: {
                        include: {
                            class: {
                                include: { students: { include: { user: true } } }
                            }
                        }
                    }
                }
            })

            const students = teacher?.assignments.flatMap((a: any) => a.class.students) || []
            return NextResponse.json({ students })
        }

        // Principal can see all students
        const students = await db.student.findMany({
            include: {
                user: true,
                class: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ students })
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch students' },
            { status: error?.message === 'Unauthorized' ? 401 : 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requireAuth(['PRINCIPAL'])

        const {
            name, email, classId, guardianName, guardianPhone, guardianEmail,
            emergencyContact, gender, dateOfBirth, address, religion,
            previousSchool, academicYearId, department
        } = await request.json()

        // Validate required fields
        if (!name || !email || !classId || !guardianName || !guardianPhone || !academicYearId) {
            return NextResponse.json(
                { error: 'Required fields are missing' },
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

        // Generate student ID and password
        const studentId = await generateStudentId()
        const password = generateRandomPassword(12)
        const hashedPassword = await hashPassword(password)

        // Create user and student in a transaction
        const result = await db.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username: studentId,
                    email,
                    name,
                    password: hashedPassword,
                    role: 'STUDENT'
                }
            })

            const student = await (tx as any).student.create({
                data: {
                    userId: user.id,
                    studentId,
                    classId,
                    academicYearId,
                    department,
                    guardianName,
                    guardianPhone,
                    guardianEmail,
                    emergencyContact,
                    gender,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    address,
                    religion,
                    previousSchool,
                    status: 'ACTIVE'
                }
            })

            // --- AUTO SUBJECT ASSIGNMENT ---
            const targetClass = await tx.class.findUnique({ where: { id: classId } })

            if (targetClass) {
                let subjectNames: string[] = []

                if (targetClass.name.startsWith('JSS')) {
                    subjectNames = ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'French', 'Business Studies', 'Home Economics', 'Agricultural Science']
                } else if (targetClass.name.startsWith('SSS')) {
                    const core = ['Mathematics', 'English Language']
                    const electives: Record<string, string[]> = {
                        'Science': ['Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'ICT'],
                        'Arts': ['Literature-in-English', 'Government', 'History', 'Religious Moral Education'],
                        'Commercial': ['Financial Accounting', 'Commerce', 'Economics', 'Cost Accounting']
                    }
                    subjectNames = [...core, ...(electives[department] || [])]
                }

                const subjects = await tx.subject.findMany({
                    where: { name: { in: subjectNames } }
                })

                if (subjects.length > 0) {
                    // Create Grade records for each subject (Term 1)
                    await tx.grade.createMany({
                        data: (subjects.map(s => ({
                            studentId: student.id,
                            subjectId: s.id,
                            classId: classId,
                            academicYearId: academicYearId, // Use the one from the form
                            term: 1, // Start with Term 1
                            ca1: 0,
                            ca2: 0,
                            exam: 0,
                            total: 0,
                            grade: 'F', // Default
                            remark: 'Pending',
                            isApproved: false
                        })) as any)
                    })
                }
            }

            return { user, student, className: targetClass?.name }
        }, {
            maxWait: 5000, // 5s max wait to connect to prisma
            timeout: 15000 // 15s timeout
        })

        // Log the registration (outside transaction)
        await logAction(session.id, 'STUDENT_REGISTRATION', `Registered student ${studentId} (${name}) for class ${result.className}`)

        // Send invitation email
        await sendInvitationEmail(
            email,
            name,
            'Student',
            studentId,
            password
        )

        return NextResponse.json({
            success: true,
            student: {
                id: result.student.id,
                studentId: result.student.studentId,
                name: result.user.name,
                email: result.user.email,
                username: result.user.username,
                password // Plain password for success modal
            },
            message: 'Student registered successfully.'
        })
    } catch (error: any) {
        console.error('Student registration error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to register student' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        )
    }
}

