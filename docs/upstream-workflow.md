# Weekly React upstream reconciliation

## Decision
Use a pinned Git submodule at `upstream/base-ui`, branch `master`, URL `https://github.com/mui/base-ui.git`. Our commits record only its gitlink; source files remain byte-identical to upstream. This preserves history and reproducibility with less vendoring churn than a subtree. A wrapper removes routine submodule ceremony.

## Planned commands
These are deliverables of `bsolid-upstream-cli`, not installed commands yet:
```sh
rtk pnpm upstream:init
rtk pnpm upstream:update
rtk pnpm upstream:status
rtk pnpm upstream:verify
```
Bootstrap installs the pinned baseline. `upstream:update` fetches master, freezes a candidate commit and emits the source/test/docs/tooling diff plus reconciliation tickets. It never automatically claims parity or commits code.

## State model
`tracking/upstream.json` records repository URL, branch, baseline source SHA, fetched candidate SHA and **verified parity SHA**. Before the initial port qualifies, verified parity is null. Every reconciliation episode has immutable from/to SHAs and a report hash. Do not move the candidate checkout while an active batch is being implemented; queue a later fetched SHA or ask the coordinator to finish/abort the batch.

Changes are classified by source paths, reverse dependencies and source-to-target manifests. Include renamed/deleted files, tests, exports/types, data/CSS contracts, public docs, license changes, package/compiler inputs and framework-independent utilities. Unknown paths require explicit triage. React-only changes can be no-ops only with recorded reasoning.

Each update creates an epic and dependency-linked tasks, keyed by range and affected owner to prevent duplicate issues. Nonoverlapping owners can reconcile concurrently. Shared utility changes block only actual dependents. Verify impacted tests plus required integration suites; weekly updates after initial qualification include appropriate browser regression checks.

Advance verified parity **only** after every required mapping, task and validation passes for that exact SHA. Record any out-of-scope upstream assets explicitly. Fetch failures, dirty submodules and non-ancestor history stop with actionable output; never force-reset a developer's edits. Keep the previous verified pin usable for recovery, and test interrupted/resumed updates using local fixture repositories.
