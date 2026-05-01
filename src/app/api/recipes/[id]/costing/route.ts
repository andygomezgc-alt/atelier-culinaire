import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { withErrorHandler, err } from '@/lib/api/handler'

type Ctx = { params: { id: string } }

export const GET = withErrorHandler(async (_req: Request, ctx: Ctx) => {
  await requireUser()

  const recipe = await prisma.recipe.findUnique({
    where: { id: ctx.params.id },
    include: {
      recipeIngredients: {
        include: {
          ingredient: {
            include: { pantryItems: true },
          },
        },
      },
    },
  })

  if (!recipe) return err('Not found', 404)

  const ingredients = recipe.recipeIngredients.map((ri) => {
    const pantryItem = ri.ingredient.pantryItems[0] ?? null
    return {
      ingredientId: ri.ingredientId,
      ingredientName: ri.ingredient.name,
      quantity: ri.quantity,
      unit: ri.unit,
      baseUnit: ri.ingredient.unit,
      costPerUnit: pantryItem?.cost ?? 0,
      allergens: {
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
      },
    }
  })

  return NextResponse.json({
    recipeId: recipe.id,
    yieldPortions: recipe.yieldPortions,
    yieldGrams: recipe.yieldGrams,
    ingredients,
  })
})
