import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

/**
 * Generate lesson plan using AI
 */
export async function generateLessonPlan(subject: string, topic: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Create a detailed lesson plan for teaching ${topic} in ${subject}. Include:
1. Learning Objectives
2. Materials Needed
3. Introduction (10 mins)
4. Main Content (30 mins)
5. Activities/Practice (15 mins)
6. Conclusion (5 mins)
7. Assessment Methods
8. Homework/Extension Activities

Make it practical and engaging for high school students.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
}

/**
 * Generate personalized progress report using AI
 */
export async function generateProgressReport(
    studentName: string,
    grades: Array<{ subject: string; grade: string; total: number }>
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const gradesText = grades.map(g => `${g.subject}: ${g.total}% (${g.grade})`).join('\n')

    const prompt = `Create a personalized progress report for student ${studentName} based on these grades:

${gradesText}

Include:
1. Overall Performance Summary
2. Strengths
3. Areas for Improvement
4. Specific Recommendations
5. Encouraging Message

Keep it professional, constructive, and motivating. Limit to 250 words.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
}

/**
 * AI Academic Advisor chatbot
 */
export async function chatWithAdvisor(
    studentQuestion: string,
    context?: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `You are an AI Academic Advisor for high school students. Answer the following question helpfully and encouragingly.
${context ? `\nContext: ${context}` : ''}

Student Question: ${studentQuestion}

Provide a clear, helpful, and motivating response. Keep it concise (under 200 words).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
}

/**
 * Auto-tag teaching resources
 */
export async function generateResourceTags(
    fileName: string,
    fileType: string
): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Generate 5-7 relevant tags for a teaching resource file named "${fileName}" of type "${fileType}".
Return only the tags as a comma-separated list, no explanations.
Examples of good tags: mathematics, algebra, worksheets, grade10, geometry, practice-problems, etc.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const tags = response.text().split(',').map(tag => tag.trim().toLowerCase())

    return tags.slice(0, 7) // Limit to 7 tags
}

