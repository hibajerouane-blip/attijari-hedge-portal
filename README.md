# Attijari Marchés — Couverture de change

Portail client corporate pour un **desk commercial FX** : exploration d’instruments de couverture, simulations de P&L, comparaison de payoffs et cotations réelles EUR/MAD & USD/MAD.

## Démarrage rapide

```bash
cd attijari-hedge-portal
npm install
npm run sync:market   # optionnel : pré-remplit data/market.db
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Sans sync préalable, le **premier** `GET /api/market/...` remplit la base (lazy).

Build de production :

```bash
npm run build
npm start
```

### Identifiants

| Champ        | Valeur           |
|--------------|------------------|
| Identifiant  | `client@demo.ma` |
| Mot de passe | `Demo2026!`      |

Session : cookie **httpOnly** signé (JWT via `jose`), `SameSite=Lax`. Inchangés.

## Cotations marché (réelles)

| Rôle | Source | Fréquence |
|------|--------|-----------|
| Historique OHLC / chartes | **Bank Al-Maghrib** via [Frankfurter](https://www.frankfurter.app/) (`api.frankfurter.dev`) | **1× / jour** (cours de référence / transfer rates) |
| Spot affiché | **Yahoo Finance** (`EURMAD=X`, `USDMAD=X`) | Plus fréquent (intraday) ; rafraîchi côté UI Marché toutes les **60 s** |
| Repli spot | Dernier close BAM en SQLite (ou endpoint BAM du jour) | Si Yahoo indisponible |

BAM ne publie qu’une fois par jour : le spot BAM ne bouge pas à la minute. Yahoo permet un rafraîchissement utile entre deux publications.

Persistance : fichier SQLite **`data/market.db`** (`better-sqlite3`). Le dossier `data/` est versionné via `.gitkeep` ; la DB elle-même est ignorée par git et se remplit au runtime / `npm run sync:market`.

Schéma :

- `fx_bars(pair, date, open, high, low, close, source)` — pour BAM daily : open=high=low=close=rate
- `fx_meta(pair, spot, as_of, source, updated_at)`

API :

```
GET  /api/market/EURMAD   # ensureMarketData + snapshot
GET  /api/market/USDMAD
POST /api/market/sync     # force sync BAM + Yahoo (auth requise)
```

Les taux / vols de pricing (`rMad`, `rEur`, `rUsd`, vols) restent des constantes pédagogiques (pas de feed taux).

## Architecture

```
src/
├── app/                    # App Router (pages + API)
│   ├── login/
│   ├── instruments/
│   ├── simulateur/
│   ├── comparer/
│   ├── marche/             # Historique 1M→2Y + refresh spot 60s
│   └── api/
│       ├── auth/
│       └── market/         # [pair] + sync
├── components/
├── lib/
│   ├── pricing/
│   ├── auth.ts
│   ├── market/             # SQLite + Frankfurter BAM + Yahoo
│   └── constants.ts
└── middleware.ts
data/market.db              # créé au sync / premier GET
scripts/sync-market.ts
```

Stack : **Next.js 14 (App Router)**, TypeScript, Tailwind CSS, Recharts, jose, **better-sqlite3**.

## Formules (module `lib/pricing/`)

### Forward — parité des taux (IRP)

\[
F = S \cdot e^{(r_{\mathrm{MAD}} - r_{\mathrm{FX}}) \cdot T}
\]

### Call / Put — Garman-Kohlhagen

\[
C = S e^{-r_f T} N(d_1) - K e^{-r_d T} N(d_2)
\]

### Tunnel — collar zéro-coût

Achat d’une option de protection + vente de l’option opposée ; strikes recherchés pour **prime nette ≈ 0**.

### Futures

Payoff linéaire proche du forward IRP, avec basis listé et coût de marge pédagogiques.

### Baseline

**Non couvert** toujours affiché (P&L linéaire vs spot futur).

## Sécurité

- Authentification obligatoire (middleware)
- Cookie de session httpOnly + signature HMAC
- En-têtes type Helmet dans `next.config.mjs`
- Aucun secret de production dans le dépôt (utiliser `.env.local`)

## Scripts npm

| Script | Rôle |
|--------|------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm start` | Serveur après build |
| `npm run lint` | ESLint |
| `npm run sync:market` | Pré-remplit `data/market.db` (BAM + Yahoo) |

## Présentation

Voir [`PRESENTATION.md`](./PRESENTATION.md).

## Auteur

Espace client desk commercial FX. Ne constitue **ni un conseil en investissement ni une offre bancaire**.
