'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'

export function CreateAssignmentModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [subjects, setSubjects] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])

    useEffect(() => {
        if (open) {
            // In a real app, fetch from specific teacher assignments API
            fetch('/api/classes').then(res => res.json()).then(setClasses)
            // Mock subjects until we have a proper teacher-specific assignments API
            setSubjects([
                { id: 'math', name: 'Mathematics' },
                { id: 'english', name: 'English Language' },
                { id: 'integrated-science', name: 'Integrated Science' }
            ])
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        try {
            const res = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (res.ok) {
                setOpen(false)
                window.location.reload()
            }
        } catch (error) {
            console.error('Failed to create assignment:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="primary" className="flex gap-2">
                    <Plus className="h-4 w-4" />
                    New Assignment
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input name="title" placeholder="e.g., Term 1 Science Lab Report" required className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea name="description" placeholder="Provide instructions for the students..." required className="bg-white/5 border-white/10 h-32" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input name="dueDate" type="datetime-local" required className="bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Total Points</label>
                            <Input name="points" type="number" defaultValue="100" required className="bg-white/5 border-white/10" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Class</label>
                            <select name="classId" required className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white">
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <select name="subjectId" required className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white">
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Create Assignment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

