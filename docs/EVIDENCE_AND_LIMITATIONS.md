# Evidence and limitations

Status: local verification, 2026-09-30. This is an engineering record, not a claim of measured educational or security effectiveness. No remote release or deployment has been verified.

The full `bun run verify` entrypoint passed on 2026-09-30: typechecks, lint, localization, server regressions (15 suites / 98 tests), Guard/ML/privacy checks, secret-file gate, builds and packaged extension checks. After the final concurrent-progress change, the API build and regression suite were repeated, followed by a fresh isolated PostgreSQL/HTTP run. A hosted CI run has not been observed.

## What was checked locally

| Claim | Evidence | Limit |
| --- | --- | --- |
| The API, web app, extension and rule package typecheck; the web and API build | `bun run check`, `bun run build:api`, `bun run build:web` | A build does not prove the full user journey in a browser. |
| Server regression checks pass | `bun run --cwd server test`: 15 suites, 98 tests | Most tests use mocks; the number is a test count, not a user study. |
| The seeded demo works against a fresh PostgreSQL database | On 2026-09-30, `tools/test-http-integration.cjs` applied all 13 migrations and seed to isolated `safenet_e2e_*` databases. HTTP confirmed anonymous 401, learner/admin separation, two accounts, invalid grading rejection, omitted score 0 and certificate prerequisites. Four concurrent perfect final tests after the six-task course issued one certificate; its owner got 200 and another account 403. Bonus XP equaled the sum of unique achievement rewards. | This does not cover real email delivery or a full browser course journey. HTTP regressions use isolated databases. Separately, the existing local database received all four pending migrations after a private backup; all nine pre-existing users were preserved. |
| New learner can find and start a course in the browser | The local browser logged into a seeded learner, showed the catalog of 21 courses in RU, opened a course and lesson, and entered its simulator. The empty-state catalog link now targets the on-page catalog. | This covers one local browser and seeded demo data, not the full course or reviewer deployment. |
| Simulator can be completed using a keyboard | The RU browser path opened task 5 with Enter, entered four exact phrases through labeled field/phrase controls, and submitted with the explicit button. Feedback said correct and awarded 20 XP; the completed task persisted after navigation. The EN browser path displayed the same controls. | Screen-reader speech output, desktop viewport, mouse selection and every task type remain unverified. |
| Concurrent answers preserve XP and course progress | Isolated HTTP saved both attempts but awarded one task once. Repeating after an API restart awarded 0 XP. Concurrent answers to different tasks in one course left persisted progress and XP equal to the task-attempt totals. Progress snapshots now serialize on the learner row. | This is a functional concurrency regression, not a load test or proof of all progress views. |
| Credential transitions revoke stale sessions and recovery links | HTTP confirmed old access/refresh 401 after password change/reset, logout and block/unblock. Pending email-change links failed after password change/reset. Old mailbox reset/verification links failed after email confirmation. Logout using a consumed refresh cookie revoked the replacement; repeating it preserved a newer login. Unit checks reject a callback whose account version changed before session creation. | Logout deliberately ends all sessions for that account. Real mailbox delivery and browser confirmation UX remain unverified. |
| Rules match across TypeScript and Python on the shared regression corpus | `ml-service/scripts/test_parity.py`: 30 selected URLs compare score, level and signal names | Curated examples are not an independent benchmark or proof of parity for every URL. |
| Rule and optional ML verdict labels use the same score boundaries | TS and Python checks cover 30/31/39/40/69/70/71; the common policy is 0–30 safe, 31–69 suspicious, 70–100 danger | This checks policy arithmetic, not calibrated risk or live ML inference. |
| The packaged Guard starts without a network request in a synthetic browser harness | `bun run package:ext` then `bun run test:package`; the test reads the actual ZIP, verifies SHA-256 and EN/RU catalogs, and observes mocked network calls on navigation | A real Chrome install, upgrade path, permissions and consent interactions remain to be checked. |
| Rules-only regression cases pass | `ml-service/scripts/evaluate.py --mode rules`: 16 curated cases | These cases were selected to exercise known behavior. The 16/16 result is not an accuracy estimate. |

Additional checks on 2026-09-30: a synthetic local learner completed all six
VPN tasks and all eight final-test questions through the browser, saw 100%,
question feedback and a single certificate. A fresh tab retained 6/6 completion;
an incorrect retry did not erase it. Browser regressions exposed hidden course
tab labels, undefined achievement names and undefined total points; those
contracts and labels were fixed. Task completion now comes from server attempts,
with cache reset when accounts change. The check and API/HTTP suites passed.

The old hosted CI logs reported missing `pydantic` and an incompatible Vite
React plugin. CI now installs pydantic and pins Node/Python; a root override
selects React plugin 4.7.0. Frozen installation and extension build succeeded
in an empty local directory. This is still not a new hosted runner result.

Local mail delivery checks are available through `bun run test:mail`; they read
actual EN/RU messages from Mailpit and consume their links through HTTP. See
[local verification](audits/LOCAL_VERIFICATION_2026-09-30.md).

## What has not been established

- No independent, source-separated detector benchmark has been run. The optional third-party BERT checkpoint has not been evaluated here; its upstream metrics are not Safe-Net metrics. See [model card](../ml-service/MODEL_CARD.md).
- No participants have taken a pre/post/delayed study. There are no measured learning gains, false-alarm rates or usability results.
- No reviewer deployment, recorded release demo, delivery into a real user inbox, installed Guard extension, backup restore or production load test has been completed. Local SMTP delivery into Mailpit passed in EN/RU, and the configured Yandex SMTP authentication passed.
- The new EN/RU URL teaching lab uses the local rule engine. Its Russian view and legitimate-subdomain example were checked in a browser; the remaining examples, keyboard journey and screen-reader speech output remain unverified. These are teaching examples, not a sourced benchmark.
- The cross-tab refresh fallback uses browser IndexedDB when Web Locks are absent. It has typechecked but has not been exercised in real browser tabs or private browsing modes.
- Current dependency scanning and CI changes still need a clean hosted runner result. A local build is not that result.
- The current file gate rejects tracked environment/key files and private-key blocks. It is not a history scanner. Historical credentials in earlier revisions have not been verified as rotated on every deployment; do not infer their status from local environment files.

## Authorship and dependencies

The project-specific LMS, content pipeline, phishing simulations, TypeScript URL rules, extension integration, privacy controls and regression checks are implemented in this repository. The optional BERT checkpoint is from `ealvaradob/bert-finetuned-phishing`; Safe-Net did not train that checkpoint. React, Next.js, NestJS, Prisma and other libraries are third-party dependencies.

## Reproduce without changing an existing database

Use `bun run check`, `bun run test`, `bun run package:ext`, and `bun run test:package` for the local code checks. `bun run test` requires the Python environment created by `bun run setup:ml` and fails rather than silently skipping it. For HTTP checks, create a separate empty PostgreSQL database named `safenet_e2e_*`, set `SAFE_NET_TEST_DATABASE_URL` and the two JWT secrets, build the API, then run `bun run test:http`. The test applies migrations and seed; the seed refuses an occupied database and is disabled in production. Never run it against an existing user database.

The certificate uniqueness migration preserves existing records and explicitly stops if duplicate learner/course certificates need reconciliation. The current task ledger, including unfinished acceptance criteria, is [FIX.md](../FIX.md).
