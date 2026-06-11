// ─── Seedable random source ───────────────────────────────────────────────────
// All gameplay randomness (wheel draws, match sims) flows through rand() so the
// Daily Challenge can swap in a deterministic generator — same seed, same
// spins, same opponent bounces for every player on Earth that day.

let source: () => number = Math.random

export function rand(): number {
  return source()
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// FNV-1a — turns a date key like "2026-06-11" into a stable 32-bit seed.
export function hashSeed(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function seedRng(seed: number): void {
  source = mulberry32(seed)
}

export function resetRng(): void {
  source = Math.random
}
