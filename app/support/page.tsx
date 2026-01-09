"use client"

import { useState } from "react"
import { HelpCircle, Mail, Phone, ExternalLink, Loader2, CheckCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function SupportPage() {
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [issueCategory, setIssueCategory] = useState("General Inquiry")

    // Modal States
    const [showGrading, setShowGrading] = useState(false)
    const [showVideo, setShowVideo] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
        setSubmitted(true)
        toast.success("Support ticket submitted successfully")
    }

    const handleResetPassword = () => {
        setIssueCategory("Login / Access Issue")
        const formElement = document.getElementById("support-form")
        if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth" })
            toast.info("Please complete the form below to request a password reset.")
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12">

                {/* Info Section */}
                <div className="space-y-8">
                    <div>
                        <HelpCircle className="h-12 w-12 text-primary mb-4" />
                        <h1 className="text-4xl font-bold tracking-tight">Academic Support Center</h1>
                        <p className="text-xl text-muted-foreground mt-2">
                            Need help with the portal? Access resources or contact our support team.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <Card className="border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    Technical Support
                                </CardTitle>
                                <CardDescription>
                                    For login issues, bugs, or account access.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold">ict-support@amss.edu.sl</p>
                                <p className="text-sm text-muted-foreground">Response time: Within 24 hours</p>
                            </CardContent>
                        </Card>

                        <Card className="border-secondary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-secondary" />
                                    Academic Inquiries
                                </CardTitle>
                                <CardDescription>
                                    For grade disputes, subject allocation, or transcript requests.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold">+232 77 000 000</p>
                                <p className="text-sm text-muted-foreground">Mon-Fri: 8:00 AM - 4:00 PM</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="bg-muted/50 p-6 rounded-xl border border-border">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Quick Links
                        </h3>
                        <ul className="space-y-2 text-primary underline-offset-4 cursor-pointer">
                            <li>
                                <button onClick={handleResetPassword} className="hover:underline text-left">
                                    Reset Student Password
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setShowVideo(true)} className="hover:underline text-left">
                                    How to Upload Assignments (Video Guide)
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setShowGrading(true)} className="hover:underline text-left">
                                    Grading Scheme Explained
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Form */}
                <div id="support-form" className="bg-card rounded-2xl border border-border p-8 shadow-lg">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                            <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold">Ticket Submitted!</h2>
                            <p className="text-muted-foreground">
                                Your request has been forwarded to the relevant department. <br />
                                Ticket ID: #ASK-{Math.floor(Math.random() * 10000)}
                            </p>
                            <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4">
                                Submit Another Request
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2">Submit a Request</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Please provide detailed information to help us assist you faster.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input placeholder="e.g. John Doe" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <option>Student</option>
                                    <option>Parent/Guardian</option>
                                    <option>Teacher</option>
                                    <option>Administrator</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Issue Category</label>
                                <select
                                    value={issueCategory}
                                    onChange={(e) => setIssueCategory(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option>Login / Access Issue</option>
                                    <option>Grade / Transcript Query</option>
                                    <option>Technical Bug Report</option>
                                    <option>General Inquiry</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                    placeholder="Describe your issue in detail..."
                                    className="min-h-[120px]"
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full font-bold">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Request
                            </Button>
                        </form>
                    )}
                </div>

            </div>

            {/* Grading Scheme Modal */}
            <Dialog open={showGrading} onOpenChange={setShowGrading}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Grading Scheme</DialogTitle>
                        <DialogDescription>
                            The official AMSS grading scale used for all academic assessments.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Score Range</th>
                                    <th className="px-4 py-3">Grade</th>
                                    <th className="px-4 py-3">Remark</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr><td className="px-4 py-3">75 - 100</td><td className="px-4 py-3 font-bold text-green-600">A</td><td className="px-4 py-3">Excellent</td></tr>
                                <tr><td className="px-4 py-3">65 - 74</td><td className="px-4 py-3 font-bold text-blue-600">B</td><td className="px-4 py-3">Very Good</td></tr>
                                <tr><td className="px-4 py-3">55 - 64</td><td className="px-4 py-3 font-bold text-yellow-600">C</td><td className="px-4 py-3">Good</td></tr>
                                <tr><td className="px-4 py-3">50 - 54</td><td className="px-4 py-3 font-bold text-orange-600">D</td><td className="px-4 py-3">Credit</td></tr>
                                <tr><td className="px-4 py-3">40 - 49</td><td className="px-4 py-3 font-bold text-orange-800">E</td><td className="px-4 py-3">Pass</td></tr>
                                <tr><td className="px-4 py-3">0 - 39</td><td className="px-4 py-3 font-bold text-red-600">F</td><td className="px-4 py-3">Fail</td></tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Video Guide Modal */}
            <Dialog open={showVideo} onOpenChange={setShowVideo}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>How to Upload Assignments</DialogTitle>
                        <DialogDescription>A step-by-step guide for students.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 aspect-video bg-black/90 rounded-lg flex flex-col items-center justify-center text-white relative group cursor-pointer overflow-hidden">
                        {/* Fake Video Player UI */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        <Play className="h-16 w-16 fill-white opacity-90 group-hover:scale-110 transition-transform z-10" />
                        <p className="mt-4 font-medium z-10">Video Placeholder</p>
                        <p className="text-sm text-gray-400 z-10">(Video integration requires external hosting)</p>

                        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 z-10">
                            <div className="h-1 flex-1 bg-gray-600 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-red-600"></div>
                            </div>
                            <span className="text-xs">01:24 / 04:30</span>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p>1. Log in to your Student Dashboard.</p>
                        <p>2. Navigate to "My Assignments" in the side menu.</p>
                        <p>3. Click on the pending assignment card.</p>
                        <p>4. Use the "Upload Submission" area to drag & drop your file.</p>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
