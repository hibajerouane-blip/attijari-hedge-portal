import Link from "next/link";

const INSTRUMENTS = [
  {
    name: "Change à terme (forward)",
    tag: "Le plus simple",
    color: "border-l-brand-ink",
    tagBg: "bg-bank-100 text-bank-800",
    logic:
      "Vous fixez dès aujourd'hui le cours auquel vous achèterez ou vendrez votre devise à une date future (par exemple dans 3 mois). Le jour J, vous appliquez ce cours convenu — pas le cours du marché du moment.",
    advantages: [
      "Budget connu à l'avance : vous savez exactement ce que coûtera (ou rapportera) votre devise",
      "Aucun paiement de prime au départ",
      "Simple à expliquer et à suivre en trésorerie",
    ],
    risks: [
      "Vous êtes engagé : vous devez exécuter au cours fixé, même si le marché devient plus favorable",
      "Si le cours spot évolue dans votre sens, vous ne profitez pas de cette amélioration",
    ],
    offers: [
      "Facture ferme avec date de paiement connue",
      "Besoin de sécuriser un prix de vente ou un coût d'achat",
      "Entreprise qui privilégie la certitude plutôt que la flexibilité",
    ],
  },
  {
    name: "Option de change",
    tag: "Protection souple",
    color: "border-l-brand-red",
    tagBg: "bg-brand-red-soft text-brand-red-dark",
    logic:
      "Vous achetez le droit (pas l'obligation) d'échanger à un cours maximum ou minimum convenu. Si le marché est plus avantageux le jour J, vous laissez l'option de côté et vous prenez le meilleur cours. En contrepartie, vous payez une prime.",
    advantages: [
      "Vous êtes protégé contre le mauvais scénario",
      "Vous gardez le bénéfice si le cours évolue en votre faveur",
      "Utile quand le montant ou la date du flux n'est pas encore certain",
    ],
    risks: [
      "La prime a un coût, payé même si vous n'utilisez pas l'option",
      "Plus la protection est forte (ou la période longue), plus la prime peut être élevée",
    ],
    offers: [
      "Appel d'offres, commande probable mais pas encore signée",
      "Volume de devises encore incertain",
      "Client qui veut une assurance tout en gardant l'opportunité d'un meilleur cours",
    ],
  },
  {
    name: "Tunnel de change",
    tag: "Sans prime nette",
    color: "border-l-brand-orange",
    tagBg: "bg-brand-orange-soft text-brand-orange-dark",
    logic:
      "Vous définissez une « zone » de cours : un plancher et un plafond. À l'intérieur de cette zone, vous suivez le marché. En dessous ou au-dessus, vous êtes ramené aux bornes du tunnel. En pratique, la protection est souvent financée en cédant une partie du gain potentiel — d'où une prime nette proche de zéro.",
    advantages: [
      "Protection contre les mouvements extrêmes, sans (ou presque sans) débourser de prime",
      "Budget encadré : vous connaissez le pire et le meilleur cours possibles",
      "Compromis fréquent entre certitude totale (terme) et option payante",
    ],
    risks: [
      "Vous abandonnez une partie du gain si le cours dépasse fortement la borne favorable",
      "Le résultat est borné : moins de surprise mauvaise, mais aussi moins de surprise bonne",
    ],
    offers: [
      "Client qui ne souhaite pas payer de prime d'option",
      "Besoin d'un corridor de change pour le budget (min / max)",
      "Flux réguliers où un encadrement suffit",
    ],
  },
  {
    name: "Futures de change",
    tag: "Marché listé",
    color: "border-l-violet-600",
    tagBg: "bg-violet-50 text-violet-700",
    logic:
      "Comme un change à terme, vous vous engagez sur un cours futur, mais via un contrat standardisé sur un marché organisé. Le contrat est réévalué régulièrement : selon l'évolution du marché, vous pouvez devoir déposer ou récupérer des fonds (appels de marge).",
    advantages: [
      "Cours et liquidité souvent plus transparents (marché public)",
      "Possibilité de sortir ou d'ajuster plus facilement qu'un contrat bilatéral",
      "Utile pour comparer avec une offre de change à terme de la banque",
    ],
    risks: [
      "Appels de marge : besoin de liquidité même si le besoin métier n'a pas changé",
      "Le contrat est standardisé (montants, dates) — moins « sur mesure » qu'un forward bancaire",
      "Écart possible entre le futures et le cours que vous obtiendriez en OTC",
    ],
    offers: [
      "Trésorerie équipée pour gérer les appels de marge",
      "Besoin de flexibilité / liquidité d'un marché listé",
      "Comparaison entre solution banque (OTC) et solution marché",
    ],
  },
];

export default function InstrumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-bank-900">Instruments</h1>
        <p className="mt-1 max-w-2xl text-sm text-bank-500">
          Comprendre en langage simple comment chaque solution protège votre
          exposition en devises : logique, avantages, risques, et dans quels
          cas votre desk vous la propose.
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
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ins.tagBg}`}
              >
                {ins.tag}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-red">
                En pratique
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-bank-600">
                {ins.logic}
              </p>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-bank-400">
                Avantages
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-bank-700">
                {ins.advantages.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-bank-400">
                Risques / points d&apos;attention
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-bank-700">
                {ins.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-bank-400">
                Pour qui / quand on le propose
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-bank-700">
                {ins.offers.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="card flex flex-col items-start gap-3 border-brand-orange/30 bg-gradient-to-r from-white to-brand-orange-soft/40 p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-bank-600">
          Dans le simulateur, vous pouvez comparer ces solutions au scénario{" "}
          <strong>sans couverture</strong>, pour voir concrètement l&apos;impact
          sur votre résultat.
        </p>
        <Link href="/simulateur" className="btn-primary shrink-0">
          Simuler mon besoin
        </Link>
      </div>
    </div>
  );
}
