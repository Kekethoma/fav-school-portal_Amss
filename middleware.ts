import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('session')?.value

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')
        )

        const role = payload.role as string
        const path = request.nextUrl.pathname

        // Role-based access control
        if (path.startsWith('/principal') && role !== 'PRINCIPAL') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (path.startsWith('/teacher') && role !== 'TEACHER') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        if (path.startsWith('/student') && role !== 'STUDENT') {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Security Headers
        const response = NextResponse.next()
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

        return response

    } catch (error) {
        // Token invalid or expired
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: [
        '/principal/:path*',
        '/teacher/:path*',
        '/student/:path*',
    ],
}

