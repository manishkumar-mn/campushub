import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  const user = session.user

  // Fetch real stats from DB
  const [notesUploaded, downloadsData, groupsJoined, eventsAttended] = await Promise.all([
    prisma.note.count({ where: { uploaderId: user.id } }),
    prisma.note.aggregate({ where: { uploaderId: user.id }, _sum: { downloadsCount: true } }),
    prisma.groupMember.count({ where: { userId: user.id } }),
    prisma.eventRegistration.count({ where: { userId: user.id } }),
  ])

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name ?? 'User',
        email: user.email ?? '',
        image: user.image ?? null,
        role: user.role ?? 'STUDENT',
        branch: user.branch,
      }}
      stats={{
        notesUploaded,
        downloadsReceived: downloadsData._sum.downloadsCount ?? 0,
        groupsJoined,
        eventsAttended,
      }}
    />
  )
}
