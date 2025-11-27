import { useState, useEffect } from 'react'

/**
 * Hook pour détecter si l'utilisateur est sur mobile
 * Breakpoint: < 768px (Tailwind md)
 */
export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Fonction pour vérifier la taille de l'écran
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check initial
    checkDevice()

    // Écouter les changements de taille
    window.addEventListener('resize', checkDevice)

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}
