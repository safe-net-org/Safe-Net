# Safe-Net: project overview

## In one minute

Safe-Net connects cybersecurity lessons with phishing practice and URL warnings.
The question behind it is whether a learner can use a cue explained in a lesson
when deciding what to do with an unfamiliar link.

The prototype includes English and Russian courses, interactive simulations,
a web URL scanner and a Chrome extension. The scanner and extension use the
same TypeScript rule engine. An optional Python service mirrors the rules;
selected cases are checked for agreement between the two implementations.

## Why build it?

A checklist can explain what to look for. A warning can flag a link. Safe-Net
puts those steps into one learning flow: read an explanation, make a simulated
decision and inspect the reasons behind a warning. Whether this sequence helps
people beyond the examples they practised still needs to be measured.

## What I built

- An English/Russian learning flow covering phishing, dangerous links, passwords,
  malware and privacy.
- Phishing simulations graded on the server, with answer keys excluded from the
  learner's payload.
- A shared, dependency-free TypeScript engine for homographs, lookalike domains,
  URL structure and brand-impersonation signals.
- A Chrome extension that applies that engine during browsing.
- An optional model integration that combines its output with deterministic rules.
- Automated checks for content quality, English/Russian coverage, TypeScript
  correctness and selected TypeScript/Python rule cases.

## Design decisions

### Show the reasons behind a warning

The engine returns the signals behind its verdict. Lessons introduce those
signals in context, so a learner can compare the warning with an explanation
rather than relying on a score alone.

### Run the initial analysis locally

The first URL check runs locally. Network intelligence and the model service
are optional layers, with separate data boundaries. This lets the basic
scanner work without sending a URL to the model endpoint.

### Share the web and extension rules

Both clients import `guard-core`. A change to its rules can therefore reach
both the web scanner and the extension. The optional Python service mirrors
the rules and blend policy, with parity checks for selected cases.

### Version the teaching content

Lessons and tests are stored as source files. A schema checks their shape
before database seeding. Localization and content checks run alongside code
checks, making changes easier to review and reproduce.

## Evidence to inspect

- [System architecture and data flows](ARCHITECTURE.md)
- [Detection engine README](../packages/guard-core/README.md)
- [Content source and format](../server/content/README.md)
- [Evidence and limitations](EVIDENCE_AND_LIMITATIONS.md)
- [Current work ledger](../FIX.md)
- [Repository entry point](../README.md)

## Next steps

Before offering a public security service, I would test the deployed
configuration, gather structured usability feedback and review the extension's
permissions and privacy policy. A versioned evaluation set would let me
measure false positives and document where the detector fails. These steps
are planned; the current evidence covers the local prototype.
