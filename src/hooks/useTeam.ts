import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAllUsers,
  updateUser,
  deleteUser,
} from '@/services/team'

export function useTeam() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => getTeam(),
  })
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTeamMember>[1] }) =>
      updateTeamMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['team', 'users'],
    queryFn: () => getAllUsers(),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'users'] })
    },
  })
}
