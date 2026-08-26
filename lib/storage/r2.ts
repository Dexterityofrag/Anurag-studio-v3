import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const BUCKET = process.env.R2_BUCKET ?? 'anurag-studio-media'

/* ── Lazy R2 client ────────────────────────────────────────── */
let r2Client: S3Client | null = null

function getR2Client(): S3Client {
  if (r2Client) {
    return r2Client
  }

  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  const missing: string[] = []
  if (!accountId) missing.push('R2_ACCOUNT_ID')
  if (!accessKeyId) missing.push('R2_ACCESS_KEY_ID')
  if (!secretAccessKey) missing.push('R2_SECRET_ACCESS_KEY')

  if (missing.length > 0) {
    throw new Error(`R2 is not configured: missing ${missing.join(', ')}`)
  }

  r2Client = new S3Client({
    endpoint: `https://${accountId!}.r2.cloudflarestorage.com`,
    region: 'auto',
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  })

  return r2Client
}

/**
 * Generate a presigned URL for direct client-side upload to R2.
 * Expires in 120 seconds.
 */
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(getR2Client(), command, { expiresIn: 120 })
}

/**
 * Upload a file buffer directly from the server (bypasses presigned URLs).
 */
export async function uploadFromServer(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  })
  await getR2Client().send(command)
  return getPublicUrl(key)
}

/**
 * Delete an object from R2.
 */
export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  return getR2Client().send(command)
}

/**
 * Get the public URL for an R2 object key.
 * Derives the hostname from process.env.R2_PUBLIC_URL.
 *
 * Throws rather than returning a placeholder when R2_PUBLIC_URL is unset. This
 * value is persisted to the database as an asset's permanent URL, so a soft
 * fallback would silently store an unusable link on a successful-looking
 * upload — the image would simply be broken forever with nothing logged.
 * Note this is validated separately from the credentials in getR2Client(),
 * because uploads can succeed with valid keys while this var is still missing.
 */
export function getPublicUrl(key: string): string {
  const publicUrl = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '')
  if (!publicUrl) {
    throw new Error('R2 is not configured: missing R2_PUBLIC_URL')
  }
  return `${publicUrl}/${key.replace(/^\/+/, '')}`
}

/**
 * Generate a unique storage key for an upload.
 * e.g. "projects/2024-03-12_abc123_cover.jpg"
 */
export function generateKey(folder: string, filename: string): string {
  // Sanitize every caller-supplied component so nothing but [a-z0-9-] and the
  // fixed structure ends up in the object key.
  const safeFolder =
    (folder || 'general').replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40) ||
    'general'
  const date = new Date().toISOString().split('T')[0]
  const rand = Math.random().toString(36).slice(2, 8)
  const ext =
    (filename.split('.').pop() ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10) ||
    'bin'
  const base =
    filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'file'
  return `${safeFolder}/${date}_${rand}_${base}.${ext}`
}
