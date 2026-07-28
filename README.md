# Safe-Net

A cybersecurity platform built around one idea: **the course teaches a rule, the
simulator tests whether you learned it, and a browser extension enforces it while
you browse — all three running the same detection engine.**

It has three parts:

- **An LMS** — 8 stages, 21 courses, 27 lessons, 163 tasks on phishing, dangerous links,
  passwords, malware, privacy and more. Every lesson cites a real-world case
  (WannaCry, the Google/Facebook invoice fraud, the Twitter 2020 takeover) with
  a source.
- **A phishing simulator** — realistic emails and sites where you highlight what
  looks wrong. The answer key never leaves the server, and flagging everything
  fails: recognising what is *normal* matters as much as spotting what is not.
- **SafeNet Guard** — a local-first Chrome extension that scores URLs with a
  deterministic rule engine and can add domain intelligence or a fine-tuned
  BERT opinion only after the user enables those network layers.

The detection logic is a single package, [`@safe-net/guard-core`](packages/guard-core),
imported by the extension, by the web app's live scanner at `/guard`, and mirrored
in the Python ML service. When the courses teach that `paypa1.com` is phishing,
the detector agrees — because it is the same rules, and tests assert it.

## Quick start

Prerequisites: [Bun](https://bun.sh), Docker, and Python 3.12 (only for the
optional ML layer).

```bash
bun run setup      # install deps, start Postgres, migrate, seed
bun run dev        # start everything: web, API, ML, database
```

| Service     | URL                     | What it is                     |
| :---------- | :---------------------- | :----------------------------- |
| Web         | http://localhost:3000   | Next.js — LMS, simulator, /guard |
| API         | http://localhost:4200   | NestJS + Prisma                |
| ML service  | http://localhost:8000   | FastAPI + BERT (optional)      |
| PostgreSQL  | localhost:5433          | Docker                         |

No Python? `bun run dev:no-ml` runs everything except the ML layer — the
extension and scanner fall back to local rules, which need no server at all.

**Demo accounts** (password `password123`): `demo@safe.net` (learner),
`admin@safe.net` (admin).

The browser extension ships pre-built: grab the zip from the `/guard` page
(or [`client/public/downloads/safenet-guard-chrome.zip`](client/public/downloads/safenet-guard-chrome.zip)),
unzip it, and load the folder as an unpacked extension in `chrome://extensions` —
no toolchain needed. To build from source instead: `bun run build:ext`, then load
`extension/.output/chrome-mv3`. After changing extension code, `bun run package:ext`
refreshes the downloadable zip.

## Repository layout

```
safe-net/
├── client/            Next.js frontend — LMS, phishing simulator, /guard
├── server/            NestJS API + Prisma; content pipeline; seed
│   └── content/       Every lesson as Markdown/YAML, validated in CI
├── packages/
│   └── guard-core/    The shared phishing-detection rule engine
├── extension/         SafeNet Guard — the Chrome extension (WXT)
├── ml-service/        FastAPI + fine-tuned BERT, blended with the rules
└── docs/              Architecture and design decisions
```

## The detection engine

Guard scores a URL in four layers; only the first is required, and each degrades
gracefully if the next is unavailable.

| Layer | What it does | Cost |
| :---- | :----------- | :--- |
| **1 · Local rules** | IDN homographs, typosquatting, leet-squatting, brand impersonation, URL structure | offline, zero data sent |
| **2 · Threat intel** | RDAP/WHOIS age, DNS blocklists, URLhaus, Certificate Transparency | network, opt-in |
| **3 · Neural network** | fine-tuned BERT, blended with layer 1 | optional |
| **4 · Page analysis** | login forms on HTTP, credential harvesting, wallet drainers | extension only |

The neural net alone is noisy — it rates `mail.google.com` at 0.98 phishing. So
the score is a **blend**: the deterministic rules floor it when they are certain
it is phishing (a homograph can't be argued down) and cap it when the domain is a
known brand with no red flags (a jumpy net can't block Gmail). The net decides the
uncertain middle, where it catches novel phishing the rules have never seen. This
blend is one function ([`blendWithMl`](packages/guard-core/src/model/blend.ts)),
mirrored in [Python](ml-service/app/model.py) and covered by tests on both sides.

## Development

```bash
bun run dev            # web + API + ML + database
bun run dev:no-ml      # skip the ML layer
bun run test           # server, guard engine, and ML scoring tests
bun run typecheck      # web + API + extension
bun run check:i18n     # English/Russian catalog parity
bun run check:colors   # no color literals outside the theme config
bun run validate:content   # fail on unsourced claims or malformed tasks
bun run build          # production build of web, API, extension
bun run db:reset       # wipe and re-seed the database
```

CI runs client lint/theme/localization checks, type checks, privacy and scoring
tests, `prisma validate`, content validation, and all three production builds.

## Tech stack

| Area | Technologies |
| :--- | :----------- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Radix UI, TanStack Query, Framer Motion |
| Backend | NestJS 10, Prisma 7, PostgreSQL, Passport JWT, Argon2, Helmet, rate limiting |
| Engine | TypeScript, zero dependencies, pure functions |
| ML | FastAPI, PyTorch, HuggingFace Transformers (BERT), tldextract |
| Extension | WXT, React, Manifest V3 |
| Tooling | Bun, Docker, Zod, gray-matter |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the pieces fit together
- [docs/EMAIL_DELIVERY.md](docs/EMAIL_DELIVERY.md) — free SMTP setup for password resets
- [docs/DECISIONS.md](docs/DECISIONS.md) — why the load-bearing choices were made
- [packages/guard-core/README.md](packages/guard-core/README.md) — the engine
- [server/content/README.md](server/content/README.md) — the content format

## License

MIT — see [LICENSE](LICENSE).
