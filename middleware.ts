import { auth } from '@/auth'
import { NextResponse } from 'next/server'

/* ────────────────────────────────────────────────────────────── */
/*  Simple in-memory sliding-window rate limiter                  */
/*  Max 5 failed attempts per IP within 15 minutes                */
/* ────────────────────────────────────────────────────────────── */

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX = 5

const attempts = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_WINDOW
    const timestamps = (attempts.get(ip) ?? []).filter((t) => t > windowStart)

    if (timestamps.length >= RATE_LIMIT_MAX) {
        attempts.set(ip, timestamps)
        return false // blocked
    }

    timestamps.push(now)
    attempts.set(ip, timestamps)
    return true // allowed
}

// Periodic cleanup (every 100 requests, evict stale IPs)
let reqCount = 0
function maybeCleanup() {
    reqCount++
    if (reqCount % 100 !== 0) return
    const cutoff = Date.now() - RATE_LIMIT_WINDOW
    for (const [ip, ts] of attempts) {
        const fresh = ts.filter((t) => t > cutoff)
        if (fresh.length === 0) attempts.delete(ip)
        else attempts.set(ip, fresh)
    }
}

/* ────────────────────────────────────────────────────────────── */
/*  Middleware                                                    */
/* ────────────────────────────────────────────────────────────── */

export default auth(async (req) => {
    const { pathname } = req.nextUrl
    const isAdminRoute = pathname.startsWith('/x/admin')
    const isLoginRoute = pathname === '/x/admin/login'

    maybeCleanup()

    // Rate-limit POST requests to the login page
    if (req.method === 'POST' && isLoginRoute) {
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            req.headers.get('x-real-ip') ??
            '127.0.0.1'

        if (!checkRateLimit(ip)) {
            return new NextResponse('Too many login attempts. Try again later.', {
                status: 429,
            })
        }
    }

    // Protect admin routes (except login)
    if (isAdminRoute && !isLoginRoute) {
        if (!req.auth) {
            // Return 404 instead of 401 to hide admin panel existence
            return NextResponse.redirect(new URL('/x/admin/login', req.url))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/x/admin/:path*'],
}
