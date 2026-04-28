"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error === "Already exists" ? "Ya existe una cuenta con ese email." :
                 d.error === "Password too short" ? "La contraseña debe tener al menos 6 caracteres." :
                 "No se pudo crear la cuenta.");
        setBusy(false);
        return;
      }
      const r = await signIn("credentials", { email, password, redirect: false });
      setBusy(false);
      if (r?.ok) router.push("/dashboard");
      else setError("Cuenta creada, pero falló el login.");
    } catch {
      setBusy(false);
      setError("Error de red.");
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="mark">A</div>
          <div className="h">Crear cuenta</div>
          <div className="s">Únete al Ristorante Marche.</div>
        </div>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Nombre</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input className="input" type="password" autoComplete="new-password" required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Creando…" : "Crear cuenta"}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>

        <div className="auth-divider"><span>o</span></div>

        <button type="button" className="btn btn-ghost btn-google" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.46.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div className="auth-foot">
          ¿Ya tenés cuenta? <Link href="/login">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
}
