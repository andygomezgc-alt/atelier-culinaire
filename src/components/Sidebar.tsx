"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
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

  // Extract slug from pathname (/[locale]/[slug]/...)
  const pathSlug = pathname.split("/").filter(Boolean)[1];

  const allItems = [...NAV_ITEMS, ...DESKTOP_ONLY_ITEMS];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Atelier Culinaire</div>

      <nav className="sidebar-nav">
        {allItems.map((item) => {
          const isActive =
            (item.slug === "dashboard" && pathSlug === undefined) ||
            pathSlug === item.slug;

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href === "/" ? "" : item.href}`}
              className={`sidebar-nav-item ${isActive ? "active" : ""} ${
                NAV_ITEMS.some((n) => n.slug === item.slug) ? "" : "hidden md:flex"
              }`}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <LanguageSwitcher desktop />

        <button
          type="button"
          className="sidebar-logout"
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
        >
          {t("nav-logout")}
        </button>
      </div>
    </aside>
  );
}
