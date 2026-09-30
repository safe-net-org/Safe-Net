# Dependency advisory policy

CI reads the root `bun.lock` and fails on high or critical advisories in
production dependencies. Dependabot checks Bun, Python, and GitHub Actions
updates. A scanner hit is triaged against the affected execution path before
claiming exploitability.

The root `bun.lock` is authoritative for every Bun workspace. Old nested
lockfiles were removed because they still pinned a vulnerable Next.js build
and could mislead anyone installing from a package subdirectory.

No advisories are currently ignored in the CI command. If an exception is ever
needed, record the advisory ID, affected path, reachability evidence, owner,
review date, and expiry here before adding a narrow `--ignore` flag. Reassess
exceptions at least monthly. Do not use a blanket severity suppression.

The scanner is a gate for known package advisories. It does not validate the
packaged extension, account flows, Python model, or deployment configuration;
those have separate checks and evidence.

## CI repair — 2026-09-30

CI and the root package-manager declaration now use Bun 1.4.2. The older
1.3.3 audit included development tooling in its production report; the
current scanner follows production dependency paths. The severity gate is
still `bun audit --prod --audit-level=high`, with no advisory exceptions.

Axios is updated to 1.20.0 or later, Nodemailer to 10.0.13 or later, and
Argon2 to 0.45.1 or later. The unused `nestjs` placeholder package was removed;
the API uses the official `@nestjs/*` packages. Compatible lockfile updates
also replace affected versions of js-yaml, nanoid, and brace-expansion.

Two overrides are necessary because NestJS 10 packages pin older versions:

- `lodash` 4.18.1 replaces the version pinned by `@nestjs/config` 3.3.0.
- `multer` 2.4.0 replaces the version pinned by `@nestjs/platform-express`
  10.4.22. This stays within Multer 2; the project has no upload interceptors.

Remove these overrides when upstream dependency ranges include patched
versions. A NestJS 11 migration needs a separate compatibility review.

The local production audit passed against the updated lockfile: 463 packages
checked, no high or critical findings, and seven findings below the gate.
This does not mean every development dependency is free of advisories.
Hosted CI results must be checked on the published commit.
