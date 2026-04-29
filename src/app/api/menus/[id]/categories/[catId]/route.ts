import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { updateMenuCategorySchema, createMenuDishSchema } from "@/lib/validation";

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string; catId: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, updateMenuCategorySchema);
  if (!parsed.success) return parsed.response;
  const c = await prisma.menuCategory.update({
    where: { id: params.catId, menuId: params.id },
    data: parsed.data,
  });
  return NextResponse.json(c);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string; catId: string } }) => {
  await requireUser();
  await prisma.menuCategory.delete({ where: { id: params.catId, menuId: params.id } });
  return NextResponse.json({ ok: true });
});

export const POST = withErrorHandler(async (req: Request, { params }: { params: { id: string; catId: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, createMenuDishSchema);
  if (!parsed.success) return parsed.response;
  const lastOrder = (await prisma.menuDish.aggregate({
    where: { categoryId: params.catId },
    _max: { order: true },
  }))._max.order ?? -1;
  const d = await prisma.menuDish.create({
    data: {
      categoryId: params.catId,
      recipeId: parsed.data.recipeId ?? null,
      name: parsed.data.name,
      price: parsed.data.price,
      order: lastOrder + 1,
    },
  });
  return NextResponse.json(d);
});
