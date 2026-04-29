import { z } from 'zod'

export const createMenuSchema = z.object({
  name: z.string().min(1, 'name required'),
  template: z.enum(['elegante', 'moderna', 'rustica']).default('elegante'),
  categories: z
    .array(z.object({ name: z.string().min(1) }))
    .optional(),
})

export const updateMenuSchema = z.object({
  name: z.string().min(1).optional(),
  template: z.enum(['elegante', 'moderna', 'rustica']).optional(),
})

export const createMenuCategorySchema = z.object({
  name: z.string().min(1, 'name required'),
})

export const updateMenuCategorySchema = z.object({
  name: z.string().min(1).optional(),
  order: z.number().int().optional(),
})

export const createMenuDishSchema = z.object({
  name: z.string().min(1, 'name required'),
  price: z.number().min(0).default(0),
  recipeId: z.string().optional(),
})

export const updateMenuDishSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  order: z.number().int().optional(),
  categoryId: z.string().optional(),
  recipeId: z.string().optional(),
})

export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>
export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>
export type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>
export type CreateMenuDishInput = z.infer<typeof createMenuDishSchema>
export type UpdateMenuDishInput = z.infer<typeof updateMenuDishSchema>
