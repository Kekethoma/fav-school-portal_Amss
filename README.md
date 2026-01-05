# AMSS Portal - Complete School Management System

A comprehensive academic management system with role-based dashboards, AI-powered tools, automated grading, and promotion workflows.

## 🎨 Color Scheme

- **Primary**: Maroon (#800020)
- **Secondary**: Yellow/Gold (#FFD700)
- **Background**: Black + Gray gradients
- **Accent**: White

## ✨ Features

### For Principals
- ✅ Full system access and control
- ✅ Register students and teachers
- ✅ Manage academic years, subjects, and classes
- ✅ View comprehensive reports and analytics
- ✅ System-wide dashboard with metrics

### For Teachers
- ✅ Enter and manage student grades (CA1, CA2, Exam)
- ✅ AI Lesson Planner
- ✅ AI Progress Reports Generator
- ✅ Teaching Resources Library with AI tagging
- ✅ View assigned classes only

### For Students
- ✅ View grades and results
- ✅ Track performance and class position
- ✅ Download report cards (PDF)
- ✅ AI Academic Advisor chatbot
- ✅ Performance trend charts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key
- Resend API key

### Installation

```bash
# Install dependencies
npm install

# Create .env file from template
copy env.example.txt .env

# Update .env with your credentials:
# - DATABASE_URL
# - GOOGLE_AI_API_KEY  
# - RESEND_API_KEY
# - NEXTAUTH_SECRET

# Initialize database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
amss_portal/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── login/page.tsx                # Login page
│   ├── principal/dashboard/page.tsx  # Principal dashboard
│   ├── teacher/dashboard/page.tsx    # Teacher dashboard (TO CREATE)
│   ├── student/dashboard/page.tsx    # Student dashboard (TO CREATE)
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts        # Login API
│       │   └── logout/route.ts       # Logout API
│       ├── students/route.ts         # Student management (TO CREATE)
│       ├── teachers/route.ts         # Teacher management (TO CREATE)
│       ├── grades/route.ts           # Grade entry (TO CREATE)
│       ├── results/
│       │   ├── calculate-term/route.ts   # Term results (TO CREATE)
│       │   └── calculate-annual/route.ts # Annual results (TO CREATE)
│       └── ai/
│           ├── lesson-plan/route.ts      # AI lesson planner (TO CREATE)
│           ├── progress-report/route.ts  # AI progress reports (TO CREATE)
│           └── advisor/route.ts          # AI chatbot (TO CREATE)
├── components/
│   ├── ui/
│   │   ├── card.tsx                  # Card component
│   │   └── button.tsx                # Button component
│   └── dashboard/
│       └── stats-card.tsx            # Stats card component
├── lib/
│   ├── db.ts                         # Prisma client
│   ├── utils.ts                      # Utility functions
│   ├── auth.ts                       # Password utilities
│   ├── session.ts                    # Session management
│   ├── email.ts                      # Email service
│   ├── ai.ts                         # AI service
│   ├── grade-calculator.ts           # Grade calculation
│   ├── id-generator.ts               # ID generation
│   └── promotion.ts                  # Promotion logic
├── prisma/
│   └── schema.prisma                 # Database schema
├── tailwind.config.ts                # Tailwind config
└── app/globals.css                   # Global styles

```

## 🗄️ Database Schema

### Tables Created
- **users** - User authentication
- **students** - Student profiles
- **teachers** - Teacher profiles
- **classes** - Class information
- **subjects** - Subject catalog
- **academic_years** - Academic years
- **teacher_assignments** - Teacher-class-subject assignments
- **grades** - Individual grade entries
- **term_results** - Calculated term results
- **annual_results** - Annual results with promotion status
- **lesson_plans** - AI-generated lesson plans
- **teaching_resources** - Teaching materials library

## 🔐 Authentication Flow

1. User logs in with email/password
2. Server verifies credentials against database
3. JWT token created and stored in HTTP-only cookie
4. User redirected to role-specific dashboard
5. Middleware protects all dashboard routes

## 📊 Grading System

- **CA1**: 0-20 points
- **CA2**: 0-20 points
- **Exam**: 0-60 points
- **Total**: 0-100 points

### Grade Boundaries
- A: 80-100 (Excellent)
- B: 70-79 (Very Good)  
- C: 60-69 (Good)
- D: 50-59 (Pass)
- E: 40-49 (Weak)
- F: 0-39 (Fail)

### Promotion Logic
- Annual Average = (Term1 + Term2 + Term3) / 3
- Promoted if Average ≥ 50%
- Repeated if Average < 50%

## 🤖 AI Features

### Google Gemini Integration
- **Lesson Planner**: Generates detailed lesson plans
- **Progress Reports**: Creates personalized student reports
- **Academic Advisor**: Chatbot for study help
- **Resource Tagging**: Auto-tags teaching materials

## 📧 Email Notifications

### Invitation Emails
- Sent when students/teachers are registered
- Contains auto-generated credentials
- Branded HTML templates

### Results Notifications
- Sent when term results are published
- Shows average and position
- Links to full results

## 🎯 Remaining Tasks

### Priority 1 - Core Functionality
1. Create Teacher Dashboard page
2. Create Student Dashboard page
3. Create Student Registration page (Principal)
4. Create Teacher Registration page (Principal)
5. Create Grade Entry page (Teacher)
6. Create Results Calculation API routes

### Priority 2 - Additional Features
7. Create Students List page (Principal)
8. Create Teachers List page (Principal)
9. Create AI Lesson Planner page (Teacher)
10. Create AI Academic Advisor page (Student)
11. Create Teaching Resources page (Teacher)
12. Create Results View page (Student)

### Priority 3 - Reports & Settings
13. Create PDF Report Generator
14. Create CSV Export functionality
15. Create Settings/Configuration page
16. Create Subject & Class Management pages

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma studio          # Open database GUI
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema to database
npx prisma migrate dev     # Create migration

# Type checking
npm run type-check
```

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```
DATABASE_URL=your-postgres-connection-string
NEXTAUTH_SECRET=random-secure-string
GOOGLE_AI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_NAME=AMSS Portal
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📝 Usage Guide

### Registering Students (Principal)
1. Navigate to Students → Register
2. Fill in student details
3. System generates student ID (STU-2024-001)
4. Invitation email sent automatically

### Entering Grades (Teacher)
1. Navigate to Grade Entry
2. Select: Academic Year, Term, Class, Subject
3. Enter CA1, CA2, Exam for each student
4. System auto-calculates Total, Grade, Remark
5. Save grades

### Calculating Results (Principal/Teacher)
1. Navigate to Results
2. Select: Academic Year, Term, Class
3. Click "Calculate Term Results"
4. System ranks students and stores results

### Processing Promotions (Principal)
1. After Term 3 completion
2. Click "Process Annual Results & Promotions"
3. System calculates annual average
4. Auto-promotes students with 50%+
5. Sends email notifications

## 🎨 UI Components

All components use the custom color scheme:
- Primary actions: Maroon buttons
- Secondary actions: Yellow buttons
- Cards: Semi-transparent with backdrop blur
- Hover effects: Smooth transitions with shadows
- Gradients: Black to Maroon backgrounds

## 📦 Dependencies

### Core
- Next.js 14+
- React 18+
- TypeScript
- TailwindCSS

### Database & Auth
- Prisma
- PostgreSQL
- bcryptjs
- jose (JWT)

### AI & Email
- @google/generative-ai
- resend

### UI & Charts
- lucide-react (icons)
- recharts (charts)
- react-hook-form
- zod

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

## 📄 License

MIT

## 👥 Support

Contact school administration for support.

---

Built with ❤️ using Next.js, Prisma, and Google Gemini AI
