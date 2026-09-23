"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BrandMark() {
  return (
    <div
      className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-mark-awb text-white shadow-lg"
      aria-hidden
    >
      <span className="text-lg font-black tracking-tighter">AW</span>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [username, setUsername] = useState("client@demo.ma");
  const [password, setPassword] = useState("Demo2026!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Échec de connexion");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero-awb px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-orange/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-brand-red/25 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center text-brand-light">
          <BrandMark />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Attijari Marchés
          </h1>
          <p className="mt-1 text-sm text-brand-light/70">
            Couverture de change · Desk commercial FX
          </p>
          <div className="mt-3 flex justify-center">
            <span className="badge-demo">Démo pédagogique stage</span>
          </div>
          <p className="mt-3 text-[11px] italic text-brand-light/45">
            Croire en vous
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl"
        >
          <h2 className="text-lg font-semibold text-bank-900">Connexion</h2>
          <p className="mt-1 text-xs text-bank-500">
            Accès sécurisé (session httpOnly) — identifiants de démonstration.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="username">
                Identifiant
              </label>
              <input
                id="username"
                className="field"
                type="email"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                className="field"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-brand-red-soft px-3 py-2 text-sm text-brand-red-dark">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary mt-6 w-full"
            disabled={loading}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>

          <div className="mt-4 rounded-lg bg-bank-50 px-3 py-2 text-[11px] text-bank-600">
            Démo : <code className="font-mono">client@demo.ma</code> /{" "}
            <code className="font-mono">Demo2026!</code>
          </div>
        </form>

        <p className="mt-6 text-center text-[10px] text-brand-light/40">
          Données synthétiques — ne constitue ni conseil ni offre bancaire.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-bar text-brand-light">
          Chargement…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
