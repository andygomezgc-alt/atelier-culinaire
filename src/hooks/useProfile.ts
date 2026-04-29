import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProfile,
  updateProfile,
} from '@/services/profile'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
