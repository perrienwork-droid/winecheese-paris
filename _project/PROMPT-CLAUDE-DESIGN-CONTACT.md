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

## Le prompt du tour 2, le code d'intégration

Écrit après revue du canvas du tour 1 (`Refonte-page-demande.dc.html`). Le tour 1 est validé
sur le fond, y compris ses trois pièges de tracking, vérifiés ligne à ligne dans
`contact.html` et tous exacts. Ce tour tranche la direction et ajoute quatre points.

```
Tour 2. Le code d'intégration.

Ton canvas du tour 1 est validé, et la note est juste. Relis-la avant de coder : tout ce qui
n'est pas mentionné ci-dessous est validé tel quel et doit être implémenté comme tu l'as
décrit.

Sont notamment validés sans réserve : le rôle que tu donnes à la page, l'ordre motif,
convives, prix, date, message, identité, l'intertitre qui dit pourquoi on demande le nom, le
retrait de "or budget" du titre, la disparition des mentions "From €120/person" et
"From €95/person" des trois cartes, le par-personne passé en secondaire sous le total, la
carte en deux colonnes sur desktop et en une seule sur mobile, la géométrie de l'encoche
rouverte (héros 660 px, débord 150 px), et la ligne de déflexion vers le calendrier.

La direction retenue : 1b, avec 1a comme plancher.

Ton argument est le bon : 1b se justifie parce qu'il contient 1a, pas contre elle. Le tableau
de quatre lignes reste dans le HTML servi, replié, et c'est lui qui dit la vérité sur le prix
quand le JavaScript ne s'exécute pas.

La réponse à ta question sur le convive seul.

Garde ta proposition : une ligne discrète sous les pastilles, pas de pastille "1". Elle
n'affiche pas une offre solo mais ne refuse pas une demande solo, ce qui est exactement le
bon compromis. Ne change rien.

La réponse à ta question sur la propriété size de Plausible.

Envoie le nombre exact, "4", et pas la tranche. La comparaison historique ne vaut rien ici :
il y a trois demandes en tout dans l'historique. Le nombre exact dans l'email de notification
vaut beaucoup plus.

Quatre ajouts.

1. INSTRUMENTE LA DÉFLEXION. C'est la meilleure idée de ton canvas et c'est celle qui va
   passer pour une régression si on ne la mesure pas. Envoyer les couples vers le calendrier
   va faire BAISSER le nombre de demandes sur cette page. Jugée au compteur de demandes, la
   refonte aura l'air d'un échec alors qu'elle aura converti mieux et plus vite.
   Ajoute un événement dédié sur ce lien, par exemple "Enquiry: Deflected to Calendar", et
   écris dans ta note comment lire le succès de la refonte : demandes qualifiées plus ventes
   du calendrier, jamais demandes seules.

2. NE TOUCHE PAS À "8 to 20 guests", ni pour le changer ni pour le retirer. C'est le texte
   déjà en ligne, donc ce n'est pas ton invention, mais il est peut-être faux : la petite cave
   plafonne à 8 convives et la capacité réelle de la grande salle est annoncée à 16 sans avoir
   jamais été confirmée. Je dois la vérifier auprès de la cave avant qu'on y touche. Laisse la
   chaîne exactement telle quelle et signale-le dans ta note comme une vérification qui
   m'appartient.

3. MESURE LA POSITION DU BOUTON D'ENVOI SUR MOBILE, ne l'estime pas. Douze pastilles prennent
   environ 170 px là où le menu déroulant en prenait 48, et le bouton passe désormais après
   six blocs. Le chiffre à ne pas perdre est 1,8 écran, c'est le gain que le module en encoche
   avait acheté. Donne-moi la mesure réelle en 375 px de large. Si tu dépasses, dis-le et
   propose ce que tu retirerais.

4. NOTE LE COUPLAGE DES DEUX PAGES. La ligne "€195 each. The same price as the dates on the
   calendar" lie cette page au prix du calendrier. Si le prix du calendrier bouge un jour,
   cette phrase ment en silence. Ajoute-le au runbook des créneaux, dans la section qui liste
   ce qu'il faut toucher quand un prix change.

Ce que "sans JavaScript" veut dire ici, précisément.

Cette page n'a pas la même contrainte que la page couple, et je ne veux pas que tu te
trompes de cible. Le formulaire est <form id="contactForm" novalidate> SANS attribut action,
et l'envoi passe entièrement par fetch. Sans JavaScript, il ne fonctionne donc déjà pas
aujourd'hui : soumettre recharge la page et perd la saisie.

Ce n'est pas ton problème et je ne te demande pas de le régler, ça demanderait de toucher au
service, qui est hors chantier. Ce que j'exige est plus étroit : LE PRIX doit rester lisible
sans JavaScript, par le tableau de 1a servi dans le HTML. Ne rends pas le prix dépendant du
script, c'est tout.

Les contraintes du tour 1 restent valables, rappelées en une ligne chacune.

Les huit clés partent inchangées : firstName, lastName, email, phone, enquiryType, groupSize,
preferredDate, message. Le serveur refuse en 400 sans firstName, lastName, email ou message,
donc rien n'est fusionné ni supprimé. Le menu enquiryType garde son id et ses six valeurs
pour que booking.js continue de lire ?enquiry=. Les neuf événements Plausible survivent, y
compris tes trois pièges. Chaque chaîne porte data-en et data-fr. Aucune librairie. Aucune
fausse rareté. Pas de tiret cadratin.

Ce que je veux recevoir.

Le code, sur une branche, jamais sur main : pousser sur main déclenche le déploiement.
Nomme-la feat/parcours-demande. Si tu ne peux pas pousser, rends-moi les fichiers modifiés.

Fichiers concernés : contact.html, et _project/RUNBOOK-CRENEAUX.md pour le point 4. Si tu as
besoin de toucher tokens.css ou shared.css, dis-le et justifie-le, ne le fais pas en silence.
Ne touche pas au service /api/contact.

Le pré-vol, à faire avant de me rendre la main, et à me rapporter point par point.

1. LE CONTRAT DU FORMULAIRE, et c'est le contrôle le plus important. Intercepte fetch dans le
   navigateur, remplis le formulaire, soumets, et montre-moi le corps JSON exact qui serait
   parti : les huit clés, avec ces noms, et des valeurs cohérentes avec ce qui a été saisi.
   N'envoie rien pour de vrai, une demande de test atterrirait dans ma boîte.
2. Les six valeurs de ?enquiry= présélectionnent bien le motif, testées une par une.
3. Les neuf événements Plausible partent, et en particulier les trois que tu avais repérés :
   un clic sur une pastille émet Group Size Selected, le premier geste sur une pastille émet
   Form Started, et une erreur de validation sur les convives met le focus sur une pastille et
   non sur un input caché.
4. La bascule FR ne laisse aucune chaîne en anglais, y compris la ligne de prix générée.
5. JavaScript coupé : le tableau de prix est lisible dans le HTML servi.
6. La position du bouton d'envoi en 375 px, mesurée, comparée aux 1,8 écran actuels.
7. Les six pages du site répondent en 200 et la console est vide, en 1440 et en 375.

Dis-moi aussi franchement ce que tu n'as pas pu vérifier.

Ce qu'il ne faut pas faire.

- Ne casse pas le formulaire, c'est la seule erreur de ce chantier qui ne se voit pas.
- N'envoie aucune demande de test sur /api/contact.
- Ne touche pas au service, ni à "8 to 20 guests".
- N'invente aucun prix. La grille est 200 EUR plus 95 EUR par convive.
- Jamais de tiret cadratin, ni dans l'interface, ni dans le runbook, ni dans les commits.
```

---

## Ce qui reste hors de ce prompt

**Le service `/api/contact`.** Sa copie dans le dépôt a divergé de la version déployée par le
passé. Avant toute modification du service, récupérer le fichier réel sur le VPS. Ce chantier
ne le touche pas.

**Les mentions légales.** `Privacy`, `Terms` et `Mentions légales` pointent toujours vers
`href="#"`. Obligation légale non remplie, portée au backlog du pôle site en S8, pas du
ressort du design.
