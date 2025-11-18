'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCloseButton) onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, showCloseButton])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/60 backdrop-blur-sm animate-slide-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && showCloseButton) onClose()
      }}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-2xl shadow-2xl w-full',
          sizes[size],
          'max-h-[90vh] flex flex-col',
          'transform transition-all duration-300',
          'border border-gray-100'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <h2
              id="modal-title"
              className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="group flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-gray-100 bg-gray-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
