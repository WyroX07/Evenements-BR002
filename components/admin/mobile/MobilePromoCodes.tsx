'use client'

import { useState } from 'react'
import { Plus, Tag, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react'
import MobileAdminLayout from './MobileAdminLayout'

interface PromoCode {
  id: string
  code: string
  discount_cents: number
  is_active: boolean
  description: string | null
  created_at: string
  updated_at: string
}

interface MobilePromoCodesProps {
  promoCodes: PromoCode[]
  onEdit: (promo: PromoCode) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export default function MobilePromoCodes({
  promoCodes,
  onEdit,
  onDelete,
  onCreate
}: MobilePromoCodesProps) {
  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2) + ' €'
  }

  return (
    <MobileAdminLayout>
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Codes Promo</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {promoCodes.length} code{promoCodes.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Tag className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Promo Codes List */}
      <div className="px-4 pt-4 pb-6 space-y-3">
        {promoCodes.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-2">Aucun code promo</p>
            <p className="text-sm text-gray-400">Créez votre premier code</p>
          </div>
        ) : (
          promoCodes.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden active:shadow-md transition-shadow"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-lg font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {promo.code}
                      </code>
                      {promo.is_active ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    {promo.description && (
                      <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                    )}
                  </div>
                </div>

                {/* Discount */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-700 font-medium">Réduction</span>
                    <span className="text-xl font-bold text-amber-600">
                      -{formatPrice(promo.discount_cents)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(promo)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm active:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(promo.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium text-sm active:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onCreate}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#003f5c] text-white rounded-full shadow-lg active:scale-95 active:shadow-xl transition-all flex items-center justify-center z-40 hover:bg-[#2f6690]"
      >
        <Plus className="w-7 h-7" />
      </button>
    </MobileAdminLayout>
  )
}
