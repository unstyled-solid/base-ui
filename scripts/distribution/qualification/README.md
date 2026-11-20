# Archive-bound qualification

Generate API Markdown **after** the package build's public-identity declaration
rewrite, then build the docs site and stage Markdown. Run the existing runtime
builder with `BASE_UI_PUBLISH_DOCS=true node scripts/distribution/build/index.mjs`
to restage those docs without regenerating workspace-identity declarations;
stage notices after that runtime build. Pack into a new evidence directory.
Run:

```sh
rtk proxy node scripts/distribution/qualification/run.mjs \
  --tarball /absolute/package.tgz --output /absolute/new-evidence-directory
rtk pnpm test:packed-consumers --tarball /absolute/package.tgz \
  --output /absolute/new-matrix-directory \
  --qualification /absolute/new-evidence-directory/qualification.json
```

The first command executes the six obligations; the second independently reruns
the complete four-peer matrix and validates their archive hash and evidence.
Neither command publishes or silently rebuilds. An audit failure retains logs
and `failure.json`, and does not emit a successful qualification bundle.

* Source/export: pinned upstream entrypoints and recursive exported symbols,
  explicit React-only API dispositions, current generated declarations, every
  production source in all four runtime source-map variants. Symbol accounting
  is not a claim of exhaustive behavioral/source-test parity.
* Markdown: all canonical pages, every declaration module, current generator
  output, versioned manifest, exact packed bytes.
* Notices: immutable donor/source ranges, current review hashes, full original
  license texts, modified-file notices and four-variant archive inclusion.
* Side effects: authored census and reviewed factories, independently installed
  emitted initialization audit, actual zero-retention/root-subpath bundle checks.
* Resources: optimized real ScrollArea/Select, overlapping Dialog/Tooltip owners,
  native global listener cleanup, shared styles/scroll locks, disabled styles,
  CSP nonce and shadow-root lifetime.
* Prehydration: horizontal/vertical × LTR/RTL Tabs and Slider scripts execute
  before the client bundle; Toggle/Tabs clicks and Slider keyboard input replay;
  persistent original hosts survive hydration, scripts retire, client events
  continue, and disposal removes shared styles.

Each gate retains executed assertion IDs, exact ordered subprocess argument
arrays, exit/signal/timeout records, full raw logs and their hashes. No receipt
is inferred from a previously green unrelated suite. The separate integrated
interaction gate remains its own evidence; this runner does not relabel it.

`reconcile-reviewed.mjs` records the one reviewed donor episode. It deliberately
refuses to refresh approval hashes after completion: later drift requires a new
source review, not an automatic ledger update.
