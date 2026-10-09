# Base UI for Solid 2

Base UI for Solid 2 is an unstyled UI component library for building accessible user interfaces, adapted from [React Base UI](https://github.com/mui/base-ui).

An independent, unofficial port by [Unstyled Solid](https://github.com/unstyled-solid/base-ui), not maintained by MUI or the upstream Base UI team. The public package is [`@unstyled-solid/base-ui`](https://www.npmjs.com/package/@unstyled-solid/base-ui); version **0.0.2 is an alpha** targeting **Solid 2.0.0-rc.13**, not Solid 1.

---

## Documentation

To get started, check out the [installation and usage guide](packages/solid/README.md) and the [local documentation website](docs/site/README.md). A hosted documentation website is forthcoming.

```sh
npm install @unstyled-solid/base-ui solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13
```

Use a Solid 2 compiler with `jsxImportSource: "@solidjs/web"`. Components use `class`, native events, and a live `(props, state) => JSX` render callback instead of React element cloning. See the [Solid 2 contract](docs/solid2-contract.md) for framework details.

## Contributing

Propose bug fixes and improvements through [GitHub issues and pull requests](https://github.com/unstyled-solid/base-ui). For the development process and testing contracts, see:

- [Architecture and scope](docs/architecture.md)
- [Solid 2 implementation contract](docs/solid2-contract.md)
- [Toolchain and shared contracts](docs/contracts.md)
- [Parallel execution and ownership](docs/parallel-execution.md)
- [Weekly upstream workflow](docs/upstream-workflow.md)

## Releases

To see the latest updates, check out the [releases](https://github.com/unstyled-solid/base-ui/releases).

## Community

For support, questions, and tips, use the [project on GitHub](https://github.com/unstyled-solid/base-ui).

## Team

This Solid port is maintained independently by [Unstyled Solid](https://github.com/unstyled-solid/base-ui). Credit for the original React library belongs to the [upstream Base UI contributors](https://github.com/mui/base-ui/graphs/contributors).

## License

This project is licensed under the terms of the [MIT license](LICENSE). Adapted from React Base UI **1.8.0**, pinned at `19511bb171f3b360b006c94cf6d07e53cb446505`. See [NOTICE](NOTICE) and [third-party notices](THIRD-PARTY-NOTICES.md) for attribution.
