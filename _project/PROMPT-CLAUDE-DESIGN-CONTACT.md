# Prompt à coller dans Claude Design, refonte du parcours de demande

À lancer depuis `/Users/thomas/Dev/thomas-os/workstreams/wine-and-cheese/winecheese`.
Écrit pour une session neuve, sur le même modèle que `PROMPT-CLAUDE-DESIGN-CALENDRIER.md`,
qui a produit le calendrier de la page couple en deux tours.

Page concernée : `contact.html`, et en particulier l'URL
`contact.html?enquiry=private-couples`, celle qu'atteignent les visiteurs venus de la page
couple, de l'accueil et de la page balade.

Périmètre technique inchangé : aucun changement du service `/api/contact`, aucun backend
nouveau. Ce qui bouge est la page.

---

## Le prompt

```
Contexte.

Tu travailles sur winecheese.paris, un site statique en HTML, sans framework et sans étape
de build. Le dépôt est à
/Users/thomas/Dev/thomas-os/workstreams/wine-and-cheese/winecheese.

Avant de dessiner quoi que ce soit, lis en entier :
- contact.html, la page à refondre, et regarde-la en ligne à l'URL réelle
  https://winecheese.paris/contact.html?enquiry=private-couples ;
- private-wine-tasting-for-two.html, la page qui envoie une partie du trafic ici, et dont le
  moment de réservation vient d'être refondu en calendrier. Elle donne le registre visuel
  attendu ;
- tokens.css et shared.css, qui portent le système de design. Tu consommes ce système, tu ne
  le réinventes pas ;
- audits/audit-2026-08-parcours-demande/AUDIT-PARCOURS-DEMANDE.md, un audit complet du
  3 août. Attention : il est en partie périmé, voir plus bas ;
- audits/audit-2026-08-parcours-demande/SPEC-ESTIMATEUR.md et maquette-module-demande.html,
  deux pistes de conception déjà écrites et jamais construites ;
- audits/audit-2026-08-parcours-demande/PLAN-PLAUSIBLE.md, le plan d'instrumentation.

Le produit : des dégustations vin et fromage privées à Paris, animées en anglais par Thomas.
La page est en anglais, avec un dictionnaire bilingue data-en / data-fr sur chaque chaîne.

La cible : des touristes anglophones, en majorité américains, très majoritairement sur
téléphone.

Ce qui a changé, et pourquoi cette page doit changer avec.

La page couple vend désormais toute seule : 390 EUR pour deux, un calendrier de créneaux, un
paiement Stripe immédiat. Ce n'est plus par ce formulaire que passe un couple qui veut une
date affichée.

Donc le rôle de cette page a basculé. Elle ne capte plus la demande principale, elle capte
ce que le calendrier ne sait pas vendre : une autre date, plus de deux personnes, un autre
lieu (un appartement, un hôtel, un bateau), une célébration, un corporate, une conciergerie.
C'est le trop-plein, et c'est là que vivent les gros paniers.

Ta première tâche est donc de répondre à une question avant de dessiner : à quoi sert cette
page maintenant, et qu'est-ce qui devrait s'y passer en premier ? Écris ta réponse dans la
note, je veux la lire avant les artboards.

Le défaut le plus grave, et il est chiffré.

La page affiche "From €120/person" pour la dégustation privée et "From €95/person" pour le
corporate. La grille qui fait foi est 200 EUR de privatisation plus 95 EUR par convive.

  convives     total       par personne
     2         390 EUR        195 EUR
     4         580 EUR        145 EUR
     8         960 EUR        120 EUR
    12        1340 EUR        112 EUR

"From €120/person" n'est atteint qu'à 8 convives et plus. Un couple paie 195 EUR par
personne, soit 62 % de plus que ce que la page annonce. Et "From €95/person" n'est jamais
atteint : c'est l'asymptote, elle supposerait une privatisation gratuite.

Le cas est pire sur l'URL qui m'intéresse. Quelqu'un qui clique "Ask Thomas" depuis la page
couple vient de lire "€390 for the two of you, everything included". Il atterrit sur une
page qui dit "From €120/person". Les deux chiffres ne peuvent pas être vrais ensemble.

Corriger ça n'est pas une décision de prix, c'est un alignement sur la grille : la page doit
dire ce que la grille dit. Comment le dire est en revanche une vraie question de design, et
c'est le coeur de ce que je te demande.

La question centrale de conception.

Aujourd'hui le prix n'est jamais rattaché à la taille du groupe, et il n'est jamais à
l'écran au moment où le visiteur écrit son message. Il ne sait donc pas si sa demande est
réaliste, et moi je ne peux pas filtrer. SPEC-ESTIMATEUR.md décrit un estimateur qui
répondrait à ça et n'a jamais été construit.

Traite l'estimateur comme la question centrale, pas comme un bonus. Montre-moi ce que ça
donne quand choisir "nous sommes 4" fait apparaître un total, et dis-moi franchement si tu
penses que c'est une bonne idée ici ou si un tableau de prix statique fait le même travail
pour moins cher. Je veux ton avis argumenté, pas une exécution docile.

Contrainte de sobriété, la même que sur la page couple : aucune fausse rareté, aucun compte
à rebours, aucune promesse de disponibilité que le système ne tient pas.

Ce qui a DÉJÀ été corrigé depuis l'audit du 3 août. Ne le refais pas, ne le signale pas
comme un défaut.

- Le formulaire n'est plus à 3,7 écrans sous la ligne de flottaison. Le module en encoche l'a
  remonté à 0,7 écran sur mobile, et le bouton d'envoi à 1,8. C'est bon, garde ce gain.
- La taille de groupe "1-2" a une vraie valeur, elle ne part plus vide.
- L'appel Plausible est protégé par un garde safeTrack, il ne casse plus sous bloqueur.
- alert() a disparu, remplacé par un affichage dans la page.
- La validation par champ existe, avec des messages et un ordre de focus.
- L'entonnoir Plausible est instrumenté sur neuf événements.

Ce qui reste ouvert et vaut la peine : le prix, l'inversion des champs (voir plus bas), et
la question de ce que cette page doit être maintenant.

Les contraintes techniques, à respecter strictement.

1. NE CASSE PAS LE FORMULAIRE. C'est la contrainte équivalente à celle de la lisibilité sans
   JavaScript sur la page couple, et elle est plus dure : une demande perdue ne se voit pas.
   Le service /api/contact tourne sur un VPS et n'est pas modifié par ce chantier. Il REFUSE
   en 400 toute soumission où manque firstName, lastName, email ou message. Autrement dit :
   si tu fusionnes prénom et nom en un seul champ "name", comme un designer le ferait
   naturellement et comme l'audit le suggérait, TOUTE demande est rejetée en silence. Ne le
   fais pas. Les huit clés envoyées sont firstName, lastName, email, phone, enquiryType,
   groupSize, preferredDate, message, et elles doivent partir avec ces noms exacts.
   Tu peux changer l'ordre, la présentation, le groupement, l'étiquetage, ce qui est
   obligatoire à l'écran. Tu ne peux pas changer les noms ni retirer les quatre que le
   serveur exige.

2. LE PARAMÈTRE ?enquiry= DOIT CONTINUER À FONCTIONNER. booking.js le lit et présélectionne
   le motif dans le menu déroulant. Les valeurs sont private-couples, private-celebration,
   corporate, hotel, public-tour, other. Trois pages du site pointent ici avec ce paramètre.
   Vérifie-le après ta refonte, c'est le contexte que le visiteur apporte avec lui.

3. L'ENTONNOIR PLAUSIBLE DOIT SURVIVRE. Neuf événements existent : Enquiry: Form Viewed,
   Form Started, Type Selected, Group Size Selected, Submit Attempted, Submitted, Failed,
   Blocked, Abandoned. Sur la page couple, la refonte a failli tuer le tracking parce que les
   écouteurs étaient attachés une seule fois au chargement et que le nouveau composant
   déplaçait les liens. Le défaut n'aurait levé aucune erreur. Si ta refonte reconstruit ou
   déplace des champs, passe en écouteurs délégués, et dis dans ta note ce que tu as vérifié.

4. LE DICTIONNAIRE BILINGUE. Chaque chaîne visible porte data-en et data-fr, et la bascule FR
   du header s'en sert. Toute chaîne que tu ajoutes doit porter les deux. Une chaîne sans
   data-fr reste en anglais quand le visiteur bascule, et ça ne lève aucune erreur.

5. PAS DE LIBRAIRIE. HTML et CSS écrits à la main, aucune étape de build. Ce que tu dessines
   doit être implémentable en quelques dizaines de lignes de JavaScript sans dépendance.

L'inversion des champs, à traiter.

Ce qui détermine mon prix et ma faisabilité (taille du groupe, date) est facultatif et bas
dans le formulaire. Ce qui ne sert qu'à l'état civil (prénom, nom) est obligatoire et en
premier. Le visiteur donne son identité avant d'avoir dit ce qu'il veut.

Repense l'ordre. Rappel de la contrainte 1 : tu peux rendre groupSize obligatoire et
descendre lastName, tu ne peux pas supprimer lastName.

Le registre visuel.

La page couple construit un long argument éditorial avant d'annoncer son prix, et son calendrier
a été dessiné dans le système du site, pas posé dessus. Fais pareil ici. Un formulaire reste
un formulaire, mais celui-ci doit ressembler à une conversation qui commence avec quelqu'un
qui habite le quartier, pas à un ticket de support.

Mobile d'abord, 375 px. C'est là que sont mes clients.

Les états à dessiner, au minimum.

- L'arrivée depuis la page couple, avec ?enquiry=private-couples, motif déjà choisi.
- L'arrivée à froid, sans paramètre, motif à choisir.
- Le prix affiché pour deux, pour quatre, pour huit.
- Un champ en erreur, et l'erreur globale quand le serveur refuse.
- L'état de succès après envoi.
- La page en français, pour vérifier que rien ne dépasse.

Ce que j'attends comme livrable, pour ce premier tour.

Un canvas avec des artboards, plus une note en français, et PAS de code. Le code viendra au
tour 2 si je valide, comme pour le calendrier.

- La page repensée en vue d'ensemble, desktop 1440 et mobile 375.
- Le module de demande en détail, avec ses états.
- Le traitement du prix, dans la ou les directions que tu proposes.

La note doit répondre à trois choses : à quoi sert cette page maintenant, comment tu traites
le prix et pourquoi, et ce que tu as arbitré entre desktop et mobile.

Deux directions à comparer sur le traitement du prix, pas une seule. Je choisirai.

Ce qu'il ne faut pas faire.

- Ne casse pas le formulaire, relis la contrainte 1.
- Ne touche pas au service /api/contact, il est hors de ce chantier.
- N'invente aucun prix. La grille est 200 EUR plus 95 EUR par convive, rien d'autre ne fait
  foi.
- Ne réintroduis pas de promesse invérifiable. La page a porté "4.9 on TripAdvisor" sans
  compte TripAdvisor et "200+ food lovers" sans liste, les deux ont été retirés.
- Jamais de tiret cadratin, ni dans l'interface, ni dans tes notes.
```

---

## Ce qui reste hors de ce prompt

**Le service `/api/contact`.** Sa copie dans le dépôt a divergé de la version déployée par le
passé. Avant toute modification du service, récupérer le fichier réel sur le VPS. Ce chantier
ne le touche pas.

**Les mentions légales.** `Privacy`, `Terms` et `Mentions légales` pointent toujours vers
`href="#"`. Obligation légale non remplie, portée au backlog du pôle site en S8, pas du
ressort du design.
