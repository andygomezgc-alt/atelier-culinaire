import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody } from "@/lib/api/handler";
import { createMenuSchema } from "@/lib/validation";

const include = {
  categories: {
    orderBy: { order: "asc" as const },
    include: { dishes: { orderBy: { order: "asc" as const } } },
  },
};

export const GET = withErrorHandler(async () => {
  await requireUser();
  const list = await prisma.menu.findMany({ orderBy: { createdAt: "desc" }, include });
  return NextResponse.json(list);
});

export const POST = withErrorHandler(async (req: Request) => {
  await requireUser();
  const parsed = await parseBody(req, createMenuSchema);
  if (!parsed.success) return parsed.response;
  const defaultCategories = [
    { name: "Entradas frías" }, { name: "Entradas calientes" },
    { name: "Primeros" }, { name: "Pescados" }, { name: "Carnes" }, { name: "Postres" },
  ];
  const m = await prisma.menu.create({
    data: {
      name: parsed.data.name,
      template: parsed.data.template,
      categories: {
        create: (parsed.data.categories ?? defaultCategories).map((c, i) => ({
          name: c.name, order: i,
        })),
      },
    },
    include,
  });
  return NextResponse.json(m);
});
