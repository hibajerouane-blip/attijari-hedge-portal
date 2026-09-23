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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-bank-900">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-bank-500">
            Vue synthétique des parités EUR/MAD et USD/MAD — données de démo /
            référence BAM-like.
          </p>
        </div>
        <Link href="/simulateur" className="btn-primary">
          Lancer le simulateur P&amp;L
        </Link>
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
              label={eur.label}
              spot={eur.spot}
              change1dPct={eur.change1dPct}
              source={eur.source}
              asOf={eur.asOf}
            />
            <div className="mt-4">
              <div className="mb-1 text-xs text-bank-400">90 derniers jours</div>
              <MiniChart data={eur.history} color="#1e566d" />
            </div>
          </div>
        )}
        {usd && (
          <div className="card p-5">
            <SpotCard
              label={usd.label}
              spot={usd.spot}
              change1dPct={usd.change1dPct}
              source={usd.source}
              asOf={usd.asOf}
            />
            <div className="mt-4">
              <div className="mb-1 text-xs text-bank-400">90 derniers jours</div>
              <MiniChart data={usd.history} color="#0d9488" />
            </div>
          </div>
        )}
        {!eur && !usd && !err && (
          <div className="col-span-2 py-16 text-center text-sm text-bank-400">
            Chargement des cotations…
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            href: "/instruments",
            title: "Instruments",
            desc: "Forward, options, tunnel, futures — pédagogie desk commercial.",
          },
          {
            href: "/comparer",
            title: "Comparer",
            desc: "Diagrammes de payoff côte à côte pour arbitrer une stratégie.",
          },
          {
            href: "/marche",
            title: "Historique",
            desc: "Séries synthétiques 2 ans avec sélecteurs 1M à 2Y.",
          },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card group p-5 transition hover:border-teal-accent/40"
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
