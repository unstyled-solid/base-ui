# Bounded accessibility qualification

All commands run from the repository root through RTK. No command installs dependencies or launches a shared browser service. `run.mjs` owns its ephemeral server and browser processes. **Only the coordinator runs it, after archive freeze.**

## Preparation and non-browser checks

```sh
rtk proxy node test/qualification/accessibility/check.mjs
rtk proxy node test/qualification/accessibility/inventory.mjs
rtk proxy node test/qualification/accessibility/report.mjs
```

`check` runs every owned MJS syntax check, Node unit tests, fixture TypeScript checking, and actual upstream source inventory parsing. It exits zero for a valid harness, not release qualification. `inventory` writes only `tracking/qualification/accessibility.json`. `report` exits **1** while coverage/execution is incomplete and writes `.cache/report.json`.

Supply the final packed archive, or an independently installed external consumer:

```sh
rtk proxy node test/qualification/accessibility/prepare.mjs --tarball /absolute/path/to/frozen/baseui-solid2.tgz
# Alternative input, already installed with the exact RC13 peers:
rtk proxy node test/qualification/accessibility/prepare.mjs --consumer /absolute/path/to/external-consumer
rtk proxy node test/qualification/accessibility/check.mjs --prepared test/qualification/accessibility/.cache/prepared.json
```

The archive is extracted into the owned cache and installed at the fixture's `node_modules/baseui-solid2` path. Installed project peers/runtime dependencies are linked without package-manager/network changes. This intentionally exercises the archive's exports and compiled DOM code. Workspace source imports and external consumer links to `packages/solid` are rejected. External consumers must be outside this repository. Identity is the archive SHA256 (tarball input), or the complete installed package file-tree SHA256 (consumer input). Prepared metadata also records peer versions/paths, package digest, fixture digest and resolved exports. `prepare` prints the identity used for `--freeze`.

## Coordinator execution

```sh
rtk proxy node test/qualification/accessibility/run.mjs \
  --prepared test/qualification/accessibility/.cache/prepared.json \
  --freeze REPLACE_WITH_PREPARED_ARTIFACT_SHA256 \
  --output test/qualification/accessibility/.cache/frozen-run

rtk proxy node test/qualification/accessibility/report.mjs \
  --summary test/qualification/accessibility/.cache/frozen-run/summary.json
```

No browser/engine filter exists: 12 scenarios × Chromium/Firefox/WebKit × five environments = **180 required automated rows**. A missing engine generates blocked rows. All runtime warnings/errors fail the row. Checks run first; a syntax/unit/type failure prevents browser startup. Versions, user agents, trusted key events/timestamps, original-host identity, ARIA references, DOM state/geometry, screenshots, focus/caret, cleanup and input stability are recorded. Assertions use actual keyboard dispatch; dynamic removal is a labeled test-driver state update, not claimed as a user gesture.

Environments are default, RTL, reduced motion, forced colors and **CSS layout zoom 200%**. CSS zoom is a useful layout fixture, not native browser zoom/pinch or physical-device evidence. Unsupported forced-colors emulation fails closed. Screenshots and CSS assertions establish this fixture's visibility, not arbitrary consumer color contrast. No axe package is installed; the assertions are explicit keyboard/ARIA/relationship contracts, not an axe or WCAG audit.

`automatedPassed` describes only this bounded batch. `passed` describes full qualification and remains false for unmapped source registrations, unresolved generators/parameter expansions, incomplete family facets, or missing manual evidence. Browser success cannot promote any source/matrix row to pass. Each source outcome needs an exact reviewed assertion mapping; broad file associations in `candidateScenarios` are discovery links only.

## Manual hosting and records

```sh
rtk proxy node test/qualification/accessibility/manual-template.mjs
rtk proxy node test/qualification/accessibility/run.mjs \
  --freeze REPLACE_WITH_PREPARED_ARTIFACT_SHA256 --serve 4317
# After human execution, ingest records without rerunning browsers:
rtk proxy node test/qualification/accessibility/report.mjs \
  --summary test/qualification/accessibility/.cache/frozen-run/summary.json \
  --manual test/qualification/accessibility/.cache/manual-evidence.json
```

`--serve` uses a LAN-accessible address for real devices and prints the localhost URL; use the host's LAN IP on the phone. Do not expose this development host publicly. It performs preflight and starts no Playwright browser. Serving exits red and confers no AT evidence. URLs are `/?scenario=SCENARIO&environment=default` (or `rtl`). Native browser zoom, OS high contrast and screen-reader state are configured manually.

The template contains **35 blocked platform/protocol rows**, including fourteen physical-device rows. See [`docs/accessibility-evidence.md`](../../../docs/accessibility-evidence.md) for exact command sequences and evidence requirements. All-family manual checks need missing family fixtures implemented against the same archive; existing scenes cannot substitute for them. Unsupported or unavailable hardware/AT remains blocked.

## Source denominator

The inventory reads the actual pinned upstream package exports, all component/shared source test/spec files, local conformance helper definitions and screen-reader specs. It includes a Solid-only `filter-dropdown` extension. All registrations are retained conservatively, including non-accessibility tests, because excluding cases by title alone loses composed-state assertions. It records paths/lines, enclosing suites, literal loop/each domains and combinations, skip/todo/conditional registration expressions, generator invocation options, file SHA256 and unresolved dynamic expansion. `literalCaseInstances` is a known subtotal, **not the expanded total**. Generated conformance suites and dynamic parameter domains remain explicit blockers until expanded/dispositioned. No other qualification worker's representative list or pass status is imported.

Acceptance: every family/facet and canonical source outcome must have archive-bound executed evidence or an explicit unresolved blocker; all 180 automated rows and all 35 manual rows must pass; physical rows require physical devices; source and archive/fixture inputs must be stable. The current implementation supplies coherent runnable core coverage and fail-closed accounting; it does not close `bsolid-accessibility`.
