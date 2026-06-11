import { ImageResponse } from 'next/og'
import { decodeRun, playersFromIds, resultLine, tweetLine, eraSpread } from '@/lib/runCodec'
import { FORMATIONS } from '@/lib/teamStrength'
import { displaySurname } from '@/lib/names'
import { getManager } from '@/data/managers'

export const dynamic = 'force-dynamic'

const GOLD = '#fbbf24'
const BG = '#0c1420'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params
  const run = decodeRun(runId)
  if (!run) return new Response('Run not found', { status: 404 })

  const squad = playersFromIds(run.xi)
  const slots = FORMATIONS[run.formation] ?? FORMATIONS['4-3-3']
  const manager = run.manager ? getManager(run.manager) : undefined
  const won = run.exit === 'Winner'
  const outOnPens = run.lostPens > 0 && !won
  const pensSting = outOnPens ? 'OUT ON PENS' : run.wonPens > 0 ? 'WON ON PENS' : null
  const pensColour = outOnPens
    ? { background: 'rgba(239,68,68,0.25)', border: '2px solid rgba(239,68,68,0.6)' }
    : { background: 'rgba(16,185,129,0.2)', border: '2px solid rgba(16,185,129,0.6)' }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: BG,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* ── Left: formation pitch ── */}
        <div
          style={{
            width: 480,
            height: 630,
            display: 'flex',
            position: 'relative',
            background: 'linear-gradient(to bottom, #1c7238, #165e2f)',
            borderRight: '4px solid rgba(255,255,255,0.15)',
          }}
        >
          {/* halfway line + centre circle */}
          <div style={{ position: 'absolute', left: 0, top: 313, width: 480, height: 2, background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ position: 'absolute', left: 190, top: 264, width: 100, height: 100, border: '2px solid rgba(255,255,255,0.35)', borderRadius: 100 }} />
          {/* penalty boxes */}
          <div style={{ position: 'absolute', left: 110, top: 0, width: 260, height: 90, border: '2px solid rgba(255,255,255,0.35)', borderTop: 'none' }} />
          <div style={{ position: 'absolute', left: 110, top: 540, width: 260, height: 90, border: '2px solid rgba(255,255,255,0.35)', borderBottom: 'none' }} />

          {slots.map((slot, i) => {
            const p = squad[i]
            const isCaptain = !!p && run.captain === p.id
            return (
              <div
                key={String(i)}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  left: (slot.x / 100) * 480 - 52,
                  top: ((100 - slot.y) / 100) * 590 - 26,
                  width: 104,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 44,
                    height: 44,
                    borderRadius: 44,
                    background: isCaptain ? GOLD : 'white',
                    color: '#0f172a',
                    fontSize: 15,
                    fontWeight: 700,
                    border: '3px solid rgba(255,255,255,0.5)',
                  }}
                >
                  {p ? (p.peakRating) : slot.label}
                </div>
                <div
                  style={{
                    display: 'flex',
                    marginTop: 2,
                    padding: '2px 6px',
                    background: 'rgba(0,0,0,0.6)',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {p ? `${isCaptain ? '© ' : ''}${displaySurname(p.name)}` : '—'}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Right: result panel ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '44px 48px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', fontSize: 26 }}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, letterSpacing: 4, color: GOLD }}>THE BADGE</div>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 36,
              fontSize: won ? 52 : 44,
              fontWeight: 900,
              lineHeight: 1.1,
              color: won ? GOLD : 'white',
            }}
          >
            {resultLine(run)}
          </div>

          <div style={{ display: 'flex', marginTop: 14, fontSize: 28, fontStyle: 'italic', color: '#cbd5e1' }}>
            {`“${tweetLine(run)}”`}
          </div>

          {/* badges row */}
          <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
            {pensSting && (
              <div style={{ display: 'flex', padding: '8px 16px', borderRadius: 10, ...pensColour, fontSize: 22, fontWeight: 800 }}>
                {pensSting}
              </div>
            )}
            {run.hard && (
              <div style={{ display: 'flex', padding: '8px 16px', borderRadius: 10, background: 'rgba(251,191,36,0.2)', border: `2px solid ${GOLD}`, fontSize: 22, fontWeight: 800, color: GOLD }}>
                HARD MODE
              </div>
            )}
            {run.daily && (
              <div style={{ display: 'flex', padding: '8px 16px', borderRadius: 10, background: 'rgba(56,189,248,0.15)', border: '2px solid rgba(56,189,248,0.5)', fontSize: 22, fontWeight: 800, color: '#7dd3fc' }}>
                {`DAILY ${run.daily}`}
              </div>
            )}
          </div>

          {/* stat grid */}
          <div style={{ display: 'flex', gap: 14, marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8', textTransform: 'uppercase' }}>Chemistry</div>
              <div style={{ display: 'flex', fontSize: 38, fontWeight: 900, color: GOLD }}>{String(run.chem)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8', textTransform: 'uppercase' }}>Overall</div>
              <div style={{ display: 'flex', fontSize: 38, fontWeight: 900 }}>{String(run.ovr)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8', textTransform: 'uppercase' }}>Era spread</div>
              <div style={{ display: 'flex', fontSize: 38, fontWeight: 900 }}>{eraSpread(squad)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: 20, color: '#94a3b8' }}>
              {manager ? `Manager: ${manager.name} · ${run.formation}` : `Formation: ${run.formation}`}
            </div>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 700, color: GOLD }}>thebadge.app</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
