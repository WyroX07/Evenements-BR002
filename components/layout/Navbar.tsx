'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Info, Menu, X, Settings } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  onOpenAdminModal: () => void
}

export default function Navbar({ onOpenAdminModal }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  const navItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/#about', label: 'À propos', icon: Info },
    { href: '/#events', label: 'Événements', icon: Calendar },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-7 group-hover:scale-105 transition-transform">
              <img
                src="/Logo-Scouts-Ecaussinnes-Couleurs.png"
                alt="Scouts Écaussinnes"
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900">Unité BR002</h1>
              <p className="text-xs text-gray-500">Ventes & Événements</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    active
                      ? 'bg-blue-50 text-[#003f5c]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}

            {/* Admin link */}
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-gray-500 hover:text-[#003f5c] hover:bg-blue-50 transition-all ml-2 border-l border-gray-200"
              title="Administration"
            >
              <Settings className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      active
                        ? 'bg-blue-50 text-[#003f5c]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}

              {/* Admin link mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenAdminModal()
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-gray-500 hover:text-[#003f5c] hover:bg-blue-50 transition-all border-t border-gray-100 mt-2 pt-4 w-full"
              >
                <Settings className="w-5 h-5" />
                Administration
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
