import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: ReactNode
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-[#1e40af] text-white hover:bg-[#3b82f6] hover:shadow-lg',
        secondary: 'bg-[#60a5fa] text-black hover:bg-[#3b82f6] hover:shadow-lg hover:shadow-yellow-500/50',
        outline: 'border-2 border-white/20 text-white hover:bg-white/10',
        ghost: 'text-white hover:bg-white/10'
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-2.5 text-base',
        lg: 'px-8 py-3 text-lg'
    }

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    )
}

