"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useToast } from "@/components/Toast";
import { RecipeCard, parseRecipeBlock } from "@/components/RecipeCard";
import type { RecipeData } from "@/components/RecipeCard";
import type { Locale } from "@/i18n.config";

type Msg = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

function ChatInner() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const toast = useToast();
  const searchParams = useSearchParams();
  const ideaParam = searchParams.get("idea");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const [savedRecipes, setSavedRecipes] = useState<Set<number>>(new Set());
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentRef = useRef(false);

  useEffect(() => {
    if (ideaParam && !sentRef.current) {
      sentRef.current = true;
      sendMessage(ideaParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaParam]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  async function sendMessage(text: string) {
    if (!text.trim() || thinking) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          message: text,
          lang: locale,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setConvId(data.conversationId);
      setMessages((m) => [
        ...m,
        { id: data.message.id, role: "assistant", content: data.message.content },
      ]);
    } catch (e) {
      const err = e as { message?: string };
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${err.message ?? "unknown"}` },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function handleSend() {
    sendMessage(input.trim());
  }

  async function handleSaveRecipe(recipe: RecipeData, msgIndex: number) {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: recipe.title,
        ingredients: recipe.composition,
        content: recipe.method.join("\n"),
        status: "draft",
      }),
    });
    if (res.ok) {
      setSavedRecipes((s) => new Set(s).add(msgIndex));
      toast(t("recipe-saved-toast"));
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      <div className="px-s-6 py-s-4 border-b border-border shrink-0">
        <h2 className="font-sans text-h2 text-text">{t("chat-title")}</h2>
        {ideaParam && (
          <p className="font-serif italic text-sm text-text-secondary mt-s-1">
            {t("chat-about")} &ldquo;{ideaParam}&rdquo;
          </p>
        )}
      </div>

      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto px-s-6 py-s-6 space-y-s-6"
      >
        {messages.map((msg, i) => {
          if (msg.role === "user") {
            return (
              <div key={msg.id ?? i} className="flex justify-end">
                <p className="font-serif italic text-body text-text max-w-[60%] py-s-2">
                  &ldquo;{msg.content}&rdquo;
                </p>
              </div>
            );
          }

          const { text, recipe } = parseRecipeBlock(msg.content);
          return (
            <div key={msg.id ?? i} className="border-t border-border pt-s-4">
              {text && (
                <p className="font-sans text-body text-text max-w-[75%] whitespace-pre-wrap">
                  {text}
                </p>
              )}
              {recipe && (
                <RecipeCard
                  data={recipe}
                  onSave={() => handleSaveRecipe(recipe, i)}
                  saved={savedRecipes.has(i)}
                />
              )}
            </div>
          );
        })}

        {thinking && (
          <div className="border-t border-border pt-s-4">
            <p className="font-sans text-body text-text-tertiary">{t("chat-thinking")}</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-bg border-t border-border px-s-6 py-s-4 shrink-0">
        <div className="flex items-end gap-s-3">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={t("chat-placeholder")}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoGrow(e.target);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 resize-none border border-border rounded-sm px-s-4 py-s-3 font-serif italic text-body bg-bg text-text placeholder:text-text-tertiary focus:outline-none focus:border-text transition-colors"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={thinking || !input.trim()}
            className="px-s-4 py-s-3 bg-invert text-invert-text font-sans text-caption uppercase tracking-[0.1em] rounded-sm disabled:opacity-40 transition-opacity"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatInner />
    </Suspense>
  );
}
