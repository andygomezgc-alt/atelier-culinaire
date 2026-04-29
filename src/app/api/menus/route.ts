import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET() {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const list = await prisma.menu.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { dishes: { orderBy: { order: "asc" } } },
      },
    },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const m = await prisma.menu.create({
    data: {
      name: body.name || "Nuevo menú",
      template: body.template || "elegante",
      categories: {
        create: (
          body.categories || [
            { name: "Entradas frías" },
            { name: "Entradas calientes" },
            { name: "Primeros" },
            { name: "Pescados" },
            { name: "Carnes" },
            { name: "Postres" },
          ]
        ).map((c: { name: string }, i: number) => ({ name: c.name, order: i })),
      },
    },
    include: {
      categories: { include: { dishes: true }, orderBy: { order: "asc" } },
    },
  });
  return NextResponse.json(m);
}
