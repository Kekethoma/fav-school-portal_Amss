'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, Calendar, Users, Save } from 'lucide-react'

interface Student {
    id: string
    studentId: string
    user: { name: string }
}



export default function AttendancePage() {
    const [classes, setClasses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState('')
    const [students, setStudents] = useState<Student[]>([])
    const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({})
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            const res = await fetch('/api/teachers/assignments')
            const data = await res.json()
            const uniqueClasses = Array.from(new Set(data.assignments?.map((a: any) => JSON.stringify(a.class)) || []))
                .map((c: any) => JSON.parse(c))
            setClasses(uniqueClasses)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadStudents = async (classId: string) => {
        setSelectedClass(classId)
        setLoading(true)
        try {
            const stuRes = await fetch(`/api/students?classId=${classId}`)
            const stuData = await stuRes.json()
            const fetchedStudents = stuData.students || []
            setStudents(fetchedStudents)

            // Initialize attendance
            const initialAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {}
            fetchedStudents.forEach((s: Student) => initialAttendance[s.id] = 'PRESENT')

            // Try load existing attendance for this date
            const attRes = await fetch(`/api/attendance?classId=${classId}&date=${date}`)
            if (attRes.ok) {
                const attData = await attRes.json()
                attData.attendance.forEach((rec: any) => {
                    initialAttendance[rec.studentId] = rec.status
                })
            }
            setAttendance(initialAttendance)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        setAttendance(prev => ({ ...prev, [studentId]: status }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status
            }))

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId: selectedClass, date, attendanceData })
            })

            if (!res.ok) throw new Error('Save failed')
            alert('Attendance saved successfully')
        } catch (err) {
            alert('Failed to save attendance')
        } finally {
            setSaving(false)
        }
    }

    if (loading && !selectedClass) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#facc15] animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#16a34a] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/teacher/dashboard">
                        <Button variant="ghost" className="text-white hover:text-[#facc15]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-white" />
                        <h1 className="text-2xl font-bold text-white">Attendance Tracking</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Controls */}
                    <Card className="lg:col-span-1 border-white/10 bg-black/40 backdrop-blur-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-white text-sm uppercase tracking-wider">Session Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">DATE</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-1 focus:ring-[#facc15]"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2">SELECT CLASS</label>
                                <div className="space-y-2">
                                    {classes.map(c => (
                                        <button
                                            key={c.id}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${selectedClass === c.id
                                                ? 'bg-[#16a34a]/30 border-[#facc15] text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                            onClick={() => loadStudents(c.id)}
                                        >
                                            <p className="font-bold">{c.name}</p>
                                            <p className="text-[10px] opacity-70">{c.section}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {selectedClass && (
                                <Button className="w-full mt-4" variant="secondary" onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Attendance
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Student List */}
                    <div className="lg:col-span-3">
                        {selectedClass ? (
                            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                                <CardHeader className="border-b border-white/10">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-white">Marker Roll</CardTitle>
                                        <div className="flex gap-4 text-xs">
                                            <span className="flex items-center text-green-400">
                                                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                                                Present: {Object.values(attendance).filter(v => v === 'PRESENT').length}
                                            </span>
                                            <span className="flex items-center text-red-500">
                                                <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                                                Absent: {Object.values(attendance).filter(v => v === 'ABSENT').length}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {students.map(s => (
                                                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-white font-medium">{s.user.name}</p>
                                                        <p className="text-[10px] text-gray-500">{s.studentId}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleStatusChange(s.id, 'PRESENT')}
                                                                className={`p-2 rounded-lg transition-all ${attendance[s.id] === 'PRESENT' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/5 text-gray-600 hover:text-gray-400'}`}
                                                                title="Present"
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(s.id, 'ABSENT')}
                                                                className={`p-2 rounded-lg transition-all ${attendance[s.id] === 'ABSENT' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/5 text-gray-600 hover:text-gray-400'}`}
                                                                title="Absent"
                                                            >
                                                                <XCircle className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(s.id, 'LATE')}
                                                                className={`p-2 rounded-lg transition-all ${attendance[s.id] === 'LATE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/5 text-gray-600 hover:text-gray-400'}`}
                                                                title="Late"
                                                            >
                                                                <Clock className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-[400px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-600">
                                <Calendar className="h-12 w-12 mb-4 opacity-20" />
                                <p>Select a class from the left to start marking attendance.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

