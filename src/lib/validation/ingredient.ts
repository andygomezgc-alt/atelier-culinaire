import { z } from 'zod'

const allergenFlags = {
  hasGluten: z.boolean().default(false),
  hasCrustaceans: z.boolean().default(false),
  hasEggs: z.boolean().default(false),
  hasFish: z.boolean().default(false),
  hasPeanuts: z.boolean().default(false),
  hasSoy: z.boolean().default(false),
  hasMilk: z.boolean().default(false),
  hasNuts: z.boolean().default(false),
  hasCelery: z.boolean().default(false),
  hasMustard: z.boolean().default(false),
  hasSesame: z.boolean().default(false),
  hasSulphites: z.boolean().default(false),
  hasLupin: z.boolean().default(false),
  hasMolluscs: z.boolean().default(false),
}

export const createIngredientSchema = z.object({
  name: z.string().min(1, 'name required'),
  unit: z.string().default('kg'),
  category: z.enum(['verduras', 'pescados', 'carnes', 'secos', 'lacteos', 'otros']).default('otros'),
  ...allergenFlags,
})

export const updateIngredientSchema = createIngredientSchema.partial()

export const createRecipeIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().min(0),
  unit: z.string().default('kg'),
  note: z.string().default(''),
})

export const updateRecipeIngredientSchema = createRecipeIngredientSchema.partial().omit({ ingredientId: true })
