# Temporary picomatch security patches

Checked 2026-11-18: GHSA-fc5q-39xc-vjpf (CVE-2026-112366) affects all
published versions through 4.0.7; the advisory lists no fixed release.
Upstream advisory: https://github.com/advisories/GHSA-fc5q-39xc-vjpf

The 2.3.2 and 4.0.7 patches preserve the dependency major versions and extend
the existing repeated-extglob safety guard. Single-branch repeated extglobs
containing an unescaped wildcard star outside a character class are treated
as literal text. This deliberately restricts those glob patterns; ordinary
file globs and literal-only extglob alternatives are unaffected.

CI installs with --immutable, then runs scripts/audit-dependencies.mjs.
The script checks every installed picomatch directory, requires the patch,
and tests risky patterns in timeout-limited subprocesses plus normal globs.
Only after these checks does it allow registry advisory ID 1247710, because
registry version checks cannot recognize local Yarn patches. All other
high/critical findings and audit/network errors still fail the job.

Once upstream publishes a fixed release: update both transitive dependency
chains, remove the picomatch resolutions and patches, then restore the
unfiltered audit command. Reassess this workaround on dependency upgrades.
