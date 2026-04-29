import { PantryItem } from '@prisma/client'
import {
  createPantryItemSchema,
  updatePantryItemSchema,
} from '@/lib/validation/pantry'
import apiFetch from './fetch'
import type { z } from 'zod'

type CreatePantryItemInput = z.infer<typeof createPantryItemSchema>
type UpdatePantryItemInput = z.infer<typeof updatePantryItemSchema>

export const getPantry = async (): Promise<PantryItem[]> => {
  const response = await apiFetch<{ ok: boolean; data: PantryItem[] }>(
    '/api/pantry'
  )
  return response.data
}

export const createPantryItem = async (
  data: CreatePantryItemInput
): Promise<PantryItem> => {
  const response = await apiFetch<{ ok: boolean; data: PantryItem }>(
    '/api/pantry',
    {
      method: 'POST',
      body: data,
    }
  )
  return response.data
}

export const updatePantryItem = async (
  id: string,
  data: UpdatePantryItemInput
): Promise<PantryItem> => {
  const response = await apiFetch<{ ok: boolean; data: PantryItem }>(
    `/api/pantry/${id}`,
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}

export const deletePantryItem = async (id: string): Promise<void> => {
  await apiFetch<{ ok: true }>(`/api/pantry/${id}`, {
    method: 'DELETE',
  })
}
