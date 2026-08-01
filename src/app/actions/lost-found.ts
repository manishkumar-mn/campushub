'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function reportItemAction(formData: FormData) {
  const session = await requireAuth()

  const itemName = formData.get('itemName') as string
  const type = formData.get('type') as string  // 'LOST' | 'FOUND'
  const location = formData.get('location') as string
  const date = formData.get('date') as string
  const contact = formData.get('contact') as string

  if (!itemName || !type || !location || !date || !contact) {
    return { error: 'All fields are required.' }
  }

  await prisma.lostFoundItem.create({
    data: {
      itemName,
      type,
      location,
      date,
      contact,
      userId: session.user.id,
    },
  })

  revalidatePath('/lost-found')
  return { success: true }
}

export async function resolveItemAction(itemId: string) {
  const session = await requireAuth()

  await prisma.lostFoundItem.updateMany({
    where: { id: itemId, userId: session.user.id },
    data: { status: 'RESOLVED' },
  })

  revalidatePath('/lost-found')
}
