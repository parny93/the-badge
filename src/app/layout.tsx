import type { Metadata } from 'next'
import { PLAYER_COUNT, WC_COUNT, EURO_COUNT } from '@/lib/stats'
import './globals.css'

const DESCRIPTION = `Pick your greatest squad from ${PLAYER_COUNT} England legends, face real opponents across ${WC_COUNT} World Cups and ${EURO_COUNT} Euros, and find out if you can finally bring it home.`

export const metadata: Metadata = {
  metadataBase: new URL('https://thebadge.app'),
  title: 'The Badge — Build Your Golden Generation',
  description: DESCRIPTION,
  openGraph: {
    title: 'The Badge — Build Your Golden Generation',
    description: DESCRIPTION,
    type: 'website',
    url: 'https://thebadge.app',
    siteName: 'The Badge',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'The Badge — Build Your Golden Generation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Badge — Build Your Golden Generation',
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" style={{ background: '#0c1420' }}>
      <body className="min-h-full" style={{ background: '#0c1420' }}>{children}</body>
    </html>
  )
}
