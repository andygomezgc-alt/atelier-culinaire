import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";

async function ensureRestaurant() {
  const r = await prisma.restaurant.findUnique({ where: { id: "default" } });
  if (r) return r;
  return prisma.restaurant.create({ data: { id: "default" } });
}

export async function GET() {
  // Allow read for any authed user; if not authed, still respond (used by login pre-fetch).
  await getCurrentUser();
  const r = await ensureRestaurant();
  return NextResponse.json(r);
}

export async function PUT(req: Request) {
  { const _u = await getCurrentUser(); if (!_u) return authError(); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["name", "style", "season", "price", "restrictions"] as const) {
    if (k in body) data[k] = body[k];
  }
  const r = await prisma.restaurant.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...(data as Record<string, string>) },
  });
  return NextResponse.json(r);
}
