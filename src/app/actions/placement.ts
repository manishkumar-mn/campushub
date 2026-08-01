'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function addApplicationAction(formData: FormData) {
  const session = await requireAuth()

  const companyName = formData.get('companyName') as string
  const role = formData.get('role') as string
  const packageLPA = parseFloat(formData.get('package') as string)
  const deadline = new Date(formData.get('deadline') as string)
  const eligibility = formData.get('eligibility') as string

  if (!companyName || !role || isNaN(packageLPA) || isNaN(deadline.getTime())) {
    return { error: 'Please fill in all required fields.' }
  }

  await prisma.application.create({
    data: {
      companyName,
      role,
      package: packageLPA,
      deadline,
      eligibility: eligibility || 'Open for all',
      status: 'APPLIED',
      userId: session.user.id,
    },
  })

  revalidatePath('/placement')
  return { success: true }
}

export async function updateApplicationStatusAction(appId: string, status: string) {
  const session = await requireAuth()

  await prisma.application.updateMany({
    where: { id: appId, userId: session.user.id },
    data: { status },
  })

  revalidatePath('/placement')
}

export async function deleteApplicationAction(appId: string) {
  const session = await requireAuth()

  await prisma.application.deleteMany({
    where: { id: appId, userId: session.user.id },
  })

  revalidatePath('/placement')
}
