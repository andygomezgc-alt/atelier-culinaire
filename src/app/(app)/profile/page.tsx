"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useLang } from "@/components/LangProvider";
import { useToast } from "@/components/Toast";
import { initialsFrom } from "@/lib/utils";
import { useProfile, useUpdateProfile } from "@/hooks";
import type { Lang } from "@/lib/i18n";

type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  initials: string;
  photoUrl: string | null;
  phone: string | null;
  lang: string;
  accessLevel: string;
};

const ROLES = ["exec", "sous", "rd"] as const;

export default function ProfilePage() {
  const { t, lang, setLang } = useLang();
  const toast = useToast();
  const { data: p } = useProfile();
  const updateMutation = useUpdateProfile();
  const [tab, setTab] = useState<"data" | "account">("data");
  const photoInput = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // password change
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  function patch(field: keyof Profile, value: string) {
    if (!p) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      updateMutation.mutate({ [field]: value });
      window.dispatchEvent(new CustomEvent("profile:updated", { detail: { ...p, [field]: value } }));
    }, 350);
  }

  async function uploadPhoto(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const up = await fetch("/api/upload", { method: "POST", body: fd });
    if (!up.ok) return;
    const { url } = await up.json();
    patch("photoUrl", url);
    toast(t("toast-saved"));
  }

  async function changePwd() {
    if (newPwd.length < 6) {
      setPwdMsg("Mínimo 6 caracteres.");
      return;
    }
    updateMutation.mutate({ currentPassword: curPwd, newPassword: newPwd });
    setPwdMsg("Contraseña actualizada.");
    setCurPwd("");
    setNewPwd("");
    toast("Contraseña actualizada.");
  }

  async function changeEmail(newEmail: string) {
    updateMutation.mutate({ email: newEmail });
    toast(t("toast-saved"));
  }

  if (!p) {
    return <div className="screen-inner"><div className="page-subtitle">…</div></div>;
  }

  return (
    <div className="screen-inner">
      <div className="page-eyebrow">— Mi cuenta —</div>
      <h1 className="page-title">Perfil</h1>
      <p className="page-subtitle">Tus datos personales y de acceso.</p>

      <div className="tabs">
        <button className={`tab ${tab === "data" ? "active" : ""}`} onClick={() => setTab("data")}>Datos personales</button>
        <button className={`tab ${tab === "account" ? "active" : ""}`} onClick={() => setTab("account")}>Cuenta</button>
      </div>

      {tab === "data" && (
        <div className="profile-grid">
          <section className="card-block">
            <div className="card-block-h">Identidad</div>

            <div className="avatar-row">
              <div className="avatar-lg">
                {p.photoUrl ? <Image src={p.photoUrl} alt="Profile" width={64} height={64} className="avatar" /> : (p.initials || initialsFrom(p.name))}
              </div>
              <div>
                <button className="btn btn-ghost btn-sm" onClick={() => photoInput.current?.click()}>
                  Cambiar foto
                </button>
                <input ref={photoInput} type="file" accept="image/*" hidden
                  onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
              </div>
            </div>

            <div className="field">
              <label>Nombre</label>
              <input className="input" value={p.name} onChange={(e) => patch("name", e.target.value)}
                onBlur={() => p.name && patch("initials", initialsFrom(p.name))} />
            </div>

            <div className="field">
              <label>Iniciales (avatar)</label>
              <input className="input" maxLength={3} value={p.initials}
                onChange={(e) => patch("initials", e.target.value.toUpperCase())} />
            </div>

            <div className="field">
              <label>Rol</label>
              <select className="input" value={p.role} onChange={(e) => patch("role", e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{t(`role-${r}`)}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Teléfono</label>
              <input className="input" type="tel" inputMode="tel"
                value={p.phone ?? ""} onChange={(e) => patch("phone", e.target.value)} placeholder="+39 ..." />
            </div>

            <div className="field">
              <label>Idioma</label>
              <div className="lang-row">
                {(["es", "it", "en"] as Lang[]).map((l) => (
                  <button key={l} className={`pill-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="card-block">
            <div className="card-block-h">Nivel de acceso</div>
            <div className="access-display">
              <span className={`access-badge ${p.accessLevel}`}>{p.accessLevel}</span>
              <p className="muted-note">
                {p.accessLevel === "admin" && "Podés crear, editar, aprobar y gestionar el equipo."}
                {p.accessLevel === "editor" && "Podés crear y editar contenido."}
                {p.accessLevel === "viewer" && "Solo lectura. Pedile a un admin que te suba de nivel."}
              </p>
            </div>
          </section>
        </div>
      )}

      {tab === "account" && (
        <div className="profile-grid">
          <section className="card-block">
            <div className="card-block-h">Email</div>
            <EmailEditor email={p.email} onSave={changeEmail} />
          </section>

          <section className="card-block">
            <div className="card-block-h">Contraseña</div>
            <div className="field">
              <label>Contraseña actual</label>
              <input className="input" type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} />
            </div>
            <div className="field">
              <label>Nueva contraseña</label>
              <input className="input" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
            </div>
            <button className="btn btn-accent" onClick={changePwd}>Actualizar contraseña</button>
            {pwdMsg && <div className="muted-note" style={{ marginTop: 8 }}>{pwdMsg}</div>}
          </section>

          <section className="card-block">
            <div className="card-block-h">Sesión</div>
            <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
              Cerrar sesión
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function EmailEditor({ email, onSave }: { email: string; onSave: (e: string) => void }) {
  const [val, setVal] = useState(email);
  const dirty = val !== email;
  return (
    <>
      <div className="field">
        <label>Tu email</label>
        <input className="input" type="email" value={val} onChange={(e) => setVal(e.target.value)} />
      </div>
      <button className="btn btn-accent" disabled={!dirty} onClick={() => onSave(val)}>Guardar email</button>
    </>
  );
}
