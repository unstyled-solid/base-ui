# Solid 2 RC13: attribution's unstable-output check executes lazy getters outside their owner

## Summary

`@solidjs/signals@2.0.0-rc.13` evaluates property getters while inspecting memo
outputs for `UNSTABLE_MEMO_OUTPUT`. Inspection happens after the memo's compute
owner has been restored. A lazy getter that reads context or constructs JSX can
therefore throw, create unowned computations, or perform unintended work merely
because development attribution is enabled.

This is independently reproduced without Base UI, Vite, the documentation
registry, async imports, or a preview wrapper. It is a development diagnostic
correctness bug, not evidence that the application should eagerly materialize its
children or introduce extra context providers.

**Suggested upstream PR title:**

> fix(signals): avoid evaluating accessors in attribution's unstable-output check

## Versions and affected files

| Package | Reproduced version |
| --- | --- |
| `solid-js` | `2.0.0-rc.13` |
| `@solidjs/signals` | `2.0.0-rc.13` |
| `@solidjs/web` | `2.0.0-rc.13` |
| `@solidjs/vite-plugin` | `3.0.0-next.47` |

Published failing implementation:

```text
@solidjs/signals/dist/dev.attribution.js
  isPlainShape
  shallowEquivalent
  checkUnstableOutput
```

Upstream TypeScript source was found on Solid's **`next` branch**, not `main`:

<https://github.com/solidjs/solid/blob/next/packages/signals/src/core/attribution.ts>

Search that file for `shallowEquivalent` and `checkUnstableOutput` when preparing
the PR. The inspected `next` implementation already uses `Reflect.ownKeys` for
object keys, including symbols, but still directly reads each property value.
Keep that newer symbol-key handling when porting this fix upstream; the local
patch intentionally retains RC13's original `Object.keys` enumeration.

## Why it appears in Vite development

The pinned Vite plugin enables development performance tracks. Those tracks
enable the attribution engine, including the unstable-output checker.

The ordinary test harness did not enable attribution, which explains why
component tests could pass while the documentation development previews failed.
Explicitly enabling attribution under the same Babel test configuration
reproduced the failure.

The observed call chain was:

```text
memo recompute completes
  → attribution.recomputeEnd
  → checkUnstableOutput
  → shallowEquivalent(previousOutput, nextOutput)
  → previousOutput.children / nextOutput.children
  → lazy JSX getter executes
  → component setup or useContext runs outside the intended provider owner
  → ContextNotFoundError / NoOwnerError
```

This is separate from ordinary application reads of `children` under the
renderer’s intended owner. The diagnostic should not introduce those reads.

## Minimal reproduction

Use the browser/development condition for the Solid runtime. The example below
has no Base UI imports and does not require JSX compilation:

```ts
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  flush,
  useContext,
} from 'solid-js';
import { render } from '@solidjs/web';
import { attribution } from 'solid-js/attribution';

const Context = createContext<string>();
let update: () => void = () => {};
let getterReads = 0;

function Probe() {
  const [version, setVersion] = createSignal(0);
  update = () => { setVersion(value => value + 1); };

  const record = createMemo(() => {
    version();
    return {
      get children() {
        getterReads++;
        return useContext(Context);
      },
    };
  });

  // Consume the record, without reading its lazy children property.
  createEffect(record, () => undefined);
  return null;
}

const stopAttribution = attribution.enable();
const host = document.createElement('div');
const dispose = render(
  () => Context({ value: 'provided', get children() { return Probe(); } }),
  host,
);

try {
  update();
  flush();
  console.assert(getterReads === 0, 'diagnostic must not evaluate the getter');
} finally {
  stopAttribution();
  dispose();
}
```

The executable JSX/provider regression used in this repository is
`docs/tests/runtime-probe/context.tsx`; its assertions are in
`docs/tests/runtime-probe/context.test.tsx`. Use those files as the directly
verified reproduction when submitting an issue or migrating the test upstream.

### Expected behavior

- The update completes.
- `getterReads` stays zero: nothing in the example requests `children`.
- Context ownership is unaffected by diagnostic instrumentation.

### Actual behavior in unpatched RC13

- The diagnostic invokes the getter during shallow comparison.
- Getter evaluation occurs outside the expected compute/provider context.
- The context/JSX reproduction throws before its assertion is reached.
- Disabling attribution makes the baseline reproduction pass.

## Root cause

The published comparator contains:

```js
for (const key of keys) {
  if (!(key in b) || a[key] !== b[key]) return false;
}
```

Array comparison similarly uses:

```js
for (let i = 0; i < arrA.length; i++) {
  if (arrA[i] !== arrB[i]) return false;
}
```

Both expressions invoke accessors. An array index may also be an accessor.
Getter results are application behavior, not passive diagnostic metadata.

Wrapping comparison in `untrack` is insufficient: it does not prevent getters
from executing, creating JSX, throwing, or performing other side effects.
Running comparison under an owner likewise still introduces unwanted execution.

## Proposed fix

Inspect **own property descriptors** instead of reading property values:

```ts
function equivalentDataProperty(
  a: object,
  b: object,
  key: PropertyKey,
): boolean {
  const left = Object.getOwnPropertyDescriptor(a, key);
  const right = Object.getOwnPropertyDescriptor(b, key);

  if (!left || !right) return !left && !right;

  return (
    'value' in left &&
    'value' in right &&
    left.value === right.value
  );
}
```

Use this for each object key and array index. Read array length through its own
data descriptor as well. Preserve the existing key-count cap and plain-shape
eligibility rules.

For object key loops, require both descriptors to exist. For the array-index
loop, two missing descriptors represent corresponding holes. Our shared helper
permits two missing descriptors; ordinary enumerated object keys necessarily
have their own descriptors.

### Intentional semantics

- Ordinary data-property comparisons preserve the original `===` comparison.
- **Accessor-bearing shapes return false for this diagnostic heuristic**, even
  if their getter functions have the same identity. Getter identity does not
  establish equivalent return values.
- Equal ordinary objects and arrays still trigger unstable-output warnings.
- Sparse holes are inspected without reading inherited index getters. A hole
  and an explicitly present `undefined` value are conservatively distinguished.
- This changes the *diagnostic's equivalence heuristic*, not memo equality,
  scheduling, context propagation, or renderer behavior.

Property-descriptor inspection is not a universal side-effect-free operation
for arbitrary user-defined Proxies: `ownKeys`, `getOwnPropertyDescriptor`, and
`getPrototypeOf` can have traps. This patch fixes direct getter invocation in
ordinary accessor-bearing records and the transparent prop objects in the
reported reproduction. A broader policy for arbitrary proxies is a separate
maintainer design decision.

## Local pnpm patch

Patch file:

```text
docs/patches/@solidjs__signals@2.0.0-rc.13.patch
```

Registered in `pnpm-workspace.yaml`:

```yaml
patchedDependencies:
  '@solidjs/signals@2.0.0-rc.13': docs/patches/@solidjs__signals@2.0.0-rc.13.patch
```

The lockfile includes the patch identity. A normal frozen install reproduces
the patched package:

```sh
rtk pnpm install --frozen-lockfile
```

The dependency versions remain pinned to RC13. This patch only modifies
`dist/dev.attribution.js`; it does not modify the library’s component code or
disable attribution, performance tracks, warnings, or errors.

`pnpm patch-commit` records a package patch and updates workspace/lock metadata;
it is not a Git commit. No Git commit or upstream PR was made.

## Verification completed

```sh
rtk proxy pnpm exec vitest run \
  --config docs/tests/runtime-probe/vitest.config.ts
```

**8 tests passed, 0 failed.** Coverage includes:

1. Lazy context/JSX record updates without attribution.
2. The same record with attribution enabled.
3. Own object getters, including a shared getter function, are never invoked.
4. Own array-index getters are never invoked.
5. Records with different accessor keys do not evaluate getters.
6. Equal plain objects still emit `UNSTABLE_MEMO_OUTPUT`.
7. Equal ordinary arrays still emit `UNSTABLE_MEMO_OUTPUT`.
8. Changing ordinary data values do not emit that warning.

The warning tests assert the exact structured diagnostic and console count using
the existing harness. They do not globally suppress diagnostics.

After application of the patch, the developer confirmed Avatar, Tabs, and
Accordion work on their fresh local server at `http://localhost:5174`.
The automated post-patch live-site replay was not completed; the existing server
retained optimized dependency caches, and further browser testing was stopped at
the developer’s request. Do not represent this as complete documentation or
component qualification.

After changing a patched dependency, restart Vite with a fresh optimizer run if
an existing server still serves its old dependency bundle:

```sh
rtk pnpm docs:dev --force
```

## Upstream PR preparation

1. Work on the upstream Solid **`next`** branch in your own fork/checkout.
2. Locate `packages/signals/src/core/attribution.ts` and patch the TypeScript
   source, not this repository’s compiled pnpm patch file.
3. Preserve the branch’s `Reflect.ownKeys` behavior, including symbol keys.
4. Add the minimal accessor/context regression to the existing attribution test
   suite. Port the ordinary-object/array warning assertions as well.
5. Add comparator cases for sparse arrays, null-prototype objects, symbol keys,
   differing own keys, and the existing key cap following upstream test style.
6. Run the upstream package’s documented tests, typecheck, and formatter. Use
   that checkout’s actual scripts; this repository’s commands are not upstream
   commands.
7. Include the independently reproduced failure, the side-effect-free intent,
   accessor eligibility decision, and passing warning tests in the PR description.

### Suggested PR description

> Attribution’s unstable-output check currently dereferences properties of memo
> outputs while comparing their shallow shape. That invokes lazy accessors after
> the computation’s owner has been restored. A getter that reads context or
> constructs JSX can throw or create unowned computations solely because
> attribution is enabled.
>
> This change compares own data-property descriptors instead. Accessor-bearing
> outputs are conservatively ineligible for the shallow-equivalence heuristic;
> ordinary data objects and arrays retain unstable-output detection. Regression
> tests cover lazy context getters, object/array accessors, and continued warning
> emission for equivalent ordinary outputs.
