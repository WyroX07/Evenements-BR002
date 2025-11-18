# 🎯 Plateforme Multi-Événements - Scouts d'Ecaussinnes

Application web complète pour gérer tous les événements caritatifs des sections scoutes : ventes de produits, soupers, tombolas, etc.

## ✨ Architecture V2 - Multi-Événements

### Nouveautés majeures
- **Multi-sections** : Baladins, Louveteaux, Éclaireurs, Pionniers, Unité
- **Multi-événements** : Ventes de produits, soupers, tombolas
- **IBAN par section** : Chaque section a son propre compte bancaire
- **Landing pages personnalisables** : Hero customisable par événement
- **Gestion centralisée** : Un seul site pour toutes les sections

## 📋 Fonctionnalités

### Public
- **Page d'accueil multi-événements** : Affiche tous les événements actifs groupés par section
- **Landing pages dynamiques** : Chaque événement a sa propre page personnalisée
- **Types d'événements** :
  - Ventes de produits (crémant, jus de pomme, chocolats...)
  - Soupers caritatifs
  - Tombolas
- **Processus de commande** complet (retrait, livraison, sur place)
- **Remises configurables** : Ex: "10 pour le prix de 9"
- **Confirmation par email** avec QR code et fichier ICS

### Administration
- **Dashboard multi-événements** avec filtres par section
- **CRUD complet** : Événements, produits, créneaux, commandes
- **Gestion des sections** avec IBANs propres
- **Exports** : CSV, par zone de livraison, par créneau
- **Audit logs** : Traçabilité de toutes les actions
- **Paramètres par événement** : Livraison, remises, codes postaux, etc.

## 🚀 Setup Initial

### 1. Installer les dépendances

```bash
npm install --legacy-peer-deps
```

### 2. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Une fois créé, allez dans **Settings → API**
4. Copiez :
   - `Project URL` → `SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Exécuter les migrations SQL V2

Dans Supabase, allez dans **SQL Editor** et exécutez les fichiers **V2** dans l'ordre :

```bash
1. supabase/sql/01_create_tables_v2.sql
2. supabase/sql/02_create_indexes_v2.sql
3. supabase/sql/03_enable_rls_v2.sql
4. supabase/sql/04_triggers_v2.sql
5. supabase/sql/05_seed_data_v2.sql
```

⚠️ **Important** :
- Utilisez bien les fichiers **V2** (nouvelle architecture multi-événements)
- Exécutez-les un par un dans l'ordre
- Si vous aviez déjà appliqué les V1, appliquez aussi `06_add_iban_and_payment_fields.sql`

### 4. Créer un compte Resend

1. Allez sur [https://resend.com](https://resend.com)
2. Créez un compte
3. Allez dans **API Keys** et créez une nouvelle clé
4. Copiez la clé → `RESEND_API_KEY`

**Important sur l'email sender :**
- Par défaut, l'app utilise `pionniers@resend.dev` (fonctionne directement)
- Pour utiliser votre propre domaine (ex: `contact@pionniers-ecaussinnes.be`):
  1. Ajoutez et vérifiez votre domaine dans Resend
  2. Définissez `SENDER_EMAIL=contact@pionniers-ecaussinnes.be` dans `.env`

### 5. Configurer les variables d'environnement

Copiez `.env.example` vers `.env.local` et remplissez les valeurs :

```bash
# Clés Supabase (de l'étape 2)
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Clé Resend (de l'étape 4)
RESEND_API_KEY=re_votre_cle_resend

# Mot de passe admin (déjà défini)
ADMIN_PASSWORD=@Banane123
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🔐 Accès Admin

- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Mot de passe: `@Banane123`

⚠️ **Changez ce mot de passe en production !**

## 📧 Configuration des Emails

L'application utilise **Resend** pour les emails transactionnels.

### Emails envoyés :
1. **Confirmation de commande** (client)
   - Récapitulatif de la commande
   - QR code pour identification
   - Fichier ICS si retrait (pour calendrier)
   - Instructions de paiement

2. **Notification admin** (nouveau commande)
   - Alerte simple avec lien vers le dashboard

3. **Rappel J-1** (retrait le lendemain)
   - Envoyé automatiquement via cron Vercel

### Test sans Resend
Si vous voulez tester sans configurer Resend:
1. Commentez temporairement les appels d'envoi d'email dans `/app/api/orders/route.ts`
2. L'application fonctionnera mais sans emails

## 🗄️ Structure de la Base de Données V2

### Tables principales

```
sections         → Sections scoutes (Baladins, Louveteaux, etc.)
                   - Chaque section a son IBAN propre

events           → Événements (ventes, soupers, tombolas)
                   - Liés à une section
                   - Config JSONB (hero, delivery, remises)
                   - event_type: PRODUCT_SALE | MEAL | RAFFLE

products         → Produits/Menus/Tickets
                   - Liés à un événement
                   - product_type: ITEM | MENU | TICKET

slots            → Créneaux horaires
                   - Retraits pour ventes
                   - Dates pour soupers

orders           → Commandes/Réservations
                   - Universelles pour tous types d'événements
                   - delivery_type: PICKUP | DELIVERY | ON_SITE
                   - payment_method: BANK_TRANSFER | ON_SITE

order_items      → Lignes de commande
settings         → Paramètres globaux
audit_logs       → Traçabilité des actions admin
```

### Relations clés

```
Section → Events (1:N)
Event → Products (1:N)
Event → Slots (1:N)
Event → Orders (1:N)
Order → Order_Items (1:N)
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Démarrage développement
npm run build        # Build production
npm start            # Démarrage production
npm run lint         # Linter
npm run type-check   # Vérification TypeScript
npm test             # Tests unitaires (Vitest)
npm run test:e2e     # Tests E2E (Playwright)
npm run seed         # Script de seed (si besoin)
```

## 📦 Déploiement sur Vercel

### 1. Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <votre-repo>
git push -u origin main
```

### 2. Connecter à Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Importez votre repository GitHub
3. Ajoutez toutes les variables d'environnement (depuis `.env.local`)
4. Déployez !

### 3. Configuration du Cron (rappels J-1)

Le cron est déjà configuré dans `vercel.json` :
- **Route**: `/api/cron/reminders`
- **Fréquence**: Tous les jours à 08:00 Europe/Brussels

Vercel activera automatiquement le cron après le premier déploiement.

## 📡 APIs Disponibles

### APIs Publiques

```
GET  /api/events                  → Liste tous les événements actifs
GET  /api/events/[slug]           → Détails d'un événement
GET  /api/sections                → Liste toutes les sections
POST /api/orders                  → Créer une commande (V2 avec event_id)
```

### APIs Admin (authentifiées)

```
# Événements
GET    /api/admin/events                     → Liste tous les événements
POST   /api/admin/events                     → Créer un événement
GET    /api/admin/events/[id]                → Détails d'un événement
PATCH  /api/admin/events/[id]                → Mettre à jour un événement
DELETE /api/admin/events/[id]                → Supprimer un événement

# Produits
GET    /api/admin/events/[id]/products       → Liste des produits
POST   /api/admin/events/[id]/products       → Créer un produit
PATCH  /api/admin/events/[id]/products       → Mettre à jour un produit
DELETE /api/admin/events/[id]/products       → Supprimer un produit

# Créneaux
GET    /api/admin/events/[id]/slots          → Liste des créneaux
POST   /api/admin/events/[id]/slots          → Créer un créneau
PATCH  /api/admin/events/[id]/slots          → Mettre à jour un créneau
DELETE /api/admin/events/[id]/slots          → Supprimer un créneau

# Commandes
GET    /api/admin/orders                     → Liste des commandes (filtres multiples)
PATCH  /api/admin/orders?orderId=...         → Mettre à jour une commande
DELETE /api/admin/orders?orderId=...         → Annuler une commande
```

## 🎨 Personnalisation

### Créer un nouvel événement

1. **Via Admin** (interface à venir)
2. **Via API** :

```json
POST /api/admin/events
{
  "slug": "cremant-pionniers-2025",
  "section_id": "uuid-section",
  "event_type": "PRODUCT_SALE",
  "status": "DRAFT",
  "name": "Vente de Crémant 2025",
  "description": "Soutenez les Pionniers...",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "hero_config": {
    "title": "Vente de Crémant 2025",
    "subtitle": "Maison Lissner",
    "description": "...",
    "features": ["Remise 10 pour 9", "Livraison gratuite"],
    "cta_text": "Commander maintenant"
  },
  "config": {
    "delivery_enabled": true,
    "delivery_min_bottles": 5,
    "discount_10for9": true,
    "allowed_zip_codes": ["1400", "7190"],
    "order_code_prefix": "CRE"
  }
}
```

### Couleurs par section

Chaque section a sa couleur définie dans la DB :
- Baladins: `#FF6B35` (orange)
- Louveteaux: `#F7931E` (jaune)
- Éclaireurs: `#00A651` (vert)
- Pionniers: `#0071BC` (bleu)
- Unité: `#8B4789` (violet)

Modifiables dans Admin → Sections

## 🧪 Tests

### Tests Unitaires (Vitest)
```bash
npm test
```

Couvrent :
- Calculs de remise
- Validations Zod
- Utilitaires

### Tests E2E (Playwright)
```bash
npm run test:e2e
```

Couvrent :
- Flux de commande complet
- Login admin
- Changement de statut

## 🐛 Dépannage

### Erreur "SUPABASE_URL must be defined"
→ Vérifiez que `.env.local` contient bien les clés Supabase

### Erreur "Failed to create order"
→ Vérifiez que les migrations SQL ont bien été exécutées

### Emails non envoyés
→ Vérifiez que `RESEND_API_KEY` est correcte et que le domaine est vérifié

### "Créneau complet" alors qu'il reste de la place
→ Allez dans Admin → Créneaux et vérifiez la capacité

## 📞 Support

Pour toute question technique, consultez la documentation :
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Resend](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 Licence

Projet privé - Les Pionniers d'Ecaussinnes © 2024
