import { TeamMember, User } from '@prisma/client'
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  updateUserAccessSchema,
} from '@/lib/validation/team'
import apiFetch from './fetch'
import type { z } from 'zod'

type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>
type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>
type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>

export const getTeam = async (): Promise<TeamMember[]> => {
  const response = await apiFetch<{ ok: boolean; data: TeamMember[] }>(
    '/api/team'
  )
  return response.data
}

export const createTeamMember = async (
  data: CreateTeamMemberInput
): Promise<TeamMember> => {
  const response = await apiFetch<{ ok: boolean; data: TeamMember }>(
    '/api/team',
    {
      method: 'POST',
      body: data,
    }
  )
  return response.data
}

export const updateTeamMember = async (
  id: string,
  data: UpdateTeamMemberInput
): Promise<TeamMember> => {
  const response = await apiFetch<{ ok: boolean; data: TeamMember }>(
    `/api/team/${id}`,
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}

export const deleteTeamMember = async (id: string): Promise<void> => {
  await apiFetch<{ ok: true }>(`/api/team/${id}`, {
    method: 'DELETE',
  })
}

export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiFetch<{ ok: boolean; data: User[] }>(
    '/api/team/users'
  )
  return response.data
}

export const updateUser = async (
  id: string,
  data: UpdateUserAccessInput
): Promise<User> => {
  const response = await apiFetch<{ ok: boolean; data: User }>(
    `/api/team/users/${id}`,
    {
      method: 'PUT',
      body: data,
    }
  )
  return response.data
}

export const deleteUser = async (id: string): Promise<void> => {
  await apiFetch<{ ok: true }>(`/api/team/users/${id}`, {
    method: 'DELETE',
  })
}
