import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import NotesClient from './NotesClient'

export const dynamic = 'force-dynamic'

export default async function NotesPage() {
  const session = await auth()

  const notes = await prisma.note.findMany({
    include: { uploader: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const bookmarks = session?.user?.id
    ? await prisma.bookmark.findMany({
        where: { userId: session.user.id },
        select: { noteId: true },
      })
    : []

  const bookmarkedIds = bookmarks.map(b => b.noteId)

  return <NotesClient initialNotes={notes} bookmarkedIds={bookmarkedIds} />
}
