import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, authError } from "@/lib/auth";
import { anthropic, ANTHROPIC_MODEL, buildSystemPrompt } from "@/lib/anthropic";
import { langName, type Lang } from "@/lib/i18n";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  conversationId?: string;
  message: string;
  lang?: Lang;
};

export async function POST(req: Request) {
  const u = await getCurrentUser(); if (!u) return authError();
  const body = (await req.json()) as Body;
  if (!body.message?.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });

  // Resolve / create conversation
  let convId = body.conversationId;
  if (!convId) {
    const c = await prisma.conversation.create({
      data: { userId: u.id, title: body.message.slice(0, 60) },
    });
    convId = c.id;
  } else {
    const owns = await prisma.conversation.findFirst({
      where: { id: convId, userId: u.id }, select: { id: true },
    });
    if (!owns) return new NextResponse("Forbidden", { status: 403 });
  }

  // Persist user message
  await prisma.message.create({
    data: { conversationId: convId, role: "user", content: body.message },
  });

  // Build context
  const [restaurant, pantry, recipes, history] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: "default" } }),
    prisma.pantryItem.findMany({ select: { name: true }, take: 30 }),
    prisma.recipe.findMany({ select: { name: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const lang: Lang = body.lang || (u.lang as Lang) || "es";
  const system = buildSystemPrompt({
    langName: langName(lang),
    house: {
      name: restaurant?.name || "Ristorante Marche",
      style: restaurant?.style || "",
      season: restaurant?.season || "",
      price: restaurant?.price || "",
      restrictions: restaurant?.restrictions || "",
    },
    pantryNames: pantry.map((p) => p.name),
    recipeNames: recipes.map((r) => r.name),
  });

  let assistantText = "";
  try {
    const resp = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      system,
      messages: history.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });
    assistantText = resp.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n")
      .trim();
    if (!assistantText) assistantText = "(respuesta vacía)";
  } catch (e) {
    const err = e as { message?: string };
    assistantText =
      "_(Error de conexión con el asistente. Intente de nuevo en un momento.)_\n\n" +
      (err.message || "Unknown error");
  }

  const stored = await prisma.message.create({
    data: { conversationId: convId, role: "assistant", content: assistantText },
  });
  await prisma.conversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });

  return NextResponse.json({
    conversationId: convId,
    message: { id: stored.id, role: "assistant", content: assistantText, createdAt: stored.createdAt },
  });
}
