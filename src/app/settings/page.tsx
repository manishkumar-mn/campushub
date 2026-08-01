import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <SettingsClient
      user={{
        name: session.user.name ?? 'User',
        email: session.user.email ?? '',
        image: session.user.image ?? null,
        role: session.user.role ?? 'STUDENT',
        branch: session.user.branch,
      }}
    />
  )
}
