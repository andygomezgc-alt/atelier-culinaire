"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { I18N, type Lang, tFor } from "@/lib/i18n";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LangCtx = createContext<Ctx>({ lang: "es", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  // Load lang from /api/profile (server-side persisted) on mount
  useEffect(() => {
    let alive = true;
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (alive && p?.lang && I18N[p.lang as Lang]) setLangState(p.lang);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang: l }),
    }).catch(() => {});
  }, []);

  const t = useCallback((key: string) => tFor(lang, key), [lang]);

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
