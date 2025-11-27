'use client'

import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  showCloseButton?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  className?: string
}

/**
 * Modal responsive qui affiche :
 * - Un drawer (slide-up from bottom) sur mobile
 * - Une modal classique centrée sur desktop
 */
export default function ResponsiveModal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  size = 'md',
  className = '',
}: ResponsiveModalProps) {
  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'md:max-w-sm',
    md: 'md:max-w-md',
    lg: 'md:max-w-lg',
    xl: 'md:max-w-xl',
    '2xl': 'md:max-w-2xl',
    '3xl': 'md:max-w-3xl',
    full: 'md:max-w-full md:m-8',
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleBackdropClick}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Mobile: Drawer from bottom */}
        <div className="md:hidden absolute inset-x-0 bottom-0 pointer-events-auto animate-slideUp">
          <div className={`bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl ${className}`}>
            {/* Header sticky */}
            {(title || showCloseButton) && (
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-3xl">
                {title && (
                  <h2 className="text-lg font-bold text-gray-900 pr-8">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-6">
              {children}
            </div>
          </div>
        </div>

        {/* Desktop: Centered modal */}
        <div className="hidden md:flex items-center justify-center min-h-screen p-4 pointer-events-auto">
          <div
            className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} animate-scaleIn relative max-h-[90vh] overflow-hidden flex flex-col ${className}`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                {title && (
                  <h2 className="text-xl font-bold text-gray-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`p-2 hover:bg-gray-100 rounded-full transition-all ${!title ? 'absolute top-4 right-4' : ''}`}
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            )}
            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  )
}
