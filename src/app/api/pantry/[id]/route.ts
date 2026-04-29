import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { updatePantryItemSchema } from "@/lib/validation";

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, updatePantryItemSchema);
  if (!parsed.success) return parsed.response;
  const item = await prisma.pantryItem.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(item);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  await prisma.pantryItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
