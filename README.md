# Base UI for Solid 2 — project plan

A fresh port of React Base UI to Solid `2.0.0-rc.13`, with source-tracked weekly updates, generated documentation and a tree-shakeable npm distribution.

**Current state:** research and executable Beads backlog. The component library, upstream wrapper and build commands are implementation tickets, not completed features.

## Start execution

```sh
rtk proxy bd prime
rtk proxy bd ready
rtk proxy bd show bsolid-bootstrap
rtk proxy bd update bsolid-bootstrap --claim
```

- [Architecture and scope](docs/architecture.md)
- [Solid 2 implementation contract](docs/solid2-contract.md)
- [Parallel execution and ownership](docs/parallel-execution.md)
- [Weekly upstream workflow](docs/upstream-workflow.md)

The bootstrap establishes the common contracts and workspace. Foundation lanes then unlock independently owned component work. Documentation and distribution run alongside the port; browser qualification and publication gates come last.

`planning/*.json` preserve the original ticket specifications. Beads holds current issue status and dependency state. `scripts/planning/backlog.mjs` validates the specifications and can create missing records without overwriting existing tickets.

The validated plan contains **11 epics and 108 child tasks**. After foundations, **24 component-family tasks** have no remaining component-to-component prerequisite and can start concurrently. The importer contains explicit coordinator reconciliation rules for cross-shard seams (notably single-owned button behavior); imported Beads descriptions include those corrections.

```sh
rtk proxy node scripts/planning/backlog.mjs
rtk proxy node scripts/planning/backlog.mjs --verify
rtk proxy bd ready --type task
```
