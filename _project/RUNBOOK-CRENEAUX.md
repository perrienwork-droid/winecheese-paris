# Runbook, créneaux de la page couple

Page concernée : `private-wine-tasting-for-two.html`. Lien Stripe unique pour
toute la page : `https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01`.

## 0. Chaque date est écrite deux fois

Une date ouverte vit à **deux endroits** dans le fichier, et les deux doivent
toujours dire la même chose :

1. le bloc de créneaux entre `<!-- SLOTS:START -->` et `<!-- SLOTS:END -->`,
   c'est ce que le visiteur lit et clique ;
2. le bloc `<script type="application/ld+json">` en haut du fichier, dans le
   `<head>`, qui contient **un événement schema.org par créneau**, c'est ce que
   Google et les assistants lisent.

C'est une duplication assumée pour l'instant, pas un oubli : la page est en HTML
statique, sans étape de build, donc rien ne génère le JSON-LD à partir du HTML.
La conséquence est simple et il faut la connaître : **si tu ne fais le geste que
d'un côté, la page et les données structurées se contredisent**. Un créneau
vendu retiré du HTML mais laissé dans le JSON-LD reste annoncé comme disponible
à l'extérieur du site.

Règle : à chaque fois que tu touches un créneau, tu le touches aux deux
endroits. Chaque geste ci-dessous est écrit en deux temps pour ça.

Le calendrier affiché sur la page ne compte pas comme un troisième endroit : il
est construit par le JavaScript à partir du bloc de créneaux, il n'a aucune
donnée propre. Tu n'as jamais à l'éditer.

## 1. Faire tourner les dates chaque semaine

**Depuis le chaînage (6 août 2026), les créneaux s'ouvrent par bloc de deux
jours consécutifs, jamais un seul jour isolé.** Les bouteilles ouvertes le
premier jour, sous pompe à vide, servent encore le lendemain, donc le site
propose systématiquement une paire de jours qui se suivent sur le calendrier
(samedi + dimanche, ou n'importe quelle autre paire consécutive) sur la même
série de vins.

### 1a. Le bloc de créneaux

Dans le fichier, cherche le commentaire `<!-- SLOTS:START -->` et remplace tout
le bloc jusqu'à `<!-- SLOTS:END -->` par un bloc à jour. Une paire de jours,
c'est **un `<div class="slots-pair">` qui contient les deux
`<div class="slots-day-group">`**, chacun avec son `<p class="slots-day-label">`
(le jour, sans l'horaire) et sa `<div class="slots-grid">` de créneaux.

Le `slots-pair` est la seule chose que le calendrier exige de toi. C'est lui qui
dit "ces deux jours sont la même série de bouteilles". Sans lui, les deux jours
s'affichent comme deux dates indépendantes et la promesse du chaînage disparaît
de l'interface.

Copie-colle cet exemple et change les deux dates, les horaires et les six
identifiants :

```html
<!-- SLOTS:START -->
<div class="slots-pair">
  <div class="slots-day-group">
    <p class="slots-day-label">Saturday 15 August 2026</p>
    <div class="slots-grid">
      <div class="slot-card">
        <div>
          <p class="slot-label">11:00am to 1:00pm</p>
          <p class="slot-sub">Private, just the two of you</p>
        </div>
        <a class="btn-book-slot" data-slot="sat-2026-08-15-1100" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sat-2026-08-15-1100">Book this slot, &euro;390</a>
      </div>
      <div class="slot-card">
        <div>
          <p class="slot-label">4:00pm to 6:00pm</p>
          <p class="slot-sub">Private, just the two of you</p>
        </div>
        <a class="btn-book-slot" data-slot="sat-2026-08-15-1600" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sat-2026-08-15-1600">Book this slot, &euro;390</a>
      </div>
      <div class="slot-card">
        <div>
          <p class="slot-label">7:00pm to 9:00pm</p>
          <p class="slot-sub">Private, just the two of you</p>
        </div>
        <a class="btn-book-slot" data-slot="sat-2026-08-15-1900" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sat-2026-08-15-1900">Book this slot, &euro;390</a>
      </div>
    </div>
  </div>
  <div class="slots-day-group">
    <p class="slots-day-label">Sunday 16 August 2026</p>
    <div class="slots-grid">
      <div class="slot-card">
        <div>
          <p class="slot-label">11:00am to 1:00pm</p>
          <p class="slot-sub">Private, just the two of you</p>
        </div>
        <a class="btn-book-slot" data-slot="sun-2026-08-16-1100" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sun-2026-08-16-1100">Book this slot, &euro;390</a>
      </div>
      <div class="slot-card">
        <div>
          <p class="slot-label">4:00pm to 6:00pm</p>
          <p class="slot-sub">Private, just the two of you</p>
        </div>
        <a class="btn-book-slot" data-slot="sun-2026-08-16-1600" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sun-2026-08-16-1600">Book this slot, &euro;390</a>
      </div>
      <div class="slot-card">
        <div>
          <p class="slot-label">7:00pm to 9:00pm</p>
          <p class="slot-sub">Private, just the two of you</p>
        </div>
        <a class="btn-book-slot" data-slot="sun-2026-08-16-1900" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sun-2026-08-16-1900">Book this slot, &euro;390</a>
      </div>
    </div>
  </div>
</div>
<!-- SLOTS:END -->
```

Format de l'identifiant (`data-slot` et `client_reference_id`, toujours les
mêmes) : `jour-annee-mois-jour-heure`, en minuscules, sans accent. Exemple
`sun-2026-08-16-1100` pour dimanche 16 août 2026 à 11h. Ne touche à rien
d'autre dans le fichier, ni au prix, ni au texte au-dessus ou en dessous du
bloc, ni à `.priv-slots-chain-note` juste au-dessus (le paragraphe qui explique
le chaînage au visiteur).

Le calendrier lit la date dans le `data-slot` de la première carte du jour et
l'horaire dans le texte de `<p class="slot-label">`. Il n'y a donc aucun
attribut supplémentaire à tenir à jour : ce que tu tapes ici est la seule
source.

### 1b. Le JSON-LD, dans le même passage

Remonte dans le `<head>`, dans le bloc `<script type="application/ld+json">`.
Après les deux premiers objets (`Organization` et `Person`, à ne pas toucher)
vient **une liste d'objets `Event`, un par créneau**. Avec deux jours à trois
créneaux, il en faut six, dans le même ordre que les cartes.

Remplace les anciens événements par autant de copies de ce bloc que tu as de
créneaux, en changeant à chaque fois l'identifiant, `startDate` et `endDate` :

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": "https://winecheese.paris/private-wine-tasting-for-two#2026-08-15-1100",
  "name": "Private Wine and Cheese Tasting for Two, Montmartre Cellar",
  "description": "A two-hour private wine and cheese tasting for two guests in an underground cellar at the foot of Montmartre. Five wines, five pairings, hosted in English by a WSET-certified Parisian.",
  "url": "https://winecheese.paris/private-wine-tasting-for-two.html",
  "startDate": "2026-08-15T11:00:00+02:00",
  "endDate": "2026-08-15T13:00:00+02:00",
  "duration": "PT2H",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "inLanguage": "en",
  "maximumAttendeeCapacity": 2,
  "isAccessibleForFree": false,
  "typicalAgeRange": "18-",
  "location": {
    "@type": "Place",
    "name": "Cave Les Piqueurs",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "6 rue Tardieu",
      "addressLocality": "Paris",
      "postalCode": "75018",
      "addressCountry": "FR"
    },
    "publicAccess": false
  },
  "organizer": { "@id": "https://winecheese.paris/#organization" },
  "performer": { "@id": "https://winecheese.paris/#thomas" },
  "offers": {
    "@type": "Offer",
    "name": "Private tasting for two, all inclusive",
    "price": "390",
    "priceCurrency": "EUR",
    "description": "Total price for the two guests. Five wines, cheese board, bread, walnuts, raisins, water and private use of the cellar included.",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-09-03T00:00:00+02:00",
    "url": "https://winecheese.paris/private-wine-tasting-for-two.html"
  }
}
```

Trois choses à ne jamais laisser filer dans ce bloc :

- **Le fuseau.** `+02:00` en heure d'été, `+01:00` en heure d'hiver (du dernier
  dimanche d'octobre au dernier dimanche de mars). Une date d'hiver écrite en
  `+02:00` annonce un créneau une heure trop tôt.
- **La fin de créneau.** `endDate` est toujours `startDate` plus deux heures :
  11h donne 13h, 16h donne 18h, 19h donne 21h.
- **Les virgules.** Les objets sont séparés par une virgule, et le dernier de la
  liste n'en prend pas. Une virgule en trop et le bloc entier devient
  invalide, donc invisible pour Google, sans que rien ne se voie sur la page.

Vérification en trente secondes avant de pousser : ouvre la page dans le
navigateur, console, `JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).length`.
Si ça répond un nombre (2 plus le nombre de créneaux), le bloc est valide. Si ça
répond une erreur, tu as une virgule ou une accolade de travers.

**Contrainte de la cave à respecter à chaque rotation, jour par jour à
l'intérieur de la paire** : du jeudi au dimanche, le premier créneau peut être
à 11h. Les autres jours (lundi à mercredi), rien avant 16h, donc il ne reste
que deux créneaux possibles ce jour-là (16h et 19h) au lieu de trois. Une
paire qui chevauche la frontière dimanche/lundi (par exemple dimanche +
lundi) a donc trois créneaux le dimanche et deux seulement le lundi, c'est
normal, ne pas essayer d'aligner les deux jours. Le calendrier affiche les deux
jours côte à côte avec leurs horaires réels, l'écart se voit et c'est voulu.

**Les deux jours doivent être réellement consécutifs sur le calendrier.**
C'est ce qui rend la phrase du `.priv-slots-chain-note` vraie : la même série
de bouteilles sert les deux jours. Un jour isolé, ou deux jours qui ne se
suivent pas, casse la promesse faite au visiteur, ne le fais jamais.

Une fois le fichier modifié, commit et push sur `main` : le déploiement
Dokploy se fait automatiquement.

## 2. Quand un créneau est vendu

Deux gestes, toujours les deux.

**2a. La carte.** Retire le bloc `<div class="slot-card">...</div>`
correspondant, dans le bloc de créneaux.

- Si un `slots-day-group` se retrouve sans aucune carte, retire le groupe entier
  (son `<p class="slots-day-label">` compris). Le jour qui reste dans la paire
  s'affichera seul dans le calendrier, sans ligature, ce qui est juste : il n'y
  a plus deux jours à proposer.
- Si les **deux** jours d'une paire sont vendus, retire le
  `<div class="slots-pair">` entier, ouverture et fermeture comprises. Ne laisse
  jamais un `slots-pair` vide dans le fichier.

**2b. L'événement JSON-LD.** Remonte dans le `<head>` et retire l'objet `Event`
dont le `@id` finit par l'identifiant du créneau vendu. Pour
`sat-2026-08-15-1600`, c'est l'événement
`...private-wine-tasting-for-two#2026-08-15-1600`. Attention à la virgule
laissée derrière : si tu retires le dernier objet de la liste, l'avant-dernier
ne doit plus avoir de virgule à la fin.

Puis commit et push. Il n'y a pas de système de réservation automatique, donc la
seule protection contre le double-booking est de retirer le créneau vendu de la
page dès que le paiement est confirmé.

Ce que tu n'as **pas** à faire : retirer un créneau simplement parce que son
heure est passée. La réservation ferme à midi le jour même, et le calendrier
masque tout seul les créneaux d'un jour dont midi est passé, en heure de Paris.
La liste complète, elle, les montre encore : c'est ce que lisent les visiteurs
sans JavaScript et les crawlers, et c'est accepté tel quel. Les vieilles dates
partent à la rotation suivante.

## 3. Retrouver quel créneau a été acheté

Dans le Dashboard Stripe : **Payments** (menu de gauche) → clique sur la ligne
du paiement reçu → sur la page de détail, le bloc **Checkout summary** montre
le champ **Client reference ID**, avec la valeur exacte du créneau cliqué
(par exemple `sat-2026-08-08-1600`). C'est ce champ qui te dit quel créneau
vient d'être vendu. Il n'apparaît pas dans l'email reçu par le client, c'est
une info interne réservée au Dashboard.

## 4. Rembourser

Règle : annulation à plus de 48 heures avant le créneau, remboursement
intégral des 390 EUR. À moins de 48 heures, tu gardes 100 EUR d'acompte et tu
rembourses 290 EUR (remboursement partiel).

Chemin de clics dans le Dashboard Stripe :
1. **Payments** → clique sur le paiement du client concerné.
2. Bouton **Refund payment** (en haut à droite de la page de détail).
3. Pour un remboursement intégral : laisse le montant proposé par défaut
   (390 EUR), choisis un motif, confirme.
4. Pour un remboursement partiel (annulation à moins de 48h) : dans le champ
   montant, remplace 390.00 par **290.00**, choisis un motif, confirme.

Un remboursement partiel n'annule pas le paiement, il apparaît juste comme
remboursement partiel sur le paiement d'origine.

Si le créneau redevient disponible après un remboursement, il faut le
**remettre** dans le fichier, aux deux endroits : la carte dans le bloc de
créneaux et son événement dans le JSON-LD.

## 5. Quand un prix change

Le prix de la page couple n'est pas écrit à un endroit, il est écrit à sept, et
**une des sept est sur une autre page**. C'est le piège de cette section : un
prix changé sur la page couple et oublié sur `contact.html` ne casse rien, ne
lève aucune erreur, et laisse une phrase mensongère en ligne.

### 5a. Les 390 EUR de la dégustation pour deux

Dans `private-wine-tasting-for-two.html` :

1. le montant dans chaque `<a class="btn-book-slot">` du bloc de créneaux
   (« Book this slot, &euro;390 »), une fois par créneau ;
2. le champ `"price": "390"` de chaque objet `Event` du JSON-LD, dans le
   `<head>`, une fois par créneau ;
3. le bouton du récapitulatif du calendrier, construit en JavaScript dans la
   fonction `recap()` (« Continue to payment, &euro;390 ») ;
4. la légende au-dessus du calendrier (« Either day, same wines, same
   &euro;390 ») ;
5. la phrase du panneau de la paire (« Same five wines both days, same
   &euro;390. »), construite dans `panel()` ;
6. le montant du lien de paiement Stripe lui-même, qui se change dans le
   Dashboard Stripe et pas dans le fichier. Un prix changé dans la page mais
   pas sur le lien fait payer l'ancien montant.

### 5b. Le couplage avec contact.html, à ne pas oublier

Dans `contact.html`, le module de demande affiche pour deux convives :
« &euro;195 each. The same price as the dates on the calendar. » (et sa version
FR). Cette phrase **affirme que les deux pages disent le même prix**. Elle est
la seule chaîne du site qui lie les deux tarifs.

Si le prix de la page couple bouge sans que la grille de `contact.html` bouge
avec, cette phrase devient fausse en silence. Les deux ne sont d'accord que
tant que 200 + 95 × 2 = 390.

Ce qu'il faut toucher dans `contact.html` quand la grille change :

1. les deux constantes en tête du script du module, `PRICE_BASE` (200) et
   `PRICE_PER_GUEST` (95). Elles fixent tous les totaux calculés ;
2. les quatre lignes du tableau `.price-table` (2, 4, 8, 12 convives), écrites
   en dur exprès : c'est ce tableau qui reste lisible quand le JavaScript ne
   s'exécute pas, donc il ne se recalcule pas tout seul ;
3. la formule en clair, « &euro;200 to reserve the cellar, plus &euro;95 per
   guest » et sa version FR, présente à deux endroits dans le module ;
4. la ligne du convive seul, « On your own? &euro;295 » et sa version FR ;
5. la ligne de déflexion en tête du module, « Book it directly, &euro;390 » et
   sa version FR, qui reprend le prix de la page couple ;
6. la phrase de couplage du point ci-dessus, si les deux prix cessent d'être
   égaux : dans ce cas il faut la retirer, pas la corriger.

Vérification en trente secondes : ouvre `contact.html?enquiry=private-couples`,
le module doit afficher le même total que le bouton de paiement de la page
couple. Si les deux nombres diffèrent, l'un des deux est faux.
