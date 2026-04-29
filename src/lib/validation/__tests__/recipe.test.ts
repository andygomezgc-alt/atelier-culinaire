import { describe, it, expect } from 'vitest'
import { createRecipeSchema, updateRecipeSchema, createRecipeVersionSchema } from '../recipe'

describe('createRecipeSchema', () => {
  it('accepts minimal valid input', () => {
    const result = createRecipeSchema.safeParse({ name: 'Pasta alla norma' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('draft')
      expect(result.data.priority).toBe(false)
    }
  })

  it('rejects missing name', () => {
    const result = createRecipeSchema.safeParse({ category: 'primeros' })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = createRecipeSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status enum', () => {
    const result = createRecipeSchema.safeParse({ name: 'Test', status: 'published' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid statuses', () => {
    for (const status of ['draft', 'testing', 'approved'] as const) {
      const result = createRecipeSchema.safeParse({ name: 'Test', status })
      expect(result.success).toBe(true)
    }
  })

  it('accepts full valid input', () => {
    const result = createRecipeSchema.safeParse({
      name: 'Risotto al tartufo',
      category: 'primeros',
      status: 'approved',
      priority: true,
      summary: 'Clásico italiano',
      content: '# Preparación\n...',
      ingredients: '200g arroz arborio',
      technique: 'risotto',
    })
    expect(result.success).toBe(true)
  })
})

describe('updateRecipeSchema', () => {
  it('accepts empty object (all fields optional)', () => {
    const result = updateRecipeSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial update', () => {
    const result = updateRecipeSchema.safeParse({ status: 'approved' })
    expect(result.success).toBe(true)
  })
})

describe('createRecipeVersionSchema', () => {
  it('requires note', () => {
    const result = createRecipeVersionSchema.safeParse({ tester: 'Marco' })
    expect(result.success).toBe(false)
  })

  it('accepts valid version', () => {
    const result = createRecipeVersionSchema.safeParse({ note: 'Cambié la sal', tester: 'Marco' })
    expect(result.success).toBe(true)
  })

  it('tester defaults to empty string', () => {
    const result = createRecipeVersionSchema.safeParse({ note: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.tester).toBe('')
  })
})
