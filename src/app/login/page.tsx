"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-bank-950 via-bank-900 to-bank-800 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-accent text-lg font-bold">
            HD
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            HedgeDesk Demo
          </h1>
          <p className="mt-1 text-sm text-bank-300">
            Couverture FX — Démo Stage · Portail client corporate
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
            <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
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
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bank-950 text-white">
          Chargement…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
