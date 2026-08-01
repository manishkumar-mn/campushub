import React, { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

// Skeleton Loader for Dashboard
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-5 w-96 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-[20px]"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-zinc-800 rounded-[20px]"></div>
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-[20px]"></div>
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-[20px]"></div>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [notesCount, groupsCount, eventsCount, appsCount] = await Promise.all([
    prisma.note.count(),
    prisma.group.count(),
    prisma.event.count({ where: { date: { gte: new Date() } } }),
    prisma.application.count({ where: { userId: session.user.id } })
  ])

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient 
        user={{ name: session.user.name ?? null }}
        stats={{ notes: notesCount, groups: groupsCount, events: eventsCount, apps: appsCount }}
      />
    </Suspense>
  )
}
