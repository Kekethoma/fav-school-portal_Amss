import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
    return (
        <div className={cn('card-hover bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10', className)}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {trend && (
                        <p className={cn('text-sm mt-2', trend.isPositive ? 'text-green-400' : 'text-red-400')}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                <div className="w-12 h-12 bg-[#60a5fa]/20 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#60a5fa]" />
                </div>
            </div>
        </div>
    )
}

