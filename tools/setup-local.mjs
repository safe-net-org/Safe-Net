import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const serverEnv = join(root, 'server', '.env')
const clientEnv = join(root, 'client', '.env.local')

if (!existsSync(serverEnv)) {
  const lines = [
    'DATABASE_URL=postgresql://postgres:postgres@localhost:5433/safenet?schema=public',
    `JWT_SECRET=${randomBytes(48).toString('hex')}`,
    `JWT_REFRESH_SECRET=${randomBytes(48).toString('hex')}`,
    'FRONTEND_URL=http://localhost:3000',
    'NODE_ENV=development',
    '',
  ]
  writeFileSync(serverEnv, lines.join('\n'), { mode: 0o600, flag: 'wx' })
  process.stdout.write('Created server/.env with unique local JWT secrets.\n')
} else {
  const contents = readFileSync(serverEnv, 'utf8')
  const value = (key) => contents.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim()
  if (!value('DATABASE_URL') || !value('JWT_SECRET') || !value('JWT_REFRESH_SECRET') ||
      value('JWT_SECRET') === value('JWT_REFRESH_SECRET')) {
    throw new Error('Existing server/.env needs DATABASE_URL and two distinct nonempty JWT secrets')
  }
  process.stdout.write('Using existing server/.env.\n')
}

if (!existsSync(clientEnv)) {
  writeFileSync(clientEnv, 'NEXT_PUBLIC_API_URL=http://localhost:4200/api\nNEXT_PUBLIC_ML_URL=http://localhost:8000\n', {
    mode: 0o600,
    flag: 'wx',
  })
  process.stdout.write('Created client/.env.local.\n')
} else {
  process.stdout.write('Using existing client/.env.local.\n')
}
