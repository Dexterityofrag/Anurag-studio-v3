import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateKey, uploadFromServer, getPublicUrl } from '@/lib/storage/spaces'

export const runtime = 'nodejs'

/**
 * Server-side upload — receives the file as FormData, uploads directly
 * to DO Spaces with ACL: public-read, and returns the public CDN URL.
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
            await import('@/lib/storage/spaces')

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
