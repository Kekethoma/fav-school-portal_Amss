import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { Shield, ChevronLeft, Clock, User, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function AuditLogPage() {
    const session = await getSession()

    if (!session || session.role !== 'PRINCIPAL') {
        redirect('/login')
    }

    const logs = await (db as any).auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, role: true } } },
        take: 100
    })

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/principal/dashboard">
                            <Button variant="outline" size="sm" className="p-2 h-10 w-10">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Shield className="h-8 w-8 text-[#facc15]" />
                                System Audit Logs
                            </h1>
                            <p className="text-gray-500">Track all administrative and critical system actions</p>
                        </div>
                    </div>
                </div>

                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                    <CardHeader className="border-b border-white/5">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-400" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Timestamp</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                                No audit logs recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${log.action.includes('ERROR') ? 'bg-red-500/20 text-red-500' :
                                                        log.action.includes('LOGIN') ? 'bg-green-600/20 text-green-600' :
                                                            log.action.includes('REGISTRATION') ? 'bg-green-500/20 text-green-500' :
                                                                'bg-[#facc15]/20 text-[#facc15]'
                                                        }`}>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-white font-medium">
                                                        <User className="h-3 w-3 text-gray-500" />
                                                        {log.user.name}
                                                        <span className="text-[10px] text-gray-600">({log.user.role})</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300 max-w-xs truncate">
                                                    {log.details}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

