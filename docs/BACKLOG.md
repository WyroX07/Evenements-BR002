# 📋 Backlog - Plateforme Scouts Écaussinnes

> Document mis à jour le 13/11/2025
> État actuel : Sprint 1 (Codes promo) terminé

---

## ✅ Complété (Sprint 1)

### 1. Sauvegarde automatique du panier
**Fichiers modifiés** : `app/event/[slug]/commander/page.tsx`
- Sauvegarde automatique dans `localStorage` avec clé `cart_{slug}`
- Rechargement au montage du composant
- Nettoyage après commande réussie

### 2. Système de codes promo - Complet
**Fichiers créés** :
- `supabase/sql/07_add_promo_codes.sql` - Migration DB ✅ Exécutée
- `app/api/promo-codes/validate/route.ts` - API validation
- `app/api/admin/promo-codes/route.ts` - CRUD GET/POST
- `app/api/admin/promo-codes/[id]/route.ts` - CRUD PATCH/DELETE
- `lib/validators.ts` - Ajout champ `promoCode` optionnel

**Fonctionnalités** :
- Table `promo_codes` : code, discount_cents, is_active, description
- Validation en temps réel côté client
- Champ code promo dans l'étape Paiement
- Affichage dans résumé sidebar + page confirmation
- Intégration complète dans `/api/orders`

### 3. Mise à jour API orders
**Fichier modifié** : `app/api/orders/route.ts`
- Support multi-événements avec table `products`
- Validation et application des codes promo
- Calcul du total final avec réduction promo

---

## 🎯 Priorité 1 - Fonctionnalités critiques

### 📧 Emails de confirmation
**Estimation** : 2-3h
**Description** : Envoyer automatiquement un email après commande avec :
- Récapitulatif produits + quantités
- Code de commande (ex: ORD-2025-00042)
- Créneau de retrait (date + heure)
- Informations de paiement (IBAN + communication structurée)
- Lien vers fichier .ics pour ajouter au calendrier

**Dépendances** :
- Service Resend déjà configuré (voir `package.json`)
- Templates `react-email` déjà installés

**Fichiers à créer** :
- `lib/email.ts` - Fonctions d'envoi
- `emails/OrderConfirmation.tsx` - Template React Email
- Modifier `app/api/orders/route.ts` ligne 282

---

### 📄 Page persistante de commande
**Estimation** : 1h30
**Description** : Page `/commande/[code]` où le client peut :
- Retrouver sa commande avec son code
- Voir le récapitulatif complet
- Télécharger le fichier .ics du créneau
- Imprimer/PDF

**Fichiers à créer** :
- `app/commande/[code]/page.tsx`
- `app/api/orders/[code]/route.ts` (GET public)
- `app/api/orders/[code]/ics/route.ts` (génération .ics)

---

### 📊 Export Excel des commandes
**Estimation** : 1h
**Description** : Bouton "Exporter Excel" dans l'admin pour télécharger :
- Toutes les commandes (ou filtrées)
- Colonnes : Code, Date, Nom, Email, Téléphone, Produits, Quantités, Créneau, Type livraison, Montant, Statut, Code promo utilisé
- Format CSV ou XLSX

**Dépendances** :
- Bibliothèque `xlsx` ou export CSV natif

**Fichiers à créer** :
- `app/api/admin/orders/export/route.ts`
- Ajouter bouton dans `app/admin/events/[id]/page.tsx`

---

## 🟡 Priorité 2 - Gestion admin

### 🎟️ Interface admin codes promo
**Estimation** : 2-3h
**Description** : Page `/admin/promo-codes` avec :
- Liste des codes promo (tableau)
- Formulaire création/édition (modal)
- Toggle actif/inactif
- Suppression avec confirmation
- Affichage du nombre d'utilisations

**Fichiers à créer** :
- `app/admin/promo-codes/page.tsx`
- `components/forms/PromoCodeForm.tsx`

---

### ❌ Annulation manuelle de code promo sur commande
**Estimation** : 1h
**Description** : Dans la vue détail d'une commande admin :
- Si commande a un code promo appliqué
- Bouton "Annuler code promo"
- Set `promo_manually_removed = true`
- Recalcule le total sans la réduction

**Fichiers à modifier** :
- `app/admin/events/[id]/page.tsx` (section commandes)
- `app/api/admin/orders/[id]/route.ts` (PATCH endpoint)

---

### 🔍 Recherche et filtres sur commandes
**Estimation** : 2h
**Description** : Dans la page admin événement :
- Barre de recherche (nom, email, code commande)
- Filtres dropdown :
  - Par statut (PENDING, PAID, PREPARED, DELIVERED, CANCELLED)
  - Par créneau
  - Par type (PICKUP / DELIVERY)
- Compteurs de résultats

**Fichiers à modifier** :
- `app/admin/events/[id]/page.tsx`

---

### ✏️ Modification rapide de commande
**Estimation** : 3h
**Description** : Modal ou inline edit pour modifier :
- Statut (dropdown)
- Créneau (si type = PICKUP)
- Quantités des produits
- Notes admin

**Composant à créer** :
- `components/admin/OrderQuickEditModal.tsx`

---

### 📈 Dashboard avec stats simples
**Estimation** : 2h
**Description** : En haut de la page admin événement, afficher :
- Nombre total de commandes
- Chiffre d'affaires (€)
- Nombre de bouteilles/produits vendus
- Taux de remplissage des créneaux (%)
- Graphique simple (bar chart par créneau)

**Bibliothèque** : `recharts` (léger et simple)

---

### 🏷️ Statuts de commande avec dropdown
**Estimation** : 2h
**Description** : Ajouter un cycle de vie complet :
- **PENDING** - En attente de paiement
- **PAID** - Payée
- **PREPARED** - Préparée (bouteilles prêtes)
- **DELIVERED** - Retirée par le client
- **CANCELLED** - Annulée

**Fichiers à modifier** :
- `app/admin/events/[id]/page.tsx` - Dropdown pour changer statut
- `lib/validators.ts` - Ajouter schéma updateOrderStatus
- `app/api/admin/orders/[id]/route.ts` - PATCH pour update statut

---

### 🖨️ Liste imprimable par créneau
**Estimation** : 2h
**Description** : Générer une page print-friendly avec :
- Liste des clients pour un créneau donné
- Produits à préparer pour chacun
- Cases à cocher pour validation
- CSS optimisé pour impression

**Fichiers à créer** :
- `app/admin/events/[id]/slots/[slotId]/print/page.tsx`
- CSS print dans `app/globals.css`

---

## 🟢 Priorité 3 - Améliorations UX

### 📦 Import CSV pour produits
**Estimation** : 2-3h
**Description** : Upload fichier CSV/Excel pour :
- Créer plusieurs produits en une fois
- Mettre à jour les prix en masse
- Colonnes : name, description, price_euros, product_type, stock, allergènes, is_vg

**Fonctionnalités** :
- Validation avant import
- Prévisualisation des changements
- Option "Créer nouveaux" vs "Mettre à jour existants" (match sur name)

**Fichiers à créer** :
- `app/api/admin/events/[id]/products/import/route.ts`
- `components/admin/ProductImportModal.tsx`

---

### 🥗 Allergènes et végétarien
**Estimation** : 2h
**Description** : Ajouter infos nutritionnelles aux produits :
- Champs allergènes : gluten, lactose, fruits_à_coque, soja, etc. (JSONB array)
- Champ `is_vegetarian` (boolean)
- Affichage d'icônes à côté des produits
- Légende en bas de la liste produits

**Migration SQL** :
```sql
ALTER TABLE products
  ADD COLUMN allergens JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN is_vegetarian BOOLEAN DEFAULT false;
```

**Icônes à fournir** : gluten-free, lactose-free, vegan/vegetarian

**Fichiers à modifier** :
- `supabase/sql/08_add_allergens_vg.sql` - Migration
- `app/event/[slug]/commander/page.tsx` - Affichage icônes
- `components/forms/ProductForm.tsx` - Champs formulaire

---

### 📅 Fichier .ics pour créneau
**Estimation** : 1h
**Description** : Bouton "Ajouter à mon calendrier" :
- Génère fichier .ics avec date/heure du créneau
- Compatible Google Calendar, Outlook, iPhone
- Description avec infos commande

**Bibliothèque** : `ics` (npm package)

**Fichiers à créer** :
- `app/api/orders/[code]/ics/route.ts`

---

## 🔵 Priorité 4 - Fonctionnalités avancées

### 📋 Templates d'événements
**Estimation** : 3h
**Description** : Système de templates pré-configurés :
- **Template "Vente"** : pour ventes de produits (crémant, champagne, vol-au-vent, jus de pomme, etc.)
  - Livraison activée
  - Créneaux de retrait
  - Remise 10 pour 9
- **Template "Souper"** : pour repas
  - Pas de livraison
  - Horaires fixes (ex: 18h-22h)
  - Pas de créneaux multiples
  - Tables/places

**Interface** :
- Page `/admin/templates`
- Bouton "Créer depuis template" dans dashboard
- Modal de sélection avec prévisualisation
- **Important** : Validation humaine + modification avant création définitive

**Fichiers à créer** :
- `lib/templates.ts` - Définitions des templates
- `components/admin/TemplateSelector.tsx`
- `app/api/admin/events/from-template/route.ts`

---

### 📑 Duplication d'événement
**Estimation** : 2h
**Description** : Bouton "Dupliquer" sur un événement pour :
- Copier structure complète (produits + config)
- Générer nouveau slug
- Pré-remplir dates (année suivante)
- Vider les créneaux (à recréer manuellement)

**Fichiers à créer** :
- `app/api/admin/events/[id]/duplicate/route.ts`

---

## 📝 Notes techniques

### Base de données actuelle
- **ORM** : Supabase (PostgreSQL)
- **Tables principales** :
  - `sections`, `events`, `products`, `slots`, `orders`, `order_items`, `promo_codes`
- **Migrations** : Fichiers SQL dans `supabase/sql/`

### Stack technique
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Supabase Client
- Resend (emails)
- React Email (templates)

### Conventions de code
- Validation Zod dans `lib/validators.ts`
- Utilitaires dans `lib/`
- Composants UI réutilisables dans `components/ui/`
- Formulaires dans `components/forms/`

---

## 🚀 Pour démarrer une nouvelle session

1. **Lire ce document** pour contexte
2. **Vérifier la todo list** dans le code
3. **Prioriser** selon besoins immédiats
4. **Tester** après chaque feature importante

### Commandes utiles
```bash
# Lancer le serveur de dev
npm run dev

# Vérifier les types
npm run type-check

# Lancer les tests
npm test

# Build production
npm run build
```

---

## 📬 Contact & Feedback
Pour toute question ou suggestion, voir le fichier `SESSION_CONTEXT.md`
