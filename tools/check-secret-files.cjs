const { execFileSync } = require('node:child_process')
const { readFileSync } = require('node:fs')
const { join, basename } = require('node:path')

const root = join(__dirname, '..')
const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root })
  .toString().split('\0').filter(Boolean)
const failures = []
for (const file of tracked) {
  let content
  try {
    content = readFileSync(join(root, file))
  } catch (error) {
    // `git ls-files --cached` still includes files removed in the working
    // tree until the deletion is staged. Deleted files cannot enter the build.
    if (error && error.code === 'ENOENT') continue
    throw error
  }
  const name = basename(file)
  if ((name === '.env' || name.startsWith('.env.')) && name !== '.env.example') {
    failures.push(`${file}: tracked environment file`)
  }
  if (/\.(pem|p12|pfx|key)$/i.test(name)) failures.push(`${file}: tracked key file`)
  if (content.includes(0)) continue
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content.toString('utf8'))) {
    failures.push(`${file}: private-key block in tracked content`)
  }
}
if (failures.length) {
  for (const failure of failures) console.error(failure)
  process.exitCode = 1
} else {
  console.log('PASS: no tracked environment, key, or private-key block files')
}
