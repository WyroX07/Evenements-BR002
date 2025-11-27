'use client'

import { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, Tag, QrCode, LogOut } from 'lucide-react'

interface MobileAdminLayoutProps {
  children: ReactNode
}

export default function MobileAdminLayout({ children }: MobileAdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/admin/dashboard',
      active: pathname === '/admin/dashboard',
    },
    {
      icon: Calendar,
      label: 'Événements',
      href: '/admin/events',
      active: pathname?.startsWith('/admin/events'),
    },
    {
      icon: Tag,
      label: 'Promos',
      href: '/admin/promo-codes',
      active: pathname === '/admin/promo-codes',
    },
    {
      icon: QrCode,
      label: 'Scanner',
      href: '/admin/scan',
      active: pathname?.startsWith('/admin/scan'),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <main className="pb-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={`mobile-nav-${item.label}-${index}`}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  item.active
                    ? 'text-[#003f5c]'
                    : 'text-gray-500 active:text-[#003f5c]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${item.active ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-medium ${item.active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {item.active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#003f5c] rounded-t-full" />
                )}
              </button>
            )
          })}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 text-red-500 active:text-red-600 transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">
              Quitter
            </span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-inset-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  )
}
