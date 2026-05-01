"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export default function RegisterPage() {
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    setBusy(false);
    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.message || t("register-error"));
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="mark">A</div>
          <div className="h">{t("register-title")}</div>
          <div className="s">{t("register-sub")}</div>
        </div>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>{t("register-name")}</label>
            <input
              className="input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label>{t("register-email")}</label>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>{t("register-password")}</label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: "100%" }} disabled={busy}>
            {t("register-submit")}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>

        <div className="auth-foot">
          Ya tenés cuenta? <Link href="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
