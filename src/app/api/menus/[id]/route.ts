import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const m = await prisma.menu.findUnique({
    where: { id: params.id },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { dishes: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!m) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(m);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["name", "template"] as const) if (k in body) data[k] = body[k];
  const m = await prisma.menu.update({ where: { id: params.id }, data });
  return NextResponse.json(m);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  await prisma.menu.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
