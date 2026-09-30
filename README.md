# Safe-Net

> **One cybersecurity rule, three places to use it:** learn it in a course,
> practise it in a simulation, and apply it while browsing.

Safe-Net is an independent, full-stack cybersecurity education project. It
combines a bilingual learning platform, a phishing simulator, a live URL scanner,
and a Chrome extension around one shared phishing-detection engine.

The central design decision is simple: a learner should never be taught one rule
and protected by another. The same open TypeScript engine powers the lesson
examples, the scanner, and the extension.

## Why it is different

- **Learning is testable.** The LMS has 8 stages, 21 courses, 27 lessons, 163
  practical tasks, and 21 tests. Content is validated before it can be seeded.
- **Practice is realistic.** In phishing tasks, learners identify suspicious
  elements in simulated messages and sites. The answer key stays on the server;
  marking everything as suspicious does not pass the task.
- **Protection is explainable and local-first.** Guard begins with deterministic,
  offline URL analysis. Threat intelligence and ML are optional layers rather than
  hidden data flows.
- **One rule engine, multiple surfaces.** `@safe-net/guard-core` is shared by the
  web scanner and the Chrome extension, and mirrored in Python for the optional
  ML service.

## Reviewer path

Start here depending on what you want to evaluate:

| If you want to see… | Start with… |
| --- | --- |
| The product and local demo | [Quick start](#quick-start) |
| System boundaries and data flows | [Architecture](docs/ARCHITECTURE.md) |
| The shared scoring logic | [`guard-core`](packages/guard-core/README.md) |
| How course content is structured and validated | [Content format](server/content/README.md) |
| Security, privacy, and product trade-offs | [Hardening plan](docs/PRODUCT_HARDENING_PLAN.md) |
| Verified behavior and remaining gaps | [Evidence and limitations](docs/EVIDENCE_AND_LIMITATIONS.md) |
| Early academic feedback | [Professor brief draft](docs/PROFESSOR_BRIEF_DRAFT.md) |
| A concise project narrative for an academic or portfolio reviewer | [Project story](docs/PROJECT_STORY.md) |

## Architecture at a glance

```text
                  @safe-net/guard-core
                  pure TypeScript rule engine
                    /        |        \
                   /         |         \
      Chrome extension    Web /guard    Python ML mirror
            |                  |              |
            +------------------+--------------+
                               |
                    Next.js client + NestJS API
                               |
                           PostgreSQL
```

The complete component map and the important data flows are documented in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Quick start

**Prerequisites:** [Bun](https://bun.sh), Docker, and Python 3.12 only if you
want to run the optional ML layer.
Install dependencies from the repository root; `bun.lock` there is the single
workspace lockfile.

```bash
bun run setup:demo  # fresh local database only: configure, migrate, seed verified demo users
bun run dev:no-ml   # start web, API, and database without the optional model
```

`bun run setup` installs dependencies, creates local environment files only when
missing, starts PostgreSQL, and applies migrations. It preserves existing users
and progress. `setup:demo` additionally loads curriculum and demo accounts, but
the seed refuses a nonempty database and is disabled in production. Back up an
existing database and use a separate empty database for a new demo; do not use
the seed as a content-update command. If you already have `server/.env`, setup
checks that it contains `DATABASE_URL` and two distinct JWT secrets without
overwriting it. For email delivery, configure a real provider or local SMTP as
described in [email delivery](docs/EMAIL_DELIVERY.md).

The certificate uniqueness migration stops if an existing database contains
multiple certificates for the same learner and course. It keeps all records;
reconcile those duplicates before retrying the migration.

For account safety, changing a password or email and signing out end all active
sessions for that account. Sign in again on other devices afterward.

| Service | Local URL | Purpose |
| --- | --- | --- |
| Web | <http://localhost:3000> | LMS, simulator, and `/guard` scanner |
| API | <http://localhost:4200> | NestJS API and learning domain |
| ML | <http://localhost:8000> | Optional FastAPI/BERT opinion |
| PostgreSQL | `localhost:5433` | Local Docker database |

Run `bun run setup:ml` and `bun run dev` only when you want the optional ML
service. The local rule engine works without it.

**Demo accounts** (development only; password `password123`):

- Learner: `demo@safe.net`
- Administrator: `admin@safe.net`

## SafeNet Guard extension

The extension is a Manifest V3 Chrome extension built with WXT. It scores URLs
locally first and can enrich the result only when the user enables the relevant
network options.

1. Open `/guard` in the local web app and download the packaged extension, or use
   [`client/public/downloads/safenet-guard-chrome.zip`](client/public/downloads/safenet-guard-chrome.zip).
2. Unzip the archive.
3. In Chrome, open `chrome://extensions`, enable **Developer mode**, then choose
   **Load unpacked** and select the unzipped folder.

To build it from source, run `bun run package:ext`; the unpacked build is written
to `extension/.output/chrome-mv3`, and the downloadable ZIP, checksum, and
release details are refreshed together.

## Detection model

| Layer | What it checks | Default |
| --- | --- | --- |
| 1. Local rules | IDN homographs, typosquatting, leet-squatting, brand impersonation, URL structure | On; offline |
| 2. Threat intelligence | Domain age, DNS blocklists, URLhaus, Certificate Transparency | Opt-in |
| 3. ML opinion | Fine-tuned BERT blended with the rule score | Optional |
| 4. Page analysis | Login forms on HTTP, credential harvesting, wallet-drainer signals | Extension only |

The neural model is not presented as a source of truth. The blend preserves
high-confidence deterministic signals and uses ML in uncertain cases. The blend
is implemented in [`packages/guard-core`](packages/guard-core) and mirrored in
[`ml-service/app/model.py`](ml-service/app/model.py).

## Repository map

| Path | Responsibility |
| --- | --- |
| [`client/`](client) | Next.js application: LMS, simulations, dashboard, and `/guard` |
| [`server/`](server) | NestJS API, Prisma models, authentication, content pipeline |
| [`server/content/`](server/content) | Source lessons and tests, validated before seeding |
| [`packages/guard-core/`](packages/guard-core) | Shared, dependency-free phishing rule engine |
| [`extension/`](extension) | SafeNet Guard Chrome extension |
| [`ml-service/`](ml-service) | Optional FastAPI/BERT service and parity tests |
| [`docs/`](docs) | Architecture, operational notes, and project narrative |

## Verification

Run the checks independently or use the full local matrix:

```bash
bun run typecheck         # API, web, extension, and shared engine
bun run check             # typecheck, lint, and EN/RU parity
bun run test              # API, rule engine, ML scoring/privacy/parity, extension privacy
bun run validate:content  # validates lesson and test source material
bun run build             # production builds for API, web, and extension
bun run test:package      # checksum, locales, and first-run privacy of the downloaded ZIP
bun run test:http         # requires a separate empty safenet_e2e_* PostgreSQL database
```

The repository also includes CI checks for content structure, localization parity,
theme constraints, type safety, and scoring parity.

## Safety and scope

Safe-Net is an educational project and a browser-side warning tool, **not** a
replacement for enterprise security software or professional incident response.
The project deliberately documents its privacy and operational limits rather than
claiming certification or protection it has not earned. See the
[hardening plan](docs/PRODUCT_HARDENING_PLAN.md) and the in-product
[security information](client/app/legal/security/page.tsx).

## License

[MIT](LICENSE)
