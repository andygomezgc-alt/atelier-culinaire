"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { Ico } from "@/components/icons";
import { initialsFrom } from "@/lib/utils";

type House = { name: string; style: string; season: string; price: string; restrictions: string };
type Profile = { id: string; name: string; role: string; initials: string; photoUrl: string | null; email?: string };
type Member = { id: string; name: string; role: string };
const ROLES = ["admin", "editor", "contributor", "viewer"] as const;

export default function CasaPage() {
  const { t } = useLang();
  const toast = useToast();
  const [house, setHouse] = useState<House>({ name: "", style: "", season: "", price: "", restrictions: "" });
  const [chef, setChef] = useState<Profile>({ id: "", name: "", role: "exec", initials: "", photoUrl: null });
  const [team, setTeam] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<(typeof ROLES)[number]>("contributor");
  const photoInput = useRef<HTMLInputElement>(null);
  const houseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chefTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/restaurant").then((r) => r.json()).then(setHouse);
    fetch("/api/profile").then((r) => r.json()).then(setChef);
    fetch("/api/team").then((r) => r.json()).then(setTeam);
  }, []);

  function setHouseField<K extends keyof House>(k: K, v: House[K]) {
    setHouse((h) => ({ ...h, [k]: v }));
    if (houseTimer.current) clearTimeout(houseTimer.current);
    houseTimer.current = setTimeout(async () => {
      const r = await fetch("/api/restaurant", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [k]: v }),
      }).then((x) => x.json());
      window.dispatchEvent(new CustomEvent("restaurant:updated", { detail: r }));
    }, 350);
  }

  function setChefField<K extends keyof Profile>(k: K, v: Profile[K]) {
    setChef((c) => ({ ...c, [k]: v }));
    if (chefTimer.current) clearTimeout(chefTimer.current);
    chefTimer.current = setTimeout(async () => {
      const updated = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [k]: v }),
      }).then((x) => x.json());
      window.dispatchEvent(new CustomEvent("profile:updated", { detail: updated }));
    }, 350);
  }

  async function uploadPhoto(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) return;
    const { url } = await up.json();
    setChefField("photoUrl", url);
  }

  async function addMember() {
    if (!newName.trim()) return;
    const m = await fetch("/api/team", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), role: newRole }),
    }).then((r) => r.json());
    setTeam((l) => [...l, m]);
    setNewName("");
    toast(t("toast-team-added"));
  }

  async function changeRole(id: string, role: string) {
    setTeam((l) => l.map((m) => (m.id === id ? { ...m, role } : m)));
    await fetch(`/api/team/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
  }

  async function removeMember(id: string) {
    setTeam((l) => l.filter((m) => m.id !== id));
    await fetch(`/api/team/${id}`, { method: "DELETE" });
  }

  return (
    <section className="screen-inner">
      <div className="page-eyebrow">{t("casa-eyebrow")}</div>
      <h1 className="page-title">{t("casa-title")}</h1>
      <p className="page-subtitle">{t("casa-subtitle")}</p>

      <div className="casa-grid">
        <div className="card">
          <h3 className="section-h">{t("casa-identity")}</h3>
          <p className="section-sub">{t("casa-identity-sub")}</p>

          <div className="field">
            <label>{t("casa-name")}</label>
            <input className="input" value={house.name} onChange={(e) => setHouseField("name", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("casa-style")}</label>
            <input className="input" value={house.style} onChange={(e) => setHouseField("style", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("casa-season")}</label>
            <input className="input" value={house.season} onChange={(e) => setHouseField("season", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("casa-price")}</label>
            <input className="input" value={house.price} onChange={(e) => setHouseField("price", e.target.value)} />
          </div>
          <div className="field">
            <label>{t("casa-restrictions")}</label>
            <textarea className="textarea" rows={2} value={house.restrictions} onChange={(e) => setHouseField("restrictions", e.target.value)} />
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 className="section-h">{t("casa-chef")}</h3>
            <p className="section-sub">{t("casa-chef-sub")}</p>

            <div className="field">
              <label>{t("chef-photo-l")}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "var(--accent)", color: "#fff",
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--f-display)", fontSize: 18, overflow: "hidden",
                  }}
                >
                  {chef.photoUrl ? <img src={chef.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (chef.initials || "CH")}
                </div>
                <input ref={photoInput} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ""; }} />
              </div>
            </div>

            <div className="field">
              <label>{t("chef-name-l")}</label>
              <input className="input" value={chef.name} onChange={(e) => setChefField("name", e.target.value)} />
            </div>
            <div className="field">
              <label>{t("chef-role-l")}</label>
              <select className="select" value={chef.role} onChange={(e) => setChefField("role", e.target.value)}>
                <option value="exec">{t("role-exec")}</option>
                <option value="sous">{t("role-sous")}</option>
                <option value="rd">{t("role-rd")}</option>
              </select>
            </div>
            <div className="field">
              <label>{t("chef-initials-l")}</label>
              <input className="input" maxLength={3} value={chef.initials} onChange={(e) => setChefField("initials", e.target.value.toUpperCase())} />
            </div>
          </div>

          <div className="card">
            <h3 className="section-h">{t("casa-team")}</h3>
            <p className="section-sub">{t("casa-team-sub")}</p>

            <div>
              {team.map((m) => (
                <div key={m.id} className="team-row">
                  <div className="av">{initialsFrom(m.name)}</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", fontStyle: "italic", fontFamily: "var(--f-serif)" }}>
                      {t(`role-${m.role}-d`)}
                    </div>
                  </div>
                  <select className="role-select" value={m.role} onChange={(e) => changeRole(m.id, e.target.value)}>
                    {ROLES.map((r) => <option key={r} value={r}>{t(`role-${r}`)}</option>)}
                  </select>
                  <button className="btn-icon" onClick={() => removeMember(m.id)}>
                    <Ico.trash />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input
                className="input" placeholder={t("team-name-ph")}
                value={newName} onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 1 }}
              />
              <select className="select" value={newRole} onChange={(e) => setNewRole(e.target.value as (typeof ROLES)[number])} style={{ width: "auto" }}>
                {ROLES.map((r) => <option key={r} value={r}>{t(`role-${r}`)}</option>)}
              </select>
              <button className="btn btn-ghost" onClick={addMember}>{t("team-add")}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
