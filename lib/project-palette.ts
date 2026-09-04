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
 * client bundle.
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
