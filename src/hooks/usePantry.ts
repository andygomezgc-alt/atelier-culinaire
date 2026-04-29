import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPantry,
  createPantryItem,
  updatePantryItem,
  deletePantryItem,
} from '@/services/pantry'

export function usePantry() {
  return useQuery({
    queryKey: ['pantry'],
    queryFn: () => getPantry(),
  })
}

export function useCreatePantryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] })
    },
  })
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePantryItem>[1] }) =>
      updatePantryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] })
    },
  })
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePantryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] })
    },
  })
}
