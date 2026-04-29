"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { Ico } from "@/components/icons";
import { formatDate, formatLongDate, shortText, escapeHtml } from "@/lib/utils";

type Dish = { id: string; recipeId: string | null; name: string; price: number; order: number };
type Cat = { id: string; name: string; order: number; dishes: Dish[] };
type Menu = { id: string; name: string; template: "elegante" | "moderna" | "rustica"; createdAt: string; categories: Cat[] };
type RecipeLite = { id: string; name: string; status: string; summary: string; content: string; category: string };

export default function MenusPage() {
  const { t, lang } = useLang();
  const toast = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeLite[]>([]);
  const [houseName, setHouseName] = useState("Ristorante Marche");
  const dragging = useRef<{ catId: string; dishId: string } | null>(null);

  async function loadMenus() {
    const list = await fetch("/api/menus").then((r) => r.json());
    setMenus(list);
    if (!activeId && list[0]) setActiveId(list[0].id);
  }

  useEffect(() => {
    loadMenus();
    fetch("/api/recipes").then((r) => r.json()).then(setRecipes).catch(() => {});
    fetch("/api/restaurant").then((r) => r.json()).then((r) => r && setHouseName(r.name)).catch(() => {});
  }, []);

  const active = menus.find((m) => m.id === activeId);

  async function newMenu() {
    const name = prompt(t("prompt-menu-name"), "Menú Otoño 2026");
    if (!name) return;
    const m = await fetch("/api/menus", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        categories: [
          { name: t("category-cold") }, { name: t("category-hot") },
          { name: t("category-pasta") }, { name: t("category-fish") },
          { name: t("category-meats") }, { name: t("category-dessert") },
        ],
      }),
    }).then((r) => r.json());
    setMenus((l) => [m, ...l]);
    setActiveId(m.id);
    toast(t("toast-menu-created"));
  }

  async function deleteMenu() {
    if (!active) return;
    if (!confirm(t("confirm-delete-menu"))) return;
    await fetch(`/api/menus/${active.id}`, { method: "DELETE" });
    const left = menus.filter((m) => m.id !== active.id);
    setMenus(left);
    setActiveId(left[0]?.id || null);
  }

  async function patchMenu(patch: Partial<Pick<Menu, "name" | "template">>) {
    if (!active) return;
    setMenus((l) => l.map((m) => (m.id === active.id ? { ...m, ...patch } : m)));
    await fetch(`/api/menus/${active.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function addCategory() {
    if (!active) return;
    const name = prompt(t("prompt-cat-name"), t("category-meats"));
    if (!name) return;
    const c = await fetch(`/api/menus/${active.id}/categories`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => r.json());
    setMenus((l) => l.map((m) => (m.id === active.id ? { ...m, categories: [...m.categories, { ...c, dishes: [] }] } : m)));
  }

  async function patchCategory(catId: string, patch: { name?: string; order?: number }) {
    if (!active) return;
    setMenus((l) =>
      l.map((m) => m.id === active.id ? { ...m, categories: m.categories.map((c) => c.id === catId ? { ...c, ...patch } : c) } : m)
    );
    await fetch(`/api/menus/${active.id}/categories/${catId}`, {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(patch),
    });
  }

  async function deleteCategory(catId: string) {
    if (!active) return;
    await fetch(`/api/menus/${active.id}/categories/${catId}`, { method: "DELETE" });
    setMenus((l) => l.map((m) => m.id === active.id ? { ...m, categories: m.categories.filter((c) => c.id !== catId) } : m));
  }

  async function addDish(catId: string, recipeId: string) {
    if (!active) return;
    const r = recipes.find((x) => x.id === recipeId);
    if (!r) {
      toast(t("no-approved-recipes"));
      return;
    }
    const d = await fetch(`/api/menus/${active.id}/categories/${catId}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ recipeId: r.id, name: r.name, price: 0 }),
    }).then((x) => x.json());
    setMenus((l) =>
      l.map((m) => m.id === active.id ? { ...m, categories: m.categories.map((c) => c.id === catId ? { ...c, dishes: [...c.dishes, d] } : c) } : m)
    );
  }

  async function patchDish(dishId: string, patch: { name?: string; price?: number; order?: number; categoryId?: string }) {
    if (!active) return;
    setMenus((l) =>
      l.map((m) => m.id === active.id ? {
        ...m, categories: m.categories.map((c) => ({ ...c, dishes: c.dishes.map((d) => d.id === dishId ? { ...d, ...patch } : d) })),
      } : m)
    );
    await fetch(`/api/menus/${active.id}/dishes/${dishId}`, {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(patch),
    });
  }

  async function deleteDish(catId: string, dishId: string) {
    if (!active) return;
    await fetch(`/api/menus/${active.id}/dishes/${dishId}`, { method: "DELETE" });
    setMenus((l) =>
      l.map((m) => m.id === active.id ? {
        ...m, categories: m.categories.map((c) => c.id === catId ? { ...c, dishes: c.dishes.filter((d) => d.id !== dishId) } : c),
      } : m)
    );
  }

  function onDragStart(catId: string, dishId: string) {
    dragging.current = { catId, dishId };
  }

  async function onDrop(catId: string, targetDishId: string) {
    if (!dragging.current || !active) return;
    if (dragging.current.catId !== catId) { dragging.current = null; return; }
    const c = active.categories.find((x) => x.id === catId)!;
    const fromIdx = c.dishes.findIndex((d) => d.id === dragging.current!.dishId);
    const toIdx = c.dishes.findIndex((d) => d.id === targetDishId);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) { dragging.current = null; return; }
    const newDishes = [...c.dishes];
    const [moved] = newDishes.splice(fromIdx, 1);
    newDishes.splice(toIdx, 0, moved);
    setMenus((l) => l.map((m) => m.id === active.id ? {
      ...m, categories: m.categories.map((cc) => cc.id === catId ? { ...cc, dishes: newDishes } : cc),
    } : m));
    // Persist new order
    await Promise.all(newDishes.map((d, i) =>
      fetch(`/api/menus/${active.id}/dishes/${d.id}`, {
        method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ order: i }),
      })
    ));
    dragging.current = null;
  }

  function exportMenu(mode: "client" | "kitchen") {
    if (!active) return;
    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;
    const isKitchen = mode === "kitchen";
    const css = `
      @page { size: A4; margin: 24mm 18mm; }
      body{ font-family: Georgia, serif; color: #2a2520; background: #fffaf2; padding: 0; margin: 0; }
      .wrap{ max-width: 720px; margin: 0 auto; padding: 24px; }
      h1{ font-family: Georgia, serif; font-weight: 400; text-align: center; font-size: 38px; margin: 0 0 4px; letter-spacing: .02em; }
      .sub{ text-align: center; font-style: italic; color: #8b7a6f; margin: 0 0 36px; font-size: 14px; letter-spacing: .04em; }
      .cat-h{ text-align: center; font-family: sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: .22em; color: #8b7a6f; margin: 32px 0 16px; }
      .cat-h::before, .cat-h::after{ content: ""; height: 1px; background: #d4c9b4; width: 28%; display: inline-block; vertical-align: middle; margin: 0 12px; }
      .dish{ text-align: center; margin: 14px 0; page-break-inside: avoid; }
      .dish .n{ font-family: Georgia, serif; font-size: 16px; margin-bottom: 2px; }
      .dish .d{ font-style: italic; font-size: 13px; color: #8b7a6f; max-width: 480px; margin: 0 auto 4px; line-height: 1.4; }
      .dish .p{ font-family: serif; font-size: 13px; color: #c47e4f; }
      .kitchen .dish{ text-align: left; padding: 12px 0; border-bottom: 1px dashed #d4c9b4; }
      .kitchen .dish .n{ font-family: sans-serif; font-weight: 600; font-size: 14px; margin-bottom: 6px; display: flex; justify-content: space-between; }
      .kitchen .dish .n .p{ color: #c47e4f; }
      .kitchen .dish .meta{ font-family: sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: .14em; color: #8b7a6f; margin-bottom: 6px; }
      .kitchen .dish .body{ font-family: serif; font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
      .footer{ margin-top: 40px; text-align: center; font-style: italic; font-size: 11px; color: #8b7a6f; }
    `;
    const renderClient = active.categories.map((c) => `
      <div class="cat-h">${escapeHtml(c.name)}</div>
      ${c.dishes.map((d) => {
        const r = d.recipeId ? recipes.find((x) => x.id === d.recipeId) : null;
        const desc = r?.summary || "";
        return `<div class="dish">
          <div class="n">${escapeHtml(d.name)}</div>
          ${desc ? `<div class="d">${escapeHtml(shortText(desc, 140))}</div>` : ""}
          <div class="p">${d.price ? d.price + " €" : ""}</div>
        </div>`;
      }).join("")}
    `).join("");
    const renderKitchen = active.categories.map((c) => `
      <div class="cat-h">${escapeHtml(c.name)}</div>
      ${c.dishes.map((d) => {
        const r = d.recipeId ? recipes.find((x) => x.id === d.recipeId) : null;
        const meta = r ? `${escapeHtml(r.category)} · ${r.status}` : "—";
        const cnt = r ? (r.content || r.summary || "") : "";
        return `<div class="dish">
          <div class="n"><span>${escapeHtml(d.name)}</span><span class="p">${d.price ? d.price + " €" : ""}</span></div>
          <div class="meta">${meta}</div>
          <div class="body">${escapeHtml(cnt)}</div>
        </div>`;
      }).join("")}
    `).join("");
    const body = isKitchen
      ? `<div class="wrap kitchen"><h1>${escapeHtml(active.name)} — Cucina</h1><div class="sub">Versione cucina · escandallo, alérgenos, técnica</div>${renderKitchen}<div class="footer">${formatLongDate(Date.now(), lang)}</div></div>`
      : `<div class="wrap"><h1>${escapeHtml(active.name)}</h1><div class="sub">${escapeHtml(houseName)}</div>${renderClient}<div class="footer">${formatLongDate(Date.now(), lang)}</div></div>`;

    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(active.name)} — ${isKitchen ? "Cocina" : "Cliente"}</title><style>${css}</style></head><body>${body}<script>setTimeout(()=>window.print(),600);<\/script></body></html>`);
    w.document.close();
  }

  return (
    <section className="screen-inner">
      <div className="page-eyebrow">{t("menus-eyebrow")}</div>
      <h1 className="page-title">{t("menus-title")}</h1>
      <p className="page-subtitle">{t("menus-subtitle")}</p>

      <div className="menu-layout">
        <div className="menu-list-pane">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="group-h" style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".22em", color: "var(--ink-mute)" }}>
              {t("menus-list-h")}
            </div>
            <button className="btn-icon" onClick={newMenu} title="—">
              <Ico.plus />
            </button>
          </div>
          {menus.length === 0 ? (
            <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", color: "var(--ink-mute)", fontSize: 13, padding: 8 }}>
              {t("menu-empty")}
            </div>
          ) : (
            menus.map((m) => {
              const dishCount = m.categories.reduce((s, c) => s + c.dishes.length, 0);
              return (
                <button key={m.id} className={`menu-list-item${m.id === activeId ? " active" : ""}`} onClick={() => setActiveId(m.id)}>
                  <div className="n">{m.name}</div>
                  <div className="m">{dishCount} · {formatDate(m.createdAt, lang)}</div>
                </button>
              );
            })
          )}
        </div>

        <div className="menu-editor">
          {!active ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--ink-mute)", fontFamily: "var(--f-serif)", fontStyle: "italic" }}>
              {t("menu-no-active")}
            </div>
          ) : (
            <>
              <div className="menu-editor-head">
                <input
                  className="menu-name-input"
                  value={active.name}
                  onChange={(e) => patchMenu({ name: e.target.value })}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".22em", color: "var(--ink-mute)" }}>
                    {t("menu-template")}
                  </span>
                  <div className="template-switch">
                    {(["elegante", "moderna", "rustica"] as const).map((tpl) => (
                      <button key={tpl} className={active.template === tpl ? "active" : ""} onClick={() => patchMenu({ template: tpl })}>
                        {t(`tpl-${tpl}`)}
                      </button>
                    ))}
                  </div>
                  <button className="btn-icon" onClick={deleteMenu} title={t("menu-delete")}>
                    <Ico.trash />
                  </button>
                </div>
              </div>

              <div className="menu-cats">
                {active.categories.map((c) => (
                  <div key={c.id} className="menu-cat">
                    <div className="menu-cat-head">
                      <input
                        className="menu-cat-name"
                        value={c.name}
                        onChange={(e) => patchCategory(c.id, { name: e.target.value })}
                      />
                      <button className="btn-icon" onClick={() => deleteCategory(c.id)} title="—">
                        <Ico.minus />
                      </button>
                    </div>
                    <div className="menu-dishes">
                      {c.dishes.map((d) => (
                        <div
                          key={d.id}
                          className="menu-dish"
                          draggable
                          onDragStart={() => onDragStart(c.id, d.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => onDrop(c.id, d.id)}
                        >
                          <div className="grip">⋮⋮</div>
                          <input
                            className="name"
                            style={{ background: "transparent", border: "1px solid transparent", padding: "2px 4px", borderRadius: 3 }}
                            value={d.name}
                            onChange={(e) => patchDish(d.id, { name: e.target.value })}
                          />
                          <input
                            className="price"
                            type="number"
                            step="0.5"
                            min="0"
                            value={d.price || ""}
                            onChange={(e) => patchDish(d.id, { price: parseFloat(e.target.value) || 0 })}
                          />
                          <button className="btn-icon" onClick={() => deleteDish(c.id, d.id)}>
                            <Ico.close />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="add-dish-row">
                      <select
                        className="select"
                        style={{ flex: 1 }}
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) {
                            addDish(c.id, v);
                            e.target.value = "";
                          }
                        }}
                      >
                        <option value="">— {t("add-from-bank")} —</option>
                        {recipes
                          .filter((r) => r.status === "approved")
                          .map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={addCategory}>
                <Ico.plus />
                {t("add-category")}
              </button>

              <div className={`menu-preview ${active.template}`}>
                <div className="preview-h">{active.name}</div>
                <div className="preview-sub">{houseName}</div>
                {active.categories.map((c) => (
                  <div key={c.id} className="preview-cat">
                    <div className="preview-cat-h">{c.name}</div>
                    {c.dishes.map((d) => {
                      const r = d.recipeId ? recipes.find((x) => x.id === d.recipeId) : null;
                      const desc = r?.summary || "";
                      return (
                        <div key={d.id} className="preview-dish">
                          <div className="pn">{d.name}</div>
                          {desc && <div className="pd">{shortText(desc, 120)}</div>}
                          <div className="pp">{d.price ? `${d.price} ${t("price-symbol")}` : ""}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button className="btn btn-ghost" onClick={() => exportMenu("kitchen")}>
                  <Ico.download />
                  {t("export-kitchen")}
                </button>
                <button className="btn btn-primary" onClick={() => exportMenu("client")}>
                  <Ico.download />
                  {t("export-client")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
