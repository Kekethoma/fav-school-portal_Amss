'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Search, UserPlus, Loader2, Mail, GraduationCap } from 'lucide-react'

interface Student {
    id: string
    studentId: string
    department: string
    status: string
    user: { name: string; email: string }
    class: { name: string; section: string }
}

export default function StudentsListPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students')
            const data = await res.json()
            setStudents(data.students || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredStudents = students.filter(s =>
        s.user.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        s.class.name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#facc15] animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#16a34a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link href="/principal/dashboard">
                            <Button variant="ghost" className="text-white hover:text-[#facc15] mb-2 p-0">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Students Management</h1>
                    </div>
                    <Link href="/principal/students/register">
                        <Button variant="secondary">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register Student
                        </Button>
                    </Link>
                </div>

                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#16a34a] transition-all"
                        placeholder="Search by name, ID, or class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <Card key={student.id} className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-[#facc15]/50 transition-all group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-[#16a34a]/20 rounded-full flex items-center justify-center group-hover:bg-[#16a34a]/40 transition-colors">
                                        <GraduationCap className="h-6 w-6 text-[#16a34a]" />
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${student.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {student.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{student.user.name}</h3>
                                <p className="text-[#facc15] text-sm font-medium mb-4">{student.studentId}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-gray-400 text-sm">
                                        <Mail className="h-3 w-3 mr-2" />
                                        {student.user.email}
                                    </div>
                                    <div className="flex items-center text-gray-400 text-sm">
                                        <span className="font-bold text-xs mr-2 bg-white/10 px-1.5 py-0.5 rounded text-white">CLASS</span>
                                        {student.class.name} ({student.class.section})
                                    </div>
                                    <div className="flex items-center text-gray-400 text-sm">
                                        <span className="font-bold text-xs mr-2 bg-white/10 px-1.5 py-0.5 rounded text-white">DEPT</span>
                                        {student.department}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="w-full text-xs">View Profile</Button>
                                    <Button variant="ghost" size="sm" className="w-full text-xs">Edit</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredStudents.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500 italic">
                            No students found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

