import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { generateKey, getUploadUrl, getPublicUrl } from '@/lib/storage/spaces'

export async function POST(req: Request) {
    // Auth check
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { filename, contentType, folder } = (await req.json()) as {
            filename: string
            contentType: string
            folder: string
        }

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: 'filename and contentType are required.' },
                { status: 400 }
            )
        }

        const key = generateKey(folder || 'general', filename)
        const uploadUrl = await getUploadUrl(key, contentType)
        const publicUrl = getPublicUrl(key)

        return NextResponse.json({ uploadUrl, key, publicUrl })
    } catch (err) {
        console.error('Upload presign error:', err)
        return NextResponse.json(
            { error: 'Failed to generate upload URL.' },
            { status: 500 }
        )
    }
}
