import Link from "next/link";
import { DEMO_DISCLAIMER } from "@/lib/constants";

export default function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <span className="badge-demo">Démo pédagogique stage</span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-bank-900">
          À propos
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-bank-600">
          <strong>Attijari Marchés · Couverture de change</strong> est un
          portail pédagogique réalisé dans le cadre d&apos;un stage au desk
          commercial FX. Il illustre comment un conseiller peut dialoguer avec
          un trésorier corporate autour de la couverture de change (EUR/MAD,
          USD/MAD).
        </p>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Ce que fait l&apos;outil
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-bank-700">
          <li>
            Présente quatre instruments : forward, option vanilla, tunnel,
            futures.
          </li>
          <li>
            Simule le P&amp;L en MAD sous un choc de spot (importateur /
            exportateur).
          </li>
          <li>
            Compare les payoffs et affiche un historique de marché synthétique.
          </li>
        </ul>
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Identité visuelle
        </h2>
        <p className="text-sm leading-relaxed text-bank-700">
          L&apos;interface s&apos;inspire de la charte Attijari CIB /
          Attijariwafa Bank (orange/jaune, rouge/corail, fonds sombres) à des
          fins de démo stage. Aucun fichier logo officiel n&apos;est embarqué —
          uniquement un wordmark CSS géométrique original.
        </p>
      </div>

      <div className="card space-y-3 border-brand-orange/30 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-bank-500">
          Données &amp; limites
        </h2>
        <p className="text-sm leading-relaxed text-bank-700">
          {DEMO_DISCLAIMER} Les cotations et historiques sont générés
          localement (référence BAM-like). Les formules (IRP, Garman-Kohlhagen,
          collar zéro-coût) sont simplifiées à des fins de formation.
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
