# Rendering performance postmortem: the 8ms filtering budget and the graph around it

This report documents the rendering and interaction-performance investigation in
Base UI for Solid 2, principally the work recorded on 2026-10-05–06. It explains
the failures we observed, how we attributed them, the algorithms and data
structures we retained, the experiments we rejected, and what the evidence does
and does not establish.

The runtime was **Solid `2.0.0-rc.13`**. The behavioral reference was React Base UI
at **`19511bb171f3b360b006c94cf6d07e53cb446505`**. Our timings are from the Solid
port, not a before/after React benchmark.

## Contents

1. [Executive summary](#1-executive-summary)
2. [What the 8ms budget actually meant](#2-what-the-8ms-budget-actually-meant)
3. [How we found the causes](#3-how-we-found-the-causes)
4. [Rendering starts before the DOM: live prop composition](#4-rendering-starts-before-the-dom-live-prop-composition)
5. [Reactive graph cuts and ownership boundaries](#5-reactive-graph-cuts-and-ownership-boundaries)
6. [The original filtering algorithm and its cost](#6-the-original-filtering-algorithm-and-its-cost)
7. [Cache invariant comparisons, not mutable labels](#7-cache-invariant-comparisons-not-mutable-labels)
8. [Exact integer encodings of UTF-16 windows](#8-exact-integer-encodings-of-utf-16-windows)
9. [Direct addressing and lazy pages](#9-direct-addressing-and-lazy-pages)
10. [The long-query selection trap](#10-the-long-query-selection-trap)
11. [Reducing scan overhead without changing the API](#11-reducing-scan-overhead-without-changing-the-api)
12. [The virtualizer: derivations versus external observations](#12-the-virtualizer-derivations-versus-external-observations)
13. [The layout feedback loop](#13-the-layout-feedback-loop)
14. [What we rejected](#14-what-we-rejected)
15. [Results and evidence boundaries](#15-results-and-evidence-boundaries)
16. [How we proved correctness](#16-how-we-proved-correctness)
17. [Implementation map and reproduction](#17-implementation-map-and-reproduction)
18. [The general lessons](#18-the-general-lessons)

## 1. Executive summary

There was no single “Solid renders too much” defect. The measured interaction
crossed several different systems:

```text
native input / keyboard action
  → staged component state
  → effective query and filtering policy
  → 10,000 current item labels
  → locale-aware substring matching
  → filtered collection and item count
  → virtual range and total size
  → owned row rendering
  → native layout / ResizeObserver
  → external geometry notification
```

Other components exposed the same underlying distinction between editable state,
derived values, and external observations.

| Observed problem | Cause we established | Retained correction |
| --- | --- | --- |
| Repeated prop-membership work in shared rendering | Nested merged views repeatedly traversed preceding views; reads could subscribe to overridden sources | Flatten consecutive object bags; retain functional boundaries; use rightmost-first membership checks |
| Autocomplete visible/hidden input spreads with 30–32 dependencies | Display consumers inherited completion bookkeeping instead of a shared display result | One owned display memo, with the original display computation unchanged |
| Collection/provider children with approximately 30 hidden sources | Parent child resolution recursively consumed unresolved per-row JSX computations | Resolve children beneath each row's actual owner/provider |
| Avatar loading-status relay | Root mirrored a live image source through additional state publication | Root selects a live image-status accessor; event/request state chooses the source |
| Collapsible dimension relay/recomputation | Multiple readers consumed measurement policy; equal dimensions could be republished | Semantic measurement equality and one shared rendered-dimensions derivation |
| A small WebKit Combobox scenario taking roughly 10ms | Cold `Intl.Collator` construction landed inside the filtering transaction | Owned shared locale/filter setup, separate from query scans |
| Virtualized filtering requiring hundreds of thousands of comparisons | The same substring/query arguments were compared repeatedly | Query-scoped exact whole-window answer caches |
| Remaining short-query scan cost after caching | Repeated substring allocation, hash lookup and per-window strategy decisions | Exact numeric keys, length-specialized loops and short-window direct-address tables |
| An extra expensive Autocomplete selection scan | Full-label queries populated a window map with mostly unique entire labels | Direct native comparison for the single-window long-query case |
| Virtualizer relay, wide dependencies and redundant publication | Derived count was copied into imperative options/revision state; geometry was represented as a revision | Live count getter; semantic external geometry; shared size/range equality |
| Tailwind row sizes growing `64 → 80 → 96px` | Measured border-box height was written back as content-box height | Explicit `box-sizing: border-box` on the measured row |

The final filtering repair passed two fresh Chromium/WebKit replay passes: **20/20
behavior and runtime-diagnostic checks**, with the **8ms per 1000ms compute budget
unchanged**. The earlier rendering repairs also retained callback, identity,
ownership, controlled-input and hydration checks.

This is evidence for those repaired paths. It is not a claim that every component
or browser qualification case in the repository is complete.

## 2. What the 8ms budget actually meant

The important diagnostic was:

```text
[HOT_SCOPE_TIME] memo "createDerivedItems.filtered"
spent 10.0ms of compute inside one 1000ms window (budget 8ms)
```

The budget came from the pinned runtime's development attribution machinery. We
did not invent it in the browser runner, raise it, or disable the warning.

It was a **cumulative compute budget for a reactive scope**, not:

- an 8ms maximum for every individual event;
- an 8ms browser frame budget;
- a measurement of React performance;
- an end-to-end input-latency or production Core Web Vitals result.

A useful model for understanding the diagnostic is:

```text
C(scope, window) = sum of the scope's attributed compute costs in that window

example: 1.7 + 2.0 + 2.1 + 3.0 = 8.8ms
```

Each individual recomputation can look reasonable while the interaction still
crosses the cumulative limit. This is why fixing only the first typed query was
insufficient. The keyboard selection could add another scan inside the same
window.

The original small scenario was also instructive. It involved only
`apple / banana / cherry`, yet WebKit attributed roughly 10ms to filtering.
Profiling showed approximately **9ms in cold collator construction**, while the
first comparison measured approximately zero at the available clock resolution.
The correct diagnosis was setup cost, not “three items need a faster search
algorithm.”

Moving that construction into owned setup removed it from the keyboard filtering
transaction. It did **not** eliminate cold Intl work from the application. The
constructor still existed and was measured in setup.

## 3. How we found the causes

### 3.1 The first evidence was a real interaction, not a synthetic loop

The initial runtime audit drove actual component demonstrations: typing, repeated
clicks, keyboard navigation, selection, hover, press-and-hold, opening and
closing. It checked output and existing-control identity while leaving runtime
diagnostics enabled.

That exposed several different diagnostic classes:

| Diagnostic/evidence | What it led us to inspect |
| --- | --- |
| `HOT_SCOPE_TIME` | Which computation accumulated cost, and which writes caused it |
| `WIDE_SCOPE_DEPS` | Whether a small DOM binding or parent child resolver inherited unrelated state |
| `EFFECT_RELAY_TEAR` / derived-state relay evidence | Whether an effect copied a value that should have been derived directly |
| `WASTED_RECOMPUTE` | Whether inputs changed repeatedly while a downstream semantic result stayed equal |
| `UNSTABLE_MEMO_OUTPUT` | Fresh shallow-equivalent outputs, and whether the diagnostic itself read lazy getters |
| Native ResizeObserver loop errors | A measurement/write feedback loop, not merely reactive scheduling |

A warning was a lead, not an automatic instruction to add a memo or hide a read.
We traced the read path and distinguished real dependencies from accidentally
inherited dependencies.

### 3.2 We separated three measurement modes

**Deterministic work counts.** Tests counted policy reads, locale/cache setup,
native comparator access, native comparisons, `Map.get`/`Map.set`, live label
conversions and downstream publications. These answer questions such as “did the
algorithm still read all current labels?” independently of hardware timing.

**Instrumented browser attribution/profiling.** A disposable Vite mount loaded the
actual demo source. Attribution was enabled before construction. `OBSERVE.records`
captured scope names, causes, dependency counts, self time and total time. A
profiling mode additionally wrapped Intl construction/comparison access and,
where supported, used Chromium CDP CPU/layout metrics and native ResizeObserver
records.

**Final diagnostic-enabled replay without our counters/CPU profiler.** This kept
Solid development attribution and the original workload, but removed the extra
Intl counters and CPU-profiler instrumentation. It was the acceptance replay for
the 8ms issue.

“Uninstrumented” in the historical notes means **without those extra counters and
CPU profiling**, not “production build with no development instrumentation.”

### 3.3 We checked the failing computation's cause chain

The retained small WebKit failure had causes including three
`createControlled.local` writes. In the 10,000-item demonstrations, the important
named scope was again `createDerivedItems.filtered`.

This gave us a specific question: what work happened inside that scope on each
query, and what else subscribed to its output?

The source-only probe recorded:

- actual item counts;
- whether selection browsing was taken;
- native comparison/getter counts;
- constructor and first-comparison timing;
- filtered-scope create/rerun records;
- visible row geometry and original input identity;
- console warnings and page errors.

The virtualized workload opened the popup, filled `9`, `99`, `999`, then pressed
ArrowDown, Enter and Escape. It used the real CSS Modules and Tailwind variants of
both Autocomplete and Combobox. The simple fixture supplied a smaller control
case.

### 3.4 Profiling also exposed a diagnostic correctness defect

One independent RC13 problem was not an application optimization opportunity:
the unstable-output checker evaluated lazy object getters after restoring the
compute owner. A getter that constructed JSX or read context could therefore
execute outside its intended owner merely because attribution was enabled.

```text
memo completes
  → attribution checks output equivalence
  → checker reads output.children
  → lazy JSX/context getter executes under the wrong owner
```

We isolated this without Base UI, Vite, or a preview registry. The documented
reproduction and descriptor-aware remedy are in
[solidjs-rc13-issue.md](../solidjs-rc13-issue.md).

The lesson was important for interpreting the rest of the data: a diagnostic
must not introduce the work it is trying to inspect. Eagerly materializing every
child or adding substitute providers would have hidden the symptom while
changing the application.

### 3.5 A browser-runner failure was not evidence of a Portal memory leak

Separately, browser qualification hit Node socket/JSON-processing out-of-memory
failures around a 4.2GB heap. We did not attribute that automatically to the
component currently under test.

A native `_blank` link could reopen the Vitest tester URL and bootstrap another
tester into the same transport session. Its ready/response traffic recursively
amplified. The retained focused Menu replay had 35 passing assertions but 5,072
unhandled transport errors: passing component assertions clearly did not mean a
healthy test process.

The harness now prevents that auxiliary top-level document from bootstrapping a
second tester, while preserving legitimate iframe/orchestrator requests and
native navigation. Browser files also execute in sequential fresh processes,
with scalar completion receipts that reject crashes/missing execution. The
focused Menu/ToggleGroup replay then had 35 + 52 passes and zero unhandled
errors, without increasing the heap or suppressing errors.

This is recorded in `bsolid-browser.1` and
[runner-navigation.ts](../test/harness/runner-navigation.ts). It belongs in the
investigation's causal history, but it is a test-runner repair—not a filtering
speedup or proof of an application Portal leak.

## 4. Rendering starts before the DOM: live prop composition

Implementation:
[mergeProps.ts](../packages/solid/src/merge-props/mergeProps.ts) and
[createRenderElement.tsx](../packages/solid/src/internals/createRenderElement.tsx).

### 4.1 The hidden cost of composing proxies recursively

A merged prop object is not just a dictionary of final scalar values. It can
contain live getters, event handlers, class/style composition, changing key sets,
and functional stages that transform all preceding props.

An initially convenient representation resembles:

```text
view(view(view(defaults, attributes), interaction), consumer)
```

Enumerating keys, checking membership and requesting descriptors can repeatedly
traverse earlier merged views. A property operation that looks like one lookup
in a caller may actually trigger many underlying proxy traps.

We flattened **consecutive object bags** into one ordered source list:

```text
view(previous, [defaults, attributes, interaction, consumer])
```

Functional stages remain real boundaries:

```text
object run → functional transform → object run → functional transform
```

They cannot be flattened away indiscriminately because a transform may inspect,
replace or derive from its preceding live view.

The deterministic membership benchmark recorded:

| Source bags | Before | After | Reduction in counted work |
| --- | ---: | ---: | ---: |
| 8 | 27,600 | 10,800 | approximately 61% |
| 16 | 176,800 | 40,800 | approximately 77% |

These are operation counts from the retained benchmark, not milliseconds or an
end-to-end rendering speedup. They demonstrate eliminated repeated traversal;
they do not prove every merged operation is now constant-time. A missing-key
lookup can still inspect every source, and composed events/classes/styles can
legitimately consume several bags.

### 4.2 Read precedence must agree with value precedence

For an ordinary property, the rightmost present source wins. The membership
search therefore runs right-to-left as well.

Suppose a consumer supplies `disabled` and overrides an earlier reactive default.
Reading the default's membership first can subscribe the consumer to the default
even though its value is irrelevant. Merely returning the correct final value
does not undo that dependency.

```text
wrong dependency pattern:
  read earlier source → subscribe → discover later override

desired pattern:
  inspect rightmost source → stop at the actual owner
```

This is a dependency optimization rather than a value optimization: both
versions may produce the same DOM today, but only one updates for the correct
reason tomorrow.

### 4.3 Maps and weak brands preserve the live contracts

The merged view retains a map of event-handler wrappers by event key and source
stage. The wrapper reads the current handler **when invoked**, instead of freezing
a callback or allocating a new wrapper for each property read. Composition still
honors native events, bound handlers and Base UI handler prevention.

The foreign reactive proxy identifies itself through Solid's `$PROXY` marker, so
native `merge`/`omit` do not treat its changing keys as a permanently enumerable
plain object. It identifies the merged view itself, not a source's private target.
Conversely, the renderer facade must not forward arbitrary private symbol brands
and let a spread unwrap past the merge rules.

These are representation invariants, not just micro-optimizations. An explicit
`undefined` still masks ordinary defaults; class/style/event composition has its
own rules; getter receivers remain their original source objects; functional
stages retain ordered replacement semantics.

### 4.4 The renderer reads each concern through its own boundary

The renderer separates child resolution from state-attribute computation, caches
merge **construction** rather than eagerly reading every prop, and only projects
controlled values onto actual input/textarea hosts.

In particular, a button sharing a state bag with an input should not subscribe
to the input's value merely because the renderer has a generic value projector.
Likewise, changing a data attribute should not reevaluate a JSX-producing child
getter or recreate the host.

The state-attribute mapper skips a `null`-mapped key **before reading its value**.
Mapping a field to “omit” after reading it would still subscribe to it. This is
an example of reducing the graph's read set without hiding a required dependency.

Native value writes also compare against the current DOM value before assigning.
Writing the same accepted text again is redundant work and can move the caret.
Host/focus/caret preservation was therefore part of the acceptance criteria, not
a cosmetic detail.

## 5. Reactive graph cuts and ownership boundaries

### 5.1 Equality is a semantic graph cut

Consider upstream state `x`, a derived value `y = f(x)`, and several consumers of
`y`. Without a shared boundary, each consumer can inherit the reads of `f` and
recompute when `x` changes even if `y` stays the same.

```text
before: x → consumer A computes f(x)
        x → consumer B computes f(x)

after:  x → shared f(x) → equality boundary → A, B
```

For `R` invalidations and `K` consumers, a simplified cost model is:

```text
without sharing: R × K × cost(f)

with sharing:   R × cost(f) + changedOutputs × downstreamCost
```

The comparison defines which upstream states are observationally equivalent to
the consumers. For dimensions, `(height, width)` matters. For virtual rows, key,
index, start, end, size and lane matter. For display text, the raw displayed value
matters. Ignoring a meaningful field makes the optimization incorrect.

This does not mean “memoize every expression.” A cheap single-reader derivation
often belongs in a plain accessor. We used memos where work was shared,
expensive, often unchanged, or intentionally carried history.

### 5.2 Autocomplete's display boundary

Implementation:
[createAutocompleteInput.ts](../packages/solid/src/autocomplete/root/createAutocompleteInput.ts).

The displayed value depended on typed input, an optional inline completion, and
whether that completion still belonged to the current external-value/inline
permission scope. Visible input, hidden/form controls and context/model readers
all needed the same result.

We retained the original display computation and made it one setup-owned memo.
Repeated completion notifications with the same label could still occur, but
equal display output no longer propagated all completion bookkeeping into every
DOM spread.

An important correctness detail was keeping **completion lifetime separate from
display equality**. A completion stores the identity of its validity scope:

```text
completion = { scope: S1, label: "example" }
```

An external transition `a → b → a` creates new scope identities. Returning to the
same text does not make the old completion valid again. A cache keyed only by the
text `a` would lose this temporal distinction.

The regression used multiple display readers and checked equal-label
notifications, changed display, independent scope retirement, controlled
refusal, native caret behavior and original visible/hidden host identity.

### 5.3 Resolve collection children under the row that owns them

Implementation:
[ComboboxCollection.tsx](../packages/solid/src/combobox/collection/ComboboxCollection.tsx).

A provider's child-resolution machinery can recursively flatten unresolved
callback results. If those results read item/index/context state during that
flattening, the provider-level computation can accidentally inherit the union of
many rows' dependencies.

The command-palette path exposed approximately 30 hidden sources this way.

We resolved each callback's output through `children(...)` **inside its `For`
row owner**, below the real providers. The parent then consumed resolved JSX
rather than pulling the row's hidden computation into its own scope.

This was not a cache of item data and did not add a ref relay. Context lookup and
cleanup stayed with the row. Dynamic index changes still reevaluate the callback
as the public contract requires. We did not impose stronger reorder/host-identity
guarantees than the source API promised.

### 5.4 Avatar: select a source instead of copying its status

Implementations:
[AvatarRoot.tsx](../packages/solid/src/avatar/root/AvatarRoot.tsx) and
[createImageLoadingStatus.ts](../packages/solid/src/avatar/image/createImageLoadingStatus.ts).

The image request already had a status source. Copying that derived status into
Root through an effect created another publication layer and a possible
same-commit mismatch.

The repaired model separates two meanings:

- **which image currently owns Root's status** is event state;
- **that image's current loading status** is read directly from its accessor.

```text
Root status = selectedImageSource()?.() ?? "idle"
```

All image writers use the same request/event boundary. User notification remains
before the staged source/Root projection commits. Cache inspection publishes its
actual initial outcome instead of introducing a transient `loading` event for an
already-complete request.

We preserved the source's unusual multiple-image cleanup rule: cleanup of any
Image resets Root to idle; a later event from a surviving image can reclaim
ownership. “Optimize last-writer ownership” was not permission to change that
observable contract.

### 5.5 Collapsible: measurement is genuinely external

Implementation:
[createCollapsiblePanel.ts](../packages/solid/src/collapsible/panel/createCollapsiblePanel.ts).

Browser `scrollHeight`/`scrollWidth` are external inputs measured after DOM
commit. They should not become an uninvalidated memo that simply reads layout
whenever convenient.

We retained the owned measurement effects, animation frames, cached keyframe
dimensions, interruption handling and cleanup. The measurement signal compares
height and width before publication. A shared `renderedDimensions` memo then
serves the two public dimension readers and suppresses equivalent policy outputs.

The distinction is:

```text
external DOM measurement → signal
signal + motion policy   → shared derivation → height/width consumers
```

Not every signal-writing effect is a bad relay. Recording new external geometry
is legitimate; copying a value already present in the reactive graph usually is
not. The source-browser repeated-motion replay stayed diagnostic-clean without
removing the measurements.

## 6. The original filtering algorithm and its cost

Canonical source:
[React internals/filter.ts](https://github.com/mui/base-ui/blob/19511bb171f3b360b006c94cf6d07e53cb446505/packages/react/src/internals/filter.ts).

For a query of UTF-16 length `q`, the source searches windows of exactly `q`
UTF-16 code units:

```ts
for (let i = 0; i <= label.length - query.length; i++) {
  if (compare(label.slice(i, i + query.length), query) === 0) return true;
}
return false;
```

Let:

- `N` be the number of candidate items;
- `L_i` be the current length of label `i`;
- `W_i = max(0, L_i - q + 1)` be its possible windows;
- `M = Σ W_i` be the no-match upper bound on visited windows;
- `C_cmp` be the cost of one native comparison;
- `C_label` be the cost of reading/converting a current label.

A simplified no-match scan cost is:

```text
T_original ≈ N × C_label
           + M × (C_slice + C_compareAccessor + C_cmp)
           + policy/iteration overhead
```

For roughly equal label lengths, `M ≈ N × (L - q + 1)`. Early matches and limits
reduce actual visits, but repeated queries can still accumulate substantial work.

### Virtualization does not remove this term

Virtualization limits how many options are mounted. It does not determine which
of 10,000 candidates match the current query.

```text
rendered rows: approximately visible rows + overscan
searched items: potentially the entire 10,000-item collection
```

The four demos use 10,000 labels of the form `Item 0001` through `Item 10000`.
For the three queries in the probe, the matching counts can be derived:

```text
"9":   10^4 - 9^4 = 3439

"99":  3 × 100 - (10 + 1 + 10) + 1 = 280
         three positions; subtract pair intersections; restore triple intersection

"999": 10 + 10 - 1 = 19
         positions 0 and 1 within the four-digit block; 9999 overlaps
```

The `10000` label adds no match for these queries, and the omitted `0000` adds no
match either. The final replay observed `aria-setsize="19"` after filtering to
`999`, while retaining the original input and nonzero visible-row geometry.

### Locale-aware search is not ordinary normalized substring search

Defaults include `usage: 'search'`, `sensitivity: 'base'` and
`ignorePunctuation: true`. But those options apply to the **whole window passed
to Intl**. They do not authorize transforming the entire label first.

For example, the retained source contract includes:

```text
contains("a-b", "ab") = false
```

Its two-unit windows are `a-` and `-b`; neither is the window `ab`. Stripping
punctuation from the whole label would change the result.

The same constraint applies to Turkish casing, combining marks, contractions,
surrogate pairs and even isolated surrogate halves. Positions and lengths are
UTF-16 code units, not grapheme clusters. We preserved that algorithm rather than
substituting Unicode normalization or character-wise collation.

## 7. Cache invariant comparisons, not mutable labels

Implementation:
[internals/filter.ts](../packages/solid/src/internals/filter.ts).

### 7.1 The invariance we exploited

Within one matcher, the collator configuration and query are fixed. Therefore:

```text
answer(window) = [ compare(window, fixedQuery) === 0 ]
```

is reusable whenever the same exact window appears again.

If there are `M` visits but only `U` distinct candidate windows, native comparison
work can fall from approximately `M` calls to at most `U` misses in the cached
strategies. The revised model is:

```text
T_cached ≈ N × C_label
         + M × C_lookup
         + U × (C_materializeWindow + C_cmp)
         + cache initialization and iteration costs
```

The traversal is still necessary. We changed the expensive operation count, not
the fact that a required scan must examine its candidates.

### 7.2 A deterministic 60,000-to-2 example

Search 10,000 current labels `aaaaab` for `z`:

```text
original: 10,000 × 6 = 60,000 native comparisons

cached: compare("a", "z") and compare("b", "z") = 2 comparisons

current label conversions in both cases = 10,000
```

That is **30,000 times fewer comparisons in this deliberately repetitive
example**, not a 30,000× application speedup. String conversion, traversal,
lookup, rendering and layout do not disappear.

The regression repeats this principle for query lengths 1, 2, 3 and 4 and proves
that converters still run 10,000 times. It then mutates an item's label and
checks that the next match sees the mutation.

### 7.3 Cache lifetimes and representation

There are separate lifetimes:

1. The existing locale/options `Map` caches filter objects, as upstream already
   did. A cache hit still has cache-key construction cost unless the caller shares
   its policy setup.
2. `createFilterMatcher(...)` creates a fixed-query matcher for a scan. It keeps
   comparison answers, not item objects or an item-to-label mapping.
3. Public `contains(...)` retains only its latest-query matcher, supporting
   Autocomplete's wrapper path without an ever-growing query-history cache.

A private `WeakMap` associates known native filter objects and their `contains`
functions with the already-bound comparator. Arbitrary custom filters are not
guessed to be pure or replaced with our native matcher. Their behavior and
invocation contract remain intact.

We resolved `collator.compare` once. Intl exposes an already-bound function
through a getter: repeatedly accessing it is unnecessary, but it is inaccurate
to claim every accessor read necessarily creates a new bound function.

### 7.4 Reentrancy is part of the proof

A converter can call `contains` recursively with a different query. That changes
the filter object's latest-query slot.

The outer call must capture its matcher **before** invoking the converter:

```text
outer captures matcher for Q1
  → converter calls contains(..., Q2)
  → latest slot now belongs to Q2
  → converter returns current label
outer continues using its captured Q1 matcher
```

The cache is an optimization only if this remains equivalent to independent
native comparison. We added explicit reentrant-converter regressions rather than
assuming callbacks could never reenter the filter.

### 7.5 Memory is a tradeoff, not magic

Caches retain candidate-window representations for their lifetime. They do not
retain item identity or stale converter results. String-backed windows can still
have engine-dependent backing-storage behavior.

For largely unique windows, caching may do nearly as many native comparisons as
the original algorithm while adding lookup/insertion work. The short-window
tables have explicit capacity costs; longer and non-ASCII map paths can grow with
the number of distinct visited windows. “One query at a time” does not imply a
constant-memory algorithm for every possible label corpus.

## 8. Exact integer encodings of UTF-16 windows

JavaScript string units lie in `0..65535`, so each UTF-16 unit has 16 bits of
information. Instead of allocating a new substring for every cache lookup, short
windows can be encoded exactly as numeric keys.

### 8.1 One unit

```text
key(u) = u
domain size = 2^16 = 65,536
```

The implementation uses a `Uint8Array(65536)`: **64KiB** of answer storage.

### 8.2 Two units

Mathematically:

```text
key(u, v) = u × 2^16 + v
domain size = 2^32
```

The fallback implementation uses:

```ts
(first << 16) | second
```

JavaScript bitwise operations return signed 32-bit values. Keys with the high bit
set become negative, but that is still a one-to-one representation of the
32-bit patterns. `Map<number, boolean>` can distinguish them exactly.

This is an **encoding**, not a lossy hash. There are no collisions between
different two-unit windows.

### 8.3 Three units

```text
key(u, v, w) = u × 2^32 + v × 2^16 + w

maximum = 2^48 - 1
        = 281,474,976,710,655
```

JavaScript Numbers exactly represent integers through `2^53 - 1`, so all 48 bits
fit without `BigInt` or loss of precision.

The code uses multiplication for this key:

```ts
first * 4294967296 + second * 65536 + third
```

It cannot use `first << 32`: JavaScript bitwise shifts are 32-bit operations and
mask the shift count modulo 32.

Again, the encoding is exact. The independent corpus includes high UTF-16 units,
surrogates and boundary values, plus 2,048 distinct keys per tested pair/triple
strategy.

### 8.4 Why we stopped this encoding at three units

Four units need 64 bits. A general four-unit integer encoding no longer fits in a
Number's exact-integer range. We did not invent an approximate key and risk
collisions; the general path retains exact string keys.

## 9. Direct addressing and lazy pages

Numeric map keys removed substring allocation on cache hits, but short-query
scans could still perform many hash-table reads. Common labels contain a small,
repeated ASCII window domain. That domain permits direct addressing.

### 9.1 Three-state bytes

Each table slot records:

```text
0 = not compared yet
1 = compared; not equal
2 = compared; equal
```

The zero-filled typed array supplies the “unknown” state without a separate
presence map. Both true and false results are cached. A slot's first miss still
calls Intl on the entire original window.

We used one byte per answer rather than a custom bit-packed representation. This
gives simple indexed loads/stores; minimum theoretical bit count is not the only
performance consideration.

### 9.2 ASCII pairs: a perfect address

For units `a,b < 128`:

```text
index(a,b) = a × 128 + b = (a << 7) | b
capacity = 128^2 = 16,384 entries = 16KiB
```

The ASCII test is `(first | second) < 128`, which checks that neither unit has bits
outside the seven-bit domain. Non-ASCII windows use the exact full-UTF-16 numeric
map described above.

The query does **not** need to be ASCII. We are addressing the candidate-window
domain, not assuming anything about the answer. Intl can decide that an ASCII
candidate is equal to a non-ASCII query under the selected locale/options, and
that exact result is what the byte stores.

### 9.3 ASCII triples: why one giant table was unattractive

A dense three-unit ASCII table would require:

```text
128^3 = 2,097,152 one-byte entries = 2MiB per matcher
```

Creating/zero-initializing that much storage for each three-character query is
wasteful for small lists or restricted label alphabets.

We split the address into a page and an offset:

```text
page = first unit
offset = second × 128 + third

pages[first][offset]
```

Each page is **16KiB**, allocated only when that first unit is actually seen. If
the scan encounters `P` distinct leading ASCII units, the answer storage is:

```text
P × 16KiB, where 0 ≤ P ≤ 128
```

The worst case still reaches 2MiB, but a scan touching ten leading units allocates
160KiB instead of eagerly initializing 2MiB. The outer sparse page array supplies
a cheap first-level presence check.

This is the same broad space/time idea as a sparse page table: split a bounded
address into directory and page-local coordinates, allocate touched regions
instead of the entire address space.

### 9.4 Strategy selection happens once per matcher

The factory chooses separate loops for query lengths 1, 2, 3 and greater than 3.
It does not ask the query length at every candidate window.

This removed repeated strategy decisions and separated typed-array operations
from map operations. Pair keys are 32-bit patterns; triple fallback keys need the
exact 48-bit Number representation. Keeping these paths separate was part of the
measured optimization.

We did not collect JIT deoptimization traces. The loop specialization is an
implementation fact and its workload improvement was measured; claiming a
specific engine deoptimization was proved eliminated would go beyond the
evidence.

### 9.5 Exact substring success is a safe early exit

The matcher first checks `text.includes(query)`. If the exact query occurs, one
of the source's fixed-width windows is exactly the query, and comparing a string
to itself yields equality. That shortcut is safe.

If exact inclusion fails, the matcher still searches for locale-aware equality.
We did not replace Intl with `includes`, lowercasing, accent removal or per-unit
equality.

### 9.6 What the lookup regression proved

For 10,000 calls each to pair/triple matchers over `aaaaab`:

```text
pair windows:   5 per call
triple windows: 4 per call
total visits:   10,000 × (5 + 4) = 90,000

Map.get calls on the ASCII paths: 0
```

The table paths still perform indexed lookups; “zero Map reads” does not mean
zero work. The same regression then supplies non-ASCII pair/triple windows and
observes the two expected fallback map reads.

## 10. The long-query selection trap

The initial short-query improvements made Combobox clean, but Autocomplete could
still cross the budget when Enter replaced the typed query with a full label.

At one intermediate stage:

```text
rapid three queries: approximately 5.6–5.8ms cumulative
selection-label scan: approximately 2.8–3.1ms additional
full workload:        approximately 8.4–8.9ms, still above 8ms
```

For a long query with `label.length === query.length`, there is exactly one
window. Building a map entry for every mostly unique full label has little
reuse value:

```text
old shape:
  full label → lookup → compare on miss → insert → return answer

retained shape:
  exact includes shortcut, otherwise compare full label directly
```

The current code applies this branch in the `query.length > 3` strategy. A label
longer than the query still needs the normal exact sliding-window search.

The regression tests 10,000 full-label candidates against `Item 0999`, finds one
match, and records **zero substring-map insertions**. This removes cache
maintenance for the one-window case; it does not remove the required comparisons
against other current labels.

There is a deliberate tradeoff: mostly repeated equal-length labels might benefit
from a full-label map, while mostly unique labels pay its overhead. We retained
the direct branch because it addressed the measured selection workload. It is
not a universal theorem that maps should never cache complete strings.

The final recorded selection scan was approximately **1.3–1.5ms**, compared with
roughly 3ms in the earlier development-attribution run.

## 11. Reducing scan overhead without changing the API

Implementation:
[createDerivedItems.ts](../packages/solid/src/combobox/root/createDerivedItems.ts).

### 11.1 Hoist per-query policy out of per-item work

`getFilter(...)` already cached collators, but asking for the filter repeatedly
still serialized the locale/options cache key and traversed policy accessors.

For a stable policy setup cost `S`:

```text
per-item setup: N × S
per-scan setup: S
avoided work:   (N - 1) × S
```

We first selected filter, label and locale policy once per scan, then shared
stable locale/filter configuration through owned memos across scans and selection
bypass. The current regression reads policy and locale once across two query
scans of 200 items while retaining all **400 current label conversions**.

Default locale setup is eager and shared. Custom/null filters do not eagerly
read a query during root construction; the selected-label bypass resolves locale
matching lazily when needed. This qualification matters because an earlier eager
query read exposed a popup/input initialization temporal-dead-zone failure.

The default filter does not become an excuse to construct Intl for every custom
filter or for a null-filter policy.

### 11.2 Gate the effective query before the expensive scan

Raw writes can leave the actual search text unchanged. The effective-query memo
publishes a primitive string:

```text
raw state / browse policy → effective query → scan
```

In the regression, the accessor trims its input. Changing `999` to `999 ` leaves
the effective text equal, so a 10,000-label scan is not repeated. Changing the
query to `99` triggers another required scan and rereads the now-mutable labels.

This is not debouncing, deferred input, previous-result narrowing, or freezing
labels. Legitimate tracked item/label/policy changes remain reasons to reevaluate.
Mutating an ordinary non-reactive object does not by itself create a signal; the
regression checks that the next required scan observes the mutation.

The recorded demo repair reduced redundant filtered-scope reruns from an earlier
seven to five, or three where popup disposal prevented later lazy consumption.
The acceptance workload still included keyboard selection; we did not end the
measurement immediately after typing.

### 11.3 Select the predicate and limit strategy outside the loop

The scan chooses among no filtering, custom filtering and native filtering once.
It also chooses the unbounded common path separately from the bounded path.

The unbounded flat scan uses indexed reads and avoids checking the same limit
policy or creating iterator results for every row. The bounded scan stops when
the accepted-item count reaches the limit. Grouped scans preserve ordering,
metadata and the cross-group limit.

This optimization preserved the port's tested sparse custom-filter behavior:
holes are visited as `undefined`. Replacing the loop mechanically with
`Array.prototype.filter` would skip those holes and change the callback sequence.

For dense filtered arrays, equality checks on length/order/item identity suppress
equivalent downstream results. Empty-query browsing can return the original
source array instead of fabricating a copy. External results, unresolved
selection, custom/null policy and collection value/label domains retain their
distinct branches.

## 12. The virtualizer: derivations versus external observations

Implementation:
[virtualizer.ts](./demos/autocomplete/virtualizer.ts), shared by the Combobox
demo adapter as well.

### 12.1 A count is derived data, not a notification counter

The old adapter copied item count through imperative option updates and published
a revision signal. A filtered collection update could therefore pass through an
extra effect/write phase before geometry consumers saw the new count.

```text
before:
  filtered items → count → effect/setOptions → revision → geometry readers

after:
  filtered items → shared count memo → core's live count getter → readers
```

The adapter installs a live getter on `virtualizer.options.count`. Core
measurement/range readers participate in the tracked derivation instead of
waiting for a count relay. The attachment effect tracks the scroll element and
takes its imperative setup snapshot without subscribing attachment lifetime to
all changing derived geometry.

This is a deliberately limited adapter: its policy is start-anchored and
single-lane. It is not a general claim that arbitrary TanStack option updates can
be replaced with getters; the core's cache invalidation and policy must be
inspected first.

### 12.2 Geometry notifications carry meaning, not “something happened”

Scroll/measurement callbacks are real external observations. We kept that bridge
and changed its representation from a revision to:

```text
{ total size, virtual rows }
```

Equality compares size and each row's key, index, start, end, size and lane. Shared
size/range memos then gate meaningful changes for consumers. A fresh array with
the same geometry need not wake every renderer.

The adapter regression proves:

```text
10,000 rows × 32px + 4px + 4px = 320,008px
    19 rows × 32px + 4px + 4px =     616px
```

Count changes publish the new total size without a duplicate publication.
Replacing the scroll element unobserves the old target and removes its scroll
listener. Disposal releases all observers.

### 12.3 Row ownership and keys must justify snapshots

The demos use the core's default index key. For a row owner with that key, its
index is invariant, so the adapter snapshots that index during setup. It does
**not** snapshot the item: `filteredItems()[index]` remains live as filtering
changes what occupies that position.

Each row is enclosed in a native `display: contents` boundary. This preserves its
visual box behavior while preventing recursive parent child flattening from
inheriting all row computations. Measurement occurs in owned settled work, with
replacement/disposal cleanup, rather than allocating lifecycle primitives in a
ref callback.

If the key policy changes, the invariant-index assumption must be reviewed. The
optimization depends on the current key contract, not on indexes generally being
stable in every list.

## 13. The layout feedback loop

The most concrete rendering failure was in the Tailwind variants. Native
ResizeObserver evidence showed measured row heights growing:

```text
64px → 80px → 96px
```

The virtualizer measured a row's border-box size and later assigned that size to
CSS `height`. With `box-sizing: content-box`, the assigned height described only
the content, so padding was added again at the next measurement.

Let `h_k` be the height assigned at iteration `k` and `Δ` the vertical padding
plus border contribution:

```text
measured border height = h_k + Δ
next assigned height   = measured border height

h_(k+1) = h_k + Δ
h_k = h_0 + kΔ
```

Here the measured growth was **16px per iteration**, consistent with the two
8px padding edges. Starting from a 32px estimate, the recurrence predicts:

```text
32 → 48 → 64 → 80 → 96 → ...
```

The retained native records caught the later `64 → 80 → 96` portion. There is no
stable fixed point while `Δ > 0`. Delaying observers changes when the next
iteration happens; it does not correct the recurrence.

With `box-sizing: border-box`, the CSS height and measured height refer to the
same quantity:

```text
h_(k+1) = h_k
```

The rows stabilized at **32px**, and the ResizeObserver loop errors disappeared.
This was a units/box-model repair, not warning suppression, observer throttling,
or a replacement virtualizer.

Under the native profiling replay, retained evidence also recorded:

| Tailwind workload | Layout count before → after | Layout time before → after |
| --- | ---: | ---: |
| Autocomplete | 56 → 15 | 8.49 → 2.26ms |
| Combobox | 60 → 15 | 10.49 → 2.69ms |

Those are instrumented browser layout measurements for that replay. They are not
production latency numbers or universal CSS-variant comparisons.

## 14. What we rejected

### 14.1 Treating behavior success as performance success

An intermediate repair had correct selection, correct values and no page errors,
but still accumulated `HOT_SCOPE_TIME`. We retained the red diagnostic instead
of calling correct behavior a complete fix.

### 14.2 Caching item labels or previous filtered results

That could avoid more work, but it would also avoid required live conversions and
could lose mutable-label changes, custom-filter behavior or selection semantics.
The retained cache keys comparison arguments, not an item's historical answer.

### 14.3 Character-wise collation and whole-label normalization

Neither preserves the pinned fixed-window Intl algorithm. Unicode collation is
not generally composable by comparing units independently, and punctuation
stripping changes the set of candidate windows.

### 14.4 A custom packed/hash table

A correction experiment used custom packed typed storage. Browser measurements
were worse and WebKit warnings returned, so the experiment was removed. The
retained numeric encodings/direct addresses must not be confused with that
rejected custom hash implementation.

Arithmetic compactness does not by itself prove throughput. Probing, storage
initialization and engine behavior can outweigh avoided allocation. We did not
establish a single isolated engine-internal cause for the rejection; the evidence
was the measured workload regression.

### 14.5 An adjacent-window/chunk-answer cache

Another experiment cached the OR of four consecutive fixed-width window answers
by an immutable chunk representation, attempting to avoid repeatedly looking up
common adjacent windows across labels. It was comparison-work reuse, not an
item-label cache, but its overhead did not win in the browser replay.

It was removed. The final code does **not** contain an adjacent-run cache. A
historical design comment describing that experiment is not a description of
the shipped implementation.

### 14.6 Raising budgets, hiding dependencies, or relocating timing without proof

We did not raise the 8ms/1000ms threshold, disable diagnostics, debounce input,
delay filtering, or split one logical scan into artificial scopes merely to
reset its measured budget.

`untrack` was used for intentional setup/imperative snapshots, such as attaching
the virtualizer and reading a key-invariant index. Required display, label,
count and geometry readers remained tracked.

### 14.7 Blindly retaining every new optimization

Several stages were meaningfully better but still red. One new collection test
also demanded stronger numeric-index reorder identity than the public source
contract promised; that test was corrected rather than changing production to
satisfy an invented guarantee.

The standard was both simpler and stricter: retain demonstrated improvements,
preserve actual contracts, and report unfinished acceptance accurately.

## 15. Results and evidence boundaries

### 15.1 The investigation progressed through several different bottlenecks

| Stage | What improved | What remained |
| --- | --- | --- |
| Shared rendering/read-scope repair | Repeated prop traversal and unrelated DOM dependencies reduced | Collection ownership and large-list filtering still exposed separate costs |
| Source ownership and per-scan policy hoist | Avatar/collection/Collapsible paths cleaned up; invariant setup no longer repeated per candidate | Small WebKit filtering still exposed cold Intl construction |
| Owned locale setup + exact comparison cache | Small scenario's filtering transaction became cheap; native comparison counts fell sharply | Cumulative virtualized scans, wide virtualizer scopes and Tailwind layout feedback |
| Effective-query, row/virtualizer and box-model repair | Redundant scans, virtualizer relays and ResizeObserver errors removed | Chromium short-query cumulative cost remained |
| Length specialization and invariant predicate | Recorded `99` scan fell from 4.8–4.9ms to about 1.9–2.1ms at this stage; Combobox passed | Autocomplete selection-label scan kept its full workload above budget |
| Direct addressing, paged triples and single-window branch | Full original workload passed twice in both browsers | No retained performance blocker in this filtering ticket |

Early instrumented virtualized scans measured roughly **11–24ms**. A separate
preview-readiness replay recorded Autocomplete **14.5/14.4ms** and Combobox
**11.7/11.3ms**. These came from different investigation stages/modes; they should
not be divided by final numbers to advertise one cleanly isolated speedup.

### 15.2 Work counts established why the shared algorithm improved

Retained profile notes recorded:

- virtualized Combobox native comparisons: **304,085 → 2,351**, approximately
  99.2% fewer after the initial exact-comparison caching stage;
- Autocomplete native comparisons: approximately **304,084–314,085 → 11,238**,
  approximately 96.3% fewer for the recorded comparison;
- a later Combobox count: **2,351 → 1,239**;
- comparator accessor reads: hundreds of thousands previously, **one per cached
  filter construction** after resolving the accessor once;
- deterministic ASCII pair/triple workloads: **90,000 window visits, zero map
  reads** on those ASCII paths;
- full-label single-window regression: **10,000 candidates, zero map entries**.

The Autocomplete count could differ by browser depending on whether the popup
was disposed before a later lazy selection scan was consumed. That difference
was explicitly recorded; it was not interpreted as equivalent execution of
different workloads.

### 15.3 Final repair acceptance: two fresh passes

The closeout of `bsolid-systemic-interactions.2.1` recorded cumulative
`createDerivedItems.filtered` **rerun self times**:

| Actual demo | Chromium pass 1 / pass 2 | WebKit pass 1 / pass 2 |
| --- | ---: | ---: |
| Autocomplete CSS Modules | 5.4 / 5.4ms | 6 / 5ms |
| Autocomplete Tailwind | 5.1 / 5.1ms | 5 / 5ms |
| Combobox CSS Modules | 4.1 / 3.7ms | 5 / 6ms |
| Combobox Tailwind | 3.9 / 4.2ms | 5 / 4ms |

All 20 behavior/diagnostic checks passed. No retained `HOT_SCOPE_TIME`,
virtualizer wide-dependency/relay/waste diagnostics, ResizeObserver page errors
or other page errors appeared in that closeout.

The final recorded Chromium `99` scan was about **1.2–1.4ms**, and the
selection-label scan about **1.3–1.5ms**. These remain development-attribution
compute measurements.

### 15.4 Later preservation check in this conversation

A subsequent check, after separate correctness/test repairs, again passed
**20/20** with the same budget. Its cumulative filter rerun sums were:

| Actual demo | Chromium pass 1 / pass 2 | WebKit pass 1 / pass 2 |
| --- | ---: | ---: |
| Autocomplete CSS Modules | 4.1 / 4.3ms | 3 / 4ms |
| Autocomplete Tailwind | 3.9 / 3.8ms | 5 / 5ms |
| Combobox CSS Modules | 2.9 / 3.0ms | 4 / 3ms |
| Combobox Tailwind | 3.0 / 3.0ms | 3 / 3ms |

A preceding preservation replay had one WebKit `WASTED_RECOMPUTE` advisory,
without a behavior failure, page error or filtering-budget failure. The bounded
repeat was clean. No performance edits, threshold changes or new optimization
ticket were made for that non-repeated advisory.

That history matters: clean later samples are not a claim of mathematically zero
runtime variance. The last clean artifact may also be overwritten by a later
local replay, so the ticket closeout and recorded historical table are the stable
references for the original repair.

### 15.5 What these numbers do not prove

They do not establish:

- an equivalent React before/after speedup;
- production input latency or frames-per-second;
- how much of the final improvement belongs to a single patch in isolation;
- zero memory overhead for caching;
- universally optimal behavior for every locale, query length or label corpus;
- completion of the repository's unrelated browser/source-parity backlog.

The original algorithm has redundant comparisons visible in source. That makes a
framework-independent optimization proposal reasonable. It does not make the
Solid timing table a React benchmark. The shorter upstream-facing proposal is
[base-ui-filter-performance.md](../base-ui-filter-performance.md).

## 16. How we proved correctness

### Independent oracle, not optimized-code self-validation

The strongest filter oracle executes the original fixed-width loop directly with
a fresh native collator. It does not ask the optimized matcher to define its own
expected answer.

The corpus covers locale/case/accent/punctuation/numeric options, ASCII boundary
units, combining marks, surrogate pairs and isolated halves. It also checks
empty-query short-circuiting, invalid locales, converter errors, live labels and
reentrant converters.

### Work-count assertions

- One comparator accessor resolution per constructed filter.
- Two native comparisons for the deliberately repeated-label example.
- Fresh scan-local caches perform the needed misses again.
- Every required nonempty-query candidate retains its live conversion.
- Short ASCII strategies avoid map reads; non-ASCII falls back exactly.
- Single-window long labels avoid map insertion.
- Stable locale/filter policy is shared across queries and bypass.
- Equal effective text does not repeat a 10,000-label scan.
- Sparse visits, custom callbacks, group order and early limits stay defined.

### Reactive, DOM and ownership assertions

- Shared display readers do not rerun for equivalent display values.
- Completion scope retirement is independent of displayed-string equality.
- Visible/hidden input hosts, focus and mid-string caret remain intact.
- Group/row children resolve with the correct context and lifetime.
- Avatar notification order, cached first paint, multiple-image cleanup and
  hydration original-node identity remain correct.
- Collapsible interruption/measurement/animation cleanup remains owned.
- Virtual count/range updates do not relay or duplicate size publication.
- Replaced scroll elements release observers/listeners; disposal releases them all.

### Real browser assertions

The source replay checked original input identity, mounted nonzero row geometry,
query/selection output, and keyboard opening/selection/closing. Native observer
records confirmed the box model and stable 32px rows. All warnings and page
errors remained visible to the gate.

The final focused filtering command at the original ticket closeout passed
**39 tests**. Later test additions changed the current test inventory; 39 is a
historical receipt, not a permanently fixed suite size.

## 17. Implementation map and reproduction

### Source and regression files

| Area | Implementation | Key evidence/tests |
| --- | --- | --- |
| Prop composition | [mergeProps.ts](../packages/solid/src/merge-props/mergeProps.ts) | [Events.test.tsx](../packages/solid/src/merge-props/Events.test.tsx), systemic-interaction ticket membership counts |
| Host/read boundaries | [createRenderElement.tsx](../packages/solid/src/internals/createRenderElement.tsx), [getStateAttributesProps.ts](../packages/solid/src/internals/getStateAttributesProps.ts) | [createRenderElement.test.tsx](../packages/solid/src/internals/createRenderElement.test.tsx) |
| Autocomplete display | [createAutocompleteInput.ts](../packages/solid/src/autocomplete/root/createAutocompleteInput.ts) | [createAutocompleteInput.test.tsx](../packages/solid/src/autocomplete/root/createAutocompleteInput.test.tsx), [AutocompleteRoot.browser.test.tsx](../packages/solid/src/autocomplete/root/AutocompleteRoot.browser.test.tsx) |
| Collection ownership | [ComboboxCollection.tsx](../packages/solid/src/combobox/collection/ComboboxCollection.tsx) | [ComboboxCollection.test.tsx](../packages/solid/src/combobox/collection/ComboboxCollection.test.tsx) |
| Intl/window matching | [filter.ts](../packages/solid/src/internals/filter.ts) | [filter.test.ts](../packages/solid/src/internals/filter.test.ts) |
| Scan policy/query boundary | [createDerivedItems.ts](../packages/solid/src/combobox/root/createDerivedItems.ts) | [ComboboxDerivedItems.test.tsx](../packages/solid/src/combobox/root/ComboboxDerivedItems.test.tsx) |
| Virtualizer bridge | [shared virtualizer.ts](./demos/autocomplete/virtualizer.ts) | [ComboboxFilterVirtualizer.test.tsx](../packages/solid/src/combobox/root/ComboboxFilterVirtualizer.test.tsx) |
| Row owner/box model | [Autocomplete Tailwind](./demos/autocomplete/virtualized/tailwind/index.tsx), [Combobox Tailwind](./demos/combobox/virtualized/tailwind/index.tsx), corresponding CSS Modules variants | Native ResizeObserver/CDP records and four-variant replays |
| Avatar live source | [AvatarRoot.tsx](../packages/solid/src/avatar/root/AvatarRoot.tsx), [createImageLoadingStatus.ts](../packages/solid/src/avatar/image/createImageLoadingStatus.ts) | [AvatarImage.test.tsx](../packages/solid/src/avatar/image/AvatarImage.test.tsx), [Avatar.browser.test.tsx](../packages/solid/src/avatar/Avatar.browser.test.tsx) |
| Measured dimension boundary | [createCollapsiblePanel.ts](../packages/solid/src/collapsible/panel/createCollapsiblePanel.ts) | [CollapsiblePanel.browser.test.tsx](../packages/solid/src/collapsible/panel/CollapsiblePanel.browser.test.tsx) |

### Stable investigation references

```sh
rtk proxy bd show bsolid-systemic-interactions
rtk proxy bd show bsolid-systemic-interactions-autocomplete
rtk proxy bd show bsolid-systemic-interactions.2
rtk proxy bd show bsolid-systemic-interactions.2.1
rtk proxy bd show bsolid-browser.1
```

Read the latest comments and close reasons, not only an older “still red” note.
The investigation intentionally recorded intermediate failures rather than
rewriting history after the final pass. Parent/other qualification tickets can
remain open even though the filtering-performance child is closed.

Selected retained local artifacts:

```text
Baseline constructor/comparison profiling:
  /Users/avi/.local/share/opencode/tool-output/tool_10e5a1fa5001y5MF7VikO5NXH2

Initial caching repair/profile:
  /Users/avi/.local/share/opencode/tool-output/tool_10fc96bb4001X5RuhuJG9CNZnq

Virtualizer/layout replay:
  /Users/avi/.local/share/opencode/tool-output/tool_110286702001olRT8PMzFxP92c

Later short-query baseline:
  /Users/avi/.local/share/opencode/tool-output/tool_110694f1a001Wx7mmLspCU33NG
```

These are workstation-local retained outputs, not portable public artifacts.

### Existing regression commands

```sh
rtk pnpm typescript
rtk pnpm exec tsc --noEmit -p docs/tsconfig.demos.json
rtk pnpm test:jsdom ComboboxDerivedItems filter.test ComboboxFilter --no-watch
```

The broader coordinated interaction gate is `rtk pnpm test:interactions`. It
covers additional paths and should not be confused with the narrow 8ms filtering
closeout or treated as a requirement to rerun unrelated qualification work for a
documentation change.

The local source-only profiling/replay tools were:

```text
/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/
  bsolid-filter-pipeline-probe.mjs
  bsolid-filter-final-gate.mjs
  bsolid-filter-final.json
```

```sh
# Extra counters/native profile: attribution tool, not production timing.
rtk proxy node /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-filter-pipeline-probe.mjs --profile --native

# Original source workload, diagnostic-enabled, two fresh passes.
rtk proxy node /var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/bsolid-filter-final-gate.mjs
```

The gate expects ten behavior-bearing records per pass: simple plus four variants
in two browsers. It checks run status, behavior, diagnostics and errors. Its
printed sums use filtered-scope rerun self times; the stage records also retain
observed initial rows and filtered size.

These scripts live in an approved local temporary directory and may not survive
machine cleanup. The report's equations, source links, tests and Beads history
remain usable without them. This report was written from retained evidence and
current source inspection; it does not present a new benchmark run.

## 18. The general lessons

The deepest improvement was identifying **what stays invariant**, and giving
that invariant a representation whose lifetime and observers are correct.

| Invariant or distinction | Representation we used |
| --- | --- |
| Locale/options policy across ordinary query writes | Owned shared policy memo and existing filter-object cache |
| A complete window's answer for one fixed query/collator | Query-scoped answer cache |
| One/two/three UTF-16 units | Exact integer encodings, not lossy hashes |
| Bounded ASCII pair domain | Direct-address byte table |
| Sparse touched regions of the ASCII triple domain | Lazy 16KiB pages |
| A candidate that has exactly one long-query window | Direct comparison instead of low-value map population |
| The displayed value, despite completion bookkeeping changes | Shared semantic display boundary |
| Current completion lifetime, despite a repeated textual value | Scope identity rather than text-only equality |
| Actual image status versus the currently selected image writer | Live source accessor plus event-state source selection |
| DOM measurement versus derived rendering policy | External measurement signal plus shared derived dimensions |
| Item count versus scroll/measurement notifications | Live count derivation plus semantic external geometry |
| Row key's index versus mutable item-at-index | Invariant index snapshot plus live item accessor |
| Assigned height versus measured height | One consistent border-box quantity |

Algorithmic reduction, reactive dependency reduction and layout correction solve
different terms in the cost equation. None substitutes for the others.

The 8ms problem only closed after all three were addressed—and after the complete
typing **and selection** workload passed without hiding diagnostics or changing
the observable API.
