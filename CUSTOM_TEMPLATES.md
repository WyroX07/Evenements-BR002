# Système de Templates Personnalisés pour les Events

## Principe

Ce système permet de créer des landing pages personnalisées pour chaque événement tout en gardant la possibilité de gérer les informations de base via le formulaire admin.

## Architecture Hybride

### 1. Données de Base (via EventForm Admin)
Toutes les informations essentielles sont gérées via le formulaire :
- Nom de l'événement
- Slug (URL)
- Dates de début/fin
- Section
- Statut
- Configuration Hero (titre, sous-titre, image, CTA)

### 2. Templates Personnalisés (via Code)
Pour créer des landing pages uniques et engageantes, créez un composant React personnalisé.

## Comment Créer un Template Personnalisé

### Étape 1 : Créer le Composant Template

Créez un nouveau fichier dans `app/event/templates/` :

```tsx
// app/event/templates/EventTemplate_VOTRE_SLUG.tsx
'use client'

import { Event, Product, Slot } from '@/types/event'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface EventTemplateProps {
  event: Event
  products: Product[]
  slots: Slot[]
}

export default function EventTemplate_CrementPionniers2025({
  event,
  products,
  slots,
}: EventTemplateProps) {
  return (
    <div>
      {/* Hero Section Personnalisée */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${event.hero_image_url})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-6xl font-bold mb-6">{event.hero_title}</h1>
            <p className="text-2xl mb-8">{event.hero_subtitle}</p>
            <Link href={`/event/${event.slug}/commander`}>
              <Button size="lg" className="text-xl px-12 py-6">
                {event.hero_cta_text}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Personnalisée - Histoire */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Notre Histoire</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Insérez ici votre histoire personnalisée...
            </p>
          </div>
        </div>
      </section>

      {/* Section Produits - Layout Personnalisé */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Nos Crémants</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {(product.price_cents / 100).toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA Personnalisée */}
      <section className="py-20 bg-amber-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Soutenez Notre Cause
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Chaque bouteille achetée contribue directement au financement de nos activités scoutes.
          </p>
          <Link href={`/event/${event.slug}/commander`}>
            <Button size="lg" variant="secondary" className="text-xl px-12 py-6">
              Commander Maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
```

### Étape 2 : Enregistrer le Template

Ajoutez votre template dans le fichier `app/event/templates/index.ts` :

```tsx
import EventTemplate_CrementPionniers2025 from './EventTemplate_cremant-pionniers-2025'
// Import d'autres templates...

export const customTemplates: Record<string, React.ComponentType<any>> = {
  'cremant-pionniers-2025': EventTemplate_CrementPionniers2025,
  // 'autre-event-slug': EventTemplate_AutreEvent,
}
```

### Étape 3 : Le Système Charge Automatiquement

La page `app/event/[slug]/page.tsx` vérifie automatiquement si un template personnalisé existe pour le slug :

```tsx
// Si un template personnalisé existe, il sera utilisé
const CustomTemplate = customTemplates[event.slug]
if (CustomTemplate) {
  return <CustomTemplate event={event} products={products} slots={slots} />
}

// Sinon, le template par défaut est utilisé
return <DefaultEventTemplate event={event} products={products} slots={slots} />
```

## Avantages de ce Système

### ✅ Flexibilité Maximale
- Créez des layouts complètement uniques pour chaque événement
- Utilisez n'importe quel composant, animation, ou library

### ✅ Maintenabilité
- Les données sont toujours gérées via l'admin
- Pas besoin de modifier la DB pour changer le design
- Templates versionnés avec Git

### ✅ Performance
- Templates compilés avec Next.js
- Code splitting automatique
- Images optimisées

### ✅ Workflow Hybride
1. **Créer l'événement via Admin** → Données de base (nom, dates, section, etc.)
2. **Développer le template personnalisé** → Design unique, animations, sections custom
3. **Gérer les produits/slots via Admin** → CRUD facile sans toucher au code
4. **Modifier le contenu template** → Éditer directement le composant React

## Templates par Défaut

Si aucun template personnalisé n'est défini, le système utilise automatiquement `DefaultEventTemplate` qui offre :
- Hero section avec image
- Liste des produits
- Grille des créneaux
- Bouton CTA vers la commande
- Design responsive et moderne

## Exemples de Personnalisations

### Hero Animé
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  <h1>{event.hero_title}</h1>
</motion.div>
```

### Carrousel de Produits
```tsx
import { Swiper, SwiperSlide } from 'swiper/react'

<Swiper spaceBetween={30} slidesPerView={3}>
  {products.map(product => (
    <SwiperSlide key={product.id}>
      <ProductCard product={product} />
    </SwiperSlide>
  ))}
</Swiper>
```

### Section Vidéo
```tsx
<section className="relative h-screen">
  <video
    autoPlay
    loop
    muted
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/videos/cremant-making.mp4" type="video/mp4" />
  </video>

  <div className="relative z-10 h-full flex items-center justify-center">
    <h2 className="text-6xl text-white font-bold">
      L'Art du Crémant
    </h2>
  </div>
</section>
```

### Timeline Interactive
```tsx
<div className="space-y-8">
  {milestones.map((milestone, index) => (
    <div key={index} className="flex items-center gap-6">
      <div className="w-32 text-right font-bold text-amber-600">
        {milestone.year}
      </div>
      <div className="w-4 h-4 bg-amber-600 rounded-full" />
      <div className="flex-1">
        <h3 className="font-semibold text-xl">{milestone.title}</h3>
        <p className="text-gray-600">{milestone.description}</p>
      </div>
    </div>
  ))}
</div>
```

## Best Practices

### 1. Réutilisation des Composants
Créez des composants réutilisables pour les sections communes :

```tsx
// components/event-sections/HeroSection.tsx
// components/event-sections/ProductGrid.tsx
// components/event-sections/TestimonialSection.tsx
```

### 2. Types TypeScript
Utilisez toujours les types définis :

```tsx
import { Event, Product, Slot } from '@/types/event'
```

### 3. Responsive Design
Testez toujours sur mobile, tablet et desktop :

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### 4. Accessibilité
- Utilisez des balises sémantiques (`<section>`, `<article>`, `<nav>`)
- Ajoutez des attributs `alt` aux images
- Assurez un bon contraste des couleurs

### 5. Performance
- Optimisez les images avec Next.js Image
- Lazy load les sections non critiques
- Minimisez les animations lourdes

## Workflow Recommandé

1. **Demande** : "Je veux une landing super stylée pour le Crémant 2025"
2. **Admin** : Créer l'événement avec les infos de base via le formulaire
3. **Développement** : Créer le template personnalisé avec design unique
4. **Contenu** : Gérer produits/slots via admin (CRUD facile)
5. **Itération** : Modifier le template selon feedback
6. **Publication** : Activer l'événement dans l'admin

## Support

Pour toute question ou demande de template personnalisé, demandez à Claude de créer un nouveau template en fournissant :
- Le slug de l'événement
- Les sections souhaitées
- Des références de design (screenshots, liens)
- Couleurs et style souhaités
