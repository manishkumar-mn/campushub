'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return session
}

// Change user role
export async function changeUserRoleAction(userId: string, role: string) {
  await requireAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath('/admin')
  return { success: true }
}

// Delete user
export async function deleteUserAction(userId: string) {
  await requireAdmin()
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/admin')
  return { success: true }
}

// Delete note
export async function deleteNoteAction(noteId: string) {
  await requireAdmin()
  await prisma.note.delete({ where: { id: noteId } })
  revalidatePath('/admin')
  revalidatePath('/notes')
  return { success: true }
}

// Delete resource
export async function deleteResourceAction(resourceId: string) {
  await requireAdmin()
  await prisma.resource.delete({ where: { id: resourceId } })
  revalidatePath('/admin')
  revalidatePath('/resources')
  return { success: true }
}

// Delete group
export async function deleteGroupAction(groupId: string) {
  await requireAdmin()
  await prisma.group.delete({ where: { id: groupId } })
  revalidatePath('/admin')
  revalidatePath('/groups')
  return { success: true }
}

// Delete question (doubt board)
export async function deleteQuestionAction(questionId: string) {
  await requireAdmin()
  await prisma.question.delete({ where: { id: questionId } })
  revalidatePath('/admin')
  revalidatePath('/doubt-board')
  return { success: true }
}
