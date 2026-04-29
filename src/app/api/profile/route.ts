import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody, err } from "@/lib/api/handler";
import { updateProfileSchema } from "@/lib/validation";

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

export const GET = withErrorHandler(async () => {
  const u = await requireUser();
  return NextResponse.json(publicUser(u));
});

export const PUT = withErrorHandler(async (req: Request) => {
  const u = await requireUser();
  const parsed = await parseBody(req, updateProfileSchema);
  if (!parsed.success) return parsed.response;

  const { currentPassword, newPassword, email, ...fields } = parsed.data;
  const data: Record<string, unknown> = { ...fields };

  if (email && email.toLowerCase() !== u.email) {
    const taken = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (taken) return err("email_taken", 409);
    data.email = email.toLowerCase();
  }

  if (newPassword) {
    if (u.passwordHash) {
      const ok = await bcrypt.compare(currentPassword ?? "", u.passwordHash);
      if (!ok) return err("wrong_password", 403);
    }
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const updated = await prisma.user.update({ where: { id: u.id }, data });
  return NextResponse.json(publicUser(updated));
});
