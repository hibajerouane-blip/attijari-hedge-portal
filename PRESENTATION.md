# Pitch encadrante — HedgeDesk Demo (≈ 2 min)

Script oral pour présenter le portail de couverture FX (stage desk commercial).

---

## 1. Accroche (15 s)

> « HedgeDesk est un portail **pédagogique** pour clients corporate : il aide un
> conseiller FX à expliquer et comparer des couvertures EUR/MAD et USD/MAD —
> forward, option, tunnel et futures — face à l’exposition non couverte. »

Rappeler : cotations BAM (historique) + Yahoo (spot), pas une offre bancaire.

---

## 2. Parcours démo live (60–70 s)

1. **Login** — `client@demo.ma` / `Demo2026!`  
   Session httpOnly (JWT) ; middleware protège les pages.

2. **Tableau de bord** — cotations EUR/MAD & USD/MAD + value prop corporate.  
   Mini-historiques / page Marché : historique Bank Al-Maghrib, spot Yahoo.

3. **Instruments** — fiches « quand utiliser » chaque produit (pédagogie desk).

4. **Simulateur** (cœur de la démo)  
   - Profil *Importateur* ou *Exportateur*, notionnel, horizon, choc de spot.  
   - Courbes P&L : **5 trajectoires distinctes** (non couvert, forward, option,
     tunnel, futures).  
   - Tableau classé + encadré **recommandation pédagogique**.

5. **Comparer** — mêmes payoffs, toggles par instrument.  
6. **Marché** — historique 1M → 2Y, min/max/perf.

---

## 3. Formules (25 s)

| Instrument | Formule / logique |
|------------|-------------------|
| **Forward** | Parité des taux (IRP) : \(F = S\,e^{(r_{\mathrm{MAD}}-r_{\mathrm{FX}})T}\) |
| **Option** | Garman-Kohlhagen (call import / put export), strike ATM forward |
| **Tunnel** | Collar zéro-coût : strikes calibrés pour prime nette ≈ 0 ; taux ∈ \([K_{put}, K_{call}]\) |
| **Futures** | Proche du forward + **basis listé** + **coût de marge** (pour le distinguer de l’OTC) |
| **Non couvert** | Baseline linéaire vs \(S_T\) |

Convention P&L : résultat en MAD vs spot initial \(S_0\) (primes capitalisées).

---

## 4. Message de clôture (15 s)

> « L’outil montre le **coût du risque** et le **trade-off** protection /
> flexibilité / prime. Il est conçu pour un entretien commercial pédagogique —
> pas pour du pricing de production. »

Identifiants démo à laisser visibles à l’écran pendant la présentation.

---

## Checklist avant la soutenance

- [ ] `npm run build` OK
- [ ] Login → Simulateur → Comparer en moins de 90 s
- [ ] Sur un choc +5 % (importateur) : montrer la différence non couvert vs forward / option
- [ ] Mentionner le disclaimer pied de page et les sources (BAM / Yahoo)
