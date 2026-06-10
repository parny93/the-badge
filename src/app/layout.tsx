import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://thebadge.app'),
  title: 'The Badge — Build Your Golden Generation',
  description: 'Pick your greatest squad from 102 legends, face real World Cup opponents, and find out if you can finally bring it home.',
  openGraph: {
    title: 'The Badge',
    description: 'Pick your greatest squad from 102 legends across 16 World Cups. Can you finally bring it home?',
    type: 'website',
    images: [{ url: '/logo.png', width: 1254, height: 1254 }],
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
