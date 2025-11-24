# Plateforme de Vente - Unité Scoute d'Ecaussinnes

## Le Contexte

Salut! Alors voilà, je suis animateur scout à l'Unité d'Ecaussinnes en Belgique, et j'ai développé cette plateforme web pour gérer nos ventes de crémant et nos soupers. Avant, on faisait tout à la main ou avec des Google Forms pourris, et c'était un bordel pas possible.

## Le Problème qu'on Résout

Chaque année, on organise plusieurs événements:
- **Ventes de crémant/champagne** - Les gens commandent des bouteilles, on leur donne un créneau horaire pour venir les chercher
- **Soupers scouts** - Les familles réservent des places pour un repas, on gère les menus et les allergènes
- **Ventes diverses** - Parfois on vend d'autres trucs (calendriers, objets scouts, etc.)

Le truc, c'est qu'on avait besoin d'un système qui:
- Permette aux gens de commander en ligne facilement
- Gère les créneaux horaires (genre "vendredi 18h-19h, max 10 personnes")
- Affiche les détails des produits (surtout pour les vins - millésime, arômes, accords, tout ça)
- Envoie des confirmations par email automatiquement
- Donne un code promo pour réduire le prix parfois
- Permette aux admins (nous, les animateurs) de tout gérer sans galérer

## Comment ça Marche (vue utilisateur)

**Pour les clients:**
1. Ils vont sur le site (genre `evenements.scouts-ecaussinnes.be`)
2. Ils voient les événements en cours (avec une belle page d'accueil pour chaque événement)
3. Ils cliquent sur "Commander", remplissent un formulaire multi-étapes:
   - Choix des produits (avec les quantités)
   - Choix du créneau horaire si besoin
   - Infos perso (nom, email, téléphone)
   - Code promo éventuel
   - Mode de retrait (sur place / livraison selon l'événement)
4. Ils reçoivent un email de confirmation avec un code de commande unique
5. Ils peuvent accéder à leur commande via le code pour voir les détails ou télécharger un fichier .ics pour leur calendrier

**Pour nous (admins):**
1. On se connecte avec un mot de passe admin
2. On peut créer des événements, des produits, des créneaux
3. On voit toutes les commandes en temps réel
4. On peut exporter tout ça en CSV/Excel pour nos tableaux
5. On peut importer des listes de produits (pratique pour les vins, y'en a beaucoup)
6. On peut créer des codes promo genre "NOEL2024" avec une réduction fixe

## Les Trucs Importants

### Les Détails des Vins
C'est super important pour nous - on vend du crémant et du champagne de qualité. Les fiches produits doivent montrer:
- Le millésime
- La couleur (blanc, rosé, etc.)
- Les arômes ("notes de fruits rouges, agrumes...")
- Les accords mets-vins ("parfait avec du poisson")
- Le cépage, l'appellation, le producteur
- Des badges genre "Bio", "Médaille d'Or", "Stock limité"

### Les Créneaux Horaires
Pour les ventes physiques, les gens doivent choisir quand ils viennent chercher. On définit:
- Des dates et heures (ex: "Samedi 15 déc, 14h-15h")
- Une capacité max par créneau
- Le système bloque quand c'est plein

### Les Emails Automatiques
Dès qu'une commande est passée, un email part avec:
- Le récap de la commande
- Le montant à payer
- Les infos de virement bancaire (IBAN, communication structurée)
- Le code de commande pour retrouver sa commande

### Les Codes Promo
On peut créer des codes avec un montant de réduction fixe en centimes (ex: 500 = 5€ de réduction). Ça s'applique au total de la commande.

## L'Architecture (en gros)

C'est une webapp Next.js (la version 15, on vient juste de migrer). J'ai utilisé:
- **Next.js** pour le frontend et l'API
- **Supabase** pour la base de données PostgreSQL
- **Resend** pour envoyer les emails
- **Vercel** pour l'hébergement
- **Hostinger** pour le DNS (on a notre propre domaine)

La base de données a des tables pour:
- Les sections (nous on n'en a qu'une, mais le système supporte plusieurs unités)
- Les événements
- Les produits (avec tous les champs spéciaux pour les vins)
- Les créneaux
- Les commandes
- Les items de commande (les lignes de produits dans chaque commande)
- Les codes promo
- Des logs d'audit pour tracer qui fait quoi

## Les Galères Actuelles

**Le plus urgent:**
Il y a une migration SQL pour ajouter les champs de détails de vins dans la table `products` qui n'a JAMAIS été exécutée sur Supabase. Du coup, les pages produits plantent quand elles essaient d'afficher les détails des vins. Le fichier SQL existe quelque part dans le projet, mais il faut le lancer sur la vraie base de données.

**Autres trucs:**
- On vient de migrer vers Next.js 15 et React 19, donc il reste peut-être des trucs à nettoyer
- J'ai dû mettre `ignoreBuildErrors: true` dans la config Next.js pour que ça compile (pas terrible, je sais)
- Le système d'emails avec Resend n'est pas encore complètement configuré
- Il faudrait créer des templates pré-configurés pour créer des événements plus rapidement (genre "Template Vente Crémant" avec tous les réglages par défaut)

## Les Features qu'on Aimerait Ajouter

Pas urgent, mais ce serait cool:
1. **Dashboard avec stats** - Voir en un coup d'œil combien de commandes, quel CA, quels créneaux sont pleins
2. **Modification rapide de commandes** - Parfois les gens se trompent, faudrait pouvoir éditer une commande facilement
3. **Duplication d'événements** - Pouvoir copier un événement de l'an dernier pour cette année
4. **Statuts de commandes** - Genre "Payée", "Préparée", "Livrée" avec un dropdown pour changer
5. **Liste imprimable par créneau** - Pour qu'on sache qui vient à quelle heure le jour J
6. **Annuler un code promo** - Des fois les gens utilisent un code par erreur, faut pouvoir l'enlever après coup
7. **Composants réutilisables** - Des badges, des cartes produits standardisées, etc.

## Le Style et l'Esprit

C'est un site pour des scouts, donc on garde une vibe sympa, accessible, pas trop corporate. Les couleurs viennent de notre section (stockées dans la BDD). On utilise Tailwind CSS pour le style.

Le code est en français pour les variables et commentaires (désolé, c'est plus naturel pour moi), mais les noms de fonctions et concepts techniques restent en anglais quand c'est standard.

## Ce qu'il Faut Savoir

- **Environnement**: Tout est en prod sur Vercel, la BDD sur Supabase
- **Auth admin**: C'est juste un mot de passe stocké en variable d'env, rien de fou
- **Money**: Tout est en centimes (integers) pour éviter les problèmes de float
- **Dates**: On gère le timezone Europe/Brussels, attention aux conversions
- **Discount "9+1"**: Il y a une logique spéciale "achetez 10, payez 9" pour certains événements

## Comment Contribuer

Si tu veux ajouter un truc ou corriger un bug:
1. Le code est dans `app/` pour les pages et routes
2. Les composants React sont dans `components/`
3. Les utilitaires et helpers dans `lib/`
4. Les types TypeScript sont un peu partout, j'essaie de typer correctement mais c'est pas toujours parfait

Hésite pas à regarder le code existant pour comprendre les patterns. J'ai essayé de rester cohérent mais je suis pas un dev professionnel, donc il y a sûrement des trucs à améliorer.

Voilà, en gros c'est ça! Si t'as des questions ou si un truc est pas clair, dis-le moi. L'objectif c'est que ça soit simple, fonctionnel, et que ça nous facilite la vie pour organiser nos événements scouts.

---

*Projet développé avec ❤️ pour l'Unité Scoute d'Ecaussinnes (BR002)*
