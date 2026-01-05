import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        // Simple security check: search for a secret key in query
        const { searchParams } = new URL(request.url)
        const key = searchParams.get('key')
        if (key !== 'init_amss_2025') {
            return NextResponse.json({ error: 'Unauthorized seed attempt' }, { status: 401 })
        }

        console.log('Starting API Seed...')

        // 1. Clear existing data in correct order
        await db.progressReport.deleteMany()
        await db.attendance.deleteMany()
        await db.grade.deleteMany()
        await db.teacherAssignment.deleteMany()
        await db.lessonPlan.deleteMany()
        await db.teachingResource.deleteMany()
        await db.student.deleteMany()
        await db.teacher.deleteMany()
        await db.user.deleteMany()
        await db.class.deleteMany()
        await db.subject.deleteMany()
        await db.academicYear.deleteMany()

        // 2. Create Academic Year
        const currentYear = await db.academicYear.create({
            data: {
                name: '2025/2026',
                startDate: new Date('2025-09-01'),
                endDate: new Date('2026-07-31'),
                isCurrent: true,
            },
        })

        // 3. Create Principal
        const hashedPrincipalPassword = await hashPassword('2006')
        await db.user.create({
            data: {
                username: 'amssMas',
                name: 'Dr. Sarah Wilson',
                password: hashedPrincipalPassword,
                role: 'PRINCIPAL',
            },
        })

        // 4. Create Subjects
        const subjectsData = [
            { name: 'Mathematics', code: 'MAT101', description: 'Core mathematics' },
            { name: 'English Language', code: 'ENG101', description: 'English language and literature' },
            { name: 'Physics', code: 'PHY101', description: 'Basic physics' },
            { name: 'Chemistry', code: 'CHM101', description: 'Basic chemistry' },
            { name: 'Biology', code: 'BIO101', description: 'Basic biology' },
        ]

        const subjects = await Promise.all(subjectsData.map(s => db.subject.create({ data: s })))

        // 5. Create Classes
        const classesData = [
            { name: 'SS1 Gold', gradeLevel: 10, section: 'Gold', capacity: 35 },
            { name: 'SS2 Silver', gradeLevel: 11, section: 'Silver', capacity: 35 },
        ]

        const classes = await Promise.all(classesData.map(c => db.class.create({ data: c })))

        // 6. Create Teacher
        const hashedTeacherPassword = await hashPassword('teacher123')
        const teacherUser = await db.user.create({
            data: {
                username: 'TCH2025001',
                email: 'teacher@amss.edu',
                name: 'Mr. John Adams',
                password: hashedTeacherPassword,
                role: 'TEACHER',
            },
        })

        const teacher = await db.teacher.create({
            data: {
                userId: teacherUser.id,
                teacherId: 'TCH2025001',
            },
        })

        // Assign teacher to subjects and classes
        await db.teacherAssignment.create({
            data: {
                teacherId: teacher.id,
                classId: classes[0].id,
                subjectId: subjects[0].id, // Mathematics
                academicYearId: currentYear.id,
            },
        })

        // 7. Create Student
        const hashedStudentPassword = await hashPassword('student123')
        const studentUser = await db.user.create({
            data: {
                username: 'STU2025001',
                email: 'student@amss.edu',
                name: 'Michael Chen',
                password: hashedStudentPassword,
                role: 'STUDENT',
            },
        })

        const student = await db.student.create({
            data: {
                userId: studentUser.id,
                studentId: 'STU2025001',
                classId: classes[0].id,
                department: 'SCIENCE',
                guardianName: 'Robert Chen',
                guardianPhone: '08012345678',
                guardianEmail: 'robert@example.com',
            },
        })

        // 8. Add some dummy grades
        await db.grade.create({
            data: {
                studentId: student.id,
                subjectId: subjects[0].id,
                classId: classes[0].id,
                academicYearId: currentYear.id,
                term: 1,
                ca1: 15,
                ca2: 12,
                exam: 45,
                total: 72,
                grade: 'B',
                remark: 'Good improvement',
                teacherId: teacher.id,
            },
        })

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully!',
            credentials: {
                principal: 'amssMas / 2006',
                teacher: 'TCH2025001 / teacher123',
                student: 'STU2025001 / student123'
            }
        })
    } catch (error: any) {
        console.error('Seed error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

