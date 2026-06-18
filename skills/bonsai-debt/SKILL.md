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

## Writing the ledger

Default is report-only. If the user passes `save`, `write`, or `--write` (or
asks to persist it), write the full ledger to `BONSAI-DEBT.md` at the repo root,
overwriting any existing file, then confirm the path. Use this layout:

```markdown
# Bonsai debt ledger

_Generated <date>. <N> markers, <M> with no trigger._

## <file>
- L<line> — <what was cut>. ceiling: <limit>. regrow: <trigger>.
```

Group rows by file, same as the report. Tag `no-trigger` rows so they stand out.
Writing the ledger is the only side effect; never edit the source files.

## Boundaries

Reads and reports only, unless asked to `save`/`write` the ledger (the one
permitted side effect). One-shot. "stop bonsai-debt" or "normal mode" to revert.
