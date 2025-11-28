# Parcours Utilisateur - Plateforme de Commande

Ce document décrit tous les parcours possibles pour les clients et les administrateurs sur la plateforme.

---

## 📱 PARCOURS CLIENT (Mobile)

### 1️⃣ Page d'entrée : `/event/[slug]/commander`

**URL d'accès** : `https://evenements.scouts-ecaussinnes.be/event/vente-cremant-2025/commander`

**Étapes du parcours** :

#### **Étape 1 : Sélection des produits**
- **Page** : `/event/[slug]/commander` (Étape 0/5)
- **Composant** : `MobileCommander.tsx` - Vue Produits
- **Actions possibles** :
  - Cliquer sur un produit → Ouvre la modale `ProductDetailsModal`
  - Dans la modale :
    - Voir les détails du produit (description, prix, stock)
    - Ajuster la quantité avec +/-
    - Ajouter au panier
    - Fermer la modale
  - Footer sticky :
    - Affiche le nombre d'articles et le total
    - Bouton "Continuer" (désactivé si panier vide)

#### **Étape 2 : Choix du mode de livraison**
- **Page** : `/event/[slug]/commander` (Étape 1/5)
- **Composant** : `MobileCommander.tsx` - Vue Mode de livraison
- **Trois options possibles** :

##### **Option A : PICKUP (Retrait au local)**
- Sélectionner "Retrait au local"
- → Passe à l'étape 3 (Choix du créneau)

##### **Option B : DELIVERY (Livraison à domicile)**
- Sélectionner "Livraison à domicile"
- **Validation** :
  - Minimum de bouteilles requis (ex: 5 bouteilles)
  - Si minimum non atteint → Message d'erreur, retour à l'étape 1
- → Passe à l'étape 3 (Informations de livraison)

##### **Option C : ON_SITE (Sur place lors de l'événement)**
- Sélectionner "Sur place lors de l'événement"
- → Passe à l'étape 3 (Choix du créneau)

---

#### **Étape 3A : Choix du créneau** (si PICKUP ou ON_SITE)
- **Page** : `/event/[slug]/commander` (Étape 2/5)
- **Composant** : `MobileCommander.tsx` - Vue Créneaux
- **Actions** :
  - Liste des créneaux groupés par date
  - Cliquer sur une date pour déplier les créneaux
  - Sélectionner un créneau horaire
  - Voir la capacité restante (ex: 8/10 places)
  - **Validation** : Si créneau complet → Message d'erreur
- → Passe à l'étape 4 (Informations client)

#### **Étape 3B : Informations de livraison** (si DELIVERY)
- **Page** : `/event/[slug]/commander` (Étape 2/5)
- **Composant** : `MobileCommander.tsx` - Vue Livraison
- **Champs** :
  - Adresse (rue et numéro)
  - Code postal (4 chiffres)
  - Ville
- **Validation** :
  - Code postal dans la zone de livraison autorisée
  - Si hors zone → Message d'erreur
- → Passe à l'étape 4 (Informations client)

---

#### **Étape 4 : Informations client**
- **Page** : `/event/[slug]/commander` (Étape 3/5)
- **Composant** : `MobileCommander.tsx` - Vue Informations
- **Champs** :
  - Nom complet (min 2 caractères)
  - Email (validation format email)
  - Téléphone (formats acceptés : `+32 4xx xx xx xx` ou `04xx xx xx xx`)
    - **Formatage automatique** : Stocké en base comme `04xx/xx.xx.xx`
  - Notes (optionnel, max 500 caractères)
- **Optimisations iOS** :
  - Police 16px pour éviter le zoom automatique
  - AutoComplete activé (name, email, tel, address)
  - Scroll automatique lors du focus
- → Passe à l'étape 5 (Paiement et validation)

---

#### **Étape 5 : Paiement et validation**
- **Page** : `/event/[slug]/commander` (Étape 4/5)
- **Composant** : `MobileCommander.tsx` - Vue Paiement
- **Méthodes de paiement** :

##### **Option A : BANK_TRANSFER (Virement bancaire)**
- Paiement par virement à effectuer après la commande
- Informations IBAN affichées sur la page de confirmation

##### **Option B : ON_SITE (Paiement sur place)**
- Disponible uniquement pour PICKUP ou ON_SITE
- Paiement cash/Bancontact lors du retrait/événement

- **Récapitulatif affiché** :
  - Liste des articles avec quantités et prix
  - Sous-total
  - Remise éventuelle (12 pour 11)
  - Frais de livraison (si DELIVERY)
  - Total final
  - Mode de livraison et détails (adresse ou créneau)
  - Informations client

- **Validation finale** :
  - ✅ Case RGPD obligatoire : "J'accepte la politique de confidentialité"
  - Bouton "Confirmer ma commande"

---

#### **Étape 6 : Traitement de la commande**

**API appelée** : `POST /api/orders`

**Validations serveur** :
1. ✅ Validation Zod de toutes les données
2. ✅ Vérification de l'événement actif
3. ✅ Vérification des dates (période de vente)
4. ✅ Validation des produits (actifs, prix corrects)
5. ✅ Validation du stock disponible
6. ✅ Validation du créneau (capacité, existence)
7. ✅ Validation de la zone de livraison (si DELIVERY)
8. ✅ Validation du minimum de bouteilles (si DELIVERY)
9. ✅ Validation du code promo (si fourni)

**Traitement** :
1. Génération du code de commande (format : `CRE-2025-00001`)
2. Formatage du téléphone (`04xx/xx.xx.xx`)
3. Calcul des totaux (sous-total, remises, frais, total)
4. Création de la commande en base (statut : `PENDING`)
5. Création des lignes de commande (`order_items`)
6. Décrémentation du stock immédiatement
7. Envoi de l'email de confirmation
8. Retour des informations de paiement

**En cas d'erreur** :
- Toast d'erreur affiché avec le message
- Possibilité de corriger et réessayer
- Rollback automatique si erreur lors de la création des items

**En cas de succès** :
- Redirection vers `/order/[id]/confirmation`

---

#### **Étape 7 : Page de confirmation**
- **Page** : `/order/[id]/confirmation`
- **Composant** : `OrderConfirmationPage.tsx`

**Informations affichées** :

1. **En-tête** :
   - Message de succès : "Merci pour votre commande !"
   - Numéro de commande : `#CRE-2025-00001`

2. **Votre commande** :
   - Liste des articles avec :
     - Nom du produit
     - Quantité
     - Prix unitaire
     - Prix total par ligne
   - **Détail des prix** :
     - Sous-total
     - Remise 12 pour 11 (si applicable, en vert)
     - Code promo (si utilisé, en vert)
     - Frais de livraison (si DELIVERY)
     - **Total final** (en gros et ambre)

3. **Mode de livraison** :

   **Si PICKUP** :
   - Label : "Retrait au local"
   - Adresse : Rue des Fontenelles 26, 7190 Écaussinnes
   - Date et heure du créneau

   **Si DELIVERY** :
   - Label : "Livraison à domicile"
   - Adresse complète de livraison

   **Si ON_SITE** :
   - Label : "Sur place lors de l'événement"
   - Date et heure de l'événement

4. **Informations de paiement** :

   **Si BANK_TRANSFER** :
   - Méthode : "Virement bancaire"
   - IBAN de la section
   - Communication structurée : "NOM Prénom - Nom événement"
   - Montant à payer

   **Si ON_SITE** :
   - Méthode : "Paiement sur place"
   - Message : Paiement lors du retrait/événement

5. **Contact** :
   - Nom du client
   - Email
   - Téléphone (formaté : `0476/78.59.39`)

**Actions possibles** :
- Retour à l'accueil
- (Email de confirmation reçu en parallèle)

**Footer** :
- ❌ Footer du site masqué sur cette page

---

## 💻 PARCOURS ADMINISTRATEUR (Desktop & Mobile)

### Connexion Admin

**Page** : `/admin/login`

**Authentification** :
- Mot de passe unique
- Session stockée dans un cookie
- Redirection vers `/admin/dashboard`

---

### Dashboard Admin

**Page** : `/admin/dashboard`

**Vue d'ensemble** :
- Liste de tous les événements
- Statistiques par événement :
  - Nombre de produits
  - Nombre de commandes
  - Revenus totaux
  - Statut de l'événement (Actif/Brouillon/Fermé)

**Actions** :
- Créer un nouvel événement
- Cliquer sur un événement → `/admin/events/[id]`
- Se déconnecter

---

### Gestion d'un événement

**Page** : `/admin/events/[id]`

**Version Mobile** : `MobileEventDetail.tsx`
**Version Desktop** : Vue complète avec onglets

#### **Section Produits**

**Liste des produits** :
- Nom, prix, stock, statut (actif/inactif)
- Ordre d'affichage

**Actions** :
- ➕ Ajouter un produit
  - Modal avec formulaire
  - Champs : nom, description, prix, type, stock, image, etc.
- ✏️ Modifier un produit
  - Même modal en mode édition
- 🗑️ Supprimer un produit
- 📥 Importer des produits (CSV/JSON)

#### **Section Créneaux** (si événement type MEAL)

**Liste des créneaux** :
- Date, heure de début/fin, capacité
- Nombre de places restantes

**Actions** :
- ➕ Ajouter un créneau
  - Modal avec date, heures, capacité
- ➕ Génération en masse
  - Modal pour créer plusieurs créneaux d'un coup
- ✏️ Modifier un créneau
- 🗑️ Supprimer un créneau

#### **Section Commandes**

**Liste des commandes** (5 premières sur mobile) :
- **Affichage desktop** :
  - Tableau avec colonnes : Client, Code, Date, Statut, Total
- **Affichage mobile** :
  - Cards avec :
    - Point coloré indiquant le statut
    - Nom du client
    - Numéro de commande
    - Badge de statut (En attente/Payé/Préparé/Livré/Annulé)
    - Date de création
    - Montant total

**Légende des statuts** :
- 🟡 **PENDING** (En attente) - Commande créée, paiement en attente
- 🔵 **PAID** (Payé) - Paiement reçu et vérifié
- 🟣 **PREPARED** (Préparé) - Commande préparée, prête à être livrée/retirée
- 🟢 **DELIVERED** (Livré) - Commande livrée ou retirée par le client
- 🔴 **CANCELLED** (Annulé) - Commande annulée

**Actions** :
- Cliquer sur une commande → `/admin/orders/[id]`
- 📥 Exporter les commandes (CSV)
  - Filtres : statut, type de livraison, créneau, période

---

### Détails d'une commande

**Page** : `/admin/orders/[id]`

**Version Mobile** : Vue adaptée avec sections repliables
**Version Desktop** : Vue complète avec sidebar

#### **Informations affichées**

1. **En-tête** :
   - Numéro de commande : `#CRE-2025-00001`
   - Badge de statut avec couleur
   - Date de création
   - Nom de l'événement

2. **Informations client** :
   - Nom
   - Email
   - Téléphone
   - Adresse (si DELIVERY)

3. **Articles** :
   - Liste des produits commandés
   - Quantité × Prix unitaire = Total ligne
   - **Calcul des totaux** :
     - Sous-total
     - Remise 12 pour 11 (en vert)
     - Code promo (en vert)
     - Frais de livraison
     - **Total final**

4. **Livraison** :
   - Type (Retrait/Livraison/Sur place)
   - Adresse ou créneau
   - Date et heure si applicable

5. **Paiement** :
   - Méthode de paiement
   - Communication de virement (si BANK_TRANSFER)
   - IBAN de destination
   - Statut du paiement

6. **Notes** :
   - Notes du client (si fournies)
   - Référence bancaire (admin peut la renseigner)
   - Note interne admin (visible uniquement admin)

#### **Actions admin**

**Changement de statut** :
- Boutons rapides :
  - Marquer comme payé (PENDING → PAID)
  - Marquer comme préparé (PAID → PREPARED)
  - Marquer comme livré (PREPARED → DELIVERED)
  - Annuler la commande (→ CANCELLED)

**Autres actions** :
- Modifier les notes admin
- Ajouter une référence bancaire
- Imprimer la commande
- Envoyer un email au client
- Retour à la liste des commandes

---

### Scanner de commandes

**Page** : `/admin/scan`

**Fonctionnalité** :
- Scanner de QR codes pour valider les commandes
- Recherche manuelle par code de commande
- Affichage rapide des informations de commande
- Validation du retrait/livraison
- Changement de statut rapide

**Cas d'usage** :
- Lors d'un événement (ON_SITE)
- Lors des retraits au local (PICKUP)
- Vérification rapide d'une commande

---

## 🔄 FLUX DE DONNÉES

### Création d'une commande

```
Client remplit le formulaire
    ↓
POST /api/orders
    ↓
Validation Zod (téléphone, email, adresse, etc.)
    ↓
Vérification événement actif
    ↓
Vérification stock disponible
    ↓
Vérification créneau/zone de livraison
    ↓
Formatage téléphone (04xx/xx.xx.xx)
    ↓
Calcul des totaux (sous-total, remises, frais)
    ↓
Génération code commande (CRE-2025-00001)
    ↓
Insertion dans orders (statut: PENDING)
    ↓
Insertion des items dans order_items (avec product_name et qty)
    ↓
Décrémentation du stock
    ↓
Envoi email de confirmation
    ↓
Retour → Redirection vers /order/[id]/confirmation
```

### Consultation d'une commande (Client)

```
GET /order/[id]/confirmation
    ↓
API: GET /api/orders/details/[id]
    ↓
Récupération commande + items + slot + event
    ↓
Affichage page de confirmation
```

### Consultation d'une commande (Admin)

```
GET /admin/orders/[id]
    ↓
Vérification session admin
    ↓
API: GET /api/admin/orders/[id]
    ↓
Récupération commande + items + product details + slot + event
    ↓
Affichage page admin avec actions
```

### Mise à jour du statut

```
Admin clique sur "Marquer comme payé"
    ↓
PATCH /api/admin/orders/[id]
    ↓
Vérification session admin
    ↓
Update orders SET status = 'PAID'
    ↓
Retour statut mis à jour
    ↓
Refresh de la page
```

---

## 📊 RÉCAPITULATIF DES PAGES

### Pages Client (Public)
| URL | Description | Composant |
|-----|-------------|-----------|
| `/event/[slug]/commander` | Page de commande mobile (5 étapes) | `MobileCommander.tsx` |
| `/order/[id]/confirmation` | Confirmation de commande | `OrderConfirmationPage.tsx` |

### Pages Admin (Protégées)
| URL | Description | Composant |
|-----|-------------|-----------|
| `/admin/login` | Connexion admin | `LoginPage.tsx` |
| `/admin/dashboard` | Dashboard principal | `DashboardPage.tsx` |
| `/admin/events/[id]` | Gestion d'un événement | `EventDetailPage.tsx` |
| `/admin/orders/[id]` | Détails d'une commande | `OrderDetailPage.tsx` |
| `/admin/scan` | Scanner de commandes | `ScanPage.tsx` |

### APIs
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/orders` | POST | Créer une commande |
| `/api/orders/details/[id]` | GET | Détails commande (client) |
| `/api/admin/orders/[id]` | GET | Détails commande (admin) |
| `/api/admin/orders/[id]` | PATCH | Mettre à jour une commande |
| `/api/admin/orders` | GET | Liste des commandes |
| `/api/admin/orders/export` | GET | Exporter les commandes |

---

## 🎯 POINTS CLÉS UX

### Optimisations Mobile
- ✅ Police 16px pour éviter le zoom iOS
- ✅ Viewport verrouillé (maximumScale: 1)
- ✅ AutoComplete sur les champs
- ✅ Scroll automatique au focus
- ✅ Footer sticky avec récapitulatif panier
- ✅ Modales optimisées (pas de fermeture sur drag de sélection)
- ✅ Blocage du scroll de fond quand modale ouverte

### Validations en temps réel
- ✅ Minimum de bouteilles pour livraison
- ✅ Zone de livraison autorisée (code postal)
- ✅ Stock disponible
- ✅ Capacité des créneaux
- ✅ Format téléphone belge
- ✅ Format email valide
- ✅ Consentement RGPD obligatoire

### Indicateurs visuels
- ✅ Badges de statut colorés
- ✅ Points colorés sur mobile
- ✅ Remises en vert avec signe moins
- ✅ Total final bien visible
- ✅ Progression par étapes (1/5, 2/5, etc.)

---

**Document créé le** : 27 novembre 2025
**Version** : 1.0
**Auteur** : Claude Code
