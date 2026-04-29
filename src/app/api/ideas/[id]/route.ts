import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser(); if (!u) return authError();
  const body = await req.json();
  const idea = await prisma.idea.update({
    where: { id: params.id, authorId: u.id },
    data: { text: body.text },
  });
  return NextResponse.json(idea);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const u = await getCurrentUser(); if (!u) return authError();
  await prisma.idea.delete({ where: { id: params.id, authorId: u.id } });
  return NextResponse.json({ ok: true });
}
