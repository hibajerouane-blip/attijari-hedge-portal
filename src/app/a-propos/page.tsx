import Link from "next/link";
import { DEMO_DISCLAIMER } from "@/lib/constants";

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">À propos</h1>
        <p className="mt-2 text-sm leading-relaxed text-bank-600">
          HedgeDesk Demo est un portail pédagogique réalisé dans le cadre d&apos;un
          stage au desk commercial FX. Il illustre comment un conseiller peut
          dialoguer avec un trésorier corporate autour de la couverture de
          change (EUR/MAD, USD/MAD).
        </p>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Ce que fait l&apos;outil
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-bank-700">
          <li>Présente quatre instruments : forward, option vanilla, tunnel, futures.</li>
          <li>
            Simule le P&amp;L en MAD sous un choc de spot (importateur /
            exportateur).
          </li>
          <li>Compare les payoffs et affiche un historique de marché synthétique.</li>
        </ul>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Données &amp; limites
        </h2>
        <p className="text-sm leading-relaxed text-bank-700">
          {DEMO_DISCLAIMER} Les cotations et historiques sont générés localement
          (référence BAM-like). Les formules (IRP, Garman-Kohlhagen, collar
          zéro-coût) sont simplifiées à des fins de formation.
        </p>
        <p className="text-sm text-bank-600">
          Aucun logo ni marque commerciale de banque n&apos;est utilisé dans cette
          démo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/simulateur" className="btn-primary">
          Ouvrir le simulateur
        </Link>
        <Link href="/" className="btn-secondary">
          Tableau de bord
        </Link>
      </div>
    </div>
  );
}
