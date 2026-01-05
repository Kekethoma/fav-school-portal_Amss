'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface GradeSubmissionModalProps {
    submission: any
    assignmentPoints: number
    onSuccess: () => void
}

export function GradeSubmissionModal({ submission, assignmentPoints, onSuccess }: GradeSubmissionModalProps) {
    const [loading, setLoading] = useState(false)
    const [grade, setGrade] = useState(submission.grade || '')
    const [feedback, setFeedback] = useState(submission.feedback || '')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/submissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId: submission.id,
                    grade: parseFloat(grade),
                    feedback
                })
            })

            if (res.ok) {
                onSuccess()
            }
        } catch (error) {
            console.error('Grading Error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-center">
                <h4 className="text-white font-medium">Grade Submission</h4>
                <span className="text-xs text-gray-500">Max Points: {assignmentPoints}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Score</label>
                    <Input
                        type="number"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="0.0"
                        required
                        className="bg-black/50"
                    />
                </div>
                <div className="flex items-end">
                    <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Grade'}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-400">Feedback</label>
                <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    className="bg-black/50 h-20"
                />
            </div>
        </form>
    )
}

