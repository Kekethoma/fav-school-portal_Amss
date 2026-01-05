import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { Users, BookOpen, GraduationCap, ClipboardList, Sparkles, FolderOpen } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed'
import { ComplaintModal } from '@/components/dashboard/ComplaintModal'
import { CreateAssignmentModal } from '@/components/dashboard/CreateAssignmentModal'
import { AssignmentList } from '@/components/dashboard/AssignmentList'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function TeacherDashboard() {
    const session = await getSession()

    if (!session || session.role !== 'TEACHER') {
        redirect('/login')
    }

    // Fetch teacher profile
    const teacher = await db.teacher.findUnique({
        where: { userId: session.id },
        include: {
            assignments: {
                where: {
                    academicYear: {
                        isCurrent: true
                    }
                },
                include: {
                    class: true,
                    subject: true,
                    academicYear: true
                }
            }
        }
    })

    if (!teacher) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Teacher Profile Not Found</h1>
                    <p className="text-gray-400 mt-2">Please contact the administrator to set up your profile.</p>
                    <Link href="/login" className="mt-4 inline-block">
                        <Button variant="outline">Back to Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Get unique classes and subjects assigned to this teacher
    const assignedClasses = [...new Set(teacher.assignments.map(a => a.class.id))]
    const assignedSubjects = [...new Set(teacher.assignments.map(a => a.subject.id))]

    // Fetch recent grades entered by this teacher
    const recentGrades = await db.grade.findMany({
        where: { teacherId: teacher.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            student: { include: { user: true } },
            subject: true,
            class: true
        }
    })
    // Fetch announcements for teachers
    const announcements = await (db as any).announcement.findMany({
        where: { audience: { in: ['ALL', 'TEACHERS'] } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { author: { select: { name: true, role: true } } }
    })

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-[#1e40af]">
            {/* Header */}
            <header className="bg-background/80 dark:bg-black/30 backdrop-blur-md border-b border-border dark:border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Teacher Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Welcome back, {session.name}</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <ThemeToggle />
                            <NotificationBell />
                            <Link href="/">
                                <Button variant="outline">Home</Button>
                            </Link>
                            <form action="/api/auth/logout" method="POST">
                                <Button variant="secondary" type="submit">Logout</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Assigned Classes"
                        value={assignedClasses.length}
                        icon={Users}
                    />
                    <StatsCard
                        title="Teaching Subjects"
                        value={assignedSubjects.length}
                        icon={BookOpen}
                    />
                    <StatsCard
                        title="Current Assignments"
                        value={teacher.assignments.length}
                        icon={GraduationCap}
                    />
                </div>

                {/* Quick Actions */}
                <Card className="mb-8 border-white/10 bg-black/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-[#60a5fa]">Teacher Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/teacher/grades">
                                <Button variant="primary" className="w-full h-12 flex gap-2">
                                    <ClipboardList className="h-5 w-5" />
                                    Enter Grades
                                </Button>
                            </Link>
                            <Link href="/teacher/lesson-planner">
                                <Button variant="secondary" className="w-full h-12 flex gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    AI Lesson Planner
                                </Button>
                            </Link>
                            <Link href="/teacher/resources">
                                <Button variant="outline" className="w-full h-12 flex gap-2">
                                    <FolderOpen className="h-5 w-5" />
                                    Teaching Resources
                                </Button>
                            </Link>
                            <CreateAssignmentModal />
                        </div>
                        <div className="mt-4">
                            <ComplaintModal />
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements - Teacher View */}
                <div className="mb-8">
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Staff Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AnnouncementFeed announcements={announcements} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Assigned Classes & Subjects */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Your Teaching Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teacher.assignments.length > 0 ? (
                                    teacher.assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5"
                                        >
                                            <div>
                                                <p className="text-white font-medium">{assignment.subject.name}</p>
                                                <p className="text-gray-400 text-sm">{assignment.class.name} ({assignment.class.section})</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#60a5fa] text-sm">Active</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-8">No assignments for current term</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Grades */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Grade Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentGrades.length > 0 ? (
                                <div className="space-y-4">
                                    {recentGrades.map((grade) => (
                                        <div
                                            key={grade.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                                        >
                                            <div>
                                                <p className="text-white font-medium">{grade.student.user.name}</p>
                                                <p className="text-gray-400 text-sm">
                                                    {grade.subject.name} • {grade.class.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#60a5fa] font-bold text-lg">{grade.total}%</p>
                                                <p className="text-gray-400 text-xs">Term {grade.term}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400">No recent grades submitted</p>
                                    <Link href="/teacher/grades" className="mt-4 inline-block">
                                        <Button variant="secondary" size="sm">Start Grading</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main >
        </div >
    )
}

