import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { createRecipeVersionSchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, createRecipeVersionSchema);
  if (!parsed.success) return parsed.response;
  const last = await prisma.recipeVersion.findFirst({
    where: { recipeId: params.id }, orderBy: { v: "desc" },
  });
  const v = (last?.v ?? 0) + 1;
  const ver = await prisma.recipeVersion.create({
    data: { recipeId: params.id, v, tester: parsed.data.tester, note: parsed.data.note },
  });
  const recipe = await prisma.recipe.findUnique({ where: { id: params.id }, select: { status: true } });
  if (recipe?.status === "draft") {
    await prisma.recipe.update({ where: { id: params.id }, data: { status: "testing" } });
  }
  return NextResponse.json(ver);
});
