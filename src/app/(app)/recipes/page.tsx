"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { Ico } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { RecipeModal, type Recipe } from "@/components/RecipeModal";
import { useRecipes, useUpdateRecipe, useDeleteRecipe, useCreateRecipe, useProfile } from "@/hooks";
import type { RecipeWithRelations } from "@/services/recipes";

type Filter = "all" | "draft" | "testing" | "approved" | "priority";

export default function RecipesPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const { data: list = [] } = useRecipes();
  const { data: profile } = useProfile();
  const updateMutation = useUpdateRecipe();
  const deleteMutation = useDeleteRecipe();
  const createMutation = useCreateRecipe();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Recipe | null>(null);
  const chefName = profile?.name ?? "";

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

  async function togglePriority(r: RecipeWithRelations) {
    updateMutation.mutate({ id: r.id, data: { priority: !r.priority } });
  }

  async function advance(r: RecipeWithRelations) {
    const order = ["draft", "testing", "approved"] as const;
    const next = order[(order.indexOf(r.status as "draft" | "testing" | "approved") + 1) % order.length];
    updateMutation.mutate({ id: r.id, data: { status: next } });
  }

  async function remove(r: RecipeWithRelations) {
    if (!confirm(t("confirm-delete-recipe"))) return;
    deleteMutation.mutate(r.id);
    setOpen(null);
    toast(t("toast-recipe-deleted"));
  }

  async function createNew() {
    const name = prompt(t("prompt-recipe-name"), "Nuevo plato");
    if (!name) return;
    const cat = prompt(t("prompt-recipe-cat"), t("category-meats")) || "—";
    createMutation.mutate({ name, category: cat, summary: "", content: "", status: "draft", priority: false, ingredients: "", technique: "" });
    toast(t("toast-recipe-saved"));
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
              <article key={r.id} className={`recipe-card${r.priority ? " priority" : ""}`} onClick={() => setOpen(r as unknown as Recipe)}>
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
          }}
          onDelete={() => remove(open as unknown as RecipeWithRelations)}
        />
      )}
    </section>
  );
}
