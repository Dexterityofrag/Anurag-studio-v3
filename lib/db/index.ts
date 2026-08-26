import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Prevent multiple connections in development (Next.js hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined
}

const client =
  globalThis._pgClient ??
  postgres(process.env.DATABASE_URL!, {
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? 'require' : false,
    // On Vercel (serverless), each concurrent function instance gets its own pool.
    // max: 10 would hit Neon's connection limit quickly. Use max: 1 for serverless.
    // Note: DATABASE_URL should be the pooled connection string (host contains '-pooler' for Neon).
    max: 1,
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis._pgClient = client
}

export const db = drizzle(client, { schema })
export type DB = typeof db

