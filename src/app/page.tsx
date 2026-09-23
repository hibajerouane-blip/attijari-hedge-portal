"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SpotCard from "@/components/SpotCard";
import MiniChart from "@/components/MiniChart";
import type { MarketSnapshot } from "@/lib/market";
import { formatFx, formatPct } from "@/lib/format";

const INSTRUMENTS = [
  {
    href: "/instruments",
    title: "Forward",
    blurb:
      "Figer dès aujourd’hui le cours EUR ou USD à une date future — certitude budgétaire sans prime.",
    tag: "IRP · OTC",
    accent: "from-[#2E2C38] to-[#3A3848]",
  },
  {
    href: "/instruments",
    title: "Option vanilla",
    blurb:
      "Call (import) ou put (export) : protection asymétrique avec conservation de l’upside.",
    tag: "Garman-Kohlhagen",
    accent: "from-[#EE5B47] to-[#C94A3A]",
  },
  {
    href: "/instruments",
    title: "Tunnel",
    blurb:
      "Collar zéro-coût : corridor de change sans décaissement, en cédant une partie d’upside.",
    tag: "Structure",
    accent: "from-[#FFB900] to-[#D9A000]",
  },
  {
    href: "/instruments",
    title: "Futures",
    blurb:
      "Contrat listé marqué au marché — liquidité, basis et discipline des appels de marge.",
    tag: "MTM",
    accent: "from-[#202024] to-[#2E2C38]",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Cadrer le besoin",
    body: "Paire, horizon, sens (import / export) et tolérance au risque — comme en entretien desk.",
  },
  {
    n: "02",
    title: "Comparer les instruments",
    body: "Forward, option, tunnel ou futures : payoff, coût et points d’attention en un coup d’œil.",
  },
  {
    n: "03",
    title: "Simuler le P&L",
    body: "Choc de spot, ranking et recommandation pédagogique face à l’exposition non couverte.",
  },
];

const FEATURES = [
  {
    title: "Simulation P&L",
    desc: "Courbes vs spot futur, ranking MAD et recommandation desk sous choc de change.",
    href: "/simulateur",
  },
  {
    title: "Comparaison",
    desc: "Payoffs côte à côte pour arbitrer une stratégie avec le trésorier corporate.",
    href: "/comparer",
  },
  {
    title: "Historique marché",
    desc: "Séries synthétiques 1M → 2Y sur EUR/MAD et USD/MAD (référence BAM-like).",
    href: "/marche",
  },
];

export default function HomePage() {
  const [eur, setEur] = useState<MarketSnapshot | null>(null);
  const [usd, setUsd] = useState<MarketSnapshot | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
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
      .catch(() => setErr("Impossible de charger les marchés"));
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero — dark patterned, left headline */}
      <section className="relative overflow-hidden rounded-2xl bg-hero-awb text-brand-light shadow-hero">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-56 w-56 rounded-full bg-brand-red/25 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-demo">Démo pédagogique stage</span>
              <span className="text-[11px] uppercase tracking-wider text-brand-light/50">
                Desk commercial FX · Clients corporate
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-brand-light sm:text-4xl lg:text-[2.75rem]">
              Couverture FX —
              <br />
              <span className="text-brand-orange">Desk Commercial</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand-light/75 sm:text-base">
              Sécurisez vos flux EUR et USD face au dirham. Choisissez et
              expliquez une couverture : forward pour figer le budget, option
              pour garder l&apos;upside, tunnel zéro-coût, ou futures listés.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/simulateur" className="btn-primary">
                Lancer le simulateur
              </Link>
              <Link href="/instruments" className="btn-ghost-light">
                Voir les instruments
              </Link>
            </div>
            <p className="mt-5 text-[11px] italic text-brand-light/45">
              « Croire en vous » — esprit institutionnel · données synthétiques
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:col-span-2">
            {[
              { k: "4", l: "Instruments" },
              { k: "2", l: "Paires FX" },
              { k: "IRP", l: "Forward" },
              { k: "GK", l: "Options" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm"
              >
                <div className="font-mono text-2xl font-bold text-brand-orange">
                  {s.k}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-brand-light/55">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live-ish spot strip */}
      <section className="-mt-4 overflow-hidden rounded-xl border border-bank-200 bg-white shadow-card">
        <div className="flex flex-wrap items-stretch divide-y divide-bank-100 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-bank-500 sm:px-5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
            </span>
            Cotations démo
          </div>
          {err && (
            <div className="flex-1 px-4 py-3 text-sm text-brand-red sm:px-5">
              {err}
            </div>
          )}
          {!err && (
            <>
              <SpotStripRow
                label="EUR/MAD"
                snap={eur}
                loading={!eur}
              />
              <SpotStripRow
                label="USD/MAD"
                snap={usd}
                loading={!usd}
              />
            </>
          )}
          <Link
            href="/marche"
            className="flex items-center px-4 py-3 text-xs font-semibold text-brand-red hover:underline sm:px-5"
          >
            Marché →
          </Link>
        </div>
      </section>

      {/* Nos instruments — 4 cards */}
      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-bank-900">
              Nos instruments
            </h2>
            <p className="mt-1 text-sm text-bank-500">
              Quatre solutions pour dialoguer avec un trésorier corporate.
            </p>
          </div>
          <Link
            href="/instruments"
            className="text-sm font-semibold text-brand-red hover:underline"
          >
            Fiches détaillées →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INSTRUMENTS.map((ins) => (
            <Link
              key={ins.title}
              href={ins.href}
              className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-28 items-end bg-gradient-to-br ${ins.accent} p-4`}
              >
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                  {ins.tag}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-bank-900 group-hover:text-brand-red">
                  {ins.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-bank-500">
                  {ins.blurb}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="rounded-2xl border border-bank-200 bg-white p-6 shadow-card sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-bank-900">
          Comment ça marche
        </h2>
        <p className="mt-1 text-sm text-bank-500">
          Un parcours en trois étapes, calqué sur un entretien commercial FX.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <div className="font-mono text-3xl font-bold text-brand-orange/80">
                {s.n}
              </div>
              <h3 className="mt-2 text-base font-semibold text-bank-900">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bank-500">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature band */}
      <section className="space-y-5">
        <h2 className="text-2xl font-bold tracking-tight text-bank-900">
          Outils du desk
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="card group flex flex-col p-6 transition hover:border-brand-orange"
            >
              <h3 className="text-lg font-semibold text-bank-900 group-hover:text-brand-red">
                {f.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-bank-500">
                {f.desc}
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-brand-orange">
                Ouvrir →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Market detail cards (charts) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-bank-900">
            Aperçu des parités
          </h2>
          <p className="text-sm text-bank-500">
            Historique synthétique 90 jours — référence BAM-like.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {eur && (
            <div className="card p-5">
              <SpotCard
                bare
                label={eur.label}
                spot={eur.spot}
                change1dPct={eur.change1dPct}
                source={eur.source}
                asOf={eur.asOf}
              />
              <div className="mt-4">
                <div className="mb-1 text-xs text-bank-400">90 derniers jours</div>
                <MiniChart data={eur.history} color="#2E2C38" gradId="eur" />
              </div>
            </div>
          )}
          {usd && (
            <div className="card p-5">
              <SpotCard
                bare
                label={usd.label}
                spot={usd.spot}
                change1dPct={usd.change1dPct}
                source={usd.source}
                asOf={usd.asOf}
              />
              <div className="mt-4">
                <div className="mb-1 text-xs text-bank-400">90 derniers jours</div>
                <MiniChart data={usd.history} color="#EE5B47" gradId="usd" />
              </div>
            </div>
          )}
          {!eur && !usd && !err && (
            <div className="col-span-2 py-12 text-center text-sm text-bank-400">
              Chargement des cotations…
            </div>
          )}
        </div>
      </section>

      {/* Soft disclaimer */}
      <section className="rounded-xl border border-dashed border-bank-300 bg-bank-50/80 px-5 py-4 text-center">
        <p className="text-xs leading-relaxed text-bank-500">
          <strong className="font-semibold text-bank-700">
            Démo pédagogique stage — salle des marchés.
          </strong>{" "}
          Données synthétiques. Ne constitue ni un conseil en investissement ni
          une offre bancaire. Aucun logo officiel Attijariwafa Bank n&apos;est
          embarqué.
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
