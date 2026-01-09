'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Send, Sparkles, Loader2, Bot, User } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function AIAdvisorPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your AI Academic Advisor. How can I help you with your studies today?" }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setLoading(true)

        try {
            const response = await fetch('/api/ai/advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMessage })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Failed to get advice')

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#16a34a] p-4 md:p-8">
            <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)]">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/student/dashboard">
                        <Button variant="ghost" className="text-white hover:text-[#facc15]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#facc15]" />
                        <h1 className="text-xl font-bold text-white">Academic Advisor</h1>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b border-white/10 bg-white/5">
                        <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                            <Bot className="h-4 w-4 text-[#facc15]" />
                            Powered by Google Gemini
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user'
                                    ? 'bg-[#16a34a] text-white rounded-tr-none'
                                    : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/10'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-[#facc15]" />}
                                        <span className="text-[10px] uppercase tracking-wider font-bold">
                                            {m.role === 'user' ? 'You' : 'Advisor'}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/10 text-gray-200 p-4 rounded-2xl rounded-tl-none border border-white/10">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#facc15]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    <div className="p-4 border-t border-white/10 bg-black/60">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
                                placeholder="Ask about study tips, grades, or career advice..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                size="sm"
                                disabled={loading || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    )
}

