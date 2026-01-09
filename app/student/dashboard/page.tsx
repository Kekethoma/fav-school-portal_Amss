import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { GraduationCap, BookOpen, Award, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed'
import { ComplaintModal } from '@/components/dashboard/ComplaintModal'
import { AssignmentList } from '@/components/dashboard/AssignmentList'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function StudentDashboard() {
    const session = await getSession()

    if (!session || session.role !== 'STUDENT') {
        redirect('/login')
    }

    // Fetch student profile with class and grades
    const student = await db.student.findUnique({
        where: { userId: session.id },
        include: {
            class: true,
            grades: {
                include: { subject: true },
                orderBy: { term: 'asc' }
            },
            termResults: {
                orderBy: { term: 'desc' }
            }
        }
    })

    const announcements = await (db as any).announcement.findMany({
        where: { audience: { in: ['ALL', 'STUDENTS'] } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { author: { select: { name: true, role: true } } }
    })

    if (!student) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Student Profile Not Found</h1>
                    <p className="text-gray-400 mt-2">Please contact the administrator to set up your profile.</p>
                    <Link href="/login" className="mt-4 inline-block">
                        <Button variant="outline">Back to Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Calculate statistics
    const currentTermWeights = student.grades.filter(g => g.term === (student.termResults[0]?.term || 1))
    const averageScore = currentTermWeights.length > 0
        ? Math.round(currentTermWeights.reduce((acc, curr) => acc + curr.total, 0) / currentTermWeights.length)
        : 0

    const latestResult = student.termResults[0]
    const classPosition = latestResult?.position || '-'

    // Prepare chart data (Subject performance for the current term)
    const chartData = currentTermWeights.map(g => ({
        name: g.subject.name,
        score: g.total
    }))

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-[#16a34a]">
            {/* Header */}
            <header className="bg-background/80 dark:bg-black/30 backdrop-blur-md border-b border-border dark:border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Student Dashboard</h1>
                            <p className="text-muted-foreground mt-1">Hello, {session.name} • {student.studentId} • {student.class.name}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="GPA / Average"
                        value={`${averageScore}%`}
                        icon={TrendingUp}
                    />
                    <StatsCard
                        title="Class Position"
                        value={classPosition}
                        icon={Award}
                    />
                    <StatsCard
                        title="Current Class"
                        value={student.class.name}
                        icon={GraduationCap}
                    />
                    <StatsCard
                        title="Subjects"
                        value={currentTermWeights.length}
                        icon={BookOpen}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Chart */}
                    <Card className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                Current Performance
                                <span className="text-xs text-gray-400 font-normal">Term {latestResult?.term || 1}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chartData.length > 0 ? (
                                <PerformanceChart data={chartData} />
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-gray-500">
                                    No performance data available for current term
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Access */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Quick Access</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/student/results">
                                <Button variant="secondary" className="w-full justify-between">
                                    View Detailed Results
                                    <TrendingUp className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/student/advisor">
                                <Button variant="primary" className="w-full justify-between shadow-lg shadow-maroon-500/20">
                                    AI Academic Advisor
                                    <TrendingUp className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full justify-between">
                                Download Report Card
                                <TrendingUp className="h-4 w-4" />
                            </Button>
                            <ComplaintModal />
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Learning Activities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AssignmentList role="STUDENT" />
                        </CardContent>
                    </Card>

                    {/* Announcements - Student View */}
                    <Card className="lg:col-span-1 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AnnouncementFeed announcements={announcements} />
                        </CardContent>
                    </Card>

                    {/* Subject Breakdown */}
                    <Card className="lg:col-span-3 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Current Term Grades</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentTermWeights.map((grade) => (
                                    <div
                                        key={grade.id}
                                        className="p-4 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-medium">{grade.subject.name}</p>
                                                <p className="text-xs text-gray-400">{grade.subject.code}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${grade.grade === 'A' ? 'bg-green-500/20 text-green-400' :
                                                grade.grade === 'F' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-[#facc15]/20 text-[#facc15]'
                                                }`}>
                                                Grade: {grade.grade}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                            <div className="bg-black/40 p-1.5 rounded">
                                                <p className="text-[10px] text-gray-500 uppercase">CA1</p>
                                                <p className="text-white font-semibold">{grade.ca1}</p>
                                            </div>
                                            <div className="bg-black/40 p-1.5 rounded">
                                                <p className="text-[10px] text-gray-500 uppercase">CA2</p>
                                                <p className="text-white font-semibold">{grade.ca2}</p>
                                            </div>
                                            <div className="bg-black/40 p-1.5 rounded">
                                                <p className="text-[10px] text-gray-500 uppercase">Exam</p>
                                                <p className="text-white font-semibold">{grade.exam}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-400">Total Score</span>
                                                <span className="text-white font-bold">{grade.total}%</span>
                                            </div>
                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#16a34a] to-[#facc15]"
                                                    style={{ width: `${grade.total}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {currentTermWeights.length === 0 && (
                                    <div className="col-span-full py-10 text-center text-gray-500">
                                        No grades found for the current term.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main >
        </div >
    )
}

