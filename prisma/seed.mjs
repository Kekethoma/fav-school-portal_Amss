import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // 1. Clean up existing data (optional, be careful in production)
    // await prisma.grade.deleteMany();
    // await prisma.student.deleteMany();
    // await prisma.class.deleteMany();
    // await prisma.user.deleteMany();

    // 2. Create Academic Year (2025/2026)
    const academicYear = await prisma.academicYear.create({
        data: {
            name: '2025/2026',
            startDate: new Date('2025-09-08'),
            endDate: new Date('2026-07-17'),
            isCurrent: true
        }
    });

    console.log(`Created Academic Year: ${academicYear.name}`);

    // 3. Create Classes (JSS 1-3, SSS 1-3)
    const classesData = [
        { name: 'JSS 1', section: 'A', gradeLevel: 7 },
        { name: 'JSS 1', section: 'B', gradeLevel: 7 },
        { name: 'JSS 2', section: 'A', gradeLevel: 8 },
        { name: 'JSS 2', section: 'B', gradeLevel: 8 },
        { name: 'JSS 3', section: 'A', gradeLevel: 9 },
        { name: 'JSS 3', section: 'B', gradeLevel: 9 },
        { name: 'SSS 1', section: 'Science', gradeLevel: 10 },
        { name: 'SSS 1', section: 'Arts', gradeLevel: 10 },
        { name: 'SSS 1', section: 'Commercial', gradeLevel: 10 },
        { name: 'SSS 2', section: 'Science', gradeLevel: 11 },
        { name: 'SSS 2', section: 'Arts', gradeLevel: 11 },
        { name: 'SSS 2', section: 'Commercial', gradeLevel: 11 },
        { name: 'SSS 3', section: 'Science', gradeLevel: 12 },
        { name: 'SSS 3', section: 'Arts', gradeLevel: 12 },
        { name: 'SSS 3', section: 'Commercial', gradeLevel: 12 },
    ];

    for (const c of classesData) {
        await prisma.class.create({ data: c });
    }
    console.log('Created Classes (JSS/SSS)');

    // 4. Create Subjects
    // JSS Core
    const jssSubjects = ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'French', 'Business Studies', 'Home Economics', 'Agricultural Science'];
    // SSS Core
    const sssCore = ['Mathematics', 'English Language'];
    // SSS Electives
    const sssScience = ['Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'ICT'];
    const sssArts = ['Literature-in-English', 'Government', 'History', 'Religious Moral Education'];
    const sssCommercial = ['Financial Accounting', 'Commerce', 'Economics', 'Cost Accounting'];

    const allSubjects = [...new Set([...jssSubjects, ...sssCore, ...sssScience, ...sssArts, ...sssCommercial])];

    for (const s of allSubjects) {
        const code = s.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000); // Simple code generation
        await prisma.subject.create({
            data: {
                name: s,
                code: code,
                description: `${s} Curriculum`
            }
        });
    }
    console.log('Created Subjects');

    // 5. Create Principal User
    const principalPassword = await hash('2006', 10);
    const principal = await prisma.user.upsert({
        where: { username: 'amssMas' },
        update: {},
        create: {
            username: 'amssMas',
            password: principalPassword,
            name: 'Principal Alpha',
            role: 'PRINCIPAL',
            email: 'principal@amss.edu.sl'
        }
    });
    console.log('Created Principal: amssMas');

    // 6. Create a Test Teacher
    const teacherPassword = await hash('teacher123', 10);
    const teacherUser = await prisma.user.upsert({
        where: { username: 'TCH2025001' },
        update: {},
        create: {
            username: 'TCH2025001',
            password: teacherPassword,
            name: 'Teacher John',
            role: 'TEACHER',
            email: 'teacher.john@amss.edu.sl'
        }
    });

    const teacher = await prisma.teacher.create({
        data: {
            userId: teacherUser.id,
            teacherId: 'TCH2025001'
        }
    });

    // Assign Teacher to SSS 1 Science - Mathematics
    const mathSubject = await prisma.subject.findFirst({ where: { name: 'Mathematics' } });
    const sss1Sci = await prisma.class.findFirst({ where: { name: 'SSS 1', section: 'Science' } });

    if (mathSubject && sss1Sci) {
        await prisma.teacherAssignment.create({
            data: {
                teacherId: teacher.id,
                classId: sss1Sci.id,
                subjectId: mathSubject.id,
                academicYearId: academicYear.id
            }
        });
        console.log('Assigned Teacher to SSS 1 Science - Math');
    }

    // 7. Create a Test Student
    const studentPassword = await hash('student123', 10);
    const studentUser = await prisma.user.upsert({
        where: { username: 'STU2025001' },
        update: {},
        create: {
            username: 'STU2025001',
            password: studentPassword,
            name: 'Student Mary',
            role: 'STUDENT',
            email: 'mary@amss.edu.sl'
        }
    });

    if (sss1Sci) {
        await prisma.student.create({
            data: {
                userId: studentUser.id,
                studentId: 'STU2025001',
                classId: sss1Sci.id,
                department: 'Science',
                guardianName: 'Parent Mary',
                guardianPhone: '077000000',
                guardianEmail: 'parent@example.com'
            }
        });
        console.log('Created Student: STU2025001 in SSS 1 Science');
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
