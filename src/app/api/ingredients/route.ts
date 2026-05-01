import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { withErrorHandler, parseBody } from '@/lib/api/handler'
import { createIngredientSchema } from '@/lib/validation'

export const GET = withErrorHandler(async () => {
  await requireUser()
  const list = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { pantryItems: true } } },
  })
  return NextResponse.json(list)
})

export const POST = withErrorHandler(async (req: Request) => {
  await requireUser()
  const parsed = await parseBody(req, createIngredientSchema)
  if (!parsed.success) return parsed.response
  const ingredient = await prisma.ingredient.create({ data: parsed.data })
  return NextResponse.json(ingredient)
})
