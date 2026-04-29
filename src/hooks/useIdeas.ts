import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getIdeas,
  createIdea,
  updateIdea,
  deleteIdea,
} from '@/services/ideas'

export function useIdeas() {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: () => getIdeas(),
  })
}

export function useCreateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}

export function useUpdateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      updateIdea(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}

export function useDeleteIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}
