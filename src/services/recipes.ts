import { Recipe, RecipeVersion, RecipePhoto } from '@prisma/client'

export type RecipeWithRelations = Recipe & {
  versions: RecipeVersion[]
  photos: RecipePhoto[]
}
import {
  createRecipeSchema,
  updateRecipeSchema,
  createRecipeVersionSchema,
} from '@/lib/validation/recipe'
import apiFetch from './fetch'
import type { z } from 'zod'

type CreateRecipeInput = z.infer<typeof createRecipeSchema>
type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>
type CreateRecipeVersionInput = z.infer<typeof createRecipeVersionSchema>

export const getRecipes = async (): Promise<RecipeWithRelations[]> => {
  const response = await apiFetch<{ ok: boolean; data: RecipeWithRelations[] }>(
    '/api/recipes'
  )
  return response.data
}

export const getRecipe = async (id: string): Promise<RecipeWithRelations> => {
  const response = await apiFetch<{ ok: boolean; data: RecipeWithRelations }>(
    `/api/recipes/${id}`
  )
  return response.data
}

export const createRecipe = async (
  data: CreateRecipeInput
): Promise<Recipe> => {
  const response = await apiFetch<{ ok: boolean; data: Recipe }>(
    '/api/recipes',
    {
      method: 'POST',
      body: data,
    }
  )
  return response.data
}

export const updateRecipe = async (
  id: string,
  data: UpdateRecipeInput
): Promise<Recipe> => {
  const response = await apiFetch<{ ok: boolean; data: Recipe }>(
    `/api/recipes/${id}`,
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}

export const deleteRecipe = async (id: string): Promise<void> => {
  await apiFetch<{ ok: true }>(`/api/recipes/${id}`, {
    method: 'DELETE',
  })
}

export const createRecipeVersion = async (
  recipeId: string,
  data: CreateRecipeVersionInput
): Promise<RecipeVersion> => {
  const response = await apiFetch<{ ok: boolean; data: RecipeVersion }>(
    `/api/recipes/${recipeId}/versions`,
    {
      method: 'POST',
      body: data,
    }
  )
  return response.data
}

export const uploadPhoto = async (
  recipeId: string,
  file: File
): Promise<RecipePhoto> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiFetch<{ ok: boolean; data: RecipePhoto }>(
    `/api/recipes/${recipeId}/photos`,
    {
      method: 'POST',
      body: formData,
    }
  )
  return response.data
}

export const deletePhoto = async (
  recipeId: string,
  photoId: string
): Promise<void> => {
  await apiFetch<{ ok: true }>(
    `/api/recipes/${recipeId}/photos/${photoId}`,
    {
      method: 'DELETE',
    }
  )
}
