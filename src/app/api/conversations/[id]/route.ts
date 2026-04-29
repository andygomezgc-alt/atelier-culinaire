import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser(); if (!u) return authError();
  const c = await prisma.conversation.findFirst({
    where: { id: params.id, userId: u.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!c) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(c);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser(); if (!u) return authError();
  await prisma.conversation.deleteMany({ where: { id: params.id, userId: u.id } });
  return NextResponse.json({ ok: true });
}
