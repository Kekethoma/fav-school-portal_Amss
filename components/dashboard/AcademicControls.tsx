'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Settings2, BookOpen, UserPlus, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function AcademicControls() {
    const [config, setConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/settings/academic')
            const data = await res.json()
            setConfig(data)
        } catch (err) {
            console.error('Failed to fetch academic config')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (field: string, value: any) => {
        setUpdating(field)
        try {
            const res = await fetch('/api/settings/academic', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            })
            const updated = await res.json()
            setConfig(updated)
            toast.success('Settings updated successfully')
        } catch (err) {
            toast.error('Failed to update settings')
        } finally {
            setUpdating(null)
        }
    }

    if (loading) return (
        <Card className="bg-black/40 border-white/10 animate-pulse">
            <CardContent className="h-[200px]" />
        </Card>
    )

    return (
        <Card className="bg-black/40 border-white/10 h-fit">
            <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Settings2 className="h-5 w-5 text-[#60a5fa]" />
                    Academic Session Controls
                </CardTitle>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Configure dynamic system access</p>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* Grade Submission */}
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white/10">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${config.isGradeSubmissionOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Grade Submissions</p>
                            <p className="text-[10px] text-gray-500">Allow teachers to enter/edit scores</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {updating === 'isGradeSubmissionOpen' && <Loader2 className="h-4 w-4 text-[#60a5fa] animate-spin" />}
                        <Switch
                            checked={config.isGradeSubmissionOpen}
                            onCheckedChange={(val) => handleToggle('isGradeSubmissionOpen', val)}
                            disabled={!!updating}
                        />
                    </div>
                </div>

                {/* Registration */}
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl transition-all hover:bg-white/10">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${config.isRegistrationOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">New Registrations</p>
                            <p className="text-[10px] text-gray-500">Students and Staff enrollment</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {updating === 'isRegistrationOpen' && <Loader2 className="h-4 w-4 text-[#60a5fa] animate-spin" />}
                        <Switch
                            checked={config.isRegistrationOpen}
                            onCheckedChange={(val) => handleToggle('isRegistrationOpen', val)}
                            disabled={!!updating}
                        />
                    </div>
                </div>

                {/* Term Management */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-[#60a5fa]" />
                        <span className="text-xs font-bold text-gray-300 uppercase">Current Academic Window</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((t) => (
                            <button
                                key={t}
                                onClick={() => handleToggle('currentTerm', t)}
                                disabled={!!updating}
                                className={`py-2 rounded-lg text-xs font-black transition-all ${config.currentTerm === t
                                        ? 'bg-[#60a5fa] text-black ring-2 ring-[#60a5fa]/50'
                                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                                    }`}
                            >
                                TERM {t}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

