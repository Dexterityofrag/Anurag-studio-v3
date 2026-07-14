/**
 * One-off: publish the rendered showreel to DO Spaces and point the site at it.
 *
 * The /api/upload route is images-only, so this goes straight to Spaces from the
 * server the way lib/storage/spaces.ts does, plus a long Cache-Control the shared
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

const BUCKET = process.env.DO_SPACES_BUCKET ?? 'anurag-studio-media'
const REGION = process.env.DO_SPACES_REGION ?? 'nyc3'

const spaces = new S3Client({
  endpoint: `https://${REGION}.digitaloceanspaces.com`,
  region: REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
})

const publicUrl = `https://${BUCKET}.${REGION}.cdn.digitaloceanspaces.com/${KEY}`

const body = readFileSync(FILE)
const mb = (statSync(FILE).size / 1024 / 1024).toFixed(2)
console.log(`uploading ${FILE} (${mb} MB) -> ${KEY}`)

await spaces.send(
  new PutObjectCommand({
    Bucket: BUCKET,
    Key: KEY,
    Body: body,
    ContentType: 'video/mp4',
    ACL: 'public-read',
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
