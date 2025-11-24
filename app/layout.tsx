import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/contexts/ToastContext'
import ToastContainer from '@/components/ToastContainer'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Scouts Écaussinnes - Soupers et Ventes spéciales',
  description: 'Plateforme centralisée pour les réservations de soupers et les commandes des ventes spéciales des difféntes sections de l&#39;unité scoute d& #39;Écaussinnes.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body className="min-h-screen bg-white antialiased flex flex-col font-sans">
        <ToastProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  )
}
