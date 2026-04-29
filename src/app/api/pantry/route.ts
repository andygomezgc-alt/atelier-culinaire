import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

export async function GET() {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const list = await prisma.pantryItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const item = await prisma.pantryItem.create({
    data: {
      name: body.name || "Nuevo ingrediente",
      category: body.category || "verduras",
      cost: typeof body.cost === "number" ? body.cost : 0,
      season: body.season || "allyear",
      supplier: body.supplier || "",
      stock: body.stock || "",
    },
  });
  return NextResponse.json(item);
}
