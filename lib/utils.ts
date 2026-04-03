/**
 * Shared utility functions used across server actions and lib/data modules.
 */

// ─── SLUG ─────────────────────────────────────────────────────
/** Convert a plain string to a URL-safe slug. */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── READING TIME ─────────────────────────────────────────────
/** Estimate reading time (minutes) from HTML content. */
export function readingTime(html: string, wpm = 200): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const words = text ? text.split(' ').length : 0
  return Math.max(1, Math.ceil(words / wpm))
}

// ─── CLASS MERGE ──────────────────────────────────────────────
/** Lightweight className merge (no Tailwind merge, just space-join truthy values). */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
