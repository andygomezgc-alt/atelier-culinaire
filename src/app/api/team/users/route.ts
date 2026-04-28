import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return new NextResponse("Unauthorized", { status: 401 });
  const users = await prisma.user.findMany({
    where: { id: { not: me.id } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, email: true, name: true, role: true,
      accessLevel: true, initials: true, photoUrl: true, phone: true,
    },
  });
  return NextResponse.json(users);
}
