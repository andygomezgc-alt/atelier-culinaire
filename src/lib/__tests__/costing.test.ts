import { describe, it, expect } from 'vitest'
import {
  calculateCost,
  aggregateAllergens,
  allergenList,
  type CostIngredient,
  type AllergenFlags,
} from '../costing'

const noAllergens: AllergenFlags = {
  hasGluten: false,
  hasCrustaceans: false,
  hasEggs: false,
  hasFish: false,
  hasPeanuts: false,
  hasSoy: false,
  hasMilk: false,
  hasNuts: false,
  hasCelery: false,
  hasMustard: false,
  hasSesame: false,
  hasSulphites: false,
  hasLupin: false,
  hasMolluscs: false,
}

describe('calculateCost', () => {
  it('1. simple recipe: 2 ingredients, known costs → correct total', () => {
    const ingredients: CostIngredient[] = [
      { ingredientId: 'a', quantity: 0.5, unit: 'kg', costPerUnit: 20, baseUnit: 'kg' },
      { ingredientId: 'b', quantity: 0.3, unit: 'kg', costPerUnit: 10, baseUnit: 'kg' },
    ]
    const result = calculateCost(ingredients)
    expect(result.totalCost).toBeCloseTo(13)
    expect(result.breakdown).toHaveLength(2)
    expect(result.breakdown[0]).toEqual({ ingredientId: 'a', cost: 10 })
    expect(result.breakdown[1]).toMatchObject({ ingredientId: 'b', cost: 3 })
  })

  it('2. unit conversion: ingredient in grams, pantry in kg', () => {
    const ingredients: CostIngredient[] = [
      { ingredientId: 'flour', quantity: 500, unit: 'g', costPerUnit: 2, baseUnit: 'kg' },
    ]
    const result = calculateCost(ingredients)
    // 500g = 0.5kg, 0.5 * 2 = 1
    expect(result.totalCost).toBeCloseTo(1)
  })

  it('3. ml→l conversion', () => {
    const ingredients: CostIngredient[] = [
      { ingredientId: 'oil', quantity: 250, unit: 'ml', costPerUnit: 4, baseUnit: 'l' },
    ]
    const result = calculateCost(ingredients)
    // 250ml = 0.25l, 0.25 * 4 = 1
    expect(result.totalCost).toBeCloseTo(1)
  })

  it('4. unknown unit → 1:1 fallback, no error', () => {
    const ingredients: CostIngredient[] = [
      { ingredientId: 'spice', quantity: 3, unit: 'tsp', costPerUnit: 0.5, baseUnit: 'kg' },
    ]
    expect(() => calculateCost(ingredients)).not.toThrow()
    const result = calculateCost(ingredients)
    expect(result.totalCost).toBeCloseTo(1.5)
  })

  it('5. no yield → costPerPortion = 0, costPerGram = 0', () => {
    const ingredients: CostIngredient[] = [
      { ingredientId: 'a', quantity: 1, unit: 'kg', costPerUnit: 5, baseUnit: 'kg' },
    ]
    const result = calculateCost(ingredients)
    expect(result.costPerPortion).toBe(0)
    expect(result.costPerGram).toBe(0)
    expect(result.yieldPortions).toBeNull()
    expect(result.yieldGrams).toBeNull()
  })

  it('6. with yieldPortions=4 → totalCost/4', () => {
    const ingredients: CostIngredient[] = [
      { ingredientId: 'a', quantity: 1, unit: 'kg', costPerUnit: 20, baseUnit: 'kg' },
    ]
    const result = calculateCost(ingredients, 4)
    expect(result.totalCost).toBeCloseTo(20)
    expect(result.costPerPortion).toBeCloseTo(5)
  })

  it('7. ingredient with costPerUnit=0 → contributes 0, no NaN', () => {
    const ingredients: CostIngredient[] = [
      { ingredientId: 'water', quantity: 1, unit: 'l', costPerUnit: 0, baseUnit: 'l' },
    ]
    const result = calculateCost(ingredients, 4)
    expect(result.totalCost).toBe(0)
    expect(result.costPerPortion).toBe(0)
    expect(Number.isNaN(result.totalCost)).toBe(false)
  })

  it('8. empty ingredients → totalCost=0, costPerPortion=0', () => {
    const result = calculateCost([], 4)
    expect(result.totalCost).toBe(0)
    expect(result.costPerPortion).toBe(0)
  })
})

describe('aggregateAllergens', () => {
  it('9. no ingredients → all false, empty ingredientIds', () => {
    const result = aggregateAllergens([])
    expect(result.hasGluten).toBe(false)
    expect(result.hasMilk).toBe(false)
    expect(result.ingredientIds).toEqual([])
  })

  it('10. one ingredient with hasGluten=true → result hasGluten=true', () => {
    const result = aggregateAllergens([{ ...noAllergens, id: 'flour', hasGluten: true }])
    expect(result.hasGluten).toBe(true)
    expect(result.ingredientIds).toContain('flour')
  })

  it('11. two ingredients, one hasMilk, other hasEggs → both true', () => {
    const result = aggregateAllergens([
      { ...noAllergens, id: 'butter', hasMilk: true },
      { ...noAllergens, id: 'egg', hasEggs: true },
    ])
    expect(result.hasMilk).toBe(true)
    expect(result.hasEggs).toBe(true)
    expect(result.ingredientIds).toContain('butter')
    expect(result.ingredientIds).toContain('egg')
  })

  it('12. ingredient with no allergens → all false', () => {
    const result = aggregateAllergens([{ ...noAllergens, id: 'water' }])
    expect(result.hasGluten).toBe(false)
    expect(result.hasMilk).toBe(false)
    expect(result.ingredientIds).toEqual([])
  })
})

describe('allergenList', () => {
  it('13. flags with 3 active → returns 3 keys', () => {
    const flags: AllergenFlags = { ...noAllergens, hasGluten: true, hasMilk: true, hasEggs: true }
    const list = allergenList(flags)
    expect(list).toHaveLength(3)
    expect(list).toContain('hasGluten')
    expect(list).toContain('hasMilk')
    expect(list).toContain('hasEggs')
  })

  it('14. all false → returns empty array', () => {
    expect(allergenList(noAllergens)).toEqual([])
  })
})
