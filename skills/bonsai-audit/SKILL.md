---
name: bonsai-audit
description: >
  Whole-repo over-engineering audit — the same lens as bonsai-review, applied to
  the entire codebase instead of one diff. Finds reinvented stdlib, dead
  abstractions, dependencies the platform already covers, and config nobody
  sets. Use when the user says "audit the repo", "where is this over-engineered",
  "what can we delete across the project", or invokes /bonsai-audit.
license: MIT
---

Audit the whole repo for over-engineering, not just the current diff. Same tags
and format as bonsai-review, scaled to a codebase.

## Scan

Walk the source tree (skip `node_modules`, `.git`, build output, vendored deps).
Prioritise the heaviest offenders first: large files, deep class hierarchies,
wrapper layers, and any dependency used in one place.

## Output

Group findings by file, one line each, in the bonsai-review format:

`<file>:L<line>: <tag> <what>. <replacement>.`

Tags: `delete:` `stdlib:` `native:` `yagni:` `shrink:` (see bonsai-review).

Lead with the top 10 by lines saved, then the rest. End with the only metric
that matters: `net: -<N> lines possible across <M> files.`

If the repo is already lean, say `Lean repo. Nothing to cut.` and stop.

## Boundaries

Complexity only — correctness, security, and performance go to a normal audit.
Never flag a single smoke test or `assert`-based self-check; that is the bonsai
minimum. Lists findings only, applies nothing. "stop bonsai-audit" / "normal
mode": revert.
