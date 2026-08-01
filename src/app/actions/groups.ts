'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createGroupAction(formData: FormData) {
  const session = await requireAuth()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string

  if (!name || !description || !category) {
    return { error: 'All fields are required.' }
  }

  const group = await prisma.group.create({
    data: {
      name,
      description,
      category,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id },
      },
    },
  })

  revalidatePath('/groups')
  return { success: true, groupId: group.id }
}

export async function joinGroupAction(groupId: string) {
  const session = await requireAuth()

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  })

  if (!existing) {
    await prisma.groupMember.create({
      data: { userId: session.user.id, groupId },
    })
  }

  revalidatePath('/groups')
}

export async function sendMessageAction(groupId: string, content: string) {
  const session = await requireAuth()

  if (!content.trim()) return { error: 'Message cannot be empty.' }

  const message = await prisma.message.create({
    data: {
      content,
      groupId,
      senderId: session.user.id,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  })

  revalidatePath('/groups')
  return { success: true, message }
}
