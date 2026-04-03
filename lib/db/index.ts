import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Prevent multiple connections in development (Next.js hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined
}

const client =
  global._pgClient ??
  postgres(process.env.DATABASE_URL!, {
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? 'require' : false,
    max: 10,
  })

if (process.env.NODE_ENV !== 'production') {
  global._pgClient = client
}

export const db = drizzle(client, { schema })
export type DB = typeof db
