import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// drizzle-kit runs as a bare CLI outside Next.js, so nothing loads .env.local
// for it. Without this the config sees no DATABASE_URL and fails with
// "Either connection url or host, database are required".
config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local before running drizzle-kit.')
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
})
