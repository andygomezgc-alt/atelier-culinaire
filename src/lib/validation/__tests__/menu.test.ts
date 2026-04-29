import { describe, it, expect } from 'vitest'
import {
  createMenuSchema,
  updateMenuSchema,
  createMenuCategorySchema,
  createMenuDishSchema,
  updateMenuDishSchema,
} from '../menu'

describe('createMenuSchema', () => {
  it('accepts minimal input', () => {
    const result = createMenuSchema.safeParse({ name: 'Menú degustación' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.template).toBe('elegante')
  })

  it('rejects missing name', () => {
    const result = createMenuSchema.safeParse({ template: 'moderna' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid template', () => {
    const result = createMenuSchema.safeParse({ name: 'Test', template: 'fancy' })
    expect(result.success).toBe(false)
  })

  it('accepts categories array', () => {
    const result = createMenuSchema.safeParse({
      name: 'Test',
      categories: [{ name: 'Entradas' }, { name: 'Principales' }],
    })
    expect(result.success).toBe(true)
  })
})

describe('updateMenuSchema', () => {
  it('accepts empty object', () => {
    expect(updateMenuSchema.safeParse({}).success).toBe(true)
  })
})

describe('createMenuCategorySchema', () => {
  it('requires name', () => {
    expect(createMenuCategorySchema.safeParse({}).success).toBe(false)
  })
  it('accepts valid name', () => {
    expect(createMenuCategorySchema.safeParse({ name: 'Postres' }).success).toBe(true)
  })
})

describe('createMenuDishSchema', () => {
  it('requires name', () => {
    expect(createMenuDishSchema.safeParse({ price: 12 }).success).toBe(false)
  })
  it('defaults price to 0', () => {
    const result = createMenuDishSchema.safeParse({ name: 'Tiramisu' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.price).toBe(0)
  })
  it('rejects negative price', () => {
    expect(createMenuDishSchema.safeParse({ name: 'Test', price: -5 }).success).toBe(false)
  })
})

describe('updateMenuDishSchema', () => {
  it('accepts partial update with order and categoryId', () => {
    const result = updateMenuDishSchema.safeParse({ order: 2, categoryId: 'cat-abc' })
    expect(result.success).toBe(true)
  })
})
