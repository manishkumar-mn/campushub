import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campushub.edu' },
    update: { password: hashedPassword },
    create: {
      name: 'Admin User',
      email: 'admin@campushub.edu',
      password: hashedPassword,
      role: 'ADMIN',
      branch: 'CSE',
      year: 4,
      bio: 'System Administrator',
      skills: 'Management, IT Support',
    },
  })

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@campushub.edu' },
    update: { password: hashedPassword },
    create: {
      name: 'Alice Smith',
      email: 'student1@campushub.edu',
      password: hashedPassword,
      role: 'STUDENT',
      branch: 'ECE',
      year: 2,
      bio: 'Electronics enthusiast.',
      skills: 'C++, Arduino, Python',
    },
  })

  const faculty = await prisma.user.upsert({
    where: { email: 'dr.brown@campushub.edu' },
    update: { password: hashedPassword },
    create: {
      name: 'Dr. Robert Brown',
      email: 'dr.brown@campushub.edu',
      password: hashedPassword,
      role: 'FACULTY',
      branch: 'Mechanical',
      bio: 'Professor of Thermodynamics.',
      skills: 'Research, Teaching',
    },
  })

  // Create a Study Group
  const group1 = await prisma.group.create({
    data: {
      name: 'React Developers',
      description: 'A group for discussing Next.js and React.',
      ownerId: admin.id,
      category: 'Web Dev',
      members: {
        create: [
          { userId: admin.id },
          { userId: student1.id }
        ]
      }
    }
  })

  // Create a Note
  const note1 = await prisma.note.create({
    data: {
      title: 'Data Structures and Algorithms',
      description: 'Comprehensive notes for DSA using Java.',
      subject: 'Computer Science',
      branch: 'CSE',
      semester: 3,
      fileUrl: '#',
      uploaderId: admin.id,
      rating: 4.8,
      verified: true,
      downloadsCount: 15,
      views: 120
    }
  })

  // Create a Question
  const question1 = await prisma.question.create({
    data: {
      title: 'How to implement a Red-Black Tree?',
      description: 'I am struggling with the balancing logic in a Red-Black tree insertion.',
      tags: 'DSA, Trees',
      userId: student1.id,
      votes: 5
    }
  })

  // Create an Event
  const event1 = await prisma.event.create({
    data: {
      title: 'Annual Tech Symposium',
      description: 'A 2-day event with hackathons, workshops, and guest lectures.',
      venue: 'Main Auditorium',
      date: new Date('2026-09-15T09:00:00Z'),
      organizer: 'Tech Club',
    }
  })

  // Add Department Wise Practice Sets and Manuals (Resources)
  await prisma.resource.createMany({
    data: [
      {
        title: 'CSE 4th Sem Syllabus & Lab Manual',
        category: 'CSE',
        type: 'Syllabus / Manuals',
        fileUrl: '#',
        downloads: 25,
        uploaderId: admin.id,
      },
      {
        title: 'Data Structures Practice Set 1',
        category: 'CSE',
        type: 'Practice Sets',
        fileUrl: '#',
        downloads: 42,
        uploaderId: admin.id,
      },
      {
        title: 'ECE Digital Electronics Manual',
        category: 'ECE',
        type: 'Syllabus / Manuals',
        fileUrl: '#',
        downloads: 12,
        uploaderId: faculty.id,
      },
      {
        title: 'Mechanical Thermodynamics Practice Set',
        category: 'Mechanical',
        type: 'Practice Sets',
        fileUrl: '#',
        downloads: 5,
        uploaderId: faculty.id,
      },
    ]
  })

  // Add more department questions
  await prisma.question.createMany({
    data: [
      {
        title: 'How to approach BJT biasing in circuits?',
        description: 'I need some help understanding the different BJT biasing techniques for the ECE midterms.',
        tags: 'ECE, Electronics, BJT',
        userId: student1.id,
        votes: 3,
      },
      {
        title: 'Best resources for Mechanical CAD lab?',
        description: 'Does anyone have the latest manual for the AutoCAD lab assignments?',
        tags: 'Mechanical, CAD, Lab',
        userId: student1.id,
        votes: 8,
      },
    ]
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
