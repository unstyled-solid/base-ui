# Documentation browser replay: library-review handoff

The documentation migration now registers 137 real Solid demos. Five upstream
handbook integrations are explicitly React-only (Motion React, React Hook Form,
and TanStack React Form), with source-linked dispositions. No unresolved demo
references remain. The site, all entries, source readers, and static pages build
and typecheck against the pinned toolchain.

## Reproduce

Start `rtk pnpm docs:dev`, then run:

```sh
rtk proxy node docs/scripts/site/browser-all.mjs
rtk proxy node docs/scripts/site/interactions.mjs
```

Actual diagnostics, failure IDs and browser stacks are retained in
`docs/generated/browser/inventory.json` and `interactions.json`.

## Runtime failures for the separate library reviewer

- Avatar hero: `ContextNotFoundError` while mounting Image/Fallback beneath Root.
- Tabs hero and animated-panels: `ContextNotFoundError` during mount.
- Accordion hero: clicking a trigger throws from `useAccordionRootContext` in
  `AccordionItem`; the source demo supplies the expected Root/Item hierarchy.
- Number Field hero: increment/decrement throws from `useNumberFieldRootContext`
  in `NumberFieldScrubArea`.
- Toast hero: creating a toast throws from `createToastLabelPart` / `useToastRootContext`;
  title renders partially and the dismiss control does not become usable.
- Drawer indent-provider: `NO_OWNER_EFFECT` during preview mount/disposal.
- Menu detached triggers and interactions: `EFFECT_RELAY_TEAR` for
  `createMenuStore.metadataVersion`, with unstable-output/focus diagnostics.
- Autocomplete selection: `EFFECT_WRITES_OWN_SOURCE` for `createPopup.metadata`.

Beads: `bsolid-docs-complete.1`. The docs worker has not changed library runtime
implementations, suppressed diagnostics, or marked these browser checks green.
