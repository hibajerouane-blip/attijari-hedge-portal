import Link from "next/link";

const INSTRUMENTS = [
  {
    name: "Forward (change à terme)",
    badge: "IRP",
    color: "border-l-brand-ink",
    badgeBg: "bg-bank-100 text-bank-800",
    summary:
      "Contrat OTC fixant dès aujourd'hui le cours d'achat ou de vente d'une devise à une date future. Aucune prime initiale.",
    formula: "F = S × e^((r_MAD − r_devise) × T)",
    when: [
      "Facture ferme (import ou export) avec date de règlement connue",
      "Besoin de certitude budgétaire (trésorerie, pricing client)",
      "Client prêt à renoncer à un spot plus favorable",
    ],
    use: "Sécuriser un budget sans décaissement de prime. Obligation d'exécuter à maturité.",
    risks: "Pas de flexibilité si le spot évolue favorablement (coût d'opportunité).",
  },
  {
    name: "Option vanilla (Garman-Kohlhagen)",
    badge: "Option",
    color: "border-l-brand-red",
    badgeBg: "bg-brand-red-soft text-brand-red-dark",
    summary:
      "Option européenne sur change. L'importateur achète un call (protection hausse) ; l'exportateur un put (protection baisse).",
    formula: "C = S e^(−r_f T) N(d1) − K e^(−r_d T) N(d2)",
    when: [
      "Flux probable mais non certain (appel d'offres, volume variable)",
      "Client qui veut garder l'upside si le spot lui est favorable",
      "Volatilité élevée : la protection vaut le coût de la prime",
    ],
    use: "Protection asymétrique : plancher/plafond garanti + conservation de l'upside. Paiement d'une prime.",
    risks: "Coût de la prime ; sensibilité à la volatilité implicite.",
  },
  {
    name: "Tunnel (collar zéro-coût)",
    badge: "Structure",
    color: "border-l-brand-orange",
    badgeBg: "bg-brand-orange-soft text-brand-orange-dark",
    when: [
      "Client refuse de payer une prime mais accepte de céder une partie d'upside",
      "Besoin d'un corridor de change (budget min / max)",
      "Dialogue commercial fréquent sur les collars",
    ],
    summary:
      "Achat d'une option de protection financé par la vente d'une option opposée. Strikes calibrés pour prime nette ≈ 0.",
    formula: "Taux effectif ∈ [K_put , K_call]",
    use: "Compromis commercial : protection sans décaissement, en cédant une partie de l'upside.",
    risks: "Corridor borné — hors tunnel, le client est plafonné / plancherisé.",
  },
  {
    name: "Futures FX",
    badge: "MTM",
    color: "border-l-violet-600",
    badgeBg: "bg-violet-50 text-violet-700",
    summary:
      "Contrat standardisé marqué au marché. Pour la démo : taux proche du forward IRP avec un léger basis listé + coût d'opportunité des marges.",
    formula: "F_fut ≈ F_IRP × (1 + basis) − coût_marge",
    when: [
      "Besoin de liquidité / transparence d'un marché listé",
      "Client équipé pour gérer les appels de marge",
      "Comparer OTC (forward) vs listé (futures) en entretien",
    ],
    use: "Payoff linéaire proche du forward ; distinction pédagogique via basis + marge.",
    risks: "Appels de marge quotidiens ; basis éventuel vs OTC ; funding collatéral.",
  },
];

export default function InstrumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">Instruments</h1>
        <p className="mt-1 max-w-2xl text-sm text-bank-500">
          Fiches pédagogiques pour le dialogue commercial avec un trésorier
          corporate. Chaque fiche indique <strong>quand proposer</strong> le
          produit. Formules dans{" "}
          <code className="rounded bg-bank-100 px-1 font-mono text-xs">
            lib/pricing/
          </code>
          .
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {INSTRUMENTS.map((ins) => (
          <article
            key={ins.name}
            className={`card border-l-4 ${ins.color} p-6`}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-bank-900">
                {ins.name}
              </h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ins.badgeBg}`}
              >
                {ins.badge}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-bank-600">
              {ins.summary}
            </p>
            <div className="mt-4 rounded-lg bg-bank-50 px-3 py-2 font-mono text-xs text-bank-800">
              {ins.formula}
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-red">
                Quand l&apos;utiliser
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-bank-700">
                {ins.when.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-bank-400">
                  Usage desk
                </dt>
                <dd className="text-bank-700">{ins.use}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-bank-400">
                  Points d&apos;attention
                </dt>
                <dd className="text-bank-700">{ins.risks}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="card flex flex-col items-start gap-3 border-brand-orange/30 bg-gradient-to-r from-white to-brand-orange-soft/40 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-bank-600">
          Le scénario <strong>Non couvert</strong> reste toujours affiché comme
          baseline dans le simulateur — pour montrer le coût du risque de
          change.
        </p>
        <Link href="/simulateur" className="btn-primary shrink-0">
          Simuler un besoin
        </Link>
      </div>
    </div>
  );
}
