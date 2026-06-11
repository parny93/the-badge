// ─── Pro (stub) ───────────────────────────────────────────────────────────────
// Gating surface only — payments are intentionally NOT wired. When Stripe
// lands, startProCheckout() should POST to /api/checkout, create a Checkout
// Session and redirect; the success webhook flips the entitlement server-side.

export const PRO_FEATURES = [
  'Hard Mode (free while in beta)',
  'Full Daily Challenge history (free tier keeps the last 7 days)',
  'Share cards without thebadge.app branding',
] as const

const STORAGE_KEY = 'thebadge.pro.v1'

export function isPro(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export async function startProCheckout(): Promise<void> {
  // TODO(stripe): create Checkout Session via /api/checkout and redirect.
  // Stubbed by design — do not wire payments yet.
  alert('Pro is coming soon. Stripe checkout is not wired up yet — everything stays free for now.')
}
