---
name: maintain-from-source
description: Use when asked to reconcile upstream Base UI or solid-floating-ui changes, perform a weekly delta migration, or maintain this Solid 2 port's components, foundations, tests, documentation, or distribution from source. Drives immutable Git episodes, right-sized parallel Beads tasks, source-faithful adaptation, and focused verification.
---

# Maintain from source — autonomous delta reconciliation

## Purpose

On a developer's request, reconcile **the changed upstream range** into the existing port. Do not repeat the initial whole-library migration, launch the old fleet indiscriminately, or redesign working architecture. Produce implemented, source-faithful deltas with honest evidence and a resumable episode.

React Base UI is the behavioral authority. The separately pinned `solid-floating-ui` repository supplies owned adaptation material, not a competing product contract. The project's current Solid runtime/declarations govern framework semantics. Source implementation **and relevant source tests** must precede behavioral judgments.

This skill directs parallel execution for an authorized implementation/reconciliation request: use fresh workers for safely independent work, with exclusive file ownership. For review-only or status requests, preserve that narrower scope; do not fetch, change pins, implement, or dispatch fixers without authorization.

## Non-negotiables

- **Mandatory migration method:** load user-level `react-to-solid-v2-port` before source reconciliation, re-porting, or source-fidelity review, and read its relevant `copy-and-adapt`, `testing`, `upstream`, or `documentation` references. Fallback path: `~/.config/opencode/skills/react-to-solid-v2-port/SKILL.md`. Pass this requirement to workers. The canonical project source is the behavioral authority; the skill's bundled historical kit is supporting material, not a replacement source pin.
- Preserve source-shaped code and original tests. Literally copy new upstream implementation/test/helper files into an authorized, no-overwrite target or staging area, then make necessary Solid edits. Existing adapted files receive the actual old/new delta, not wholesale recopy or regeneration. No optional engine/state-machine redesign, arbitrary condensation, or deletion of framework-independent type constraints/JSDoc/notices.
- Read project `AGENTS.md`. Use **RTK for every terminal command**, including worker commands. Prefer wrappers; use `rtk proxy` for unsupported tools and machine-readable output.
- **Never run `ccc index`, initialization, refresh, or automatic rebuilding.** The developer owns indexing; use exact file tools if search would rebuild.
- Keep canonical source contents, reference repositories, and the old Solid port untouched. Only the authorized upstream coordinator may perform the CLI's recorded checkout transitions. Never implement from `../ref/base-ui-solid`.
- Preserve existing tracked and untracked work. Inspect canceled-worker patches before resuming; canceled does not mean no edits.
- No commits, pushes, publishing, release work, or npm-identity decisions without separate explicit authorization. A maintenance request authorizes its source check/update, not publication.
- Beads owns live task status/dependencies. Do not reimport `planning/*.json`, recreate the initial backlog, or write a second live status ledger.
- Prioritize code, meaningful tests, and short handoffs. Reuse the minimum existing episode/mapping/evidence records; do not bury a weekly patch in new inventories or tracking JSON.
- No diagnostic suppression, arbitrary sleeps, assertion removal, fabricated trusted events, unsupported runtime shims, or global type loosening.

## Read only what this delta needs

Start with current `AGENTS.md`, `docs/solid2-contract.md`, `docs/contracts.md`, `package.json`, relevant Beads issues, and the selected source state. For runtime changes, also load the mandatory sibling skill [`solid-v2-runtime`](../solid-v2-runtime/SKILL.md) and consult the V2 docs MCP for the affected semantics. Use actual code over stale planning prose.

| Question / affected area | Read next |
|---|---|
| Fetch, range, resume, locks, candidate, promotion | [upstream-episodes.md](references/upstream-episodes.md) |
| Task size, dependencies, worker interfaces, continuous dispatch | [delta-dispatch.md](references/delta-dispatch.md) |
| Component/foundation semantics, events, forms, focus, geometry, SSR | [runtime-invariants.md](references/runtime-invariants.md) |
| Docs content/site/demos/API, exports/declarations/build, notices | [docs-and-distribution.md](references/docs-and-distribution.md) |
| Check selection, native fixtures, independent oracle, final evidence | [verification.md](references/verification.md) |

Do not read the whole migration transcript for every update. For a specific repeated failure, consult recall. `../mighty-migration-dump.md` records the initial work and child IDs; parent migration session is `ses_ef6ffeaeaffeeOKj6QrOzdVLvf`. Search targeted history, not an entire enormous session. Historical pins, tool paths and passing counts are not today's baseline.

## Execute the requested episode

### 1. Establish scope and current state

From the project root:

```sh
rtk proxy bd prime
rtk git status --short
rtk proxy node scripts/upstream/cli.mjs status --source base-ui --json
rtk proxy node scripts/upstream/cli.mjs status --source solid-floating-ui --json
```

Read the selected state and current CLI rather than assuming historical SHAs or commands. If the developer asks only for Base UI, donor status may inform compatibility but does not authorize a donor update. If they name both, keep two independently identified episodes and a joint integration boundary.

Identify active batches, live workers, dirty source, lock/journal state, current adapted/verified evidence, and inherited blockers. An unqualified baseline is not made qualified by a weekly delta. Preserve known unrelated gaps rather than silently claiming all-source parity.

### 2. Fetch only when requested; freeze before dispatch

Use the existing CLI for the requested source. Read [upstream-episodes.md](references/upstream-episodes.md) first: Base UI and donor have **different checkout policies**.

```sh
rtk pnpm upstream:update --source base-ui
# Only when the donor update was also requested:
rtk pnpm upstream:update --source solid-floating-ui
```

Same-SHA results require no implementation fleet. Active-episode results may queue newer SHAs without moving worker source; finish/resume the actual active range, not the latest branch tip. Never abandon an episode merely to bypass its blockers. Re-read the returned state and immutable report.

### 3. Triage the entire raw diff, then bound the work

Use full recorded `fromSha`/`toSha` objects, report hash and source identity. Read `report.json` plus source-to-target/consumer mappings. Classify each change as:

- runtime behavior / native DOM / accessibility / events / forms / CSS;
- shared API or implementation with downstream consumers;
- tests or generated conformance/parameter changes;
- exports, public types, defaults, data attributes or CSS variables;
- docs prose, demos, assets, routes, semantic overlays or generated API inputs;
- toolchain, dependency, build or upstream test-infrastructure change;
- license/provenance; or
- evidenced no-op, such as React-only machinery without an observable target change.

Include added/deleted/renamed/binary files and unknown paths. Unknown is explicit triage, not automatic exclusion. Static reverse imports are an aid, not complete knowledge of dynamic demos, contexts or reexports.

Trace the **actual affected target and consumers**. Do not port unrelated upstream dependencies/tool versions or restore discarded React utilities just to make literal name comparisons pass. Read the source before assuming a capability is missing.

The inspected fetch report is raw and untriaged; it does not implement automatic semantic task generation. Use existing impact tooling if it now exists; otherwise reconcile through explicit, range-linked Beads tasks. Do not present a planned automation feature as installed.

### 4. Create right-sized owner tasks and dispatch

Use [delta-dispatch.md](references/delta-dispatch.md). The unit is **one coherent behavior/contract and its regression**, not one upstream file, one giant epic, or the entire floating subsystem.

- Handle a tiny straightforward patch directly when delegation would cost more than implementation.
- Parallelize disjoint families, documentation examples and pure leaves as soon as their actual interfaces are available.
- Give a shared seam one owner; serialize downstream edits only when they truly require that contract to land.
- Keep root manifests/lockfiles, generated catalogs, source-state writers and shared barrels single-owned.
- When a worker reveals an additional independent defect, make a bounded follow-up task/fresh worker rather than indefinitely expanding its context.
- Inspect each handoff and relevant changes, then immediately dispatch newly executable work; do not wait for a whole wave.

### 5. Reconcile behavior into existing architecture

Compare old source, new source, existing Solid implementation and new tests. Preserve the source's organization and algorithms except where a specific Solid 2 constraint requires adaptation. Translate lifecycle machinery deliberately, not by replacing the subsystem with an imagined equivalent. Preserve native adaptations and historical source-grounded exclusions unless the new delta genuinely changes their justification. Optional architecture changes require explicit approval; this skill does not authorize them.

Copy/adapt the original source scenarios, parameters, fixtures, assertions and conformance helper registrations; do not substitute a condensed representative suite or merge distinct cases to simplify migration. Preserve public-component integration fixtures rather than silently replacing them with core-engine probes. Supplement with Solid-specific regressions, and explicitly justify unavoidable framework-only adaptations. Do not lower tolerances or rewrite expected behavior until tests pass. A source test change may require target regression coverage even when implementation bytes did not change.

Shared fixes require real consumers; docs changes require real generated pages/examples; signature changes require actual consumers. Avoid duplicate utilities, effect-copied props, ownerless resources and stale same-turn reads. Consult the relevant reference rather than re-deriving the whole migration.

### 6. Integrate affected generated and consumer surfaces

Route root exports, declaration/build maps and package changes through their owner. Regenerate only the outputs genuinely affected, from the right candidate/adapted source inputs. Do not overwrite authored Solid demos/semantic overlays with raw React copies or simply replace source SHA literals to make checks pass.

Read [docs-and-distribution.md](references/docs-and-distribution.md) for the actual content → demo/API → site chain and the source-pinned generation traps. Website work belongs in a requested whole-source delta when affected; do not silently omit it because the initial runtime-review scope excluded the then-unfinished site.

### 7. Verify in widening scopes, then freeze evidence

Use [verification.md](references/verification.md): smallest regression → related source suite/types → real consumers/browser or SSR → applicable combined checks and rebuilt artifacts.

Run native browser verification during weekly maintenance for relevant focus/geometry/touch/animation changes. The initial migration's “browser phase later” policy is not permission to defer every future browser regression.

Bound infrastructure tangents to roughly 15 minutes/two unsuccessful focused attempts, report the exact cause and continue independent work. That limit does not excuse leaving a genuine implementation defect after two failing test runs.

Freeze all source writers before definitive comparisons. Evidence must refer to the exact requested source range, target fingerprint, tools/engines and rebuilt artifacts. Existing uncovered platforms remain uncovered; representative matches do not certify every family.

### 8. Close completed scopes; promote only through a real verifier

Reconcile all diff dispositions, reviews, mapping updates, executed checks and genuine blockers. Close only completed scopes; remaining code defects stay implementation-blocking. For infrastructure-only validation deferrals, explicitly adjust scope and link actual follow-ups to the affected qualification gate.

**Current inspected limitation:** `scripts/upstream/cli.mjs` implements fetch/status/resume/abandon/unlock, but `verify` deliberately fails closed. Do not run it expecting promotion or hand-edit `verifiedParitySha`/`activeEpisode` around it. Implement/use the separately owned verifier only when that is authorized and satisfies the episode lock/evidence contract. Without it, report “delta implemented and tested; formal episode promotion blocked,” retaining the episode and queued state.

Successful fetch is not adoption; candidate is not baseline; local test success is not verified parity. A weekly update is not a release.

## Minimal final handoff

Report, concisely:

1. Source(s), immutable range(s), report identity and target revision/fingerprint.
2. Behaviors/capabilities changed, target paths, intentional native adaptations and evidenced no-ops.
3. Tests actually executed and their exact scope/results; docs/build regeneration when affected.
4. Implementation gaps separately from unexecuted/platform/infrastructure qualification, linked to real Beads IDs.
5. Actual episode/queue/promotion status and any safe next command—not fabricated verification or publication.

The next maintainer should be able to resume the episode without reconstructing worker chats or redoing the initial port.
