/**
 * Each case study is coloured by the project it describes.
 *
 * The values are the same two that scripts/build-recipes.ts uses to composite
 * that project's thumbnail: `field` is the deep background the screens sit on,
 * `accent` is the signal colour pulled out of the product itself. Reusing them
 * here means the case study page, the /work card and the share image all agree
 * on what a project looks like, and a project only ever gets recoloured in one
 * place.
 *
 * Lineup's pair lives in scripts/seed-lineup.ts (obsidian + ember) rather than
 * in build-recipes.ts, which is why it is repeated rather than imported: those
 * scripts pull in sharp and the database driver, neither of which belongs in a
 * client bundle. HR OS is the same arrangement, in scripts/seed-hr-os.ts.
 *
 * A slug missing from this map does not fail loudly, it quietly falls back to
 * the site's own neon accent, which reads as a page that was never coloured.
 * Add the pair here in the same commit that seeds the project.
 */

export type ProjectPalette = {
  /** Deep background field the hero sits on. */
  field: string
  /** Signal colour: section numbers, rules, the live-site button. */
  accent: string
}

/** Falls back to the site accent on a near-black field. */
export const DEFAULT_PALETTE: ProjectPalette = {
  field: '#0B0B0B',
  accent: 'var(--accent, #00FF94)',
}

const PALETTES: Record<string, ProjectPalette> = {
  'lineup': { field: '#0B0B0B', accent: '#E84A1F' },
  // HR OS flipped from a dark theme to the Crextio language on 5 Sep 2026:
  // cream plane, white cards, gold accent. `night` and `accent` are both real
  // tokens from apps/web/app/globals.css in that repo. The old pair here was
  // #161617 + #03c37b, which described a product that no longer exists.
  'hr-os': { field: '#1c1c1e', accent: '#f5c518' },
  // Borrowed wholesale from this site, because it is the same house.
  'kharchaaaa': { field: '#060606', accent: '#00FF94' },
  // Sampled from the firm's own office photographs, not a palette tool: the
  // warm near-black they paint with, and the brass used only for hairlines.
  'raj-associates': { field: '#14120F', accent: '#A8894F' },
  'evolusis-landing-page': { field: '#0A2327', accent: '#5EC8C8' },
  'evo-dashboard-evo-by-evolusis': { field: '#0A2327', accent: '#4FB6C4' },
  'evo-chat-ai-coaching-chatbot': { field: '#0B2129', accent: '#57C2B4' },
  'mission-control': { field: '#0B1418', accent: '#3E9BC4' },
  'awr': { field: '#150E08', accent: '#C8862A' },
  'cloudqa': { field: '#0C1822', accent: '#3B82F6' },
  'orange': { field: '#180E06', accent: '#F97316' },
}

export function paletteFor(slug: string): ProjectPalette {
  return PALETTES[slug] ?? DEFAULT_PALETTE
}
