# Component/API parity audit

## Verdict

The implementation is a substantial source-corresponding Solid 2 port of Base
UI, not an unrelated component library. However, **literal complete API parity
is currently false**: an independently reproduced consumer import failure shows
two missing public utility exports. Exported internal entrypoints also differ.
This is a concrete finding, not a hypothetical qualification about test coverage.

No production or test implementation was changed during this audit.

## What was checked

Compared current Solid source against pinned React source in `upstream/base-ui`
at `19511bb171f3b360b006c94cf6d07e53cb446505`:

1. TypeScript module export symbols across all 79 mapped package entrypoints.
2. 258 named `*Props` declarations outside `internals`, `floating-ui-react`, and
   `utils`. This set includes internal helpers located within component families;
   it is not a count of public components.
3. Source explicitly declared prop names against target TypeScript-resolved
   properties, including inherited/intersection properties.
4. Manual resolution of unmatched aliases and the generic `useRender` screen.
5. Current controlled-state, Toggle, Select, direction provider and render-helper
   implementations, plus existing Dialog callback/cancellation/identity tests.

This prop-name audit does not equate different callback types, prove default
values, compare every union/generic restriction, or establish unexecuted runtime
behavior. It distinguishes a broad API presence check from behavioral receipts.

## Positive findings

- All **1,183 upstream root-module export names** were present in the target
  TypeScript symbol view. Target root had 1,194 names. Counts include types and
  namespace symbols, not just runtime components.
- **75/79 entrypoints** had no missing upstream export names. Four paths had
  differences listed below.
- **250/258** screened prop declarations matched by declaration name.
- Five apparent unmatched component declarations are explicit aliases:
  `DrawerCloseProps`, `DrawerDescriptionProps`, `DrawerPortalProps`,
  `DrawerTitleProps`, and `SelectSeparatorProps`.
- The other three unmatched names describe internal implementation helpers:
  `ComboboxItemInnerProps`, `InternalAriaComboboxProps`, and
  `MenuFilterSubmenuNavigationProps`. They are not missing public component parts.
- After resolving target inheritance and aliases, the screen found no missing
  explicitly declared component prop names. An apparent generic `render` miss
  was a checker-screen limitation: `UseRenderComponentProps` explicitly declares
  it at `packages/solid/src/use-render/useRender.ts:9`.
- Current `Toggle.tsx:54-70` implements callback/cancellation/group sequencing
  through a shared request transaction. `createControlled.ts:31-38` invokes the
  current callback before cancellation and local commit.
- `dialog/root/DialogRoot.test.tsx:54-89` specifically covers accepted internal
  notification counts, canceled opening, and live callback replacement.

These findings support the description **“Solid 2 port of Base UI with
framework-native adaptations.”** Internal architectural differences alone do
not invalidate that description.

## Confirmed public utility export omission

Upstream `packages/react/src/direction-provider/index.ts:1` exports:

```ts
export { Provider as DirectionProvider, useDirection, type TextDirection } from './index.parts';
```

Our `packages/solid/src/direction-provider/index.ts:1` exports only
`./DirectionProvider`. That module supplies the provider and its prop/state types,
but does not export `useDirection` or `TextDirection`.

Both definitions already exist in our
`packages/solid/src/internals/direction-context/DirectionContext.tsx:2-5`.
Thus this is public export wiring, not absence of RTL implementation.

An actual TypeScript consumer importing those two names from our public barrel
produced exactly two **TS2305** diagnostics. The public import contract therefore
is not identical today. A future correction can expose the existing definitions;
the Solid hook returns an accessor, which should remain an explicit framework
adaptation rather than a frozen direction snapshot.

## Exported internal-entrypoint differences

The export-symbol audit also found these upstream names absent from their
corresponding target entrypoints:

| Entrypoint | Missing upstream names |
|---|---|
| `internals/field-root-context` | `FieldRootContextType` |
| `internals/useAnchorPositioning` | `useAnchorPositioningWithHook`, `Boundary`, `CollisionAvoidance`, `UseAnchorPositioningReturnValue` |
| `internals/useRenderElement` | `unwrapLazyRenderProp` |

Some differences are framework-specific: React lazy-element unwrapping is not a
Solid rendering contract, and hook injection cannot automatically be treated as
a framework-neutral API. Others are type export/name differences. These require
explicit per-export adaptation decisions; they cannot be described collectively
as identical exports merely because all 79 package paths exist.

The target also exposes extra symbols in several paths. The root's eleven extras
include focus-target types, Menu implementation types/helpers, scroll-area
helpers, Slider `getIndicatorStyles`, and `createRender`. Some are intentional
Solid aliases; others warrant checking whether implementation details were
accidentally exposed. Extra exports are not evidence of a missing behavior, but
they mean the public surface is not an exact copy.

## Framework adaptations already visible in code

- `className` versus Solid `class`.
- React element-valued composition versus live Solid render callbacks.
- Native events and callback refs rather than React synthetic events/ref objects.
- Accessors and staged Solid 2 writes rather than rerendered React hook values.
- Native owner/disposal semantics and separate browser/server compilation.

These are legitimate porting choices. They must be documented when describing
API compatibility, rather than incorrectly counted as dropped component features.

## Behavioral evidence

Existing verified receipts summarized in `docs/work-log.md` establish the tested
behavior, including the repaired PreviewCard listener lifetime and preserved
focus/caret/ownership regressions. This audit did not rerun those suites or
upgrade their scope to universal source-suite equivalence.

The requested future source-shaped parallel suite is the appropriate mechanism
for systematically comparing upstream assertions. No such suite was implemented
as part of this API inspection.

## Reproduction artifacts

Under `/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode`:

- `bsolid-component-contract-audit.mjs`: AST/checker screen and export audit.
- `bsolid-component-contract-audit.json`: complete raw declarations, resolved
  target properties, and per-entrypoint export differences.
- `bsolid-direction-export-proof.ts` and `.mjs`: consumer compilation that
  confirms the missing public exports.

Commands, from repository root:

```sh
rtk proxy node /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-component-contract-audit.mjs
rtk proxy node /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-direction-export-proof.mjs
```

The second command deliberately asserts that the two expected compiler failures
occur; its successful exit confirms the defect, not API parity. This report
describes the code at audit time and must be updated after those exports change.
