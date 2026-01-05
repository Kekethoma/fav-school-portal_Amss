/**
 * Calculate grade letter and remark based on total score
 * @param total - Total score (0-100)
 * @returns Object containing grade letter and remark
 */
export function calculateGrade(total: number): { grade: string; remark: string } {
    if (total >= 75) {
        return { grade: 'A1', remark: 'Excellent' }
    } else if (total >= 70) {
        return { grade: 'B2', remark: 'Very Good' }
    } else if (total >= 65) {
        return { grade: 'B3', remark: 'Good' }
    } else if (total >= 60) {
        return { grade: 'C4', remark: 'Credit' }
    } else if (total >= 55) {
        return { grade: 'C5', remark: 'Credit' }
    } else if (total >= 50) {
        return { grade: 'C6', remark: 'Credit' }
    } else if (total >= 45) {
        return { grade: 'D7', remark: 'Pass' }
    } else if (total >= 40) {
        return { grade: 'E8', remark: 'Pass' }
    } else {
        return { grade: 'F9', remark: 'Fail' }
    }
}

/**
 * Calculate total from CA1, CA2, and Exam scores
 * @param ca1 - Continuous Assessment 1 (max 20)
 * @param ca2 - Continuous Assessment 2 (max 20)
 * @param exam - Exam score (max 60)
 * @returns Total score
 */
export function calculateTotal(ca1: number, ca2: number, exam: number): number {
    return ca1 + ca2 + exam
}

/**
 * Validate grade input values
 */
export function validateGradeInputs(ca1: number, ca2: number, exam: number): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (ca1 < 0 || ca1 > 20) {
        errors.push('CA1 must be between 0 and 20')
    }

    if (ca2 < 0 || ca2 > 20) {
        errors.push('CA2 must be between 0 and 20')
    }

    if (exam < 0 || exam > 60) {
        errors.push('Exam must be between 0 and 60')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

