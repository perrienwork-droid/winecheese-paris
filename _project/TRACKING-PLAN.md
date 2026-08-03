# Plan de tracking Plausible, winecheese.paris

Ce document decrit le tracking mis en place pour mesurer l'entonnoir de la
demande de dégustation privée (contact.html), et les intentions clés
ailleurs sur le site. Objectif business : comprendre où les visiteurs
abandonnent avant d'envoyer une demande, et pourquoi les demandes de
dégustation privée restent rares.

## 1. Architecture

Un seul module partagé, [`analytics.js`](../analytics.js), chargé sur
toutes les pages juste après le stub Plausible et avant le script officiel :

```html
<script>
window.plausible = window.plausible || function() {
  (window.plausible.q = window.plausible.q || []).push(arguments) }
</script>
<script defer src="analytics.js"></script>
<script defer data-domain="winecheese.paris" src="https://plausible.io/js/script.js"></script>
```

`analytics.js` expose `window.WCAnalytics.track(name, props, opts)` :

- ne lève jamais d'exception, quel que soit le contexte
- n'envoie rien si le hostname est `localhost` ou `127.0.0.1`
- avec `{ once: true }`, un même nom d'événement ne part qu'une fois par
  chargement de page (utilisé pour les étapes d'entonnoir)
- ne prend jamais l'email, le nom, le téléphone, le message ou la date en
  props : uniquement des catégories (type de demande, taille de groupe,
  page, motif d'échec, nom de champ, libellé de question)

Les événements `CTA: *`, `Outbound: *` et `FAQ: Opened` sont posés une
seule fois, par délégation sur `document`, et fonctionnent donc
automatiquement sur toutes les pages qui chargent `analytics.js`, sans
code supplémentaire à écrire par page. L'entonnoir `Enquiry: *` est câblé
spécifiquement dans `contact.html`, car il a besoin du DOM du formulaire.

## 2. Tableau des événements

| Événement | Déclencheur | Props | Page(s) | Question business |
|---|---|---|---|---|
| `Enquiry: Form Viewed` | Le formulaire entre dans le viewport (IntersectionObserver, seuil 30%), une fois par page | — | contact.html | Combien de visiteurs de la page contact voient réellement le formulaire ? |
| `Enquiry: Form Started` | Premier focus sur un champ du formulaire, une fois par page | — | contact.html | Combien commencent à remplir ? |
| `Enquiry: Type Selected` | Changement du select "Type of enquiry" | `type` (valeur du select, ex. `private-couples`) | contact.html | Quels types de demande sont les plus fréquents ? |
| `Enquiry: Group Size Selected` | Changement du select "Group size" | `size` (valeur du select, ex. `3-4`) | contact.html | Quelles tailles de groupe demandent une dégustation privée ? |
| `Enquiry: Submit Attempted` | Clic sur "Send message", avant l'appel réseau | — | contact.html | Combien de personnes vont jusqu'au clic d'envoi ? |
| `Enquiry: Submitted` | Le serveur confirme le succès | `type`, `size` | contact.html | Combien de demandes aboutissent, et de quel profil ? |
| `Enquiry: Failed` | Échec de l'envoi | `reason` : `network` \| `server` \| `validation` | contact.html | Le formulaire échoue-t-il techniquement, et pour quelle raison ? |
| `Enquiry: Abandoned` | `pagehide` ou passage en `hidden`, si le formulaire a été démarré mais pas envoyé | `lastField` (id du dernier champ touché) | contact.html | À quel champ les gens abandonnent-ils le plus souvent ? |
| `CTA: Book Now` | Clic sur un déclencheur de réservation du tour public (`data-book="walk"`) | `page` (chemin de la page) | Toutes | D'où viennent les intentions de réservation du tour public ? |
| `CTA: Contact` | Clic sur n'importe quel lien vers contact.html | `page` (chemin de la page) | Toutes | Quelles pages génèrent le plus d'intentions de contact ? |
| `Outbound: Mailto` | Clic sur un lien `mailto:` | — | Toutes | Combien préfèrent contacter par email direct plutôt que le formulaire ? |
| `Outbound: Phone` | Clic sur un lien `tel:` | — | Toutes | Combien préfèrent appeler ? (aucun lien `tel:` actif sur le site pour l'instant, prêt pour quand un numéro sera publié) |
| `Outbound: Booking` | Clic sur un lien sortant vers un système de réservation externe (ticketinghub.com, bokun.io, etc.) | — | Toutes | Y a-t-il un système de réservation tiers utilisé en dehors du widget intégré ? (non atteignable actuellement, le widget TicketingHub est intégré en popover, pas en lien sortant) |
| `FAQ: Opened` | Ouverture d'une question FAQ | `question` (libellé anglais, tronqué à 80 caractères) | Pages avec FAQ (contact, wine-cheese-walk, food-tour) | Quelles questions reviennent le plus, et donc quoi clarifier en amont ? |

### Événements existants, non modifiés

`booking.js` pose déjà un événement `Booking widget opened` avec la props
`product` (`walk` ou `private`) à l'ouverture du popover TicketingHub. Ce
n'est pas un événement de ce plan mais il continuera d'apparaître dans le
dashboard : il mesure l'ouverture réelle du widget, alors que `CTA: Book
Now` (ce plan) mesure l'intention de clic, même quand le widget n'est pas
encore configuré pour un produit donné.

### Estimateur de prix (à venir, inactif)

Les appels sont écrits et commentés dans `analytics.js`, prêts à
décommenter dès que la fonctionnalité existe, sans autre changement :

`Estimator: Opened`, `Estimator: Group Size Changed` (`size`),
`Estimator: Venue Changed` (`venue`), `Estimator: Price Shown` (`bracket`),
`Estimator: CTA Clicked`.

## 3. Objectifs à créer dans Plausible

Les props personnalisées et les funnels Plausible nécessitent le plan
Business. En attendant, chaque nom d'événement ci-dessous doit exister
comme **objectif personnalisé** (Custom event goal) pour apparaître dans
le dashboard, avec un nom **exactement identique**, sensible à la casse.

Dans Plausible : **Site Settings → Goals → Add goal → Custom event**,
coller le nom, **Add goal**. Répéter dans cet ordre (l'ordre reflète
l'entonnoir, pour lire les compteurs de haut en bas comme des paliers) :

1. `Enquiry: Form Viewed`
2. `Enquiry: Form Started`
3. `Enquiry: Type Selected`
4. `Enquiry: Group Size Selected`
5. `Enquiry: Submit Attempted`
6. `Enquiry: Submitted`
7. `Enquiry: Failed`
8. `Enquiry: Abandoned`
9. `CTA: Book Now`
10. `CTA: Contact`
11. `Outbound: Mailto`
12. `Outbound: Phone`
13. `Outbound: Booking`
14. `FAQ: Opened`

Sur le plan gratuit, l'entonnoir se reconstruit manuellement en comparant
les compteurs de conversion de chaque objectif sur la même période : par
exemple `Enquiry: Form Viewed` = 100, `Enquiry: Form Started` = 40,
`Enquiry: Submitted` = 12 donne un taux de démarrage de 40% et un taux de
complétion de 30% une fois démarré.

**Si vous passez au plan Business plus tard**, activez en plus, dans
**Site Settings → Properties**, les clés de props suivantes pour qu'elles
deviennent filtrables/consultables en détail (limite de clés selon le
palier Business, à vérifier au moment venu) : `type`, `size`, `page`,
`reason`, `lastField`, `question`. Aucun changement de code n'est
nécessaire : les props sont déjà envoyées dans chaque appel, elles sont
juste ignorées par Plausible tant que le plan ne les active pas.

## 4. Protocole de test manuel

À faire sur le site déployé (pas en local, le tracking est
volontairement coupé sur `localhost`/`127.0.0.1`). Garder le dashboard
Plausible de winecheese.paris ouvert dans un autre onglet, filtré sur
aujourd'hui, avec la liste des objectifs (Goal Conversions) visible : les
compteurs s'incrémentent en général en quelques secondes.

### Test A, parcours complet réussi

1. Ouvrir `contact.html` dans un nouvel onglet, navigateur normal.
2. Faire défiler jusqu'au formulaire de contact.
   → `Enquiry: Form Viewed` +1
3. Cliquer dans le champ "First name".
   → `Enquiry: Form Started` +1
4. Choisir un type de demande dans "Type of enquiry".
   → `Enquiry: Type Selected` +1
5. Choisir une taille de groupe.
   → `Enquiry: Group Size Selected` +1
6. Remplir les champs obligatoires (prénom, nom, email, type, message) et
   cliquer "Send message".
   → `Enquiry: Submit Attempted` +1, puis `Enquiry: Submitted` +1
7. Vérifier que le bloc "Message sent!" s'affiche normalement.

### Test B, abandon

1. Recharger `contact.html`.
2. Cliquer dans un champ du formulaire (par exemple "Email"), sans
   l'envoyer.
3. Fermer l'onglet ou naviguer vers une autre page du site.
   → `Enquiry: Abandoned` +1, avec `lastField` = `email`

### Test C, échec réseau

1. Recharger `contact.html`, ouvrir les DevTools, onglet Réseau, passer en
   mode **Offline**.
2. Remplir le formulaire et cliquer "Send message".
3. Vérifier que l'alerte "Something went wrong. Email hello@winecheese.paris
   directly." s'affiche, et que le bouton reprend son état normal
   ("Send message", cliquable).
4. Repasser en ligne. Le passage offline empêche aussi l'appel Plausible
   de partir au moment précis de l'échec (perte partielle acceptée par
   design, cf. section 5) : ce test valide surtout le comportement visible
   du formulaire, pas la remontée de l'événement.

### Test D, bloqueur de publicité actif (test prioritaire, le bug corrigé)

1. Activer un bloqueur de publicité (uBlock Origin ou équivalent) sur le
   navigateur de test.
2. Recharger `contact.html`. Ouvrir la console (F12) : aucune erreur
   JavaScript ne doit apparaître. Dans l'onglet Réseau, confirmer que la
   requête vers `plausible.io/js/script.js` (et éventuellement
   `analytics.js` selon les filtres du bloqueur) est bien bloquée.
3. Remplir le formulaire normalement et cliquer "Send message".
4. **Vérifier que le message de succès "Message sent!" s'affiche**, et que
   l'alerte "Something went wrong" **n'apparaît pas**. C'est le
   comportement qui était cassé avant le correctif.
5. Il est normal qu'aucun événement Plausible ne remonte pendant ce test.

### Test E, intentions site-wide

1. Sur la page d'accueil, cliquer "Book Now" dans le header.
   → `CTA: Book Now` +1, `page` = `/index.html` (ou `/`)
2. Cliquer un lien vers "Request a quote" ou tout lien menant à
   contact.html.
   → `CTA: Contact` +1
3. Sur contact.html, cliquer le lien email `hello@winecheese.paris`.
   → `Outbound: Mailto` +1
4. Ouvrir une question dans la section FAQ.
   → `FAQ: Opened` +1, avec `question` = le libellé anglais de la question

### Test F, environnement de développement

1. Servir le site en local (`python3 -m http.server`, ou équivalent) et
   ouvrir `http://localhost:...`.
2. Interagir normalement avec le formulaire et les liens.
3. Vérifier dans l'onglet Réseau qu'aucune requête ne part vers
   `plausible.io` pendant toute la session : le garde-fou localhost
   fonctionne.

## 5. Limites connues et choix assumés

- **Perte partielle acceptée sur `Enquiry: Abandoned`** : l'événement part
  sur `pagehide`/`visibilitychange`, en s'appuyant sur le comportement du
  script Plausible officiel au moment du déchargement de la page. Sur une
  coupure réseau brutale ou un onglet tué par l'OS (mobile, faible
  mémoire), l'événement peut ne pas partir. C'est un compromis assumé :
  bloquer la navigation pour garantir l'envoi n'est pas acceptable.
- **`reason: "validation"`** n'est déclenché que si l'API `/api/contact`
  renvoie explicitement `{ error: "validation" }` dans un JSON de succès
  `false`. Si le format de réponse du serveur est différent, tous les
  échecs applicatifs remontent en `reason: "server"` par défaut. À ajuster
  si besoin une fois le contrat exact de l'API confirmé.
- **`Outbound: Booking`** n'a aujourd'hui aucun lien réel à détecter (le
  widget TicketingHub s'ouvre en popover via `data-book`, pas via un lien
  sortant). L'événement est câblé et prêt si un lien de réservation externe
  apparaît un jour (ex. page conciergerie avec lien direct vers un
  partenaire).
- **`Outbound: Phone`** est câblé (détection de tout lien `tel:`) mais
  aucun numéro n'est publié sur le site actuellement.
- Les props (`type`, `size`, `page`, `reason`, `lastField`, `question`)
  sont envoyées dans tous les cas, mais restent invisibles dans le
  dashboard tant que le plan Plausible Business n'est pas actif et que les
  clés ne sont pas ajoutées dans Site Settings → Properties (voir section
  3).

## 6. Fichiers modifiés

- [`analytics.js`](../analytics.js) : nouveau module partagé
- [`contact.html`](../contact.html) : stub Plausible, chargement
  d'analytics.js, correctif du bug de tracking, câblage de l'entonnoir
  `Enquiry: *`, correctif de l'option "1-2"
- [`index.html`](../index.html), [`about.html`](../about.html),
  [`wine-cheese-walk.html`](../wine-cheese-walk.html),
  [`food-tour.html`](../food-tour.html) : stub Plausible et chargement
  d'analytics.js dans le head
