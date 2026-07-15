# Architecture

Safe-Net is a monorepo of five deployable/loadable pieces that share one thing:
the phishing-detection rule engine. The organising principle is that the same
detection logic teaches, tests, and enforces — so a rule can never mean one thing
in a lesson and another in the tool.

```
                         ┌──────────────────────────────┐
                         │   @safe-net/guard-core        │
                         │   pure TS rule engine         │
                         │   (no browser / node APIs)    │
                         └──────────────────────────────┘
                            ▲            ▲            ▲
             imports  ──────┘            │            └────── imports
                                         │  mirrored (Python)
        ┌──────────────┐        ┌────────┴───────┐      ┌──────────────┐
        │  extension    │        │   client       │      │  ml-service   │
        │  (WXT, MV3)   │        │   Next.js      │      │  FastAPI+BERT │
        │  scores every │        │   /guard demo  │◄─────┤  /predict     │
        │  navigation   │        │   LMS + sim    │      │  blended score│
        └──────────────┘        └────────┬───────┘      └──────────────┘
                                         │ HTTP
                                ┌────────┴───────┐
                                │   server        │
                                │   NestJS+Prisma │
                                │   content, auth │
                                └────────┬───────┘
                                         │
                                ┌────────┴───────┐
                                │   PostgreSQL    │
                                └────────────────┘
```

## The pieces

### `packages/guard-core` — the rule engine
Pure TypeScript, zero dependencies, no `browser.*` or `node` APIs. Given a URL it
returns a 0–100 score, a level, and the signals that drove it. It also holds
`blendWithMl`, the one function that combines the rules with a neural-net
probability. Because it is pure, it runs in the extension's service worker, in a
Next.js server component, and in a plain test with no setup.

### `extension` — SafeNet Guard
A Manifest V3 Chrome extension (WXT). Its `background` service worker scores each
navigation via `guard-core` before the page loads (layer 1), optionally asks the
ML service (layer 3), and reads the DOM through a content script (layer 4). It
re-exports `guard-core` under its own `entities/analysis` path so its many
internal imports resolve unchanged.

### `client` — the web app
Next.js 16. Three surfaces: the **LMS** (stages → courses → lessons → tasks), the
**phishing simulator** (a task type where the learner highlights red flags and the
server grades against an answer key it never sends), and **`/guard`**, a live
scanner that imports `guard-core` directly and enriches it with the ML service.

### `server` — the API
NestJS + Prisma. Owns auth (JWT + refresh, Argon2, rate-limited), the learning
domain, achievements, and the **content pipeline**: lessons live as Markdown/YAML
under `server/content`, are validated by a Zod schema, and are compiled into the
Prisma seed. Content bugs (an unsourced statistic, a task with no correct answer)
fail CI instead of reaching a learner.

### `ml-service` — the neural layer
FastAPI serving a fine-tuned BERT phishing classifier. Its `/predict` blends the
net with a Python re-implementation of the same rules and returns the raw net
probability, the rule score, and which side won — so the blend is transparent.

## Key data flows

**Answering a phishing task.** The client sends the learner's highlighted spans
(text + which field), never red-flag ids. The server compares them against
`meta.redFlags`, which is stripped from the lesson content the client received.
An exact match — every flag found, nothing innocent flagged — is required to pass.

**Scoring a URL in the extension.** `guard-core` scores locally and instantly.
If the ML service is reachable, its raw probability is blended in via
`blendWithMl`; if not, the local verdict stands. The rules override the net at the
extremes and defer to it in the uncertain middle.

**Earning an achievement.** After any progress event, one stats snapshot is
collected in a single batch of queries, and every catalog rule (a pure predicate)
is evaluated against it. The catalog is the single source of truth for codes,
seeded into the DB and imported by the awarding logic, so the two cannot drift.

## Ports

| Port | Service |
| :--- | :------ |
| 3000 | Next.js web app |
| 4200 | NestJS API |
| 8000 | FastAPI ML service |
| 5433 | PostgreSQL (Docker; 5433 to avoid a local 5432) |
