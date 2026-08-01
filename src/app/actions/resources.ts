'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, uniqueName), buffer)
  return `/uploads/${uniqueName}`
}

export async function uploadResourceAction(formData: FormData) {
  const session = await requireAuth()

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const type = formData.get('type') as string
  // Support multiple files via getAll
  const files = formData.getAll('files') as File[]

  if (!title || !category || !type) {
    return { error: 'Please fill in all required fields.' }
  }

  const validFiles = files.filter(f => f && f.size > 0)

  if (validFiles.length === 0) {
    return { error: 'Please select at least one file to upload.' }
  }

  // Validate each file
  for (const file of validFiles) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: `"${file.name}" is not a supported file type. Allowed: PDF, Images, Word, PowerPoint.` }
    }
    if (file.size > 20 * 1024 * 1024) {
      return { error: `"${file.name}" exceeds the 20MB size limit.` }
    }
  }

  // Save each file and create a resource entry for each one
  const createdResources = []
  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]
    const fileUrl = await saveFile(file)
    // Use the main title for single file, append number for multiple
    const resourceTitle = validFiles.length === 1 ? title : `${title} (${i + 1})`
    const resource = await prisma.resource.create({
      data: {
        title: resourceTitle,
        category,
        type,
        fileUrl,
        uploaderId: session.user.id,
      },
    })
    createdResources.push(resource)
  }

  revalidatePath('/resources')
  return { success: true, count: createdResources.length }
}

export async function downloadResourceAction(resourceId: string) {
  await requireAuth()

  await prisma.resource.update({
    where: { id: resourceId },
    data: { downloads: { increment: 1 } },
  })

  revalidatePath('/resources')
}
