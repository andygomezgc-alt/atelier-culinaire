# Fase 2 — Inicio + Asistente Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar Inicio (dashboard) y Asistente (chat) con el design system de Fase 0/1: layout 2 columnas en Inicio, chat sin globos con distinción tipográfica, y card de receta estructurada con botón GUARDAR.

**Architecture:** Las dos páginas se reescriben completamente usando `useTranslations()` de next-intl y clases Tailwind con tokens CSS. La lógica de datos existente (hooks, servicios, API) se reutiliza sin cambios. Se añade parsing de bloques `%%RECIPE_START%%...%%RECIPE_END%%` en el frontend del chat para renderizar `RecipeCard`.

**Tech Stack:** Next.js 14 App Router, next-intl, TanStack React Query, `@tanstack/react-query`, Anthropic SDK (ya configurado), Tailwind CSS, TypeScript.

---

## File Map

| Archivo | Acción |
|---------|--------|
| `messages/es.json` | Reemplazar completo |
| `messages/en.json` | Reemplazar completo |
| `messages/it.json` | Reemplazar completo |
| `messages/fr.json` | Reemplazar completo |
| `src/components/Toast.tsx` | Modificar: reemplazar CSS clases con Tailwind |
| `src/lib/anthropic.ts` | Modificar: añadir instrucción de bloque de receta |
| `src/components/RecipeCard.tsx` | Crear nuevo |
| `src/app/[locale]/(app)/dashboard/page.tsx` | Reescritura completa |
| `src/app/[locale]/(app)/chat/page.tsx` | Reescritura completa |

---

## Task 1: Translations — populate all 4 locale files

**Files:**
- Modify: `messages/es.json`
- Modify: `messages/en.json`
- Modify: `messages/it.json`
- Modify: `messages/fr.json`

Los archivos actuales solo tienen `common.title` / `common.description`. Hay que añadir todas las claves de navegación, Inicio y chat que usan `useTranslations()`.

- [ ] **Step 1: Replace `messages/es.json`**

```json
{
  "common": {
    "title": "Atelier Culinaire",
    "description": "El cuaderno del chef."
  },
  "nav-inicio": "Inicio",
  "nav-asistente": "Asistente",
  "nav-recetas": "Recetas",
  "nav-menus": "Menús",
  "nav-despensa": "Despensa",
  "nav-perfil": "Perfil",
  "nav-casa": "La casa",
  "nav-logout": "Salir",
  "inicio-title": "Inicio",
  "idea-placeholder": "Anotá una idea…",
  "idea-save": "GUARDAR",
  "ideas-recent": "Ideas recientes",
  "ideas-empty": "Todavía no hay ideas.",
  "chat-title": "Asistente",
  "chat-about": "Sobre:",
  "chat-placeholder": "Seguí conversando…",
  "chat-thinking": "pensando…",
  "recipe-save-btn": "GUARDAR COMO RECETA →",
  "recipe-saved-btn": "Guardada ✓",
  "recipe-saved-toast": "Guardada como borrador",
  "recipe-composition": "Composition",
  "recipe-method": "Method"
}
```

- [ ] **Step 2: Replace `messages/en.json`**

```json
{
  "common": {
    "title": "Atelier Culinaire",
    "description": "The chef's notebook."
  },
  "nav-inicio": "Home",
  "nav-asistente": "Assistant",
  "nav-recetas": "Recipes",
  "nav-menus": "Menus",
  "nav-despensa": "Pantry",
  "nav-perfil": "Profile",
  "nav-casa": "The house",
  "nav-logout": "Sign out",
  "inicio-title": "Home",
  "idea-placeholder": "Note an idea…",
  "idea-save": "SAVE",
  "ideas-recent": "Recent ideas",
  "ideas-empty": "No ideas yet.",
  "chat-title": "Assistant",
  "chat-about": "About:",
  "chat-placeholder": "Keep the conversation going…",
  "chat-thinking": "thinking…",
  "recipe-save-btn": "SAVE AS RECIPE →",
  "recipe-saved-btn": "Saved ✓",
  "recipe-saved-toast": "Saved as draft",
  "recipe-composition": "Composition",
  "recipe-method": "Method"
}
```

- [ ] **Step 3: Replace `messages/it.json`**

```json
{
  "common": {
    "title": "Atelier Culinaire",
    "description": "Il quaderno dello chef."
  },
  "nav-inicio": "Inizio",
  "nav-asistente": "Assistente",
  "nav-recetas": "Ricette",
  "nav-menus": "Menù",
  "nav-despensa": "Dispensa",
  "nav-perfil": "Profilo",
  "nav-casa": "La casa",
  "nav-logout": "Esci",
  "inicio-title": "Inizio",
  "idea-placeholder": "Annota un'idea…",
  "idea-save": "SALVA",
  "ideas-recent": "Idee recenti",
  "ideas-empty": "Ancora nessuna idea.",
  "chat-title": "Assistente",
  "chat-about": "Su:",
  "chat-placeholder": "Continua la conversazione…",
  "chat-thinking": "pensando…",
  "recipe-save-btn": "SALVA COME RICETTA →",
  "recipe-saved-btn": "Salvata ✓",
  "recipe-saved-toast": "Salvata come bozza",
  "recipe-composition": "Composition",
  "recipe-method": "Metodo"
}
```

- [ ] **Step 4: Replace `messages/fr.json`**

```json
{
  "common": {
    "title": "Atelier Culinaire",
    "description": "Le carnet du chef."
  },
  "nav-inicio": "Accueil",
  "nav-asistente": "Assistant",
  "nav-recetas": "Recettes",
  "nav-menus": "Menus",
  "nav-despensa": "Garde-manger",
  "nav-perfil": "Profil",
  "nav-casa": "La maison",
  "nav-logout": "Se déconnecter",
  "inicio-title": "Accueil",
  "idea-placeholder": "Notez une idée…",
  "idea-save": "ENREGISTRER",
  "ideas-recent": "Idées récentes",
  "ideas-empty": "Pas encore d'idées.",
  "chat-title": "Assistant",
  "chat-about": "À propos de :",
  "chat-placeholder": "Continuez la conversation…",
  "chat-thinking": "en train de réfléchir…",
  "recipe-save-btn": "ENREGISTRER COMME RECETTE →",
  "recipe-saved-btn": "Enregistrée ✓",
  "recipe-saved-toast": "Enregistrée comme brouillon",
  "recipe-composition": "Composition",
  "recipe-method": "Méthode"
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add messages/
git commit -m "feat(fase2): add i18n keys for nav, inicio and chat"
```

---

## Task 2: Update Toast component to use design tokens

**Files:**
- Modify: `src/components/Toast.tsx`

El Toast actual usa `className="toast-wrap"` y `className="toast"` que son clases CSS legacy. Las reemplazamos con Tailwind. La API (`useToast()`) no cambia.

- [ ] **Step 1: Replace `src/components/Toast.tsx`**

```tsx
"use client";
import { createContext, useCallback, useContext, useState } from "react";

type ToastItem = { id: string; msg: string };
const ToastCtx = createContext<{ push: (m: string) => void }>({ push: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((msg: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((s) => [...s, { id, msg }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-s-6 right-s-6 z-[70] flex flex-col gap-s-2 pointer-events-none">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-invert text-invert-text px-s-5 py-s-3 rounded-sm shadow-sm font-serif italic text-body"
          >
            {item.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx).push;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Toast.tsx
git commit -m "feat(fase2): update Toast to use design tokens"
```

---

## Task 3: Update Anthropic system prompt for structured recipe output

**Files:**
- Modify: `src/lib/anthropic.ts`

Añadir al final del system prompt instrucciones para emitir recetas estructuradas como bloque JSON delimitado por `%%RECIPE_START%%` y `%%RECIPE_END%%`.

- [ ] **Step 1: Replace `src/lib/anthropic.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

export function buildSystemPrompt(opts: {
  langName: string;
  house: { name: string; style: string; season: string; price: string; restrictions: string };
  pantryNames: string[];
  recipeNames: string[];
}) {
  const { langName, house, pantryNames, recipeNames } = opts;
  return `Eres el copiloto culinario de un chef profesional. Conoces íntimamente este restaurante:
- Restaurante: ${house.name}
- Estilo: ${house.style}
- Estacionalidad: ${house.season}
- Rango de precio: ${house.price}
- Restricciones: ${house.restrictions || "—"}
- Ingredientes en despensa: ${pantryNames.slice(0, 30).join(", ") || "—"}
- Recetas ya en banco: ${recipeNames.slice(0, 30).join(", ") || "—"}

Responde en ${langName}. Sé preciso técnicamente: temperaturas exactas, tiempos, ratios de hidrocoloides. Considera la identidad de la casa. Habla como chef, no como manual. Sin emoji.

Cuando el chef pida una receta completa estructurada, devuelve exactamente este formato — el JSON dentro del bloque, texto libre antes o después si lo necesitás:

%%RECIPE_START%%
{
  "title": "Nombre del plato",
  "yield": "4 pax",
  "prepTime": "2h",
  "costPerServing": "38,00 €",
  "composition": "ingrediente 1 cantidad, ingrediente 2 cantidad, …",
  "method": ["Paso 1.", "Paso 2.", "Paso 3."]
}
%%RECIPE_END%%`;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/anthropic.ts
git commit -m "feat(fase2): add structured recipe block to system prompt"
```

---

## Task 4: Create RecipeCard component

**Files:**
- Create: `src/components/RecipeCard.tsx`

Componente que renderiza una receta estructurada con header (título + metadata), sección Composition, sección Method y botón GUARDAR COMO RECETA.

- [ ] **Step 1: Create `src/components/RecipeCard.tsx`**

```tsx
"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

export type RecipeData = {
  title: string;
  yield: string;
  prepTime: string;
  costPerServing: string;
  composition: string;
  method: string[];
};

export function RecipeCard({
  data,
  onSave,
  saved,
}: {
  data: RecipeData;
  onSave: () => void;
  saved: boolean;
}) {
  const t = useTranslations();
  return (
    <div className="border border-border rounded-sm overflow-hidden my-s-4">
      {/* Header */}
      <div className="px-s-6 py-s-4 border-b border-border">
        <p className="font-serif italic text-h3 text-text">{data.title}</p>
        <p className="font-mono text-caption text-text-secondary mt-s-1">
          {data.yield} · {data.prepTime} · {data.costPerServing}
        </p>
      </div>

      {/* Composition */}
      <div className="px-s-6 py-s-4 border-b border-border">
        <p className="font-sans text-caption uppercase tracking-[0.1em] text-text-tertiary mb-s-2">
          {t("recipe-composition")}
        </p>
        <p className="font-sans text-body text-text-secondary">{data.composition}</p>
      </div>

      {/* Method */}
      <div className="px-s-6 py-s-4 border-b border-border">
        <p className="font-sans text-caption uppercase tracking-[0.1em] text-text-tertiary mb-s-2">
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

      {/* Footer */}
      <div className="px-s-6 py-s-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          disabled={saved}
        >
          {saved ? t("recipe-saved-btn") : t("recipe-save-btn")}
        </Button>
      </div>
    </div>
  );
}

const RECIPE_RE = /%%RECIPE_START%%([\s\S]*?)%%RECIPE_END%%/;

export function parseRecipeBlock(content: string): {
  text: string;
  recipe: RecipeData | null;
} {
  const match = content.match(RECIPE_RE);
  if (!match) return { text: content, recipe: null };
  try {
    const recipe = JSON.parse(match[1].trim()) as RecipeData;
    const text = content.replace(RECIPE_RE, "").trim();
    return { text, recipe };
  } catch {
    return { text: content, recipe: null };
  }
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/RecipeCard.tsx
git commit -m "feat(fase2): add RecipeCard component with recipe block parser"
```

---

## Task 5: Rewrite Inicio / dashboard page

**Files:**
- Modify: `src/app/[locale]/(app)/dashboard/page.tsx`

Layout 2 columnas: textarea hero + botón GUARDAR a la izquierda, lista de ideas clickeables a la derecha. Usa `useTranslations()`, `useIdeas()`, `useCreateIdea()`, `useLocale()`.

- [ ] **Step 1: Replace `src/app/[locale]/(app)/dashboard/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useIdeas, useCreateIdea } from "@/hooks";
import { Button, Textarea } from "@/components/ui";
import type { Idea } from "@prisma/client";
import type { Locale } from "@/i18n.config";

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
      {/* Page header */}
      <h2 className="font-sans text-h2 text-text">{t("inicio-title")}</h2>
      <p className="font-mono text-caption text-text-tertiary mt-s-1 mb-s-6">
        {formatDate(locale)}
      </p>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-s-8">
        {/* Left: idea input */}
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

        {/* Right: ideas list */}
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/\(app\)/dashboard/page.tsx
git commit -m "feat(fase2): rewrite Inicio page — 2-column layout, ideas list"
```

---

## Task 6: Rewrite Chat / Asistente page

**Files:**
- Modify: `src/app/[locale]/(app)/chat/page.tsx`

Sin globos. Voces tipográficas: serif italic derecha para usuario, sans izquierda para IA. RecipeCard inline cuando la IA emite bloque estructurado. Input sticky. Precarga de `?idea` param.

- [ ] **Step 1: Replace `src/app/[locale]/(app)/chat/page.tsx`**

```tsx
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

  // Auto-send idea on mount
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
      {/* Header */}
      <div className="px-s-6 py-s-4 border-b border-border shrink-0">
        <h2 className="font-sans text-h2 text-text">{t("chat-title")}</h2>
        {ideaParam && (
          <p className="font-serif italic text-sm text-text-secondary mt-s-1">
            {t("chat-about")} &ldquo;{ideaParam}&rdquo;
          </p>
        )}
      </div>

      {/* Thread */}
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

      {/* Sticky input */}
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/\(app\)/chat/page.tsx
git commit -m "feat(fase2): rewrite Chat page — typographic voices, RecipeCard, sticky input"
```

---

## Task 7: Build verification & GATE 2

**Files:** none

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Expected: server starts on port 3000 without errors.

- [ ] **Step 3: Test Inicio page**

Navegar a `http://localhost:3000/es/`.
Verificar:
- Título "Inicio" visible, fecha debajo en mono gris
- Textarea grande con placeholder italic
- Botón GUARDAR a la derecha debajo del textarea
- Lista "Ideas recientes" a la derecha (puede estar vacía inicialmente)
- Escribir texto en textarea → click GUARDAR → aparece en la lista derecha

- [ ] **Step 4: Test click idea → chat**

En la lista de ideas, click en una idea.
Verificar:
- URL cambia a `/es/chat?idea=<texto>`
- Header del chat muestra "Sobre: «<texto>»"
- La idea se auto-envía como primer mensaje (serif italic derecha)
- La IA responde (sans izquierda)

- [ ] **Step 5: Test typographic voices**

En el chat, enviar un mensaje.
Verificar:
- Mensaje del usuario: italic serif, alineado derecha, max-width 60%
- Respuesta de la IA: sans, alineado izquierda, max-width 75%
- Sin globos de color ni fondos

- [ ] **Step 6: Test RecipeCard**

Pedir al asistente una receta completa: "Dame la receta completa del pichón a la braise con espuma de café, 4 pax"
Verificar:
- La respuesta incluye una `RecipeCard` con secciones Composition y Method
- Botón "GUARDAR COMO RECETA →" visible al pie
- Click en botón → botón cambia a "Guardada ✓" + toast "Guardada como borrador"

- [ ] **Step 7: Test Toast**

Verificar que el toast aparece en la esquina inferior derecha con fondo oscuro e italic serif, y desaparece en 3s.

- [ ] **Step 8: Test mobile (375px)**

Redimensionar ventana.
Verificar:
- Inicio: una sola columna (textarea arriba, ideas debajo)
- Chat: input sticky funciona correctamente

- [ ] **Step 9: Test 4 locales**

Navegar a `/it/`, `/fr/`, `/en/`.
Verificar que nav labels traducen correctamente (Inizio, Accueil, Home, Inicio).

- [ ] **Step 10: Commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(fase2): GATE 2 fixes"
```
