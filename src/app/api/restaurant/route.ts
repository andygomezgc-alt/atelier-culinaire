import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { updateRestaurantSchema } from "@/lib/validation";

async function ensureRestaurant() {
  const r = await prisma.restaurant.findUnique({ where: { id: "default" } });
  if (r) return r;
  return prisma.restaurant.create({ data: { id: "default" } });
}

export const GET = withErrorHandler(async () => {
  await getCurrentUser();
  const r = await ensureRestaurant();
  return NextResponse.json(r);
});

export const PUT = withErrorHandler(async (req: Request) => {
  await requireUser();
  const parsed = await parseBody(req, updateRestaurantSchema);
  if (!parsed.success) return parsed.response;
  const r = await prisma.restaurant.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...(parsed.data as Record<string, string>) },
  });
  return NextResponse.json(r);
});
