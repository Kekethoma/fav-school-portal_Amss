'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface Assignment {
    id: string
    title: string
    description: string
    dueDate: string
    subject: { name: string }
    submissions?: any[]
    points: number
}

interface AssignmentListProps {
    role: 'STUDENT' | 'TEACHER'
    classId?: string
}

export function AssignmentList({ role, classId }: AssignmentListProps) {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAssignments() {
            try {
                const url = classId ? `/api/assignments?classId=${classId}` : '/api/assignments'
                const res = await fetch(url)
                if (res.ok) {
                    const data = await res.json()
                    setAssignments(data)
                }
            } catch (error) {
                console.error('Failed to fetch assignments:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAssignments()
    }, [classId])

    if (loading) return <div className="text-gray-400">Loading assignments...</div>

    return (
        <div className="space-y-4">
            {assignments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No assignments found.</p>
            ) : (
                assignments.map((assignment) => {
                    const isSubmitted = role === 'STUDENT' && Boolean(assignment.submissions?.length && assignment.submissions.length > 0)
                    const submission = isSubmitted ? assignment.submissions![0] : null

                    return (
                        <Card key={assignment.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                            {assignment.title}
                                            {isSubmitted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-1">{assignment.description}</p>
                                        <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3 w-3" />
                                                {assignment.subject.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Due: {format(new Date(assignment.dueDate), 'MMM d, h:mm a')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {assignment.points} Points
                                            </span>
                                        </div>
                                    </div>
                                    {role === 'STUDENT' ? (
                                        <Button
                                            variant={isSubmitted ? "outline" : "primary"}
                                            size="sm"
                                            disabled={isSubmitted && submission.status === 'GRADED'}
                                        >
                                            {isSubmitted ? 'View Submission' : 'Submit'}
                                        </Button>
                                    ) : (
                                        <Link href={`/teacher/assignments/${assignment.id}`}>
                                            <Button variant="secondary" size="sm">
                                                View Submissions
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                                {isSubmitted && submission.grade !== null && (
                                    <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                                        <p className="text-green-400 font-medium">Grade: {submission.grade} / {assignment.points}</p>
                                        {submission.feedback && <p className="text-gray-400 mt-1 italic">"{submission.feedback}"</p>}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })
            )}
        </div>
    )
}

