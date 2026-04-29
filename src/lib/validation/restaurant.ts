import { z } from 'zod'

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  style: z.string().optional(),
  season: z.string().optional(),
  price: z.string().optional(),
  restrictions: z.string().optional(),
})

export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>
