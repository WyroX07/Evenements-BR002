# Plateforme de Vente en Ligne pour Unités Scoutes

## L'Idée du Projet

Je veux créer une plateforme web moderne pour gérer les ventes d'événements scouts. Le but, c'est de remplacer les Google Forms et les feuilles Excel qu'on utilise actuellement, qui sont vraiment pas pratiques.

## Le Besoin

Les unités scoutes organisent régulièrement des événements pour se financer :
- **Ventes de produits** - Genre crémant, champagne, calendriers, objets scouts
- **Soupers et événements** - Réservations de places avec gestion des allergènes
- **Tombolas** - Vente de tickets avec tirages au sort

Pour l'instant, on se débrouille avec des outils bricolés, mais on a besoin d'un vrai système qui :
- Permette aux gens de commander facilement en ligne
- Gère les créneaux horaires pour les retraits (genre "samedi 14h-15h, max 10 personnes")
- Affiche correctement les détails des produits (surtout pour les vins - millésime, arômes, accords, etc.)
- Envoie des confirmations par email automatiquement
- Supporte des codes promo
- Donne aux animateurs un panel admin simple pour tout gérer

## Comment ça Devrait Marcher

### Côté Utilisateur (les gens qui commandent)

1. Ils arrivent sur une page d'accueil qui liste les événements en cours
2. Ils cliquent sur un événement qui les intéresse (ex: "Vente Crémant Noël 2025")
3. Ils voient une belle page avec :
   - Une description de l'événement
   - Les produits disponibles avec photos et détails
   - Un bouton "Commander"
4. Ils remplissent un formulaire en plusieurs étapes :
   - **Étape 1** : Choix des produits et quantités
   - **Étape 2** : Choix du créneau horaire (si retrait physique)
   - **Étape 3** : Infos personnelles (nom, email, téléphone)
   - **Étape 4** : Code promo éventuel
   - **Étape 5** : Mode de retrait (sur place ou livraison selon l'événement)
5. Ils valident et reçoivent immédiatement un email avec :
   - Le récap de leur commande
   - Le montant à payer
   - Les infos de virement bancaire (IBAN, communication structurée)
   - Un code unique pour retrouver leur commande
6. Ils peuvent accéder à leur commande plus tard avec le code pour :
   - Voir les détails
   - Télécharger un fichier .ics pour ajouter le créneau à leur calendrier

### Côté Admin (nous, les animateurs)

1. On se connecte avec un mot de passe admin
2. On a accès à un dashboard qui montre :
   - Tous les événements (brouillons, actifs, archivés)
   - Les stats en temps réel (nombre de commandes, CA, créneaux pleins)
3. On peut créer des événements facilement :
   - Remplir les infos de base (nom, dates, description)
   - Personnaliser la page d'accueil (titre, sous-titre, bannière)
   - Configurer les options (livraison, codes postaux acceptés, modes de paiement)
4. On peut gérer les produits :
   - Ajouter un par un via un formulaire
   - Importer en masse via CSV (pratique pour les listes de vins)
   - Éditer les prix, descriptions, détails
   - Activer/désactiver des produits
5. On peut gérer les créneaux horaires :
   - Créer des plages (date, heure début, heure fin, capacité)
   - Voir combien de places restantes
   - Supprimer ou modifier des créneaux
6. On voit toutes les commandes :
   - Liste complète avec filtres
   - Détails de chaque commande
   - Export en CSV/Excel
   - Possibilité de modifier le statut (Payée, Préparée, Livrée)
7. On peut créer et gérer des codes promo :
   - Définir un code (ex: "NOEL2024")
   - Fixer une réduction en euros
   - Voir combien de fois il a été utilisé

## Les Fonctionnalités Importantes

### 1. Les Fiches Produits Détaillées

Pour les ventes de vins/crémants, c'est super important d'avoir de belles fiches avec :
- Le nom et le producteur
- Le prix (avec gestion des réductions "10 pour 9" si activé)
- Le millésime
- La couleur et le type (blanc, rosé, rouge, etc.)
- Les arômes ("notes de fruits rouges, agrumes...")
- Les accords mets-vins ("parfait avec du poisson grillé")
- Le cépage, l'appellation, le degré d'alcool
- Des badges visuels ("Bio", "Médaille d'Or", "Stock limité")
- Des photos

### 2. La Gestion des Créneaux Horaires

Quand on organise une vente physique, les gens doivent venir chercher leurs commandes. On définit :
- Des dates et heures précises (ex: "Samedi 15 décembre, 14h-15h")
- Une capacité maximale par créneau (ex: 10 personnes max)
- Le système bloque automatiquement quand un créneau est plein
- Les gens peuvent voir en temps réel les créneaux disponibles

### 3. Les Emails Automatiques

Dès qu'une commande est passée, un email part automatiquement avec :
- Un récap complet de la commande
- Le montant total à payer
- Les infos de virement (IBAN de l'unité, communication structurée)
- Le code de commande unique
- Les infos du créneau choisi si applicable

### 4. Les Codes Promo

On veut pouvoir créer des codes promotionnels pour :
- Récompenser les bénévoles ("MERCI2024" → -5€)
- Faire des offres spéciales ("NOEL" → -10€)
- Offrir des réductions pour les gros volumes

Les codes sont :
- Personnalisables (on choisit le texte)
- Avec un montant fixe de réduction
- Applicables au total de la commande
- Utilisables plusieurs fois ou limitables

### 5. Le Multi-Sections

Le système doit supporter plusieurs unités/sections scoutes :
- Chaque section a son propre IBAN et ses couleurs
- Les événements sont liés à une section
- Les emails et pages utilisent les infos de la section

## L'Architecture Technique

### Stack Technologique

Je vois ça comme une webapp moderne avec :
- **Frontend + Backend** : Next.js (version récente avec App Router)
- **Base de données** : PostgreSQL (via Supabase par exemple)
- **Emails** : Un service d'envoi d'emails (Resend, SendGrid, etc.)
- **Hébergement** : Vercel pour la simplicité du déploiement
- **DNS** : Un registrar style Hostinger ou Gandi pour le domaine custom

### Base de Données

Il faudrait des tables pour :
- **sections** : Les différentes unités scoutes
- **events** : Les événements (ventes, soupers, tombolas)
- **products** : Les produits vendus (avec tous les champs pour les vins)
- **slots** : Les créneaux horaires
- **orders** : Les commandes
- **order_items** : Les lignes de produits dans chaque commande
- **promo_codes** : Les codes promotionnels
- **audit_logs** : Des logs pour tracer qui fait quoi

### L'API

Des routes API pour :
- **Public** :
  - `GET /api/events/[slug]` - Récupérer un événement et ses produits/créneaux
  - `POST /api/orders` - Créer une commande
  - `GET /api/orders/[code]` - Récupérer une commande par code
  - `GET /api/orders/[code]/ics` - Télécharger le fichier calendrier
- **Admin** (protégé par mot de passe) :
  - `GET /api/admin/events` - Liste des événements
  - `POST /api/admin/events` - Créer un événement
  - `PATCH /api/admin/events/[id]` - Modifier un événement
  - `DELETE /api/admin/events/[id]` - Supprimer un événement
  - Routes similaires pour products, slots, promo_codes, orders

### Le Frontend

Des pages pour :
- **Public** :
  - `/` - Page d'accueil avec liste des événements
  - `/evenements/[slug]` - Page d'un événement
  - `/commander/[slug]` - Formulaire de commande multi-étapes
  - `/merci/[code]` - Page de confirmation
- **Admin** :
  - `/admin/login` - Connexion admin
  - `/admin/dashboard` - Dashboard avec liste d'événements
  - `/admin/events/[id]` - Gestion d'un événement (produits, créneaux, commandes)
  - `/admin/orders` - Liste de toutes les commandes avec export

## Les Fonctionnalités "Nice to Have"

Pas urgent au début, mais ce serait cool d'avoir :

1. **Dashboard avec stats avancées** - Graphiques de CA, produits les plus vendus, créneaux les plus demandés
2. **Modification rapide de commandes** - Parfois les gens se trompent, faut pouvoir éditer facilement
3. **Duplication d'événements** - Pouvoir copier un événement de l'an dernier pour gagner du temps
4. **Templates d'événements** - Genre "Template Vente Crémant" avec tous les réglages par défaut
5. **Statuts de commandes évolués** - Dropdown pour changer de "Payée" à "Préparée" à "Livrée"
6. **Liste imprimable par créneau** - Pour savoir qui vient chercher quoi et quand
7. **Annulation de code promo** - Pouvoir enlever un code promo d'une commande après coup
8. **Composants réutilisables** - Des badges, des cartes produits standardisées
9. **Mode sombre** - Parce que c'est la classe
10. **Notifications push** - Pour prévenir les admins des nouvelles commandes

## Les Contraintes et Bonnes Pratiques

### Sécurité
- L'auth admin doit être solide (même si c'est juste un mot de passe pour commencer)
- Pas de secrets dans le code (tout en variables d'environnement)
- Validation de toutes les entrées utilisateur
- Protection contre les injections SQL et XSS

### Money
- **Tout en centimes** : Les prix et montants doivent être stockés en integers (centimes) pour éviter les problèmes de float
- Gestion correcte de la TVA si besoin
- Arrondir correctement les réductions

### Dates et Heures
- Gérer le timezone correctement (Europe/Brussels pour nous)
- Format ISO 8601 pour les dates
- Fichiers .ics pour l'intégration calendrier

### Performance
- Images optimisées (Next.js Image component)
- Pagination des listes longues
- Caching intelligent pour les pages publiques

### UX
- Mobile-first (beaucoup de gens commandent sur téléphone)
- Formulaire multi-étapes avec sauvegarde automatique
- Feedback visuel clair (spinners, messages de succès/erreur)
- Accessibilité (WCAG AA minimum)

## Le Style et l'Esprit

C'est un site pour des scouts, donc :
- Vibe sympa, accessible, pas trop corporate
- Couleurs vives et joyeuses (en lien avec les couleurs de la section)
- Ton friendly dans les textes
- Illustrations/photos sympathiques

Techniquement :
- Code propre et commenté
- TypeScript pour la sécurité des types
- Tailwind CSS pour le style
- Composants réutilisables
- Tests unitaires pour les fonctions critiques

## Les Défis Techniques

### Migration Next.js
Si on utilise Next.js 15+, il y a des breaking changes à gérer :
- Les params des routes dynamiques sont maintenant async
- React 19 a des changements de peer dependencies

### Types TypeScript
- Typer correctement Supabase peut être relou
- Les callbacks de reduce/map/filter ont besoin de types explicites

### Gestion des Emails
- Bien gérer les erreurs d'envoi
- Templates d'emails responsive
- Éviter le spam

### Export de Données
- CSV propres avec encoding UTF-8
- Excel avec formattage correct
- Gestion des gros volumes

## Le Workflow de Développement

1. **Phase 1 - MVP** :
   - Setup du projet (Next.js + Supabase + Vercel)
   - Création du schéma de BDD
   - Page d'accueil basique
   - Création d'événement simple
   - Formulaire de commande basique
   - Emails de confirmation

2. **Phase 2 - Amélioration** :
   - Panel admin complet
   - Gestion des créneaux
   - Codes promo
   - Fiches produits détaillées (vins)
   - Export CSV

3. **Phase 3 - Polish** :
   - Dashboard avec stats
   - Duplication/templates d'événements
   - Modification de commandes
   - Composants réutilisables
   - Tests et debugging

4. **Phase 4 - Production** :
   - Configuration DNS
   - Variables d'environnement production
   - Monitoring et logs
   - Documentation utilisateur

## À Retenir

L'objectif, c'est de créer un outil **simple** et **fonctionnel** qui facilite vraiment la vie des animateurs scouts. Pas besoin de surengineering - juste un système fiable qui marche bien et qu'on peut maintenir facilement.

Le projet doit être :
- **Rapide à déployer** : Une nouvelle section peut lancer son premier événement en moins d'une heure
- **Facile à utiliser** : Même quelqu'un qui n'est pas tech-savvy peut gérer un événement
- **Évolutif** : On peut ajouter des features progressivement sans tout casser
- **Maintenable** : Le code doit être clair pour qu'on puisse le reprendre dans 6 mois

---

*Projet imaginé pour simplifier la vie des unités scoutes 🪶*
