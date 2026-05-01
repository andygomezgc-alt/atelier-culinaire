import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type RecipeState = "draft" | "en-prueba" | "aprobada" | "archivada";

const STATE_GLYPH: Record<RecipeState, string> = {
  draft: "◯",
  "en-prueba": "◐",
  aprobada: "●",
  archivada: "⊖",
};

const STATE_LABEL: Record<RecipeState, string> = {
  draft: "draft",
  "en-prueba": "en prueba",
  aprobada: "aprobada",
  archivada: "archivada",
};

const STATE_COLOR: Record<RecipeState, string> = {
  draft: "text-text-tertiary",
  "en-prueba": "text-accent",
  aprobada: "text-text",
  archivada: "text-text-quaternary",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  state: RecipeState;
  showLabel?: boolean;
};

export function Badge({ state, showLabel = true, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-s-2",
        "font-serif italic text-caption tracking-normal normal-case",
        STATE_COLOR[state],
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{STATE_GLYPH[state]}</span>
      {showLabel && <span>{STATE_LABEL[state]}</span>}
    </span>
  );
}
