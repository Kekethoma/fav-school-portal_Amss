'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { ApprovalsDashboard } from '@/components/dashboard/ApprovalsDashboard'

export default function ApprovalsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 dark:bg-gradient-to-br dark:from-black dark:via-gray-900 dark:to-[#16a34a] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <CheckCircle className="h-8 w-8 text-[#facc15]" />
                            Approvals Center
                        </h1>
                        <p className="text-gray-400 mt-2">Manage pending grades, resources, and assignments</p>
                    </div>
                    <Link href="/principal/dashboard">
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </header>

                <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle className="text-white">Active Requests</CardTitle>
                        <CardDescription className="text-gray-400">Review and approve items before they become visible to students</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <ApprovalsDashboard />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
