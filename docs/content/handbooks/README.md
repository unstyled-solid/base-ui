# Solid 2 semantic overlay seam

Import `adaptPage` from `docs/content/handbooks/overlays.mjs` and call it on each
generated schema-v1 page before rendering. The ten handbook/overview/utility
pages have section-specific adaptations; the same seam applies native snippet
and prop spelling adaptations to other Solid routes. Upstream release history
passes through unchanged.
The pinned SHA is checked; input records are never mutated. Reapplication is
idempotent.

Render `adapted.ast`, not the original AST or captured source modules. Prose edits
operate on leaves, preserving links, inline code, emphasis and source order.
React ecosystem snippets retain their original React imports and are labeled;
ordinary examples remain visible with native Solid adaptations. The obsolete
React 17/18 ref example is source evidence only, leaving one merged-ref example.
Original provenance, positions and heading IDs remain available. `semanticOverlay.mappings`
records source sections, target AST paths, dispositions and changed source nodes.
`sourceImports`, `sourceNodes`, `sourceHeadings` and `sourceMetadata` are evidence,
not runtime input. Display heading text and metadata use the adapted language.
Use `semanticOverlay.pending` for demo/component-owner replay. Original
`adaptations` remain intact, and `publishable` remains false. Do not treat this
overlay as an approval of unresolved site handlers or component parity.

Framework-neutral prose, CSS and section ordering are retained. React code is
replaced by compiled complete Solid examples or explicit pending notices. This
first overlay does **not** complete source-specific example parity: nested
composition, manual popup unmounting, form integrations and source demo bindings
still need final owner replay. React ecosystem prose is explicitly upstream
context. The source-specific placeholders must be resolved before ticket closure.

Verification:

```sh
rtk proxy node --test docs/tests/handbooks/*.test.mjs
```

Tests cover all ten pinned source pages, immutability, provenance, heading IDs,
absence of React code in display code blocks, actual local API typechecking,
RC13 DOM/server compilation, and Chromium host identity/focus, native enhanced
events and setup-owned ref cleanup after removal. Full route/fragment checking
and complete source-demo playback remain site/docs-complete integration work.
