import { put, del } from '@vercel/blob'
import path from 'path'

/**
 * Upload a file and return its public URL.
 * Uses Vercel Blob in production; falls back to local filesystem in dev
 * when BLOB_READ_WRITE_TOKEN is not set.
 */
export async function uploadFile(file: File): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (token) {
    const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const blob = await put(filename, file, { access: 'public', token })
    return blob.url
  }

  // Dev fallback: save to public/uploads (not suitable for Vercel serverless)
  const { writeFile, mkdir } = await import('fs/promises')
  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()))
  return `/uploads/${filename}`
}

/**
 * Delete a file by URL.
 * Only deletes Blob URLs; local /uploads/ files are left as-is.
 */
export async function deleteFile(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (token && url.startsWith('https://')) {
    await del(url, { token })
  }
}
