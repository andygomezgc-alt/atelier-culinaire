"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { Ico } from "@/components/icons";

type PantryCat = "verduras" | "pescados" | "carnes" | "secos" | "lacteos";
type Season = "spring" | "summer" | "autumn" | "winter" | "allyear";
type Item = {
  id: string; name: string; category: PantryCat; cost: number;
  season: Season; supplier: string; stock: string;
};

const CATS: PantryCat[] = ["verduras", "pescados", "carnes", "secos", "lacteos"];
const SEASONS: Season[] = ["allyear", "spring", "summer", "autumn", "winter"];

export default function PantryPage() {
  const { t } = useLang();
  const [list, setList] = useState<Item[]>([]);
  const [filter, setFilter] = useState<PantryCat | "all">("all");

  async function load() {
    const l = await fetch("/api/pantry").then((r) => r.json());
    setList(l);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const it = await fetch("/api/pantry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Nuovo ingrediente", category: "verduras", cost: 0, season: "allyear" }),
    }).then((r) => r.json());
    setList((l) => [it, ...l]);
  }

  async function patch(id: string, field: keyof Item, value: string | number) {
    setList((l) => l.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
    await fetch(`/api/pantry/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function remove(id: string) {
    setList((l) => l.filter((x) => x.id !== id));
    await fetch(`/api/pantry/${id}`, { method: "DELETE" });
  }

  const filtered = filter === "all" ? list : list.filter((x) => x.category === filter);

  return (
    <section className="screen-inner">
      <div className="page-eyebrow">{t("pantry-eyebrow")}</div>
      <h1 className="page-title">{t("pantry-title")}</h1>
      <p className="page-subtitle">{t("pantry-subtitle")}</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div className="pills" style={{ margin: 0 }}>
          <button className={`pill${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            <span>{t("pf-all")}</span>
          </button>
          {CATS.map((c) => (
            <button key={c} className={`pill${filter === c ? " active" : ""}`} onClick={() => setFilter(c)}>
              <span>{t(`pf-${c}`)}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-accent" onClick={add}>
          <Ico.plus />
          <span>{t("pantry-add")}</span>
        </button>
      </div>

      <table className="pantry-table">
        <thead>
          <tr>
            <th>{t("th-name")}</th>
            <th>{t("th-cat")}</th>
            <th>{t("th-cost")}</th>
            <th>{t("th-season")}</th>
            <th>{t("th-supplier")}</th>
            <th>{t("th-stock")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, fontStyle: "italic", color: "var(--ink-mute)", fontFamily: "var(--f-serif)" }}>—</td></tr>
          ) : filtered.map((p) => (
            <tr key={p.id}>
              <td><input className="ing-name-input" value={p.name} onChange={(e) => patch(p.id, "name", e.target.value)} /></td>
              <td>
                <select value={p.category} onChange={(e) => patch(p.id, "category", e.target.value)}>
                  {CATS.map((c) => <option key={c} value={c}>{t(`pf-${c}`)}</option>)}
                </select>
              </td>
              <td><input type="number" step="0.5" style={{ width: 80 }} value={p.cost} onChange={(e) => patch(p.id, "cost", parseFloat(e.target.value) || 0)} /></td>
              <td>
                <select value={p.season} onChange={(e) => patch(p.id, "season", e.target.value)}>
                  {SEASONS.map((s) => <option key={s} value={s}>{t(`season-${s}`)}</option>)}
                </select>
              </td>
              <td><input value={p.supplier || ""} onChange={(e) => patch(p.id, "supplier", e.target.value)} /></td>
              <td><input style={{ width: 100 }} value={p.stock || ""} onChange={(e) => patch(p.id, "stock", e.target.value)} /></td>
              <td>
                <button className="btn-icon" onClick={() => remove(p.id)}>
                  <Ico.trash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
