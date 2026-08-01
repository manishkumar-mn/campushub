'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function uploadNoteAction(formData: FormData) {
  const session = await requireAuth()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject = formData.get('subject') as string
  const branch = formData.get('branch') as string
  const semester = parseInt(formData.get('semester') as string)
  const file = formData.get('file') as File | null

  if (!title || !description || !subject || !branch || !semester) {
    return { error: 'Please fill in all required fields.' }
  }

  let fileUrl = '#'

  if (file && file.size > 0) {
    if (file.size > 20 * 1024 * 1024) {
      return { error: 'File is too large. Maximum size is 20MB.' }
    }
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uniqueName = `${Date.now()}_${safeName}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, uniqueName), buffer)
    fileUrl = `/uploads/${uniqueName}`
  }

  await prisma.note.create({
    data: {
      title,
      description,
      subject,
      branch,
      semester,
      fileUrl,
      uploaderId: session.user.id,
    },
  })

  revalidatePath('/notes')
  return { success: true }
}

export async function bookmarkNoteAction(noteId: string) {
  const session = await requireAuth()

  const existing = await prisma.bookmark.findUnique({
    where: { userId_noteId: { userId: session.user.id, noteId } },
  })

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
  } else {
    await prisma.bookmark.create({
      data: { userId: session.user.id, noteId },
    })
  }

  revalidatePath('/notes')
}

export async function downloadNoteAction(noteId: string) {
  const session = await requireAuth()

  await prisma.download.create({
    data: { userId: session.user.id, noteId },
  })

  await prisma.note.update({
    where: { id: noteId },
    data: { downloadsCount: { increment: 1 } },
  })

  revalidatePath('/notes')
}
