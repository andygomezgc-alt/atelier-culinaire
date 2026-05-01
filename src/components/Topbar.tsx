"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { RestaurantSwitcher } from "./RestaurantSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import type { Locale } from "@/i18n.config";

export function Topbar({
  restaurantId,
  restaurantName,
  userInitials,
}: {
  restaurantId: string;
  restaurantName: string;
  userInitials: string;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <RestaurantSwitcher current={{ id: restaurantId, name: restaurantName }} />
      </div>

      <div className="topbar-right">
        {/* Cmd-K search button */}
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border text-text-secondary hover:text-text transition-colors text-caption"
          onClick={() => {
            // TODO: Command palette in Fase 2
          }}
        >
          <Search size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">{t("topbar-cmd")}</span>
          <span className="text-micro ml-2 text-text-tertiary">⌘K</span>
        </button>

        {/* Language switcher (mobile only) */}
        <div className="md:hidden">
          <LanguageSwitcher />
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile menu */}
        <Popover>
          <PopoverTrigger className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg hover:bg-surface transition-colors text-sm font-semibold text-invert-text bg-invert">
            {userInitials}
          </PopoverTrigger>
          <PopoverContent className="w-40 py-2">
            <Link
              href={`/${locale}/profile`}
              className="block px-4 py-2 text-body hover:bg-surface transition-colors"
            >
              {t("nav-perfil")}
            </Link>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
