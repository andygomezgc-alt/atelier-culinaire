import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const { name } = await req.json();
  const lastOrder = (await prisma.menuCategory.aggregate({
    where: { menuId: params.id },
    _max: { order: true },
  }))._max.order ?? -1;
  const c = await prisma.menuCategory.create({
    data: { menuId: params.id, name: name || "Nueva categoría", order: lastOrder + 1 },
    include: { dishes: true },
  });
  return NextResponse.json(c);
}
