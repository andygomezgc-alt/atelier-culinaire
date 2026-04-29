import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { createTeamMemberSchema } from "@/lib/validation";

export const GET = withErrorHandler(async () => {
  await requireUser();
  const list = await prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(list);
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireUser();
  const parsed = await parseBody(req, createTeamMemberSchema);
  if (!parsed.success) return parsed.response;
  const m = await prisma.teamMember.create({ data: parsed.data });
  return NextResponse.json(m);
});
