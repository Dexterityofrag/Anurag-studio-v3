'use server'

/**
 * Kharchaaaa waitlist.
 *
 * Posts one row into a Google Sheet through an Apps Script web app. The script
 * lives in `maintenance/kharchaaaa-waitlist.gs` and is deployed on Anurag's own
 * account, so the list is his, not a third party's.
 *
 * This is the same shape as the Raj Associates receiver, which has been live
 * and tested end to end since 12 Sep 2026, and it carries the two lessons that
 * one cost the most to learn:
 *
 *   The reply is read, not assumed. An earlier version of that form used
 *   `mode: 'no-cors'`, which returns an opaque response and forces the caller
 *   to assume it worked. A form that says "you're on the list" when the row
 *   never landed is worse than one that admits it is down, so this waits for
 *   the script's JSON and only reports success on `status: 200`.
 *
 *   Values that begin with = + - or @ are prefixed with an apostrophe, Sheets'
 *   own text marker, which is stripped on the way in. Without it a Telegram
 *   handle typed as @someone arrives as #ERROR!, and a phone number typed as
 *   +919876543210 arrives silently as the number 919876543210 with the +
 *   dropped, which is worse because nothing looks wrong. The Apps Script
 *   guards too; this is the belt to its braces.
 *
 * The web app URL is read server-side and never reaches the client bundle.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Nothing on this form is a paragraph. */
const MAX = 200

export type WaitlistState = {
    success?: boolean
    error?: string
} | null

/** Sheets reads a leading = + - or @ as a formula. Mark it as text. */
function guard(v: string) {
    return /^[=+\-@]/.test(v) ? `'${v}` : v
}

function clean(v: FormDataEntryValue | null) {
    return (v?.toString() ?? '').trim().slice(0, MAX)
}

export async function joinWaitlist(
    _prev: WaitlistState,
    formData: FormData
): Promise<WaitlistState> {
    const name = clean(formData.get('name'))
    const email = clean(formData.get('email'))
    const telegram = clean(formData.get('telegram'))
    const platform = clean(formData.get('platform'))
    const current = clean(formData.get('current'))

    // Honeypot. A real person never fills a hidden field; a bot fills every
    // one. Report success so the bot believes it worked and does not retry.
    if (clean(formData.get('company'))) return { success: true }

    if (!name || !email) {
        return { error: 'Name and email are both needed.' }
    }
    if (!EMAIL_RE.test(email)) {
        return { error: 'That email address does not look right.' }
    }

    const endpoint = process.env.KHARCHAAAA_WAITLIST_URL
    if (!endpoint) {
        console.error('Waitlist: KHARCHAAAA_WAITLIST_URL is not configured.')
        return { error: 'The waitlist is not reachable right now. Email hello@anurag.studio and I will add you by hand.' }
    }

    // URLSearchParams sends application/x-www-form-urlencoded, which is a
    // CORS-safelisted content type. That is the detail that lets Apps Script
    // answer without a preflight it cannot satisfy.
    const body = new URLSearchParams({
        form: 'waitlist',
        name: guard(name),
        email: guard(email),
        telegram: guard(telegram),
        platform: guard(platform),
        current: guard(current),
        page: 'anurag.studio/waitlist',
    })

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            body,
            // Apps Script answers the POST with a 302 to a googleusercontent
            // URL that carries the actual JSON. fetch follows it by default;
            // this is only here to say that the redirect is expected.
            redirect: 'follow',
            cache: 'no-store',
        })

        if (!res.ok) {
            console.error(`Waitlist: script answered HTTP ${res.status}`)
            return { error: 'Could not reach the list. Please try again in a moment.' }
        }

        // The script replies { status, message }. Anything else means the
        // deployment is wrong, and claiming success would be a lie.
        const text = await res.text()
        let parsed: { status?: number; message?: string }
        try {
            parsed = JSON.parse(text)
        } catch {
            console.error('Waitlist: script reply was not JSON:', text.slice(0, 200))
            return { error: 'Could not reach the list. Please try again in a moment.' }
        }

        if (parsed.status !== 200) {
            console.error('Waitlist: script rejected the row:', parsed)
            return { error: 'The list turned that down. Please check the details and try again.' }
        }

        return { success: true }
    } catch (err) {
        console.error('Waitlist error:', err)
        return { error: 'Could not reach the list. Please try again in a moment.' }
    }
}
