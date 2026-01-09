'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Users, BookOpen, Quote, CheckCircle2, Shield, ArrowRight } from 'lucide-react'

const QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { text: "Investment in knowledge pays the best interest.", author: "Benjamin Franklin" }
]

const BENEFITS = [
  "Critical Thinking & Problem Solving",
  "Career Opportunities & Economic Growth",
  "Social & Personal Development",
  "Digital Literacy & Future Readiness",
  "Global Awareness & Citizenship"
]

import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-[#facc15] selection:text-black font-sans dark:bg-black dark:text-white">
      {/* Dynamic Background Overlay */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#16a34a]/10 dark:bg-[#16a34a]/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#facc15]/5 dark:bg-[#facc15]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-border bg-background/50 dark:border-white/10 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-[#16a34a] to-[#1e3a8a] p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-[#facc15]" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">AMSS Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-6 py-2.5 bg-[#facc15] text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                Portal Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero & Quotes Section */}
        <header className="relative py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fadeIn">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/30 text-[#facc15] text-sm font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#facc15] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#facc15]"></span>
                </span>
                Academic Excellence
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter">
                SHAPING <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] to-[#93c5fd]">FUTURES</span> THROUGH KNOWLEDGE.
              </h1>

              {/* Benefits List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex items-center space-x-3 text-gray-400 group">
                    <CheckCircle2 className="h-5 w-5 text-[#16a34a] group-hover:text-[#facc15] transition-colors" />
                    <span className="font-medium group-hover:text-white transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 relative overflow-hidden group min-h-[300px] flex flex-col justify-center">
                <Quote className="absolute top-8 left-8 h-12 w-12 text-[#16a34a] opacity-20" />
                <div className="relative z-10 space-y-6">
                  <p className="text-3xl font-serif italic text-white/90 leading-snug animate-fadeIn" key={quoteIndex}>
                    &quot;{QUOTES[quoteIndex].text}&quot;
                  </p>
                  <p className="text-[#facc15] font-bold tracking-widest uppercase text-sm">
                    — {QUOTES[quoteIndex].author}
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#facc15]/5 blur-2xl rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Role-Based Portal Access */}
        <section className="py-24 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Access Your Portal</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Select your role to securely access the Academic Management & Support System.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Principal Card */}
              <Link href="/login" className="group">
                <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-[#16a34a] to-[#1e3a8a] border border-[#16a34a]/50 group-hover:scale-105 group-hover:-rotate-1 transition-all duration-500 shadow-2xl">
                  <Shield className="h-12 w-12 text-[#facc15] mb-6" />
                  <h3 className="text-2xl font-black uppercase mb-4">Principal</h3>
                  <p className="text-white/70 mb-8 line-clamp-3">Full administrative oversight, management of staff/students, and comprehensive data analytics for institutional growth.</p>
                  <div className="flex items-center text-[#facc15] font-bold uppercase tracking-widest text-sm">
                    Enter Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Teacher Card */}
              <Link href="/login" className="group">
                <div className="h-full p-8 rounded-3xl bg-neutral-900 border border-white/10 group-hover:scale-105 group-hover:rotate-1 transition-all duration-500 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#facc15]/5 to-transparent pointer-events-none" />
                  <Users className="h-12 w-12 text-[#facc15] mb-6" />
                  <h3 className="text-2xl font-black uppercase mb-4 text-white">Teacher</h3>
                  <p className="text-gray-400 mb-8 line-clamp-3">Manage class resources, perform attendance tracking, record assessment scores, and utilize AI-powered lesson planning tools.</p>
                  <div className="flex items-center text-[#facc15] font-bold uppercase tracking-widest text-sm">
                    Access Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Student Card */}
              <Link href="/login" className="group">
                <div className="h-full p-8 rounded-3xl bg-neutral-900 border border-white/10 group-hover:scale-105 transition-all duration-500 shadow-2xl border-b-4 border-b-[#16a34a]">
                  <BookOpen className="h-12 w-12 text-[#facc15] mb-6" />
                  <h3 className="text-2xl font-black uppercase mb-4 text-white">Student</h3>
                  <p className="text-gray-400 mb-8 line-clamp-3">View academic performance trends, access learning materials, consult your AI advisor, and download seasonal report cards.</p>
                  <div className="flex items-center text-[#facc15] font-bold uppercase tracking-widest text-sm">
                    Enter Portal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="py-12 px-6 border-t border-white/10 bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-[#facc15]" />
              <span className="font-black uppercase tracking-tighter">AMSS Portal</span>
            </div>
            <p className="text-gray-500 text-sm font-medium">© 2025 Academic Management & Support System. All Rights Reserved.</p>
            <div className="flex space-x-8 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

