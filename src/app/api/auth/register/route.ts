import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { initialsFrom } from "@/lib/utils";
import { withErrorHandler, parseBody, err } from "@/lib/api/handler";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(6, "Password too short"),
  name: z.string().min(1, "name required"),
});

export const POST = withErrorHandler(async (req: Request) => {
  const parsed = await parseBody(req, registerSchema);
  if (!parsed.success) return parsed.response;

  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return err("Already exists", 409);

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
});
