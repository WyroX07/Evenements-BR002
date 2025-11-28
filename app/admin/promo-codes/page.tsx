'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import PromoCodeForm, { PromoCodeFormValues } from '@/components/forms/PromoCodeForm'
import { useToast } from '@/contexts/ToastContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import MobilePromoCodes from '@/components/admin/mobile/MobilePromoCodes'
import ResponsiveModal from '@/components/ui/ResponsiveModal'
import AdminLayout from '@/components/admin/AdminLayout'

interface PromoCode {
  id: string
  code: string
  discount_cents: number
  is_active: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export default function PromoCodesPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const isMobile = useIsMobile()

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/promo-codes')

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login')
          return
        }
        throw new Error('Erreur de chargement')
      }

      const data = await res.json()
      setPromoCodes(data.promoCodes || [])
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (values: PromoCodeFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: values.code,
          discountCents: Math.round(values.discountEuros * 100),
          description: values.description || null,
          isActive: values.isActive,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de création')
      }

      const data = await res.json()
      setPromoCodes([data.promoCode, ...promoCodes])
      setIsModalOpen(false)
      addToast('Code promo créé avec succès', 'success')
    } catch (err: any) {
      addToast(err.message || 'Erreur de création', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: PromoCodeFormValues) => {
    if (!editingPromo) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/promo-codes/${editingPromo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountCents: Math.round(values.discountEuros * 100),
          description: values.description || null,
          isActive: values.isActive,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }

      const data = await res.json()
      setPromoCodes(promoCodes.map(p => p.id === editingPromo.id ? data.promoCode : p))
      setIsModalOpen(false)
      setEditingPromo(null)
      addToast('Code promo mis à jour avec succès', 'success')
    } catch (err: any) {
      addToast(err.message || 'Erreur de mise à jour', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de suppression')
      }

      setPromoCodes(promoCodes.filter(p => p.id !== id))
      addToast('Code promo supprimé', 'success')
    } catch (err: any) {
      addToast(err.message || 'Erreur de suppression', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !promo.is_active,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de mise à jour')
      }

      const data = await res.json()
      setPromoCodes(promoCodes.map(p => p.id === promo.id ? data.promoCode : p))
      addToast(data.promoCode.is_active ? 'Code activé' : 'Code désactivé', 'success')
    } catch (err: any) {
      addToast(err.message || 'Erreur de mise à jour', 'error')
    }
  }

  const openModal = (promo?: PromoCode) => {
    setEditingPromo(promo || null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPromo(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchPromoCodes()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  // Mobile version
  if (isMobile) {
    return (
      <>
        <MobilePromoCodes
          promoCodes={promoCodes}
          onEdit={(promo) => openModal(promo)}
          onDelete={handleDelete}
          onCreate={() => openModal()}
        />

        <ResponsiveModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingPromo ? 'Modifier le code' : 'Nouveau code'}
          size="md"
        >
          <PromoCodeForm
            initialValues={editingPromo ? {
              code: editingPromo.code,
              discountEuros: editingPromo.discount_cents / 100,
              description: editingPromo.description || '',
              isActive: editingPromo.is_active,
            } : undefined}
            onSubmit={editingPromo ? handleUpdate : handleCreate}
            onCancel={closeModal}
            isLoading={isSubmitting}
          />
        </ResponsiveModal>
      </>
    )
  }

  // Desktop version
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Codes promo</h1>
              <p className="text-sm text-gray-600 mt-1">Gérer les codes de réduction</p>
            </div>
          </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Codes Promo</h1>
              <p className="text-sm text-gray-600">
                {promoCodes.length} code{promoCodes.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau code
          </Button>
        </div>

        {/* Promo Codes List */}
        {promoCodes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun code promo
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre premier code promo pour offrir des réductions à vos clients
            </p>
            <Button onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un code promo
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Réduction
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-gray-900">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-amber-600 font-semibold">
                        -{(promo.discount_cents / 100).toFixed(2)} €
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">
                        {promo.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(promo)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: promo.is_active ? '#dcfce7' : '#fee2e2',
                          color: promo.is_active ? '#166534' : '#991b1b',
                        }}
                      >
                        {promo.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(promo)}
                          className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          disabled={deletingId === promo.id}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPromo ? 'Modifier le code promo' : 'Nouveau code promo'}
      >
        <PromoCodeForm
          initialValues={editingPromo ? {
            code: editingPromo.code,
            discountEuros: editingPromo.discount_cents / 100,
            description: editingPromo.description || '',
            isActive: editingPromo.is_active,
          } : undefined}
          onSubmit={editingPromo ? handleUpdate : handleCreate}
          onCancel={closeModal}
          isLoading={isSubmitting}
        />
      </Modal>
      </div>
    </AdminLayout>
  )
}
