import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { createIdeaSchema } from "@/lib/validation";

export const GET = withErrorHandler(async () => {
  const u = await requireUser();
  const list = await prisma.idea.findMany({ where: { authorId: u.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
});

export const POST = withErrorHandler(async (req: Request) => {
  const u = await requireUser();
  const parsed = await parseBody(req, createIdeaSchema);
  if (!parsed.success) return parsed.response;
  const idea = await prisma.idea.create({ data: { text: parsed.data.text.trim(), authorId: u.id } });
  return NextResponse.json(idea);
});
