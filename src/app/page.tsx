"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MarketSnapshot } from "@/lib/market";
import { formatFx, formatPct } from "@/lib/format";
import { DEMO_DISCLAIMER } from "@/lib/constants";

export default function HomePage() {
  const [eur, setEur] = useState<MarketSnapshot | null>(null);
  const [usd, setUsd] = useState<MarketSnapshot | null>(null);
  const [err, setErr] = useState("");
  const [user, setUser] = useState<{ name: string; company: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser({ name: d.name, company: d.company }))
      .catch(() => {});

    Promise.all([
      fetch("/api/market/EURMAD").then((r) => r.json()),
      fetch("/api/market/USDMAD").then((r) => r.json()),
    ])
      .then(([e, u]) => {
        if (e.error || u.error) setErr(e.error || u.error);
        else {
          setEur(e);
          setUsd(u);
        }
      })
      .catch(() => setErr("Impossible de charger les cotations"));
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero — espace client sobre */}
      <section className="relative overflow-hidden rounded-2xl bg-hero-awb text-brand-light shadow-hero">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-brand-red/15 blur-3xl" />

        <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-demo">Démo pédagogique stage</span>
            <span className="text-[11px] uppercase tracking-wider text-brand-light/45">
              Accès sécurisé
            </span>
          </div>

          <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-brand-light sm:text-4xl lg:text-[2.6rem]">
            Espace client
            <span className="block text-brand-orange">
              Couverture de change
            </span>
          </h1>

          {user ? (
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-light/70 sm:text-base">
              Bonjour{user.name ? `, ${user.name}` : ""}
              {user.company ? (
                <span className="text-brand-light/50"> · {user.company}</span>
              ) : null}
              . Votre espace est prêt — accompagnement desk, en toute
              confidentialité.
            </p>
          ) : (
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-light/70 sm:text-base">
              Portail réservé à la clientèle. Accès sécurisé et accompagnement
              par le desk, en toute confidentialité.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/simulateur" className="btn-primary">
              Accéder au simulateur
            </Link>
            <Link href="/marche" className="btn-ghost-light">
              Voir les cotations
            </Link>
          </div>

          <p className="mt-8 text-[11px] italic text-brand-light/40">
            « Croire en vous »
          </p>
        </div>
      </section>

      {/* Bandeau cotations — minimal */}
      <section className="overflow-hidden rounded-xl border border-bank-200 bg-white shadow-card">
        <div className="flex flex-wrap items-stretch divide-y divide-bank-100 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-bank-500 sm:px-5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
            </span>
            Référence
          </div>
          {err && (
            <div className="flex-1 px-4 py-3 text-sm text-brand-red sm:px-5">
              {err}
            </div>
          )}
          {!err && (
            <>
              <SpotStripRow label="EUR/MAD" snap={eur} loading={!eur} />
              <SpotStripRow label="USD/MAD" snap={usd} loading={!usd} />
            </>
          )}
        </div>
      </section>

      {/* Zone confiance — courte */}
      <section className="rounded-xl border border-bank-200 bg-white px-5 py-5 shadow-card sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-bank-900">
              Accès réservé aux clients
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-bank-500">
              Cet espace est destiné à la relation clientèle. Les informations
              affichées restent confidentielles et ne constituent pas une offre
              publique.
            </p>
          </div>
          <Link
            href="/a-propos"
            className="shrink-0 text-xs font-medium text-brand-red hover:underline"
          >
            À propos →
          </Link>
        </div>
        <p className="mt-4 border-t border-bank-100 pt-3 text-[11px] leading-relaxed text-bank-400">
          {DEMO_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}

function SpotStripRow({
  label,
  snap,
  loading,
}: {
  label: string;
  snap: MarketSnapshot | null;
  loading: boolean;
}) {
  if (loading || !snap) {
    return (
      <div className="flex min-w-[140px] flex-1 items-center gap-3 px-4 py-3 sm:px-5">
        <span className="text-xs font-medium text-bank-400">{label}</span>
        <span className="text-xs text-bank-300">…</span>
      </div>
    );
  }
  const up = snap.change1dPct >= 0;
  return (
    <div className="flex min-w-[160px] flex-1 items-center gap-3 px-4 py-3 sm:px-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-bank-500">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums text-bank-900">
        {formatFx(snap.spot)}
      </span>
      <span
        className={`text-xs font-semibold ${
          up ? "text-emerald-600" : "text-brand-red"
        }`}
      >
        {formatPct(snap.change1dPct)}
      </span>
    </div>
  );
}
