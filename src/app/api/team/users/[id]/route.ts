import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody, err } from "@/lib/api/handler";
import { updateUserAccessSchema } from "@/lib/validation";
import { z } from "zod";

const updateUserSchema = z.object({
  accessLevel: z.enum(["admin", "editor", "viewer"]).optional(),
  role: z.enum(["exec", "sous", "rd"]).optional(),
});

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const me = await requireUser();
  if (me.accessLevel !== "admin") return new NextResponse("Forbidden", { status: 403 });
  if (params.id === me.id) return err("cannot_modify_self", 400);
  const parsed = await parseBody(req, updateUserSchema);
  if (!parsed.success) return parsed.response;
  const u = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true, accessLevel: true, initials: true, photoUrl: true, phone: true },
  });
  return NextResponse.json(u);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  const me = await requireUser();
  if (me.accessLevel !== "admin") return new NextResponse("Forbidden", { status: 403 });
  if (params.id === me.id) return err("cannot_delete_self", 400);
  await prisma.user.update({ where: { id: params.id }, data: { accessLevel: "viewer" } });
  return NextResponse.json({ ok: true });
});
