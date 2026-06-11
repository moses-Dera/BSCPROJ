/**
 * UniClear Platform Owner Setup
 * ─────────────────────────────
 * Run once on a fresh deployment to create the platform owner account.
 * Requires direct server (SSH) access — cannot be triggered over HTTP.
 *
 * Usage:
 *   npm run setup
 *
 * Refuses to run if a platform owner already exists.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
// @ts-ignore
import bcrypt from 'bcryptjs'
import readline from 'readline'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

    if (hidden) {
      process.stdout.write(question)
      process.stdin.setRawMode(true)
      process.stdin.resume()

      let input = ''
      process.stdin.on('data', (char: Buffer) => {
        const c = char.toString()
        if (c === '\n' || c === '\r') {
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdout.write('\n')
          rl.close()
          resolve(input)
        } else if (c === '\u0003') {
          process.exit()
        } else if (c === '\u007f') {
          input = input.slice(0, -1)
        } else {
          input += c
          process.stdout.write('*')
        }
      })
    } else {
      rl.question(question, answer => {
        rl.close()
        resolve(answer.trim())
      })
    }
  })
}

async function main() {
  console.log('\n══════════════════════════════════════')
  console.log('  UniClear — Platform Owner Setup')
  console.log('══════════════════════════════════════\n')

  // Refuse if platform owner already exists
  const existing = await db.user.findFirst({ where: { role: 'PLATFORM_OWNER' } })
  if (existing) {
    // Allow adding another if SETUP_SECRET is provided and --force flag is passed
    const force = process.argv.includes('--force')
    const secret = process.env.SETUP_SECRET

    if (!force) {
      console.error('✗ A platform owner account already exists.')
      console.error('  To add another, run: SETUP_SECRET=<secret> npm run setup -- --force')
      process.exit(1)
    }

    if (!secret) {
      console.error('✗ SETUP_SECRET env variable is required to use --force.')
      process.exit(1)
    }

    const input = await prompt('Enter SETUP_SECRET to confirm: ', true)
    if (input !== secret) {
      console.error('\n✗ Incorrect secret.')
      process.exit(1)
    }

    console.log('\n⚠ Adding additional platform owner account...')
  }

  const name     = await prompt('Full name:  ') // Note: User model does not store name directly right now, kept for prompt compatibility
  const email    = await prompt('Email:      ')
  const password = await prompt('Password:   ', true)
  const confirm  = await prompt('Confirm:    ', true)

  if (!name || !email || !password) {
    console.error('\n✗ All fields are required.')
    process.exit(1)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('\n✗ Invalid email address.')
    process.exit(1)
  }

  if (password.length < 8) {
    console.error('\n✗ Password must be at least 8 characters.')
    process.exit(1)
  }

  if (password !== confirm) {
    console.error('\n✗ Passwords do not match.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { 
      email, 
      passwordHash,
      role: 'PLATFORM_OWNER',
      passwordSetAt: new Date(),
      isActive: true
    },
  })

  console.log('\n✓ Platform owner account created successfully.')
  console.log(`  Email: ${email}`)
  console.log('\n  You can now log in at /login\n')
}

main()
  .catch(e => { console.error('\n✗ Setup failed:', e.message); process.exit(1) })
  .finally(() => db.$disconnect())
