/**
 * One-off: publish the rendered showreel to R2 and point the site at it.
 *
 * The /api/upload route is images-only, so this goes straight to R2 from the
 * server the way lib/storage/r2.ts does, plus a long Cache-Control the shared
 * helper doesn't set (the object key is content-addressed by date+hash, so it is
 * safe to treat as immutable).
 *
 *   node --experimental-strip-types scripts/publish-showreel.ts
 */
import { readFileSync, statSync } from 'node:fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import postgres from 'postgres'
import { config } from 'dotenv'

config({ path: '.env.local' })

const FILE = 'out/showreel.mp4'
const KEY = `showreel/${new Date().toISOString().split('T')[0]}_showreel-v2.mp4`

const BUCKET = process.env.R2_BUCKET ?? 'anurag-studio-media'

const r2 = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const publicUrlBase = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
if (!publicUrlBase) {
  throw new Error('R2_PUBLIC_URL environment variable is not set')
}
const publicUrl = `${publicUrlBase}/${KEY}`

const body = readFileSync(FILE)
const mb = (statSync(FILE).size / 1024 / 1024).toFixed(2)
console.log(`uploading ${FILE} (${mb} MB) -> ${KEY}`)

await r2.send(
  new PutObjectCommand({
    Bucket: BUCKET,
    Key: KEY,
    Body: body,
    ContentType: 'video/mp4',
    CacheControl: 'public, max-age=31536000, immutable',
  }),
)
console.log('uploaded:', publicUrl)

const sql = postgres(process.env.DATABASE_URL!)
await sql`
  insert into site_content (key, value, content_type, group_name, description)
  values ('settings.showreelUrl', ${publicUrl}, 'url', 'settings', 'Selected Work showreel video')
  on conflict (key) do update
    set value = excluded.value, content_type = 'url', updated_at = now()
`
const [row] = await sql`select value from site_content where key = 'settings.showreelUrl'`
console.log('db settings.showreelUrl =', row.value)
await sql.end()
