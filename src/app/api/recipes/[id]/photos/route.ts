import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  const p = await prisma.recipePhoto.create({ data: { recipeId: params.id, url } });
  return NextResponse.json(p);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const photoId = new URL(req.url).searchParams.get("photoId");
  if (!photoId) return NextResponse.json({ error: "photoId required" }, { status: 400 });
  await prisma.recipePhoto.delete({ where: { id: photoId, recipeId: params.id } });
  return NextResponse.json({ ok: true });
}
