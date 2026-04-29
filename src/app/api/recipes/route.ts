import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET() {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const list = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: { versions: { orderBy: { v: "asc" } }, photos: true },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const u = await getCurrentUser(); if (!u) return authError();
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const r = await prisma.recipe.create({
    data: {
      name: body.name,
      category: body.category || "",
      status: body.status || "draft",
      priority: !!body.priority,
      summary: body.summary || "",
      content: body.content || "",
      ingredients: body.ingredients || "",
      technique: body.technique || "",
      authorId: u.id,
    },
    include: { versions: true, photos: true },
  });
  return NextResponse.json(r);
}
