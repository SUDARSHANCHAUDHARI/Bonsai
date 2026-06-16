---
name: bonsai-debt
description: >
  Harvest every `bonsai:` comment in the codebase into a debt ledger, so the
  deliberate cuts and deferrals bonsai leaves behind get tracked instead of
  rotting into "later means never". Use when the user says "bonsai debt",
  "/bonsai-debt", "what did bonsai defer", "list the shortcuts", "bonsai
  ledger", or "what did we mark to do later". One-shot report, changes nothing.
license: MIT
---

Every deliberate bonsai cut is marked with a `bonsai:` comment naming its
ceiling and regrow path. This collects them into one ledger so a deferral can't
quietly become permanent.

## Scan

Grep the repo for comment markers, skipping `node_modules`, `.git`, and build
output:

`grep -rnE '(#|//) ?bonsai:' .`  (add other comment prefixes if your stack uses them)

Each hit is one ledger row. The comment prefix keeps prose that merely mentions
the convention out of the ledger.

## Output

One row per marker, grouped by file:

`<file>:<line> — <what was cut>. ceiling: <the limit named>. regrow: <the trigger to revisit>.`

The convention is `bonsai: <ceiling>, <regrow path>`, so pull the ceiling and
the trigger straight from the comment. Want an owner per row too? add
`git blame -L<line>,<line>`.

Flag the rot risk: any `bonsai:` comment that names no regrow path or trigger
gets a `no-trigger` tag — those are the ones that silently rot.

End with `<N> markers, <M> with no trigger.` Nothing found:
`No bonsai: debt. Clean ledger.`

## Boundaries

Reads and reports only, changes nothing. To persist it, ask and it writes the
ledger to a file (e.g. `BONSAI-DEBT.md`). One-shot. "stop bonsai-debt" or
"normal mode" to revert.
