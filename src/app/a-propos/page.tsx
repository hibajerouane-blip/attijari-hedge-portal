import Link from "next/link";
import { DEMO_DISCLAIMER } from "@/lib/constants";

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <span className="inline-flex items-center rounded-full border border-brand-orange/40 bg-brand-orange/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-orange">
          Espace client
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-bank-900">
          À propos
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-bank-600">
          <strong>Attijari Marchés · Couverture de change</strong> est
          l&apos;espace client dédié à la couverture de change pour la
          clientèle corporate. Il accompagne le dialogue avec le desk
          commercial FX sur les paires EUR/MAD et USD/MAD.
        </p>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Services disponibles
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-bank-700">
          <li>
            Présentation des instruments : forward, option vanilla, tunnel,
            futures.
          </li>
          <li>
            Simulation de P&amp;L en MAD selon un scénario de spot (importateur
            / exportateur).
          </li>
          <li>
            Comparaison des payoffs et suivi des cotations de référence.
          </li>
        </ul>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Desk commercial
        </h2>
        <p className="text-sm leading-relaxed text-bank-700">
          Votre interlocuteur desk reste disponible pour cadrer un besoin de
          couverture, comparer les structures et préparer une proposition
          adaptée à votre flux (échéance, notionnel, profil import / export).
        </p>
      </div>

      <div className="card space-y-3 border-brand-orange/30 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Confidentialité
        </h2>
        <p className="text-sm leading-relaxed text-bank-700">
          {DEMO_DISCLAIMER} Les historiques proviennent de Bank Al-Maghrib
          (via Frankfurter) ; le spot peut être fourni par Yahoo Finance entre
          deux publications BAM.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/simulateur" className="btn-primary">
          Ouvrir le simulateur
        </Link>
        <Link href="/" className="btn-secondary">
          Accueil
        </Link>
      </div>
    </div>
  );
}
