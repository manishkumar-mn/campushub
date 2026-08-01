'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function askQuestionAction(formData: FormData) {
  const session = await requireAuth()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tags = formData.get('tags') as string
  const anonymous = formData.get('anonymous') === 'on'

  if (!title || !description) throw new Error('Missing required fields')

  await prisma.question.create({
    data: {
      title,
      description,
      tags: tags || 'General',
      anonymous,
      userId: session.user.id,
    }
  })

  revalidatePath('/doubt-board')
}

export async function voteAction(questionId: string, direction: 'up' | 'down') {
  await requireAuth() // ensure logged in
  
  // Minimal voting implementation for MVP: directly increment/decrement
  // In a real app we'd track who voted to prevent duplicate votes
  await prisma.question.update({
    where: { id: questionId },
    data: {
      votes: {
        [direction === 'up' ? 'increment' : 'decrement']: 1
      }
    }
  })

  revalidatePath('/doubt-board')
}
