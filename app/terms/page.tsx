"use client"

import { Gavel, Book, Users, AlertTriangle } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <Gavel className="h-16 w-16 mx-auto text-primary" />
                    <h1 className="text-4xl font-bold tracking-tight">Terms of Service & Code of Conduct</h1>
                    <p className="text-xl text-muted-foreground">
                        Guidelines for the responsible use of the AMSS Portal.
                    </p>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
                    <p className="text-lg leading-relaxed">
                        Access to the Academic Management & Support System (AMSS) is a privilege granted to active members of the school community. By logging in, you agree to adhere to the following terms, which align with our broader School Code of Conduct.
                    </p>

                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4 text-secondary">
                            <Book className="h-6 w-6" /> 1. Acceptable Use Policy
                        </h2>
                        <p>The portal is strictly for educational purposes.</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Students:</strong> May use the portal to check grades, access learning materials, and communicate with instructors regarding coursework.</li>
                            <li><strong>Staff:</strong> Must use the portal for official duties including grading, attendance, and administrative reporting.</li>
                            <li><strong>Prohibited:</strong> Any attempt to bypass security, access other users' accounts, or upload inappropriate content is strictly forbidden.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4 text-secondary">
                            <Users className="h-6 w-6" /> 2. Community Standards
                        </h2>
                        <p>
                            Digital interactions on AMSS are subject to the same behavioral expectations as physical classroom interactions.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Respect:</strong> All communications (comments, messages, feedback) must be respectful and professional.</li>
                            <li><strong>Cyberbullying:</strong> Zero tolerance policy for harassment or bullying via the portal's communication tools.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4 text-secondary">
                            <AlertTriangle className="h-6 w-6" /> 3. Account Security
                        </h2>
                        <p>
                            Users are responsible for the security of their accounts.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Do not share your password with anyone, including friends or siblings.</li>
                            <li>Always log out when using a public or shared computer (e.g., in the computer lab).</li>
                            <li>Report any suspicious account activity to the ICT Department immediately.</li>
                        </ul>
                    </section>

                    <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4 text-secondary">
                            4. Accuracy of Records
                        </h2>
                        <p>
                            While we strive for 100% accuracy, errors in data entry may occur.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong>Disputes:</strong> Any discrepancy in grades or attendance records must be reported to the relevant teacher or the Principal's office within 14 days of publication.</li>
                            <li><strong>Final Authority:</strong> The physical records held by the Administration Office take precedence in the event of a conflict with digital records.</li>
                        </ul>
                    </section>

                    <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                        <p>School Administration reserves the right to suspend access for any violations of these terms.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
