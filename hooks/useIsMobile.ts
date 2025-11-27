'use client'

import { useState, useEffect } from 'react'

/**
 * Hook pour détecter si l'utilisateur est sur mobile
 * Utilise une media query pour détecter les écrans < 768px (breakpoint md de Tailwind)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Fonction pour vérifier la taille de l'écran
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Vérification initiale
    checkMobile()

    // Écouter les changements de taille d'écran
    window.addEventListener('resize', checkMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}
