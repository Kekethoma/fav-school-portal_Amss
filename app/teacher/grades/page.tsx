'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Search, Save, AlertCircle, Loader2, CheckCircle2, ClipboardList } from 'lucide-react'
import Link from 'next/link'

interface Assignment {
    id: string
    classId: string
    subjectId: string
    academicYearId: string
    class: { name: string; section: string }
    subject: { name: string }
    academicYear: { name: string; isCurrent: boolean }
}

interface StudentGrade {
    studentId: string
    studentName: string
    ca1: number
    ca2: number
    exam: number
    total: number
    grade: string
    isSaved: boolean
}

export default function GradeEntryPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [selectedAssignment, setSelectedAssignment] = useState<string>('')
    const [term, setTerm] = useState<string>('1')
    const [students, setStudents] = useState<StudentGrade[]>([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/teachers/assignments')
            if (!response.ok) throw new Error('Failed to fetch assignments')
            const data = await response.json()
            setAssignments(data.assignments || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchStudentsForGrading = async () => {
        if (!selectedAssignment) return

        setLoading(true)
        setError('')
        setSuccess('')

        const assignment = assignments.find(a => a.id === selectedAssignment)
        if (!assignment) return

        try {
            // First fetch students in the class
            const studentsResponse = await fetch(`/api/students?classId=${assignment.classId}`)
            const studentsData = await studentsResponse.json()

            // Then fetch existing grades if any
            const gradesResponse = await fetch(
                `/api/grades?classId=${assignment.classId}&subjectId=${assignment.subjectId}&academicYearId=${assignment.academicYearId}&term=${term}`
            )
            const gradesData = await gradesResponse.json()

            const gradeMap = new Map(gradesData.grades?.map((g: any) => [g.studentId, g]) || [])

            const studentGrades = studentsData.students.map((s: any) => {
                const existing = gradeMap.get(s.id) as any
                return {
                    studentId: s.id,
                    studentName: s.user.name,
                    ca1: existing?.ca1 || 0,
                    ca2: existing?.ca2 || 0,
                    exam: existing?.exam || 0,
                    total: existing?.total || 0,
                    grade: existing?.grade || '-',
                    isSaved: !!existing
                }
            })

            setStudents(studentGrades)
        } catch (err: any) {
            setError('Failed to load students for grading')
        } finally {
            setLoading(false)
        }
    }

    const handleGradeChange = (studentId: string, field: 'ca1' | 'ca2' | 'exam', value: string) => {
        const numValue = parseFloat(value) || 0

        setStudents(prev => prev.map(s => {
            if (s.studentId !== studentId) return s

            const updated = { ...s, [field]: numValue }
            updated.total = updated.ca1 + updated.ca2 + updated.exam

            // Basic grade calc preview
            if (updated.total >= 80) updated.grade = 'A'
            else if (updated.total >= 70) updated.grade = 'B'
            else if (updated.total >= 60) updated.grade = 'C'
            else if (updated.total >= 50) updated.grade = 'D'
            else if (updated.total >= 40) updated.grade = 'E'
            else updated.grade = 'F'

            updated.isSaved = false
            return updated
        }))
    }

    const saveAllGrades = async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        const assignment = assignments.find(a => a.id === selectedAssignment)
        if (!assignment) return

        try {
            const unsavedStudents = students.filter(s => !s.isSaved)

            if (unsavedStudents.length === 0) {
                setSuccess('All grades already saved')
                return
            }

            for (const s of unsavedStudents) {
                const response = await fetch('/api/grades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentId: s.studentId,
                        subjectId: assignment.subjectId,
                        classId: assignment.classId,
                        academicYearId: assignment.academicYearId,
                        term: parseInt(term),
                        ca1: s.ca1,
                        ca2: s.ca2,
                        exam: s.exam
                    })
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || `Failed to save grade for ${s.studentName}`)
                }
            }

            setSuccess('All grades saved successfully!')
            setStudents(prev => prev.map(s => ({ ...s, isSaved: true })))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading && assignments.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#60a5fa] animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#1e40af] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/teacher/dashboard">
                        <Button variant="ghost" className="text-white hover:text-[#60a5fa]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Grade Entry</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters */}
                    <Card className="lg:col-span-1 border-white/10 bg-black/40 backdrop-blur-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg text-[#60a5fa]">Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Class & Subject</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:ring-2 focus:ring-[#1e40af] outline-none"
                                    value={selectedAssignment}
                                    onChange={(e) => setSelectedAssignment(e.target.value)}
                                >
                                    <option value="" className="bg-gray-900">Select...</option>
                                    {assignments.map((a) => (
                                        <option key={a.id} value={a.id} className="bg-gray-900">
                                            {a.class.name} - {a.subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Term</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:ring-2 focus:ring-[#1e40af] outline-none"
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                >
                                    <option value="1" className="bg-gray-900">Term 1</option>
                                    <option value="2" className="bg-gray-900">Term 2</option>
                                    <option value="3" className="bg-gray-900">Term 3</option>
                                </select>
                            </div>

                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={fetchStudentsForGrading}
                                disabled={!selectedAssignment || loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                                Load Students
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Grade Table */}
                    <Card className="lg:col-span-3 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white">Student List</CardTitle>
                            {students.length > 0 && (
                                <Button
                                    variant="primary"
                                    onClick={saveAllGrades}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save All
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-200 text-sm">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center text-green-200 text-sm">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {success}
                                </div>
                            )}

                            {students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-gray-400 text-sm">
                                                <th className="py-3 px-2">Student Name</th>
                                                <th className="py-3 px-2 w-20 text-center">CA1 (20)</th>
                                                <th className="py-3 px-2 w-20 text-center">CA2 (20)</th>
                                                <th className="py-3 px-2 w-20 text-center">Exam (60)</th>
                                                <th className="py-3 px-2 w-20 text-center">Total</th>
                                                <th className="py-3 px-2 w-16 text-center">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {students.map((s) => (
                                                <tr key={s.studentId} className="group hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-2">
                                                        <div className="flex items-center">
                                                            <span className="text-white font-medium">{s.studentName}</span>
                                                            {s.isSaved && <span className="ml-2 text-green-500 text-[10px] bg-green-500/10 px-1.5 py-0.5 rounded">Saved</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <input
                                                            type="number"
                                                            max="20"
                                                            min="0"
                                                            className="w-16 bg-white/5 border border-white/10 rounded p-1 text-center text-white focus:ring-1 focus:ring-[#60a5fa] outline-none"
                                                            value={s.ca1}
                                                            onChange={(e) => handleGradeChange(s.studentId, 'ca1', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <input
                                                            type="number"
                                                            max="20"
                                                            min="0"
                                                            className="w-16 bg-white/5 border border-white/10 rounded p-1 text-center text-white focus:ring-1 focus:ring-[#60a5fa] outline-none"
                                                            value={s.ca2}
                                                            onChange={(e) => handleGradeChange(s.studentId, 'ca2', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="py-4 px-2">
                                                        <input
                                                            type="number"
                                                            max="60"
                                                            min="0"
                                                            className="w-16 bg-white/5 border border-white/10 rounded p-1 text-center text-white focus:ring-1 focus:ring-[#60a5fa] outline-none"
                                                            value={s.exam}
                                                            onChange={(e) => handleGradeChange(s.studentId, 'exam', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="py-4 px-2 text-center text-white font-bold">
                                                        {s.total}
                                                    </td>
                                                    <td className="py-4 px-2 text-center">
                                                        <span className={`font-bold ${s.grade === 'A' ? 'text-green-400' :
                                                            s.grade === 'B' ? 'text-blue-400' :
                                                                s.grade === 'F' ? 'text-red-400' : 'text-[#60a5fa]'
                                                            }`}>
                                                            {s.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 text-center text-gray-500">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Select a class and subject to load students</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

