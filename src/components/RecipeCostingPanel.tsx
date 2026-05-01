"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLang } from "./LangProvider";
import { calculateCost, aggregateAllergens, allergenList } from "@/lib/costing";

type CostingData = {
  recipeId: string;
  yieldPortions: number | null;
  yieldGrams: number | null;
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
    baseUnit: string;
    costPerUnit: number;
    allergens: {
      hasGluten: boolean; hasCrustaceans: boolean; hasEggs: boolean; hasFish: boolean;
      hasPeanuts: boolean; hasSoy: boolean; hasMilk: boolean; hasNuts: boolean;
      hasCelery: boolean; hasMustard: boolean; hasSesame: boolean; hasSulphites: boolean;
      hasLupin: boolean; hasMolluscs: boolean;
    };
  }>;
};

export function RecipeCostingPanel({ recipeId }: { recipeId: string }) {
  const { t } = useLang();
  const qc = useQueryClient();
  const [yieldPortions, setYieldPortions] = useState<number | null>(null);
  const [yieldGrams, setYieldGrams] = useState<number | null>(null);

  const { data, isLoading } = useQuery<CostingData>({
    queryKey: ["costing", recipeId],
    queryFn: () => fetch(`/api/recipes/${recipeId}/costing`).then((r) => r.json()),
  });

  useEffect(() => {
    if (data) {
      setYieldPortions(data.yieldPortions);
      setYieldGrams(data.yieldGrams);
    }
  }, [data?.recipeId]);

  async function saveYield() {
    await fetch(`/api/recipes/${recipeId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ yieldPortions, yieldGrams }),
    });
    qc.invalidateQueries({ queryKey: ["recipes", recipeId] });
    qc.invalidateQueries({ queryKey: ["costing", recipeId] });
  }

  if (isLoading || !data) return null;

  const result = calculateCost(data.ingredients, yieldPortions, yieldGrams);
  const allergens = aggregateAllergens(
    data.ingredients.map((i) => ({ id: i.ingredientId, ...i.allergens }))
  );
  const activeAllergens = allergenList(allergens);

  return (
    <div className="recipe-costing">
      <div className="versions-h">{t("costing-h")}</div>

      {/* Yield inputs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <div className="field" style={{ flex: 1, minWidth: 120 }}>
          <label>{t("costing-yield-portions")}</label>
          <input
            type="number"
            className="input"
            value={yieldPortions ?? ""}
            onChange={(e) => setYieldPortions(e.target.value ? +e.target.value : null)}
            onBlur={saveYield}
            placeholder="—"
          />
        </div>
        <div className="field" style={{ flex: 1, minWidth: 120 }}>
          <label>{t("costing-yield-grams")}</label>
          <input
            type="number"
            className="input"
            value={yieldGrams ?? ""}
            onChange={(e) => setYieldGrams(e.target.value ? +e.target.value : null)}
            onBlur={saveYield}
            placeholder="—"
          />
        </div>
      </div>

      {/* Cost summary */}
      <div className="costing-summary">
        <div className="costing-stat">
          <span className="costing-stat-label">{t("costing-total")}</span>
          <span className="costing-stat-value">{result.totalCost.toFixed(2)} €</span>
        </div>
        {result.yieldPortions != null && result.yieldPortions > 0 && (
          <div className="costing-stat">
            <span className="costing-stat-label">{t("costing-per-portion")}</span>
            <span className="costing-stat-value">{result.costPerPortion.toFixed(2)} €</span>
          </div>
        )}
        {result.yieldGrams != null && result.yieldGrams > 0 && (
          <div className="costing-stat">
            <span className="costing-stat-label">{t("costing-per-gram")}</span>
            <span className="costing-stat-value">{result.costPerGram.toFixed(4)} €</span>
          </div>
        )}
      </div>

      {/* Ingredient cost breakdown */}
      {data.ingredients.length > 0 && (
        <table className="costing-table">
          <thead>
            <tr>
              <th>{t("costing-ingredient")}</th>
              <th>{t("costing-quantity")}</th>
              <th>{t("costing-unit")}</th>
              <th>{t("costing-cost")}</th>
            </tr>
          </thead>
          <tbody>
            {data.ingredients.map((ing, i) => (
              <tr key={ing.ingredientId}>
                <td>{ing.ingredientName}</td>
                <td>{ing.quantity}</td>
                <td>{ing.unit}</td>
                <td>{result.breakdown[i]?.cost.toFixed(2) ?? "—"} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Allergen badges */}
      <div style={{ marginTop: 12 }}>
        <div className="versions-h" style={{ fontSize: 11, marginBottom: 6 }}>{t("allergens-h")}</div>
        {activeAllergens.length === 0 ? (
          <span style={{ fontStyle: "italic", color: "var(--ink-mute)", fontSize: 13 }}>{t("allergens-none")}</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {activeAllergens.map((key) => (
              <span key={key} className="badge-allergen">
                {t(`allergen-${key.replace("has", "").toLowerCase()}`)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
