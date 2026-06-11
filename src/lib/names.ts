// ─── Display surnames ─────────────────────────────────────────────────────────
// "Graeme Le Saux".split(' ').pop() gives "Saux" — particled surnames must
// keep their particle (Le Saux, Le Tissier, Van den Berg…).

const PARTICLES = new Set(['le', 'la', 'de', 'di', 'da', 'del', 'der', 'den', 'van', 'von', 'st', 'st.', 'mc', 'mac', 'o'])

export function displaySurname(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  let start = parts.length - 1
  // Walk backwards while the preceding token is a surname particle
  while (start > 1 && PARTICLES.has(parts[start - 1].toLowerCase())) start--
  return parts.slice(start).join(' ')
}
