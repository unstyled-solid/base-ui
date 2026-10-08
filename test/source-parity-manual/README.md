# Manual source parity inventory

## Purpose and boundary

`ledger.json` is a hand-reviewed, machine-readable comparison of pinned React
Base UI runtime tests with the current Solid 2 tests. Its first completed batch
covers only Separator. The source checkout is `upstream/base-ui` at
`19511bb171f3b360b006c94cf6d07e53cb446505`. No legacy Solid port is an input.

Each direct source registration records its expanded parameter values, actions,
assertions, lane, skip/conditional predicate, matching target and evidence.
Shared helper registrations are separate entries: do not claim them fully
matched until their generated cases and predicates have been expanded and
compared. `targetOnly` lists Solid-specific tests and gives them no upstream
parity credit; these tests must remain in the suite.

Disposition meanings:

- `matched`: target preserves meaningful behavior and assertions.
- `partial`: some meaningful coverage exists but source behavior/assertions
  remain unverified or absent.
- `missing`: no equivalent target behavior was found.
- `unsupported`: source behavior cannot run in the declared target lane, with
  the specific capability/lane limitation explained.
- `not-reviewed`: the source registration has not been inspected; never infer
  coverage from file names or titles.

## Current accounting and limitations

The three direct Separator registrations (default rendering, horizontal, and
vertical) were reviewed against their target assertions. The invocation of the
shared upstream conformance suite is recorded as `partial`: its generated
registrations and helper predicates were not expanded. Thus this ledger is not
a repository-wide parity claim. Other upstream runtime files and all separate
type/spec, browser-only, platform-specific, and other non-runtime inventories
remain unreviewed. Their omission is explicit rather than counted as coverage.

## Extending safely

1. Add a component-family batch only after reading the exact pinned source and
   target tests. Capture source predicates and all loop/table parameter values.
2. Compare action order and assertions, not English titles. Record many-to-one
   and one-to-many mappings explicitly.
3. Keep browser/layout and platform cases in their real lanes. Preserve source
   skips as source metadata; do not turn them into target passes or add skips.
4. Keep non-runtime classes in separate inventory sections. Retain all
   target-only tests.
5. Add target tests only for confirmed gaps. Record the final path/title and
   rerun the narrowest suitable lane.

Exact commands used for this batch:

```sh
rtk pwd
rtk git -C /Users/avi/avir-oss/baseui-solid2 status --short
rtk git -C /Users/avi/avir-oss/baseui-solid2/upstream/base-ui rev-parse HEAD
rtk proxy git -C /Users/avi/avir-oss/baseui-solid2/upstream/base-ui ls-files '*test*'
```

The source and target files were then read directly. No test setup, scripts,
configuration, manifests, production code, or existing tests were changed for
this inventory. Verification command:
`rtk pnpm test:jsdom Separator --no-watch` — passed (2 files, 35 tests passed,
1 harness skip). The skip is test-runner accounting; source upstream skips are
separately recorded per ledger registration.
