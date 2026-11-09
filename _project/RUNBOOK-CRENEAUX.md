# Runbook, créneaux de la page couple

Page concernée : `private-wine-tasting-for-two.html`. Lien Stripe unique pour
toute la page : `https://buy.stripe.com/00weVf6Gx0BTaWE4DZb3q01`.

## 0. Une seule saisie par créneau (S6, depuis le 9 novembre 2026)

Une date ouverte s'écrit **une seule fois**, dans `_project/slots.json`. Le
script `_project/build-slots.py` en tire les deux endroits de la page qui
doivent dire la même chose, et il les réécrit ensemble :

1. le bloc de créneaux entre `<!-- SLOTS:START -->` et `<!-- SLOTS:END -->`,
   c'est ce que le visiteur lit et clique (la note de chaînage
   `.priv-slots-chain-note` est désormais dans ce bloc : le script ne l'écrit
   que s'il y a au moins une paire ouverte) ;
2. les objets `Event` du bloc `<script type="application/ld+json">` du
   `<head>`, un par créneau, c'est ce que Google et les assistants lisent.

**Ne retouche jamais ces deux endroits à la main** : la prochaine génération
écraserait le geste, et c'est précisément la double saisie à la main qui
laissait la page et le JSON-LD se contredire. Les autres objets du JSON-LD
(`Organization`, `Person`, `Service`, `FAQPage`) sont recopiés tels quels par
le script, tu peux les éditer normalement.

Le calendrier affiché sur la page n'est pas un troisième endroit : le
JavaScript le construit à partir du bloc de créneaux.

Ce que le script fait seul, à chaque passage :

- il **écarte tout jour clos** : la réservation ferme à midi, heure de Paris,
  le jour même, et un jour dont midi est passé n'est plus écrit nulle part, ni
  en carte ni en JSON-LD ;
- il pose sur chaque `Offer` un `validThrough` à cette même coupure, si bien
  qu'une page qu'on aurait oublié de régénérer reste lisible comme expirée ;
- il calcule le fuseau (`+01:00` l'hiver, `+02:00` l'été), la fin de créneau
  (début plus deux heures), les identifiants et les virgules ;
- il **refuse** une paire de jours non consécutifs, un créneau avant 16h du
  lundi au mercredi (contrainte de la cave), un jour en double ;
- sans aucune date ouverte, il écrit l'état vide (« Nothing open yet » et le
  lien de demande) et ne laisse aucun `Event` dans le JSON-LD. Le prix reste
  porté par l'objet `Service`, qui ne dépend d'aucune date.

## 1. Ouvrir des dates, et la rotation hebdomadaire

**Depuis le chaînage (6 août 2026), les créneaux s'ouvrent par bloc de deux
jours consécutifs, jamais un seul jour isolé.** Les bouteilles ouvertes le
premier jour, sous pompe à vide, servent encore le lendemain.

Dans `_project/slots.json`, la liste `pairs` contient une entrée par paire, et
chaque paire liste ses deux jours avec leurs horaires de début :

```json
"pairs": [
  [
    { "date": "2026-11-28", "times": ["11:00", "16:00", "19:00"] },
    { "date": "2026-11-29", "times": ["11:00", "16:00", "19:00"] }
  ]
]
```

Puis, depuis la racine du dépôt :

```
python3 _project/build-slots.py          # réécrit la page
python3 _project/build-slots.py --check  # doit répondre OK
```

`--check` ne touche à rien. Il échoue si la page sert encore une date close ou
si elle n'est pas à jour avec `slots.json`. C'est le contrôle à passer avant
chaque pré-vol.

**La rotation reste hebdomadaire, et elle devient un passage du script.**
Même sans ouvrir de nouvelle date, relance-le au moins une fois par semaine :
c'est ce qui retire de la page servie les jours passés. Puis commit, et le
circuit habituel (branche, PR, fusion) : la fusion dans `main` déploie.

Contrainte de la cave, vérifiée par le script : du jeudi au dimanche, le
premier créneau peut être à 11h ; du lundi au mercredi, rien avant 16h, donc
deux créneaux possibles (16h et 19h). Une paire dimanche et lundi a donc trois
créneaux le dimanche et deux le lundi, c'est normal.

## 2. Quand un créneau est vendu

Retire son horaire du jour concerné dans `slots.json` (et le jour entier s'il
n'a plus d'horaire, et la paire entière si ses deux jours sont vendus), relance
le script, commit, publie. La carte et l'événement JSON-LD disparaissent
ensemble.

Il n'y a pas de système de réservation automatique, donc la seule protection
contre le double-booking reste de retirer le créneau vendu dès que le paiement
est confirmé (voir S5 au backlog du pôle pour le plafond par lien Stripe).

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

Si le créneau redevient disponible après un remboursement, remets son horaire
dans `_project/slots.json` et relance `_project/build-slots.py`.

## 5. Quand un prix change

Le prix de la page couple n'est pas écrit à un endroit, il est écrit à sept, et
**une des sept est sur une autre page**. C'est le piège de cette section : un
prix changé sur la page couple et oublié sur `contact.html` ne casse rien, ne
lève aucune erreur, et laisse une phrase mensongère en ligne.

### 5a. Les 390 EUR de la dégustation pour deux

Dans `private-wine-tasting-for-two.html` :

1. le montant des boutons « Book this slot, &euro;390 », écrit par le script
   à partir de `PRICE` (point suivant) ;
2. la constante `PRICE` de `_project/build-slots.py` (elle écrit les
   boutons et le `"price"` de chaque `Event`), puis le `"price"` de l'objet
   `Service` du JSON-LD, et relancer le script ;
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
