import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { decodeRun, playersFromIds, resultLine, tweetLine, eraSpread } from '@/lib/runCodec'
import { getManager } from '@/data/managers'
import FormationDisplay from '@/components/ui/FormationDisplay'

interface Props {
  params: Promise<{ runId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { runId } = await params
  const run = decodeRun(runId)
  if (!run) return { title: 'The Badge' }

  const title = `${resultLine(run)} — The Badge`
  const description = `${tweetLine(run)} Chemistry ${run.chem}, era spread ${eraSpread(playersFromIds(run.xi))}. Build your own England XI and see how far it goes.`
  const image = `/api/og/result/${runId}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function RunPage({ params }: Props) {
  const { runId } = await params
  const run = decodeRun(runId)
  if (!run) notFound()

  const squad = playersFromIds(run.xi)
  const manager = run.manager ? getManager(run.manager) : undefined
  const captain = run.captain ? squad.find(p => p?.id === run.captain) : undefined
  const won = run.exit === 'Winner'
  const outOnPens = run.lostPens > 0 && !won
  const pensSting = outOnPens ? 'Out on pens' : run.wonPens > 0 ? 'Won on pens' : null

  return (
    <main className="max-w-md mx-auto min-h-screen bg-[#0c1420] text-white px-4 py-8">
      <div className="text-center mb-6">
        <div className="text-amber-400 text-xs font-semibold tracking-[0.25em] uppercase mb-2">
          🏴󠁧󠁢󠁥󠁮󠁧󠁿 The Badge — shared result
        </div>
        <h1 className={`text-3xl font-black leading-tight ${won ? 'text-amber-400' : 'text-white'}`}>
          {resultLine(run)}
        </h1>
        <p className="text-slate-300 italic mt-2">&ldquo;{tweetLine(run)}&rdquo;</p>

        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {pensSting && (
            <span className={`text-xs font-bold rounded-full px-3 py-1 border ${
              outOnPens
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}>
              🎯 {pensSting}
            </span>
          )}
          {run.hard && (
            <span className="text-xs font-bold bg-amber-400/15 border border-amber-400/40 text-amber-300 rounded-full px-3 py-1">
              🔥 Hard Mode
            </span>
          )}
          {run.daily && (
            <span className="text-xs font-bold bg-sky-400/15 border border-sky-400/40 text-sky-300 rounded-full px-3 py-1">
              📅 Daily {run.daily}
            </span>
          )}
          <span className="text-xs font-bold bg-white/10 rounded-full px-3 py-1 text-slate-300">
            CHEM {run.chem}
          </span>
          <span className="text-xs font-bold bg-white/10 rounded-full px-3 py-1 text-slate-300">
            OVR {run.ovr}
          </span>
          <span className="text-xs font-bold bg-white/10 rounded-full px-3 py-1 text-slate-300">
            Eras {eraSpread(squad)}
          </span>
        </div>

        {(manager || captain) && (
          <p className="text-slate-400 text-sm mt-3">
            {manager ? `Manager: ${manager.name}` : ''}
            {manager && captain ? ' · ' : ''}
            {captain ? `Captain: ${captain.name}` : ''}
          </p>
        )}
      </div>

      <FormationDisplay squad={squad} formation={run.formation} captainId={run.captain} />

      <div className="mt-8 flex flex-col gap-2">
        <Link
          href="/"
          className="w-full bg-amber-400 text-slate-900 font-black text-lg py-4 rounded-2xl text-center active:scale-95 transition-all shadow-[0_0_32px_rgba(201,168,76,0.4)]"
        >
          Think you can do better? Play →
        </Link>
        <p className="text-slate-500 text-xs text-center mt-2">
          Build your greatest England squad. Face real tournament opponents. Try to bring it home.
        </p>
      </div>
    </main>
  )
}
