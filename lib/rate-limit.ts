/* ────────────────────────────────────────────────────────────── */
/*  Simple in-memory sliding-window rate limiter.                  */
/*  Max 5 failures per key within 15 minutes.                      */
/*                                                                 */
/*  WARNING: state lives in the memory of ONE instance. That was   */
/*  adequate on DigitalOcean App Platform (instance_count 1), but  */
/*  the site now runs on Vercel, where concurrent serverless       */
/*  invocations each get their OWN empty Map. An attacker is       */
/*  therefore granted RATE_LIMIT_MAX attempts per instance, which  */
/*  in practice means this no longer meaningfully limits anything. */
/*                                                                 */
/*  Mitigate at the edge: a Cloudflare WAF rate-limiting rule on   */
/*  /x/admin/login (free tier, and the domain already sits on      */
/*  Cloudflare). A shared store such as Upstash Redis would also   */
/*  work but adds another service to run.                          */
/* ────────────────────────────────────────────────────────────── */

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX = 5

const attempts = new Map<string, number[]>()

/** Returns the fresh (within-window) timestamps for a key, pruning stale ones. */
function fresh(key: string): number[] {
    const windowStart = Date.now() - RATE_LIMIT_WINDOW
    const kept = (attempts.get(key) ?? []).filter((t) => t > windowStart)
    attempts.set(key, kept)
    return kept
}

/** True when the key has reached the failure limit. Does NOT record anything. */
export function isRateLimited(key: string): boolean {
    return fresh(key).length >= RATE_LIMIT_MAX
}

/** Record a failed attempt for the key. */
export function recordFailure(key: string): void {
    const kept = fresh(key)
    kept.push(Date.now())
    attempts.set(key, kept)
}

/** Clear a key's history (call on success). */
export function clearAttempts(key: string): void {
    attempts.delete(key)
}

/** Periodic cleanup — evicts stale keys every 100 calls. */
let reqCount = 0
export function maybeCleanup(): void {
    reqCount++
    if (reqCount % 100 !== 0) return
    const cutoff = Date.now() - RATE_LIMIT_WINDOW
    for (const [key, ts] of attempts) {
        const kept = ts.filter((t) => t > cutoff)
        if (kept.length === 0) attempts.delete(key)
        else attempts.set(key, kept)
    }
}

/** Best-effort client IP from proxy headers (DO App Platform / Cloudflare). */
export function clientIp(headers: Headers): string {
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        '127.0.0.1'
    )
}
