'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

async function saveProfileFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uniqueName = `profile_${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, uniqueName), buffer)
  return `/uploads/${uniqueName}`
}

export async function updateProfileImageAction(formData: FormData) {
  const session = await requireAuth()
  const file = formData.get('image') as File | null

  if (!file || file.size === 0) {
    return { error: 'Please select an image file.' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image exceeds the 5MB size limit.' }
  }

  try {
    const imageUrl = await saveProfileFile(file)
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    revalidatePath('/settings')
    return { success: true, imageUrl }
  } catch (error) {
    return { error: 'Failed to update profile picture.' }
  }
}
