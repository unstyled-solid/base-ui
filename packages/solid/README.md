# Base UI for Solid 2

Base UI for Solid 2 is a library of unstyled Solid components for building accessible user interfaces. You gain complete control over your app's CSS.

[`@unstyled-solid/base-ui`](https://www.npmjs.com/package/@unstyled-solid/base-ui) is an independent, unofficial port of [React Base UI](https://github.com/mui/base-ui), not maintained by MUI or the upstream Base UI team. Version **0.0.2 is an alpha** targeting **Solid 2.0.0-rc.13**, not Solid 1.

## Installation

Install the package in your project directory with:

```bash
npm install @unstyled-solid/base-ui solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13
```

Use a compatible Solid 2 compiler and set TypeScript's `jsxImportSource` to `@solidjs/web`. The pinned Vite toolchain uses `@solidjs/vite-plugin@3.0.0-next.47` with `@solidjs/compiler@2.0.0-rc.13` and `@solidjs/babel-plugin@2.0.0-rc.13`; see the [toolchain contracts](https://github.com/unstyled-solid/base-ui/blob/main/docs/contracts.md) for configuration.

```tsx
import { Button } from '@unstyled-solid/base-ui/button';

export function Example() {
  return <Button class="my-button">Click me</Button>;
}
```

Root imports such as `import { Button } from '@unstyled-solid/base-ui'` are also available. Components use `class`, native events and callback refs. Custom element composition uses a live `(props, state) => JSX` render callback rather than React element cloning; see the [Solid 2 contract](https://github.com/unstyled-solid/base-ui/blob/main/docs/solid2-contract.md).

The package includes tree-shakeable ESM browser and server modules and TypeScript declarations. Like Solid RC13, export conditions prioritize `worker` before `browser`; hydrate in a browser build without a `worker` condition.

## Documentation

See the [documentation website setup](https://github.com/unstyled-solid/base-ui/blob/main/docs/site/README.md) to run the docs locally. A hosted documentation website is forthcoming.

## Questions

For how-to questions, support, and bug reports, use the [project on GitHub](https://github.com/unstyled-solid/base-ui).

## Contributing

Propose bug fixes and improvements through [GitHub issues and pull requests](https://github.com/unstyled-solid/base-ui). Read the [architecture](https://github.com/unstyled-solid/base-ui/blob/main/docs/architecture.md) and [toolchain contracts](https://github.com/unstyled-solid/base-ui/blob/main/docs/contracts.md) to learn about the development and testing process.

## Changelog

Check the [releases](https://github.com/unstyled-solid/base-ui/releases) for updates.

## Roadmap

Feature requests and planned improvements are tracked in the [project on GitHub](https://github.com/unstyled-solid/base-ui).

## License

This project is licensed under the terms of the [MIT license](https://github.com/unstyled-solid/base-ui/blob/main/LICENSE). Adapted from React Base UI **1.8.0**, pinned at `19511bb171f3b360b006c94cf6d07e53cb446505`; see the included `LICENSE`, `NOTICE`, and `THIRD-PARTY-NOTICES.md` for upstream and third-party attribution.

## Security

For security reporting options, use the [project's GitHub security page](https://github.com/unstyled-solid/base-ui/security). Do not disclose sensitive vulnerability details in public issues.
