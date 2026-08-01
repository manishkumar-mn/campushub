import React from 'react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPanelPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  // Fetch ALL real data from database
  const [users, notes, resources, groups, questions, events] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        branch: true, createdAt: true, image: true,
        _count: { select: { notes: true, resources: true, memberships: true } }
      }
    }),
    prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
      include: { uploader: { select: { name: true, email: true } } }
    }),
    prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      include: { uploader: { select: { name: true, email: true } } }
    }),
    prisma.group.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } } }
    }),
    prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } }, _count: { select: { answers: true } } }
    }),
    prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: { _count: { select: { registrations: true } } }
    }),
  ])

  const stats = {
    totalUsers: users.length,
    totalNotes: notes.length,
    totalResources: resources.length,
    totalGroups: groups.length,
    totalQuestions: questions.length,
    totalEvents: events.length,
    adminCount: users.filter(u => u.role === 'ADMIN').length,
    facultyCount: users.filter(u => u.role === 'FACULTY').length,
  }

  return (
    <AdminClient
      adminName={session.user.name ?? 'Admin'}
      stats={stats}
      users={users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        notesCount: u._count.notes,
        resourcesCount: u._count.resources,
        groupsCount: u._count.memberships,
      }))}
      notes={notes.map(n => ({
        id: n.id, title: n.title, subject: n.subject, branch: n.branch,
        semester: n.semester, uploaderName: n.uploader.name,
        createdAt: n.createdAt.toISOString(), downloads: n.downloadsCount,
      }))}
      resources={resources.map(r => ({
        id: r.id, title: r.title, category: r.category, type: r.type,
        uploaderName: r.uploader.name, createdAt: r.createdAt.toISOString(),
        downloads: r.downloads,
      }))}
      groups={groups.map(g => ({
        id: g.id, name: g.name, description: g.description ?? '',
        memberCount: g._count.members, createdAt: g.createdAt.toISOString(),
      }))}
      questions={questions.map(q => ({
        id: q.id, title: q.title, authorName: q.author.name,
        answerCount: q._count.answers, solved: q.solved,
        createdAt: q.createdAt.toISOString(),
      }))}
      events={events.map(e => ({
        id: e.id, title: e.title, date: e.date.toISOString(),
        registrations: e._count.registrations,
      }))}
    />
  )
}
