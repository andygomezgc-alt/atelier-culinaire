"use client";
import { useEffect, useState } from "react";
import { useLang } from "./LangProvider";
import { useToast } from "./Toast";
import { Ico } from "./icons";
import { formatDate, renderMd } from "@/lib/utils";

export type RecipeVersion = { id: string; v: number; tester: string; note: string; createdAt: string };
export type RecipePhoto = { id: string; url: string };
export type Recipe = {
  id: string; name: string; category: string; status: "draft" | "testing" | "approved";
  priority: boolean; summary: string; content: string;
  createdAt: string;
  versions: RecipeVersion[]; photos: RecipePhoto[];
};

export function RecipeModal({
  recipe, onClose, onChange, onDelete, currentChef,
}: {
  recipe: Recipe;
  onClose: () => void;
  onChange: (r: Recipe) => void;
  onDelete: () => void;
  currentChef: string;
}) {
  const { t, lang } = useLang();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: recipe.name, category: recipe.category, summary: recipe.summary, content: recipe.content });
  const [vTester, setVTester] = useState(currentChef);
  const [vNote, setVNote] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    setDraft({ name: recipe.name, category: recipe.category, summary: recipe.summary, content: recipe.content });
  }, [recipe.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stKey = recipe.status === "draft" ? "st-draft" : recipe.status === "testing" ? "st-testing" : "st-approved";

  async function save() {
    const res = await fetch(`/api/recipes/${recipe.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      const r = await res.json();
      onChange(r);
      setEditing(false);
      toast(t("toast-saved"));
    }
  }

  async function addVersion() {
    if (!vNote.trim()) return;
    const res = await fetch(`/api/recipes/${recipe.id}/versions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tester: vTester, note: vNote }),
    });
    if (res.ok) {
      const updated = await fetch(`/api/recipes/${recipe.id}`).then((r) => r.json());
      onChange(updated);
      setVNote("");
      toast(t("toast-version-added"));
    }
  }

  async function uploadPhoto(file: File) {
    setPhotoBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) return;
      const { url } = await up.json();
      const res = await fetch(`/api/recipes/${recipe.id}/photos`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const updated = await fetch(`/api/recipes/${recipe.id}`).then((r) => r.json());
        onChange(updated);
      }
    } finally {
      setPhotoBusy(false);
    }
  }

  async function deletePhoto(photoId: string) {
    await fetch(`/api/recipes/${recipe.id}/photos?photoId=${photoId}`, { method: "DELETE" });
    const updated = await fetch(`/api/recipes/${recipe.id}`).then((r) => r.json());
    onChange(updated);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          {editing ? (
            <input
              className="input"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              style={{ fontFamily: "var(--f-display)", fontSize: 22 }}
            />
          ) : (
            <h2>{recipe.name}</h2>
          )}
          <button className="btn-icon" onClick={onClose} title={t("r-close")}>
            <Ico.close />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span className={`badge-status badge-${recipe.status}`}>{t(stKey)}</span>
            {recipe.priority && (
              <span className="badge-status" style={{ background: "rgba(196,126,79,.14)", color: "var(--accent-2)" }}>
                ★ {t("r-toggle-priority")}
              </span>
            )}
            <span className="badge-status" style={{ background: "var(--bg-2)", color: "var(--ink-mute)" }}>
              {recipe.category || "—"}
            </span>
          </div>

          {editing ? (
            <>
              <div className="field">
                <label>{t("recipes-eyebrow")}</label>
                <input className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              </div>
              <div className="field">
                <label>Summary</label>
                <textarea className="textarea" rows={2} value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
              </div>
              <div className="field">
                <label>Contenido (markdown)</label>
                <textarea className="textarea" rows={12} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
              </div>
            </>
          ) : (
            <div className="recipe-prose" dangerouslySetInnerHTML={{ __html: renderMd(recipe.content || recipe.summary || "") }} />
          )}

          <div style={{ marginTop: 18 }}>
            <div className="versions-h" style={{ marginBottom: 8 }}>{t("r-photos")}</div>
            <div className="recipe-photos">
              {recipe.photos.map((p) => (
                <div key={p.id} style={{ position: "relative" }}>
                  <img src={p.url} alt="" />
                  <button
                    className="btn-icon"
                    style={{ position: "absolute", top: 4, right: 4, background: "rgba(255,255,255,.85)" }}
                    onClick={() => deletePhoto(p.id)}
                    title="—"
                  >
                    <Ico.close />
                  </button>
                </div>
              ))}
            </div>
            <div className="recipe-photo-uploader">
              <input
                type="file"
                accept="image/*"
                disabled={photoBusy}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ""; }}
              />
            </div>
          </div>

          <div className="versions">
            <div className="versions-h">{t("r-versions")}</div>
            <div>
              {recipe.versions.length === 0 ? (
                <div style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", color: "var(--ink-mute)", fontSize: 14 }}>—</div>
              ) : (
                recipe.versions.map((v) => (
                  <div key={v.id} className="version">
                    <div className="v-tag">v{v.v}</div>
                    <div>
                      <div className="v-meta">{formatDate(v.createdAt, lang)} — {v.tester || "—"}</div>
                      <div className="v-note">{v.note}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="add-version">
              <div className="field">
                <label>{t("r-version-tester")}</label>
                <input className="input" value={vTester} onChange={(e) => setVTester(e.target.value)} />
              </div>
              <div className="field">
                <label>{t("r-version-note")}</label>
                <textarea className="textarea" rows={2} value={vNote} onChange={(e) => setVNote(e.target.value)} />
              </div>
              <button className="btn btn-accent btn-sm" onClick={addVersion}>{t("r-save-version")}</button>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-danger btn-sm" onClick={onDelete}>{t("r-delete")}</button>
          <div style={{ display: "flex", gap: 8 }}>
            {editing ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>{t("r-cancel")}</button>
                <button className="btn btn-accent btn-sm" onClick={save}>{t("r-save-version")}</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Editar</button>
                <button className="btn btn-ghost btn-sm" onClick={onClose}>{t("r-close")}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
