import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser(); if (!u) return authError();
  const list = await prisma.idea.findMany({ where: { authorId: u.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const u = await getCurrentUser(); if (!u) return authError();
  const { text } = await req.json();
  if (!text || !text.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  const idea = await prisma.idea.create({ data: { text: text.trim(), authorId: u.id } });
  return NextResponse.json(idea);
}
