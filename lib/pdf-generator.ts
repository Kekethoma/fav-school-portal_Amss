import jsPDF from 'jspdf'

interface ReportCardData {
    studentName: string
    studentId: string
    className: string
    term: number
    academicYear: string
    grades: Array<{
        subject: string
        ca1: number
        ca2: number
        exam: number
        total: number
        grade: string
        remark: string
    }>
    average: number
    position: number
}

export function generateReportCardPDF(data: ReportCardData) {
    const doc = new jsPDF()
    const margin = 20
    let y = 30

    // Header
    doc.setFillColor(128, 0, 32) // Maroon
    doc.rect(0, 0, 210, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('AMSS PORTAL - REPORT CARD', 105, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`${data.academicYear} - Term ${data.term}`, 105, 30, { align: 'center' })

    // Student Info
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    y = 55
    doc.text(`Student Name: ${data.studentName}`, margin, y)
    doc.text(`Student ID: ${data.studentId}`, 150, y)
    y += 10
    doc.text(`Class: ${data.className}`, margin, y)

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y + 5, 190, y + 5)
    y += 20

    // Table Header
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('SUBJECT', margin, y)
    doc.text('CA1', 80, y)
    doc.text('CA2', 100, y)
    doc.text('EXAM', 120, y)
    doc.text('TOTAL', 140, y)
    doc.text('GRADE', 160, y)
    doc.text('REMARK', 180, y)

    y += 5
    doc.line(margin, y, 190, y)
    y += 10

    // Table Content
    doc.setTextColor(0, 0, 0)
    data.grades.forEach(g => {
        doc.text(g.subject, margin, y)
        doc.text(g.ca1.toString(), 80, y)
        doc.text(g.ca2.toString(), 100, y)
        doc.text(g.exam.toString(), 120, y)
        doc.text(g.total.toString(), 140, y)
        doc.text(g.grade, 160, y)
        doc.text(g.remark, 180, y)
        y += 10
    })

    // Summary
    y += 10
    doc.line(margin, y, 190, y)
    y += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`AVERAGE SCORE: ${data.average.toFixed(1)}%`, margin, y)
    doc.text(`CLASS POSITION: ${data.position}`, 150, y)

    // Footer
    y = 280
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text('This is a computer-generated report card and does not require a physical signature.', 105, y, { align: 'center' })

    doc.save(`${data.studentId}_ReportCard_T${data.term}.pdf`)
}

