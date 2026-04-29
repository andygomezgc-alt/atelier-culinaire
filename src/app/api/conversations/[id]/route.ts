import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api/handler";

export const GET = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const u = await requireUser();
  const c = await prisma.conversation.findFirst({
    where: { id: params.id, userId: u.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!c) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(c);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const u = await requireUser();
  await prisma.conversation.deleteMany({ where: { id: params.id, userId: u.id } });
  return NextResponse.json({ ok: true });
});
