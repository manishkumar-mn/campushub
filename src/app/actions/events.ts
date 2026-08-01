'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function registerEventAction(eventId: string) {
  const session = await requireAuth()

  try {
    await prisma.eventRegistration.create({
      data: {
        userId: session.user.id,
        eventId: eventId,
      }
    })
    revalidatePath('/events')
    return { success: true }
  } catch (error: any) {
    // If unique constraint fails, they are already registered
    if (error.code === 'P2002') {
      return { error: 'You are already registered for this event.' }
    }
    return { error: 'Failed to register for the event.' }
  }
}
