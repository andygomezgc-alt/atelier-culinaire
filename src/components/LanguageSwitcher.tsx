"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing, type Locale } from "@/i18n.config";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ desktop = false }: { desktop?: boolean }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: Locale) => {
    const segmentArray = pathname.split("/").filter(Boolean);
    if (routing.locales.includes(segmentArray[0] as Locale)) {
      segmentArray[0] = newLocale;
    } else {
      segmentArray.unshift(newLocale);
    }
    router.push("/" + segmentArray.join("/"));
  };

  const languages: { code: Locale; label: string }[] = [
    { code: "es", label: t("idioma-es") },
    { code: "it", label: t("idioma-it") },
    { code: "fr", label: t("idioma-fr") },
    { code: "en", label: t("idioma-en") },
  ];

  if (desktop) {
    return (
      <div className="flex gap-2 justify-center text-text-tertiary text-caption">
        {languages.map((lang, idx) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`transition-colors ${locale === lang.code ? "text-text font-semibold" : "hover:text-text-secondary"}`}
          >
            {lang.code.toUpperCase()}
            {idx < languages.length - 1 && <span className="mx-1">·</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 p-2 hover:bg-surface-2 rounded-sm transition-colors">
        <Globe size={18} strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent className="w-40 py-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full text-left px-4 py-2 font-sans text-caption transition-colors ${
              locale === lang.code
                ? "bg-surface-2 text-text font-semibold"
                : "hover:bg-surface text-text-secondary"
            }`}
          >
            {lang.label}
            {locale === lang.code && " ✓"}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
