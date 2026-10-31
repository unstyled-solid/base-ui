# Base UI for Solid 2

[![CI](https://github.com/unstyled-solid/base-ui/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/unstyled-solid/base-ui/actions/workflows/ci.yml?query=branch%3Amain+event%3Apush)

Unstyled components for building accessible user interfaces with Solid. Bring your own styles and retain full control over your application's design.

Adapted from [Base UI](https://github.com/mui/base-ui), with native Solid reactivity, events, and composition. Maintained independently by [Unstyled Solid](https://github.com/unstyled-solid).

---

## Getting started

Install the library and its Solid 2 runtime dependencies:

```sh
npm install @unstyled-solid/base-ui solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13
```

```tsx
import { Button } from '@unstyled-solid/base-ui/button';

export function Example() {
  return <Button class="my-button">Click me</Button>;
}
```

**Compatibility:** The current release is an alpha targeting **Solid 2.0.0-rc.13**. Use a compatible Solid 2 compiler with `jsxImportSource: "@solidjs/web"`; Solid 1 is not supported. See the [installation guide](packages/solid/README.md) for toolchain configuration.

## Documentation

- [Installation and usage](packages/solid/README.md)
- [Run the documentation website locally](docs/site/README.md) — hosted documentation is forthcoming.
- [Solid 2 conventions and composition](docs/solid2-contract.md) — `class`, native events, callback refs, and live render callbacks.

The package provides component-level imports, tree-shakeable ESM browser and server modules, and TypeScript declarations.

## Contributing

Bug reports, improvements, and pull requests are welcome. Start with the [architecture guide](docs/architecture.md) and [toolchain contracts](docs/contracts.md) for the development process.

The [CI guide](docs/ci.md) explains how to run the build, type, unit, SSR, browser, and documentation checks locally. The badge above tracks the latest push-triggered CI run on `main`.

For maintenance, see the [upstream update workflow](docs/upstream-workflow.md) and [contribution ownership guide](docs/parallel-execution.md).

## Releases

See [GitHub releases](https://github.com/unstyled-solid/base-ui/releases) for updates and [npm](https://www.npmjs.com/package/@unstyled-solid/base-ui) for published versions.

## Community

For questions, feedback, and bug reports, visit [GitHub Discussions](https://github.com/unstyled-solid/base-ui/discussions) or [open an issue](https://github.com/unstyled-solid/base-ui/issues).

## Acknowledgments

This library builds on the work of the [Base UI contributors](https://github.com/mui/base-ui/graphs/contributors). It is an independent, unofficial Solid port and is not maintained by MUI or the upstream Base UI team.

## License

Licensed under [MIT](LICENSE). Adapted from React Base UI **1.8.0**; see [NOTICE](NOTICE) and [third-party notices](THIRD-PARTY-NOTICES.md) for attribution and source provenance.
