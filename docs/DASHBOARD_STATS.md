# Dashboard Admin - Statistiques par Événement

## Vue d'ensemble

Le dashboard admin a été restructuré pour afficher des statistiques détaillées **par événement** au lieu de statistiques globales. Cela permet d'avoir des analyses pertinentes pour chaque événement spécifique.

## Pourquoi ce changement ?

Comme vous aurez à terme TOUS les événements de toutes les sections sur la plateforme, les chiffres globaux ne seraient plus représentatifs. Le nouveau dashboard permet de :

- Sélectionner un événement spécifique
- Voir des statistiques pertinentes uniquement pour cet événement
- Comparer les performances entre différents événements
- Analyser la rentabilité par fournisseur (pour la vente de crémant)

## Statistiques disponibles

### 📊 Statistiques Globales

- **Commandes totales** : Nombre total de commandes pour l'événement
- **Chiffre d'affaires** : CA total généré par l'événement
- **Produits vendus** : Nombre total d'articles vendus
- **Panier moyen** : Valeur moyenne par commande

### 💰 Détail des Revenus

- **Sous-total produits** : Revenus bruts des produits
- **Remises** : Total des réductions appliquées (10 pour 9, codes promo)
- **Frais de livraison** : Revenus des frais de livraison
- **Total** : CA final net

### 🍾 Revenus par Fournisseur (Vente de Crémant)

Pour chaque fournisseur (ex: Lissner, Veuve Doussot, etc.) :
- **CA total** : Revenus générés par les produits de ce fournisseur
- **Quantité** : Nombre de bouteilles vendues
- **Nombre de produits** : Nombre de produits différents du fournisseur
- **% du CA** : Part du chiffre d'affaires

**Cas d'usage** : Permet de faire des audits de rentabilité sur les achats de base par rapport aux ventes. Par exemple, comparer les marges entre Lissner et d'autres fournisseurs.

### 📦 CA par Produit

Tableau détaillé pour chaque produit :
- **Nom du produit**
- **Fournisseur**
- **Prix unitaire**
- **Quantité vendue**
- **CA total**
- **% du CA**

**Cas d'usage** : Identifier les produits qui marchent le mieux, optimiser le catalogue pour les prochaines éditions.

### 📈 Répartition des Commandes

- **Par statut** : PENDING, PAID, PREPARED, DELIVERED, CANCELLED
- **Par type de livraison** : PICKUP, DELIVERY
- **Par méthode de paiement** : BANK_TRANSFER, ON_SITE, PAY_LINK

## Interface

### 🖥️ Version Desktop

- Sélecteur d'événement en haut de page (dropdown)
- Cartes de statistiques globales (4 cartes principales)
- Section "Détail des revenus" avec breakdown
- Section "Revenus par fournisseur" (si applicable)
- Tableau complet des produits avec tri par CA
- Sections de répartition (statut, livraison, paiement)

### 📱 Version Mobile

- Header avec sélecteur d'événement
- Cartes de stats en scroll horizontal
- Sections repliables pour économiser l'espace :
  - Détail des revenus
  - Revenus par fournisseur
  - CA par produit (expandable)
  - Répartition des commandes (expandable)

## API Endpoint

### `GET /api/admin/events/[id]/stats`

Retourne toutes les statistiques pour un événement donné.

**Réponse** :
```json
{
  "event": {
    "id": "...",
    "name": "...",
    "slug": "...",
    "event_type": "...",
    "status": "...",
    "section": { ... }
  },
  "stats": {
    "totalOrders": 150,
    "totalRevenueCents": 450000,
    "totalItems": 890,
    "averageOrderValue": 3000,
    "averageItemsPerOrder": 6,
    "ordersByStatus": { ... },
    "ordersByDeliveryType": { ... },
    "ordersByPaymentMethod": { ... },
    "revenue": {
      "subtotal_cents": 460000,
      "discount_cents": 15000,
      "delivery_fees_cents": 5000,
      "total_cents": 450000
    },
    "productStats": [ ... ],
    "supplierStats": [ ... ]
  }
}
```

## Comparaison entre Éditions

Pour comparer les performances entre différentes éditions du même événement :

1. Sélectionnez l'événement de l'année en cours
2. Notez les chiffres clés (CA, panier moyen, CA par produit)
3. Sélectionnez l'événement de l'année précédente
4. Comparez les métriques

**Suggestion future** : Ajouter une fonctionnalité de comparaison visuelle entre 2 événements côte à côte.

## Utilisation pour les Audits de Rentabilité

### Exemple : Vente de Crémant

1. **Consulter les revenus par fournisseur**
   - Combien a rapporté Lissner ?
   - Combien ont rapporté les autres fournisseurs ?

2. **Analyser le CA par produit**
   - Quels produits Lissner se vendent le mieux ?
   - Y a-t-il des produits avec faible rotation ?

3. **Calculer les marges**
   - Prix d'achat chez Lissner : X €
   - Prix de vente moyen : Y €
   - Marge brute : (Y - X) × quantité vendue
   - Taux de marge : ((Y - X) / Y) × 100

4. **Optimiser pour la prochaine édition**
   - Supprimer les produits peu vendus
   - Augmenter le stock des best-sellers
   - Négocier les prix avec les fournisseurs les plus rentables

## Fichiers Modifiés

- `app/admin/dashboard/page.tsx` : Page principale restructurée
- `app/api/admin/events/[id]/stats/route.ts` : Nouvelle route API pour les stats
- `components/admin/EventDashboard.tsx` : Composant desktop
- `components/admin/mobile/MobileEventDashboard.tsx` : Composant mobile
- `supabase/migrations/20250114_add_wine_details.sql` : Champ `producer` dans la table `products`

## Notes Techniques

- Les statistiques sont calculées côté serveur pour des performances optimales
- Le composant utilise un état local pour la sélection d'événement
- Les données sont rechargées automatiquement lors du changement d'événement
- Compatible mobile et desktop avec des layouts adaptés
