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
            <div className="h-8 mb-4">
              <img
                src="/Logo-Scouts-Ecaussinnes-Couleurs.png"
                alt="Scouts Écaussinnes"
                className="h-full w-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Unité Scoute d'Écaussinnes
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              2ème Unité Brunehaut - Unité Jean Nibelle
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <a
                href="mailto:contact@scouts-ecaussinnes.be"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#003f5c] transition-colors"
              >
                <Mail className="w-4 h-4" />
                contact@scouts-ecaussinnes.be
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
                className="block text-sm text-gray-600 hover:text-[#003f5c] transition-colors"
              >
                Événements
              </Link>
              <Link
                href="/privacy"
                className="block text-sm text-gray-600 hover:text-[#003f5c] transition-colors"
              >
                Politique de confidentialité
              </Link>
              <a
                href="https://lesscouts.be"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#003f5c] transition-colors"
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
            © {new Date().getFullYear()} Scouts Écaussinnes - BR002 - 2e Unité Brunehault. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
