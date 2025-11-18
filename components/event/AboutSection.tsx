'use client'

import { ExternalLink } from 'lucide-react'
import type { AboutSection as AboutSectionType } from '@/types/event'
import Button from '@/components/ui/Button'

interface AboutSectionProps {
  data: AboutSectionType
  sectionColor?: string
}

export default function AboutSection({ data, sectionColor = '#F59E0B' }: AboutSectionProps) {
  if (!data || !data.enabled) return null

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${sectionColor}40 0%, transparent 50%, ${sectionColor}20 100%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 60/40 Layout: Content 60% + Image/Video 40% */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Content - 60% (3/5 columns) */}
          <div className={`${data.image_url ? 'lg:col-span-3' : 'lg:col-span-5 text-center max-w-4xl mx-auto'}`}>
            {/* Section Label */}
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
              style={{
                backgroundColor: sectionColor + '15',
                color: sectionColor,
              }}
            >
              À propos
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              {data.title}
            </h2>

            <div className="space-y-6 text-base md:text-lg text-gray-700 leading-relaxed">
              {data.content.split('\n\n').map((paragraph, index) => {
                // Handle markdown bold (**text**)
                const parts = paragraph.split(/(\*\*.*?\*\*)/)
                return (
                  <p key={index} className="mb-5">
                    {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={i} className="font-bold text-gray-900">
                            {part.slice(2, -2)}
                          </strong>
                        )
                      }
                      return <span key={i}>{part}</span>
                    })}
                  </p>
                )
              })}
            </div>

            {data.link && (
              <div className="mt-10">
                <button
                  onClick={() => window.open(data.link!.url, '_blank')}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: sectionColor,
                    boxShadow: `0 10px 40px ${sectionColor}30`,
                  }}
                >
                  {data.link.label}
                  <ExternalLink className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Image/Video - 40% (2/5 columns) */}
          {data.image_url && (
            <div className="lg:col-span-2">
              <div
                className="relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105"
                style={{
                  boxShadow: `0 20px 60px ${sectionColor}20`,
                }}
              >
                <img
                  src={data.image_url}
                  alt={data.title}
                  className="w-full h-auto object-cover"
                />
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, ${sectionColor}20 100%)`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
