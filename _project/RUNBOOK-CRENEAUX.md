# Runbook, créneaux de la page couple

Page concernée : `private-wine-tasting-for-two.html`. Lien Stripe unique pour
toute la page : `https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01`.

## 1. Faire tourner les dates chaque semaine

Dans le fichier, cherche le commentaire `<!-- SLOTS:START -->` et remplace
tout le bloc jusqu'à `<!-- SLOTS:END -->` par un bloc à jour. Copie-colle cet
exemple et change seulement les trois dates, les trois horaires et les trois
identifiants :

```html
<!-- SLOTS:START -->
<div class="slots-grid">
  <div class="slot-card">
    <div>
      <p class="slot-label">Saturday 15 August 2026, 11:00am to 1:00pm</p>
      <p class="slot-sub">Private, just the two of you</p>
    </div>
    <a class="btn-book-slot" data-slot="sat-2026-08-15-1100" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sat-2026-08-15-1100">Book this slot, €390</a>
  </div>
  <div class="slot-card">
    <div>
      <p class="slot-label">Saturday 15 August 2026, 4:00pm to 6:00pm</p>
      <p class="slot-sub">Private, just the two of you</p>
    </div>
    <a class="btn-book-slot" data-slot="sat-2026-08-15-1600" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sat-2026-08-15-1600">Book this slot, €390</a>
  </div>
  <div class="slot-card">
    <div>
      <p class="slot-label">Saturday 15 August 2026, 7:00pm to 9:00pm</p>
      <p class="slot-sub">Private, just the two of you</p>
    </div>
    <a class="btn-book-slot" data-slot="sat-2026-08-15-1900" href="https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01?client_reference_id=sat-2026-08-15-1900">Book this slot, €390</a>
  </div>
</div>
<!-- SLOTS:END -->
```

Format de l'identifiant (`data-slot` et `client_reference_id`, toujours les
mêmes) : `jour-annee-mois-jour-heure`, en minuscules, sans accent. Exemple
`sat-2026-08-15-1100` pour samedi 15 août 2026 à 11h. Ne touche à rien
d'autre dans le fichier, ni au prix, ni au texte au-dessus ou en dessous du
bloc.

**Contrainte de la cave à respecter à chaque rotation** : du jeudi au
dimanche, le premier créneau peut être à 11h. Les autres jours (lundi à
mercredi), rien avant 16h, donc il ne reste que deux créneaux possibles ce
jour-là (16h et 19h) au lieu de trois.

Une fois le fichier modifié, commit et push sur `main` : le déploiement
Dokploy se fait automatiquement.

## 2. Quand un créneau est vendu

Retire sa carte (le bloc `<div class="slot-card">...</div>` correspondant) du
fichier, puis commit et push. Il n'y a pas de système de réservation
automatique, donc la seule protection contre le double-booking est de retirer
le créneau vendu de la page dès que le paiement est confirmé.

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
