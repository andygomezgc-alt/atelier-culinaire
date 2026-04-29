import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { updateTeamMemberSchema } from "@/lib/validation";

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, updateTeamMemberSchema);
  if (!parsed.success) return parsed.response;
  const m = await prisma.teamMember.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(m);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  await prisma.teamMember.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
