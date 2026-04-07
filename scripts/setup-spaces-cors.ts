/**
 * One-time script to configure CORS on your DO Spaces bucket.
 * Run: npx tsx scripts/setup-spaces-cors.ts
 */
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION ?? 'sgp1',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
})

async function main() {
  const bucket = process.env.DO_SPACES_BUCKET ?? 'anurag-studio-media'

  console.log(`Setting CORS on bucket: ${bucket}`)
  console.log(`Region: ${process.env.DO_SPACES_REGION}`)

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [
              'https://anurag-studio-jrv8i.ondigitalocean.app',
              'https://anurag.studio',
              'https://www.anurag.studio',
              'http://localhost:3000',
              'http://localhost:3001',
            ],
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedHeaders: ['*'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  )

  console.log('CORS configured successfully!')
}

main().catch((err) => {
  console.error('Failed to set CORS:', err)
  process.exit(1)
})
