# Adopted-source notices and distribution evidence

This is the readable scope companion to `NOTICE`. The release gate consumes
the source-hashed review in `tracking/distribution/donor-notices.json` and fails
on changed or unresolved mappings.

## Source pins and adopted portions

| Source | Exact revision | Adopted portion / target | License |
| --- | --- | --- | --- |
| [Base UI](https://github.com/mui/base-ui/tree/19511bb171f3b360b006c94cf6d07e53cb446505) | `19511bb171f3b360b006c94cf6d07e53cb446505` | Source-derived Solid library; root `LICENSE` is the original full text, Copyright (c) 2019 Material-UI SAS | MIT plus applicable inherited notices |
| [solid-floating-ui](https://github.com/lxsmnsyc/solid-floating-ui/tree/0492e49b746deed543dbc167a9a58ed1210c2393) | `0492e49b746deed543dbc167a9a58ed1210c2393` | `usePosition.ts` lifecycle/getter patterns, `useFloating.ts` virtual reference wrapper, `utils/dpr.ts` rounding; `floating-ui-react/hooks/createFloating.ts`. Informed adaptation, not byte identity or full donor API adoption | MIT, Copyright (c) 2021 Alexis Munsayac |
| [aria-hidden](https://github.com/theKashey/aria-hidden/blob/9220c8f4a4fd35f63bee5510a9f41a37264382d4/src/index.ts) | `9220c8f4a4fd35f63bee5510a9f41a37264382d4` | `markOthers.ts` retains the source URL and modification marker; selective tree/attribute isolation adapted through pinned Base UI, with Solid-side overlapping locks | MIT, Copyright (c) 2017 Anton Korzunov |
| [Adobe React Aria virtual events](https://github.com/adobe/react-spectrum/blob/b35d5c02fe900badccd0cf1a8f23bb593419f238/packages/@react-aria/utils/src/isVirtualEvent.ts) | `b35d5c02fe900badccd0cf1a8f23bb593419f238` | Attributed ancestor of virtual click/pointer predicates, copied through pinned Base UI. Android click/buttons, detail/pointerType and zero/one-size pointer predicates remain; Base UI changed Firefox and added jsdom/desktop/fractional-touch branches. No identity to moving Adobe main is claimed | Apache-2.0, Copyright 2022 Adobe. All rights reserved.; inherited React MIT |
| [Floating UI arrow](https://github.com/floating-ui/floating-ui/blob/38f8b5acc419a286538ce8d7f78c28d58edf6900/packages/core/src/middleware/arrow.ts) | `38f8b5acc419a286538ce8d7f78c28d58edf6900` | Arrow geometry inherited through pinned Base UI's floating-offset-parent fork | MIT, full original text in `notices/floating-ui-MIT.txt` |

## Exact retained texts

The source copies live in `scripts/distribution/notices/licenses/`. The
coordinator's notice stage copies them into `notices/` in the built package.

* `solid-floating-ui-MIT.txt`: byte-identical donor root `LICENSE`.
* `aria-hidden-MIT.txt`: byte-identical root `LICENSE` at the aria-hidden pin.
* `react-spectrum-Apache-2.0.txt`: byte-identical Adobe root `LICENSE` at the
  attribution pin, including its original Appendix copyright.
* `react-spectrum-React-NOTICE.txt`: byte-identical **React subsection** of
  Adobe root **`NOTICE.txt`**, retaining its own `cc7c1ae...` source URL and
  complete Facebook MIT text. Unrelated Adobe/Modernizr/react-window/ICU and
  other notice sections are not attributed to this adopted helper.

Adobe's `isVirtualEvent.ts:15–17` independently points to React
`3c713d513195a53788b3f8bb4b70279d68b15bcc`, lines 74–87. The different
revision in `NOTICE.txt` is retained literally, not silently normalized.
No React runtime dependency is introduced by retaining inherited MIT text.

## Reviewed changes

The approved geometry adaptation uses Solid 2 owned split effects, checked
promise generations, native references, and Base UI readiness/root/tree
contracts. `markOthers` adds conditional ARIA, Base UI markers, shadow/realm
handling, shared attribute locks and idempotent cleanup. Virtual events use
the pinned Base UI branches and native types, with a prominent modified-file
notice and Adobe/React attribution in the source and its packed source maps.

The historical donor map describes planned handoffs. The notice ledger now
records the actual target review separately, including all donor groups,
source/target fingerprints, specific non-adoption reasons and inherited source
ranges. Retained ancestor copies are under `scripts/distribution/notices/sources`.
The auditor rejects changed review inputs and unaccounted inherited attribution.

## Coordinator commands

```sh
rtk proxy node scripts/distribution/notices/provenance.mjs --verify-remote
rtk proxy node scripts/distribution/notices/audit.mjs --reconcile
# After the coordinator's final build:
rtk proxy node scripts/distribution/notices/stage.mjs
rtk proxy node scripts/distribution/notices/stage.mjs --check
# After the coordinator creates the actual tarball:
rtk proxy node scripts/distribution/notices/audit.mjs --tarball path/to/actual.tgz
```

Build/distribution integrator seam: add `notices` and
`THIRD-PARTY-NOTICES.md` to the staged manifest's `files` allowlist and call
the notice stage after build. The archive auditor reads gzip/tar bytes,
checks exact retained texts, manifest identity/exports, adopted DOM/server
modules and their actual `sourcesContent`; it never treats a pack file list
or a checked staging directory as proof of archive inclusion.
