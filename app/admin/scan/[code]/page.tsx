'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminScanRedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter()

  useEffect(() => {
    params.then(async (p) => {
      try {
        // Fetch order by code to get the ID
        const res = await fetch(`/api/orders/${p.code}`)

        if (!res.ok) {
          // If order not found, go back to scan page with error
          router.push('/admin/scan?error=not_found')
          return
        }

        const data = await res.json()

        // Redirect to the unified order detail page
        router.push(`/admin/orders/${data.order.id}`)
      } catch (error) {
        router.push('/admin/scan?error=fetch_failed')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#003f5c] mx-auto mb-4" />
        <p className="text-gray-600">Chargement de la commande...</p>
      </div>
    </div>
  )
}
