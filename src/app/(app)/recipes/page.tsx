"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { Ico } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { RecipeModal, type Recipe } from "@/components/RecipeModal";

type Filter = "all" | "draft" | "testing" | "approved" | "priority";

export default function RecipesPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const [list, setList] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Recipe | null>(null);
  const [chefName, setChefName] = useState("");

  async function load() {
    const r = await fetch("/api/recipes").then((r) => r.json());
    setList(r);
  }

  useEffect(() => {
    load();
    fetch("/api/profile").then((r) => r.json()).then((p) => p && setChefName(p.name)).catch(() => {});
  }, []);

  const counts = {
    all: list.length,
    draft: list.filter((r) => r.status === "draft").length,
    testing: list.filter((r) => r.status === "testing").length,
    approved: list.filter((r) => r.status === "approved").length,
    priority: list.filter((r) => r.priority).length,
  };

  let filtered = list;
  if (filter === "priority") filtered = list.filter((r) => r.priority);
  else if (filter !== "all") filtered = list.filter((r) => r.status === filter);

  async function togglePriority(r: Recipe) {
    const updated = await fetch(`/api/recipes/${r.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ priority: !r.priority }),
    }).then((x) => x.json());
    setList((l) => l.map((x) => (x.id === r.id ? updated : x)));
  }

  async function advance(r: Recipe) {
    const order: Recipe["status"][] = ["draft", "testing", "approved"];
    const next = order[(order.indexOf(r.status) + 1) % order.length];
    const updated = await fetch(`/api/recipes/${r.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).then((x) => x.json());
    setList((l) => l.map((x) => (x.id === r.id ? updated : x)));
  }

  async function remove(r: Recipe) {
    if (!confirm(t("confirm-delete-recipe"))) return;
    await fetch(`/api/recipes/${r.id}`, { method: "DELETE" });
    setList((l) => l.filter((x) => x.id !== r.id));
    setOpen(null);
    toast(t("toast-recipe-deleted"));
  }

  async function createNew() {
    const name = prompt(t("prompt-recipe-name"), "Nuevo plato");
    if (!name) return;
    const cat = prompt(t("prompt-recipe-cat"), t("category-meats")) || "—";
    const created = await fetch("/api/recipes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, category: cat, summary: "", content: "", status: "draft" }),
    }).then((r) => r.json());
    setList((l) => [created, ...l]);
    toast(t("toast-recipe-saved"));
    setOpen(created);
  }

  return (
    <section className="screen-inner">
      <div className="page-eyebrow">{t("recipes-eyebrow")}</div>
      <h1 className="page-title">{t("recipes-title")}</h1>
      <p className="page-subtitle">{t("recipes-subtitle")}</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <div className="pills">
          {(["all", "draft", "testing", "approved", "priority"] as Filter[]).map((f) => (
            <button key={f} className={`pill${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              <span>{t(`filter-${f}`)}</span> <span className="count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-accent" onClick={createNew}>
          <Ico.plus />
          <span>{t("r-new")}</span>
        </button>
      </div>

      <div className="recipes-grid">
        {filtered.length === 0 ? (
          <div className="idea-empty" style={{ gridColumn: "1/-1" }}>{t("recipe-empty")}</div>
        ) : (
          filtered.map((r) => {
            const stKey = r.status === "draft" ? "st-draft" : r.status === "testing" ? "st-testing" : "st-approved";
            return (
              <article key={r.id} className={`recipe-card${r.priority ? " priority" : ""}`} onClick={() => setOpen(r)}>
                <div className="recipe-card-head">
                  <div className="recipe-card-title">
                    {r.priority && <span className="star">★</span>}
                    {r.name}
                  </div>
                  <span className={`badge-status badge-${r.status}`}>{t(stKey)}</span>
                </div>
                <div className="recipe-card-meta">
                  {r.category} · {formatDate(r.createdAt, lang)}
                  {r.versions.length > 0 ? ` · v${r.versions.length}` : ""}
                </div>
                <div className="recipe-card-summary">{r.summary}</div>
                <div className="recipe-card-foot" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-icon"
                    onClick={() => togglePriority(r)}
                    title={t("r-toggle-priority")}
                    style={r.priority ? { color: "var(--accent)" } : undefined}
                  >
                    {r.priority ? <Ico.star_filled /> : <Ico.star />}
                  </button>
                  <div className="recipe-card-actions">
                    <button className="btn-icon" onClick={() => advance(r)} title={t("r-advance")}>
                      <Ico.arrow />
                    </button>
                    <button className="btn-icon" onClick={() => remove(r)} title={t("r-delete")}>
                      <Ico.trash />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {open && (
        <RecipeModal
          recipe={open}
          currentChef={chefName}
          onClose={() => setOpen(null)}
          onChange={(r) => {
            setOpen(r);
            setList((l) => l.map((x) => (x.id === r.id ? r : x)));
          }}
          onDelete={() => remove(open)}
        />
      )}
    </section>
  );
}
