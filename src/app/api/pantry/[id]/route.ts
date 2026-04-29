import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["name", "category", "cost", "season", "supplier", "stock"] as const) {
    if (k in body) data[k] = body[k];
  }
  if ("cost" in data) data.cost = parseFloat(String(data.cost)) || 0;
  const item = await prisma.pantryItem.update({ where: { id: params.id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  await prisma.pantryItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
