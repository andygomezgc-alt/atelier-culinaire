"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { Ico } from "@/components/icons";
import { initialsFrom } from "@/lib/utils";
import { useTeam, useCreateTeamMember, useUpdateTeamMember, useDeleteTeamMember, useAllUsers, useUpdateUser, useDeleteUser, useProfile } from "@/hooks";

type House = { name: string; style: string; season: string; price: string; restrictions: string };
type Member = { id: string; name: string; role: string };
type AppUser = {
  id: string; email: string; name: string; role: string;
  accessLevel: string; initials: string; photoUrl: string | null; phone: string | null;
};
const CARD_ROLES = ["admin", "editor", "contributor", "viewer"] as const;
const ACCESS_LEVELS = ["admin", "editor", "viewer"] as const;

export default function CasaPage() {
  const { t } = useLang();
  const toast = useToast();
  const { data: team = [] } = useTeam();
  const { data: users = [] } = useAllUsers();
  const { data: me } = useProfile();
  const updateTeamMutation = useUpdateTeamMember();
  const deleteTeamMutation = useDeleteTeamMember();
  const createTeamMutation = useCreateTeamMember();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const [house, setHouse] = useState<House>({ name: "", style: "", season: "", price: "", restrictions: "" });
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<(typeof CARD_ROLES)[number]>("contributor");
  const houseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/restaurant").then((r) => r.json()).then(setHouse).catch(() => {});
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

  async function addMember() {
    if (!newName.trim()) return;
    createTeamMutation.mutate({ name: newName.trim(), role: newRole });
    setNewName("");
    toast(t("toast-team-added"));
  }

  async function changeCardRole(id: string, role: string) {
    updateTeamMutation.mutate({ id, data: { role: role as "admin" | "editor" | "contributor" | "viewer" } });
  }

  async function removeMember(id: string) {
    deleteTeamMutation.mutate(id);
  }

  async function changeUserAccess(id: string, accessLevel: string) {
    updateUserMutation.mutate({ id, data: { accessLevel: accessLevel as "admin" | "editor" | "viewer" } });
    toast(t("toast-saved"));
  }

  async function revokeAccess(id: string) {
    if (!confirm("Bajar a 'viewer'? La persona ya no podrá editar.")) return;
    deleteUserMutation.mutate(id);
    toast(t("toast-saved"));
  }

  const isAdmin = me?.accessLevel === "admin";

  return (
    <section className="screen-inner">
      <div className="page-eyebrow">{t("casa-eyebrow")}</div>
      <h1 className="page-title">{t("casa-title")}</h1>
      <p className="page-subtitle">{t("casa-subtitle")}</p>

      <div className="casa-grid">
        <section className="card">
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
        </section>

        <div>
          <section className="card" style={{ marginBottom: 16 }}>
            <h3 className="section-h">Miembros con acceso</h3>
            <p className="section-sub">Personas registradas en la app, con su nivel de permiso.</p>

            {users.length === 0 ? (
              <p className="muted-note">Aún nadie más se ha registrado.</p>
            ) : (
              <div>
                {users.map((u) => (
                  <div key={u.id} className="team-row">
                    <div className="av">
                      {u.photoUrl ? <Image src={u.photoUrl} alt="User avatar" width={40} height={40} className="avatar" /> : (u.initials || initialsFrom(u.name))}
                    </div>
                    <div className="team-row-info">
                      <div className="team-row-name">{u.name}</div>
                      <div className="team-row-meta">{u.email}</div>
                    </div>
                    {isAdmin ? (
                      <>
                        <select className="role-select" value={u.accessLevel}
                          onChange={(e) => changeUserAccess(u.id, e.target.value)}>
                          {ACCESS_LEVELS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <button className="btn-icon" onClick={() => revokeAccess(u.id)} title="Quitar acceso">
                          <Ico.trash />
                        </button>
                      </>
                    ) : (
                      <span className={`access-badge ${u.accessLevel}`}>{u.accessLevel}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <h3 className="section-h">Personal (fichas)</h3>
            <p className="section-sub">Cocineros y staff sin acceso a la app — solo lista de contacto.</p>

            <div>
              {team.map((m) => (
                <div key={m.id} className="team-row">
                  <div className="av">{initialsFrom(m.name)}</div>
                  <div className="team-row-info">
                    <div className="team-row-name">{m.name}</div>
                    <div className="team-row-meta">{t(`role-${m.role}-d`)}</div>
                  </div>
                  <select className="role-select" value={m.role} onChange={(e) => changeCardRole(m.id, e.target.value)}>
                    {CARD_ROLES.map((r) => <option key={r} value={r}>{t(`role-${r}`)}</option>)}
                  </select>
                  <button className="btn-icon" onClick={() => removeMember(m.id)}>
                    <Ico.trash />
                  </button>
                </div>
              ))}
            </div>

            <div className="team-add-row">
              <input
                className="input" placeholder={t("team-name-ph")}
                value={newName} onChange={(e) => setNewName(e.target.value)}
              />
              <select className="select" value={newRole} onChange={(e) => setNewRole(e.target.value as (typeof CARD_ROLES)[number])}>
                {CARD_ROLES.map((r) => <option key={r} value={r}>{t(`role-${r}`)}</option>)}
              </select>
              <button className="btn btn-ghost" onClick={addMember}>{t("team-add")}</button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
