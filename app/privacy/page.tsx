"use client"

import { Shield, Lock, FileText, UserCheck, Eye } from "lucide-react"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <Shield className="h-16 w-16 mx-auto text-primary" />
                    <h1 className="text-4xl font-bold tracking-tight">Student & Staff Privacy Policy</h1>
                    <p className="text-xl text-muted-foreground">
                        Protecting the integrity and confidentiality of your academic records.
                    </p>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4 text-primary">
                            <Lock className="h-6 w-6" /> Data Collection & Purpose
                        </h2>
                        <p>
                            The Academic Management & Support System (AMSS) collects personal and academic data solely for educational administration. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Student Records:</strong> Grades, attendance, medical alerts, and disciplinary records.</li>
                            <li><strong>Staff Information:</strong> Professional qualifications, teaching schedules, and payroll data.</li>
                            <li><strong>Parent/Guardian Details:</strong> Contact information for emergency and communication purposes.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4 text-primary">
                            <Eye className="h-6 w-6" /> Information Visibility
                        </h2>
                        <p>
                            We enforce strict Role-Based Access Control (RBAC) to ensure data privacy:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Principals</strong> have full oversight of school operations.</li>
                            <li><strong>Teachers</strong> can only access records for students in their specific classes.</li>
                            <li><strong>Students/Parents</strong> can only view their own performance data and relevant school announcements.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4 text-primary">
                            <FileText className="h-6 w-6" /> Academic Integrity
                        </h2>
                        <p>
                            All data entered into the AMSS, including grades and assessments, is treated as an official academic record. Unsanctioned alteration or dissemination of this data is a violation of school policy and may result in disciplinary action.
                        </p>
                    </section>

                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4 text-primary">
                            <UserCheck className="h-6 w-6" /> Third-Party Sharing
                        </h2>
                        <p>
                            Your data is never sold to third parties. We may share limited data with:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Ministry of Education:</strong> For statutory reporting and national assessments.</li>
                            <li><strong>Examination Bodies:</strong> For candidate registration (e.g., WAEC, NECO).</li>
                        </ul>
                    </section>

                    <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                        <p>Last Updated: January 2026</p>
                        <p>For privacy inquiries, contact the School Administration Office.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
