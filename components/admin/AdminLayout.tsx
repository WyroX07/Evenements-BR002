'use client'

import { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Tag,
  QrCode,
  Search,
  LogOut,
  ChevronRight
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const navSections = [
    {
      title: 'Vue d\'ensemble',
      items: [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          href: '/admin/dashboard',
          active: pathname === '/admin/dashboard',
        },
        {
          icon: Search,
          label: 'Rechercher',
          href: '/admin/search',
          active: pathname?.startsWith('/admin/search'),
        },
      ]
    },
    {
      title: 'Gestion',
      items: [
        {
          icon: Calendar,
          label: 'Événements',
          href: '/admin/events',
          active: pathname?.startsWith('/admin/events'),
        },
        {
          icon: ShoppingBag,
          label: 'Commandes',
          href: '/admin/orders',
          active: pathname?.startsWith('/admin/orders') && !pathname?.includes('/admin/orders/'),
          badge: null, // TODO: Add count of pending orders
        },
        {
          icon: Tag,
          label: 'Codes promo',
          href: '/admin/promo-codes',
          active: pathname === '/admin/promo-codes',
        },
      ]
    },
    {
      title: 'Outils',
      items: [
        {
          icon: QrCode,
          label: 'Scanner',
          href: '/admin/scan',
          active: pathname?.startsWith('/admin/scan'),
        },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo/Title */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Scouts</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6">
              <h2 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h2>
              <div className="space-y-1 px-3">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.active
                          ? 'bg-[#003f5c] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.active && <ChevronRight className="w-4 h-4" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}
