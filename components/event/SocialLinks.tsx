import { Facebook, Instagram, Twitter, ExternalLink } from 'lucide-react'
import type { SocialLinks as SocialLinksType } from '@/types/event'

interface SocialLinksProps {
  data: SocialLinksType
  sectionColor?: string
}

export default function SocialLinks({ data, sectionColor = '#F59E0B' }: SocialLinksProps) {
  if (!data) return null

  const hasAnyLink =
    data.facebook_event ||
    data.instagram ||
    data.twitter ||
    (data.custom_links && data.custom_links.length > 0)

  if (!hasAnyLink) return null

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Suivez l'événement
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Facebook */}
          {data.facebook_event && (
            <a
              href={data.facebook_event}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Événement Facebook</span>
            </a>
          )}

          {/* Instagram */}
          {data.instagram && (
            <a
              href={`https://instagram.com/${data.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <Instagram className="w-5 h-5 text-pink-600" />
              <span className="font-medium text-gray-900">{data.instagram}</span>
            </a>
          )}

          {/* Twitter */}
          {data.twitter && (
            <a
              href={`https://twitter.com/${data.twitter.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-900">{data.twitter}</span>
            </a>
          )}

          {/* Custom Links */}
          {data.custom_links &&
            data.custom_links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                {link.icon ? (
                  <span className="text-xl">{link.icon}</span>
                ) : (
                  <ExternalLink className="w-5 h-5" style={{ color: sectionColor }} />
                )}
                <span className="font-medium text-gray-900">{link.label}</span>
              </a>
            ))}
        </div>
      </div>
    </section>
  )
}
