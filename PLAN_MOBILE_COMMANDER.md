# Plan d'Action - Composant Mobile Commander

## 📱 Objectif
Créer un nouveau composant React dédié exclusivement à l'expérience mobile de la page commander, avec un workflow repensé pour une UX optimale sur petit écran.

## 🎯 Principes de Design

### Ce qui ne va pas actuellement :
- ❌ Descriptions de produits trop longues qui s'entremelent
- ❌ Éléments qui se superposent
- ❌ Workflow desktop adapté en responsive (lourd et peu digeste)
- ❌ Manque d'optimisation pour le touch
- ❌ Informations trop denses

### Ce qu'on veut :
- ✅ Composant séparé, léger et optimisé mobile-first
- ✅ Workflow simplifié et intuitif
- ✅ Cartes produits compactes avec modales pour détails
- ✅ Navigation fluide entre les étapes
- ✅ Résumé de commande sticky en bas
- ✅ Interactions tactiles optimisées
- ✅ Même design language que le reste de l'app

---

## 🏗️ Architecture Technique

### 1. Structure des fichiers
```
app/event/[slug]/commander/
├── page.tsx                    # Desktop version (existant, inchangé)
├── MobileCommander.tsx         # NOUVEAU - Composant mobile principal
├── components/
│   ├── MobileProductCard.tsx   # Carte produit compacte
│   ├── MobileStepIndicator.tsx # Indicateur d'étapes simplifié
│   ├── MobileStickyFooter.tsx  # Résumé et CTA sticky
│   └── ProductDetailsModal.tsx # Modal détails produit
└── hooks/
    └── useDeviceDetection.ts   # Hook pour détecter mobile
```

### 2. Détection du device
- Créer un hook `useDeviceDetection` qui détecte si écran < 768px
- Dans `page.tsx`, conditionner l'affichage :
  ```tsx
  const isMobile = useDeviceDetection()
  return isMobile ? <MobileCommander /> : <DesktopCommander />
  ```

---

## 📋 Étapes du Workflow Mobile

### Étape 1 : Sélection des produits
**Interface :**
- Liste scrollable verticale de cartes produits compactes
- Chaque carte affiche :
  - Image (ratio 1:1, petite)
  - Nom du produit
  - Prix
  - Badges allergènes (max 2-3 visibles)
  - Bouton "Voir détails" (ouvre modal)
  - Contrôles quantité (-, qty, +) en ligne
- Description courte tronquée (2 lignes max)

**Modal Détails Produit :**
- Slide up from bottom (animation fluide)
- Image plus grande
- Description complète
- Liste complète des allergènes
- Badges végétarien/vegan
- Stock disponible
- Contrôles quantité
- Bouton "Ajouter au panier" puis fermeture

**Footer Sticky :**
- Total actuel
- Nombre d'articles
- Bouton "Continuer" (désactivé si panier vide)

### Étape 2 : Type de livraison
**Interface :**
- 3 grandes cartes tactiles :
  - 📦 Retrait sur place
  - 🚚 Livraison
  - 🏠 Sur site
- Sélection visuelle claire (border + background)
- Minimum 6 bouteilles pour livraison affiché clairement
- Si livraison : formulaire adresse apparaît en dessous

**Footer Sticky :**
- Total + frais de livraison si applicable
- Bouton "Continuer"

### Étape 3 : Créneau (si applicable)
**Interface :**
- Liste de cartes de dates
- Chaque date expandable montre les créneaux horaires
- Créneaux en cards tactiles avec :
  - Heure
  - Places restantes
  - Badge "Complet" si full
- Sélection visuelle claire

**Footer Sticky :**
- Récapitulatif : "Retrait le [date] à [heure]"
- Bouton "Continuer"

### Étape 4 : Informations personnelles
**Interface :**
- Formulaire simplifié en 1 colonne
- Inputs optimisés mobile :
  - Nom
  - Email (keyboard type email)
  - Téléphone (keyboard type tel)
  - Notes (facultatif, textarea)
- Labels clairs et grands
- Validation en temps réel

**Footer Sticky :**
- Bouton "Continuer vers paiement"

### Étape 5 : Paiement & Confirmation
**Interface :**
- Choix du mode de paiement (cartes tactiles)
- Résumé complet de la commande :
  - Produits (liste compacte)
  - Type de livraison
  - Créneau
  - Total avec détails
- Checkbox RGPD (grand et tactile)
- Code promo (collapsible)

**Footer Sticky :**
- Total final en gros
- Bouton "Confirmer la commande"

---

## 🎨 Composants à Créer

### 1. `MobileCommander.tsx`
**Responsabilités :**
- Gestion de l'état global (cart, step, form)
- Orchestration des étapes
- Appels API
- Logique métier partagée

**Props :**
```tsx
interface MobileCommanderProps {
  event: Event
  initialCart?: Record<string, number>
}
```

### 2. `MobileProductCard.tsx`
**Props :**
```tsx
interface MobileProductCardProps {
  product: Product
  quantity: number
  onQuantityChange: (qty: number) => void
  onShowDetails: () => void
}
```

**Design :**
- Flexbox row/column selon l'espace
- Image 80x80px
- Texte compact
- Boutons touch-friendly (min 44x44px)

### 3. `ProductDetailsModal.tsx`
**Props :**
```tsx
interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  quantity: number
  onAddToCart: (qty: number) => void
}
```

**Animation :**
- Transform: translateY(100%) → translateY(0)
- Duration: 300ms ease-out
- Backdrop blur

### 4. `MobileStepIndicator.tsx`
**Props :**
```tsx
interface MobileStepIndicatorProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
}
```

**Design :**
- Version simplifiée de StepBar
- Icônes + numéros seulement (pas de texte)
- Ligne de progression entre les étapes
- Compact (height: 60px max)

### 5. `MobileStickyFooter.tsx`
**Props :**
```tsx
interface MobileStickyFooterProps {
  totalCents: number
  itemCount: number
  buttonLabel: string
  buttonDisabled: boolean
  onButtonClick: () => void
  additionalInfo?: string
}
```

**Style :**
- Position: fixed bottom-0
- Background: white avec shadow
- Padding: 1rem
- Z-index: 40
- Border-top: 2px solid

---

## 🔧 Hooks & Utilities

### `useDeviceDetection.ts`
```tsx
export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}
```

### Logique réutilisée de `page.tsx`
- Calculs de prix (totalCents, deliveryFee, discount)
- Validation de formulaire (zod schema)
- Gestion du panier (localStorage)
- Appels API (createOrder)
- Code promo

---

## 📐 Spécifications CSS/Tailwind

### Breakpoints
- Mobile: `< 768px` → Affiche MobileCommander
- Desktop: `>= 768px` → Affiche page.tsx normal

### Espacements Mobile
- Padding container: `px-4 py-6`
- Gap entre cartes: `gap-3`
- Margin bottom pour éviter footer: `pb-32`

### Cartes Produits
```tsx
className="bg-white rounded-lg shadow-sm border border-gray-200 p-4
           active:shadow-md active:scale-[0.98] transition-all"
```

### Boutons Tactiles
```tsx
className="min-h-[44px] min-w-[44px] rounded-lg
           active:scale-95 transition-transform"
```

### Footer Sticky
```tsx
className="fixed bottom-0 left-0 right-0 bg-white border-t-2
           border-gray-200 p-4 shadow-lg z-40"
```

---

## ✅ Checklist d'Implémentation

### Phase 1 : Setup
- [ ] Créer le dossier `components/` et `hooks/`
- [ ] Créer `useDeviceDetection.ts`
- [ ] Créer le squelette de `MobileCommander.tsx`
- [ ] Modifier `page.tsx` pour conditionner l'affichage

### Phase 2 : Composants UI de base
- [ ] Créer `MobileProductCard.tsx`
- [ ] Créer `ProductDetailsModal.tsx`
- [ ] Créer `MobileStepIndicator.tsx`
- [ ] Créer `MobileStickyFooter.tsx`

### Phase 3 : Étapes du workflow
- [ ] Implémenter étape 1 : Sélection produits
- [ ] Implémenter étape 2 : Type livraison
- [ ] Implémenter étape 3 : Créneaux
- [ ] Implémenter étape 4 : Informations perso
- [ ] Implémenter étape 5 : Paiement & confirmation

### Phase 4 : Logique & Intégration
- [ ] Migrer logique panier depuis page.tsx
- [ ] Migrer logique calculs de prix
- [ ] Intégrer API orders
- [ ] Gestion localStorage du panier
- [ ] Validation formulaire avec zod

### Phase 5 : Polish & Tests
- [ ] Animations fluides (modales, transitions)
- [ ] Touch feedback sur tous les boutons
- [ ] Gestion des états loading/error
- [ ] Tests sur différents mobiles
- [ ] Optimisation performances

---

## 🎯 Points d'Attention

### Performance
- Lazy load des images produits
- Debounce sur les inputs de quantité
- Mémorisation des calculs (useMemo)
- Éviter les re-renders inutiles

### Accessibilité
- Labels ARIA sur tous les boutons
- Focus visible
- Taille minimale des zones tactiles (44x44px)
- Contraste suffisant

### UX Mobile
- Feedback visuel immédiat sur touch
- Animations fluides (pas de jank)
- Messages d'erreur clairs
- Loading states explicites
- Pas de hover states (remplacer par active)

### Edge Cases
- Panier vide
- Stock épuisé
- Code postal invalide
- Créneaux complets
- Erreurs réseau

---

## 📊 État Partagé

### Structure du state dans MobileCommander
```tsx
const [cart, setCart] = useState<Record<string, number>>({})
const [currentStep, setCurrentStep] = useState(0)
const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY' | 'ON_SITE' | null>(null)
const [formData, setFormData] = useState<Partial<OrderFormData>>({})
const [modalProduct, setModalProduct] = useState<Product | null>(null)
```

---

## 🚀 Ordre de Développement Recommandé

1. **Hook `useDeviceDetection`** → Permettre la détection
2. **Squelette `MobileCommander`** → Structure de base
3. **`MobileStickyFooter`** → Footer réutilisé partout
4. **`MobileStepIndicator`** → Navigation entre étapes
5. **`MobileProductCard`** → Carte produit de base
6. **`ProductDetailsModal`** → Modal détails
7. **Étape 1 complète** → Sélection produits fonctionnelle
8. **Étapes 2-5** → Une par une dans l'ordre
9. **Intégration complète** → Tout connecter
10. **Polish final** → Animations, feedback, edge cases

---

## 📝 Notes Importantes

- **Ne pas toucher à `page.tsx` existant** (sauf pour ajouter la condition mobile/desktop)
- **Réutiliser le design language** : mêmes couleurs (amber, green), mêmes animations
- **LocalStorage** : Garder la même clé `cart_${slug}` pour compatibilité
- **TypeScript strict** : Typer tous les props et states
- **Commentaires** : Documenter les composants complexes
- **Git** : Commit réguliers par feature

---

## 🎨 Palette de Couleurs (Cohérence)

```css
/* Primaire */
--amber-600: #d97706
--amber-50: #fffbeb

/* Secondaire */
--green-800: #166534
--emerald-900: #064e3b

/* Neutrals */
--gray-900: #111827
--gray-600: #4b5563
--gray-200: #e5e7eb

/* États */
--success: #10b981
--error: #ef4444
--warning: #f59e0b
```

---

**Prêt à commencer l'implémentation ! 🚀**
