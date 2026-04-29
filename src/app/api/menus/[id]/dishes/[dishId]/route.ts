import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { updateMenuDishSchema } from "@/lib/validation";

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string; dishId: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, updateMenuDishSchema);
  if (!parsed.success) return parsed.response;
  const d = await prisma.menuDish.update({ where: { id: params.dishId }, data: parsed.data });
  return NextResponse.json(d);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string; dishId: string } }) => {
  await requireUser();
  await prisma.menuDish.delete({ where: { id: params.dishId } });
  return NextResponse.json({ ok: true });
});
