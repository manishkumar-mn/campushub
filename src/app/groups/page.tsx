import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientGroups from './ClientGroups'

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id

  const rawGroups = await prisma.group.findMany({
    include: {
      members: { select: { userId: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const groups = rawGroups.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    category: g.category,
    memberCount: g._count.members,
    isMember: g.members.some(m => m.userId === userId),
  }))

  // Load messages for the first group by default
  const firstGroupId = groups[0]?.id
  const initialMessages = firstGroupId
    ? await prisma.message.findMany({
        where: { groupId: firstGroupId },
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'asc' },
        take: 50,
      })
    : []

  const currentUser = {
    id: session.user.id,
    name: session.user.name ?? 'Unknown',
    image: session.user.image ?? null,
  }

  return (
    <ClientGroups
      initialGroups={groups}
      initialMessages={initialMessages}
      currentUser={currentUser}
    />
  )
}
