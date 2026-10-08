# @unstyled-solid/base-ui

Unstyled, accessible UI components for Solid 2, based on React Base UI.

## Install

```sh
npm install @unstyled-solid/base-ui solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13
```

## Usage

```tsx
import { Button } from '@unstyled-solid/base-ui';

export function Example() {
  return <Button onClick={() => console.log('Clicked')}>Click me</Button>;
}
```

Component subpaths are also available:

```tsx
import { Dialog } from '@unstyled-solid/base-ui/dialog';
import { Checkbox } from '@unstyled-solid/base-ui/checkbox';
```

This package targets **Solid 2.0.0-rc.13** and uses `@solidjs/web` as its JSX
runtime. Configure `jsxImportSource` as `@solidjs/web` and use a compatible
Solid 2 compiler. It is not a Solid 1 package.

The package includes compiled ESM browser and server modules and TypeScript
declarations. Use `class` for styling and native callback refs.

Exports prioritize `worker` before `browser`, matching Solid 2 RC13: worker
conditions select server modules, browser conditions without `worker` select DOM
modules, and ordinary Node imports select server modules. DOM hydration belongs
in a browser build without a `worker` condition.

The compiled modules support tree-shaking; unused components and optional date
adapters can be eliminated. Component subpaths are available for explicit imports.

## Project

Maintained by [Unstyled Solid](https://github.com/unstyled-solid).
Version 0.0.1 is based on React Base UI 1.8.0 at commit
`19511bb171f3b360b006c94cf6d07e53cb446505`.

## Initial release limitations

The exhaustive upstream source-case audit is incomplete; passing runtime suites
do not establish complete source-test parity.

- Collapsible layout measurement can report `EFFECT_RELAY_TEAR`; this accepted
  diagnostic remains visible.
- WebKit focus restoration uses a MutationObserver fallback whose native
  focus-event ordering still needs investigation.
- Touch/CDP and pointer-lock checks require their supported browser capability
  lanes. Concurrent pointer-lock runs can suffer OS pointer interference.
- Autocomplete WebKit fixtures supply nonzero motion; raw native Safari hover
  behavior remains unverified.
- The date-fns adapter does not offer a configurable default-zone setter.

## License

MIT. See `LICENSE`, `NOTICE`, and `THIRD-PARTY-NOTICES.md` for upstream and
third-party attribution.
