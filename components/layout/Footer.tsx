'use client'

import Link from 'next/link'
import { Mail, MapPin, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Pionniers Écaussinnes</h3>
                <p className="text-xs text-gray-500">15e Unité Scouts</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Plateforme de ventes et événements pour soutenir les activités de notre unité scoute.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <a
                href="mailto:contact@pionniers-ecaussinnes.be"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                contact@pionniers-ecaussinnes.be
              </a>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Écaussinnes, Belgique</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Liens utiles</h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Événements
              </Link>
              <Link
                href="/privacy"
                className="block text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Politique de confidentialité
              </Link>
              <a
                href="https://lesscouts.be"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-amber-600 transition-colors"
              >
                Les Scouts
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Pionniers Écaussinnes - 15e Unité Scouts. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
