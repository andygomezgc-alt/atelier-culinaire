import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  createRecipeVersion,
  uploadPhoto,
  deletePhoto,
} from '@/services/recipes'

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: () => getRecipes(),
  })
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => getRecipe(id),
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateRecipe>[1] }) =>
      updateRecipe(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', id] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useCreateRecipeVersion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipeId, data }: { recipeId: string; data: Parameters<typeof createRecipeVersion>[1] }) =>
      createRecipeVersion(recipeId, data),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] })
    },
  })
}

export function useUploadRecipePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipeId, file }: { recipeId: string; file: File }) =>
      uploadPhoto(recipeId, file),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] })
    },
  })
}

export function useDeleteRecipePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipeId, photoId }: { recipeId: string; photoId: string }) =>
      deletePhoto(recipeId, photoId),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] })
    },
  })
}
