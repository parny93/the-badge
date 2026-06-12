import { ImageResponse } from 'next/og'
import { PLAYER_COUNT, WC_COUNT, EURO_COUNT } from '@/lib/stats'

export const dynamic = 'force-static'

const GOLD = '#fbbf24'
const BG = '#0c1420'

// The graphic that unfurls when a link to the game itself is shared — a bold
// 1200×630 hero so a posted thebadge.app link looks the part on X / socials.
export async function GET() {
  const stats = [
    { n: String(PLAYER_COUNT), label: 'England legends' },
    { n: String(WC_COUNT), label: 'World Cups' },
    { n: String(EURO_COUNT), label: 'Euros' },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 50% 18%, #16335a 0%, ${BG} 62%)`,
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Faint pitch markings — centre circle + halfway line */}
        <div style={{ position: 'absolute', left: 0, top: 315, width: 1200, height: 2, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: 480, top: 195, width: 240, height: 240, border: '2px solid rgba(255,255,255,0.06)', borderRadius: 240 }} />

        {/* Flag + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 64 }}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 900, letterSpacing: 8, color: GOLD }}>
            THE BADGE
          </div>
        </div>

        {/* Tagline */}
        <div style={{ display: 'flex', marginTop: 18, fontSize: 40, fontWeight: 800, color: 'white' }}>
          Build Your Golden Generation
        </div>
        <div style={{ display: 'flex', marginTop: 14, fontSize: 27, color: '#cbd5e1', maxWidth: 880, textAlign: 'center' }}>
          Draft England&rsquo;s greatest XI from any era, face real opponents, and finally bring it home.
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: 20, marginTop: 44 }}>
          {stats.map(s => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '18px 30px',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', fontSize: 46, fontWeight: 900, color: GOLD }}>{s.n}</div>
              <div style={{ display: 'flex', fontSize: 19, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer URL */}
        <div style={{ display: 'flex', position: 'absolute', bottom: 36, fontSize: 26, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>
          thebadge.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
