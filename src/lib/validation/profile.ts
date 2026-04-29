import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['exec', 'sous', 'rd']).optional(),
  initials: z.string().max(3).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  lang: z.enum(['es', 'it', 'en']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
