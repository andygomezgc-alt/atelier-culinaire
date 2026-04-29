import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const r = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: { versions: { orderBy: { v: "asc" } }, photos: true },
  });
  if (!r) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(r);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["name", "category", "status", "priority", "summary", "content", "ingredients", "technique"] as const) {
    if (k in body) data[k] = body[k];
  }
  const r = await prisma.recipe.update({
    where: { id: params.id },
    data,
    include: { versions: { orderBy: { v: "asc" } }, photos: true },
  });
  return NextResponse.json(r);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  await prisma.recipe.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
