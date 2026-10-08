# Documentation publication assets

Consume `manifest.json`; copy `public/` contents into the site's public output
without changing relative paths. License notices under `/licenses/` are required.
`sourcePublicUrl` describes upstream usage; only non-null `publicUrl` entries
with `publishable: true` are available for this site. Immutable GitHub blob/raw
links identify original sources and must not be used to bypass a blocked asset.

Run from the repository root:

```sh
rtk proxy node docs/content/assets/build.mjs
rtk proxy node docs/content/assets/build.mjs --check
rtk proxy node --test docs/tests/assets/manifest.test.mjs
```

The builder reads the pinned checkout and captured content, checks exact bytes,
and writes only this assets directory. No network or dependency install is used.
Images absent from the original captured catalog have `capturedPath: null`;
their source is the pinned checkout and their publication copy is hashed here.
Deployment `_headers` and `_redirects` are not portable media assets.

## Font evidence and unresolved blocker

Inspected all five actual WOFF2 name tables with fontTools, not filenames alone.
Paper Mono name IDs 0/1/8/9/11/13/14 identify the Paper Mono project, Guido
Ferreyra, Javier Quintana Godoy and Paper, and explicitly state SIL OFL 1.1.
The complete license text was checked against the project's `OFL.txt` at
`e17d7d737987a4595a50cff2cb5ca4b32dbd0b8f`. The local notice uses the exact
copyright from the captured binary. That external revision supplies license
text, not a claim that its current font bytes match Base UI's captured font.

Each Die Grotesk font's IDs 8/11/13/14 identify Klim Type Foundry,
`https://klim.co.nz`, a requirement for the respective Font Licence Agreements,
and `https://klim.co.nz/licences/`. ID 0 says all rights reserved (2025 regular,
2026 bold). The pinned repository contains only its root MIT notice, with no
applicable Klim agreement or redistribution grant. Four font records therefore
remain `NOASSERTION`, unpublished, with null publication paths/URLs.

`/fonts/paper-mono.css` preserves the two original Paper Mono rules, including
415/650 weights and size adjustment. It does not provide or approve a sans-serif
replacement. Complete typography parity remains blocked in
`bsolid-docs-content-font-provenance`: obtain an applicable Klim grant or an
explicitly approved typography adaptation with final visual replay.
Original upstream CSS, fonts, manifest and snapshot remain provenance inputs.
