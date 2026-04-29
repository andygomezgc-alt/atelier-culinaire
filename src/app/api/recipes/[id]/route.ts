import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { updateRecipeSchema } from "@/lib/validation";

const include = {
  versions: { orderBy: { v: "asc" as const } },
  photos: true,
};

export const GET = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const r = await prisma.recipe.findUnique({ where: { id: params.id }, include });
  if (!r) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(r);
});

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, updateRecipeSchema);
  if (!parsed.success) return parsed.response;
  const r = await prisma.recipe.update({ where: { id: params.id }, data: parsed.data, include });
  return NextResponse.json(r);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  await prisma.recipe.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
