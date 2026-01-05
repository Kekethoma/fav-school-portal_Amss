import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(['PRINCIPAL'])
        const { searchParams } = request.nextUrl
        const type = searchParams.get('type')
        const academicYearId = searchParams.get('academicYearId')
        const classId = searchParams.get('classId')
        const term = searchParams.get('term')
        const department = searchParams.get('department')
        const gender = searchParams.get('gender')

        let data: any[] = []
        let headers: string[] = []
        let filename = 'report.csv'

        // Build where clause for filtering
        const studentWhere: any = {}
        if (classId) studentWhere.classId = classId
        if (department) studentWhere.department = department
        if (gender) studentWhere.gender = gender
        if (academicYearId) studentWhere.academicYearId = academicYearId

        if (type === 'students' || type === 'rolls') {
            const students = await db.student.findMany({
                where: studentWhere,
                include: { user: true, class: true }
            })

            if (type === 'students') {
                headers = ['Student ID', 'Name', 'Email', 'Gender', 'Class', 'Department', 'Academic Year', 'Status']
                data = students.map(s => [
                    s.studentId,
                    s.user.name,
                    s.user.email,
                    s.gender || 'N/A',
                    s.class.name,
                    s.department,
                    s.academicYearId || 'N/A',
                    s.status
                ])
                filename = 'students_detailed_report.csv'
            } else {
                // Rolls (Class List / Attendance Sheet)
                headers = ['SN', 'Student ID', 'Full Name', 'Gender', 'Class', 'Status', 'Signature']
                data = students.map((s, idx) => [
                    idx + 1,
                    s.studentId,
                    s.user.name,
                    s.gender || 'N/A',
                    `${s.class.name} ${s.class.section}`,
                    s.status,
                    ''
                ])
                filename = `class_roll_${classId || 'all'}.csv`
            }
        } else if (type === 'grades') {
            const gradeWhere: any = {}
            if (academicYearId) gradeWhere.academicYearId = academicYearId
            if (classId) gradeWhere.classId = classId
            if (term) gradeWhere.term = parseInt(term)
            if (department) gradeWhere.student = { department }
            if (gender) gradeWhere.student = { ...gradeWhere.student, gender }

            const grades = await db.grade.findMany({
                where: gradeWhere,
                include: {
                    student: { include: { user: true } },
                    subject: true,
                    class: true,
                    academicYear: true
                }
            })

            headers = ['Student Name', 'ID', 'Subject', 'Class', 'Term', 'CA1', 'CA2', 'Exam', 'Total', 'Grade', 'Remark', 'Status']
            data = grades.map(g => [
                g.student.user.name,
                g.student.studentId,
                g.subject.name,
                g.class.name,
                g.term,
                g.ca1,
                g.ca2,
                g.exam,
                g.total,
                g.grade,
                g.remark,
                g.isApproved ? 'Approved' : 'Pending'
            ])
            filename = 'grades_report.csv'
        } else if (type === 'teachers') {
            const teachers = await db.teacher.findMany({
                include: { user: true }
            })
            headers = ['Teacher ID', 'Name', 'Email']
            data = teachers.map(t => [
                t.teacherId,
                t.user.name,
                t.user.email
            ])
            filename = 'teachers_report.csv'
        } else {
            return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
        }

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.map((val: any) => {
                const cleanVal = String(val).replace(/"/g, '""');
                return `"${cleanVal}"`;
            }).join(','))
        ].join('\n')

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=${filename}`
            }
        })
    } catch (error: any) {
        console.error('Export Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

