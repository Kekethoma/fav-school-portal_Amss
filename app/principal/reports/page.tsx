'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileDown, Users, GraduationCap, BarChart, Filter, ClipboardList, Info } from 'lucide-react'
import { SubjectManagement } from '@/components/dashboard/SubjectManagement'

export default function ReportsPage() {
    const [exporting, setExporting] = useState<string | null>(null)
    const [filters, setFilters] = useState({
        academicYearId: '',
        classId: '',
        term: '',
        department: '',
        gender: ''
    })
    const [options, setOptions] = useState<{ academicYears: any[], classes: any[] }>({ academicYears: [], classes: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOptions()
    }, [])

    const fetchOptions = async () => {
        try {
            const res = await fetch('/api/reports/filters')
            const data = await res.json()
            setOptions(data)
            const currentYear = data.academicYears.find((ay: any) => ay.isCurrent)
            if (currentYear) {
                setFilters(prev => ({ ...prev, academicYearId: currentYear.id }))
            }
        } catch (err) {
            console.error('Failed to fetch filter options')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = (type: string) => {
        setExporting(type)
        const params = new URLSearchParams({ type, ...filters })
        window.location.href = `/api/reports/csv-export?${params.toString()}`
        setTimeout(() => setExporting(null), 3000)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'department' ? { classId: '' } : {})
        }))
    }

    const filteredClasses = options.classes.filter(c =>
        filters.department ? c.department === filters.department : true
    )

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-[#1e40af] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/principal/dashboard">
                        <Button variant="ghost" className="dark:text-white dark:hover:text-[#60a5fa]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Advanced Reporting</h1>
                </div>

                {/* Filter Controls */}
                <Card className="mb-8 border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle className="text-[#60a5fa] flex items-center gap-2 text-sm uppercase tracking-widest">
                            <Filter className="h-4 w-4" /> Report Filter Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Academic Year</label>
                                <select
                                    name="academicYearId"
                                    value={filters.academicYearId}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#60a5fa] [&>option]:bg-black"
                                >
                                    <option value="">All Years</option>
                                    {options.academicYears.map(ay => (
                                        <option key={ay.id} value={ay.id}>{ay.name}{ay.isCurrent ? ' (Current)' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Term</label>
                                <select
                                    name="term"
                                    value={filters.term}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#60a5fa] [&>option]:bg-black"
                                >
                                    <option value="">All Terms</option>
                                    <option value="1">Term 1</option>
                                    <option value="2">Term 2</option>
                                    <option value="3">Term 3</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Department</label>
                                <select
                                    name="department"
                                    value={filters.department}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#60a5fa] [&>option]:bg-black"
                                >
                                    <option value="">All Departments</option>
                                    <option value="SCIENCE">Science</option>
                                    <option value="ARTS">Arts</option>
                                    <option value="COMMERCIAL">Commercial</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Class</label>
                                <select
                                    name="classId"
                                    value={filters.classId}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#60a5fa] [&>option]:bg-black"
                                >
                                    <option value="">{filters.department ? 'Related Classes' : 'All Classes'}</option>
                                    {filteredClasses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label>
                                <select
                                    name="gender"
                                    value={filters.gender}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#60a5fa] [&>option]:bg-black"
                                >
                                    <option value="">Both Genders</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 p-3 bg-[#60a5fa]/5 border border-[#60a5fa]/10 rounded-lg">
                            <Info className="h-4 w-4 text-[#60a5fa]" />
                            <p className="text-xs text-gray-400">Filters selected above will be applied to all downloads below.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Student Data */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-[#60a5fa]/30 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-[#60a5fa]" />
                                Student Enrollment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-400">
                            <p>Export full student profiles including contact details and status based on filters.</p>
                            <Button
                                className="w-full bg-[#60a5fa] text-black hover:bg-[#3b82f6]"
                                onClick={() => handleExport('students')}
                                disabled={exporting === 'students'}
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                {exporting === 'students' ? 'Preparing CSV...' : 'Download Student Data'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Class Rolls */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-[#60a5fa]/30 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#1e40af]" />
                                Class Rolls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-400">
                            <p>Generate class-wise attendance and roll call sheets with filtered student lists.</p>
                            <Button
                                className="w-full bg-[#1e40af] text-white hover:bg-[#1d4ed8]"
                                onClick={() => handleExport('rolls')}
                                disabled={exporting === 'rolls'}
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                {exporting === 'rolls' ? 'Preparing CSV...' : 'Download Class Roll'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Academic Grades */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm hover:border-[#60a5fa]/30 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-blue-500" />
                                Academic Grades
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-400">
                            <p>Export detailed subject grades, CA scores, and terminal exam results for review.</p>
                            <Button
                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => handleExport('grades')}
                                disabled={exporting === 'grades'}
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                {exporting === 'grades' ? 'Preparing CSV...' : 'Download Grade Data'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Teacher List */}
                    <Card className="md:col-span-3 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-400" />
                                Staff Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-400">Download the complete list of registered academic and administrative staff.</p>
                            <Button
                                variant="outline"
                                className="min-w-[200px]"
                                onClick={() => handleExport('teachers')}
                                disabled={exporting === 'teachers'}
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                {exporting === 'teachers' ? 'Exporting...' : 'Staff Directory CSV'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <SubjectManagement />
                </div>
            </div>
        </div>
    )
}

