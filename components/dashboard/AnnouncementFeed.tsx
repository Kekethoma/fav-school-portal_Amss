'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Bell, Megaphone, MessageCircle, Send, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Comment {
    id: string
    content: string
    createdAt: string
    user: {
        name: string
        role: string
    }
}

interface Announcement {
    id: string
    title: string
    content: string
    audience: string
    createdAt: string
    author: {
        name: string
        role: string
    }
}

export function AnnouncementFeed({ announcements }: { announcements: Announcement[] }) {
    const [expandedComments, setExpandedComments] = useState<string | null>(null)

    if (announcements.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No active announcements</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {announcements.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#facc15]/30 transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-[#facc15]" />
                            <h4 className="font-bold text-white">{item.title}</h4>
                        </div>
                        <span className="text-xs text-gray-500">
                            {format(new Date(item.createdAt), 'MMM d, yyyy')}
                        </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        {item.content}
                    </p>
                    <div className="flex justify-between items-center text-xs mb-4">
                        <span className={`px-2 py-0.5 rounded-full bg-white/10 ${item.audience === 'ALL' ? 'text-green-400' :
                            item.audience === 'TEACHERS' ? 'text-blue-400' : 'text-purple-400'
                            }`}>
                            {item.audience}
                        </span>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>Posted by {item.author.name}</span>
                            <button
                                onClick={() => setExpandedComments(expandedComments === item.id ? null : item.id)}
                                className="flex items-center gap-1 hover:text-[#facc15] transition-colors ml-4"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Comments
                            </button>
                        </div>
                    </div>

                    {expandedComments === item.id && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                            <CommentSection announcementId={item.id} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

function CommentSection({ announcementId }: { announcementId: string }) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [posting, setPosting] = useState(false)

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/announcements/${announcementId}/comments`)
            if (res.ok) {
                const data = await res.json()
                setComments(data)
            }
        } catch (error) {
            console.error('Fetch comments error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [announcementId])

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setPosting(true)
        try {
            const res = await fetch(`/api/announcements/${announcementId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            })
            if (res.ok) {
                const comment = await res.json()
                setComments([...comments, comment])
                setNewComment('')
            }
        } catch (error) {
            console.error('Post comment error:', error)
        } finally {
            setPosting(false)
        }
    }

    if (loading) return <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-gray-500" /></div>

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {comments.length === 0 ? (
                    <p className="text-xs text-gray-600 italic">No comments yet. Be the first to reply!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 items-start">
                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <User className="h-3 w-3 text-gray-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-300">{comment.user.name}</span>
                                    <span className="text-[10px] text-gray-600">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                                </div>
                                <p className="text-xs text-gray-400">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
                <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="h-8 text-xs bg-black/40 border-white/10"
                    disabled={posting}
                />
                <Button
                    type="submit"
                    size="sm"
                    className="h-8 w-8 p-0 flex items-center justify-center bg-[#16a34a] hover:bg-[#1d4ed8]"
                    disabled={posting || !newComment.trim()}
                >
                    {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                </Button>
            </form>
        </div>
    )
}

