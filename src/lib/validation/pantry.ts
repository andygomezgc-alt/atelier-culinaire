import { z } from 'zod'

export const createPantryItemSchema = z.object({
  name: z.string().min(1, 'name required'),
  category: z
    .enum(['verduras', 'pescados', 'carnes', 'secos', 'lacteos'])
    .default('verduras'),
  cost: z.number().min(0).default(0),
  season: z
    .enum(['spring', 'summer', 'autumn', 'winter', 'allyear'])
    .default('allyear'),
  supplier: z.string().default(''),
  stock: z.string().default(''),
})

export const updatePantryItemSchema = createPantryItemSchema.partial()

export type CreatePantryItemInput = z.infer<typeof createPantryItemSchema>
export type UpdatePantryItemInput = z.infer<typeof updatePantryItemSchema>
