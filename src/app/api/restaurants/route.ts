import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Hardcoded default until multi-restaurant schema is implemented
  return NextResponse.json({
    restaurants: [{ id: "default", name: "Mi Restaurante" }],
    currentRestaurantId: "default",
  });
}
