const assert = require('node:assert/strict')
const { createHash } = require('node:crypto')
const { execFileSync } = require('node:child_process')
const { readFileSync } = require('node:fs')
const { runInNewContext } = require('node:vm')
const { join } = require('node:path')

const root = join(__dirname, '..')
const zip = join(root, 'client/public/downloads/safenet-guard-chrome.zip')
const release = JSON.parse(readFileSync(join(root, 'client/public/downloads/safenet-guard-release.json')))
const bytes = readFileSync(zip)
assert.equal(createHash('sha256').update(bytes).digest('hex'), release.sha256)

const entries = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).trim().split('\n')
for (const name of ['manifest.json', 'background.js', '_locales/en/messages.json', '_locales/ru/messages.json']) {
  assert.ok(entries.includes(name), `Packaged extension lacks ${name}`)
}
const readEntry = name => execFileSync('unzip', ['-p', zip, name], { encoding: 'utf8' })
const manifest = JSON.parse(readEntry('manifest.json'))
assert.equal(manifest.version, release.version)
for (const locale of ['en', 'ru']) {
  const messages = JSON.parse(readEntry(`_locales/${locale}/messages.json`))
  assert.ok(Object.keys(messages).length > 0, `Empty ${locale} catalog`)
}

const state = {}
const events = {}
const requests = []
const on = name => ({ addListener: callback => { events[name] = callback } })
const noop = async () => {}
const activeTab = { id: 1, url: 'https://example.com/login' }
const browser = {
  runtime: { id: 'synthetic-extension', getURL: path => `chrome-extension://synthetic-extension${path}`, onMessage: on('message') },
  storage: { local: {
    get: async key => key === null ? { ...state } : { [key]: state[key] },
    set: async value => Object.assign(state, value),
    remove: async key => { delete state[key] },
  } },
  webNavigation: { onCommitted: on('navigation'), onHistoryStateUpdated: on('history') },
  tabs: { onRemoved: on('removed'), sendMessage: noop, query: async () => [activeTab] },
  action: { onClicked: on('clicked'), setBadgeText: noop, setBadgeBackgroundColor: noop, setTitle: noop, setIcon: noop },
  commands: { onCommand: on('command') },
}
runInNewContext(readEntry('background.js'), {
  browser, console, URL, AbortController, setTimeout, clearTimeout,
  fetch: async (endpoint, options) => {
    requests.push({ endpoint, body: options?.body })
    return { ok: false }
  },
}, { timeout: 1000 })

async function main() {
  const canary = 'https://synthetic-user:synthetic-password@example.com/private?token=SYNTHETIC_CANARY#SYNTHETIC_FRAGMENT'
  assert.equal(typeof events.navigation, 'function')
  await events.navigation({ frameId: 0, tabId: 1, url: canary })
  await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(requests, [], 'Fresh install sent a network request without opt-in')
  const send = (message, sender) => new Promise(resolve => {
    events.message(message, sender, resolve)
  })
  const forged = await send({ type: 'TRUST_ACTIVE_SITE' }, { tab: activeTab, url: activeTab.url })
  assert.equal(forged, false)
  assert.ok(!state.safenet_trusted_hosts?.length, 'Page-controlled message changed trusted hosts')
  const popup = { url: 'chrome-extension://synthetic-extension/sidebar.html' }
  assert.equal(await send({ type: 'TRUST_ACTIVE_SITE' }, popup), true)
  assert.ok(state.safenet_trusted_hosts?.includes('example.com'))
  assert.equal(await send({ type: 'UNTRUST_HOST', host: 'example.com' }, popup), true)
  assert.ok(!state.safenet_trusted_hosts?.includes('example.com'))
  assert.deepEqual(requests, [], 'Trust controls triggered a network request without opt-in')
  console.log(`PASS packaged Guard ${release.version}: SHA-256, EN/RU, manifest, first-run privacy, trust sender boundary`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
