import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { createMenuCategorySchema } from "@/lib/validation";

export const POST = withErrorHandler(async (req: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const parsed = await parseBody(req, createMenuCategorySchema);
  if (!parsed.success) return parsed.response;
  const lastOrder = (await prisma.menuCategory.aggregate({
    where: { menuId: params.id },
    _max: { order: true },
  }))._max.order ?? -1;
  const c = await prisma.menuCategory.create({
    data: { menuId: params.id, name: parsed.data.name, order: lastOrder + 1 },
    include: { dishes: true },
  });
  return NextResponse.json(c);
});
