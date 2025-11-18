'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, X, Download, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Product {
  name: string
  description: string
  price_cents: number
  product_type: string
  stock: number | null
  is_active: boolean
  sort_order: number
  allergens: string[]
  is_vegetarian: boolean
  is_vegan: boolean
}

interface PreviewResult {
  preview: boolean
  totalRows: number
  validProducts: number
  invalidProducts: number
  errors: string[]
  warnings: string[]
  products: Product[]
}

interface ProductImportModalProps {
  eventId: string
  onClose: () => void
  onImportSuccess: () => void
}

export default function ProductImportModal({
  eventId,
  onClose,
  onImportSuccess,
}: ProductImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse CSV file (supports both semicolon and comma separators)
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    // Detect separator: use semicolon if found in header, otherwise comma
    const separator = lines[0].includes(';') ? ';' : ','

    const headers = lines[0].split(separator).map(h => h.trim())
    const rows = lines.slice(1).map(line => {
      const values = line.split(separator).map(v => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })

    return rows
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Veuillez sélectionner un fichier CSV')
      return
    }

    setFile(selectedFile)
    setPreview(null)

    // Parse and preview
    setLoading(true)
    try {
      const text = await selectedFile.text()
      const products = parseCSV(text)

      // Call API in preview mode
      const response = await fetch(`/api/admin/events/${eventId}/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, preview: true }),
      })

      const result = await response.json()

      if (response.ok) {
        setPreview(result)
      } else {
        alert(result.error || 'Erreur lors de la validation')
      }
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Erreur lors de la lecture du fichier')
    } finally {
      setLoading(false)
    }
  }

  // Handle import confirmation
  const handleImport = async () => {
    if (!file || !preview) return

    setImporting(true)
    try {
      const text = await file.text()
      const products = parseCSV(text)

      const response = await fetch(`/api/admin/events/${eventId}/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, preview: false }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.imported} produit(s) importé(s) avec succès !`)
        onImportSuccess()
        onClose()
      } else {
        alert(result.error || 'Erreur lors de l\'import')
      }
    } catch (error) {
      console.error('Error importing products:', error)
      alert('Erreur lors de l\'import')
    } finally {
      setImporting(false)
    }
  }

  // Download template CSV with essential columns only (using semicolons for Excel)
  const downloadTemplate = () => {
    const template = `Nom du produit;Description;Prix (en centimes);Type
Crémant d'Alsace Brut;Vin pétillant de qualité AOC Alsace;1400;ITEM
Menu Dégustation;Menu complet avec 3 services et boissons;2500;MENU
Bouteille Rosé;Crémant Rosé fruité et rafraîchissant;1600;ITEM
Ticket Tombola;Ticket pour participer au tirage au sort;500;TICKET`

    // Add UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'template_import_produits.csv'
    link.click()
  }

  // Open Google Sheets template with pre-filled data
  const openGoogleSheets = () => {
    // Create URL with pre-filled data using Google Sheets new sheet URL format
    const headers = ['Nom du produit', 'Description', 'Prix (en centimes)', 'Type']
    const rows = [
      ['Crémant d\'Alsace Brut', 'Vin pétillant de qualité AOC Alsace', '1400', 'ITEM'],
      ['Menu Dégustation', 'Menu complet avec 3 services et boissons', '2500', 'MENU'],
      ['Bouteille Rosé', 'Crémant Rosé fruité et rafraîchissant', '1600', 'ITEM'],
      ['Ticket Tombola', 'Ticket pour participer au tirage au sort', '500', 'TICKET']
    ]

    // Encode the data for URL
    const data = [headers, ...rows]
    const encoded = encodeURIComponent(JSON.stringify(data))

    // Open a new Google Sheet
    // Note: Google Sheets doesn't support pre-filling via URL, so we open a blank one
    // Users will need to copy-paste the template or we could provide instructions
    window.open('https://docs.google.com/spreadsheets/create', '_blank')

    // Copy template to clipboard for easy pasting
    const templateText = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')
    navigator.clipboard.writeText(templateText).then(() => {
      // Optionally show a toast notification
      console.log('Template copied to clipboard - paste it in the new Google Sheet')
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import CSV des produits</h2>
            <p className="text-sm text-gray-600 mt-1">
              Importez plusieurs produits en une seule fois depuis un fichier CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Fichier template
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Téléchargez le template CSV ou utilisez Google Sheets pour préparer vos données.
                  4 colonnes : Nom du produit, Description, Prix (en centimes), Type (ITEM/MENU/TICKET).
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={downloadTemplate}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger CSV
                  </Button>
                  <Button
                    type="button"
                    onClick={openGoogleSheets}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2 bg-white hover:bg-gray-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir Google Sheets
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Astuce : Le bouton Google Sheets copie automatiquement le template dans votre presse-papiers. Collez-le ensuite dans la feuille (Ctrl+V). Puis exportez en CSV avec des points-virgules (Fichier → Télécharger → Valeurs séparées par une virgule).
                </p>
              </div>
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier CSV
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Cliquez pour sélectionner un autre fichier
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cliquez pour sélectionner un fichier CSV
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ou glissez-déposez le fichier ici
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Analyse du fichier en cours...</p>
            </div>
          )}

          {/* Preview */}
          {preview && !loading && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {preview.totalRows}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Lignes totales</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">
                    {preview.validProducts}
                  </div>
                  <div className="text-xs text-green-700 mt-1">Produits valides</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-2xl font-bold text-red-700">
                    {preview.invalidProducts}
                  </div>
                  <div className="text-xs text-red-700 mt-1">Produits invalides</div>
                </div>
              </div>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">
                        Erreurs ({preview.errors.length})
                      </h3>
                      <ul className="text-sm text-red-700 space-y-1 max-h-48 overflow-y-auto">
                        {preview.errors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {preview.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        Avertissements ({preview.warnings.length})
                      </h3>
                      <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                        {preview.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Valid products preview */}
              {preview.validProducts > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-3">
                        Produits à importer ({preview.validProducts})
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {preview.products.map((product, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 border border-green-200 text-sm"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {product.description}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span className="font-medium text-amber-600">
                                    {(product.price_cents / 100).toFixed(2)} €
                                  </span>
                                  <span className="px-2 py-0.5 bg-gray-100 rounded">
                                    {product.product_type}
                                  </span>
                                  {product.allergens.length > 0 && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                      {product.allergens.length} allergène(s)
                                    </span>
                                  )}
                                  {product.is_vegan && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                      Vegan
                                    </span>
                                  )}
                                  {product.is_vegetarian && !product.is_vegan && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                      Végétarien
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={importing}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!preview || preview.validProducts === 0 || preview.errors.length > 0 || importing}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {importing ? 'Import en cours...' : `Importer ${preview?.validProducts || 0} produit(s)`}
          </Button>
        </div>
      </div>
    </div>
  )
}
