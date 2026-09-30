const { spawn, spawnSync } = require('node:child_process')
const assert = require('node:assert/strict')
const { join } = require('node:path')
const { createRequire } = require('node:module')
const { createHash, randomBytes } = require('node:crypto')

const root = join(__dirname, '..')
const server = join(root, 'server')
const serverRequire = createRequire(join(server, 'package.json'))
const { PrismaClient, TaskType } = serverRequire('@prisma/client')
const { PrismaPg } = serverRequire('@prisma/adapter-pg')
const { Pool } = serverRequire('pg')
const databaseUrl = process.env.SAFE_NET_TEST_DATABASE_URL
assert.ok(databaseUrl, 'Set SAFE_NET_TEST_DATABASE_URL to an empty, dedicated test database')
const url = new URL(databaseUrl)
assert.ok(/^postgres(?:ql)?:$/.test(url.protocol) && /^\/safenet_e2e_[a-z0-9_]+$/.test(url.pathname),
  'Refusing a database whose name does not start with safenet_e2e_')
assert.notEqual(process.env.NODE_ENV, 'production')
const env = { ...process.env, DATABASE_URL: databaseUrl, NODE_ENV: 'development',
  FRONTEND_URL: 'http://localhost:3000', SMTP_HOST: '127.0.0.1', SMTP_FROM: 'SafeNet <test@example.com>' }
for (const args of [['prisma', 'migrate', 'deploy'], ['prisma', 'db', 'seed']]) {
  const result = spawnSync('bunx', args, { cwd: server, env, stdio: 'inherit' })
  assert.equal(result.status, 0, `Failed: bunx ${args.join(' ')}`)
}
const port = Number(process.env.SAFE_NET_TEST_PORT || 4219)
const base = `http://127.0.0.1:${port}/api`
const pool = new Pool({ connectionString: url.toString() })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
let logs = ''
function startApi() {
  const api = spawn('node', ['dist/src/main.js'], {
    cwd: server,
    env: { ...env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  api.stdout.on('data', chunk => { logs += chunk.toString().slice(0, 1000) })
  api.stderr.on('data', chunk => { logs += chunk.toString().slice(0, 1000) })
  return api
}
let child = startApi()

async function request(path, method = 'GET', body, cookie) {
  const headers = { Origin: 'http://localhost:3000' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (cookie) headers.Cookie = cookie
  return fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
}

function cookies(response) {
  return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
}

async function waitForApi() {
  let ready = false
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) break
    try { const r = await request('/learning/tests'); if (r.status === 401) { ready = true; break } } catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  assert.ok(ready, `API did not start: ${logs.slice(-1000)}`)
}

async function stopApi() {
  const closed = new Promise(resolve => child.once('close', resolve))
  child.kill('SIGTERM')
  await closed
}

async function createToken(model, userId, extra = {}) {
  const rawToken = randomBytes(32).toString('hex')
  await prisma[model].create({ data: {
    userId, tokenHash: createHash('sha256').update(rawToken).digest('hex'),
    expiresAt: new Date(Date.now() + 60_000), ...extra,
  } })
  return rawToken
}

async function main() {
  await waitForApi()
  const login = await request('/auth/login', 'POST', { email: 'demo@safe.net', password: 'password123' })
  assert.equal(login.status, 200, `Demo login: ${await login.clone().text()}`)
  const cookie = cookies(login)
  assert.ok(cookie.includes('access_token='))
  const learnerProfile = await request('/user/profile', 'GET', undefined, cookie)
  assert.equal(learnerProfile.status, 200)
  const learnerId = (await learnerProfile.json()).user.id
  const learnerAdmin = await request('/admin/users', 'GET', undefined, cookie)
  assert.equal(learnerAdmin.status, 403)
  const adminLogin = await request('/auth/login', 'POST', { email: 'admin@safe.net', password: 'password123' })
  assert.equal(adminLogin.status, 200)
  const adminCookie = cookies(adminLogin)
  const adminProfile = await request('/user/profile', 'GET', undefined, adminCookie)
  assert.equal(adminProfile.status, 200)
  assert.notEqual((await adminProfile.json()).user.id, learnerId)
  const adminUsers = await request('/admin/users', 'GET', undefined, adminCookie)
  assert.equal(adminUsers.status, 200)
  const testsRes = await request('/learning/tests', 'GET', undefined, cookie)
  assert.equal(testsRes.status, 200, `Tests list: ${await testsRes.clone().text()}`)
  const tests = await testsRes.json()
  assert.ok(tests.length >= 20)
  const testRes = await request(`/learning/tests/${tests[0].id}`, 'GET', undefined, cookie)
  assert.equal(testRes.status, 200)
  const test = await testRes.json()
  assert.ok(test.questions.length > 1)
  const answer = { questionId: test.questions[0].id, selectedOptionIds: [test.questions[0].options[0].id] }
  const dup = await request(`/learning/tests/${test.id}/submit`, 'POST', { answers: [answer, answer], time: 10 }, cookie)
  assert.equal(dup.status, 400, `Duplicate answer: ${await dup.text()}`)
  const invalidTime = await request(`/learning/tests/${test.id}/submit`, 'POST', { answers: [], time: -1 }, cookie)
  assert.equal(invalidTime.status, 400)
  const omitted = await request(`/learning/tests/${test.id}/submit`, 'POST', { answers: [], time: 10 }, cookie)
  assert.equal(omitted.status, 200, `Omitted answers: ${await omitted.clone().text()}`)
  const result = await omitted.json()
  assert.equal(result.score, 0)
  const answerKey = await prisma.testQuestion.findMany({
    where: { testId: test.id }, include: { options: true },
  })
  const allCorrect = answerKey.map(question => ({
    questionId: question.id,
    selectedOptionIds: question.options.filter(option => option.isCorrect).map(option => option.id),
  }))
  const perfect = await request(`/learning/tests/${test.id}/submit`, 'POST', { answers: allCorrect, time: 10 }, cookie)
  assert.equal(perfect.status, 200, `Perfect test: ${await perfect.clone().text()}`)
  const perfectResult = await perfect.json()
  assert.equal(perfectResult.score, 100)
  assert.equal(perfectResult.certificateIssued, false, 'A test alone must not issue a certificate')
  const change = await request('/auth/email/change/request', 'POST', { email: 'changed@example.com', currentPassword: 'wrong-password' }, cookie)
  assert.equal(change.status, 401, `Wrong current password: ${await change.text()}`)
  const refresh = await request('/auth/login/access-token', 'POST', {}, cookie)
  assert.equal(refresh.status, 200, `Refresh: ${await refresh.text()}`)
  const rotatedCookie = cookies(refresh)
  const task = await prisma.task.findFirst({
    where: { type: TaskType.SINGLE_CHOICE, points: { gt: 0 }, options: { some: { isCorrect: true } } },
    include: { options: true },
  })
  assert.ok(task)
  const user = await prisma.user.findUniqueOrThrow({ where: { email: 'demo@safe.net' } })
  const before = await prisma.taskAttempt.findMany({ where: { taskId: task.id, userId: user.id } })
  const selectedOptionIds = task.options.filter(option => option.isCorrect).map(option => option.id)
  const [first, second] = await Promise.all([
    request(`/learning/tasks/${task.id}/answer`, 'POST', { selectedOptionIds }, cookie),
    request(`/learning/tasks/${task.id}/answer`, 'POST', { selectedOptionIds }, cookie),
  ])
  assert.equal(first.status, 200, `First task answer: ${await first.text()}`)
  assert.equal(second.status, 200, `Second task answer: ${await second.text()}`)
  const attempts = await prisma.taskAttempt.findMany({ where: { taskId: task.id, userId: user.id } })
  assert.equal(attempts.length, before.length + 2)
  assert.equal(attempts.reduce((sum, attempt) => sum + attempt.awardedXp, 0), task.points)
  assert.equal(attempts.filter(attempt => attempt.xpAwardKey).length, 1)
  await stopApi()
  child = startApi()
  await waitForApi()
  const afterRestart = await request(`/learning/tasks/${task.id}/answer`, 'POST', { selectedOptionIds }, cookie)
  assert.equal(afterRestart.status, 200)
  assert.equal((await afterRestart.json()).awardedXp, 0, 'Restart must not award the same task twice')
  const persistedLesson = await request(`/learning/lessons/${task.lessonId}`, 'GET', undefined, cookie)
  assert.equal(persistedLesson.status, 200)
  assert.equal((await persistedLesson.json()).tasks.find(record => record.id === task.id).completed, true,
    'Lesson completion comes from persisted attempts, not browser storage')

  const taskLesson = await prisma.lesson.findUniqueOrThrow({ where: { id: task.lessonId } })
  const parallelTasks = await prisma.task.findMany({
    where: { type: TaskType.SINGLE_CHOICE, points: { gt: 0 }, options: { some: { isCorrect: true } }, lesson: { courseId: taskLesson.courseId } },
    include: { options: true, lesson: true }, take: 4,
  })
  assert.ok(parallelTasks.length >= 2, 'Need distinct choice tasks in one course')
  const differentAnswers = await Promise.all(parallelTasks.map(parallelTask =>
    request(`/learning/tasks/${parallelTask.id}/answer`, 'POST', { selectedOptionIds: parallelTask.options.filter(option => option.isCorrect).map(option => option.id) }, cookie)))
  for (const response of differentAnswers) assert.equal(response.status, 200, await response.clone().text())
  const parallelCourseId = parallelTasks[0].lesson.courseId
  const savedProgress = await prisma.courseProgress.findUniqueOrThrow({ where: { userId_courseId: { userId: learnerId, courseId: parallelCourseId } } })
  const actualXp = await prisma.taskAttempt.aggregate({ where: { userId: learnerId, task: { lesson: { courseId: parallelCourseId } } }, _sum: { awardedXp: true } })
  const actualSolved = await prisma.taskAttempt.findMany({ where: { userId: learnerId, isCorrect: true, task: { lesson: { courseId: parallelCourseId } } }, distinct: ['taskId'], select: { taskId: true } })
  const actualTaskCount = await prisma.task.count({ where: { lesson: { courseId: parallelCourseId } } })
  assert.equal(savedProgress.totalXp, actualXp._sum.awardedXp)
  assert.equal(savedProgress.progress, Math.min(100, Math.round(actualSolved.length / actualTaskCount * 100)))

  const certificateCourse = await prisma.course.findUniqueOrThrow({
    where: { slug: 'vpn-encryption' },
    include: {
      lessons: { include: { tasks: { include: { options: true } } } },
      tests: { include: { questions: { include: { options: true } } } },
    },
  })
  assert.equal(certificateCourse.lessons.length, 1)
  assert.equal(certificateCourse.tests.length, 1)
  assert.equal(await prisma.certificate.count({ where: { userId: learnerId, courseId: certificateCourse.id } }), 0)
  for (const lesson of certificateCourse.lessons) {
    for (const courseTask of lesson.tasks) {
      assert.ok([TaskType.SINGLE_CHOICE, TaskType.MULTI_CHOICE].includes(courseTask.type))
      const correctOptions = courseTask.options.filter(option => option.isCorrect).map(option => option.id)
      assert.ok(correctOptions.length > 0)
      const solved = await request(`/learning/tasks/${courseTask.id}/answer`, 'POST',
        { selectedOptionIds: correctOptions }, cookie)
      assert.equal(solved.status, 200, `Course task ${courseTask.id}: ${await solved.clone().text()}`)
      assert.equal((await solved.json()).isCorrect, true)
    }
  }
  const finalTest = certificateCourse.tests[0]
  const finalAnswers = finalTest.questions.map(question => ({
    questionId: question.id,
    selectedOptionIds: question.options.filter(option => option.isCorrect).map(option => option.id),
  }))
  const finalResponses = await Promise.all(Array.from({ length: 4 }, () =>
    request(`/learning/tests/${finalTest.id}/submit`, 'POST', { answers: finalAnswers, time: 90 }, cookie)))
  for (const finalResponse of finalResponses) {
    assert.equal(finalResponse.status, 200, `Concurrent course test: ${await finalResponse.clone().text()}`)
    const finalResult = await finalResponse.json()
    assert.equal(finalResult.score, 100)
    assert.equal(finalResult.certificateIssued, true)
  }
  assert.equal(await prisma.certificate.count({ where: { userId: learnerId, courseId: certificateCourse.id } }), 1)
  const awards = await prisma.userAchievement.findMany({ where: { userId: learnerId }, include: { achievement: true } })
  const awardedUser = await prisma.user.findUniqueOrThrow({ where: { id: learnerId } })
  assert.equal(awardedUser.bonusXp, awards.reduce((sum, award) => sum + award.achievement.xpReward, 0),
    'Concurrent achievements must award bonus XP exactly once')
  const certificate = await prisma.certificate.findFirstOrThrow({ where: { userId: learnerId, courseId: certificateCourse.id } })
  assert.equal((await request(`/learning/certificates/${certificate.id}`, 'GET', undefined, cookie)).status, 200)
  await prisma.user.create({ data: {
    email: 'outsider@example.test', name: 'Synthetic outsider', password: user.password, emailVerifiedAt: new Date(),
  } })
  const outsiderLogin = await request('/auth/login', 'POST', { email: 'outsider@example.test', password: 'password123' })
  assert.equal(outsiderLogin.status, 200)
  const outsiderCookie = cookies(outsiderLogin)
  assert.equal((await request(`/learning/certificates/${certificate.id}`, 'GET', undefined, outsiderCookie)).status, 403)
  const outsiderLesson = await request(`/learning/lessons/${task.lessonId}`, 'GET', undefined, outsiderCookie)
  assert.equal(outsiderLesson.status, 200)
  assert.equal((await outsiderLesson.json()).tasks.every(record => record.completed === false), true,
    'Another learner must not inherit completed tasks')

  // The browser can still hold the consumed cookie while a refresh response
  // is in flight. Logout must revoke its replacement session as well.
  const logout = await request('/auth/logout', 'POST', {}, cookie)
  assert.equal(logout.status, 200)
  const oldAccess = await request('/learning/tests', 'GET', undefined, rotatedCookie)
  assert.equal(oldAccess.status, 401, `Old access after logout: ${await oldAccess.text()}`)
  const oldRefresh = await request('/auth/login/access-token', 'POST', {}, rotatedCookie)
  assert.equal(oldRefresh.status, 401, `Old refresh after logout: ${await oldRefresh.text()}`)

  const afterLogoutLogin = await request('/auth/login', 'POST', { email: 'demo@safe.net', password: 'password123' })
  assert.equal(afterLogoutLogin.status, 200)
  const beforeBlockCookie = cookies(afterLogoutLogin)
  assert.equal((await request('/auth/logout', 'POST', {}, cookie)).status, 200)
  assert.equal((await request('/user/profile', 'GET', undefined, beforeBlockCookie)).status, 200,
    'Repeated logout with an old cookie must preserve a newer login')
  const blocked = await request(`/admin/users/${learnerId}`, 'PUT', { status: 'BLOCKED' }, adminCookie)
  assert.equal(blocked.status, 200, `Block learner: ${await blocked.text()}`)
  assert.equal((await request('/learning/tests', 'GET', undefined, beforeBlockCookie)).status, 401)
  const unblocked = await request(`/admin/users/${learnerId}`, 'PUT', { status: 'ACTIVE' }, adminCookie)
  assert.equal(unblocked.status, 200, `Unblock learner: ${await unblocked.text()}`)
  assert.equal((await request('/learning/tests', 'GET', undefined, beforeBlockCookie)).status, 401,
    'Pre-block access token must not revive after unblock')
  assert.equal((await request('/auth/login/access-token', 'POST', {}, beforeBlockCookie)).status, 401)

  const afterUnblockLogin = await request('/auth/login', 'POST', { email: 'demo@safe.net', password: 'password123' })
  assert.equal(afterUnblockLogin.status, 200)
  const beforeChangeCookie = cookies(afterUnblockLogin)
  const beforeChange = await prisma.user.findUniqueOrThrow({ where: { id: learnerId } })
  const oldMailboxReset = await createToken('passwordResetToken', learnerId)
  const oldMailboxVerification = await createToken('emailVerificationToken', learnerId)
  const rawTokens = [randomBytes(32).toString('hex'), randomBytes(32).toString('hex')]
  for (const [index, rawToken] of rawTokens.entries()) {
    await prisma.emailChangeToken.create({ data: {
      userId: learnerId,
      newEmail: `concurrent-${index}@example.test`,
      tokenHash: createHash('sha256').update(rawToken).digest('hex'),
      expiresAt: new Date(Date.now() + 60_000),
    } })
  }
  const confirmations = await Promise.all(rawTokens.map(token =>
    request('/auth/email/change/confirm', 'POST', { token })))
  assert.deepEqual(confirmations.map(response => response.status).sort(), [200, 400],
    'Exactly one parallel email confirmation should win')
  const afterChange = await prisma.user.findUniqueOrThrow({ where: { id: learnerId } })
  assert.ok(['concurrent-0@example.test', 'concurrent-1@example.test'].includes(afterChange.email))
  assert.equal(afterChange.authVersion, beforeChange.authVersion + 1)
  assert.equal((await request('/learning/tests', 'GET', undefined, beforeChangeCookie)).status, 401)
  const consumedTokens = await prisma.emailChangeToken.findMany({ where: { userId: learnerId } })
  assert.equal(consumedTokens.filter(record => record.usedAt).length, 2)

  assert.equal((await request('/auth/password/reset', 'POST', { token: oldMailboxReset, password: 'unsafe-reset-password' })).status, 400)
  assert.equal((await request('/auth/email/verify', 'POST', { token: oldMailboxVerification })).status, 400)

  await stopApi()
  child = startApi()
  await waitForApi()
  const outsider = await prisma.user.findUniqueOrThrow({ where: { email: 'outsider@example.test' } })
  const beforePasswordLogin = await request('/auth/login', 'POST', { email: outsider.email, password: 'password123' })
  assert.equal(beforePasswordLogin.status, 200)
  const beforePasswordCookie = cookies(beforePasswordLogin)
  const pendingBeforePassword = await createToken('emailChangeToken', outsider.id, { newEmail: 'stale-before-password@example.test' })
  const changedPassword = await request('/user/profile', 'PUT', { currentPassword: 'password123', password: 'changed-password-123' }, beforePasswordCookie)
  assert.equal(changedPassword.status, 200, await changedPassword.clone().text())
  assert.equal((await request('/user/profile', 'GET', undefined, beforePasswordCookie)).status, 401)
  assert.equal((await request('/auth/login/access-token', 'POST', {}, beforePasswordCookie)).status, 401)
  assert.equal((await request('/auth/email/change/confirm', 'POST', { token: pendingBeforePassword })).status, 400)
  const beforeResetLogin = await request('/auth/login', 'POST', { email: outsider.email, password: 'changed-password-123' })
  assert.equal(beforeResetLogin.status, 200)
  const beforeResetCookie = cookies(beforeResetLogin)
  const pendingBeforeReset = await createToken('emailChangeToken', outsider.id, { newEmail: 'stale-before-reset@example.test' })
  const resetToken = await createToken('passwordResetToken', outsider.id)
  const reset = await request('/auth/password/reset', 'POST', { token: resetToken, password: 'reset-password-123' })
  assert.equal(reset.status, 200, await reset.clone().text())
  assert.equal((await request('/user/profile', 'GET', undefined, beforeResetCookie)).status, 401)
  assert.equal((await request('/auth/login/access-token', 'POST', {}, beforeResetCookie)).status, 401)
  assert.equal((await request('/auth/email/change/confirm', 'POST', { token: pendingBeforeReset })).status, 400)
  assert.equal((await request('/auth/password/reset', 'POST', { token: resetToken, password: 'replayed-password-123' })).status, 400)
  assert.equal((await request('/auth/login', 'POST', { email: outsider.email, password: 'reset-password-123' })).status, 200)

  console.log('PASS isolated HTTP: anonymous 401, learner/admin roles, two accounts, grading guards, certificate prerequisites, concurrent unique issuance and ownership, email-change password guard and parallel confirmation, stale recovery links, password change/reset lifecycle, refresh, concurrent XP once after restart and consistent progress across distinct tasks, consumed refresh logout and block/unblock revoke access and refresh')
}

main().catch(error => { console.error(error); process.exitCode = 1 }).finally(async () => {
  if (child.exitCode === null && child.signalCode === null) await stopApi()
  await prisma.$disconnect()
  await pool.end()
})
