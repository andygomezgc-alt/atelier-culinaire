export type CostIngredient = {
  ingredientId: string
  quantity: number
  unit: string
  costPerUnit: number
  baseUnit: string
}

export type AllergenFlags = {
  hasGluten: boolean
  hasCrustaceans: boolean
  hasEggs: boolean
  hasFish: boolean
  hasPeanuts: boolean
  hasSoy: boolean
  hasMilk: boolean
  hasNuts: boolean
  hasCelery: boolean
  hasMustard: boolean
  hasSesame: boolean
  hasSulphites: boolean
  hasLupin: boolean
  hasMolluscs: boolean
}

export type CostResult = {
  totalCost: number
  costPerPortion: number
  costPerGram: number
  yieldPortions: number | null
  yieldGrams: number | null
  breakdown: { ingredientId: string; cost: number; note?: string }[]
}

export type RecipeAllergens = AllergenFlags & {
  ingredientIds: string[]
}

export const ALLERGEN_KEYS = [
  'hasGluten',
  'hasCrustaceans',
  'hasEggs',
  'hasFish',
  'hasPeanuts',
  'hasSoy',
  'hasMilk',
  'hasNuts',
  'hasCelery',
  'hasMustard',
  'hasSesame',
  'hasSulphites',
  'hasLupin',
  'hasMolluscs',
] as const

export type AllergenKey = typeof ALLERGEN_KEYS[number]

function convertToBase(quantity: number, unit: string, baseUnit: string): number {
  const key = `${unit}→${baseUnit}`
  switch (key) {
    case 'g→kg': return quantity / 1000
    case 'mg→kg': return quantity / 1_000_000
    case 'ml→l': return quantity / 1000
    case 'cl→l': return quantity / 100
    default:
      if (unit === baseUnit) return quantity
      return quantity
  }
}

export function calculateCost(
  ingredients: CostIngredient[],
  yieldPortions?: number | null,
  yieldGrams?: number | null,
): CostResult {
  let totalCost = 0
  const breakdown: CostResult['breakdown'] = []

  for (const ing of ingredients) {
    const converted = convertToBase(ing.quantity, ing.unit, ing.baseUnit)
    const cost = converted * ing.costPerUnit
    totalCost += cost
    breakdown.push({ ingredientId: ing.ingredientId, cost })
  }

  const portions = yieldPortions ?? null
  const grams = yieldGrams ?? null

  return {
    totalCost,
    costPerPortion: portions != null && portions > 0 ? totalCost / portions : 0,
    costPerGram: grams != null && grams > 0 ? totalCost / grams : 0,
    yieldPortions: portions,
    yieldGrams: grams,
    breakdown,
  }
}

export function aggregateAllergens(
  ingredients: (AllergenFlags & { id: string })[],
): RecipeAllergens {
  const result: RecipeAllergens = {
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
    ingredientIds: [],
  }

  for (const ing of ingredients) {
    let hasAny = false
    for (const key of ALLERGEN_KEYS) {
      if (ing[key]) {
        result[key] = true
        hasAny = true
      }
    }
    if (hasAny) {
      result.ingredientIds.push(ing.id)
    }
  }

  return result
}

export function allergenList(flags: AllergenFlags): AllergenKey[] {
  return ALLERGEN_KEYS.filter((key) => flags[key])
}
