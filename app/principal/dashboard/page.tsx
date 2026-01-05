import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { PrincipalDashboardContent } from '@/components/dashboard/PrincipalDashboardContent'

export default async function PrincipalDashboard() {
    const session = await getSession()

    if (!session || session.role !== 'PRINCIPAL') {
        redirect('/login')
    }

    // Fetch dashboard statistics
    const [studentCount, teacherCount, subjectCount, classCount] = await Promise.all([
        db.student.count({ where: { status: 'ACTIVE' } }),
        db.teacher.count(),
        db.subject.count(),
        db.class.count()
    ])

    // Fetch recent activities
    const recentGrades = await db.grade.findMany({
        where: { isApproved: true },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
            student: { include: { user: { select: { name: true } } } },
            subject: { select: { name: true } }
        }
    })

    const announcements = await db.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { author: { select: { name: true, role: true } } }
    })

    const complaints = await db.complaint.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, role: true } } }
    })

    return (
        <PrincipalDashboardContent
            session={session}
            stats={{ studentCount, teacherCount, subjectCount, classCount }}
            recentGrades={recentGrades}
            announcements={announcements}
            complaints={complaints}
        />
    )
}

