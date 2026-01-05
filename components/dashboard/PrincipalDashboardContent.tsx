'use client'

import { redirect, useRouter } from 'next/navigation'
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PostAnnouncement } from '@/components/dashboard/PostAnnouncement'
import { AnnouncementFeed } from '@/components/dashboard/AnnouncementFeed'
import { ResolveComplaintButton } from '@/components/dashboard/ResolveComplaintButton'
import { GradeApprovalList } from '@/components/dashboard/GradeApprovalList'
import { NotificationBell } from '@/components/dashboard/NotificationBell'
import { Bell, AlertTriangle, CheckCircle, FileCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AcademicControls } from '@/components/dashboard/AcademicControls'

export function PrincipalDashboardContent({ session, stats, recentGrades, announcements, complaints }: any) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-[#1e40af]">
            <header className="bg-background/80 dark:bg-black/30 backdrop-blur-md border-b border-border dark:border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Principal Dashboard</h1>
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard title="Total Students" value={stats.studentCount} icon={GraduationCap} />
                    <StatsCard title="Total Teachers" value={stats.teacherCount} icon={Users} />
                    <StatsCard title="Subjects" value={stats.subjectCount} icon={BookOpen} />
                    <StatsCard title="Classes" value={stats.classCount} icon={TrendingUp} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <Card className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-white">Quick Actions</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Link href="/principal/students/register"><Button variant="primary" className="w-full">Register Student</Button></Link>
                                <Link href="/principal/teachers/register"><Button variant="primary" className="w-full">Register Teacher</Button></Link>
                                <Link href="/principal/reports"><Button variant="outline" className="w-full border-[#60a5fa] text-[#60a5fa] hover:bg-[#60a5fa]/10 font-bold">Advanced Reports</Button></Link>
                                <Link href="/principal/audit"><Button variant="outline" className="w-full">Audit Logs</Button></Link>
                            </div>
                        </CardContent>
                    </Card>
                    <AcademicControls />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card className="bg-black/40 border-white/10">
                        <CardHeader><CardTitle className="text-white">Recent Certified Grades</CardTitle></CardHeader>
                        <CardContent>
                            {recentGrades.length > 0 ? (
                                <div className="space-y-4">
                                    {recentGrades.map((grade: any) => (
                                        <div key={grade.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                            <div>
                                                <p className="text-white font-medium">{grade.student.user.name}</p>
                                                <p className="text-gray-400 text-sm">{grade.subject.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#60a5fa] font-bold text-lg">{grade.total}%</p>
                                                <p className="text-gray-400 text-sm">Grade: {grade.grade}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p className="text-gray-400 text-center py-8">No recent grades</p>)}
                        </CardContent>
                    </Card>

                    <Card className="bg-black/40 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-green-500" />
                                Pending Approvals
                            </CardTitle>
                        </CardHeader>
                        <CardContent><GradeApprovalList /></CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 mb-8">
                    <div className="space-y-6">
                        <PostAnnouncement />
                        <Card className="bg-black/40 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-[#60a5fa]" /> Review Announcements
                                </CardTitle>
                            </CardHeader>
                            <CardContent><AnnouncementFeed announcements={announcements} /></CardContent>
                        </Card>
                    </div>

                    <Card className="bg-black/40 border-white/10 h-fit">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" /> Student & Teacher Complaints
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {complaints.length > 0 ? (
                                <div className="space-y-4">
                                    {complaints.map((c: any) => (
                                        <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-white font-bold text-sm">{c.title}</h4>
                                                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded-full">{c.status}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs mb-2 line-clamp-2">{c.description}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>From: {c.user.name} ({c.user.role})</span>
                                                <ResolveComplaintButton complaintId={c.id} onResolved={() => router.refresh()} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
                                    <p>No pending complaints</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

