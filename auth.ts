import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { isRateLimited, recordFailure, clearAttempts, clientIp } from '@/lib/rate-limit'

/* A valid bcrypt hash of a throwaway value. Used to run a real bcrypt.compare
   even when no credential matches, so response time doesn't reveal whether the
   submitted email is the admin's (user-enumeration side channel). */
const DUMMY_HASH = '$2b$12$pMNunX1Jh05y25/7Iav3ve4oNcCQcRnzkz/zCwBBNzaWbCJR5WrZm'

/* Verify credentials against the DB (preferred) then env vars.
   Always performs exactly one bcrypt.compare per branch to equalize timing. */
async function verifyCredentials(
    email: string,
    password: string
): Promise<{ ok: boolean; email: string }> {
    // ── 1) DB credentials (dynamic import to avoid client-side bundling) ──
    try {
        const { db } = await import('@/lib/db')
        const { adminCredentials } = await import('@/lib/db/schema')

        const [dbCred] = await db.select().from(adminCredentials).limit(1)

        if (dbCred) {
            const match = await bcrypt.compare(password, dbCred.passwordHash)
            return { ok: match && email === dbCred.email, email: dbCred.email }
        }
    } catch (err) {
        console.error('[auth] DB credential lookup failed, falling back to env vars:', err)
    }

    // ── 2) Fallback to env vars ───────────────────────
    const envHash = process.env.ADMIN_PASSWORD_HASH
    const match = await bcrypt.compare(password, envHash ?? DUMMY_HASH)
    return {
        ok: !!envHash && match && email === process.env.ADMIN_EMAIL,
        email: process.env.ADMIN_EMAIL ?? '',
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, request) {
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email as string
                const password = credentials.password as string

                // ── Rate limit by client IP (counts failures only) ──
                // Enforced here — the effective credential-check point — so it
                // covers /api/auth/callback/credentials regardless of host/path,
                // which the /x/admin-only middleware matcher never sees.
                const ip = clientIp(request?.headers ?? new Headers())
                const rlKey = `login:${ip}`
                if (isRateLimited(rlKey)) {
                    throw new Error('RateLimit: too many login attempts')
                }

                const { ok, email: resolvedEmail } = await verifyCredentials(email, password)
                if (!ok) {
                    recordFailure(rlKey)
                    return null
                }

                clearAttempts(rlKey)
                return {
                    id: '1',
                    name: 'Admin',
                    email: resolvedEmail || email,
                    role: 'admin',
                }
            },
        }),
    ],

    session: {
        strategy: 'jwt',
        maxAge: 86400, // 24 hours
        updateAge: 3600, // 1 hour
    },

    pages: {
        signIn: '/x/admin/login',
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role?: string }).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                ; (session.user as { role?: string }).role = token.role as string
            }
            return session
        },
    },
})
