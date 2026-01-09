'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Loader2, Download, CheckCircle, Edit2, User, Phone, MapPin, Calendar, BookOpen, ShieldCheck, Mail } from 'lucide-react'
import { jsPDF } from 'jspdf'

const INITIAL_FORM_STATE = {
    name: '',
    email: '',
    level: '', // JSS or SSS
    classId: '',
    academicYearId: '',
    department: '', // Only for SSS
    gender: '',
    dateOfBirth: '',
    address: '',
    religion: '',
    previousSchool: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    emergencyContact: ''
}

export default function RegisterStudentPage() {
    const [step, setStep] = useState<'INPUT' | 'PREVIEW' | 'SUCCESS'>('INPUT')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form State
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)

    const [credentials, setCredentials] = useState<{ username: string; password?: string } | null>(null)
    const [classes, setClasses] = useState<{ id: string; name: string; section: string }[]>([])
    const [academicYears, setAcademicYears] = useState<{ id: string; name: string; isCurrent: boolean }[]>([])
    const [config, setConfig] = useState<any>(null)

    // Fetch dependencies
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, ayRes, configRes] = await Promise.all([
                    fetch('/api/classes'),
                    fetch('/api/academic-years'),
                    fetch('/api/settings/academic')
                ])
                const classData = await classRes.json()
                const ayData = await ayRes.json()
                const configData = await configRes.json()
                setClasses(classData.classes || [])
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

    const filteredClasses = (classes as any[]).filter(c => {
        const levelMatch = formData.level ? c.name.startsWith(formData.level) : true
        const deptMatch = (formData.level === 'SSS' && formData.department)
            ? c.department === formData.department
            : true
        return levelMatch && deptMatch
    })

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.classId || !formData.level || !formData.academicYearId) {
            setError('Please fill in all core academic fields')
            return
        }
        if (formData.level === 'SSS' && !formData.department) {
            setError('Please select a department for SSS student')
            return
        }
        setError('')
        setStep('PREVIEW')
    }

    const handleConfirm = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed')
            }

            setCredentials({
                username: result.student.username,
                password: result.student.password
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
        doc.text('AMSS Portal - Student Credentials', 20, 20)
        doc.setFontSize(14)
        doc.setTextColor(60, 60, 60)
        doc.text(`Welcome, ${formData.name}`, 20, 35)
        doc.text(`Student ID: ${credentials.username}`, 20, 45)
        doc.text(`Class: ${classes.find(c => c.id === formData.classId)?.name} ${classes.find(c => c.id === formData.classId)?.section || ''}`, 20, 55)

        doc.setDrawColor(200, 200, 200)
        doc.roundedRect(20, 70, 170, 40, 3, 3, 'S')
        doc.setFont('courier', 'bold')
        doc.text(`Username: ${credentials.username}`, 30, 85)
        doc.text(`Password: ${credentials.password}`, 30, 95)

        doc.save(`${formData.name.replace(/\s+/g, '_')}_Credentials.pdf`)
    }

    const resetForm = () => {
        setFormData({
            ...INITIAL_FORM_STATE,
            academicYearId: academicYears.find(ay => ay.isCurrent)?.id || ''
        })
        setCredentials(null)
        setStep('INPUT')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#16a34a] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/principal/dashboard">
                    <Button variant="ghost" className="mb-6 text-white hover:text-[#facc15]">
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
                            <h2 className="text-2xl font-bold text-white">Registration is Currently Closed</h2>
                            <p className="text-gray-400 max-w-md mx-auto">
                                The admission window for students has been closed by the Principal.
                                Please enable registration in the dashboard settings to proceed with new enrollment.
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
                                    <div>
                                        <CardTitle className="text-2xl text-white font-bold flex items-center gap-2">
                                            <ShieldCheck className="h-6 w-6 text-[#facc15]" />
                                            {step === 'INPUT' ? 'Advanced Student Enrollment' : step === 'PREVIEW' ? 'Review Application' : 'Success'}
                                        </CardTitle>
                                        <CardDescription className="text-gray-400 mt-1">
                                            {step === 'INPUT' && 'Provide comprehensive student details for permanent record'}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${step === 'INPUT' ? 'bg-green-600/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                            Step {step === 'INPUT' ? '1' : step === 'PREVIEW' ? '2' : '3'} of 3
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8">
                                {step === 'INPUT' && (
                                    <form onSubmit={handleNext} className="space-y-8">
                                        {/* Academic Status */}
                                        <section className="space-y-4">
                                            <h3 className="text-[#facc15] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" /> Enrollment Context
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Academic Year *</label>
                                                    <select
                                                        name="academicYearId"
                                                        value={formData.academicYearId}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none [&>option]:bg-black"
                                                    >
                                                        <option value="">Select Year</option>
                                                        {academicYears.map(ay => (
                                                            <option key={ay.id} value={ay.id}>{ay.name} {ay.isCurrent ? '(Current)' : ''}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Education Level *</label>
                                                    <select
                                                        name="level"
                                                        value={formData.level}
                                                        onChange={(e) => setFormData({ ...formData, level: e.target.value, department: '', classId: '' })}
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none [&>option]:bg-black"
                                                    >
                                                        <option value="">Select Level</option>
                                                        <option value="JSS">Junior Secondary (JSS)</option>
                                                        <option value="SSS">Senior Secondary (SSS)</option>
                                                    </select>
                                                </div>
                                                {formData.level === 'SSS' && (
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-400">Department *</label>
                                                        <select
                                                            name="department"
                                                            value={formData.department}
                                                            onChange={(e) => setFormData({ ...formData, department: e.target.value, classId: '' })}
                                                            required
                                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none [&>option]:bg-black"
                                                        >
                                                            <option value="">Select Department</option>
                                                            <option value="ARTS">Arts</option>
                                                            <option value="SCIENCE">Science</option>
                                                            <option value="COMMERCIAL">Commercial</option>
                                                        </select>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Assigned Class *</label>
                                                    <select
                                                        name="classId"
                                                        value={formData.classId}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none [&>option]:bg-black disabled:opacity-50"
                                                        disabled={!formData.level || (formData.level === 'SSS' && !formData.department)}
                                                    >
                                                        <option value="">{!formData.level ? 'Pick Level First' : (formData.level === 'SSS' && !formData.department) ? 'Pick Department First' : 'Select Class'}</option>
                                                        {filteredClasses.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            {formData.level === 'SSS' && (
                                                <div className="space-y-2 max-w-sm">
                                                    <label className="text-xs font-semibold text-gray-400">Department *</label>
                                                    <select
                                                        name="department"
                                                        value={formData.department}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none [&>option]:bg-black"
                                                    >
                                                        <option value="">Select Department</option>
                                                        <option value="Science">Science (Pure Arts)</option>
                                                        <option value="Arts">Humanities (Arts)</option>
                                                        <option value="Commercial">Business (Commercial)</option>
                                                    </select>
                                                </div>
                                            )}
                                        </section>

                                        {/* Personal Information */}
                                        <section className="space-y-4">
                                            <h3 className="text-[#facc15] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                                <User className="h-4 w-4" /> Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Full Name *</label>
                                                    <input name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none placeholder:text-gray-700" placeholder="Full legal name" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Email Address *</label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none placeholder:text-gray-700" placeholder="personal/student email" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-400">Gender</label>
                                                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none [&>option]:bg-black">
                                                            <option value="">Select</option>
                                                            <option value="MALE">Male</option>
                                                            <option value="FEMALE">Female</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-400">Date of Birth</label>
                                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Religion</label>
                                                    <select
                                                        name="religion"
                                                        value={formData.religion}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none [&>option]:bg-black"
                                                    >
                                                        <option value="">Select Religion</option>
                                                        <option value="Islam">Islam</option>
                                                        <option value="Christianity">Christianity</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-400">Permanent Address</label>
                                                <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none min-h-[80px]" placeholder="Street, City, State" />
                                            </div>
                                        </section>

                                        {/* Guardian & Emergency */}
                                        <section className="space-y-4 pb-8">
                                            <h3 className="text-[#facc15] text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                                                <Phone className="h-4 w-4" /> Guardian & Safety
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Guardian Full Name *</label>
                                                    <input name="guardianName" value={formData.guardianName} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none" placeholder="Primary parent/guardian" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Guardian Phone *</label>
                                                    <input name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none" placeholder="+232 ..." />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Guardian Email</label>
                                                    <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none" placeholder="guardian@email.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400">Emergency Contact (Alt Phone)</label>
                                                    <input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none" placeholder="Secondary contact number" />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-xs font-semibold text-gray-400">Previous School Attended</label>
                                                    <input name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#facc15] outline-none" placeholder="Name of previous institution" />
                                                </div>
                                            </div>
                                        </section>

                                        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs">{error}</div>}

                                        <Button type="submit" variant="secondary" className="w-full h-14 font-bold text-lg bg-[#facc15] text-black hover:bg-[#15803d] shadow-xl shadow-[#facc15]/10">
                                            Proceed to Review
                                        </Button>
                                    </form>
                                )}

                                {step === 'PREVIEW' && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                            {/* Academic Column */}
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <h4 className="text-[#facc15] text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">Academic Placement</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between"><span className="text-gray-500">Academic Year</span> <span className="text-white">{academicYears.find(ay => ay.id === formData.academicYearId)?.name}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Level</span> <span className="text-white font-bold">{formData.level}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Assigned Class</span> <span className="text-white">{classes.find(c => c.id === formData.classId)?.name} {classes.find(c => c.id === formData.classId)?.section}</span></div>
                                                        {formData.department && <div className="flex justify-between"><span className="text-gray-500">Department</span> <span className="text-[#facc15]">{formData.department}</span></div>}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="text-[#facc15] text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">Previous Education</h4>
                                                    <p className="text-white">{formData.previousSchool || 'No record provided'}</p>
                                                </div>
                                            </div>

                                            {/* Personal Column */}
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <h4 className="text-[#facc15] text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">Student Information</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between"><span className="text-gray-500">Full Name</span> <span className="text-white font-bold">{formData.name}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Email</span> <span className="text-white">{formData.email}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Gender</span> <span className="text-white">{formData.gender || 'N/A'}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">DOB</span> <span className="text-white">{formData.dateOfBirth || 'N/A'}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Religion</span> <span className="text-white">{formData.religion || 'N/A'}</span></div>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-white/5">
                                                        <span className="text-gray-500 block text-[10px] uppercase">Permanent Address</span>
                                                        <p className="text-white text-xs mt-1">{formData.address || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="text-[#facc15] text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2">Guardian Contact</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between"><span className="text-gray-500">Guardian</span> <span className="text-white">{formData.guardianName}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Phone</span> <span className="text-white">{formData.guardianPhone}</span></div>
                                                        <div className="flex justify-between"><span className="text-gray-500">Alt Contact</span> <span className="text-white">{formData.emergencyContact || 'N/A'}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-white/10">
                                            <Button variant="outline" onClick={() => setStep('INPUT')} className="flex-1">
                                                <Edit2 className="w-4 h-4 mr-2" /> Back to Edit
                                            </Button>
                                            <Button onClick={handleConfirm} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-900/20">
                                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                                {loading ? 'Registering...' : 'Submit Final Application'}
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
                                            <h2 className="text-3xl font-bold text-white">Enrollment Successful!</h2>
                                            <p className="text-gray-400">The student has been added to the registry for the {academicYears.find(ay => ay.id === formData.academicYearId)?.name} academic year.</p>
                                        </div>

                                        <div className="max-w-md mx-auto p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 shadow-xl">
                                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                                <span className="text-gray-500 text-sm">Enrollment ID</span>
                                                <span className="text-white font-mono font-bold text-xl tracking-wider">{credentials?.username}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 text-sm">Temporary Password</span>
                                                <span className="text-[#facc15] font-mono font-bold text-xl tracking-wider">{credentials?.password}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                                            <Button onClick={handleDownload} className="w-full py-6 bg-[#facc15] text-black hover:bg-[#15803d] font-bold shadow-lg shadow-[#facc15]/10">
                                                <Download className="mr-2 h-5 w-5" /> Download Admission Pack
                                            </Button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link href="/principal/students" className="w-full">
                                                    <Button variant="outline" className="w-full px-0">View Registry</Button>
                                                </Link>
                                                <Button variant="secondary" onClick={resetForm} className="w-full">Enroll Another</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div >
    )
}

