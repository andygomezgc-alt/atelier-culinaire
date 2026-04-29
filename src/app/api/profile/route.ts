import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.json({
    id: u.id, email: u.email, name: u.name, role: u.role,
    initials: u.initials, photoUrl: u.photoUrl, lang: u.lang,
  });
}

export async function PUT(req: Request) {
  const u = await getCurrentUser();
  if (!u) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["name", "role", "initials", "photoUrl", "lang"] as const) {
    if (k in body) data[k] = body[k];
  }
  const updated = await prisma.user.update({ where: { id: u.id }, data });
  return NextResponse.json({
    id: updated.id, email: updated.email, name: updated.name, role: updated.role,
    initials: updated.initials, photoUrl: updated.photoUrl, lang: updated.lang,
  });
}
