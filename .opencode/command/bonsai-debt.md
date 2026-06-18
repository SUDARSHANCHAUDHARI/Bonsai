---
description: Harvest bonsai: shortcut comments into a ledger
---

Apply the bonsai-debt skill: scan the repo for `bonsai:` comment markers, list one ledger row per marker grouped by file, tag any marker with no regrow trigger as `no-trigger`, and end with `<N> markers, <M> with no trigger.` If $ARGUMENTS contains `save` or `write`, also write the ledger to `BONSAI-DEBT.md`; otherwise report only.
