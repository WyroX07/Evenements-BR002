'use client'

import { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import AdminLoginModal from './AdminLoginModal'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [adminModalOpen, setAdminModalOpen] = useState(false)

  return (
    <>
      <Navbar onOpenAdminModal={() => setAdminModalOpen(true)} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </>
  )
}
