import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, parseBody, err } from "@/lib/api/handler";
import { anthropic, ANTHROPIC_MODEL, buildSystemPrompt } from "@/lib/anthropic";
import { langName, type Lang } from "@/lib/i18n";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, "message required"),
  lang: z.enum(["es", "it", "en"]).optional(),
});

export const POST = withErrorHandler(async (req: Request) => {
  const u = await requireUser();
  const parsed = await parseBody(req, chatSchema);
  if (!parsed.success) return parsed.response;

  const { message, lang: bodyLang, conversationId: bodyConvId } = parsed.data;

  let convId = bodyConvId;
  if (!convId) {
    const c = await prisma.conversation.create({
      data: { userId: u.id, title: message.slice(0, 60) },
    });
    convId = c.id;
  } else {
    const owns = await prisma.conversation.findFirst({
      where: { id: convId, userId: u.id }, select: { id: true },
    });
    if (!owns) return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.message.create({
    data: { conversationId: convId, role: "user", content: message },
  });

  const [restaurant, pantry, recipes, history] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: "default" } }),
    prisma.pantryItem.findMany({ select: { name: true }, take: 30 }),
    prisma.recipe.findMany({ select: { name: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.message.findMany({ where: { conversationId: convId }, orderBy: { createdAt: "asc" } }),
  ]);

  const lang: Lang = bodyLang || (u.lang as Lang) || "es";
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
    const apiErr = e as { message?: string };
    assistantText =
      "_(Error de conexión con el asistente. Intente de nuevo en un momento.)_\n\n" +
      (apiErr.message || "Unknown error");
  }

  const stored = await prisma.message.create({
    data: { conversationId: convId, role: "assistant", content: assistantText },
  });
  await prisma.conversation.update({ where: { id: convId }, data: { updatedAt: new Date() } });

  return NextResponse.json({
    conversationId: convId,
    message: { id: stored.id, role: "assistant", content: assistantText, createdAt: stored.createdAt },
  });
});
