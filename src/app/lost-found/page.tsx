import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LostFoundClient from './LostFoundClient'

export const dynamic = 'force-dynamic'

export default async function LostFoundPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const items = await prisma.lostFoundItem.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <LostFoundClient initialItems={items} currentUserId={session.user.id} />
}
