import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const PUBLIC_PATHS = ['/', '/work', '/about', '/blog', '/contact']

export async function POST(req: Request) {
    // Verify bearer token
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== process.env.REVALIDATE_SECRET) {
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
