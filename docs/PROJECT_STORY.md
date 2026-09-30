# Safe-Net: project story

## One-minute overview

Safe-Net is a student-built cybersecurity learning product. Its question is not
only “can a URL be labelled suspicious?” but “can a person learn why it is
suspicious and then use the same reasoning while browsing?”

The project joins four pieces that are usually separate: a bilingual LMS,
interactive phishing simulations, a live URL scanner, and a Chrome extension.
The web scanner and extension consume the same TypeScript rule engine. The
optional Python service mirrors the rules and has a selected-case parity check.

## Problem

Most cybersecurity advice is either a static checklist or a black-box warning.
Neither is enough to build judgement. People need a safe place to make mistakes,
receive an explanation, and then recognise the same signal in a real context.

## What I built

- A Russian/English learning flow covering phishing, dangerous links, passwords,
  malware, privacy, and more.
- Server-graded phishing simulations that protect the answer key from the client.
- A shared, dependency-free TypeScript engine for homographs, lookalike domains,
  URL structure, and brand-impersonation signals.
- A Chrome extension that applies the same engine during browsing.
- An optional ML layer whose result is blended with deterministic rules rather
  than replacing them.
- Automated checks for content quality, English/Russian parity, TypeScript
  correctness, and selected TypeScript/Python rule cases.

## Decisions that matter

### Explainability over a score alone

A number without a reason does not teach. The engine exposes signals behind its
verdict, and the learning content uses those signals in context.

### Local-first privacy

The initial URL analysis runs locally. Network-based intelligence and the ML
service are separate optional layers, because a cybersecurity product should not
quietly create a new privacy risk while trying to reduce another one.

### One implementation over duplicated rules

The same `guard-core` package is consumed by the extension and web scanner. This
reduces the chance that a learner is taught one rule but protected by another.
The Python ML service mirrors the blend and has parity checks.

### Content treated as software

Lessons and tests are source files, not opaque database edits. A schema validates
their shape before they are seeded, and the repository checks localization and
content quality alongside code.

## Evidence to inspect

- [System architecture and data flows](ARCHITECTURE.md)
- [Detection engine README](../packages/guard-core/README.md)
- [Content source and format](../server/content/README.md)
- [Evidence and limitations](EVIDENCE_AND_LIMITATIONS.md)
- [Current work ledger](../FIX.md)
- [Repository entry point](../README.md)

## What I would do next

Before presenting Safe-Net as a public security product, I would complete a
production-readiness pass: deploy with real environment configuration, gather
structured usability feedback, publish the extension only after a policy/privacy
review, and measure false positives on a versioned evaluation set.

This is intentionally a concrete next step, not a claim that those milestones
already exist.
