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
