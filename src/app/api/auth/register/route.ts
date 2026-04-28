import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { initialsFrom } from "@/lib/utils";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "Already exists" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      name,
      initials: initialsFrom(name),
      accessLevel: "viewer",
    },
  });
  return NextResponse.json({ id: user.id });
}
