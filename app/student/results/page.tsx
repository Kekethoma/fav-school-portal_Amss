'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Award, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { generateReportCardPDF } from '@/lib/pdf-generator'

interface Grade {
    subject: { name: string }
    ca1: number
    ca2: number
    exam: number
    total: number
    grade: string
    remark: string
}

interface TermResult {
    term: number
    totalScore: number
    average: number
    position: number
    studentName: string
    studentId: string
    className: string
    academicYear: string
    grades: Grade[]
}

export default function ResultsViewPage() {
    const [results, setResults] = useState<TermResult[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch('/api/results/student') // We'll need this route
                if (res.ok) {
                    const data = await res.json()
                    setResults(data.results || [])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchResults()
    }, [])

    const handleDownload = (res: TermResult) => {
        generateReportCardPDF({
            studentName: res.studentName,
            studentId: res.studentId,
            className: res.className,
            term: res.term,
            academicYear: res.academicYear,
            grades: res.grades.map(g => ({
                subject: g.subject.name,
                ca1: g.ca1,
                ca2: g.ca2,
                exam: g.exam,
                total: g.total,
                grade: g.grade,
                remark: g.remark
            })),
            average: res.average,
            position: res.position
        })
    }

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#60a5fa] animate-spin" />
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#1e40af] p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/student/dashboard">
                        <Button variant="ghost" className="text-white hover:text-[#60a5fa]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Academic Results</h1>
                </div>

                <div className="space-y-8">
                    {results.length > 0 ? (
                        results.map((res) => (
                            <Card key={res.term} className="border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="bg-white/5 border-b border-white/10 py-6">
                                    <div className="flex justify-between items-center text-white">
                                        <CardTitle className="text-xl">Term {res.term} Report Summary</CardTitle>
                                        <Button variant="outline" size="sm" onClick={() => handleDownload(res)}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Report Card
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <TrendingUp className="h-8 w-8 text-[#60a5fa] mx-auto mb-4" />
                                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Average Score</p>
                                            <p className="text-4xl font-bold text-white">{res.average.toFixed(1)}%</p>
                                        </div>
                                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <Award className="h-8 w-8 text-white mx-auto mb-4" />
                                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Class Position</p>
                                            <p className="text-4xl font-bold text-[#60a5fa]">{res.position}</p>
                                        </div>
                                        <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5">
                                            <TrendingUp className="h-8 w-8 text-[#1e40af] mx-auto mb-4" />
                                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Points</p>
                                            <p className="text-4xl font-bold text-white">{res.totalScore}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start text-yellow-200">
                                        <AlertCircle className="h-5 w-5 mr-3 mt-0.5" />
                                        <p className="text-sm">
                                            Official report card is subject to verification by the administration.
                                            Contact your class teacher for any discrepancies in the scores.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-black/40 border border-white/10 rounded-2xl">
                            <Award className="h-16 w-16 text-gray-700 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
                            <p className="text-gray-500">Your results for the current academic year haven&apos;t been published yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

