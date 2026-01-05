'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export function GradeApprovalList() {
    const [grades, setGrades] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actioning, setActioning] = useState<string | null>(null)

    const fetchPendingGrades = async () => {
        try {
            const res = await fetch('/api/grades?unapproved=true')
            if (res.ok) {
                const data = await res.json()
                setGrades(data)
            }
        } catch (error) {
            console.error('Fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingGrades()
    }, [])

    const handleApprove = async (gradeId: string) => {
        setActioning(gradeId)
        try {
            const res = await fetch('/api/grades/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gradeId })
            })
            if (res.ok) {
                setGrades(prev => prev.filter(g => g.id !== gradeId))
            }
        } catch (error) {
            console.error('Approval error:', error)
        } finally {
            setActioning(null)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>

    if (grades.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-green-500" />
                <p>No grades pending approval</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {grades.map((grade) => (
                <div key={grade.id} className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-white font-medium">{grade.student.user.name}</p>
                        <p className="text-xs text-gray-500">
                            {grade.subject.name} • Total: <span className="text-[#60a5fa] font-bold">{grade.total}%</span>
                        </p>
                        <p className="text-[10px] text-gray-600">Entered by Teacher ID: {grade.teacherId}</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => handleApprove(grade.id)}
                        disabled={actioning === grade.id}
                        className="bg-green-600 hover:bg-green-700 h-8"
                    >
                        {actioning === grade.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Approve'}
                    </Button>
                </div>
            ))}
        </div>
    )
}

