import { NextResponse } from 'next/server'
import { ZodSchema } from 'zod'

/** Standardized successful response */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status })
}

/** Standardized error response */
export function err(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

/**
 * Parses and validates the request body against a Zod schema.
 * Returns either parsed data or a ready-to-return error Response.
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return { success: false, response: err('Invalid JSON body', 400) }
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(', ')
    return { success: false, response: err(message, 400) }
  }
  return { success: true, data: result.data }
}

/**
 * Wraps a route handler to catch unhandled errors and return a 500.
 * Use as: export const GET = withErrorHandler(async (req) => { ... })
 */
export function withErrorHandler<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (e) {
      console.error('[API Error]', e)
      return err('Internal server error', 500)
    }
  }
}
