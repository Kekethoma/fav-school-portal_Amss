'use client'

import { useState, useEffect } from 'react'
import { Bell, BellDot, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error('Fetch notifications error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id })
            })
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            }
        } catch (err) {
            console.error('Mark read error:', err)
        }
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-white hover:bg-white/10 p-2"
            >
                {unreadCount > 0 ? (
                    <>
                        <BellDot className="h-5 w-5 text-[#facc15] animate-pulse" />
                        <span className="absolute top-1 right-1 h-3 w-3 bg-red-600 rounded-full border-2 border-black text-[8px] flex items-center justify-center font-bold">
                            {unreadCount}
                        </span>
                    </>
                ) : (
                    <Bell className="h-5 w-5 text-gray-400" />
                )}
            </Button>

            {isOpen && (
                <Card className="absolute right-0 mt-2 w-80 bg-black/90 border-white/10 backdrop-blur-xl shadow-2xl z-50">
                    <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-white">Notifications</CardTitle>
                        <button onClick={() => setIsOpen(false)}><X className="h-4 w-4 text-gray-500 hover:text-white" /></button>
                    </CardHeader>
                    <CardContent className="p-0 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-4 w-4 animate-spin text-gray-500" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-600 text-xs">No notifications yet</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className={`p-4 cursor-pointer transition-colors ${n.isRead ? 'bg-transparent' : 'bg-[#facc15]/5 hover:bg-[#facc15]/10'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className={`text-xs font-bold ${n.isRead ? 'text-gray-400' : 'text-white'}`}>{n.title}</h5>
                                            <span className="text-[10px] text-gray-600">{format(new Date(n.createdAt), 'MMM d')}</span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 line-clamp-2">{n.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

