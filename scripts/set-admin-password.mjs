/**
 * Set the admin password without it ever touching your shell history,
 * a chat transcript, or any file in plain text.
 *
 *   npm run admin:password
 *
 * Prompts twice with the input masked, bcrypt-hashes the result, and rewrites
 * ADMIN_PASSWORD_HASH in .env.local in place. Only the hash is ever stored.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import bcrypt from 'bcryptjs'

const ENV_PATH = '.env.local'
const MIN_LENGTH = 8

/* Known defaults and near-misses that must never be accepted again. */
const REJECTED = [
  'admin@anurag',
  'admin',
  'password',
  'anurag',
  'anurag.studio',
  'admin123',
]

/**
 * Prompt for a password, echoing an asterisk per character.
 *
 * This reads stdin in raw mode and does its own echoing rather than going
 * through readline. Two earlier attempts built on readline both failed:
 * repainting the line on every stdin event also fired on Enter and printed
 * the prompt twice, and overriding _writeToOutput to mute it swallowed the
 * prompt entirely so the script appeared to hang with no visible question.
 * Driving the terminal directly is longer but has no hidden behaviour.
 */
function askHidden(question) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin

    if (!stdin.isTTY) {
      reject(new Error('This needs an interactive terminal. Run it directly in your shell.'))
      return
    }

    process.stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    let buffer = ''

    const finish = (value) => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
      process.stdout.write('\n')
      resolve(value)
    }

    const onData = (chunk) => {
      /* A chunk can hold several characters at once, e.g. on paste. */
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {
          finish(buffer)
          return
        }
        if (ch === '\u0003') {
          /* Ctrl-C */
          stdin.setRawMode(false)
          process.stdout.write('\n')
          process.exit(130)
        }
        if (ch === '\u007f' || ch === '\b') {
          if (buffer.length > 0) {
            buffer = buffer.slice(0, -1)
            process.stdout.write('\b \b')
          }
          continue
        }
        /* Ignore other control characters, including arrow-key escapes. */
        if (ch < ' ') continue
        buffer += ch
        process.stdout.write('*')
      }
    }

    stdin.on('data', onData)
  })
}

let pw
try {
  pw = await askHidden('New admin password: ')
} catch (err) {
  console.error(`\n${err.message}`)
  process.exit(1)
}

if (pw.length < MIN_LENGTH) {
  console.error(`\nToo short. Use at least ${MIN_LENGTH} characters. Nothing was changed.`)
  process.exit(1)
}

if (REJECTED.includes(pw.toLowerCase())) {
  console.error('\nThat is one of the known defaults. Pick something else. Nothing was changed.')
  process.exit(1)
}

const again = await askHidden('Confirm password:   ')

if (pw !== again) {
  console.error('\nThe two entries do not match. Nothing was changed.')
  process.exit(1)
}

const hash = bcrypt.hashSync(pw, 12)

let env = readFileSync(ENV_PATH, 'utf8')
env = /^ADMIN_PASSWORD_HASH=/m.test(env)
  ? env.replace(/^ADMIN_PASSWORD_HASH=.*$/m, `ADMIN_PASSWORD_HASH=${hash}`)
  : `${env.trimEnd()}\nADMIN_PASSWORD_HASH=${hash}\n`

writeFileSync(ENV_PATH, env)

console.log('\nDone. ADMIN_PASSWORD_HASH updated in .env.local.')
console.log('Next: run `npm run env:vercel` to refresh the file you paste into Vercel.')
