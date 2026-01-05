'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, Settings, BookOpen, GraduationCap } from 'lucide-react'

interface Subject {
    id: string
    name: string
    code: string
}

interface Class {
    id: string
    name: string
    section: string
}

export default function SettingsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [classes, setClasses] = useState<Class[]>([])


    useEffect(() => {
        const fetchData = async () => {
            try {
                // These would be real APIs in a full app
                const [subRes, classRes] = await Promise.all([
                    fetch('/api/subjects'),
                    fetch('/api/classes')
                ])
                if (subRes.ok) setSubjects((await subRes.json()).subjects || [])
                if (classRes.ok) setClasses((await classRes.json()).classes || [])
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#1e40af] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/principal/dashboard">
                        <Button variant="ghost" className="text-white hover:text-[#60a5fa]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-white" />
                        <h1 className="text-2xl font-bold text-white">System Settings</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Subjects Management */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
                            <CardTitle className="text-white flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-[#60a5fa]" />
                                Subjects
                            </CardTitle>
                            <Button size="sm" variant="secondary">
                                <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                {subjects.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                                        <div>
                                            <p className="text-white font-medium">{s.name}</p>
                                            <p className="text-xs text-gray-500">{s.code}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {subjects.length === 0 && <p className="text-center text-gray-600 py-10 italic">No subjects configured</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Classes Management */}
                    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
                            <CardTitle className="text-white flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-[#1e40af]" />
                                Classes
                            </CardTitle>
                            <Button size="sm" variant="secondary">
                                <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                {classes.map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/5">
                                        <div>
                                            <p className="text-white font-medium">{c.name}</p>
                                            <p className="text-xs text-gray-500">{c.section}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {classes.length === 0 && <p className="text-center text-gray-600 py-10 italic">No classes configured</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* General Settings */}
                    <Card className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">System Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Current Academic Year</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none">
                                        <option className="bg-gray-900">2024/2025</option>
                                        <option className="bg-gray-900">2023/2024</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Active Term</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none">
                                        <option className="bg-gray-900">Term 1</option>
                                        <option className="bg-gray-900">Term 2</option>
                                        <option className="bg-gray-900">Term 3</option>
                                    </select>
                                </div>
                            </div>
                            <Button variant="primary" className="shadow-lg shadow-maroon-500/20">Save Configuration</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

