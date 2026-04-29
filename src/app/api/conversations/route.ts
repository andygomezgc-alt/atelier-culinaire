import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { z } from "zod";

const createConversationSchema = z.object({
  title: z.string().default("Nueva conversación"),
});

export const GET = withErrorHandler(async () => {
  const u = await requireUser();
  const list = await prisma.conversation.findMany({
    where: { userId: u.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(list);
});

export const POST = withErrorHandler(async (req: Request) => {
  const u = await requireUser();
  const body = await req.json().catch(() => ({}));
  const parsed = createConversationSchema.safeParse(body);
  const title = parsed.success ? parsed.data.title : "Nueva conversación";
  const c = await prisma.conversation.create({
    data: { userId: u.id, title },
    include: { messages: true },
  });
  return NextResponse.json(c);
});
