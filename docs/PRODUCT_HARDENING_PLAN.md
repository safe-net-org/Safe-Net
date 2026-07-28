# Safe Net Product Hardening Plan

Status: active
Prepared: 2026-07-26

## Executive verdict

Safe Net has a differentiated core: the course, simulator, web scanner, extension, and ML layer are intended to agree through one detection engine. The weakest parts are not the core idea; they are the trust boundary around it:

- authentication accepts expired tokens and does not fully separate access from refresh;
- optional extension/network processing contradicts the current local-first copy;
- the UI defines theme variables but hard-codes a dark palette across most surfaces;
- consent/legal affordances are not backed by documents or auditable server data;
- client lint and CI coverage are incomplete;
- landing claims, error states, and several admin/dashboard interactions reduce credibility.

The product should be hardened from the inside out: security and truthful behavior first, then the design system and core workflows, then scale features.

## Product context

### Users

1. Learners who want to recognize phishing and unsafe browsing patterns.
2. Administrators who maintain learning content and monitor learner activity.
3. Guard users who want local, explainable URL protection in the browser.

### Primary jobs

- Learn one security rule in plain language.
- Practice it in a realistic scenario.
- Understand why an answer or URL is risky.
- Carry the same protection into real browsing.
- Let an administrator diagnose content and learner issues quickly.

### Product activation

- Learner: starts a course or successfully completes a simulator task.
- Guard: scans a URL locally and understands at least one returned signal.
- Deeper activation: installs and keeps the browser extension enabled.

## Facts, assumptions, and unknowns

### Confirmed facts

- Current validated content: 8 stages, 21 courses, 27 lessons, 163 tasks, 21 tests.
- Supported web locales: English and Russian.
- The deterministic Guard engine works offline and has TS/Python parity tests.
- The app currently uses functional auth, locale, theme/UI, and learning-state storage; no advertising or analytics integration was found.
- The extension can contact third-party intelligence services and an ML endpoint.

### Working assumptions

- This repository is currently a portfolio/product-preview environment.
- Dark theme values must remain visually compatible with the current interface.
- A Notion-inspired light theme means neutral paper-like surfaces, subtle borders, legible text, and restrained elevation—not a literal copy.

### Owner facts required before production

- legal entity, country/address, governing law, and privacy contact;
- target-age/minors policy and any parental-consent requirement;
- hosting regions, subprocessors, retention/deletion/back-up policy;
- production frontend/API domain topology;
- SMTP/email provider and support/security-report channels;
- whether any analytics, marketing cookies, or paid terms will be introduced.

## Goals

- Make authentication enforce expiry, account status, token purpose, and password hashing.
- Make local-only Guard behavior the default and disclose every optional data flow.
- Establish one semantic color configuration and real system/light/dark switching.
- Provide truthful storage notice, Terms, Privacy, Cookies, and Security entry points.
- Record the version, locale, and timestamp of required registration acceptance.
- Improve landing, dashboard, and admin clarity, states, responsiveness, and safety.
- Make English/Russian parity and frontend quality checks release gates.
- Use restrained motion that respects reduced-motion preferences.

## Non-goals for this pass

- Claiming legal compliance or certification without owner facts and counsel.
- Training or selecting a new ML model without a versioned dataset and evaluation plan.
- Inventing analytics, system-health, testimonial, or marketing evidence.
- Building a Chrome Web Store listing.
- Replacing all admin APIs with server pagination in the same visual-foundation change.
- Shipping a new session topology before production domains are known.

## Prioritization model

- **P0 — release blocker:** breaks authentication, privacy promise, data integrity, build gates, or a primary interaction.
- **P1 — launch quality:** meaningful usability, accessibility, trust, localization, or operational weakness.
- **P2 — scale:** important after the product has real users/data volume.

## Now — implemented in this hardening pass

### P0 security and integrity

- Enforce access-token expiration and active-user status.
- Give access and refresh tokens distinct secrets and purpose claims.
- Prevent access tokens from being used as refresh tokens.
- Normalize account email handling and reduce login enumeration.
- Hash profile password changes and require the current password.
- Keep raw reset links/tokens out of production logs.
- Fix the ML test command so regressions cannot be reported as “skipped.”
- Repair client ESLint and add client gates to CI.

### P0 privacy and consent

- Default Guard network enrichment and ML to off.
- Give threat intelligence and ML separate controls.
- Redact URL query values/fragments before optional transmission.
- Stop raw URL logging in the ML service.
- Correct “zero bytes sent” copy to describe local mode precisely.
- Add versioned Terms/Privacy acceptance to registration and persistence.
- Publish localized Terms, Privacy, Cookies, and Security preview documents.
- Add a truthful essential-storage notice; do not present an “accept all” control when no optional web cookies exist.

### P0 interface foundation

- Centralize semantic design tokens.
- Preserve the existing dark values and add a Notion-inspired light palette.
- Add persistent `system / light / dark` switching without a first-paint flash.
- Make toasts and motion follow the resolved theme and reduced-motion preference.
- Fix accidental logout actions and Rules-of-Hooks violations.
- Give the landing hero the correct heading hierarchy and mobile navigation labels.

### P1 core product experience

- Replace unsupported landing claims with measured product facts.
- Add real legal/trust links and current copyright handling.
- Add clear invalid/loading/error/unavailable states to Guard.
- Make optional ML a user-triggered second opinion.
- Mark sideload installation as a developer preview with privacy/permission context.
- Improve dashboard data errors, stat semantics, padding, and notification accessibility.
- Improve admin refresh/error states and remove fake system-health language.
- Add automated English/Russian catalog parity and content checks.
- Localize the extension popup, page warnings, and browser manifest with a
  persisted EN/RU preference and parity gate.
- Move component and chart colors behind the shared theme configuration and
  fail CI when a new color literal bypasses it.

## Next — required before a public production launch

### Authentication and account lifecycle

- Move sessions to server-set HttpOnly cookies or a BFF/in-memory access-token design after production domains are known.
- Add refresh-token rotation, hashed session-family storage, replay detection, and revocation on logout/password reset.
- Add verified email ownership before account activation.
- Configure real SMTP delivery and delivery monitoring.
- Add self-service data export/account deletion and administrator-safe recovery.

### Admin operations

- Add server-side search, sort, filters, and pagination.
- Add an immutable audit log for role, status, content, and destructive actions.
- Prevent the last admin from removing or blocking their own final administrative access.
- Add real service health endpoints and only then surface system status.

### Localization and distribution

- Finish localized API response projections and remove the stale client translation map.
- Self-host fonts and all critical assets for reproducible builds.
- Add version, checksum, changelog, permission rationale, and supported-browser metadata to Guard downloads.

## Later — evidence-led investment

- Establish a versioned ML dataset, time-based holdout, class/source distribution, calibration, false-positive budget, latency budget, and model card.
- Compare model candidates only against the same evaluation contract.
- Add safe telemetry only if a concrete product decision requires it, with explicit purpose, minimization, retention, and opt-out.
- Add cohort/learning analytics after event definitions and privacy review.

## Design system

### Visual direction

- Dark: preserve the existing slate canvas and indigo Guard accent.
- Light: white/paper canvas, warm-neutral raised surfaces, graphite text, subtle borders.
- Typography: UI/system sans for content; mono only for URLs, signals, scores, and build evidence.
- Signature: one URL “signal trace” through the Guard layers.
- Elevation: borders first, shadow only for overlays and one primary floating state.

### Motion contract

- Press/focus: 120ms.
- Hover: 180ms.
- Dialog/page entrance: 240–280ms.
- Primary easing: `cubic-bezier(.22, 1, .36, 1)`.
- Card hover scale: no more than `1.01`.
- All nonessential motion is disabled for `prefers-reduced-motion`.

## Acceptance criteria

### Security

- Expired, wrong-purpose, and blocked-user JWT cases return 401.
- A password updated through the profile path remains an Argon2 hash.
- Registration without current Terms/Privacy acceptance fails validation.
- Production logs contain neither reset tokens nor raw scanned URLs.

### Privacy

- A fresh extension install makes no intelligence or ML request.
- Threat intelligence and ML can be enabled independently.
- Optional network UI names the purpose and data sent.
- `/guard` performs only local analysis until the user requests ML.

### Theme and UX

- `system`, `light`, and `dark` survive reload with no visible theme flash.
- Existing dark surfaces remain visually compatible.
- Light landing, Guard, auth, dashboard shell, and admin shell are readable and coherent.
- Keyboard focus is visible; icon-only controls have accessible names.
- Reduced-motion mode removes ambient/pulsing/staggered movement.

### Localization

- English and Russian message schemas match recursively.
- New trust, theme, legal, Guard, dashboard, and admin strings exist in both locales.
- No user-facing locale regression is introduced in touched files.

### Build and tests

- Client lint and typecheck pass.
- Server typecheck and tests pass.
- Guard and direct ML/parity tests pass.
- Content and Prisma validation pass.
- API, client, and extension production builds pass.

## Rollout and rollback

1. Land token/theme infrastructure with dark compatibility.
2. Land security and privacy defaults with focused regression tests.
3. Land legal/registration contract and additive migration.
4. Land landing/dashboard/admin/Guard copy and state changes.
5. Run the full matrix before deployment.

Roll back UI changes by theme/token layer without reverting the additive consent fields. Security fixes and privacy-default changes should not be rolled back to restore old behavior; fix-forward if integration issues appear.

## Verification matrix

| Surface | Desktop | Mobile | EN/RU | Light/Dark/System | Keyboard | Reduced motion |
|---------|---------|--------|-------|-------------------|----------|----------------|
| Landing | required | required | required | required | required | required |
| Auth | required | required | required | required | required | required |
| Guard | required | required | required | required | required | required |
| Dashboard | required | required | required | required | required | required |
| Admin overview/users | required | required | required | required | required | required |
