/**
 * Some case studies open on a film rather than a still.
 *
 * The hero normally shows `coverUrl`. A slug listed here plays its product reel
 * in that frame instead: muted, looping, inline, with the poster standing in
 * until the first frame decodes and for anyone who prefers reduced motion. The
 * reels are rendered by Remotion (see remotion/Root.tsx) straight into
 * public/projects/<slug>/, so they ship with the site and need no CSP change.
 *
 * Same shape as lib/project-cta.ts and lib/project-palette.ts: a small map and
 * a lookup that quietly returns nothing.
 */

export type ProjectVideo = {
  src: string
  /** Shown before playback and under reduced motion. */
  poster: string
  /** Read by screen readers in place of the film. */
  label: string
}

const VIDEOS: Record<string, ProjectVideo> = {
  'mission-control': {
    src: '/projects/mission-control/reel.mp4',
    poster: '/projects/mission-control/reel-poster.jpg',
    label: 'Product film: building a drone mission from blocks, checking it, and flying it in simulation through a battery failure',
  },
  kharchaaaa: {
    src: '/projects/kharchaaaa/intro.mp4',
    poster: '/projects/kharchaaaa/intro-poster.jpg',
    label: 'Product film: the Kharchaaaa expense book, screen by screen',
  },
}

export function videoFor(slug: string): ProjectVideo | null {
  return VIDEOS[slug] ?? null
}
