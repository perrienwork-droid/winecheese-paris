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
