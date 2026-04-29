import { z } from 'zod'

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'name required'),
  role: z
    .enum(['admin', 'editor', 'contributor', 'viewer'])
    .default('contributor'),
})

export const updateTeamMemberSchema = createTeamMemberSchema.partial()

export const updateUserAccessSchema = z.object({
  accessLevel: z.enum(['admin', 'editor', 'viewer']),
})

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>
export type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>
