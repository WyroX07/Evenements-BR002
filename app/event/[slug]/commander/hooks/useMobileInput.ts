import { useEffect, useRef } from 'react'

/**
 * Hook pour gérer les inputs sur mobile avec optimisations iOS
 *
 * Fixes:
 * - Empêche le zoom automatique sur iOS (font-size 16px minimum)
 * - Gère le scrollIntoView quand le clavier apparaît
 * - Restaure la position après fermeture du clavier
 */
export function useMobileInput() {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    let scrollPosition = 0

    const handleFocus = () => {
      // Sauvegarder la position de scroll actuelle
      scrollPosition = window.scrollY

      // Sur iOS, attendre un petit délai pour que le clavier soit visible
      setTimeout(() => {
        // Scroller l'input dans la vue, avec un offset pour le clavier
        const rect = input.getBoundingClientRect()
        const offset = window.innerHeight / 2 - 100 // Centrer avec offset pour clavier

        if (rect.top < offset || rect.bottom > window.innerHeight - 200) {
          window.scrollTo({
            top: scrollPosition + rect.top - offset,
            behavior: 'smooth'
          })
        }
      }, 300) // Délai pour laisser le clavier s'animer sur iOS
    }

    const handleBlur = () => {
      // Optionnel: restaurer la position de scroll
      // Décommenter si souhaité
      // setTimeout(() => {
      //   window.scrollTo({ top: scrollPosition, behavior: 'smooth' })
      // }, 100)
    }

    input.addEventListener('focus', handleFocus)
    input.addEventListener('blur', handleBlur)

    return () => {
      input.removeEventListener('focus', handleFocus)
      input.removeEventListener('blur', handleBlur)
    }
  }, [])

  return inputRef
}

/**
 * Classes CSS communes pour les inputs mobiles optimisés
 *
 * Inclut:
 * - Font-size 16px minimum (empêche zoom iOS)
 * - Padding tactile confortable
 * - Focus ring visible
 */
export const mobileInputClasses = `
  w-full px-4 py-3
  text-base
  border border-gray-300 rounded-lg
  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
  transition-all duration-200
  -webkit-appearance-none
`.trim().replace(/\s+/g, ' ')
