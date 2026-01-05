'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload } from 'lucide-react'

interface SubmitAssignmentModalProps {
    assignmentId: string
    assignmentTitle: string
}

export function SubmitAssignmentModal({ assignmentId, assignmentTitle }: SubmitAssignmentModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const content = formData.get('content')

        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activityId: assignmentId, content })
            })

            if (res.ok) {
                setOpen(false)
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to submit assignment:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="primary" size="sm">
                    Submit Work
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Submit Work: {assignmentTitle}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Submission Content</label>
                        <p className="text-xs text-gray-500 mb-2">Paste your work, links to documents, or a summary below.</p>
                        <Textarea
                            name="content"
                            placeholder="Type your submission here..."
                            required
                            className="bg-white/5 border-white/10 h-48 focus:ring-[#1e40af]"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Submit Assignment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

