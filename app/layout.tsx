import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ToastContainer'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Pionniers Écaussinnes - Ventes & Événements',
  description: 'Plateforme de ventes et événements pour soutenir les activités de la 15e Unité Scouts - Pionniers d\'Écaussinnes',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white antialiased flex flex-col">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  )
}
