"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useIdeas, useCreateIdea } from "@/hooks";
import { Button, Textarea } from "@/components/ui";
import type { Locale } from "@/i18n.config";

type Idea = { id: string; text: string; createdAt: Date | string; authorId: string };

function formatRelative(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "ayer";
  return `hace ${days}d`;
}

function formatDate(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function InicioPage() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [draft, setDraft] = useState("");

  const { data: ideas = [] } = useIdeas();
  const createIdea = useCreateIdea();

  function handleSave() {
    const text = draft.trim();
    if (!text) return;
    createIdea.mutate(text);
    setDraft("");
  }

  function handleIdeaClick(idea: Idea) {
    router.push(`/${locale}/chat?idea=${encodeURIComponent(idea.text)}`);
  }

  return (
    <div className="px-s-6 py-s-8">
      <h2 className="font-sans text-h2 text-text">{t("inicio-title")}</h2>
      <p className="font-mono text-caption text-text-tertiary mt-s-1 mb-s-6">
        {formatDate(locale)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-s-8">
        <div>
          <Textarea
            placeholder={t("idea-placeholder")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            className="w-full"
          />
          <div className="flex justify-end mt-s-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!draft.trim() || createIdea.isPending}
            >
              {t("idea-save")}
            </Button>
          </div>
        </div>

        <div>
          <p className="font-sans text-caption uppercase tracking-[0.1em] text-text-tertiary mb-s-3">
            {t("ideas-recent")}
          </p>
          {ideas.length === 0 ? (
            <p className="font-serif italic text-caption text-text-tertiary">
              {t("ideas-empty")}
            </p>
          ) : (
            <ul>
              {ideas.map((idea) => (
                <li key={idea.id}>
                  <button
                    type="button"
                    onClick={() => handleIdeaClick(idea)}
                    className="w-full flex items-baseline justify-between py-s-3 border-b border-border hover:bg-surface transition-colors duration-[120ms] text-left"
                  >
                    <span className="font-serif italic text-h4 text-text">
                      &ldquo;{idea.text}&rdquo;
                    </span>
                    <span className="font-mono text-micro text-text-tertiary ml-s-3 shrink-0">
                      {formatRelative(idea.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
