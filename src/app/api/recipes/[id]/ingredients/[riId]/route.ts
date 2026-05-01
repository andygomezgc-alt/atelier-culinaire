import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { withErrorHandler, parseBody } from '@/lib/api/handler'
import { updateRecipeIngredientSchema } from '@/lib/validation'

type Ctx = { params: { id: string; riId: string } }

export const PUT = withErrorHandler(async (req: Request, ctx: Ctx) => {
  await requireUser()
  const parsed = await parseBody(req, updateRecipeIngredientSchema)
  if (!parsed.success) return parsed.response
  const recipeIngredient = await prisma.recipeIngredient.update({
    where: { id: ctx.params.riId },
    data: parsed.data,
    include: { ingredient: true },
  })
  return NextResponse.json(recipeIngredient)
})

export const DELETE = withErrorHandler(async (_req: Request, ctx: Ctx) => {
  await requireUser()
  await prisma.recipeIngredient.delete({ where: { id: ctx.params.riId } })
  return NextResponse.json({ ok: true })
})
