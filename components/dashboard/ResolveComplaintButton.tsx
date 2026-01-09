'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'

interface ResolveComplaintButtonProps {
    complaintId: string
    onResolved: () => void
}

export function ResolveComplaintButton({ complaintId, onResolved }: ResolveComplaintButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleResolve = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/complaints', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaintId, status: 'RESOLVED' })
            })
            if (res.ok) {
                onResolved()
            }
        } catch (error) {
            console.error('Resolve error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleResolve}
            disabled={loading}
            className="h-6 text-[#facc15] hover:text-white p-0 flex items-center gap-1"
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
            Resolve
        </Button>
    )
}

