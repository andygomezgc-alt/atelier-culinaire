import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  getRecipeIngredients,
  addRecipeIngredient,
  updateRecipeIngredient,
  removeRecipeIngredient,
} from '@/services/ingredients'

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: getIngredients,
  })
}

export function useCreateIngredient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateIngredient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      queryClient.invalidateQueries({ queryKey: ['ingredients', id] })
    },
  })
}

export function useRecipeIngredients(recipeId: string) {
  return useQuery({
    queryKey: ['recipeIngredients', recipeId],
    queryFn: () => getRecipeIngredients(recipeId),
    enabled: !!recipeId,
  })
}

export function useAddRecipeIngredient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipeId, data }: { recipeId: string; data: Record<string, unknown> }) =>
      addRecipeIngredient(recipeId, data),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', recipeId] })
    },
  })
}

export function useUpdateRecipeIngredient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipeId, riId, data }: { recipeId: string; riId: string; data: Record<string, unknown> }) =>
      updateRecipeIngredient(recipeId, riId, data),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', recipeId] })
    },
  })
}

export function useRemoveRecipeIngredient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipeId, riId }: { recipeId: string; riId: string }) =>
      removeRecipeIngredient(recipeId, riId),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipeIngredients', recipeId] })
    },
  })
}
