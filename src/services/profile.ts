import { User } from '@prisma/client'
import { updateProfileSchema } from '@/lib/validation/profile'
import apiFetch from './fetch'
import type { z } from 'zod'

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const getProfile = async (): Promise<User> => {
  const response = await apiFetch<{ ok: boolean; data: User }>(
    '/api/profile'
  )
  return response.data
}

export const updateProfile = async (data: UpdateProfileInput): Promise<User> => {
  const response = await apiFetch<{ ok: boolean; data: User }>(
    '/api/profile',
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}
