import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
    children: ReactNode
    className?: string
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={cn('bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg', className)}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className }: CardProps) {
    return (
        <div className={cn('p-6 pb-4', className)}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className }: CardProps) {
    return (
        <h3 className={cn('text-xl font-semibold text-white', className)}>
            {children}
        </h3>
    )
}

export function CardDescription({ children, className }: CardProps) {
    return (
        <p className={cn('text-sm text-gray-400 mt-1', className)}>
            {children}
        </p>
    )
}

export function CardContent({ children, className }: CardProps) {
    return (
        <div className={cn('p-6 pt-0', className)}>
            {children}
        </div>
    )
}

