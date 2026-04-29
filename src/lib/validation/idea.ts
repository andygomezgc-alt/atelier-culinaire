import { z } from 'zod'

export const createIdeaSchema = z.object({
  text: z.string().min(1, 'text required'),
})

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>
