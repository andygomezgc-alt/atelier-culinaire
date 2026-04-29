import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { createIdeaSchema } from "@/lib/validation";

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const u = await requireUser();
  const parsed = await parseBody(req, createIdeaSchema);
  if (!parsed.success) return parsed.response;
  const idea = await prisma.idea.update({
    where: { id: params.id, authorId: u.id },
    data: { text: parsed.data.text },
  });
  return NextResponse.json(idea);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const u = await requireUser();
  await prisma.idea.delete({ where: { id: params.id, authorId: u.id } });
  return NextResponse.json({ ok: true });
});
