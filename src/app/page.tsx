"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SpotCard from "@/components/SpotCard";
import MiniChart from "@/components/MiniChart";
import type { MarketSnapshot } from "@/lib/market";

export default function DashboardPage() {
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
    <div className="space-y-8">
      {/* Value prop */}
      <section className="overflow-hidden rounded-2xl border border-bank-800/20 bg-gradient-to-br from-bank-950 via-bank-900 to-bank-800 text-white shadow-card">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-5 lg:items-center">
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-soft">
              Desk commercial FX · Clients corporate
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Sécurisez vos flux EUR et USD face au dirham
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bank-200">
              HedgeDesk aide le trésorier à{" "}
              <strong className="text-white">choisir et expliquer</strong> une
              couverture : forward pour figer le budget, option pour garder
              l&apos;upside, tunnel zéro-coût pour un compromis, ou futures pour
              un marché listé. Comparez le P&amp;L vs l&apos;exposition non
              couverte en quelques clics.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/simulateur"
                className="inline-flex items-center justify-center rounded-lg bg-teal-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-soft"
              >
                Lancer le simulateur P&amp;L
              </Link>
              <Link
                href="/instruments"
                className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Voir les instruments
              </Link>
            </div>
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
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="font-mono text-xl font-semibold text-teal-soft">
                  {s.k}
                </div>
                <div className="text-[11px] text-bank-300">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-bank-900">
            Cotations du jour
          </h2>
          <p className="text-sm text-bank-500">
            Parités EUR/MAD et USD/MAD — données de démo / référence BAM-like.
          </p>
        </div>
      </div>

      {err && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {err}
        </div>
      )}

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
              <MiniChart data={eur.history} color="#1e566d" gradId="eur" />
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
              <MiniChart data={usd.history} color="#0d9488" gradId="usd" />
            </div>
          </div>
        )}
        {!eur && !usd && !err && (
          <div className="col-span-2 py-16 text-center text-sm text-bank-400">
            Chargement des cotations…
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            href: "/instruments",
            title: "Instruments",
            desc: "Quand utiliser forward, option, tunnel ou futures — fiches desk.",
          },
          {
            href: "/simulateur",
            title: "Simulateur",
            desc: "Choc de spot, ranking P&L et recommandation pédagogique.",
          },
          {
            href: "/comparer",
            title: "Comparer",
            desc: "Payoffs côte à côte pour arbitrer une stratégie.",
          },
          {
            href: "/marche",
            title: "Marché",
            desc: "Historique synthétique 1M → 2Y sur EUR/MAD & USD/MAD.",
          },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card group p-5 transition hover:border-teal-accent/40 hover:shadow-md"
          >
            <div className="text-sm font-semibold text-bank-900 group-hover:text-teal-accent">
              {c.title}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-bank-500">
              {c.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
