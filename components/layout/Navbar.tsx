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
            {navItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={`desktop-nav-${item.label}-${index}`}
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
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <Menu
                className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                  mobileMenuOpen
                    ? 'opacity-0 rotate-90 scale-0'
                    : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${
                  mobileMenuOpen
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-0'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen
              ? 'max-h-96 opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={`mobile-menu-${item.label}-${index}`}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      active
                        ? 'bg-blue-50 text-[#003f5c]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={{
                      animation: mobileMenuOpen
                        ? `slideInFromTop 0.3s ease-out ${index * 0.1}s both`
                        : 'none',
                    }}
                  >
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
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
                style={{
                  animation: mobileMenuOpen
                    ? `slideInFromTop 0.3s ease-out ${navItems.length * 0.1}s both`
                    : 'none',
                }}
              >
                <Settings className="w-5 h-5 transition-transform group-hover:rotate-90" />
                Administration
              </button>
            </div>
          </div>
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes slideInFromTop {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </nav>
  )
}
