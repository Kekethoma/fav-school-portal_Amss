'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, FileText, BookOpen, GraduationCap, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function ApprovalsDashboard() {
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [grades, setGrades] = useState<any[]>([])
    const [resources, setResources] = useState<any[]>([])
    const [assignments, setAssignments] = useState<any[]>([])
    const [selectedGrades, setSelectedGrades] = useState<string[]>([])
    const [selectedResources, setSelectedResources] = useState<string[]>([])
    const [selectedAssignments, setSelectedAssignments] = useState<string[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch unapproved grades
            const gradesRes = await fetch('/api/grades?unapproved=true')
            const gradesData = await gradesRes.json()
            if (Array.isArray(gradesData)) setGrades(gradesData)

            // Fetch unapproved resources
            const resourcesRes = await fetch('/api/resources?unapproved=true')
            const resourcesData = await resourcesRes.json()
            if (resourcesData.resources) setResources(resourcesData.resources)

            // Fetch unapproved assignments
            const assignmentsRes = await fetch('/api/assignments?unapproved=true')
            const assignmentsData = await assignmentsRes.json()
            if (Array.isArray(assignmentsData)) setAssignments(assignmentsData)

        } catch (err) {
            toast.error('Failed to load pending approvals')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (type: 'grades' | 'resources' | 'assignments') => {
        setApproving(true)
        try {
            let url = ''
            let ids: string[] = []
            let payloadKey = ''

            if (type === 'grades') {
                url = '/api/grades/approve'
                ids = selectedGrades
                payloadKey = 'gradeIds'
            } else if (type === 'resources') {
                url = '/api/resources/approve'
                ids = selectedResources
                payloadKey = 'resourceIds'
            } else if (type === 'assignments') {
                url = '/api/assignments/approve'
                ids = selectedAssignments
                payloadKey = 'assignmentIds'
            }

            if (ids.length === 0) {
                toast.error('No items selected')
                return
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [payloadKey]: ids })
            })

            if (!res.ok) throw new Error('Approval failed')

            toast.success(`Successfully approved ${ids.length} items`)

            // Clear selection and refresh
            if (type === 'grades') setSelectedGrades([])
            if (type === 'resources') setSelectedResources([])
            if (type === 'assignments') setSelectedAssignments([])

            await fetchData()
        } catch (err) {
            toast.error('Failed to approve items')
        } finally {
            setApproving(false)
        }
    }

    const toggleSelection = (id: string, type: 'grades' | 'resources' | 'assignments') => {
        if (type === 'grades') {
            setSelectedGrades(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
        } else if (type === 'resources') {
            setSelectedResources(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
        } else if (type === 'assignments') {
            setSelectedAssignments(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
        }
    }

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#facc15]" /></div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-[#facc15]" /> Pending Approvals
            </h2>

            <Tabs defaultValue="grades" className="w-full">
                <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="grades" className="data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
                        Grades <Badge className="ml-2 bg-white/20 text-white">{grades.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
                        Resources <Badge className="ml-2 bg-white/20 text-white">{resources.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
                        Assignments <Badge className="ml-2 bg-white/20 text-white">{assignments.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Grades Tab */}
                <TabsContent value="grades" className="mt-6 space-y-4">
                    <div className="flex justify-end mb-4">
                        <Button
                            onClick={() => handleApprove('grades')}
                            disabled={selectedGrades.length === 0 || approving}
                            className="bg-[#facc15] hover:bg-[#15803d] text-black font-bold"
                        >
                            {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Approve Selected ({selectedGrades.length})
                        </Button>
                    </div>
                    {grades.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No pending grade submissions</div>
                    ) : (
                        <div className="grid gap-4">
                            {grades.map(grade => (
                                <div key={grade.id} onClick={() => toggleSelection(grade.id, 'grades')} className="cursor-pointer">
                                    <Card className={`bg-white/5 border border-white/10 transition-colors ${selectedGrades.includes(grade.id) ? 'border-[#facc15] bg-[#facc15]/5' : ''}`}>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedGrades.includes(grade.id) ? 'bg-[#facc15] border-[#facc15]' : 'border-gray-500'}`}>
                                                    {selectedGrades.includes(grade.id) && <CheckCircle className="h-3 w-3 text-black" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold">{grade.subject.name} - {grade.class.name}</h4>
                                                    <p className="text-sm text-gray-400">{grade.student.user.name} • Term {grade.term}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#facc15] font-bold text-lg">{grade.total}%</p>
                                                <p className="text-xs text-gray-500">Grade: {grade.grade}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="mt-6 space-y-4">
                    <div className="flex justify-end mb-4">
                        <Button
                            onClick={() => handleApprove('resources')}
                            disabled={selectedResources.length === 0 || approving}
                            className="bg-[#facc15] hover:bg-[#15803d] text-black font-bold"
                        >
                            {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Approve Selected ({selectedResources.length})
                        </Button>
                    </div>
                    {resources.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No pending resources</div>
                    ) : (
                        <div className="grid gap-4">
                            {resources.map(res => (
                                <div key={res.id} onClick={() => toggleSelection(res.id, 'resources')} className="cursor-pointer">
                                    <Card className={`bg-white/5 border border-white/10 transition-colors ${selectedResources.includes(res.id) ? 'border-[#facc15] bg-[#facc15]/5' : ''}`}>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedResources.includes(res.id) ? 'bg-[#facc15] border-[#facc15]' : 'border-gray-500'}`}>
                                                    {selectedResources.includes(res.id) && <CheckCircle className="h-3 w-3 text-black" />}
                                                </div>
                                                <div className="h-10 w-10 bg-[#16a34a]/20 rounded-lg flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-[#facc15]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold">{res.title}</h4>
                                                    <p className="text-sm text-gray-400">By {res.teacher?.user?.name || 'Unknown'} • {res.fileType.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">Pending</Badge>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="mt-6 space-y-4">
                    <div className="flex justify-end mb-4">
                        <Button
                            onClick={() => handleApprove('assignments')}
                            disabled={selectedAssignments.length === 0 || approving}
                            className="bg-[#facc15] hover:bg-[#15803d] text-black font-bold"
                        >
                            {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Approve Selected ({selectedAssignments.length})
                        </Button>
                    </div>
                    {assignments.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No pending assignments</div>
                    ) : (
                        <div className="grid gap-4">
                            {assignments.map(assign => (
                                <div key={assign.id} onClick={() => toggleSelection(assign.id, 'assignments')} className="cursor-pointer">
                                    <Card className={`bg-white/5 border border-white/10 transition-colors ${selectedAssignments.includes(assign.id) ? 'border-[#facc15] bg-[#facc15]/5' : ''}`}>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedAssignments.includes(assign.id) ? 'bg-[#facc15] border-[#facc15]' : 'border-gray-500'}`}>
                                                    {selectedAssignments.includes(assign.id) && <CheckCircle className="h-3 w-3 text-black" />}
                                                </div>
                                                <div className="h-10 w-10 bg-[#16a34a]/20 rounded-lg flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-[#facc15]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold">{assign.title}</h4>
                                                    <p className="text-sm text-gray-400">{assign.subject.name} • {assign.class.name}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">Pending</Badge>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
