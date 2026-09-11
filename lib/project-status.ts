/**
 * Some projects are real, are being worked on, and are not ready to be read.
 *
 * A slug listed here gets a short holding page at /work/<slug> instead of the
 * full case study, and a badge on its card in /work. The case study copy can
 * stay written and seeded in the meantime; this only decides what a visitor
 * is shown today, so publishing it later is deleting one line here.
 *
 * The shape mirrors lib/project-palette.ts and lib/project-cta.ts: a small map,
 * a lookup that falls back quietly, and the entry added in the same commit as
 * the decision.
 */

export type ProjectStatus = {
    /** Sits in the status pill. Two or three words. */
    label: string
    /** One or two sentences on the holding page. Say what it is and why it waits. */
    note: string
    /** The line under "what is left", if there is something honest to say. */
    outstanding?: string[]
}

const COMING_SOON: Record<string, ProjectStatus> = {
    'raj-associates': {
        label: 'In build',
        note:
            'A website for a litigation practice in Bengaluru, designed for one frightened person on a mid-range phone, inside a professional-conduct rule that forbids nearly every claim a law firm site usually makes.',
        outstanding: [
            'The firm’s own photographs',
            'A final display typeface, four are with the client',
            'The domain, still settling',
        ],
    },
}

export function statusFor(slug: string): ProjectStatus | null {
    return COMING_SOON[slug] ?? null
}

export function isComingSoon(slug: string): boolean {
    return slug in COMING_SOON
}
