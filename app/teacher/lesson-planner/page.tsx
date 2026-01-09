'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Sparkles, Loader2, BookOpen, Download, FileText, Plus } from 'lucide-react'

interface Subject {
    id: string
    name: string
}

interface LessonPlan {
    id: string
    topic: string
    content: string
    createdAt: string
    subject: { name: string }
}

export default function LessonPlannerPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [plans, setPlans] = useState<LessonPlan[]>([])
    const [selectedSubject, setSelectedSubject] = useState('')
    const [topic, setTopic] = useState('')
    const [generating, setGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [previewPlan, setPreviewPlan] = useState<LessonPlan | null>(null)

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        try {
            // In a real app, these would be separate calls or combined
            const subRes = await fetch('/api/teachers/assignments')
            const subData = await subRes.json()

            // Extract unique subjects
            const uniqueSubjects = Array.from(new Set(subData.assignments?.map((a: any) => JSON.stringify(a.subject)) || []))
                .map((s: any) => JSON.parse(s))
            setSubjects(uniqueSubjects)

            // Fetch existing plans
            const plansRes = await fetch('/api/ai/lesson-plan/history') // We'll need this route
            if (plansRes.ok) {
                const plansData = await plansRes.json()
                setPlans(plansData.plans || [])
            }
        } catch (err) {
            console.error('Failed to load data', err)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSubject || !topic || generating) return

        setGenerating(true)
        try {
            const res = await fetch('/api/ai/lesson-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectId: selectedSubject, topic })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setPreviewPlan(data.lessonPlan)
            setPlans(prev => [data.lessonPlan, ...prev])
            setTopic('')
        } catch (err) {
            alert('Failed to generate lesson plan')
        } finally {
            setGenerating(false)
        }
    }

    if (loading) return (
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
                        <Sparkles className="h-5 w-5 text-[#facc15]" />
                        <h1 className="text-2xl font-bold text-white">AI Lesson Planner</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Generator Form */}
                    <Card className="lg:col-span-1 border-white/10 bg-black/40 backdrop-blur-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-white">Generate Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-[#16a34a]"
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        required
                                    >
                                        <option value="" className="bg-gray-900">Select Subject</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Topic / Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-[#16a34a]"
                                        placeholder="e.g. Introduction to Photosynthesis"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    className="w-full mt-2"
                                    variant="secondary"
                                    type="submit"
                                    disabled={generating}
                                >
                                    {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Create Lesson Plan
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Preview or History */}
                    <div className="lg:col-span-2 space-y-6">
                        {previewPlan ? (
                            <Card className="border-[#facc15]/30 bg-black/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
                                    <div>
                                        <CardTitle className="text-[#facc15]">{previewPlan.topic}</CardTitle>
                                        <p className="text-xs text-gray-400 mt-1">{previewPlan.subject.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                                            <Download className="h-4 w-4 mr-1" /> PDF
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setPreviewPlan(null)}>
                                            Close
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
                                        {previewPlan.content}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Recent Lesson Plans</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {plans.length > 0 ? (
                                            plans.map(plan => (
                                                <div
                                                    key={plan.id}
                                                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-[#facc15]/50 cursor-pointer transition-all"
                                                    onClick={() => setPreviewPlan(plan)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-maroon-900/40 rounded flex items-center justify-center">
                                                            <FileText className="h-5 w-5 text-[#16a34a]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{plan.topic}</p>
                                                            <p className="text-xs text-gray-500">{plan.subject.name} • {new Date(plan.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center text-gray-500">
                                                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                                <p>No lesson plans generated yet.</p>
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

