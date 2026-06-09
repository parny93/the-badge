import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Badge — Build Your Golden Generation',
  description: 'Pick your all-time England XI and take them to the World Cup. 16 tournaments, 1966–2026.',
  openGraph: {
    title: 'The Badge',
    description: 'Build your England Golden Generation and take on the World Cup.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" style={{ background: '#0f172a' }}>
      <body className="min-h-full bg-slate-900">{children}</body>
    </html>
  )
}
