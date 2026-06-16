---
name: bonsai-help
description: >
  Quick reference for the bonsai commands and levels. Use when the user says
  "bonsai help", "/bonsai-help", "what are the bonsai commands", or "how does
  bonsai work".
license: MIT
---

Print this reference and stop. Change nothing.

## Levels

- `/bonsai lite` — build what's asked, name the smaller alternative.
- `/bonsai full` — the cut order enforced (default).
- `/bonsai ultra` — YAGNI extremist; ship the one-liner and challenge the rest.
- `/bonsai off` — stop applying bonsai this session.
- `/bonsai` — report the current level.

## Commands

- `/bonsai-review` — review the current diff for over-engineering; delete-list.
- `/bonsai-audit` — same lens across the whole repo.
- `/bonsai-debt` — harvest `bonsai:` shortcut comments into a ledger.
- `/bonsai-help` — this reference.

## The cut order

1. Need it at all? (YAGNI) 2. Stdlib? 3. Native platform? 4. Installed dep?
5. One line? 6. Minimum that works.

Mark deliberate cuts with `// bonsai: <ceiling>, <regrow path>`.
Off-switch: "stop bonsai" / "normal mode".
