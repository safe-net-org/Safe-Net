const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { join } = require('node:path')

const root = join(__dirname, '..')
const databaseUrl = process.env.SAFE_NET_TEST_DATABASE_URL
assert.ok(databaseUrl, 'Run test:http first against a dedicated database, then set SAFE_NET_TEST_DATABASE_URL')
assert.match(new URL(databaseUrl).pathname, /^\/safenet_e2e_[a-z0-9_]+$/, 'Refusing a non-test database')
assert.notEqual(process.env.NODE_ENV, 'production')
const mailbox = process.env.SAFE_NET_TEST_MAILPIT_URL || 'http://127.0.0.1:8025'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(mailbox).hostname), 'Mailpit must be local')
const port = Number(process.env.SAFE_NET_TEST_MAIL_API_PORT || 4241)
const base = `http://127.0.0.1:${port}/api`
const { CURRENT_LEGAL_VERSION } = require(join(root, 'server/dist/src/auth/legal-consent.js'))
const child = spawn('node', ['dist/src/main.js'], {
  cwd: join(root, 'server'),
  env: { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: 'development', PORT: String(port),
    FRONTEND_URL: 'http://localhost:3000', RESEND_API_KEY: '', SMTP_HOST: '127.0.0.1',
    SMTP_PORT: process.env.SAFE_NET_TEST_SMTP_PORT || '1025', SMTP_SECURE: 'false',
    SMTP_REQUIRE_TLS: 'false', SMTP_USER: '', SMTP_PASSWORD: '', SMTP_FROM: 'SafeNet <test@example.test>',
    PASSWORD_RESET_DEBUG_LOG: 'false' },
  stdio: ['ignore', 'ignore', 'ignore'],
})

async function request(path, body, cookie, method = 'POST') {
  return fetch(base + path, { method, headers: {
    Origin: 'http://localhost:3000', ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  }, body: body ? JSON.stringify(body) : undefined })
}
function cookies(response) { return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ') }
async function message(recipient, subject) {
  for (let i = 0; i < 40; i++) {
    const list = await (await fetch(mailbox + '/api/v1/messages')).json()
    const found = list.messages.find(item => item.Subject === subject && item.To.some(to => to.Address === recipient))
    if (found) return (await fetch(mailbox + '/api/v1/message/' + found.ID)).json()
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Expected local SMTP message was not delivered')
}
function tokenFrom(mail) {
  const match = mail.Text.match(/http:\/\/localhost:3000\/[^\s]*token=([a-f0-9]{64})/)
  assert.ok(match, 'Email must contain a frontend link with a single-use token')
  assert.ok(mail.HTML.includes(match[1]), 'HTML and plain text must share the token')
  return match[1]
}
async function main() {
  let ready = false
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) break
    try { if ((await request('/learning/tests', undefined, undefined, 'GET')).status === 401) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert.ok(ready, 'Test mail API did not start')
  for (const locale of ['en', 'ru']) {
    const email = `smtp-${locale}-${Date.now()}@example.test`
    const newEmail = email.replace('smtp-', 'changed-')
    const password = 'Synthetic-mail-password-123!'
    const newPassword = 'Synthetic-mail-new-password-123!'
    assert.equal((await request('/auth/register', { name: 'Synthetic SMTP learner', email, password,
      termsAccepted: true, privacyAccepted: true, legalVersion: CURRENT_LEGAL_VERSION, legalLocale: locale })).status, 200)
    const verification = await message(email, locale === 'ru' ? 'Подтвердите email в SafeNet' : 'Verify your SafeNet email')
    const verifyToken = tokenFrom(verification)
    const verified = await request('/auth/email/verify', { token: verifyToken })
    assert.equal(verified.status, 200)
    assert.equal((await request('/auth/email/verify', { token: verifyToken })).status, 400)
    const verifiedCookie = cookies(verified)
    assert.equal((await request('/auth/password/forgot', { email })).status, 200)
    const resetMail = await message(email, locale === 'ru' ? 'Сброс пароля SafeNet' : 'Reset your SafeNet password')
    const resetToken = tokenFrom(resetMail)
    assert.equal((await request('/auth/password/reset', { token: resetToken, password: newPassword })).status, 200)
    assert.equal((await request('/user/profile', undefined, verifiedCookie, 'GET')).status, 401)
    const login = await request('/auth/login', { email, password: newPassword })
    assert.equal(login.status, 200)
    const cookie = cookies(login)
    assert.equal((await request('/auth/email/change/request', { email: newEmail, currentPassword: newPassword }, cookie)).status, 200)
    const notice = await message(email, locale === 'ru' ? 'Запрошена смена email SafeNet' : 'SafeNet email change requested')
    assert.ok(notice.Text && notice.HTML, 'Old address receives a notification in both formats')
    const changeMail = await message(newEmail, locale === 'ru' ? 'Подтвердите новый email SafeNet' : 'Confirm your new SafeNet email')
    const before = await (await request('/user/profile', undefined, cookie, 'GET')).json()
    assert.equal(before.user.email, email, 'Old address remains until confirmation')
    const changeToken = tokenFrom(changeMail)
    const confirmed = await request('/auth/email/change/confirm', { token: changeToken })
    assert.equal(confirmed.status, 200)
    const after = await (await request('/user/profile', undefined, cookies(confirmed), 'GET')).json()
    assert.equal(after.user.email, newEmail)
    assert.equal((await request('/auth/email/change/confirm', { token: changeToken })).status, 400)
    assert.equal((await request('/auth/password/reset', { token: resetToken, password })).status, 400)
  }
  console.log('PASS SMTP + HTTP EN/RU: delivered verification/reset/change links, old-address notices, one-use links and credential revocation')
}
main().catch(error => { console.error(error.message); process.exitCode = 1 }).finally(async () => {
  if (child.exitCode === null && child.signalCode === null) {
    const closed = new Promise(resolve => child.once('close', resolve))
    child.kill('SIGTERM')
    await closed
  }
})
