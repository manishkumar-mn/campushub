import React from 'react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventsClient from './EventsClient'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const [upcomingEvents, userRegistrations] = await Promise.all([
    prisma.event.findMany({
      orderBy: { date: 'asc' },
      where: { date: { gte: new Date() } }
    }),
    prisma.eventRegistration.findMany({
      where: { userId: session.user.id },
      include: { event: true }
    })
  ])

  return (
    <EventsClient
      upcomingEvents={upcomingEvents}
      userRegistrations={userRegistrations}
    />
  )
}
