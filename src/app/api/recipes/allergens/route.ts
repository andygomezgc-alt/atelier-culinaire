import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { withErrorHandler } from '@/lib/api/handler'
import { aggregateAllergens, allergenList } from '@/lib/costing'

export const GET = withErrorHandler(async (req: Request) => {
  await requireUser()

  const { searchParams } = new URL(req.url)
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? []

  if (ids.length === 0) {
    return NextResponse.json({})
  }

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: ids } },
    include: {
      recipeIngredients: {
        include: { ingredient: true },
      },
    },
  })

  const result: Record<string, string[]> = {}
  for (const recipe of recipes) {
    const ingredientsWithId = recipe.recipeIngredients.map((ri) => ({
      id: ri.ingredientId,
      hasGluten: ri.ingredient.hasGluten,
      hasCrustaceans: ri.ingredient.hasCrustaceans,
      hasEggs: ri.ingredient.hasEggs,
      hasFish: ri.ingredient.hasFish,
      hasPeanuts: ri.ingredient.hasPeanuts,
      hasSoy: ri.ingredient.hasSoy,
      hasMilk: ri.ingredient.hasMilk,
      hasNuts: ri.ingredient.hasNuts,
      hasCelery: ri.ingredient.hasCelery,
      hasMustard: ri.ingredient.hasMustard,
      hasSesame: ri.ingredient.hasSesame,
      hasSulphites: ri.ingredient.hasSulphites,
      hasLupin: ri.ingredient.hasLupin,
      hasMolluscs: ri.ingredient.hasMolluscs,
    }))
    const aggregated = aggregateAllergens(ingredientsWithId)
    result[recipe.id] = allergenList(aggregated)
  }

  return NextResponse.json(result)
})
