"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { Ico } from "./icons";
import type { Lang } from "@/lib/i18n";

type Profile = {
  id: string;
  name: string;
  role: string;
  initials: string;
  photoUrl?: string | null;
  lang: string;
};

type Restaurant = { name: string };

const NAV = [
  { href: "/dashboard", key: "nav-home", icon: Ico.home, slug: "dashboard" },
  { href: "/chat", key: "nav-chat", icon: Ico.chat, slug: "chat" },
  { href: "/recipes", key: "nav-recipes", icon: Ico.recipes, slug: "recipes" },
  { href: "/menus", key: "nav-menus", icon: Ico.menus, slug: "menus" },
  { href: "/pantry", key: "nav-pantry", icon: Ico.pantry, slug: "pantry" },
  { href: "/casa", key: "nav-casa", icon: Ico.casa, slug: "casa" },
  { href: "/profile", key: "nav-profile", icon: Ico.user, slug: "profile" },
];

export function AppShell({ user, children }: { user: Profile; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const [profile, setProfile] = useState<Profile>(user);
  const [restaurant, setRestaurant] = useState<Restaurant>({ name: "Ristorante Marche" });

  useEffect(() => {
    fetch("/api/profile").then((r) => r.ok && r.json()).then((p) => p && setProfile(p)).catch(() => {});
    fetch("/api/restaurant").then((r) => r.ok && r.json()).then((r) => r && setRestaurant(r)).catch(() => {});
    // listen for global updates
    const onPU = (e: Event) => setProfile((p) => ({ ...p, ...(e as CustomEvent).detail }));
    const onRU = (e: Event) => setRestaurant((r) => ({ ...r, ...(e as CustomEvent).detail }));
    window.addEventListener("profile:updated", onPU);
    window.addEventListener("restaurant:updated", onRU);
    return () => {
      window.removeEventListener("profile:updated", onPU);
      window.removeEventListener("restaurant:updated", onRU);
    };
  }, []);

  const isChat = path?.startsWith("/chat");

  return (
    <div id="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">A</div>
          <div className="restaurant">{restaurant.name || "Atelier Culinaire"}</div>
        </div>

        <button className="chef-card" onClick={() => router.push("/profile")}>
          <div className="avatar">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="" />
            ) : (
              profile.initials || "CH"
            )}
          </div>
          <div className="meta">
            <div className="name">{profile.name}</div>
            <div className="role">{t("role-chef-exec")}</div>
          </div>
          <div className="badge">{t("badge-admin")}</div>
        </button>

        <nav className="nav">
          {NAV.map((it) => {
            const Icon = it.icon;
            const active = path === it.href || path?.startsWith(it.href + "/");
            return (
              <Link key={it.href} href={it.href} className={`nav-item${active ? " active" : ""}`}>
                <Icon />
                <span>{t(it.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="lang-switch">
          {(["es", "it", "en"] as Lang[]).map((l) => (
            <button key={l} className={lang === l ? "active" : ""} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
          {t("logout")}
        </button>
      </aside>

      <main className="main" style={isChat ? { overflow: "hidden" } : undefined}>
        {children}
      </main>
    </div>
  );
}
