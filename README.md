# HedgeDesk Demo — Couverture FX (Démo Stage)

Portail client corporate de démonstration pour un **desk commercial FX** : exploration d’instruments de couverture, simulations de P&L, comparaison de payoffs et historique de marché EUR/MAD & USD/MAD.

> Produit pédagogique nommé **HedgeDesk Demo** / **Couverture FX — Démo Stage**.  
> Aucun logo ni marque Attijariwafa Bank n’est utilisé.

## Démarrage rapide

```bash
cd attijari-hedge-portal
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Build de production :

```bash
npm run build
npm start
```

### Identifiants démo

| Champ        | Valeur        |
|--------------|---------------|
| Identifiant  | `client@demo.ma` |
| Mot de passe | `Demo2026!`   |

Session : cookie **httpOnly** signé (JWT via `jose`), `SameSite=Lax`.

## Architecture

```
src/
├── app/                    # App Router (pages + API)
│   ├── login/              # Connexion
│   ├── instruments/        # Fiches pédagogiques
│   ├── simulateur/         # Formulaire + courbes P&L
│   ├── comparer/           # Payoffs côte à côte
│   ├── marche/             # Historique 1M→2Y
│   └── api/
│       ├── auth/           # login, logout, me
│       └── market/[pair]/ # EURMAD | USDMAD
├── components/             # UI (charts Recharts, shell)
├── lib/
│   ├── pricing/            # Math pure (IRP, GK, tunnel, P&L)
│   ├── auth.ts             # Session JWT
│   ├── market.ts           # Série synthétique 2 ans
│   └── constants.ts
└── middleware.ts           # Protection des routes
```

Stack : **Next.js 14 (App Router)**, TypeScript, Tailwind CSS, Recharts, jose.  
Pas de base de données : utilisateurs mock + marché en mémoire.

## Formules (module `lib/pricing/`)

### Forward — parité des taux (IRP)

\[
F = S \cdot e^{(r_{\mathrm{MAD}} - r_{\mathrm{FX}}) \cdot T}
\]

### Call / Put — Garman-Kohlhagen

\[
C = S e^{-r_f T} N(d_1) - K e^{-r_d T} N(d_2)
\]

avec \(d_1, d_2\) classiques (volatilité \(\sigma\)).

### Tunnel — collar zéro-coût

Achat d’une option de protection + vente de l’option opposée ; strikes recherchés pour **prime nette ≈ 0**. Taux effectif borné dans \([K_{\mathrm{put}}, K_{\mathrm{call}}]\).

### Futures

Payoff linéaire proche du forward IRP, avec un **basis listé** et un **coût de marge**
pédagogiques pour distinguer le contrat listé du forward OTC.

### Baseline

**Non couvert** toujours affiché (P&L linéaire vs spot futur).

Paramètres par défaut (démo) : spots ~10,9 EURMAD / ~9,5 USDMAD ; \(r_{\mathrm{MAD}}\approx 2{,}75\%\), EUR ~3,5 %, USD ~4,5 % ; vol 8–12 % (réglable dans le simulateur).

## API marché

```
GET /api/market/EURMAD
GET /api/market/USDMAD
```

Réponse : spot, variation J-1, historique OHLC-ish ~730 jours, label  
« **données de démo / référence BAM-like** ».

Stub optionnel : variable d’environnement `BAM_API_KEY` (voir `.env.example`) — non branchée sur un endpoint réel.

## Sécurité (niveau démo)

- Authentification obligatoire (middleware)
- Cookie de session httpOnly + signature HMAC
- En-têtes type Helmet dans `next.config.mjs` (CSP, X-Frame-Options, nosniff, Referrer-Policy…)
- Aucun secret de production dans le dépôt (utiliser `.env.local`)

### Limites vs production bancaire

| Démo | Production banque |
|------|-------------------|
| User/mot de passe hardcodés | IAM / SSO / MFA / carnets clients |
| Données synthétiques | Flux Bloomberg / Refinitiv / BAM officiels |
| Pricing pédagogique (GK fermé) | Moteurs validés, smiles, ajustements collatéral |
| Pas de CSRF token (SameSite) | CSRF + WAF + audit |
| Pas de journalisation métier | Traçabilité MIFID / conformité |
| Pas de limites de crédit | Credit check, lim. notionnel, KYC |

## Pousser vers GitHub / GitLab

```bash
# Déjà initialisé localement avec un commit initial
git remote add origin git@github.com:<org>/attijari-hedge-portal.git
# ou GitLab :
# git remote add origin git@gitlab.com:<group>/attijari-hedge-portal.git

git push -u origin main
```

Sur GitLab CI, un job minimal peut exécuter `npm ci && npm run build`.

## Scripts npm

| Script | Rôle |
|--------|------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm start` | Serveur après build |
| `npm run lint` | ESLint |

## Présentation stage

Voir [`PRESENTATION.md`](./PRESENTATION.md) — script oral ~2 min pour l’encadrante.

## Auteur

Démo de stage — desk commercial FX. Ne constitue **ni un conseil en investissement ni une offre bancaire**.
