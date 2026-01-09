'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, FileText, CheckCircle2, Clock, User } from 'lucide-react'
import { GradeSubmissionModal } from '@/components/dashboard/GradeSubmissionModal'
import { format } from 'date-fns'

export default function AssignmentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [submissions, setSubmissions] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [assignment, setAssignment] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchDetails = async () => {
        try {
            const res = await fetch(`/api/submissions?assignmentId=${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setSubmissions(data.submissions)
                setStudents(data.students)
                setAssignment(data.assignment)
            }
        } catch (error) {
            console.error('Failed to fetch details:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDetails()
    }, [params.id])

    if (loading) return <div className="p-8 text-white">Loading details...</div>
    if (!assignment) return <div className="p-8 text-white">Assignment not found.</div>

    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <Button variant="outline" onClick={() => router.back()} className="flex gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back to Dashboard
                </Button>

                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white">{assignment.title}</h1>
                        <p className="text-gray-400">{assignment.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                            <span>Due: {format(new Date(assignment.dueDate), 'PPP p')}</span>
                            <span>Points: {assignment.points}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-white/5 border-white/10 p-4 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Submissions</p>
                            <p className="text-2xl font-bold text-white">{submissions.length} / {students.length}</p>
                        </Card>
                        <Card className="bg-white/5 border-white/10 p-4 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Graded</p>
                            <p className="text-2xl font-bold text-green-500">
                                {submissions.filter(s => s.status === 'GRADED').length}
                            </p>
                        </Card>
                        <Card className="bg-white/5 border-white/10 p-4 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Missing</p>
                            <p className="text-2xl font-bold text-red-500">
                                {students.length - submissions.length}
                            </p>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <h2 className="text-xl font-semibold text-white">Student Roster</h2>
                    {students.map((student) => {
                        const submission = submissions.find(s => s.studentId === student.id)

                        return (
                            <Card key={student.id} className="bg-black/40 border-white/10 overflow-hidden shadow-xl">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <div className="p-6 border-b md:border-b-0 md:border-r border-white/10 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[#16a34a]/20 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-[#16a34a]" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{student.user.name}</p>
                                                    {submission ? (
                                                        <p className="text-xs text-green-500 flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Submitted {format(new Date(submission.submittedAt), 'MMM d, h:mm a')}
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Not Submitted
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {submission && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] uppercase text-gray-600 font-bold tracking-wider">Submission Content</p>
                                                    <div className="p-4 bg-black/60 rounded border border-white/5 text-gray-300 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                                                        {submission.content}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 bg-white/[0.02]">
                                            {submission ? (
                                                <GradeSubmissionModal
                                                    submission={submission}
                                                    assignmentPoints={assignment.points}
                                                    onSuccess={fetchDetails}
                                                />
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4 border-2 border-dashed border-white/5 rounded-lg">
                                                    <p className="text-sm">Waiting for submission</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>

    )
}
