'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Search, UserPlus, Loader2, Mail, BookOpen, User } from 'lucide-react'

interface Teacher {
    id: string
    teacherId: string
    user: { name: string; email: string }
    assignments: Array<{
        class: { name: string }
        subject: { name: string }
    }>
}

export default function TeachersListPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchTeachers()
    }, [])

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers')
            const data = await res.json()
            setTeachers(data.teachers || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredTeachers = teachers.filter(t =>
        t.user.name.toLowerCase().includes(search.toLowerCase()) ||
        t.teacherId.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#60a5fa] animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#1e40af] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link href="/principal/dashboard">
                            <Button variant="ghost" className="text-white hover:text-[#60a5fa] mb-2 p-0">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Teachers Management</h1>
                    </div>
                    <Link href="/principal/teachers/register">
                        <Button variant="secondary">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register Teacher
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#1e40af] transition-all"
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map((teacher) => (
                        <Card key={teacher.id} className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-[#60a5fa]/50 transition-all group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-[#60a5fa]/10 rounded-full flex items-center justify-center group-hover:bg-[#60a5fa]/20 transition-colors">
                                        <User className="h-6 w-6 text-[#60a5fa]" />
                                    </div>
                                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                        Faculty
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{teacher.user.name}</h3>
                                <p className="text-[#1e40af] font-bold text-sm mb-4">{teacher.teacherId}</p>

                                <div className="space-y-2 mb-6 text-sm text-gray-400">
                                    <div className="flex items-center">
                                        <Mail className="h-3 w-3 mr-2" />
                                        {teacher.user.email}
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-white text-xs font-bold mb-2 flex items-center">
                                            <BookOpen className="h-3 w-3 mr-2 text-[#60a5fa]" />
                                            CURRENT ASSIGNMENTS ({teacher.assignments.length})
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.assignments.length > 0 ? (
                                                Array.from(new Set(teacher.assignments.map(a => a.subject.name))).slice(0, 3).map(sub => (
                                                    <span key={sub} className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px]">
                                                        {sub}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-600 italic text-[10px]">No subjects assigned</span>
                                            )}
                                            {teacher.assignments.length > 3 && <span className="text-[10px] text-gray-500">+{teacher.assignments.length - 3} more</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="w-full text-xs">Profile</Button>
                                    <Button variant="ghost" size="sm" className="w-full text-xs text-red-400 hover:text-red-300">Suspend</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

