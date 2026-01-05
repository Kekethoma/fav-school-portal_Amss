'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Loader2, Download, CheckCircle, Edit2, UserPlus, Briefcase, GraduationCap, Star, BookOpen, Plus, Trash2, Phone, Mail, ShieldCheck } from 'lucide-react'
import { jsPDF } from 'jspdf'

const INITIAL_FORM_STATE = {
    name: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    skills: '',
    academicYearId: '',
    assignments: [] as { classId: string; subjectId: string }[]
}

export default function RegisterTeacherPage() {
    const [step, setStep] = useState<'INPUT' | 'PREVIEW' | 'SUCCESS'>('INPUT')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form State
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)

    const [credentials, setCredentials] = useState<{ username: string; password?: string } | null>(null)
    const [classes, setClasses] = useState<{ id: string; name: string; section: string }[]>([])
    const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([])
    const [academicYears, setAcademicYears] = useState<{ id: string; name: string; isCurrent: boolean }[]>([])
    const [config, setConfig] = useState<any>(null)

    // Fetch dependencies
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, subRes, ayRes, configRes] = await Promise.all([
                    fetch('/api/classes'),
                    fetch('/api/subjects'),
                    fetch('/api/academic-years'),
                    fetch('/api/settings/academic')
                ])
                const classData = await classRes.json()
                const subData = await subRes.json()
                const ayData = await ayRes.json()
                const configData = await configRes.json()

                setClasses(classData.classes || [])
                setSubjects(subData.subjects || [])
                setAcademicYears(ayData.academicYears || [])
                setConfig(configData)

                // Pre-select current academic year
                const current = ayData.academicYears?.find((ay: any) => ay.isCurrent)
                if (current) setFormData(prev => ({ ...prev, academicYearId: current.id }))
            } catch (err) {
                console.error('Failed to fetch initial data:', err)
            }
        }
        fetchData()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const addAssignment = () => {
        setFormData({
            ...formData,
            assignments: [...formData.assignments, { classId: '', subjectId: '' }]
        })
    }

    const removeAssignment = (index: number) => {
        const newAssignments = formData.assignments.filter((_, i) => i !== index)
        setFormData({ ...formData, assignments: newAssignments })
    }

    const updateAssignment = (index: number, field: 'classId' | 'subjectId', value: string) => {
        const newAssignments = [...formData.assignments]
        newAssignments[index][field] = value
        setFormData({ ...formData, assignments: newAssignments })
    }

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.qualification || !formData.academicYearId) {
            setError('Name, Email, Qualification and Academic Year are required')
            return
        }

        // Validate assignments if any
        if (formData.assignments.some(a => !a.classId || !a.subjectId)) {
            setError('Please complete all class and subject assignments or remove empty ones.')
            return
        }

        setError('')
        setStep('PREVIEW')
    }

    const handleConfirm = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed')
            }

            setCredentials({
                username: result.teacher.username,
                password: result.teacher.password
            })
            setStep('SUCCESS')
        } catch (err: any) {
            setError(err.message)
            setStep('INPUT')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (!credentials) return
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.setTextColor(128, 0, 32)
        doc.text('AMSS Portal - Teacher Credentials', 20, 20)
        doc.setFontSize(14)
        doc.setTextColor(60, 60, 60)
        doc.text(`Welcome, ${formData.name}`, 20, 35)
        doc.text(`Qualification: ${formData.qualification}`, 20, 45)
        doc.text(`Teacher ID: ${credentials.username}`, 20, 52)

        doc.setDrawColor(200, 200, 200)
        doc.roundedRect(20, 60, 170, 40, 3, 3, 'S')
        doc.setFont('courier', 'bold')
        doc.text(`Username: ${credentials.username}`, 30, 75)
        doc.text(`Password: ${credentials.password}`, 30, 85)

        doc.save(`Teacher_${formData.name.replace(/\s+/g, '_')}_Credentials.pdf`)
    }

    const handleRegisterNew = () => {
        setFormData({
            ...INITIAL_FORM_STATE,
            academicYearId: academicYears.find(ay => ay.isCurrent)?.id || ''
        })
        setCredentials(null)
        setStep('INPUT')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#1e40af] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/principal/dashboard">
                    <Button variant="ghost" className="mb-6 text-white hover:text-[#60a5fa]">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>

                {config && !config.isRegistrationOpen ? (
                    <Card className="border-red-500/50 bg-red-500/10 backdrop-blur-sm">
                        <CardContent className="p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="h-8 w-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Teacher Registration is Closed</h2>
                            <p className="text-gray-400 max-w-md mx-auto">
                                New staff enrollment has been suspended by the Principal.
                                Please re-enable registration in the Academic Session Controls to proceed.
                            </p>
                            <Link href="/principal/dashboard">
                                <Button variant="outline" className="mt-4 border-red-500/30 text-red-400">Return to Dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <Card className="bg-black/40 border-white/10 backdrop-blur-md shadow-2xl">
                            <CardHeader className="border-b border-white/5 pb-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#60a5fa]/20 rounded-xl flex items-center justify-center">
                                            <UserPlus className="h-6 w-6 text-[#60a5fa]" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-white font-bold">
                                                {step === 'INPUT' ? 'Advanced Teacher Registration' : step === 'PREVIEW' ? 'Review Profile' : 'Registration Complete'}
                                            </CardTitle>
                                            <CardDescription className="text-gray-400">
                                                {step === 'INPUT' && 'Capture full professional background and assignments'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                                        Step {step === 'INPUT' ? '1' : step === 'PREVIEW' ? '2' : '3'} of 3
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8">
                                {step === 'INPUT' && (
                                    <form onSubmit={handleNext} className="space-y-8">
                                        {/* Academic Year Context */}
                                        <section className="space-y-4">
                                            <h3 className="text-[#60a5fa] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" /> Registration Context
                                            </h3>
                                            <div className="max-w-md space-y-2">
                                                <label className="text-xs font-semibold text-gray-400">Effective Academic Year *</label>
                                                <select
                                                    name="academicYearId"
                                                    value={formData.academicYearId}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#60a5fa] outline-none [&>option]:bg-black"
                                                >
                                                    <option value="">Select Year</option>
                                                    {academicYears.map(ay => (
                                                        <option key={ay.id} value={ay.id}>{ay.name} {ay.isCurrent ? '(Current)' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </section>

                                        {/* Personal Profile */}
                                        <section className="space-y-4">
                                            <h3 className="text-[#60a5fa] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                                <Plus className="h-4 w-4" /> Personal Profile
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Full Name *</label>
                                                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#60a5fa]" placeholder="Dr./Mr./Mrs. Name" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Official Email *</label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#60a5fa]" placeholder="teacher@school.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Phone Number</label>
                                                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#60a5fa]" placeholder="+232-..." />
                                                </div>
                                            </div>
                                        </section>

                                        {/* Professional Background */}
                                        <section className="space-y-4">
                                            <h3 className="text-[#60a5fa] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4" /> Professional Background
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Highest Qualification *</label>
                                                    <select
                                                        name="qualification"
                                                        value={formData.qualification}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#60a5fa] outline-none [&>option]:bg-black"
                                                    >
                                                        <option value="">Select Qualification</option>
                                                        <option value="B.Ed">B.Ed (Bachelor of Education)</option>
                                                        <option value="B.Sc Education">B.Sc Education</option>
                                                        <option value="B.A Education">B.A Education</option>
                                                        <option value="M.Ed">M.Ed (Master of Education)</option>
                                                        <option value="M.Sc Education">M.Sc Education</option>
                                                        <option value="Ph.D">Ph.D</option>
                                                        <option value="NTTC/TC">NTTC/TC (Teachers Certificate)</option>
                                                        <option value="HTC (Primary)">HTC Primary</option>
                                                        <option value="HTC (Secondary)">HTC Secondary</option>
                                                        <option value="Other">Other Professionals</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Area of Specialization</label>
                                                    <select
                                                        name="specialization"
                                                        value={formData.specialization}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#60a5fa] outline-none [&>option]:bg-black"
                                                    >
                                                        <option value="">Select Area</option>
                                                        <option value="Mathematics">Mathematics</option>
                                                        <option value="English Language">English Language</option>
                                                        <option value="Pure Sciences">Pure Sciences (Physics/Chem/Bio)</option>
                                                        <option value="Humanities">Humanities (History/Govt/CRK)</option>
                                                        <option value="Vocational">Vocational (Home Ec/Agric)</option>
                                                        <option value="Business/Commercial">Business/Commercial</option>
                                                        <option value="ICT/Computer Studies">ICT/Computer Studies</option>
                                                        <option value="Physical Education">Physical Education</option>
                                                        <option value="Early Childhood">Early Childhood</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-400">Key Skills / Certifications</label>
                                                <textarea name="skills" value={formData.skills} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:ring-2 focus:ring-[#60a5fa] min-h-[80px]" placeholder="Soft skills, teaching methodologies, ICT certifications..." />
                                            </div>
                                        </section>

                                        {/* Initial Assignments */}
                                        <section className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-[#60a5fa] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4" /> Class & Subject Assignments
                                                </h3>
                                                <Button type="button" onClick={addAssignment} variant="outline" size="sm" className="bg-[#60a5fa]/10 border-[#60a5fa]/20 text-[#60a5fa] hover:bg-[#60a5fa]/20">
                                                    <Plus className="h-4 w-4 mr-1" /> Add Assignment
                                                </Button>
                                            </div>

                                            {formData.assignments.length === 0 ? (
                                                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-gray-500 text-sm">
                                                    No initial assignments added. You can assign classes later.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {formData.assignments.map((assignment, index) => (
                                                        <div key={index} className="flex gap-4 items-end animate-fadeIn">
                                                            <div className="flex-1 space-y-2">
                                                                <label className="text-[10px] text-gray-500 uppercase">Class</label>
                                                                <select
                                                                    value={assignment.classId}
                                                                    onChange={(e) => updateAssignment(index, 'classId', e.target.value)}
                                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none [&>option]:bg-black"
                                                                >
                                                                    <option value="">Select Class</option>
                                                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                                                                </select>
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <label className="text-[10px] text-gray-500 uppercase">Subject</label>
                                                                <select
                                                                    value={assignment.subjectId}
                                                                    onChange={(e) => updateAssignment(index, 'subjectId', e.target.value)}
                                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none [&>option]:bg-black"
                                                                >
                                                                    <option value="">Select Subject</option>
                                                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                                </select>
                                                            </div>
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignment(index)} className="text-red-500 hover:bg-red-500/10 mb-1">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs">{error}</div>}

                                        <Button type="submit" variant="secondary" className="w-full h-14 font-bold text-lg bg-[#60a5fa] text-black hover:bg-[#3b82f6] shadow-xl shadow-[#60a5fa]/10">
                                            Proceed to Review
                                        </Button>
                                    </form>
                                )}

                                {step === 'PREVIEW' && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                            <div className="space-y-4">
                                                <h4 className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2"><Plus className="h-3 w-3" /> Basic Information</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between"><span className="text-gray-500">Name</span> <span className="text-white font-bold">{formData.name}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Email</span> <span className="text-white">{formData.email}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Phone</span> <span className="text-white">{formData.phone || 'N/A'}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Academic Year</span> <span className="text-white">{academicYears.find(ay => ay.id === formData.academicYearId)?.name}</span></div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2"><GraduationCap className="h-3 w-3" /> Professional Background</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between"><span className="text-gray-500">Qualification</span> <span className="text-white">{formData.qualification}</span></div>
                                                    <div className="flex justify-between"><span className="text-gray-500">Specialization</span> <span className="text-white">{formData.specialization || 'N/A'}</span></div>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-white/5">
                                                    <span className="text-gray-500 block text-[10px] uppercase">Skills & Certifications</span>
                                                    <p className="text-white text-xs mt-1 whitespace-pre-wrap">{formData.skills || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[#60a5fa] text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2"><Briefcase className="h-3 w-3" /> Initial Assignments ({formData.assignments.length})</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {formData.assignments.map((a, i) => (
                                                    <div key={i} className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-xs text-gray-300 flex justify-between">
                                                        <span>{subjects.find(s => s.id === a.subjectId)?.name}</span>
                                                        <span className="text-[#60a5fa]">{classes.find(c => c.id === a.classId)?.name} {classes.find(c => c.id === a.classId)?.section}</span>
                                                    </div>
                                                ))}
                                                {formData.assignments.length === 0 && <p className="text-gray-600 italic text-sm">No initial assignments</p>}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-white/10">
                                            <Button variant="outline" onClick={() => setStep('INPUT')} className="flex-1">
                                                <Edit2 className="w-4 h-4 mr-2" /> Back to Edit
                                            </Button>
                                            <Button onClick={handleConfirm} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20">
                                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                                {loading ? 'Processing...' : 'Confirm & Register Faculty'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === 'SUCCESS' && (
                                    <div className="text-center py-10 space-y-8 animate-fadeIn">
                                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-12 h-12 text-green-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold text-white">Teacher Account Created</h2>
                                            <p className="text-gray-400">Onboarding credentials for {formData.name} are ready.</p>
                                        </div>

                                        <div className="max-w-md mx-auto p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 shadow-xl">
                                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                                <span className="text-gray-500 text-sm">Login ID</span>
                                                <span className="text-white font-mono font-bold text-xl tracking-wider">{credentials?.username}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-sm">Temporary Password</span>
                                                <span className="text-[#60a5fa] font-mono font-bold text-xl tracking-wider">{credentials?.password}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                            <Button onClick={handleDownload} className="w-full py-6 bg-[#60a5fa] text-black hover:bg-[#3b82f6] font-bold shadow-lg shadow-[#60a5fa]/10">
                                                <Download className="mr-2 h-5 w-5" /> Download Enrollment Pack
                                            </Button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link href="/principal/teachers" className="w-full">
                                                    <Button variant="outline" className="w-full px-0">Teachers Directory</Button>
                                                </Link>
                                                <Button variant="secondary" onClick={handleRegisterNew} className="w-full">Register Another</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}

