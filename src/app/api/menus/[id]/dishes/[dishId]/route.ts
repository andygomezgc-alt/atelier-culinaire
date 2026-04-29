import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; dishId: string } }
) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["name", "price", "order", "categoryId"] as const) {
    if (k in body) data[k] = body[k];
  }
  if ("price" in data) data.price = parseFloat(String(data.price)) || 0;
  const d = await prisma.menuDish.update({ where: { id: params.dishId }, data });
  return NextResponse.json(d);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; dishId: string } }
) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  await prisma.menuDish.delete({ where: { id: params.dishId } });
  return NextResponse.json({ ok: true });
}
