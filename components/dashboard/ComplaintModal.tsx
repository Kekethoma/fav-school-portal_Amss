'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Send, Loader2 } from 'lucide-react'

export function ComplaintModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            })
            setOpen(false)
            alert('Complaint filed successfully')
        } catch (error) {
            alert('Failed to file complaint')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    File Complaint
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[#facc15]">File a Complaint</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Issue Title</label>
                        <input
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#facc15] outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Grade discrepancy"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm h-32 resize-none focus:ring-1 focus:ring-[#facc15] outline-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your issue..."
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-[#16a34a] hover:bg-[#600018] text-white">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Complaint
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

