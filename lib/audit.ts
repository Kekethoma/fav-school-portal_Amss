import { db } from './db'

/**
 * Logs an administrative action to the AuditLog table
 */
export async function logAction(userId: string, action: string, details: string) {
    try {
        await db.auditLog.create({
            data: {
                userId,
                action,
                details
            }
        })
    } catch (error) {
        console.error('Failed to log action:', error)
    }
}

/**
 * Sends an in-app notification to a user
 */
export async function sendNotification(userId: string, title: string, message: string) {
    try {
        await db.notification.create({
            data: {
                userId,
                title,
                message
            }
        })
    } catch (error) {
        console.error('Failed to send notification:', error)
    }
}

