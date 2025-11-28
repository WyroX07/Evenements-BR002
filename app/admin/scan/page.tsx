'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/useIsMobile'
import { QrCode, Keyboard, Camera, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import Button from '@/components/ui/Button'
import MobileAdminLayout from '@/components/admin/mobile/MobileAdminLayout'
import AdminLayout from '@/components/admin/AdminLayout'

// Dynamically import QR scanner to avoid SSR issues
const QrReader = dynamic(() => import('react-qr-reader').then(mod => mod.QrReader), { ssr: false })

export default function AdminScanPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera')
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const [cameraError, setCameraError] = useState(false)

  const handleScan = (result: any, error: any) => {
    if (result) {
      const code = result?.text || result
      if (code) {
        router.push(`/admin/scan/${code}`)
      }
    }

    // Only handle critical camera errors, not normal scanning errors
    if (error && !cameraError) {
      if (error.name === 'NotAllowedError' || error.name === 'NotFoundError' || error.name === 'NotReadableError') {
        setCameraError(true)
      }
      // Ignore other errors (they happen continuously during normal scanning)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = manualCode.trim().toUpperCase()

    if (code.length === 0) {
      setError('Veuillez entrer un code')
      return
    }

    // Redirect to scan result page
    router.push(`/admin/scan/${code}`)
  }

  if (isMobile) {
    return (
      <MobileAdminLayout>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Scanner QR</h1>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setScanMode('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                scanMode === 'camera'
                  ? 'bg-[#003f5c] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Camera className="w-4 h-4" />
              Camera
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                scanMode === 'manual'
                  ? 'bg-[#003f5c] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Search className="w-4 h-4" />
              Recherche
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="p-4 space-y-4">
          {scanMode === 'camera' ? (
            <>
              {cameraError ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Camera non disponible
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Impossible d'acceder a la camera. Verifiez les permissions ou utilisez la recherche manuelle.
                  </p>
                  <button
                    onClick={() => setScanMode('manual')}
                    className="px-4 py-2 bg-[#003f5c] text-white rounded-lg text-sm font-medium active:bg-[#2f6690]"
                  >
                    Recherche manuelle
                  </button>
                </div>
              ) : (
                <>
                  {/* Scanner Frame */}
                  <div className="relative aspect-square bg-black rounded-xl overflow-hidden shadow-lg">
                    <QrReader
                      onResult={handleScan}
                      constraints={{
                        facingMode: 'environment',
                        aspectRatio: 1
                      }}
                      videoId="video-mobile"
                      scanDelay={300}
                      className="w-full h-full"
                    />

                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white rounded-xl relative">
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#003f5c]" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#003f5c]" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#003f5c]" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#003f5c]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-blue-900 text-sm font-medium mb-1">
                      Positionnez le QR code dans le cadre
                    </p>
                    <p className="text-blue-700 text-xs">
                      Le scan se fera automatiquement
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#003f5c]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
                  Rechercher une commande
                </h3>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code de commande
                    </label>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => {
                        setManualCode(e.target.value.toUpperCase())
                        setError('')
                      }}
                      placeholder="Ex: CRE-2025-00001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-base font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#003f5c] focus:border-transparent"
                      autoFocus
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#003f5c] text-white rounded-lg font-medium active:bg-[#2f6690] transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Rechercher
                  </button>
                </form>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-gray-600 text-xs text-center">
                  Le code se trouve sur le ticket de commande du client
                </p>
              </div>
            </>
          )}
        </div>
      </MobileAdminLayout>
    )
  }

  // Desktop version
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scanner QR</h1>
              <p className="text-sm text-gray-600 mt-1">Scanner les codes de commande</p>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera Scanner */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#003f5c]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Scanner caméra</h2>
                <p className="text-sm text-gray-600">Utilisez votre webcam</p>
              </div>
            </div>

            {cameraError ? (
              <div className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                <Camera className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-gray-600 text-sm">
                  Caméra non disponible. Veuillez vérifier les permissions ou utiliser la saisie manuelle.
                </p>
              </div>
            ) : (
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                <QrReader
                  onResult={handleScan}
                  constraints={{
                    facingMode: 'user',
                    aspectRatio: 1
                  }}
                  videoId="video-desktop"
                  scanDelay={300}
                  className="w-full h-full"
                />

                {/* Scanning Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#003f5c]" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#003f5c]" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#003f5c]" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#003f5c]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-600 text-center">
              Positionnez le QR code devant la caméra
            </p>
          </div>

          {/* Manual Entry */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Saisie manuelle</h2>
                <p className="text-sm text-gray-600">Entrez le code de commande</p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de commande
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value.toUpperCase())
                    setError('')
                  }}
                  placeholder="Ex: ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#003f5c] focus:border-transparent"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Rechercher la commande
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                Le code de commande se trouve sur le ticket du client. Il est composé de 6 caractères alphanumériques.
              </p>
            </div>
          </div>
        </div>
        </main>
      </div>
    </AdminLayout>
  )
}
