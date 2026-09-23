"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEMO_DISCLAIMER } from "@/lib/constants";

function BrandMark({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-mark-awb text-white shadow-lg ${className}`}
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="relative flex min-h-screen overflow-hidden bg-hero-awb">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand-orange/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-red/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-4 py-12 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:py-16">
        <div className="flex-1 text-brand-light lg:max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-brand-orange/40 bg-brand-orange/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-orange">
              Accès réservé
            </span>
            <span className="text-[11px] uppercase tracking-wider text-brand-light/45">
              Connexion sécurisée
            </span>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <BrandMark className="h-12 w-12 rounded-lg sm:h-14 sm:w-14 sm:rounded-xl" />
            <div>
              <div className="text-sm font-semibold tracking-tight sm:text-base">
                Attijari Marchés
              </div>
              <div className="text-[11px] text-brand-light/50">
                Couverture de change
              </div>
            </div>
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
            Espace client
            <span className="mt-1 block text-brand-orange">
              Couverture de change
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-brand-light/70 sm:text-base">
            Portail réservé à la clientèle. Connexion sécurisée et
            accompagnement par le desk — en toute confidentialité.
          </p>

          <ul className="mt-8 hidden space-y-3 text-sm text-brand-light/55 sm:block">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              Accès dédié aux clients corporate
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              Session sécurisée · échange confidentiel
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" />
              Accompagnement desk commercial
            </li>
          </ul>

          <p className="mt-10 text-[11px] italic text-brand-light/40">
            « Croire en vous »
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-[400px]">
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8"
          >
            <h2 className="text-lg font-semibold text-bank-900">Connexion</h2>
            <p className="mt-1 text-xs leading-relaxed text-bank-500">
              Identifiez-vous pour accéder à votre espace.
            </p>

            <div className="mt-6 space-y-4">
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
              {loading ? "Connexion…" : "Accéder à mon espace"}
            </button>
          </form>

          <p className="mt-5 text-center text-[10px] leading-relaxed text-brand-light/40">
            {DEMO_DISCLAIMER}
          </p>
        </div>
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
