import { createHash } from 'node:crypto'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = join(import.meta.dirname, '..')
const extension = join(root, 'extension')
const version = JSON.parse(readFileSync(join(extension, 'package.json'), 'utf8')).version
const status = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' })
const commit = spawnSync('git', ['rev-parse', '--short=12', 'HEAD'], { cwd: root, encoding: 'utf8' })
const sourceCommit = status.status === 0 && status.stdout.trim() === '' && commit.status === 0
  ? commit.stdout.trim()
  : 'working-tree'

const build = spawnSync('bun', ['run', '--cwd', 'extension', 'zip'], { cwd: root, stdio: 'inherit' })
if (build.status !== 0) process.exit(build.status ?? 1)

const source = join(extension, '.output', `safe-net-guard-${version}-chrome.zip`)
const target = join(root, 'client', 'public', 'downloads', 'safenet-guard-chrome.zip')
const normalized = spawnSync('python3', [join(root, 'tools', 'normalize-extension-zip.py'), source, target], {
  cwd: root,
  stdio: 'inherit',
})
if (normalized.status !== 0) process.exit(normalized.status ?? 1)
const sha256 = createHash('sha256').update(readFileSync(target)).digest('hex')
const manifest = JSON.parse(readFileSync(join(extension, '.output', 'chrome-mv3', 'manifest.json'), 'utf8'))
const release = {
  version,
  sourceCommit,
  sha256,
  browser: 'Chrome, Manifest V3',
  permissions: manifest.permissions ?? [],
  hostPermissions: manifest.host_permissions ?? [],
}
writeFileSync(join(root, 'client', 'public', 'downloads', 'safenet-guard-release.json'), `${JSON.stringify(release, null, 2)}\n`)
copyFileSync(join(root, 'docs', 'guard', 'CHANGELOG.md'), join(root, 'client', 'public', 'downloads', 'safenet-guard-changelog.md'))
process.stdout.write(`Guard ${version} ${sourceCommit} sha256=${sha256}\n`)
