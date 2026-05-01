import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { withErrorHandler, parseBody, err } from '@/lib/api/handler'
import { updateIngredientSchema } from '@/lib/validation'

type Ctx = { params: { id: string } }

export const GET = withErrorHandler(async (_req: Request, ctx: Ctx) => {
  await requireUser()
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ctx.params.id },
    include: { _count: { select: { recipeIngredients: true } } },
  })
  if (!ingredient) return err('Not found', 404)
  return NextResponse.json(ingredient)
})

export const PUT = withErrorHandler(async (req: Request, ctx: Ctx) => {
  await requireUser()
  const parsed = await parseBody(req, updateIngredientSchema)
  if (!parsed.success) return parsed.response
  const ingredient = await prisma.ingredient.update({
    where: { id: ctx.params.id },
    data: parsed.data,
  })
  return NextResponse.json(ingredient)
})

export const DELETE = withErrorHandler(async (_req: Request, ctx: Ctx) => {
  await requireUser()
  await prisma.ingredient.delete({ where: { id: ctx.params.id } })
  return NextResponse.json({ ok: true })
})
