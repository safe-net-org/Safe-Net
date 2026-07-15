# Design decisions

Why the load-bearing choices were made. Each is here because it was not obvious,
was chosen against a plausible alternative, or fixed a real bug.

## One rule engine, shared by everything

**Decision.** Detection lives in `packages/guard-core`, imported by the extension
and the web app, and mirrored in the ML service's Python.

**Why.** The rules were originally written twice — once in the extension, once in
the Guard landing page — and the copies had already drifted: the extension had
leet-squatting detection the landing's copy lacked. Worse, the courses taught
`paypa1.com` as the textbook phishing example while the detector scored it 8/100,
"safe". A rule that means different things in the lesson and the tool teaches the
wrong thing twice. Sharing the engine makes that contradiction impossible, and
tests on both the TS and Python sides assert the same URLs get the same verdict.

## The ML score is a blend, not the raw net

**Decision.** The final score combines BERT with the deterministic rules:
rules floor a certain-phishing verdict, cap a known-brand verdict, and cede the
uncertain middle to the net.

**Why.** BERT alone is noisy — it rates `mail.google.com` at 0.98 and `ozon.ru`
at 0.99 phishing, i.e. it would block two of the most-visited sites in the
country. A tool that blocks Gmail is uninstalled by lunchtime, and then it
protects nobody. The rules are narrow but high-precision; the net is broad but
jumpy. Letting the rules win at the extremes and the net decide the middle keeps
both strengths. The blend is one function, mirrored in both languages.

## The phishing answer key never reaches the client

**Decision.** Lesson content sent to the browser has `meta.redFlags` stripped.
The learner submits highlighted *text*, not red-flag ids, and the server matches.

**Why.** The same reason `TaskOption.isCorrect` is stripped from multiple-choice
tasks: anything sent to the browser is readable in DevTools. If the client knew
the red-flag ids, the answer would be one console command away. The learner
submits what they highlighted; the server holds the key.

## Passing requires zero false positives

**Decision.** A phishing simulator task is correct only if every red flag is found
**and** nothing innocent is flagged.

**Why.** Without the false-positive rule, highlighting the entire email would
"find" every flag and pass. But the skill being taught is telling suspicious from
ordinary — not blanket suspicion. A learner who flags everything has learned to
distrust, not to read.

## The achievement catalog is the single source of truth

**Decision.** All achievements are defined in one `as const` array whose codes
form a literal union type. The seed and the awarding logic both import it.

**Why.** Two achievements were permanently unearnable: the seed defined
`PERFECT_SCORE` while the service awarded `PERFECT_STREAK`, and `awardAchievement`
silently returned false on an unknown code. Deriving the code type from the
catalog turns that class of typo into a compile error instead of a silent no-op.

## Content is Markdown, validated in CI

**Decision.** Lessons live as Markdown/YAML under `server/content`, validated by a
Zod schema, compiled into the seed. Not hand-written TypeScript.

**Why.** The seed was 3000+ lines of `tx.*.create(...)`: unreviewable in a diff,
uneditable without reading the ORM, and unvalidated. The schema enforces a quality
floor (every claim cites a source, every task has a correct answer) and fails the
build on violations, so content bugs are caught before a learner sees them. The
seed dropped to ~260 lines that read and validate the tree.

## `db push` + a baseline, not `migrate dev`

**Decision.** Schema changes were applied with `prisma db push`, then a baseline
migration was generated and marked applied.

**Why.** No migration history was ever committed, so `migrate dev` demanded a full
reset — which would have destroyed the seeded demo data. `db push` is additive and
non-destructive; the baseline then restores a clean migration history for the
future without touching data.

## Role guard reads class-level metadata

**Decision.** `RolesGuard` resolves roles with `getAllAndOverride([handler,
class])`, and admin controllers use `@Auth(Role.ADMIN)`.

**Why.** The guard read handler metadata only, so every admin controller — which
declared `@Roles(ADMIN)` at the class level — resolved to "no roles required" and
let any logged-in user through. A `USER`-role account could list, block, and
re-role accounts. Reading class metadata closes it. Also: `@Auth()` applies its
own `Roles(USER)` bottom-up and clobbered a separate class-level `@Roles(ADMIN)`,
so the role is passed *into* `@Auth` where it cannot be overwritten.

## Local-first, and it stays that way

**Decision.** Layer 1 of the detector sends nothing anywhere. The ML and
threat-intel layers are opt-in.

**Why.** A tool that inspects every page you visit must not be the thing that
leaks your browsing. For a project *about* security, "who protects me from your
extension?" is the first question a reviewer asks; the answer is that the default
path never phones home.
