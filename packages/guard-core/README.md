# @safe-net/guard-core

The phishing-detection rule engine. One implementation, three consumers.

## Why this package exists

The engine was implemented twice: once inside the extension
(`entities/analysis`) and once again inside the Guard landing page
(`lib/scoring.ts`). Same heuristics, two copies — and they had already drifted:
the extension had grown leet-squatting detection (`paypa1`, `g00gle`,
`sb3rbank`) that the landing's copy never got. A user reading the marketing
page was being shown a weaker detector than the one that actually ships.

Two copies of a rule is one copy too many. This package is the single source of
truth:

| Consumer | Uses it for |
| :------- | :---------- |
| `extension/` | Scoring every navigation before the page loads |
| `client/` (`/guard`) | The live scanner demo — the page runs the real engine, not a mock |
| Tests | The rules are pure functions, so they are testable without a browser |

That is also the pitch the whole project makes: **the course teaches a rule, the
simulator tests it, the extension enforces it — from one implementation.**
Lesson `03-dangerous-links/01-url-analysis` teaches "read the registrable domain
right to left"; `lib/url-analyzer.ts` is that same rule as code.

## Design constraints

- **No browser or extension APIs.** Nothing here touches `chrome.*` or
  `browser.*`, which is what lets the web app import it unchanged.
- **Pure and synchronous.** `analyzeUrl` + `scoreUrl` take a URL and return a
  verdict. No I/O, no network, no clock. Threat-intel and ML live outside and
  are merged in by the caller.
- **Local-first.** Layer 1 sends zero data anywhere. That is a privacy property
  worth protecting: a tool that inspects every page you visit must not be the
  thing that leaks your browsing.

## API

```ts
import { analyzeUrl, scoreUrl, type AnalysisResult } from '@safe-net/guard-core'

const features = analyzeUrl('https://sberbаnk.ru/login') // Cyrillic 'а'
const result: AnalysisResult = scoreUrl('https://sberbаnk.ru/login', features)

result.score // 0-100
result.level // 'ok' | 'warn' | 'danger'
result.signals // [{ id: 'idn_homograph', severity: 'high', label, description }]
```

## Detection layers

Only layer 1 lives here. The rest are the caller's job:

1. **Local rules (this package)** — IDN homographs, typosquatting by Levenshtein
   distance, leet-squatting, brand impersonation, URL structure. Sub-millisecond,
   offline, zero data sent.
2. **Threat intel** — RDAP/WHOIS, DNS blocklists, URLhaus, Certificate
   Transparency. Network, opt-in.
3. **ML** — `ml-service/`, a fine-tuned BERT. Optional; the extension works
   fully without it.
4. **DOM analysis** — login forms on HTTP, credential harvesting, wallet
   drainers. Extension-only, needs a live page.
