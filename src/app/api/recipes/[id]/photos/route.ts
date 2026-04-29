import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody, err } from "@/lib/api/handler";
import { z } from "zod";

const addPhotoSchema = z.object({ url: z.string().min(1, "url required") });

export const POST = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, addPhotoSchema);
  if (!parsed.success) return parsed.response;
  const p = await prisma.recipePhoto.create({ data: { recipeId: params.id, url: parsed.data.url } });
  return NextResponse.json(p);
});

export const DELETE = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const photoId = new URL(req.url).searchParams.get("photoId");
  if (!photoId) return err("photoId required", 400);
  await prisma.recipePhoto.delete({ where: { id: photoId, recipeId: params.id } });
  return NextResponse.json({ ok: true });
});
