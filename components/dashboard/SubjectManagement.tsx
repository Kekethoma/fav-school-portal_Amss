'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Plus, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export function SubjectManagement() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: 'GENERAL',
        description: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to add subject')

            toast.success('Subject added successfully!')
            setFormData({ name: '', code: '', department: 'GENERAL', description: '' })
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader className="border-b border-white/5">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-[#facc15]" />
                    Academic Subject Manager
                </CardTitle>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Expand your institution's curriculum</p>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Subject Name</label>
                            <Input
                                placeholder="e.g. Further Mathematics"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="bg-white/5 border-white/10 text-white focus:ring-[#facc15]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Subject Code</label>
                            <Input
                                placeholder="e.g. FMAT101"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                className="bg-white/5 border-white/10 text-white focus:ring-[#facc15]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Departmental Focus</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:ring-1 focus:ring-[#facc15] outline-none [&>option]:bg-black"
                            >
                                <option value="GENERAL">General/All</option>
                                <option value="ARTS">Arts</option>
                                <option value="SCIENCE">Science</option>
                                <option value="COMMERCIAL">Commercial</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Description (Optional)</label>
                        <Textarea
                            placeholder="Brief overview of the subject content..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-white/5 border-white/10 text-white focus:ring-[#facc15] min-h-[80px]"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#facc15] text-black hover:bg-[#15803d] font-bold py-6 text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#facc15]/10"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-5 w-5" /> Register New Subject
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

