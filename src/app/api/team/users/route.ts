import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api/handler";

export const GET = withErrorHandler(async () => {
  const me = await requireUser();
  const users = await prisma.user.findMany({
    where: { id: { not: me.id } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, email: true, name: true, role: true,
      accessLevel: true, initials: true, photoUrl: true, phone: true,
    },
  });
  return NextResponse.json(users);
});
