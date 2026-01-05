import { db } from './db'

/**
 * Generate unique student ID
 * Format: STU-YYYY-XXX
 */
export async function generateStudentId(): Promise<string> {
    const year = new Date().getFullYear()

    // Get count of students created this year
    const count = await db.student.count({
        where: {
            studentId: {
                startsWith: `STU-${year}-`
            }
        }
    })

    const nextNumber = (count + 1).toString().padStart(3, '0')
    return `STU-${year}-${nextNumber}`
}

/**
 * Generate unique teacher ID
 * Format: TCH-YYYY-XXX
 */
export async function generateTeacherId(): Promise<string> {
    const year = new Date().getFullYear()

    // Get count of teachers created this year
    const count = await db.teacher.count({
        where: {
            teacherId: {
                startsWith: `TCH-${year}-`
            }
        }
    })

    const nextNumber = (count + 1).toString().padStart(3, '0')
    return `TCH-${year}-${nextNumber}`
}

/**
 * Generate random password for new users
 */
export function generateRandomPassword(length: number = 10): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        password += charset[randomIndex]
    }

    return password
}

