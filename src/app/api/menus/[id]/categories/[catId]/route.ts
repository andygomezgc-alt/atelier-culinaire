import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; catId: string } }
) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("name" in body) data.name = body.name;
  if ("order" in body) data.order = body.order;
  const c = await prisma.menuCategory.update({
    where: { id: params.catId, menuId: params.id },
    data,
  });
  return NextResponse.json(c);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; catId: string } }
) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  await prisma.menuCategory.delete({ where: { id: params.catId, menuId: params.id } });
  return NextResponse.json({ ok: true });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string; catId: string } }
) {
  // Add a dish to this category
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const lastOrder = (await prisma.menuDish.aggregate({
    where: { categoryId: params.catId },
    _max: { order: true },
  }))._max.order ?? -1;
  const d = await prisma.menuDish.create({
    data: {
      categoryId: params.catId,
      recipeId: body.recipeId || null,
      name: body.name || "Plato",
      price: typeof body.price === "number" ? body.price : 0,
      order: lastOrder + 1,
    },
  });
  return NextResponse.json(d);
}
