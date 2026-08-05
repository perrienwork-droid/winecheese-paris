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
| Validation JS du formulaire + événement `Enquiry: Blocked` (session Claude Code parallèle) | Fait et déployé. Champs obligatoires (firstName, lastName, email, enquiryType, message), format email (`@` + `.` après le `@`), téléphone optionnel mais doit commencer par `+`. Au premier champ en faute : `focus()`, message d'erreur inline sous le champ, `aria-invalid`/`aria-describedby`, événement `Enquiry: Blocked` (props: `field`). Remplace l'`alert()` du chemin d'échec réseau/serveur par un bandeau inline dans la carte du formulaire. Corrige une régression introduite par cette validation : le flag interne de suivi d'abandon ne se marquait "soumis" que sur une soumission ayant passé la validation, plus sur chaque clic "Send message" (sinon un visiteur bloqué puis parti n'aurait plus déclenché `Enquiry: Abandoned`). Vérifié en local (navigateur, mocks JS) : soumission vide → bloquée, 0 requête réseau ; abandon après blocage → toujours détecté ; parcours valide → inchangé. Non redondant avec 1.2/1.4 ci-dessus : cette fiche est celle où le travail a réellement été fait dans cette session-ci | contact.html |
| Migration Plausible vers self-hosted (`analytics.winecheese.paris`) | Fait et déployé. Plausible Community Edition v3.2.1 déployé sur le VPS existant (`~/apps/plausible-ce/`, Postgres + ClickHouse), port interne 8010 non exposé publiquement (binding `127.0.0.1`/`172.17.0.1` + règles ufw restreintes aux plages Docker internes). DNS `analytics.winecheese.paris → 51.38.178.247` ajouté dans la zone OVH, certificat Let's Encrypt valide via Traefik (même pattern que `winecheese.paris`). Les 5 pages basculées du script `plausible.io` vers le script par-site self-hosted (plus de `data-domain`, remplacé par l'URL du script). Compte admin créé par Thomas (Claude ne crée pas de compte ni n'entre de mot de passe). Les 15 objectifs Plausible recréés dans la nouvelle instance sous le schéma `Enquiry:`/`CTA:`/`Outbound:`/`FAQ:` déjà en place, plus `Enquiry: Blocked` (voir `_project/TRACKING-PLAN.md`, mis à jour) | index.html, about.html, contact.html, wine-cheese-walk.html, food-tour.html, `_project/TRACKING-PLAN.md`, infra VPS (hors repo git) |
| PR, merge, déploiement production | Fait. Commit + PR #1 sur GitHub (`perrienwork-droid/winecheese-paris`), squash-mergé sur `main` avec accord explicite de Thomas, poussé sur le remote `vps` (déclenche le déploiement Dokploy, `/var/www/winecheese`). Vérifié en prod après déploiement : `contact.html` sert la nouvelle validation (`Enquiry: Blocked` présent dans le HTML servi), `index.html` pointe vers `analytics.winecheese.paris`, le script self-hosted répond HTTP 200 | déploiement (pas de fichier applicatif) |
