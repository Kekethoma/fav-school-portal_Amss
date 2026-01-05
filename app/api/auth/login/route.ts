import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json()

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { error: 'Login ID and password are required' },
                { status: 400 }
            )
        }

        // Find user by username
        const user = await db.user.findUnique({
            where: { username },
            include: {
                student: true,
                teacher: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid Login ID or password' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid Login ID or password' },
                { status: 401 }
            )
        }

        // Create session token
        const token = await new SignJWT({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret'))

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        )
    }
}

