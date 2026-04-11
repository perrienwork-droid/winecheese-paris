# Wine & Cheese Paris — Project Brief
> Fichier de référence. À lire au début de chaque session Cowork.
> Dernière mise à jour : 2026-04-03

---

## Le Projet

**Nom** : Wine & Cheese Paris
**URL actuelle** : https://winecheese-paris.netlify.app/
**URL cible** : https://winecheese.paris (en cours d'acquisition)
**Repo GitHub** : https://github.com/perrienwork-droid/winecheese-paris
**Hébergement actuel** : Netlify (auto-deploy depuis GitHub)
**Hébergement futur** : OVH Cloud VPS + Dokploy

**Fondateur** : Thomas Perrien
**Email** : hello@winecheese.paris
**Contact Claude** : perrien.work@gmail.com

---

## Le Business

Tours de vins & fromages à Paris (Montmartre / SoPi), conduits par Thomas.

**Les 3 tours :**
1. Wine & Cheese Walk — €75/pers., 2h30, 2–8 pers. (Bestseller)
2. Montmartre Food Tour — €65/pers., 3h, 2–6 pers. (Nouveau)
3. Private Tasting — €120/pers., 2h, 2–12 pers. (Privé)

**Réservations** : Bokun (compte actif) + Viator (marketplace principale)
**Analytics** : Plausible (à intégrer)
**Langue principale du site** : Anglais (avec bascule FR)

---

## Thomas — Faits Biographiques Vérifiés

- Vit à Pigalle depuis de nombreuses années (ne pas dire "né à Paris")
- Ne pas dire "Native Parisian" → dire "Real Parisian"
- Ne pas faire référence à l'enfance dans le 9e ou Rue des Martyrs
- Ne pas dire "grew up in the 9th"
- N'a PAS travaillé dans l'hôtellerie → "after years animating wine tastings for friends and corporate events, and carrying many wine trips across Europe and the world"
- N'a PAS la certification "guide-conférencier" (certification gouvernementale régulée) → ne jamais mentionner
- Est **WSET Certified** (Level 3) — ne jamais écrire "WSET Level 3" en public, toujours "WSET Certified"
- A une micro-entreprise enregistrée, code APE 79.90.20, déclaration CERFA déposée
- Slogan approuvé : **"Small groups, big flavors"** — à utiliser dans plusieurs endroits

---

## Règles Éditoriales (à respecter absolument)

- ❌ Ne jamais utiliser le tiret long "—" (em dash). Remplacer par : deux-points, virgule, parenthèses
- ❌ Ne jamais mentionner "guide-conférencier" ni "guide conférencier"
- ❌ Ne jamais écrire "WSET Level 3" (utiliser "WSET Certified")
- ❌ Ne jamais écrire "Native Parisian" (utiliser "Real Parisian")
- ❌ Ne jamais mentionner l'hôtellerie comme background professionnel
- ❌ Pas de numéro de téléphone sur le site
- ✅ Groupes privés : jusqu'à 12 personnes max
- ✅ Groupes publics : max 8 personnes

---

## Stack Technique

**Type** : Site statique HTML/CSS/JS (no framework, no database)
**Fichiers** :
- `index.html` — Homepage (1188 lignes)
- `about.html` — Page Thomas (270 lignes)
- `contact.html` — Contact + Private Events (343 lignes)
- `wine-cheese-walk.html` — Page tour 1
- `food-tour.html` — Page tour 2
- `shared.css` — Styles communs
- `nav.js` — Navigation JS
- `images/` — 23 images JPG

**Design tokens** :
- Wine: #722F37 | Cream: #FAF6F1 | Gold: #C9A96E | Gold-text: #7A6340
- Charcoal: #2C2C2C | Slate: #4A4A4A | Dark-wine: #4A1A20
- Fonts: Playfair Display (titres), DM Sans (corps), Cormorant Garamond (accents)

---

## Décisions Techniques Prises

| Décision | Choix | Raison |
|----------|-------|--------|
| Réservations | Bokun | Intégration native Viator |
| Analytics | Plausible | RGPD-compliant |
| Marketplace | Viator | Principal canal de vente |
| Social | Instagram + Viator (reviews) | Pas encore de compte TripAdvisor séparé |
| Hébergement futur | OVH Cloud VPS + Dokploy | Domaine + VPS même provider |
| Domaine | winecheese.paris | En cours d'achat OVH |
| Deploy | GitHub → Netlify (actuel) → Dokploy (futur) | Auto-deploy via GitHub |
| Multi-ordinateurs | GitHub Desktop | Synchronisation cross-machine |

---

## Roadmap (par priorité)

### Sprint 1 — Corrections immédiates (en cours)
- [x] Corriger tous les textes homepage (Thomas bio, WSET, Abbesses, em-dash, etc.)
- [x] Hero image fixe (no parallax)
- [x] Logo spacing
- [x] "saying" lisible (gold sur fond sombre)
- [x] Corriger page About (bio, credentials, CTA 3 boutons)
- [x] Corriger contact FAQ (12 spots)
- [ ] Intégrer le widget Bokun (attendre ID widget)
- [ ] Ajouter Plausible analytics

### Sprint 2 — Infrastructure
- [ ] Acheter domaine winecheese.paris chez OVH
- [ ] Créer compte OVH Cloud VPS
- [ ] Installer Dokploy sur VPS
- [ ] Configurer DNS winecheese.paris → VPS
- [ ] SSL/HTTPS automatique (Let's Encrypt via Dokploy)
- [ ] Installer GitHub Desktop sur toutes les machines

### Sprint 3 — Contenu & Photos
- [ ] Ajouter photo portrait Thomas (en attente de fichier)
- [ ] Générer/ajouter 3 photos manquantes page About
- [ ] Créer compte Instagram @winecheeseparis
- [ ] Connecter Viator reviews au site

---

## Photos Manquantes (page About)

1. **Boulangerie partner card** → utiliser `images/boulangerie-four.jpg` (déjà disponible)
2. **Cred card 2 "Professional Tour Operator"** → à générer
3. **Cred card 3 "Years in Pigalle"** → utiliser `images/rue-martyrs.jpg` ou générer

---

## Comment Utiliser Ce Fichier

Au début de chaque session Cowork, dis à Claude : "Lis le BRIEF.md". Claude lira ce fichier et aura le contexte complet du projet sans que tu aies à tout réexpliquer.
