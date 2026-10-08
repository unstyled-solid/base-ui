# Independent archive hydration qualification

Owner: `bsolid-hydration`. Writable paths: `test/qualification/hydration/**` and
`tracking/qualification/hydration.json`. Source baseline:
`19511bb171f3b360b006c94cf6d07e53cb446505`.

## Local checks (no browser, installation or package execution)

Run from `/Users/avi/avir-oss/baseui-solid2`:

```sh
rtk proxy node --test test/qualification/hydration/protocol.test.mjs
rtk proxy node test/qualification/hydration/check.mjs
rtk proxy node --check test/qualification/hydration/run.mjs
rtk proxy node --check test/qualification/hydration/scenarios.mjs
rtk proxy node --check test/qualification/hydration/protocol.mjs
```

The compiler check uses the installed RC13 compiler, erases TS, compiles each
fixture for DOM/SSR in both modes, and parses the result. It is a syntax/compiler
check, **not** an archive typecheck, SSR pass, or hydration pass.

## Exact archive commands

The tarball lane must supply an independent, retained consumer directory installed
from the exact archive. Set `CONSUMER` and `TARBALL` to its absolute paths. The
consumer must contain stock `solid-js`, `@solidjs/signals`, `@solidjs/web`,
`@solidjs/compiler`, `@solidjs/babel-plugin` at `2.0.0-rc.13`,
`@solidjs/vite-plugin@3.0.0-next.47`, `vite@8.3.2`, `typescript@5.9.3`, Node types,
and `playwright@1.63.0` for browser execution. The runner performs no installation
and writes no manifests. `--output` must be a **new** directory inside the supplied
consumer with an existing parent. Do not point it at lane-owned evidence.

Compile/typecheck and bounded Node SSR only:

```sh
rtk proxy node test/qualification/hydration/run.mjs --consumer "${CONSUMER:?set independent installed consumer path}" --tarball "${TARBALL:?set exact stable archive path}" --output "$CONSUMER/hydration-compile-20261006" --phase compile
```

After the coordinator approves the stable archive, compile again and run Chromium:

```sh
rtk proxy node test/qualification/hydration/run.mjs --consumer "${CONSUMER:?set independent installed consumer path}" --tarball "${TARBALL:?set exact stable archive path}" --output "$CONSUMER/hydration-browser-20261006" --phase browser
```

Exit codes: `0` only if **every required row** passes both modes; `1` for a failed
gate; `2` for incomplete qualification. The current five unimplemented obligations
make a full green result impossible, even if the implemented scenarios pass.

## Evidence and architecture

- `report.json`: archive SHA-256, verified installation, toolchain locations,
  per-mode state, all 27 required rows and exact failure evidence.
- `<mode>/types.log`: strict consumer declaration/fixture typecheck, no
  `skipLibCheck` escape hatch.
- `<mode>/modules.json`: separately compiled client/server graph. The server
  externalizes actual installed package exports and RC13; client bundles the
  installed DOM exports. Workspace modules and aliases are prohibited.
- `<mode>/server.log`, `server-evidence.json`: browser-global-free server imports,
  resolved external entries, concurrent request/namespace checks, raw stream chunks
  and shell/settled markup. Raw render evidence is saved before structural assertions.
- `<mode>/build-diagnostics.json`, `browser-evidence.json`: complete build warnings,
  browser console output, page errors, failed requests, scenario results. Warnings
  cause failure; none are muted, pattern-filtered or budget-adjusted.

The runner checks every installed archive file byte-for-byte, rejects workspace
links, snapshots its own sources into the independent consumer output, typechecks
before runtime, and builds each mode separately. It never imports shared harness
fixtures or production source. The server uses actual `renderToString` and
`renderToStream`; `.readable` records an incremental Loading shell. The browser
receives real server HTML over HTTP, executes emitted scripts with a nonce CSP,
records original hosts **before** client code, then explicitly starts hydration.
It does not emulate hydration with `render`, innerHTML reconstruction or warning
suppression. Client-only mounts are used only for nested-root/disposal cases;
RC13 `render` options belong in its fourth argument, `hydrate` options in its third.

## Implemented coverage (execution deferred)

Actual Field/Input/Toggle, Tabs, Dialog, Slider, ScrollArea and Select fixtures
cover generated label/description IDs across roots; overlapping streaming
requests; Loading/Errored; keyed async list held updates; initially open/closed
and retained controls; conditional children; original host identity; trusted
events exactly once; nested roots; repeated owned cleanup and stale async results;
client-only portals, ShadowRoot-owned HTMLElement and iframe-body containers;
Tabs/Slider prehydration and CSP nonce/disabled styles.

Canonical outcomes are mapped in `tracking/qualification/hydration.json`. React
lifecycle mechanics and the React 17 shim are not implementation recipes. The
existing harness fixtures and Dialog family fixture were read as design references.

## Blockers

1. No stable archive/retained consumer has been supplied for execution; all actual
   archive SSR and browser evidence remains pending.
2. Detached-trigger fixture is authored; the source's close-before-delayed-hydration
   identity/replay assertion is not implemented. Its fixture does not count as a pass.
3. Fixture cleanup/event counts do not prove package-wide observer/listener/timer/
   owner reclamation. Deterministic resource instrumentation remains unimplemented.
4. Abandoned-stream/async-iterator-return cleanup remains unimplemented.
5. Private utility explicit ID override/prefix/suffix/multi-IDREF and hydration
   snapshot variants remain blocked. No private/source import is used to bypass
   the public tarball boundary; React 17 shim branches are framework-only unsupported.

The Node tests and compiler check do not close the Beads ticket. Browser mismatches
must be diagnosed from retained markup/diagnostics and returned to their component,
renderer or distribution owner.
