"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { Ico } from "@/components/icons";
import { formatDate, formatLongDate } from "@/lib/utils";

type Idea = { id: string; text: string; createdAt: string };

export default function DashboardPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [draft, setDraft] = useState("");
  const [stats, setStats] = useState({ ideas: 0, drafts: 0, approved: 0, menus: 0 });

  const loadAll = useCallback(async () => {
    const [iRes, rRes, mRes] = await Promise.all([
      fetch("/api/ideas").then((r) => r.json()),
      fetch("/api/recipes").then((r) => r.json()),
      fetch("/api/menus").then((r) => r.json()),
    ]);
    setIdeas(iRes);
    setStats({
      ideas: iRes.length,
      drafts: rRes.filter((r: { status: string }) => r.status !== "approved").length,
      approved: rRes.filter((r: { status: string }) => r.status === "approved").length,
      menus: mRes.length,
    });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? t("greet-morning") : h < 19 ? t("greet-afternoon") : t("greet-evening");
  }, [t]);

  async function saveIdea() {
    const text = draft.trim();
    if (!text) {
      toast(t("toast-empty-idea"));
      return;
    }
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setDraft("");
      toast(t("toast-idea-saved"));
      await loadAll();
    }
  }

  async function deleteIdea(id: string) {
    if (!confirm(t("confirm-delete-idea"))) return;
    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    toast(t("toast-idea-deleted"));
    loadAll();
  }

  function sendToChat(idea: Idea) {
    const prompt = `${t("idea-prompt-prefix")}\n\n"${idea.text}"`;
    sessionStorage.setItem("chat:prefill", prompt);
    router.push("/chat");
  }

  return (
    <section className="screen-inner">
      <div className="page-eyebrow">{formatLongDate(Date.now(), lang).toUpperCase()}</div>
      <h1 className="page-title">{greeting}</h1>
      <p className="page-subtitle">{t("dash-subtitle")}</p>

      <div className="dash-nav-cards">
        <a href="/chat" className="dash-nav-card primary">
          <div className="dash-nav-card-icon">💬</div>
          <div className="dash-nav-card-body">
            <div className="dash-nav-card-title">{t("nav-chat")}</div>
            <div className="dash-nav-card-sub">{t("dash-card-chat-sub")}</div>
          </div>
          <div className="dash-nav-card-badge">IA</div>
        </a>
        <a href="/recipes" className="dash-nav-card">
          <div className="dash-nav-card-icon">📋</div>
          <div className="dash-nav-card-body">
            <div className="dash-nav-card-title">{t("nav-recipes")}</div>
            <div className="dash-nav-card-sub">{stats.approved} {t("stat-approved")} · {stats.drafts} {t("stat-drafts")}</div>
          </div>
        </a>
        <a href="/menus" className="dash-nav-card">
          <div className="dash-nav-card-icon">🍽️</div>
          <div className="dash-nav-card-body">
            <div className="dash-nav-card-title">{t("nav-menus")}</div>
            <div className="dash-nav-card-sub">{stats.menus} {t("stat-menus")}</div>
          </div>
        </a>
        <a href="/pantry" className="dash-nav-card">
          <div className="dash-nav-card-icon">🧺</div>
          <div className="dash-nav-card-body">
            <div className="dash-nav-card-title">{t("nav-pantry")}</div>
            <div className="dash-nav-card-sub">{t("dash-card-pantry-sub")}</div>
          </div>
        </a>
      </div>

      <div className="dash-hero">
        <div>
          <div className="notepad">
            <div className="notepad-label">{t("notepad-label")}</div>
            <textarea
              value={draft}
              placeholder={t("notepad-ph")}
              onChange={(e) => setDraft(e.target.value)}
            />
            <div className="notepad-actions">
              <span className="notepad-hint">{t("notepad-hint")}</span>
              <button className="btn btn-accent" onClick={saveIdea}>
                <Ico.arrow />
                <span>{t("save-idea")}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><div className="v">{stats.ideas}</div><div className="l">{t("stat-ideas")}</div></div>
          <div className="stat"><div className="v">{stats.drafts}</div><div className="l">{t("stat-drafts")}</div></div>
          <div className="stat"><div className="v">{stats.approved}</div><div className="l">{t("stat-approved")}</div></div>
          <div className="stat"><div className="v">{stats.menus}</div><div className="l">{t("stat-menus")}</div></div>
        </div>
      </div>

      <div>
        <h3 className="section-h">{t("ideas-h")}</h3>
        <p className="section-sub">{t("ideas-sub")}</p>
        <div className="ideas-list">
          {ideas.length === 0 ? (
            <div className="idea-empty">{t("idea-empty")}</div>
          ) : (
            ideas.map((i) => (
              <div key={i.id} className="idea">
                <div className="idea-text">{i.text}</div>
                <div className="idea-meta">{formatDate(i.createdAt, lang)}</div>
                <button className="btn-icon" title={t("idea-send")} onClick={() => sendToChat(i)}>
                  <Ico.send />
                </button>
                <button className="btn-icon" title={t("idea-delete")} onClick={() => deleteIdea(i.id)}>
                  <Ico.trash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
