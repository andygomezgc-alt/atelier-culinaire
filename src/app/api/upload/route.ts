import { requireUser } from '@/lib/auth'
import { withErrorHandler, err } from '@/lib/api/handler'
import { uploadFile } from '@/lib/storage'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export const POST = withErrorHandler(async (req: Request) => {
  await requireUser()
  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return err('no file', 400)
  const url = await uploadFile(file)
  return NextResponse.json({ url })
})
