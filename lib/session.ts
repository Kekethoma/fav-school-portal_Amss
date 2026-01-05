import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export interface SessionUser {
    id: string
    email: string
    role: 'PRINCIPAL' | 'TEACHER' | 'STUDENT'
    name: string
}

export async function getSession(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('session')?.value

        if (!token) {
            return null
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'secret')
        )

        return (payload as unknown) as SessionUser
    } catch {
        return null
    }
}

export async function requireAuth(allowedRoles?: string[]) {
    const session = await getSession()

    if (!session) {
        throw new Error('Unauthorized')
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
        throw new Error('Forbidden')
    }

    return session
}

