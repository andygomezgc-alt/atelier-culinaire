"use client";
import { useTranslations } from "next-intl";

export type RecipeData = {
  title: string;
  composition: string;
  method: string[];
};

const RECIPE_BLOCK_RE = /```recipe\n([\s\S]*?)```/;

export function parseRecipeBlock(content: string): { text: string; recipe: RecipeData | null } {
  const match = content.match(RECIPE_BLOCK_RE);
  if (!match) return { text: content, recipe: null };

  const raw = match[1];
  const text = content.replace(RECIPE_BLOCK_RE, "").trim();

  const titleMatch = raw.match(/^title:\s*(.+)$/m);
  const compositionMatch = raw.match(/^composition:\s*(.+)$/m);
  const methodMatch = raw.match(/^method:([\s\S]*)$/m);

  const recipe: RecipeData = {
    title: titleMatch?.[1]?.trim() ?? "",
    composition: compositionMatch?.[1]?.trim() ?? "",
    method: methodMatch?.[1]
      ? methodMatch[1]
          .split("\n")
          .map((l) => l.replace(/^-\s*/, "").trim())
          .filter(Boolean)
      : [],
  };

  return { text, recipe };
}

type RecipeCardProps = {
  data: RecipeData;
  onSave: () => void;
  saved: boolean;
};

export function RecipeCard({ data, onSave, saved }: RecipeCardProps) {
  const t = useTranslations();

  return (
    <div className="mt-s-4 border border-border rounded-sm p-s-5 bg-surface">
      <h3 className="font-sans text-h3 text-text mb-s-3">{data.title}</h3>
      {data.composition && (
        <div className="mb-s-3">
          <p className="font-sans text-caption uppercase tracking-[0.1em] text-text-tertiary mb-s-1">
            {t("recipe-composition")}
          </p>
          <p className="font-serif italic text-body text-text">{data.composition}</p>
        </div>
      )}
      {data.method.length > 0 && (
        <div className="mb-s-4">
          <p className="font-sans text-caption uppercase tracking-[0.1em] text-text-tertiary mb-s-1">
            {t("recipe-method")}
          </p>
          <ol className="list-decimal list-inside space-y-s-1">
            {data.method.map((step, i) => (
              <li key={i} className="font-sans text-body text-text">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={saved}
        className="font-sans text-caption uppercase tracking-[0.1em] px-s-4 py-s-2 border border-border rounded-sm disabled:opacity-40 hover:bg-bg transition-colors"
      >
        {saved ? t("recipe-saved") : t("recipe-save")}
      </button>
    </div>
  );
}
