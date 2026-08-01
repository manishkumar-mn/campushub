import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PlacementClient from './PlacementClient'

export const dynamic = 'force-dynamic'

export default async function PlacementPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return <PlacementClient initialApplications={applications} />
}
