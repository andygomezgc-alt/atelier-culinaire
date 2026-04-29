import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser(); if (!u) return authError();
  const list = await prisma.conversation.findMany({
    where: { userId: u.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const u = await getCurrentUser(); if (!u) return authError();
  const body = await req.json().catch(() => ({}));
  const c = await prisma.conversation.create({
    data: { userId: u.id, title: body.title || "Nueva conversación" },
    include: { messages: true },
  });
  return NextResponse.json(c);
}
