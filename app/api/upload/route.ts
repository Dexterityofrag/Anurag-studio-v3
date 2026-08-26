import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateKey, uploadFromServer, getPublicUrl } from '@/lib/storage/r2'

export const runtime = 'nodejs'

/* Only image types are accepted. SVG is allowed for logos; note it is served
   from the R2 origin (not the app origin), so any active content in
   an SVG executes in the storage origin, isolated from anurag.studio. */
const ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
])
const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

/**
 * Server-side upload — receives the file as FormData, uploads directly
 * to R2, and returns the public URL.
 *
 * Also supports the legacy JSON presigned-URL flow as a fallback.
 */
export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = req.headers.get('content-type') || ''

    /* ── FormData upload (preferred — server-side, ACL guaranteed) ── */
    if (contentType.includes('multipart/form-data')) {
        try {
            const formData = await req.formData()
            const file = formData.get('file') as File | null
            const folder = (formData.get('folder') as string) || 'general'

            if (!file) {
                return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
            }

            if (!ALLOWED_MIME.has(file.type)) {
                return NextResponse.json(
                    { error: 'Unsupported file type. Images only.' },
                    { status: 400 }
                )
            }

            if (file.size > MAX_BYTES) {
                return NextResponse.json(
                    { error: 'File too large. Max 20 MB.' },
                    { status: 400 }
                )
            }

            const key = generateKey(folder, file.name)
            const buffer = Buffer.from(await file.arrayBuffer())
            const publicUrl = await uploadFromServer(key, buffer, file.type)

            return NextResponse.json({ key, publicUrl })
        } catch (err) {
            console.error('Server upload error:', err)
            return NextResponse.json(
                { error: 'Upload failed.' },
                { status: 500 }
            )
        }
    }

    /* ── Legacy JSON presigned-URL flow (kept for backward compat) ── */
    try {
        const { generateKey: genKey, getUploadUrl, getPublicUrl: getPubUrl } =
            await import('@/lib/storage/r2')

        const { filename, contentType: fileContentType, folder } = (await req.json()) as {
            filename: string
            contentType: string
            folder: string
        }

        if (!filename || !fileContentType) {
            return NextResponse.json(
                { error: 'filename and contentType are required.' },
                { status: 400 }
            )
        }

        if (!ALLOWED_MIME.has(fileContentType)) {
            return NextResponse.json(
                { error: 'Unsupported file type. Images only.' },
                { status: 400 }
            )
        }

        const key = genKey(folder || 'general', filename)
        const uploadUrl = await getUploadUrl(key, fileContentType)
        const publicUrl = getPubUrl(key)

        return NextResponse.json({ uploadUrl, key, publicUrl })
    } catch (err) {
        console.error('Upload presign error:', err)
        return NextResponse.json(
            { error: 'Failed to generate upload URL.' },
            { status: 500 }
        )
    }
}
