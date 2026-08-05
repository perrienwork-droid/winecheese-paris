# Prompt à coller dans Claude Code, mise en place des Stripe Payment Links

À lancer depuis `/Users/thomas/Dev/thomas-os/workstreams/wine-and-cheese/winecheese`.
Le prompt est écrit pour une session neuve qui ne connaît rien du contexte.

---

## Le prompt

```
Contexte.

Repo : winecheese.paris, site statique en HTML, déployé par push sur main (Dokploy).
Fichiers existants utiles : index.html, wine-cheese-walk.html, food-tour.html,
contact.html, shared.css, analytics.js, nav.js, _project/TRACKING-PLAN.md.

Je crée une nouvelle page produit : private-wine-tasting-for-two.html.
Toute la copie anglaise, les métadonnées, le JSON-LD et les libellés exacts des
créneaux sont déjà écrits et validés dans _project/PAGE-COUPLE.md. Lis ce fichier
en entier avant de faire quoi que ce soit. Ne réécris aucun texte anglais, ne
change aucun prix, ne change aucun libellé de créneau. C'est un livrable figé.

Le produit : une dégustation vin et fromage privée, 2 heures, 2 convives,
390 EUR au total, dans la cave de la Cave Les Piqueurs, 6 rue Tardieu, Paris 18e.

Ce que je te demande.

Brancher le paiement Stripe sur les trois boutons de créneau de cette page, et me
laisser une procédure que je peux suivre seul chaque semaine pour faire tourner
les dates. Je ne suis pas développeur et je ne connais pas Stripe en profondeur.

Décisions déjà prises, ne les rediscute pas.

1. UN SEUL Stripe Payment Link pour toute la page, pas un par créneau.
   Raison : un Payment Link est attaché à un produit et à un prix, pas à une date.
   Un lien par créneau daté voudrait dire trois nouveaux liens à créer chaque
   semaine, et des liens périmés qui restent payables après la date. Un seul lien,
   avec le créneau transporté dans la query string du bouton, ne demande aucune
   maintenance dans Stripe.
2. Le créneau voyage dans l'URL du bouton, pas dans Stripe.
   Chaque bouton pointe vers le même lien avec un identifiant de créneau en
   paramètre, par exemple :
   https://buy.stripe.com/XXXX?client_reference_id=sat-2026-08-08-1100
   Format de l'identifiant : jour-annee-mois-jour-heure, en minuscules, sans
   accent. Il doit rester lisible par un humain dans le dashboard Stripe.
3. Prix en HTML statique. "€390" et les trois libellés de créneau sont écrits en
   dur dans le HTML servi. Interdit de les injecter en JavaScript, y compris via
   le dictionnaire data-en / data-fr utilisé ailleurs sur le site. Un crawler et
   un LLM doivent lire le prix dans la source, JavaScript désactivé.
4. Aucun formulaire de devis en action principale. La voie "autre date, autre
   lieu" pointe vers contact.html et reste visuellement subordonnée.
5. Pas de système de réservation, pas de backend, pas de calendrier. Le volume est
   d'une réservation à ce jour. La gestion du double booking se fait à la main, en
   retirant le créneau de la page dès qu'il est vendu.

Sécurité, à respecter strictement.

- Ne me demande jamais ma clé secrète Stripe et ne la mets nulle part dans le repo.
- Les URL en buy.stripe.com sont publiques par nature, elles peuvent être
  commitées sans problème.
- Ne crée aucun compte, ne remplis aucun formulaire Stripe à ma place, ne clique
  sur aucun bouton de validation dans le dashboard Stripe. C'est moi qui le fais.

Déroulé attendu, dans cet ordre.

ÉTAPE 0. Vérifie l'état actuel de la documentation Stripe avant de coder.
Les Payment Links évoluent. Confirme par la doc officielle, et dis-moi ce que tu
as trouvé :
- est-ce que client_reference_id peut bien être passé en paramètre d'URL sur un
  Payment Link, et où il apparaît ensuite pour moi (dashboard, email, webhook) ;
- est-ce qu'on peut préremplir un champ personnalisé (custom field) via l'URL, ou
  si client_reference_id est le seul canal fiable ;
- quels paramètres d'URL sont acceptés (prefilled_email, etc.).
Si un point n'est pas confirmé par la doc, dis-le et retiens la solution la plus
simple qui marche à coup sûr. Ne devine pas.

ÉTAPE 1. Écris-moi la marche à suivre exacte dans le dashboard Stripe pour créer
ce Payment Link, puis ARRÊTE-TOI et attends que je te donne l'URL.
Je veux une liste numérotée, avec le libellé exact de chaque champ tel qu'il
apparaît à l'écran et ce que je dois y taper. Elle doit couvrir au minimum :
- création du produit : nom, description, prix 390 EUR, paiement unique, pas
  d'abonnement, devise EUR ;
- le nom du produit tel qu'il apparaîtra sur la page de paiement et sur le relevé
  bancaire du client, en anglais, en cohérence avec la page ;
- collecte du nom et du numéro de téléphone du client, parce que je dois pouvoir
  les joindre le jour même ;
- champ personnalisé pour le prénom du deuxième convive, si c'est simple ;
- moyens de paiement à activer : cartes, Apple Pay, Google Pay et Link. Mes
  clients sont américains, sur mobile, et réservent la veille pour le lendemain.
  Un paiement qui demande de sortir sa carte physique me coûte des réservations ;
- message affiché après paiement, texte que tu me proposeras en anglais, qui dit
  que je confirme par email dans l'heure avec l'adresse exacte et mon numéro ;
- ce qu'il ne faut PAS activer et pourquoi (codes promo, quantité ajustable,
  collecte d'adresse de livraison, TVA automatique si ça complique).
Précise aussi où je retrouverai le client_reference_id une fois le paiement fait,
avec le chemin de clics, parce que c'est comme ça que je saurai quel créneau a été
acheté.

ÉTAPE 2. Quand je t'aurai donné l'URL du lien, crée la page.
- Fichier : private-wine-tasting-for-two.html, à la racine, construit sur le même
  squelette que wine-cheese-walk.html (même header, même footer, même shared.css,
  nav.js, analytics.js) pour que la page ne détonne pas.
- Reprends la copie anglaise de _project/PAGE-COUPLE.md mot pour mot, dans l'ordre
  de la section 1 : H1 et accroche, récit, ce qui se passe pendant les deux heures,
  l'hôte, le bloc prix, les créneaux, la voie secondaire, la FAQ.
- Insère le JSON-LD de la section 4 dans le head, en un seul script
  type="application/ld+json", en remplaçant l'ancien slug par le bon si besoin.
- Ajoute le title tag, la meta description et un canonical, valeurs de la
  section 3.
- Le bloc des créneaux doit être encadré par des commentaires HTML
  <!-- SLOTS:START --> et <!-- SLOTS:END -->, et c'est le seul endroit du fichier
  que j'aurai à modifier chaque semaine. Le libellé exact du bouton est
  "Book this slot, €390".
- Ajoute les événements Plausible cohérents avec _project/TRACKING-PLAN.md :
  "CTA: Book Slot" avec une propriété slot valant l'identifiant du créneau,
  "Enquiry: Custom Quote" sur le lien de la voie secondaire, "FAQ: Open" avec une
  propriété question. Passe par le garde safeTrack déjà utilisé sur contact.html,
  ne réintroduis pas d'appel direct à plausible().
- Ajoute la page à la navigation, au même niveau que les autres offres.

ÉTAPE 3. Écris _project/RUNBOOK-CRENEAUX.md, en français, moins d'une page.
Il doit répondre à quatre questions, sans jargon :
- comment je fais tourner les dates chaque semaine, avec l'exemple exact du
  bloc HTML à copier-coller et le format de l'identifiant de créneau ;
- ce que je fais quand un créneau est vendu (le retirer de la page, pousser) ;
- où je vois quel créneau a été acheté dans Stripe ;
- comment je rembourse. Règle : annulation à plus de 48 heures, je rends les
  390 EUR ; à moins de 48 heures, je garde 100 EUR d'acompte et je rembourse
  290 EUR, ce qui est un remboursement partiel à faire à la main dans Stripe.
  Donne-moi le chemin de clics.
Rappelle aussi la contrainte de la cave : du jeudi au dimanche le premier créneau
peut être à 11h, les autres jours rien avant 16h. La grille actuelle est samedi
11h, 16h et 19h.

ÉTAPE 4. Vérifie avant de me rendre la main.
- Ouvre la page dans le navigateur de prévisualisation, contrôle le rendu en
  1440 px et en 375 px, et vérifie qu'il n'y a aucune erreur console.
- Vérifie que "€390" et les trois libellés de créneau sont présents dans le HTML
  brut servi, pas seulement dans le rendu. Une commande curl plus grep suffit.
- Valide le JSON-LD, au minimum que le JSON parse et que les trois Event ont bien
  maximumAttendeeCapacity à 2 et une offre à 390 EUR.
- Clique sur un bouton de créneau et confirme que la page Stripe s'ouvre avec le
  bon montant. N'AVANCE PAS jusqu'au paiement.
- Fais-moi un résumé de ce qui a été vérifié et de ce qui ne l'a pas été.

Ne commite rien et ne pousse rien sans me demander.
```

---

## Ce que le prompt te fera faire, côté Stripe, en une phrase

Tu crées un seul produit à 390 EUR dans Stripe et un seul lien de paiement. La
page renvoie vers ce lien trois fois, avec un bout d'URL différent à chaque fois
qui dit lequel des trois créneaux a été choisi. Rien à recréer dans Stripe quand
les dates changent, tu ne touches qu'un bloc du fichier HTML.

## Le point auquel il faut faire attention

Ce montage n'empêche pas deux couples d'acheter le même créneau, parce qu'il n'y
a pas de stock. Avec ton volume actuel c'est un risque théorique, et la parade est
dans le runbook : dès qu'un créneau est vendu, tu le retires de la page et tu
pousses. Le jour où tu auras deux réservations par semaine, ce montage devra être
remplacé par un vrai calendrier, et ce sera un autre chantier.
