# Document de Reprise - Projet Crémant Pionniers

**Date**: 18 Novembre 2025
**Projet**: cremant-pionniers (Plateforme de vente de crémants/vins pour scouts)

---

## 🚨 PROBLÈME CRITIQUE À RÉSOUDRE EN PRIORITÉ

### Migration SQL Non Exécutée

**Symptôme**: La page de l'événement "Crémant Pionniers 2025" retourne une erreur 404 avec le message :
```
Server Error: "column products_1.is_wine does not exist"
```

**Cause**: La migration SQL pour ajouter les champs détaillés des vins n'a jamais été exécutée sur la base de données Supabase.

**Fichier de migration**: `supabase/migrations/20250114_add_wine_details.sql`

**Solution**: Exécuter manuellement la migration dans le SQL Editor de Supabase

### ⚡ ÉTAPES À SUIVRE IMMÉDIATEMENT

1. **Ouvrir le SQL Editor de Supabase**
   URL: https://supabase.com/dashboard/project/dcctmozipqrdezqsdzxf/sql

2. **Copier-coller et exécuter ce SQL** :

```sql
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_wine BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vintage TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS aromas TEXT,
ADD COLUMN IF NOT EXISTS balance TEXT,
ADD COLUMN IF NOT EXISTS food_pairings TEXT,
ADD COLUMN IF NOT EXISTS conservation TEXT,
ADD COLUMN IF NOT EXISTS grape_variety TEXT,
ADD COLUMN IF NOT EXISTS wine_type TEXT,
ADD COLUMN IF NOT EXISTS appellation TEXT,
ADD COLUMN IF NOT EXISTS special_mentions TEXT[],
ADD COLUMN IF NOT EXISTS residual_sugar_gl INTEGER,
ADD COLUMN IF NOT EXISTS limited_stock BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS highlight_badge TEXT,
ADD COLUMN IF NOT EXISTS producer TEXT,
ADD COLUMN IF NOT EXISTS origin TEXT;
```

3. **Vérifier que la migration a réussi**
   Vous devriez voir un message de confirmation dans le SQL Editor

4. **Tester l'affichage de l'événement**
   Aller sur: http://localhost:3001/event/cremant-pionniers-2025
   La page devrait maintenant se charger correctement

---

## ✅ FONCTIONNALITÉS DÉJÀ IMPLÉMENTÉES

### 1. Système de Codes Promo
- ✅ Table `promo_codes` créée et migrée
- ✅ API de validation des codes (`/api/promo-codes/validate`)
- ✅ API CRUD admin (`/api/admin/promo-codes`)
- ✅ Interface admin de gestion des codes promo
- ✅ Intégration dans le tunnel de commande (frontend)
- ✅ Calcul automatique de la réduction lors de la commande

### 2. Export Excel des Commandes
- ✅ Dépendance `xlsx` installée
- ✅ API `/api/admin/orders/export` fonctionnelle
- ✅ Bouton d'export dans l'interface admin
- ✅ Export avec toutes les données (client, produits, livraison, paiement, code promo)

### 3. Import CSV des Produits
- ✅ API `/api/admin/events/[id]/products/import`
- ✅ Interface UI avec prévisualisation
- ✅ Template Google Sheets pré-rempli
- ✅ Séparateur point-virgule (`;`) pour compatibilité Excel français
- ✅ Validation Zod des données importées

### 4. Allergènes et Végétarien/Vegan
- ✅ Migration SQL exécutée (`allergens`, `is_vegetarian`, `is_vegan`)
- ✅ Formulaire admin pour saisir les allergènes
- ✅ Affichage des allergènes dans les cartes produits (desktop + mobile)
- ✅ Icônes visuelles pour VG/VGN

### 5. Page Persistante de Commande
- ✅ Route `/commande/[code]` créée
- ✅ Permet aux clients de retrouver leur commande avec le code
- ✅ Lien inclus dans l'email de confirmation

### 6. Recherche et Filtres des Commandes (Admin)
- ✅ Recherche par nom, email, code de commande
- ✅ Filtres par statut (PENDING, PAID, etc.)
- ✅ Interface admin améliorée

### 7. Système d'Emails Transactionnels (Resend)
- ✅ Configuration Resend dans `.env.local`
- ✅ Template HTML d'email de confirmation riche et responsive
- ✅ Intégration dans `/api/orders/route.ts`
- ✅ Email envoyé automatiquement après création de commande
- ✅ Affichage conditionnel selon mode de livraison et paiement

**⚠️ Note**: Les clés API Resend doivent être configurées :
```env
RESEND_API_KEY=re_... (à fournir)
SENDER_EMAIL=noreply@pionniers-ecaussinnes.be (à configurer avec domaine vérifié)
```

### 8. Système de Détails Vins (EN COURS)
- ✅ Migration SQL créée (`20250114_add_wine_details.sql`)
- ✅ 16 nouveaux champs pour vins/crémants/champagnes
- ✅ API produits mise à jour pour gérer les champs vins
- ✅ Affichage client enrichi avec détails vins
- ❌ **MIGRATION NON EXÉCUTÉE** (voir section critique ci-dessus)

### 9. Lien Admin dans le Header
- ✅ Lien "Admin" visible dans le header
- ✅ Redirection vers `/admin/login` si non authentifié

---

## 📋 TÂCHES RESTANTES (PAR PRIORITÉ)

### 🔴 PRIORITÉ HAUTE

#### 1. Exécuter la Migration SQL des Champs Vins (URGENT)
**Pourquoi**: Bloque l'affichage de la page événement
**Fichier**: `supabase/migrations/20250114_add_wine_details.sql`
**Action**: Voir section "PROBLÈME CRITIQUE" ci-dessus

#### 2. Configurer Resend pour les Emails
**État actuel**: Code implémenté mais clés API manquantes
**Fichiers concernés**:
- `.env.local` (RESEND_API_KEY, SENDER_EMAIL)
- `lib/emails.ts`
- `app/api/orders/route.ts`

**Actions**:
1. Créer un compte Resend (https://resend.com)
2. Obtenir la clé API
3. Vérifier un domaine personnalisé (ex: pionniers-ecaussinnes.be)
4. Mettre à jour `.env.local` :
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@pionniers-ecaussinnes.be
```
5. Tester l'envoi d'email en créant une commande de test

### 🟡 PRIORITÉ MOYENNE

#### 3. Créer Composants Réutilisables
**Objectif**: Améliorer la maintenabilité du code
**Composants à créer**:
- `components/ui/Badge.tsx` - Badges génériques (nouveau, promo, etc.)
- `components/ui/ProductCard.tsx` - Carte produit unifiée
- `components/ui/WineDetails.tsx` - Affichage détails vins
- `components/ui/AllergenTag.tsx` - Tag allergène

**Bénéfices**: Code plus propre, styles cohérents, moins de duplication

#### 4. Annuler un Code Promo sur une Commande Spécifique
**Contexte**: Un admin peut vouloir retirer un code promo appliqué sur une commande
**Localisation**: Page admin des commandes
**Actions**:
1. Ajouter bouton "Retirer le code promo" dans les détails de commande
2. Créer API PATCH `/api/admin/orders/[id]/remove-promo`
3. Recalculer le total de la commande
4. Mettre à jour le statut `promo_used_count` du code promo
5. Logger l'action dans `audit_logs`

#### 5. Templates d'Événements (Vente vs Souper)
**Objectif**: Créer des presets pour faciliter la création d'événements
**Types**:
- **Template Vente**: Crémants/vins avec livraison/retrait
- **Template Souper**: Menu/plats avec paiement sur place

**Localisation**: Page admin de création d'événement
**Actions**:
1. Créer table `event_templates` (optionnel, ou hardcoder)
2. Ajouter dropdown "Type d'événement" dans le formulaire
3. Pré-remplir les champs selon le template choisi
4. Configurer les modes de livraison/paiement par défaut

#### 6. Duplication d'Événement
**Objectif**: Copier un événement existant pour gagner du temps
**Localisation**: Page admin liste des événements
**Actions**:
1. Ajouter bouton "Dupliquer" à côté de chaque événement
2. Créer API POST `/api/admin/events/[id]/duplicate`
3. Copier l'événement + tous les produits + tous les créneaux
4. Incrémenter le nom (ex: "Crémant 2025" → "Crémant 2025 (Copie)")
5. Définir le nouvel événement en mode DRAFT par défaut

### 🟢 PRIORITÉ BASSE (Nice-to-have)

#### 7. Modification Rapide de Commande
**Objectif**: Permettre à l'admin de modifier une commande rapidement
**Fonctionnalités**:
- Modifier les quantités de produits
- Ajouter/retirer des produits
- Changer l'adresse de livraison
- Modifier le créneau de retrait

**Localisation**: Modal dans la page admin des commandes
**Actions**:
1. Créer modal `EditOrderModal`
2. API PATCH `/api/admin/orders/[id]`
3. Validation : ne pas permettre modification si commande déjà livrée
4. Recalculer automatiquement le total
5. Logger dans `audit_logs`

#### 8. Dashboard Admin avec Stats
**Objectif**: Vue d'ensemble rapide de l'activité
**Stats à afficher**:
- Nombre de commandes (total, par statut)
- Chiffre d'affaires total et par événement
- Top 5 des produits les plus vendus
- Taux de conversion des codes promo
- Graphique de l'évolution des ventes

**Localisation**: Page `/admin` (remplacer la page actuelle)
**Technologies**:
- `recharts` pour les graphiques
- Requêtes SQL agrégées via Supabase

#### 9. Statuts de Commande avec Dropdown
**Objectif**: Changer le statut d'une commande rapidement
**Localisation**: Liste des commandes admin
**Statuts**:
- PENDING (En attente)
- PAID (Payée)
- PREPARED (Préparée)
- DELIVERED (Livrée)
- CANCELLED (Annulée)

**Actions**:
1. Remplacer le badge statique par un `<select>`
2. API PATCH `/api/admin/orders/[id]/status`
3. Changer la couleur selon le statut
4. Logger dans `audit_logs`

#### 10. Liste Imprimable par Créneau
**Objectif**: Imprimer la liste des commandes pour un créneau donné
**Cas d'usage**: Organisation du retrait des commandes
**Localisation**: Page admin des créneaux
**Actions**:
1. Page `/admin/events/[id]/slots/[slotId]/print`
2. Affichage optimisé pour l'impression (CSS `@media print`)
3. Liste groupée par client avec détail des produits
4. Checkbox pour cocher les commandes retirées
5. Bouton "Marquer tout comme livré"

---

## 🗂️ STRUCTURE DU PROJET

### Fichiers Clés Modifiés Récemment

#### Backend (API Routes)
- `app/api/orders/route.ts` - Création de commande + envoi email
- `app/api/admin/events/[id]/products/route.ts` - CRUD produits avec champs vins
- `app/api/admin/events/[id]/products/import/route.ts` - Import CSV
- `app/api/admin/orders/export/route.ts` - Export Excel
- `app/api/admin/promo-codes/route.ts` - CRUD codes promo
- `app/api/promo-codes/validate/route.ts` - Validation code promo

#### Frontend (Pages)
- `app/event/[slug]/page.tsx` - Page événement (ERREUR ACTUELLE)
- `app/commande/[code]/page.tsx` - Page persistante de commande
- `app/admin/promo-codes/page.tsx` - Gestion codes promo admin

#### Utilitaires
- `lib/emails.ts` - Système d'emails Resend
- `lib/supabase/server.ts` - Client Supabase serveur

#### Migrations SQL
- `supabase/migrations/20250114_add_wine_details.sql` - **NON EXÉCUTÉE**
- `supabase/migrations/20250112_add_allergens.sql` - Exécutée ✅
- `supabase/migrations/20250110_add_promo_codes.sql` - Exécutée ✅

#### Scripts
- `scripts/run-migration.js` - Tentative d'exécution migration (ne fonctionne pas)

### Configuration Environnement (.env.local)

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3008

# Admin Authentication
ADMIN_PASSWORD=@Banane123

# Resend Email Service (⚠️ À CONFIGURER)
RESEND_API_KEY=                              # ← À FOURNIR
SENDER_NAME="Les Pionniers d'Ecaussinnes"
SENDER_EMAIL=                                # ← À FOURNIR (domaine vérifié)

# Supabase
SUPABASE_URL=https://dcctmozipqrdezqsdzxf.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Configuration
NEXT_PUBLIC_PICKUP_ADDRESS="Rue des fontenelles 26, 7190 Ecaussinnes"
DELIVERY_ALLOWED_ZONES=["1400","1348","1340","7100","7060","7090","7180"]
DELIVERY_MIN_BOTTLES=5
DELIVERY_FEE_CENTS=0
DISCOUNT_10FOR9=true
CONTACT_EMAIL=contact@pionniers-ecaussinnes.be
```

---

## 🎯 PROCHAINES ACTIONS RECOMMANDÉES

### Session Suivante - Ordre Suggéré

1. **[5 min]** Exécuter la migration SQL des champs vins dans Supabase
2. **[2 min]** Vérifier que la page `/event/cremant-pionniers-2025` se charge
3. **[15 min]** Configurer Resend (compte + domaine + clés API)
4. **[5 min]** Tester l'envoi d'email de confirmation
5. **[30 min]** Créer les composants réutilisables (Badge, ProductCard)
6. **[45 min]** Implémenter l'annulation de code promo sur commande
7. **[1h]** Créer les templates d'événements (Vente/Souper)
8. **[1h]** Implémenter la duplication d'événement

### Tests à Effectuer

- [ ] Créer une commande et vérifier la réception de l'email
- [ ] Importer un CSV de produits avec le template fourni
- [ ] Exporter les commandes en Excel
- [ ] Appliquer un code promo et vérifier la réduction
- [ ] Afficher un événement avec des produits de type "vin"
- [ ] Tester la recherche de commandes par code

---

## 📞 INFORMATIONS UTILES

### Accès Supabase
- **Dashboard**: https://supabase.com/dashboard/project/dcctmozipqrdezqsdzxf
- **SQL Editor**: https://supabase.com/dashboard/project/dcctmozipqrdezqsdzxf/sql
- **Project ID**: dcctmozipqrdezqsdzxf

### URLs Locales
- **Frontend**: http://localhost:3001
- **Événement Crémant**: http://localhost:3001/event/cremant-pionniers-2025
- **Admin**: http://localhost:3001/admin/login

### Commandes Utiles
```bash
# Démarrer le serveur de dev
npm run dev

# Lancer le serveur sur port 3008 (config actuelle)
# Vérifier package.json pour le script exact

# Build production
npm run build

# Installer une nouvelle dépendance
npm install <package>
```

---

## 🐛 BUGS CONNUS

1. **Page événement en erreur 404** (CRITIQUE)
   → Résolu en exécutant la migration SQL

2. **Emails non envoyés**
   → Résolu en configurant RESEND_API_KEY et SENDER_EMAIL

---

## 💡 AMÉLIORATIONS FUTURES (Idées)

- [ ] Système de notifications en temps réel (toast)
- [ ] Upload d'images pour les produits (via Supabase Storage)
- [ ] Mode sombre (dark mode)
- [ ] Export PDF des commandes
- [ ] QR Code sur l'email de confirmation (pour scan au retrait)
- [ ] Statistiques publiques (nombre de bouteilles vendues, etc.)
- [ ] Multi-langue (FR/NL)
- [ ] Paiement en ligne via Stripe
- [ ] Gestion des stocks en temps réel avec alertes

---

**Document créé le**: 18 Novembre 2025
**Dernière mise à jour**: 18 Novembre 2025
**Version**: 1.0

---

**Bon courage pour la prochaine session ! 🚀**
