"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/cn";
import type { Locale } from "@/i18n.config";

const NAV_ITEMS = [
  { href: "/", key: "nav-inicio", slug: "dashboard" },
  { href: "/chat", key: "nav-asistente", slug: "chat" },
  { href: "/recipes", key: "nav-recetas", slug: "recipes" },
  { href: "/menus", key: "nav-menus", slug: "menus" },
  { href: "/pantry", key: "nav-despensa", slug: "pantry" },
];

const DESKTOP_ONLY_ITEMS = [
  { href: "/profile", key: "nav-perfil", slug: "profile" },
  { href: "/casa", key: "nav-casa", slug: "casa" },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const pathSlug = pathname.split("/").filter(Boolean)[1];
  const allItems = [...NAV_ITEMS, ...DESKTOP_ONLY_ITEMS];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[200px] flex-col bg-surface border-r border-border z-[30]">
      {/* Brand */}
      <div className="px-s-5 py-s-5 border-b border-border">
        <span className="font-serif italic text-h4 text-text">Atelier Culinaire</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-s-3">
        {allItems.map((item) => {
          const isActive =
            (item.slug === "dashboard" && pathSlug === undefined) ||
            pathSlug === item.slug;
          const isDesktopOnly = DESKTOP_ONLY_ITEMS.some((d) => d.slug === item.slug);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href === "/" ? "" : item.href}`}
              className={cn(
                "flex items-center px-s-5 py-s-3 text-caption font-medium uppercase tracking-[0.1em] transition-colors duration-[120ms]",
                isActive
                  ? "text-text bg-surface-2"
                  : "text-text-tertiary hover:text-text-secondary",
                isDesktopOnly && "hidden md:flex"
              )}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-s-5 border-t border-border space-y-s-3">
        <LanguageSwitcher desktop />
        <button
          type="button"
          className="w-full text-left text-caption font-medium uppercase tracking-[0.1em] text-text-tertiary hover:text-text transition-colors duration-[120ms]"
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
        >
          {t("nav-logout")}
        </button>
      </div>
    </aside>
  );
}
