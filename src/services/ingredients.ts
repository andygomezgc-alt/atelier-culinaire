import { Ingredient, RecipeIngredient } from '@prisma/client'
import apiFetch from './fetch'

export type RecipeIngredientWithIngredient = RecipeIngredient & { ingredient: Ingredient }

export const getIngredients = (): Promise<Ingredient[]> =>
  apiFetch<Ingredient[]>('/api/ingredients')

export const createIngredient = (data: Record<string, unknown>): Promise<Ingredient> =>
  apiFetch<Ingredient>('/api/ingredients', { method: 'POST', body: data })

export const updateIngredient = (id: string, data: Record<string, unknown>): Promise<Ingredient> =>
  apiFetch<Ingredient>(`/api/ingredients/${id}`, { method: 'PUT', body: data })

export const getRecipeIngredients = (recipeId: string): Promise<RecipeIngredientWithIngredient[]> =>
  apiFetch<RecipeIngredientWithIngredient[]>(`/api/recipes/${recipeId}/ingredients`)

export const addRecipeIngredient = (recipeId: string, data: Record<string, unknown>): Promise<RecipeIngredientWithIngredient> =>
  apiFetch<RecipeIngredientWithIngredient>(`/api/recipes/${recipeId}/ingredients`, { method: 'POST', body: data })

export const updateRecipeIngredient = (recipeId: string, riId: string, data: Record<string, unknown>): Promise<RecipeIngredientWithIngredient> =>
  apiFetch<RecipeIngredientWithIngredient>(`/api/recipes/${recipeId}/ingredients/${riId}`, { method: 'PUT', body: data })

export const removeRecipeIngredient = (recipeId: string, riId: string): Promise<void> =>
  apiFetch<void>(`/api/recipes/${recipeId}/ingredients/${riId}`, { method: 'DELETE' })
