import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'crypto'

export const runtime = 'nodejs'

const PUBLIC_PATHS = ['/', '/work', '/about', '/blog', '/contact']

/** Constant-time string compare that also fails closed on length mismatch. */
function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
}

export async function POST(req: Request) {
    // Fail closed if the server has no secret configured.
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
        console.error('Revalidate: REVALIDATE_SECRET is not configured.')
        return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    // Verify bearer token (constant-time)
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') ?? ''

    if (!safeEqual(token, secret)) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    try {
        // Optional specific path from body
        let extraPath: string | null = null
        try {
            const body = (await req.json()) as { path?: string }
            if (body.path) extraPath = body.path
        } catch {
            // No body is fine
        }

        // Revalidate all public pages
        for (const p of PUBLIC_PATHS) {
            revalidatePath(p)
        }

        // Revalidate extra path if provided
        if (extraPath) {
            revalidatePath(extraPath)
        }

        return NextResponse.json({
            revalidated: true,
            paths: extraPath ? [...PUBLIC_PATHS, extraPath] : PUBLIC_PATHS,
            timestamp: new Date().toISOString(),
        })
    } catch (err) {
        console.error('Revalidation error:', err)
        return NextResponse.json(
            { error: 'Revalidation failed.' },
            { status: 500 }
        )
    }
}
