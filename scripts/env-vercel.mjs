/**
 * Produce .env.vercel — the exact block to paste into Vercel.
 *
 *   npm run env:vercel
 *
 * Vercel's "Environment Variables" screen accepts a whole .env file pasted at
 * once, so this saves copying eleven values by hand and getting one wrong.
 *
 * Reads .env.local, swaps the values that must differ in production, and drops
 * the ones Vercel sets itself. The output is gitignored (.env* covers it), but
 * it does contain real secrets, so delete it once you have pasted it.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SITE = 'https://anurag.studio'

/* Values that must differ in production, whatever .env.local says locally. */
const PRODUCTION_OVERRIDES = {
  NEXT_PUBLIC_SITE_URL: SITE, // local dev points at localhost:3000
  AUTH_URL: SITE,             // NextAuth callback origin
  AUTH_TRUST_HOST: 'true',    // required behind Vercel's proxy
}

/* Vercel provides these itself; setting them by hand causes confusion. */
const SKIP = new Set(['NODE_ENV', 'VERCEL', 'VERCEL_ENV', 'VERCEL_URL', 'PORT'])

const source = readFileSync('.env.local', 'utf8')

/**
 * Strip one layer of matching surrounding quotes, the way dotenv does.
 * ADMIN_PASSWORD_HASH is single-quoted in .env.local because bcrypt hashes
 * contain '$'. Copying the quotes through to Vercel would make them part of
 * the stored value, and admin login would fail in production with no useful
 * error message.
 */
function unquote(raw) {
  const v = raw.trim()
  const first = v[0]
  if ((first === '"' || first === "'") && v.length > 1 && v[v.length - 1] === first) {
    return v.slice(1, -1)
  }
  return v
}

const values = new Map()
for (const line of source.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  if (SKIP.has(key)) continue
  values.set(key, unquote(trimmed.slice(eq + 1)))
}

for (const [key, value] of Object.entries(PRODUCTION_OVERRIDES)) {
  values.set(key, value)
}

const REQUIRED = [
  'DATABASE_URL',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
  'AUTH_SECRET',
  'AUTH_URL',
  'AUTH_TRUST_HOST',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'RESEND_API_KEY',
  'REVALIDATE_SECRET',
  'NEXT_PUBLIC_SITE_URL',
]

const missing = REQUIRED.filter((k) => !values.get(k))
const ordered = [...REQUIRED.filter((k) => values.has(k)), ...[...values.keys()].filter((k) => !REQUIRED.includes(k))]

/* Refuse to produce the file at all while the factory password stands. Writing
   it and printing a warning afterwards still leaves a paste-ready file on disk
   that would put the default password into production. */
const hashCheck = values.get('ADMIN_PASSWORD_HASH')
if (hashCheck) {
  const bcrypt = (await import('bcryptjs')).default
  if (bcrypt.compareSync('admin@anurag', hashCheck)) {
    console.error('Refusing to write .env.vercel.\n')
    console.error('ADMIN_PASSWORD_HASH is still the factory default "admin@anurag".')
    console.error('Deploying it would leave your admin panel open to anyone.\n')
    console.error('Fix it first:  npm run admin:password')
    process.exit(1)
  }
}

writeFileSync('.env.vercel', ordered.map((k) => `${k}=${values.get(k)}`).join('\n') + '\n')

/* ── Report, without ever printing a secret ─────────────────── */
console.log('Wrote .env.vercel\n')
for (const key of ordered) {
  const value = values.get(key)
  const shown = key.startsWith('NEXT_PUBLIC_') || key === 'AUTH_URL' || key === 'AUTH_TRUST_HOST' || key === 'R2_BUCKET'
    ? value
    : `(${value.length} chars, hidden)`
  console.log(`  ${key.padEnd(22)} ${shown}`)
}

if (missing.length) {
  console.error(`\nMISSING from .env.local: ${missing.join(', ')}`)
  process.exitCode = 1
} else {
  console.log('\nAll 14 required variables present.')
}

console.log('\nPaste the whole file into Vercel > Settings > Environment Variables,')
console.log('then delete it: rm .env.vercel')
