import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { createPantryItemSchema } from "@/lib/validation";

export const GET = withErrorHandler(async () => {
  await requireUser();
  const list = await prisma.pantryItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireUser();
  const parsed = await parseBody(req, createPantryItemSchema);
  if (!parsed.success) return parsed.response;
  const item = await prisma.pantryItem.create({ data: parsed.data });
  return NextResponse.json(item);
});
