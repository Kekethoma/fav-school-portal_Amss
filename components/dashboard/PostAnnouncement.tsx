'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Megaphone, Loader2, Send } from 'lucide-react'

export function PostAnnouncement() {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [audience, setAudience] = useState('ALL')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, audience })
            })
            setTitle('')
            setContent('')
            alert('Announcement posted')
        } catch (error) {
            alert('Failed to post')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                    <Megaphone className="h-5 w-5 text-[#60a5fa]" />
                    Post Announcement
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#60a5fa] outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                    />
                    <textarea
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white h-24 resize-none focus:ring-1 focus:ring-[#60a5fa] outline-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Message content..."
                    />
                    <div className="flex gap-2">
                        <select
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#60a5fa] outline-none [&>option]:bg-black"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                        >
                            <option value="ALL">Everyone</option>
                            <option value="TEACHERS">Teachers Only</option>
                            <option value="STUDENTS">Students Only</option>
                        </select>
                        <Button type="submit" disabled={loading} className="flex-1 bg-[#1e40af] hover:bg-[#600018] text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Post
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

