import { Idea } from '@prisma/client'
import { createIdeaSchema } from '@/lib/validation/idea'
import apiFetch from './fetch'
import type { z } from 'zod'

type CreateIdeaInput = z.infer<typeof createIdeaSchema>

export const getIdeas = async (): Promise<Idea[]> => {
  const response = await apiFetch<{ ok: boolean; data: Idea[] }>(
    '/api/ideas'
  )
  return response.data
}

export const createIdea = async (text: string): Promise<Idea> => {
  const response = await apiFetch<{ ok: boolean; data: Idea }>(
    '/api/ideas',
    {
      method: 'POST',
      body: { text },
    }
  )
  return response.data
}

export const updateIdea = async (id: string, text: string): Promise<Idea> => {
  const response = await apiFetch<{ ok: boolean; data: Idea }>(
    `/api/ideas/${id}`,
    {
      method: 'PUT',
      body: { text },
    }
  )
  return response.data
}

export const deleteIdea = async (id: string): Promise<void> => {
  await apiFetch<{ ok: true }>(`/api/ideas/${id}`, {
    method: 'DELETE',
  })
}
