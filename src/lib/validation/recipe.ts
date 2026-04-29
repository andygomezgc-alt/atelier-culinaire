import { z } from 'zod'

export const createRecipeSchema = z.object({
  name: z.string().min(1, 'name required'),
  category: z.string().default(''),
  status: z.enum(['draft', 'testing', 'approved']).default('draft'),
  priority: z.boolean().default(false),
  summary: z.string().default(''),
  content: z.string().default(''),
  ingredients: z.string().default(''),
  technique: z.string().default(''),
})

export const updateRecipeSchema = createRecipeSchema.partial()

export const createRecipeVersionSchema = z.object({
  note: z.string().min(1, 'note required'),
  tester: z.string().default(''),
})

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
export type CreateRecipeVersionInput = z.infer<typeof createRecipeVersionSchema>
