import {
  S3Client,
  PutObjectCommand,
  PutObjectAclCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const spacesClient = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION ?? 'nyc3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
})

const BUCKET = process.env.DO_SPACES_BUCKET ?? 'anurag-studio-media'
const REGION = process.env.DO_SPACES_REGION ?? 'nyc3'

/**
 * Generate a presigned URL for direct client-side upload to DO Spaces.
 * Expires in 120 seconds. The ACL is baked into the signed URL.
 */
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })
  return getSignedUrl(spacesClient, command, { expiresIn: 120 })
}

/**
 * Force-set an object to public-read ACL.
 * Call this after a presigned upload completes to guarantee public access.
 */
export async function makeObjectPublic(key: string) {
  const command = new PutObjectAclCommand({
    Bucket: BUCKET,
    Key: key,
    ACL: 'public-read',
  })
  return spacesClient.send(command)
}

/**
 * Upload a file buffer directly from the server (bypasses presigned URLs).
 * This always applies ACL correctly.
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
    ACL: 'public-read',
  })
  await spacesClient.send(command)
  return getPublicUrl(key)
}

/**
 * Delete an object from DO Spaces.
 */
export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  return spacesClient.send(command)
}

/**
 * Get the public CDN URL for a Spaces object key.
 * Format: https://{bucket}.{region}.cdn.digitaloceanspaces.com/{key}
 */
export function getPublicUrl(key: string): string {
  return `https://${BUCKET}.${REGION}.cdn.digitaloceanspaces.com/${key}`
}

/**
 * Generate a unique storage key for an upload.
 * e.g. "projects/2024-03-12_abc123_cover.jpg"
 */
export function generateKey(folder: string, filename: string): string {
  const date = new Date().toISOString().split('T')[0]
  const rand = Math.random().toString(36).slice(2, 8)
  const ext = filename.split('.').pop()
  const base = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  return `${folder}/${date}_${rand}_${base}.${ext}`
}
