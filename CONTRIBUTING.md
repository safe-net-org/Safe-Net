# Contributing

Thanks for your interest in Safe-Net. This is a monorepo; the important thing to
know before changing anything is how the pieces relate.

## Setup

```bash
bun run setup      # deps, database, migrate, seed
bun run dev        # web + API + ML + database
```

See the [README](README.md) for the full service map and the
[architecture doc](docs/ARCHITECTURE.md) for how they fit together.

## The one rule that matters

**Detection logic lives in `packages/guard-core` and nowhere else.** It is
imported by the extension and the web app, and mirrored in the ML service's
Python. If you change a heuristic, change it there — and update *both* the
TypeScript tests (`packages/guard-core`) and the Python tests
(`ml-service/scripts/test_scoring.py`), because they assert the two
implementations reach the same verdict. A rule that disagrees between the two is
a bug, even if each side passes on its own.

Course content makes the same promise: a lesson that teaches `paypa1.com` is
phishing must not contradict what the detector scores it. If you add detection
that changes a verdict a lesson relies on, check the lesson too.

## Before you open a PR

Run the checks CI runs:

```bash
bun run typecheck          # web + API
bun run test               # server, guard engine, ML scoring
bun run validate:content   # content quality floor
bun run build              # web, API, extension
```

CI runs the same on every push; a red build blocks merge.

## Content

Lessons live as Markdown/YAML under `server/content`, validated by a Zod schema
(see [server/content/README.md](server/content/README.md)). Every factual claim
must cite a source, every task needs a correct answer and per-option rationale,
and difficulty must not decrease across a lesson. The validator enforces all of
this — if `bun run validate:content` passes, the content is well-formed.

## Style

- TypeScript and Python, matching the surrounding code.
- Comments explain *why*, not *what* — especially the non-obvious security and
  scoring decisions.
- Keep functions single-responsibility; the detection engine stays pure (no
  `browser.*`, no I/O) so it runs everywhere and stays testable.

## Security

If you find a vulnerability, please open a private report rather than a public
issue. The project is about security; we take its own seriously.
