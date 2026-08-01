import React from 'react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ResourcesClient from './ResourcesClient'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return <ResourcesClient initialResources={resources} />
}
