import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { withErrorHandler, parseBody } from '@/lib/api/handler'
import { createRecipeIngredientSchema } from '@/lib/validation'

type Ctx = { params: { id: string } }

export const GET = withErrorHandler(async (_req: Request, ctx: Ctx) => {
  await requireUser()
  const list = await prisma.recipeIngredient.findMany({
    where: { recipeId: ctx.params.id },
    include: { ingredient: true },
  })
  return NextResponse.json(list)
})

export const POST = withErrorHandler(async (req: Request, ctx: Ctx) => {
  await requireUser()
  const parsed = await parseBody(req, createRecipeIngredientSchema)
  if (!parsed.success) return parsed.response
  const recipeIngredient = await prisma.recipeIngredient.create({
    data: { ...parsed.data, recipeId: ctx.params.id },
    include: { ingredient: true },
  })
  return NextResponse.json(recipeIngredient)
})
