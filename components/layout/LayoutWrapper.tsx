'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import AdminLoginModal from './AdminLoginModal'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Masquer la navbar et le footer sur toutes les pages admin
  const isAdminPage = pathname?.startsWith('/admin')
  const isCommanderPage = pathname?.includes('/commander')
  const isConfirmationPage = pathname?.includes('/confirmation')
  const isHomePage = pathname === '/'
  const shouldHideNavAndFooter = isAdminPage || (isHomePage && isMobile)
  const shouldHideFooter = (isCommanderPage && isMobile) || isAdminPage || isConfirmationPage || (isHomePage && isMobile)

  return (
    <>
      {!shouldHideNavAndFooter && <Navbar onOpenAdminModal={() => setAdminModalOpen(true)} />}
      <main className="flex-1">
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </>
  )
}
