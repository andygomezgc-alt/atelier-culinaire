"use client";
import { useState } from "react";
import { useLang } from "./LangProvider";
import {
  useIngredients,
  useCreateIngredient,
  useRecipeIngredients,
  useAddRecipeIngredient,
  useUpdateRecipeIngredient,
  useRemoveRecipeIngredient,
} from "@/hooks/useIngredients";

const ALLERGENS = [
  ["hasGluten", "Gluten"],
  ["hasCrustaceans", "Crustáceos"],
  ["hasEggs", "Huevos"],
  ["hasFish", "Pescado"],
  ["hasPeanuts", "Cacahuetes"],
  ["hasSoy", "Soja"],
  ["hasMilk", "Lácteos"],
  ["hasNuts", "Frutos secos"],
  ["hasCelery", "Apio"],
  ["hasMustard", "Mostaza"],
  ["hasSesame", "Sésamo"],
  ["hasSulphites", "Sulfitos"],
  ["hasLupin", "Altramuces"],
  ["hasMolluscs", "Moluscos"],
] as const;

const CATEGORIES = ["verduras", "pescados", "carnes", "secos", "lacteos", "otros"];
const UNITS = ["kg", "g", "l", "ml", "unit"];

type AllergenKey = typeof ALLERGENS[number][0]
type NewIngredientState = { name: string; category: string; unit: string } & Record<AllergenKey, boolean>

const INITIAL_FORM: NewIngredientState = {
  name: "", category: "otros", unit: "kg",
  hasGluten: false, hasCrustaceans: false, hasEggs: false, hasFish: false,
  hasPeanuts: false, hasSoy: false, hasMilk: false, hasNuts: false,
  hasCelery: false, hasMustard: false, hasSesame: false, hasSulphites: false,
  hasLupin: false, hasMolluscs: false,
}

function NewIngredientForm({
  onSave,
  onCancel,
}: {
  onSave: (id: string) => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  const createIngredient = useCreateIngredient();
  const [form, setForm] = useState<NewIngredientState>(INITIAL_FORM);

  async function handleSave() {
    if (!form.name.trim()) return;
    const result = await createIngredient.mutateAsync(form as Record<string, unknown>);
    onSave(result.id);
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <input
          className="input"
          placeholder={t("costing-ingredient")}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ flex: 1, minWidth: 120 }}
        />
        <select
          className="select"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="select"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px", marginBottom: 8 }}>
        {ALLERGENS.map(([key, label]) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={createIngredient.isPending}>
          {t("ingredient-add")}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>✕</button>
      </div>
    </div>
  );
}

export function IngredientPicker({ recipeId }: { recipeId: string }) {
  const { t } = useLang();
  const { data: ingredients = [] } = useIngredients();
  const { data: recipeIngredients = [] } = useRecipeIngredients(recipeId);
  const addRI = useAddRecipeIngredient();
  const updateRI = useUpdateRecipeIngredient();
  const removeRI = useRemoveRecipeIngredient();

  const [selectedId, setSelectedId] = useState("");
  const [addQty, setAddQty] = useState("");
  const [addUnit, setAddUnit] = useState("kg");
  const [showNewForm, setShowNewForm] = useState(false);

  // Inline edit state per row
  const [editVals, setEditVals] = useState<Record<string, { quantity: string; unit: string }>>({});

  function getEdit(ri: { id: string; quantity: number; unit: string }) {
    return editVals[ri.id] ?? { quantity: String(ri.quantity), unit: ri.unit };
  }

  function setEdit(id: string, patch: Partial<{ quantity: string; unit: string }>) {
    setEditVals((prev) => ({ ...prev, [id]: { ...getEditById(id), ...patch } }));
  }

  function getEditById(id: string) {
    const ri = recipeIngredients.find((r) => r.id === id);
    return editVals[id] ?? { quantity: String(ri?.quantity ?? 0), unit: ri?.unit ?? "kg" };
  }

  function saveRow(ri: { id: string; quantity: number; unit: string }) {
    const vals = getEdit(ri);
    const qty = parseFloat(vals.quantity);
    if (isNaN(qty)) return;
    if (qty === ri.quantity && vals.unit === ri.unit) return;
    updateRI.mutate({ recipeId, riId: ri.id, data: { quantity: qty, unit: vals.unit } });
  }

  async function handleAdd() {
    if (!selectedId) return;
    const qty = parseFloat(addQty);
    if (isNaN(qty) || qty <= 0) return;
    await addRI.mutateAsync({ recipeId, data: { ingredientId: selectedId, quantity: qty, unit: addUnit } });
    setSelectedId("");
    setAddQty("");
    setAddUnit("kg");
  }

  function handleNewSave(newId: string) {
    setShowNewForm(false);
    setSelectedId(newId);
  }

  return (
    <div className="recipe-ingredients">
      <div className="versions-h">{t("costing-ingredient")}s</div>

      <table className="ingredients-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
        <thead>
          <tr style={{ fontSize: 12, color: "var(--ink-mute)", textAlign: "left" }}>
            <th style={{ paddingBottom: 4 }}>Name</th>
            <th style={{ paddingBottom: 4 }}>{t("costing-quantity")}</th>
            <th style={{ paddingBottom: 4 }}>{t("costing-unit")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {recipeIngredients.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ color: "var(--ink-mute)", fontStyle: "italic", fontSize: 13, padding: "6px 0" }}>
                {t("ingredient-none")}
              </td>
            </tr>
          ) : (
            recipeIngredients.map((ri) => {
              const ev = getEdit(ri);
              return (
                <tr key={ri.id}>
                  <td style={{ paddingRight: 8, paddingBottom: 4 }}>{ri.ingredient.name}</td>
                  <td style={{ paddingRight: 4, paddingBottom: 4 }}>
                    <input
                      type="number"
                      value={ev.quantity}
                      onChange={(e) => setEdit(ri.id, { quantity: e.target.value })}
                      onBlur={() => saveRow(ri)}
                      className="input"
                      style={{ width: 70 }}
                    />
                  </td>
                  <td style={{ paddingRight: 4, paddingBottom: 4 }}>
                    <input
                      value={ev.unit}
                      onChange={(e) => setEdit(ri.id, { unit: e.target.value })}
                      onBlur={() => saveRow(ri)}
                      className="input"
                      style={{ width: 60 }}
                    />
                  </td>
                  <td style={{ paddingBottom: 4 }}>
                    <button
                      className="btn-icon"
                      onClick={() => removeRI.mutate({ recipeId, riId: ri.id })}
                      title="—"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="add-ingredient-row" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <select
          className="select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ flex: 1, minWidth: 140 }}
        >
          <option value="">— {t("ingredient-search-ph")} —</option>
          {ingredients.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder={t("costing-quantity")}
          value={addQty}
          onChange={(e) => setAddQty(e.target.value)}
          className="input"
          style={{ width: 80 }}
        />
        <input
          placeholder={t("costing-unit")}
          value={addUnit}
          onChange={(e) => setAddUnit(e.target.value)}
          className="input"
          style={{ width: 60 }}
        />
        <button
          className="btn btn-accent btn-sm"
          onClick={handleAdd}
          disabled={!selectedId || addRI.isPending}
        >
          {t("ingredient-add")}
        </button>
      </div>

      {showNewForm ? (
        <NewIngredientForm onSave={handleNewSave} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button className="btn btn-ghost btn-sm" onClick={() => setShowNewForm(true)}>
          + {t("ingredient-new")}
        </button>
      )}
    </div>
  );
}
