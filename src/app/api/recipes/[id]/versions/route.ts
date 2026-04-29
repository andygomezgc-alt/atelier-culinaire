import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const { tester, note } = await req.json();
  if (!note) return NextResponse.json({ error: "note required" }, { status: 400 });
  const last = await prisma.recipeVersion.findFirst({
    where: { recipeId: params.id }, orderBy: { v: "desc" },
  });
  const v = (last?.v ?? 0) + 1;
  const ver = await prisma.recipeVersion.create({
    data: { recipeId: params.id, v, tester: tester || "", note },
  });
  // Bump status draft → testing
  const recipe = await prisma.recipe.findUnique({ where: { id: params.id }, select: { status: true } });
  if (recipe?.status === "draft") {
    await prisma.recipe.update({ where: { id: params.id }, data: { status: "testing" } });
  }
  return NextResponse.json(ver);
}
