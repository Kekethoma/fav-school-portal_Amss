'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Sparkles, Loader2, FileText, Download, Search } from 'lucide-react'

interface Student {
    id: string
    studentId: string
    user: { name: string }
    class: { name: string }
}

interface Report {
    id: string
    content: string
    createdAt: string
    student: { user: { name: string } }
}

export default function ProgressReportsPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedStudent, setSelectedStudent] = useState('')
    const [previewReport, setPreviewReport] = useState<Report | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch students and recent reports
            const [stuRes, reportRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/ai/progress-report/history') // Need this history route
            ])

            if (stuRes.ok) setStudents((await stuRes.json()).students || [])
            if (reportRes.ok) setReports((await reportRes.json()).reports || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async (stu: Student) => {
        setGenerating(true)
        setSelectedStudent(stu.id)
        try {
            // In a real app, these IDs would come from session/context
            const res = await fetch('/api/ai/progress-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: stu.id,
                    term: 1, // Defaulting to 1 for demo
                    academicYearId: 'current' // Handled by API
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setPreviewReport(data.report)
            setReports(prev => [data.report, ...prev])
        } catch (err: any) {
            alert(err.message || 'Failed to generate progress report')
        } finally {
            setGenerating(false)
            setSelectedStudent('')
        }
    }

    const filteredStudents = students.filter(s =>
        s.user.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#facc15] animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#16a34a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/teacher/dashboard">
                        <Button variant="ghost" className="text-white hover:text-[#facc15]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#facc15]" />
                        <h1 className="text-2xl font-bold text-white">AI Progress Reports</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Student Selection */}
                    <Card className="lg:col-span-1 border-white/10 bg-black/40 backdrop-blur-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-white">Select Student</CardTitle>
                            <div className="relative mt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white"
                                    placeholder="Search student..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
                            {filteredStudents.map(stu => (
                                <div
                                    key={stu.id}
                                    className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg group hover:border-[#facc15]/50 transition-all"
                                >
                                    <div>
                                        <p className="text-white font-medium text-sm">{stu.user.name}</p>
                                        <p className="text-[10px] text-gray-500">{stu.studentId} • {stu.class.name}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleGenerate(stu)}
                                        disabled={generating}
                                    >
                                        {generating && selectedStudent === stu.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Generate'}
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Report Preview & History */}
                    <div className="lg:col-span-2 space-y-6">
                        {previewReport ? (
                            <Card className="border-[#facc15]/30 bg-black/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
                                    <div>
                                        <CardTitle className="text-[#facc15]">Progress Report</CardTitle>
                                        <p className="text-xs text-gray-400 mt-1">{previewReport.student.user.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-1" /> PDF
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setPreviewReport(null)}>
                                            Close
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed prose prose-invert max-w-none">
                                        {previewReport.content}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Recent Reports</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {reports.map(report => (
                                            <div
                                                key={report.id}
                                                className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-[#facc15]/50 cursor-pointer transition-all"
                                                onClick={() => setPreviewReport(report)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-900/40 rounded flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{report.student.user.name}</p>
                                                        <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </div>
                                        ))}
                                        {reports.length === 0 && (
                                            <div className="py-20 text-center text-gray-500 italic">
                                                No progress reports generated yet.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

