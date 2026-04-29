import { z } from 'zod'

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  ANTHROPIC_API_KEY: z.string().min(1),

  // Optional
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-20250514'),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ')
    throw new Error(`Missing or invalid environment variables: ${missing}`)
  }
  return result.data
}

// Validated env — fails fast at import time if required vars are missing.
// Skip validation during tests to avoid needing a full .env.
export const env =
  process.env.NODE_ENV === 'test'
    ? (process.env as unknown as z.infer<typeof envSchema>)
    : validateEnv()
