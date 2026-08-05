# Chantier, parcours de demande winecheese.paris

Suivi des décisions prises pendant la session de refonte du parcours de demande.
Format : point, décision (fait, refusé, reporté), fichiers touchés.

## Protocole ajusté (avant le LOT 1)

Constat de départ : une partie du LOT 0 (audit) et du LOT 1 avait déjà été traitée
dans des sessions précédentes, non commitée. Décisions de Thomas pour ajuster le
protocole :

- **1.1 à 1.4** : gardés tels quels, non rouverts, marqués "fait" ci-dessous sans
  fiche de validation individuelle.
- **LOT 3 (instrumentation)** : le schéma d'événements déjà en place (`Enquiry: *`,
  documenté dans `_project/TRACKING-PLAN.md` du repo, correspondance avec
  `PLAN-PLAUSIBLE.md` du dossier audit) est conservé tel quel. Le tableau du LOT 3
  du brief original (`Contact Form Viewed`, etc.) est abandonné au profit du
  schéma existant.
- **LOT 2 à 6** : avant chaque fiche, vérification de l'état réel du code. Si un
  point semble déjà résolu, c'est signalé explicitement dans la fiche au lieu
  d'être proposé comme un nouveau correctif.

## Journal

| Point | Décision | Fichiers |
|---|---|---|
| LOT 0 (audit préalable) | Fait (session précédente, `AUDIT-PARCOURS-DEMANDE.md`) + reconfirmé cette session (0.1, 0.2, 0.3) | contact.html, _project/contact-api/server.js (lecture seule) |
| 1.1 Garde Plausible (`safeTrack`, stub officiel) | Fait, gardé tel quel | contact.html, analytics.js |
| 1.2 Validation JavaScript du formulaire | Fait, gardé tel quel | contact.html |
| 1.3 Option "1-2" du groupSize | Fait, gardé tel quel | contact.html |
| 1.4 Bandeau d'erreur inline (remplace `alert()`) | Fait, gardé tel quel | contact.html |
| 1.5 Validation serveur du téléphone | Fait et déployé. Copie locale patchée contre la vraie version en prod (récupérée par SSH, elle divergeait du repo, cf. 0.2), scp sur le VPS, service `winecheese-contact` redémarré. Vérifié en prod : téléphone sans "+" → 400 "Invalid phone", numéro valide → 200 (email de test réellement envoyé à hello@winecheese.paris) | _project/contact-api/server.js (hors repo git winecheese) |
| 1.6 Injection HTML dans l'email de notification | Fait et déployé. Fonction `esc()` (échappement `& < > " '`) appliquée à tous les champs interpolés dans le HTML de l'email et dans le sujet ; fallback `|| '—'` appliqué avant l'échappement, pas après (sinon `esc(undefined)` renvoie la chaîne "undefined", toujours truthy). Testé localement (node -e) puis en prod avec un payload `<script>` dans firstName : requête acceptée (200), email de test réellement envoyé à hello@winecheese.paris pour vérification visuelle par Thomas | _project/contact-api/server.js (hors repo git winecheese) |
| 2.1 Délai de réponse 24h → 4h | Fait. Formulation retenue (2/3) : "Thomas typically replies within 4 hours" / "Thomas répond généralement sous 4 heures", appliquée aux 4 emplacements (badge, sous-titre, note sous bouton, message de succès), adaptée à la syntaxe de chaque phrase. Vérifié dans le navigateur (rendu EN et FR via data-en/data-fr) | contact.html |
