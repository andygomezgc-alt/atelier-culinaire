import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody, err } from "@/lib/api/handler";
import { createRecipeSchema } from "@/lib/validation";

const include = {
  versions: { orderBy: { v: "asc" as const } },
  photos: true,
};

export const GET = withErrorHandler(async () => {
  await requireUser();
  const list = await prisma.recipe.findMany({ orderBy: { createdAt: "desc" }, include });
  return NextResponse.json(list);
});

export const POST = withErrorHandler(async (req: Request) => {
  const u = await requireUser();
  const parsed = await parseBody(req, createRecipeSchema);
  if (!parsed.success) return parsed.response;
  const r = await prisma.recipe.create({
    data: { ...parsed.data, authorId: u.id },
    include,
  });
  return NextResponse.json(r);
});
