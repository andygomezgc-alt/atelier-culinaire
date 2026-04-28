import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const ACCESS = ["admin", "editor", "viewer"] as const;
const ROLES = ["exec", "sous", "rd"] as const;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return new NextResponse("Unauthorized", { status: 401 });
  if (me.accessLevel !== "admin") return new NextResponse("Forbidden", { status: 403 });
  if (params.id === me.id) return NextResponse.json({ error: "cannot_modify_self" }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.accessLevel === "string" && (ACCESS as readonly string[]).includes(body.accessLevel)) {
    data.accessLevel = body.accessLevel;
  }
  if (typeof body.role === "string" && (ROLES as readonly string[]).includes(body.role)) {
    data.role = body.role;
  }
  const u = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, email: true, name: true, role: true, accessLevel: true, initials: true, photoUrl: true, phone: true },
  });
  return NextResponse.json(u);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return new NextResponse("Unauthorized", { status: 401 });
  if (me.accessLevel !== "admin") return new NextResponse("Forbidden", { status: 403 });
  if (params.id === me.id) return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });

  // Soft revoke: set accessLevel to viewer (preserves FKs to ideas/recipes/conversations).
  await prisma.user.update({ where: { id: params.id }, data: { accessLevel: "viewer" } });
  return NextResponse.json({ ok: true });
}
