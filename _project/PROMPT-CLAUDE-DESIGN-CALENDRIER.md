# Prompt à coller dans Claude Design, calendrier de réservation de la page couple

À lancer depuis `/Users/thomas/Dev/thomas-os/workstreams/wine-and-cheese/winecheese`.
Le prompt est écrit pour une session neuve qui ne connaît rien du contexte.

Objectif : remplacer la liste verticale de créneaux de `private-wine-tasting-for-two.html`
par un calendrier de réservation, et repenser au passage l'endroit où la réservation se
joue dans la page. Périmètre technique inchangé (lien Stripe unique, créneaux en dur).

---

## Le prompt

```
Contexte.

Tu travailles sur winecheese.paris, un site statique en HTML, sans framework et sans
étape de build. Le dépôt est à
/Users/thomas/Dev/thomas-os/workstreams/wine-and-cheese/winecheese.

Avant de dessiner quoi que ce soit, lis en entier :
- private-wine-tasting-for-two.html, la page à refondre ;
- tokens.css et shared.css, qui portent le système de design (échelles d'espacement,
  typographie, couleurs). Tu consommes ce système, tu ne le réinventes pas ;
- _project/RUNBOOK-CRENEAUX.md, qui décrit comment les créneaux sont gérés à la main.

Le produit : une dégustation vin et fromage privée, 2 heures, 2 convives, 390 EUR au
total tout compris, dans une cave voûtée en sous-sol chez Cave Les Piqueurs, 6 rue
Tardieu, Paris 18e, animée en anglais par Thomas. La page est en anglais et toute
l'interface que tu dessines doit rester en anglais.

La cible : des touristes anglophones, en majorité américains, très majoritairement sur
téléphone, qui réservent souvent la veille pour le lendemain.

Le problème à résoudre.

Aujourd'hui les créneaux sont une liste verticale, en bas d'une page déjà très longue :
un bloc par jour ouvert, trois cartes de créneau par bloc. Avec quatre week-ends ouverts,
ça fait vingt-quatre cartes empilées. Pour savoir si le 19 septembre est libre, il faut
scroller à travers les 5, 6, 12 et 13. On ne voit jamais la forme de la disponibilité,
seulement une liste qu'il faut lire.

Je veux le geste standard d'un Calendly ou d'un Google Calendar Booking : une grille de
mois où les jours ouverts se voient d'un coup d'oeil, on clique une date, et les horaires
de cette date apparaissent. Le tout doit rester lisible quand j'ouvre deux fois plus de
dates.

Tu as le droit de repenser l'endroit où la réservation se joue dans la page, pas
seulement de remplacer le bloc sur place. Le calendrier peut remonter, se dédoubler en
un CTA présent plus haut, devenir un panneau collant sur mobile, s'ouvrir en surcouche.
Propose une structure et explique-la. L'ordre actuel des sections est : hero, le récit,
ce qui se passe pendant les deux heures, la carte des cinq vins, l'hôte, la bande prix
à 390 EUR, les créneaux, la voie secondaire "ask Thomas", la FAQ.

Les règles métier que le calendrier doit exprimer.

1. LES CRÉNEAUX S'OUVRENT PAR PAIRES DE JOURS CONSÉCUTIFS, jamais un jour isolé. Les
   cinq bouteilles sont ouvertes le premier jour et conservées sous pompe à vide pour le
   lendemain. Les deux jours d'une paire, c'est la même série de vins. C'est un argument
   de vente, pas une contrainte à cacher : le dimanche n'est pas un reste, c'est le même
   vin un jour de plus à l'air, souvent le verre le plus intéressant.

   C'est le point de design le plus intéressant du travail, et c'est ce qui empêchera ta
   maquette de ressembler à un Calendly générique : une grille de mois traite chaque
   case comme une unité indépendante, alors qu'ici les jours vont par deux. Trouve
   comment le montrer dans la grille elle-même, pas seulement dans un paragraphe
   d'explication au-dessus.

   Le texte qui porte cette promesse aujourd'hui est le paragraphe .priv-slots-chain-note
   juste au-dessus des créneaux. Tu peux le réécrire ou le redistribuer dans
   l'interface, mais la promesse doit rester lisible.

2. LES HORAIRES POSSIBLES DÉPENDENT DU JOUR. Du jeudi au dimanche, le premier créneau
   peut être à 11h, donc trois créneaux dans la journée : 11h-13h, 16h-18h, 19h-21h. Du
   lundi au mercredi, rien avant 16h, donc deux créneaux seulement : 16h-18h et 19h-21h.
   Une paire qui chevauche dimanche et lundi a donc trois créneaux le premier jour et
   deux le second. Ton composant doit absorber ça sans avoir l'air cassé.

3. UN JOUR PEUT AVOIR MOINS DE CRÉNEAUX QUE PRÉVU. Quand un créneau est vendu, il est
   retiré de la page à la main. Un jour ouvert peut donc afficher trois, deux ou un seul
   créneau. Ce n'est pas un état d'erreur, c'est le fonctionnement normal.

L'état actuel des créneaux, pour que tu dessines sur du vrai : samedis et dimanches de
septembre 2026, les paires 5-6, 12-13, 19-20 et 26-27, trois créneaux par jour.

Les contraintes techniques, à respecter strictement.

1. LE PRIX ET LES CRÉNEAUX DOIVENT RESTER LISIBLES SANS JAVASCRIPT. C'est la contrainte
   la plus importante et la plus facile à perdre. "€390" et les libellés de créneau sont
   écrits en dur dans le HTML servi, et la page porte un bloc JSON-LD avec un événement
   schema.org par créneau. Un crawler et un LLM doivent lire les dates et le prix dans la
   source, JavaScript désactivé. Donc : les données des créneaux sont dans le HTML au
   départ, et le JavaScript ne fait que les présenter en calendrier. Dessine explicitement
   à quoi ressemble la page quand le JavaScript ne s'exécute pas. La liste actuelle,
   simplement mise en forme, est une réponse acceptable.

2. LE PAIEMENT PASSE PAR UN LIEN STRIPE UNIQUE, et ça ne change pas dans ce chantier.
   Tous les créneaux pointent vers https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01, avec le
   créneau transporté en paramètre : ?client_reference_id=sat-2026-09-05-1100. Format de
   l'identifiant : jour-annee-mois-jour-heure, en minuscules. Concrètement, ton parcours
   doit se terminer par un simple lien vers cette URL. Pas de tunnel en plusieurs étapes,
   pas de formulaire avant le paiement, pas de "créneau bloqué pendant 10 minutes", pas
   de panier.

3. IL N'Y A AUCUNE GESTION DE STOCK. Rien n'empêche techniquement deux personnes de payer
   le même créneau, la seule parade est le retrait manuel. Donc ton design ne doit jamais
   laisser croire à une disponibilité vérifiée en direct. Pas de compteur de places
   restantes, pas de "2 personnes regardent cette date", pas de compte à rebours, aucune
   fausse rareté. Sobriété.

4. LA PAGE DE PAIEMENT STRIPE N'AFFICHE NI LA DATE NI L'HEURE. C'est un défaut connu du
   montage actuel : l'identifiant de créneau est une métadonnée invisible du client.
   Quelqu'un qui réserve le samedi 19 septembre à 19h arrive sur un checkout qui ne
   mentionne ni le 19 ni 19h. Ton design doit donc confirmer le créneau choisi de façon
   très explicite juste avant le clic, pour que le passage sur Stripe ne ressemble pas à
   une erreur. Traite ce moment comme un vrai morceau du design, pas comme un détail.

5. PAS DE LIBRAIRIE DE CALENDRIER LOURDE. Le site est en HTML et CSS écrits à la main,
   sans build. Ce que tu dessines doit être implémentable en quelques dizaines de lignes
   de JavaScript sans dépendance.

Le registre visuel.

La page construit un argument éditorial pendant huit cents lignes avant d'annoncer le
prix : un récit à la première personne, une cave, du calme, pas de bruit commercial. Un
composant de réservation générique posé au milieu casserait ce registre. Le calendrier
doit être dessiné dans le système de la page, avec ses tokens, sa typographie et ses
couleurs, et ressembler à un objet de cette page et d'aucune autre.

Mobile d'abord. La cible est sur un téléphone. Une grille de mois à 375 px, c'est
exactement là où ces interfaces échouent. Si le compromis mobile impose une forme
différente du desktop, assume-le et dessine les deux.

Les états à dessiner, au minimum.

- Un jour ouvert avec trois créneaux, un avec deux, un avec un seul.
- Une paire de jours consécutifs, avec la relation entre les deux jours visible.
- La majorité des cases du mois, qui sont fermées.
- Une date sélectionnée, puis un créneau sélectionné, puis le moment juste avant le
  départ vers Stripe.
- Un mois entièrement vide, par exemple octobre tant que rien n'est ouvert, avec le
  renvoi vers la voie secondaire existante ("Ask about a date that is not listed", qui
  pointe vers contact.html).
- La page sans JavaScript.

Ce que j'attends comme livrable.

Un canvas avec des artboards :
- la page complète repensée en vue d'ensemble, pour montrer où le moment de réservation
  se place désormais et ce qui a bougé ;
- le composant calendrier en desktop 1440 px, avec ses états ;
- le composant calendrier en mobile 375 px, avec ses états ;
- le moment de confirmation avant le départ vers Stripe.

Plus une note courte, en français, qui explique la structure que tu proposes, comment tu
as résolu la question des paires de jours, et ce que tu as arbitré entre desktop et
mobile.

Ce qu'il ne faut pas faire.

- Ne réécris pas les textes validés : le récit, la carte des vins, la bio de l'hôte, la
  bande prix, la FAQ. Tu peux réécrire les micro-textes de l'interface de réservation.
- Ne change aucun prix, aucun horaire, aucune règle d'annulation. Pour mémoire :
  annulation gratuite jusqu'à 48h avant, ensuite 100 EUR gardés et 290 EUR remboursés,
  et la réservation ferme à midi le jour même.
- N'invente pas de disponibilité qui n'existe pas pour remplir la grille.
- Jamais de tiret cadratin dans aucun texte produit, ni dans l'interface, ni dans tes
  notes. Tiret demi-cadratin, virgule ou parenthèses.
```

---

## Le prompt du tour 2, le code d'intégration

Écrit après revue du canvas du tour 1 (`Refonte-reservation.dc.html`). Le tour 1 est validé
sur le fond : structure, grille lundi-first, surcouche, barre collante conditionnelle,
navigation bornée, wrapper de paire, écouteur délégué, étiquetage Paris time. Ce tour
tranche entre les deux directions et corrige trois points.

```
Tour 2. Le code d'intégration.

Ton canvas du tour 1 est validé. Relis Refonte-reservation.dc.html et sa note avant de
coder : tout ce qui n'est pas mentionné ci-dessous est validé tel quel et doit être
implémenté comme tu l'as décrit, y compris la grille qui commence le lundi, le lien
"See open dates" dans le hero, la surcouche, la barre collante mobile qui n'apparaît
qu'une fois le hero sorti, le calendrier en un seul composant monté deux fois, la
navigation bornée au mois suivant le dernier mois ouvert, et le récapitulatif inline
avant Stripe.

L'arbitrage sur les paires : la grille de A, le panneau de B.

Je ne retiens ni la direction A ni la direction B en entier.

De A, la ligature, je garde LA GRILLE. Le jour reste l'unité cliquable, les deux jours
d'une paire sont soudés par le trait doré, le jour choisi passe en lie-de-vin et son jour
jumeau s'allume en plus clair. Le repli en deux chevrons pour une paire à cheval sur deux
lignes est conservé. Raison : mes clients pensent "on est libres samedi", pas "on veut la
série de bouteilles numéro 3", et le jour comme unité se dégrade mieux quand un jour reste
seul après une vente ou quand un jour de semaine n'a que deux créneaux.

De B, la capsule, je garde LE PANNEAU. Quand un jour est choisi, le panneau montre les
deux jours de la paire côte à côte, étiquetés "bottles opened" et "same bottles, day two",
chacun avec ses horaires. C'est un bien meilleur argument pour vendre le second jour
qu'une phrase en dessous, et l'asymétrie trois créneaux contre deux se voit d'un coup.
Remplir le second jour d'une paire est mon vrai problème commercial, ce panneau est ce qui
y répond.

Cohérence à tenir : cliquer le 19 ou cliquer le 20 ouvre le même panneau de paire, seule
la colonne mise en avant change. Un horaire se choisit indifféremment dans l'une ou
l'autre colonne.

Sur mobile 375, deux colonnes d'horaires côte à côte ne tiendront probablement pas. Si
c'est le cas, empile : le jour choisi d'abord, le jour jumeau ensuite, clairement étiqueté
"same bottles, day two", sans perdre le fait que c'est la même série. Ne sacrifie pas la
promesse pour tenir dans la largeur, trouve la forme qui la garde.

Les trois corrections.

1. "Three slots left" doit disparaître, et avec lui tout vocabulaire de déplétion. "Left"
   affirme qu'il en reste trois sur un nombre plus grand, alors que je retire mes créneaux
   vendus à la main : trois créneaux veut dire "trois sont listés", jamais "trois
   survivent". Écris "Three times available", ou n'écris rien et laisse les horaires
   parler. Ta propre note dit que le panneau ne promet jamais un nombre de créneaux, la
   chaîne affichée disait le contraire. Vérifie qu'aucune autre chaîne ne réintroduit de
   la rareté ailleurs.

2. Le details servi ouvert puis refermé par le JavaScript va faire un flash. Le visiteur
   verra la liste complète des vingt-quatre cartes se déployer puis se replier d'un coup.
   Invisible sur une machine de développement, très visible sur le wifi d'un hôtel, ce qui
   est exactement là où mes clients sont. Pose un script inline dans le head, avant tout
   rendu, qui ajoute une classe sur l'élément html, et un CSS qui ne replie le details que
   sous cette classe. Pas dans le bundle différé, dans le head.

3. Le JSON-LD doit entrer dans le runbook, il n'y a jamais été. Aujourd'hui
   _project/RUNBOOK-CRENEAUX.md ne mentionne le bloc JSON-LD à aucun endroit, ni quand je
   fais tourner les dates, ni quand je retire un créneau vendu. Autrement dit, un créneau
   vendu disparaît de la page mais reste annoncé dans les données structurées, et
   personne ne me l'a jamais dit. Corrige le runbook pour que chaque geste couvre les deux
   endroits : la carte et son événement JSON-LD. Dis-y aussi noir sur blanc que chaque
   date est écrite deux fois et que c'est une dette assumée pour l'instant.

Ce que je veux recevoir.

Le code d'intégration, sur une branche, jamais sur main : pousser sur main déclenche le
déploiement. Nomme-la feat/calendrier-reservation. Si tu ne peux pas pousser, rends-moi
les fichiers modifiés et je les applique.

Les fichiers concernés sont private-wine-tasting-for-two.html (markup, CSS et JavaScript
de la page) et _project/RUNBOOK-CRENEAUX.md. Si tu as besoin de toucher tokens.css ou
shared.css, dis-le et justifie-le, ne le fais pas en silence.

Les créneaux actuellement dans le fichier sont mes vraies dates ouvertes : les paires des
5-6, 12-13, 19-20 et 26-27 septembre 2026. Ne les change pas, ne les complète pas, ne les
réordonne pas. Tu ne fais que les envelopper dans les div de paire.

Les contraintes du tour 1 restent toutes valables, je les rappelle en une ligne chacune :
prix et libellés de créneau lisibles dans le HTML servi sans JavaScript, JSON-LD intact,
lien Stripe unique avec client_reference_id et rien d'autre, aucune gestion de stock donc
aucune promesse de disponibilité vérifiée, écouteur de tracking délégué sur document via
closest('[data-slot]'), coupure des créneaux dépassés calculée en heure de Paris et non en
heure du navigateur, pas de librairie de calendrier, pas de tiret cadratin.

Le pré-vol, à faire avant de me rendre la main, et à me rapporter point par point.

1. La page répond en 200 et la console est vide, à 1440 px et à 375 px.
2. Le JSON-LD parse toujours, contient toujours vingt-quatre événements, toujours à 390
   EUR et avec maximumAttendeeCapacity à 2.
3. JavaScript désactivé : "€390" et les libellés de créneau sont présents dans le HTML
   servi, le details est ouvert, la liste est lisible et cliquable.
4. Un clic sur un créneau ouvre bien Stripe avec le bon client_reference_id. Tu
   n'avances pas jusqu'au paiement.
5. L'événement Plausible "CTA: Book Slot" part toujours, avec la bonne valeur de slot,
   APRÈS que le calendrier a monté la grille. C'est le point le plus facile à casser sans
   s'en apercevoir.
6. Les cas limites tiennent : une paire à cheval sur deux lignes, un jour à un seul
   créneau, un jour de semaine à deux créneaux, un mois vide. Teste-les sur des données
   temporaires, et remets mes vraies dates avant de me rendre la main.

Dis-moi aussi franchement ce que tu n'as pas pu vérifier.

Ce qu'il ne faut pas faire.

- Ne pousse rien sur main.
- Ne touche pas aux textes validés : le récit, la carte des vins, la bio de l'hôte, la
  bande prix, la FAQ, la voie secondaire.
- Ne change aucun prix, aucun horaire, aucune règle d'annulation.
- Ne change pas l'ordre des sections de la page.
- Jamais de tiret cadratin, ni dans l'interface, ni dans le runbook, ni dans les messages
  de commit.
```

---

## Ce qui vient après, et qui n'est pas dans ce prompt

Ce prompt produit une maquette, pas du code en production. Deux chantiers restent devant,
déjà identifiés dans `00-direction/inbox/2026-08-07-site-BACKLOG-disponibilite-creneaux.md` :

1. **Une source unique pour les créneaux.** Aujourd'hui chaque créneau est écrit deux fois
   à la main, en carte et en JSON-LD. Un calendrier rend cette duplication intenable, donc
   l'implémentation devra passer par un `slots.json` et une génération. C'est le lot 2 du
   backlog, et la refonte visuelle est ce qui le force enfin.
2. **Un vrai contrôle de stock.** Un lien de paiement par créneau plafonné à un paiement,
   ce qui supprime le risque de double réservation et met la date sur la page de paiement.
   C'est le lot 1, et il rendrait caduque la contrainte technique numéro 4 de ce prompt.
