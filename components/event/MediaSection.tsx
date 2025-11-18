import { Play } from 'lucide-react'
import type { MediaSection as MediaSectionType } from '@/types/event'

interface MediaSectionProps {
  data: MediaSectionType
  sectionColor?: string
}

export default function MediaSection({ data, sectionColor = '#F59E0B' }: MediaSectionProps) {
  if (!data) return null

  const hasGallery = data.type === 'gallery' || data.type === 'both'
  const hasVideo = data.type === 'video' || data.type === 'both'

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      {data.title && (
        <div className="text-center mb-12">
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{
              backgroundColor: sectionColor + '15',
              color: sectionColor,
            }}
          >
            Vidéo
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            {data.title}
          </h2>
        </div>
      )}

      <div className="space-y-8">
        {/* Video */}
        {hasVideo && data.video_url && (
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              boxShadow: `0 20px 60px ${sectionColor}25`,
            }}
          >
            {data.video_url.includes('youtube.com') || data.video_url.includes('youtu.be') ? (
              <div className="relative pb-[56.25%] bg-gray-900">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={data.video_url.replace('watch?v=', 'embed/')}
                  title="Vidéo de présentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative group cursor-pointer">
                <img
                  src={data.video_thumbnail || '/placeholder-video.jpg'}
                  alt="Aperçu vidéo"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: sectionColor }}
                  >
                    <Play className="w-12 h-12 text-white ml-2" fill="currentColor" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery */}
        {hasGallery && data.gallery_images && data.gallery_images.length > 0 && (
          <div
            className={`grid gap-4 ${
              data.gallery_images.length === 1
                ? 'grid-cols-1'
                : data.gallery_images.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-2 md:grid-cols-3'
            }`}
          >
            {data.gallery_images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow aspect-video bg-gray-100"
              >
                <img
                  src={imageUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
