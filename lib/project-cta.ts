/**
 * Some projects are not a link to a live site.
 *
 * The case study's closing section normally offers `externalUrl` as "Visit
 * <host>", and falls back to "Not publicly live" when there is nothing to
 * visit. Neither is right for a product that exists, works, and simply is not
 * open yet: "Not publicly live" reads as abandoned, and a plain link would
 * drop a visitor on a lock screen they cannot get past.
 *
 * So a slug can override the closing call to action with an internal one. The
 * shape deliberately mirrors lib/project-palette.ts: a small map, a lookup
 * that falls back quietly, and a note to add the entry in the same commit that
 * seeds the project.
 */

export type ProjectCta = {
    /** Internal route. External links keep using `externalUrl`. */
    href: string
    /** The line on the button. Say what happens next, not where it goes. */
    label: string
    /** Sits above the button, in the mono micro-label. */
    note?: string
}

const CTAS: Record<string, ProjectCta> = {
    kharchaaaa: {
        href: '/waitlist',
        label: 'Invite only, tap to join the waitlist',
        note: 'Not open yet',
    },
}

export function ctaFor(slug: string): ProjectCta | null {
    return CTAS[slug] ?? null
}
