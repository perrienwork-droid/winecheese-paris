# Guide Configuration VPS — Wine & Cheese Paris
> IP VPS : 51.38.178.247  
> Hostname : vps-0507b13d.vps.ovh.net  
> OS : Debian 12  
> Domaine : winecheese.paris  
> Email cible : thomas@cobaltt.fr

---

## ÉTAPE 1 — Première connexion SSH

OVH t'a envoyé un email avec le mot de passe root au moment de la création du VPS.  
Ouvre **Terminal** sur ton Mac et tape :

```bash
ssh root@51.38.178.247
```

Tape le mot de passe reçu par email. Tu es maintenant connecté à ton serveur.

---

## ÉTAPE 2 — Mise à jour du système

La première chose à faire absolument :

```bash
apt update && apt upgrade -y
```

Attends que ça se termine (2-3 min).

---

## ÉTAPE 3 — Créer un utilisateur sécurisé (ne jamais utiliser root au quotidien)

```bash
adduser thomas
```

→ Choisis un mot de passe fort, remplis les infos (ou appuie sur Entrée pour passer).

```bash
usermod -aG sudo thomas
```

---

## ÉTAPE 4 — Sécuriser SSH

### 4a. Copier ta clé SSH depuis ton Mac (dans un NOUVEAU terminal sur ton Mac)

```bash
ssh-copy-id thomas@51.38.178.247
```

Si tu n'as pas de clé SSH, crée-en une d'abord :
```bash
ssh-keygen -t ed25519 -C "thomas@winecheese.paris"
```
Puis recommence le `ssh-copy-id`.

### 4b. Désactiver le login par mot de passe (sur le VPS)

```bash
sudo nano /etc/ssh/sshd_config
```

Modifie ces lignes :
```
PermitRootLogin no
PasswordAuthentication no
```

Sauvegarde : `Ctrl+X` → `Y` → `Entrée`

```bash
sudo systemctl restart sshd
```

⚠️ Avant de fermer ta session root, ouvre un nouveau terminal et teste :
```bash
ssh thomas@51.38.178.247
```
Si ça fonctionne, tu peux fermer la session root.

---

## ÉTAPE 5 — Configurer le pare-feu (UFW)

```bash
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp   # Dokploy dashboard (temporaire)
sudo ufw enable
sudo ufw status
```

---

## ÉTAPE 6 — Installer Fail2ban (protection anti-brute force)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## ÉTAPE 7 — Installer Dokploy

Une seule commande (en root ou avec sudo) :

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Attends 3-5 minutes. À la fin, tu verras une URL d'accès.

### Accéder au dashboard Dokploy
Ouvre dans ton navigateur :
```
http://51.38.178.247:3000
```

Crée ton compte admin (email + mot de passe fort).

---

## ÉTAPE 8 — Connecter GitHub à Dokploy

Dans Dokploy :
1. **Settings → Git Providers → GitHub** → connecte ton compte GitHub
2. **Projects → New Project** → nomme-le "winecheese-paris"
3. **Add Service → Application**
4. Sélectionne le repo `perrienwork-droid/winecheese-paris`
5. Branch : `main`
6. Build : **Static** (site HTML pur, pas de compilation)
7. Dokploy va déployer automatiquement à chaque push GitHub

---

## ÉTAPE 9 — Configurer le domaine dans Dokploy

Dans ton service winecheese-paris :
1. **Domains → Add Domain**
2. Domaine : `winecheese.paris`
3. HTTPS : activer (Let's Encrypt, certificat SSL gratuit automatique)
4. Répète pour `www.winecheese.paris`

---

## ÉTAPE 10 — Configurer le DNS chez OVH

Dans le Manager OVH → **Web Cloud → Noms de domaine → winecheese.paris → Zone DNS** :

Ajoute / modifie ces enregistrements :

| Type | Sous-domaine | Valeur | TTL |
|------|-------------|--------|-----|
| A | @ (vide) | 51.38.178.247 | 3600 |
| A | www | 51.38.178.247 | 3600 |
| CNAME | mail | winecheese.paris. | 3600 |
| MX | @ | mx0.mail.ovh.net. | 3600 |
| MX | @ | mx1.mail.ovh.net. | 3600 |
| TXT | @ | "v=spf1 include:mx.ovh.com ~all" | 3600 |

⚠️ La propagation DNS peut prendre 24-48h mais souvent 1-2h chez OVH.

---

## ÉTAPE 11 — Redirection Email

### Option A (la plus simple) — Redirection dans OVH Manager

OVH Manager → **Web Cloud → Emails → winecheese.paris → Redirections** :

- Email source : `hello@winecheese.paris`
- Email cible : `thomas@cobaltt.fr`
- Garde une copie locale : Non
- Coche "Garder une copie sur le serveur" si tu veux une archive

Répète pour :
- `contact@winecheese.paris` → `thomas@cobaltt.fr`
- `bonjour@winecheese.paris` → `thomas@cobaltt.fr` (optionnel)

⚠️ Pour que les emails "from: hello@winecheese.paris" n'arrivent pas en spam chez les destinataires, OVH configure automatiquement SPF. Vérifie que l'enregistrement TXT SPF ci-dessus est bien en place.

---

## ÉTAPE 12 — Désactiver le port Dokploy (sécurité)

Une fois le domaine configuré avec SSL, ferme le port 3000 public :

```bash
sudo ufw delete allow 3000/tcp
```

Dokploy sera accessible uniquement via son sous-domaine sécurisé HTTPS.

---

## Récap Sécurité Checklist

- [ ] Root login SSH désactivé
- [ ] Authentification par clé SSH uniquement (plus de mot de passe)
- [ ] UFW firewall actif (80, 443, 22 seulement)
- [ ] Fail2ban actif
- [ ] SSL/HTTPS via Let's Encrypt (Dokploy)
- [ ] Port 3000 fermé en production
- [ ] Backups OVH automatiques activés (déjà actif selon le dashboard)

---

## Commandes utiles au quotidien

```bash
# Se connecter au VPS
ssh thomas@51.38.178.247

# Voir les logs Dokploy
docker logs dokploy

# Voir les services qui tournent
docker ps

# Redémarrer un service
docker restart <nom-du-container>

# Mise à jour sécurité
sudo apt update && sudo apt upgrade -y
```
