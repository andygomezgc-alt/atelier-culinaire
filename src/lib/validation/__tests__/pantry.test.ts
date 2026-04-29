import { describe, it, expect } from 'vitest'
import { createPantryItemSchema, updatePantryItemSchema } from '../pantry'

describe('createPantryItemSchema', () => {
  it('accepts minimal input', () => {
    const result = createPantryItemSchema.safeParse({ name: 'Tomate' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.category).toBe('verduras')
      expect(result.data.cost).toBe(0)
      expect(result.data.season).toBe('allyear')
    }
  })

  it('rejects empty name', () => {
    const result = createPantryItemSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = createPantryItemSchema.safeParse({ name: 'Test', category: 'frutas' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid categories', () => {
    for (const category of ['verduras', 'pescados', 'carnes', 'secos', 'lacteos'] as const) {
      const result = createPantryItemSchema.safeParse({ name: 'Test', category })
      expect(result.success).toBe(true)
    }
  })

  it('rejects negative cost', () => {
    const result = createPantryItemSchema.safeParse({ name: 'Test', cost: -1 })
    expect(result.success).toBe(false)
  })
})

describe('updatePantryItemSchema', () => {
  it('accepts empty object', () => {
    const result = updatePantryItemSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts partial cost update', () => {
    const result = updatePantryItemSchema.safeParse({ cost: 3.5 })
    expect(result.success).toBe(true)
  })
})
