import Link from "next/link";

const INSTRUMENTS = [
  {
    name: "Forward (change à terme)",
    badge: "IRP",
    color: "border-l-bank-700",
    summary:
      "Contrat OTC fixant dès aujourd'hui le cours d'achat ou de vente d'une devise à une date future.",
    formula: "F = S × e^((r_MAD − r_devise) × T)",
    use: "Idéal pour sécuriser un budget (facture ferme) sans prime initiale. Obligation d'exécuter à maturité.",
    risks: "Pas de flexibilité si le spot évolue favorablement (coût d'opportunité).",
  },
  {
    name: "Call / Put vanilla (Garman-Kohlhagen)",
    badge: "Option",
    color: "border-l-teal-accent",
    summary:
      "Option européenne sur change. L'importateur achète un call (protection hausse) ; l'exportateur un put (protection baisse).",
    formula: "C = S e^(−r_f T) N(d1) − K e^(−r_d T) N(d2)",
    use: "Protection asymétrique : plafond/plancher garanti tout en conservant l'upside. Paiement d'une prime.",
    risks: "Coût de la prime ; sensibilité à la volatilité implicite.",
  },
  {
    name: "Tunnel (collar zéro-coût)",
    badge: "Structure",
    color: "border-l-gold-soft",
    summary:
      "Achat d'une option de protection financé par la vente d'une option opposée. Strikes calibrés pour prime nette ≈ 0.",
    formula: "Taux effectif ∈ [K_put , K_call]",
    use: "Compromis commercial fréquent : protection sans décaissement de prime, en cédant une partie de l'upside.",
    risks: "Corridor borné — hors tunnel, le client est plafonné / plancherisé.",
  },
  {
    name: "Futures FX",
    badge: "MTM",
    color: "border-l-violet-600",
    summary:
      "Contrat standardisé marqué au marché. Pour la démo cash P&L, payoff linéaire équivalent au forward (hors marges).",
    formula: "P&L ≈ N × (F_t − F_0)  → converge vers N × (S_T − F_0)",
    use: "Liquidité, transparence du prix ; appels de marge quotidiens en environnement réel.",
    risks: "Risque de liquidité / marge ; basis éventuel vs OTC.",
  },
];

export default function InstrumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">Instruments</h1>
        <p className="mt-1 max-w-2xl text-sm text-bank-500">
          Fiches pédagogiques destinées au dialogue commercial avec un trésorier
          corporate. Les formules sont implémentées dans{" "}
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
              <span className="shrink-0 rounded-full bg-bank-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bank-700">
                {ins.badge}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-bank-600">
              {ins.summary}
            </p>
            <div className="mt-4 rounded-lg bg-bank-50 px-3 py-2 font-mono text-xs text-bank-800">
              {ins.formula}
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

      <div className="card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-bank-600">
          Le scénario <strong>Non couvert</strong> reste toujours affiché comme
          baseline dans le simulateur.
        </p>
        <Link href="/simulateur" className="btn-primary shrink-0">
          Simuler un besoin
        </Link>
      </div>
    </div>
  );
}
