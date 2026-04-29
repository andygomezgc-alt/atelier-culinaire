import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET() {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const list = await prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const { name, role } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const m = await prisma.teamMember.create({ data: { name, role: role || "contributor" } });
  return NextResponse.json(m);
}
