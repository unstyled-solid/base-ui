# Parallel execution

## Scheduling
1. Complete **bsolid-bootstrap**: workspace, pinned dependency set, source baseline and frozen structural contracts.
2. Start **bsolid-harness**, distribution contracts, docs inventory and upstream automation independently. Once harness lands, foundation leaves can run concurrently.
3. Start each foundation as soon as its own prerequisites finish. No global foundation epic blocks a ready component.
4. Dispatch component family workers against their individual prerequisites. Within each large family, sequential stages serialize shared-directory writes. Across families, run as many ready workers as capacity allows.
5. Integrate all local exports and replay real cross-family tests. Run final browser/accessibility/SSR/consumer qualification, then release readiness.

Twenty or thirty concurrent workers is a **capacity target**, not permission to bypass dependencies. Alias families genuinely depend on their shared engine: AlertDialog/Drawer on Dialog, Autocomplete on Combobox, ContextMenu/Menubar on Menu. Ready docs, tests, packaging and maintenance work can fill unused component slots.

## Dispatch protocol
```sh
rtk proxy bd ready
rtk proxy bd show <ticket>
rtk proxy bd update <ticket> --claim
```
The coordinator checks all selected tickets' `owns` metadata before dispatch. Give each agent its ticket, shared contracts, dependency results, exact upstream SHA, RTK rule and write allowlist. Prefer separate Git worktrees once a user-authorized base commit exists. Before then, shared-tree execution requires strictly disjoint paths. Agents may not commit unless authorized.

- Root workspace/lockfile/library manifest: bootstrap initially, then `bsolid-dist-contract` integrator.
- Public root barrel/central alias and type wiring: `bsolid-integration` after family outputs are available. Component tests import family-local entries, not an unfinished root barrel.
- Shared behavior interfaces: bootstrap owns structural types; foundations implement them. Missing seams become coordination requests, never competing definitions.
- Docs fragments: component workers own `docs/components/<family>/**`; docs infrastructure consumes them read-only. No concurrent editing of those fragments by docs workers.
- Coverage files: each worker writes only its own family/foundation file; central tooling generates aggregate reports.
- A completed task hands off APIs, files, source/test mappings, checks and deferred final-browser cases. Follow-up stages do not silently change a published interface while consumers run.

## Coordinating a regression investigation

- Assign one owner to a shared regression. Give it the exact failing workload,
  relevant prior attempts, file allowlist, hypothesis and observable finish line.
- Require new causal evidence in progress reports, not a list of commands run.
  After two failed targeted fixes, review the worker's hypothesis/experiment/result
  summary before authorizing another implementation attempt. Do not repeatedly
  send "continue fixing" instructions without inspecting why progress stalled.
- Separate actual product defects from invalid fixture assumptions using the
  pinned runtime and original behavioral contract. A fixture adaptation must keep
  the timing/identity/behavior assertions and prove the property it is testing.
- Use focused tests during diagnosis, then the scoped integrated gate after a
  demonstrated repair. Preserve completed evidence and avoid duplicate concurrent
  suites, overlapping writers, or delegating the same investigation repeatedly.
- Label isolated old-version controls as comparisons; never silently downgrade
  the active checkout. Keep unknown causality explicit until the control proves it.

## Qualification policy
Source test inventory includes test/spec files, parameterized cases, generated conformance suites, skipped/todo cases and environment restrictions. Every case has a target, explicit framework-only adaptation, or open blocker. Contract fixtures permit independent development but never substitute for final tests using real components.

`bsolid-components-complete` is the non-browser integration gate. Browser/layout tests can remain queued there only because dedicated final qualification tickets are mandatory dependencies of release readiness. A failing browser case becomes a concrete correction ticket owned by its component/foundation.
