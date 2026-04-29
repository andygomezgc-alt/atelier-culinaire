import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { updateMenuSchema } from "@/lib/validation";

const include = {
  categories: {
    orderBy: { order: "asc" as const },
    include: { dishes: { orderBy: { order: "asc" as const } } },
  },
};

export const GET = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const m = await prisma.menu.findUnique({ where: { id: params.id }, include });
  if (!m) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(m);
});

export const PUT = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, updateMenuSchema);
  if (!parsed.success) return parsed.response;
  const m = await prisma.menu.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(m);
});

export const DELETE = withErrorHandler(async (_req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  await prisma.menu.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
