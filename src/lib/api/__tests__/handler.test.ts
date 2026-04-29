import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'

vi.mock('@/lib/auth', () => ({
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor() {
      super('Unauthorized')
      this.name = 'UnauthorizedError'
    }
  },
}))

import { ok, err, parseBody, withErrorHandler } from '../handler'
import { UnauthorizedError } from '@/lib/auth'

describe('ok()', () => {
  it('returns 200 with ok:true and data', async () => {
    const res = ok({ id: '1', name: 'Risotto' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, data: { id: '1', name: 'Risotto' } })
  })

  it('accepts custom status', async () => {
    const res = ok({ id: '1' }, 201)
    expect(res.status).toBe(201)
  })
})

describe('err()', () => {
  it('returns 400 with ok:false and error message', async () => {
    const res = err('name required')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({ ok: false, error: 'name required' })
  })

  it('accepts custom status', async () => {
    const res = err('not found', 404)
    expect(res.status).toBe(404)
  })
})

describe('parseBody()', () => {
  const schema = z.object({ name: z.string().min(1), count: z.number().default(0) })

  it('returns success with parsed data for valid JSON', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'Risotto' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await parseBody(req, schema)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Risotto')
      expect(result.data.count).toBe(0)
    }
  })

  it('returns failure response for invalid JSON', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await parseBody(req, schema)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
    }
  })

  it('returns failure response when schema validation fails', async () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await parseBody(req, schema)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.response.status).toBe(400)
      const body = await result.response.json()
      expect(body.ok).toBe(false)
      expect(body.error).toBeTruthy()
    }
  })
})

describe('withErrorHandler()', () => {
  it('passes through successful response', async () => {
    const handler = withErrorHandler(async () => {
      return new Response('ok', { status: 200 })
    })
    const res = await handler()
    expect(res.status).toBe(200)
  })

  it('catches thrown errors and returns 500', async () => {
    const handler = withErrorHandler(async () => {
      throw new Error('database exploded')
    })
    const res = await handler()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error).toBe('Internal server error')
  })

  it('returns 401 for UnauthorizedError', async () => {
    const handler = withErrorHandler(async () => {
      throw new UnauthorizedError()
    })
    const res = await handler()
    expect(res.status).toBe(401)
  })
})
