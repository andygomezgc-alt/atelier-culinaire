import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function publicUser(u: {
  id: string; email: string; name: string; role: string;
  initials: string; photoUrl: string | null; phone: string | null;
  lang: string; accessLevel: string;
}) {
  return {
    id: u.id, email: u.email, name: u.name, role: u.role,
    initials: u.initials, photoUrl: u.photoUrl, phone: u.phone,
    lang: u.lang, accessLevel: u.accessLevel,
  };
}

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return new NextResponse("Unauthorized", { status: 401 });
  return NextResponse.json(publicUser(u));
}

export async function PUT(req: Request) {
  const u = await getCurrentUser();
  if (!u) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const data: Record<string, unknown> = {};

  for (const k of ["name", "role", "initials", "photoUrl", "lang", "phone"] as const) {
    if (k in body) data[k] = body[k];
  }

  if (typeof body.email === "string" && body.email.toLowerCase() !== u.email) {
    const taken = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (taken) return NextResponse.json({ error: "email_taken" }, { status: 409 });
    data.email = body.email.toLowerCase();
  }

  if (typeof body.newPassword === "string" && body.newPassword.length >= 6) {
    if (u.passwordHash) {
      const ok = await bcrypt.compare(body.currentPassword || "", u.passwordHash);
      if (!ok) return NextResponse.json({ error: "wrong_password" }, { status: 403 });
    }
    data.passwordHash = await bcrypt.hash(body.newPassword, 10);
  }

  const updated = await prisma.user.update({ where: { id: u.id }, data });
  return NextResponse.json(publicUser(updated));
}
