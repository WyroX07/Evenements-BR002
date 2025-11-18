'use client'

import { cn } from '@/lib/utils'

/**
 * Composant affichant les logos des méthodes de paiement acceptées
 * Style e-commerce moderne
 */

interface PaymentMethodsBadgeProps {
  variant?: 'compact' | 'full'
  className?: string
}

export default function PaymentMethodsBadge({
  variant = 'compact',
  className,
}: PaymentMethodsBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex gap-1.5">
          {/* Cash */}
          <div className="h-6 px-2 bg-green-600 text-white rounded flex items-center justify-center text-xs font-medium">
            Cash
          </div>

          {/* Carte */}
          <div className="h-6 px-2 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-medium">
            Carte
          </div>

          {/* Sans contact */}
          <div className="h-6 px-2 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-medium">
            📱 NFC
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {/* Cash */}
        <div className="aspect-[3/2] bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">CASH</span>
        </div>

        {/* Visa */}
        <div className="aspect-[3/2] bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
          <svg className="h-5" viewBox="0 0 48 16" fill="none">
            <path d="M20.5 0L17.8 16h4.3l2.7-16h-4.3zM35.4 10.4c0-2.9-4-3.1-4-4.4 0-.4.4-.8 1.2-.9 1.9-.2 3.3.3 4.3.8l.8-3.7c-1-.4-2.4-.8-4.1-.8-4.3 0-7.4 2.3-7.4 5.6 0 2.4 2.2 3.8 3.8 4.6 1.7.8 2.3 1.3 2.3 2 0 1.1-1.3 1.6-2.5 1.6-2.1 0-3.2-.3-4.9-1.1l-.9 4.1c1.1.5 3.2.9 5.3.9 4.6.1 7.6-2.2 7.6-5.7zM45.4 0c-1 0-1.8.6-2.2 1.5L36.5 16h4.6l.9-2.5h5.6l.5 2.5H52L48.7 0h-3.3zm.1 5.7l1.3 6.4h-3.6l2.3-6.4zM15.7 0l-4.2 10.9L11 7.3C10.2 4.6 7.9 1.9 5.2.9L9 16h4.6L20.3 0h-4.6z" fill="#1434CB"/>
          </svg>
        </div>

        {/* Mastercard */}
        <div className="aspect-[3/2] bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
          <svg className="h-5" viewBox="0 0 48 32" fill="none">
            <circle cx="18" cy="16" r="14" fill="#EB001B"/>
            <circle cx="30" cy="16" r="14" fill="#F79E1B" fillOpacity="0.8"/>
          </svg>
        </div>

        {/* Apple Pay */}
        <div className="aspect-[3/2] bg-black rounded-lg flex items-center justify-center shadow-sm">
          <svg className="h-5" viewBox="0 0 48 20" fill="white">
            <path d="M9.5 3.5c.6-.7 1-1.7 1-2.6 0-.2 0-.3-.1-.4-.9 0-2 .6-2.6 1.4-.5.6-1 1.5-1 2.4 0 .2 0 .3.1.3.1 0 .2.1.3.1.8 0 1.8-.5 2.3-1.2zm.9 1.4c-1.3-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-.1.2-.2.5-.3.7-.5 1.5-.9 3.6.5 5.8.7 1.1 1.5 2.3 2.7 2.3 1 0 1.3-.6 2.5-.6s1.5.6 2.6.6c1.1 0 1.9-1.1 2.6-2.2.5-.7.7-1.1.9-1.8-2.5-.9-2.9-4.5-.6-5.8-.9-1.3-2.3-2-3.5-2z"/>
            <path d="M18.8 4.3c2.6 0 4.4 1.8 4.4 4.3s-1.8 4.3-4.4 4.3h-2.7v4.2h-2.3V4.3h5zm-2.7 6.9h2.3c1.8 0 2.8-1 2.8-2.6s-1-2.6-2.8-2.6h-2.3v5.2zm10.4 7.9c-1.8 0-3-1.2-3-2.9s1.2-2.9 3.3-2.9h2.7v-.5c0-1.2-.8-1.9-2.1-1.9-1.1 0-1.9.6-2 1.5h-1.9c.1-1.8 1.6-3.1 3.9-3.1 2.4 0 3.9 1.3 3.9 3.3v6.9h-1.9v-1.6h-.1c-.6 1.1-1.8 1.8-3.1 1.8zm.5-1.6c1.5 0 2.5-1 2.5-2.4v-.5h-2.4c-1.3 0-2.1.6-2.1 1.5s.7 1.4 2 1.4zm10.6 3.2c-1.3 0-2.4-.5-3-1.4l1.4-1.1c.4.5 1 .8 1.7.8 1.1 0 1.8-.6 1.8-1.9v-1.5h-.1c-.5.9-1.5 1.5-2.7 1.5-2.2 0-3.7-1.7-3.7-4.1s1.5-4.1 3.7-4.1c1.2 0 2.2.6 2.7 1.5h.1V9.5h1.9v8.9c0 2.3-1.7 3.8-4.2 3.8zm.4-5c1.4 0 2.3-1.1 2.3-2.6s-.9-2.6-2.3-2.6-2.3 1.1-2.3 2.6.9 2.6 2.3 2.6z"/>
          </svg>
        </div>

        {/* Google Pay */}
        <div className="aspect-[3/2] bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
          <svg className="h-5" viewBox="0 0 48 20" fill="none">
            <path d="M23.2 10v5.8h-1.9V4.2h5c1.2 0 2.3.4 3.1 1.2.8.8 1.2 1.9 1.2 3.1s-.4 2.3-1.2 3.1c-.8.8-1.9 1.2-3.1 1.2h-2.1v.2zm0-4v2.4h3.1c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4s-.2-1-.6-1.4c-.4-.4-.9-.6-1.4-.6h-3.1v.6zm12.4-.7c1.2 0 2.2.4 3 1.1.8.7 1.2 1.7 1.2 2.9v6.5h-1.8v-1.5h-.1c-.7 1.2-1.7 1.8-3 1.8-1 0-1.9-.3-2.6-.9-.7-.6-1-1.4-1-2.3 0-1 .4-1.8 1.1-2.4.7-.6 1.7-.9 2.9-.9 1 0 1.9.2 2.6.5v-.4c0-.6-.3-1.2-.7-1.6-.5-.4-1-.7-1.7-.7-.9 0-1.7.4-2.2 1.1l-1.7-1c.8-1.2 2.1-1.8 3.9-1.8v.6zm-2.5 7.5c0 .5.2.9.6 1.2.4.3.9.5 1.4.5.7 0 1.4-.3 2-.8.6-.5.9-1.2.9-1.9-.5-.4-1.3-.6-2.3-.6-.7 0-1.3.2-1.8.5-.5.3-.8.7-.8 1.1zm11.5-11v13.9h-1.9V1.8h1.9z" fill="#5F6368"/>
            <path d="M14.8 8.2c0-.6-.1-1.2-.2-1.8H7.6v3.4h4c-.2.9-.7 1.7-1.5 2.2v2.2h2.4c1.4-1.3 2.2-3.2 2.2-5.5l.1-.5z" fill="#4285F4"/>
            <path d="M7.6 15.8c2 0 3.7-.7 5-1.8l-2.4-1.9c-.7.5-1.6.7-2.6.7-2 0-3.7-1.3-4.3-3.2H.7v2c1.3 2.6 4 4.4 6.9 4.4v-.2z" fill="#34A853"/>
            <path d="M3.3 9.6c-.4-1.2-.4-2.4 0-3.6v-2H.7c-1.4 2.8-1.4 6.1 0 8.9l2.6-2.3z" fill="#FBBC04"/>
            <path d="M7.6 3.8c1.1 0 2.1.4 2.9 1.2l2.1-2.1C11.2 1.6 9.5.8 7.6.8 4.7.8 2 2.6.7 5.2l2.6 2c.6-1.9 2.3-3.2 4.3-3.2v-.2z" fill="#EA4335"/>
          </svg>
        </div>

        {/* Bancontact */}
        <div className="aspect-[3/2] bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
          <svg className="h-5" viewBox="0 0 48 20" fill="none">
            <path d="M3 10h42M3 6h42M3 14h42" stroke="#005498" strokeWidth="2"/>
            <text x="24" y="13" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#005498">BC</text>
          </svg>
        </div>
      </div>

      <p className="text-xs text-center text-gray-500">
        Tous les moyens de paiement courants acceptés
      </p>
    </div>
  )
}
