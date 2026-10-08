# Base UI: reduce repeated Intl filtering work in large collections

## Summary for an upstream issue or PR

Base UI's locale-aware substring filter performs an `Intl.Collator.compare`
call at each candidate substring until it finds a match. Large collections often
contain the same substrings, so many of these calls have identical arguments.
We can reuse those comparison results while still reading every item's current
label and preserving the exact matching behavior.

We encountered this while porting Base UI to Solid 2. Solid's development
diagnostics exposed the cumulative filtering cost during rapid input. We then
optimized the shared, framework-independent algorithm and verified the port in
Chromium and WebKit.

**Suggested PR title:**

> perf: reuse locale-aware substring comparisons during collection filtering

**Evidence boundary:** we inspected the pinned React source, but have not run an
equivalent before/after benchmark of React Base UI. The redundant comparisons are
visible in its algorithm; the browser timings below are from our Solid port.
They are not a claim that React itself is slower or that upstream neglects
performance.

## The algorithm in plain English

1. The user types a query.
2. The component reads each item's current text label.
3. `Intl.Collator` compares text according to language rules and options. With
   Base UI's defaults, accents and case can compare equal: `Résumé` matches
   `resume`.
4. To search anywhere in the label, Base UI compares substrings of the same
   length as the query. These substrings are called **windows**.
5. Matching items become the filtered collection. Virtualization renders a small
   visible subset, but does not eliminate the search through all 10,000 items.

For example, searching `cat` in `catch` considers `cat`, `atc`, and `tch`, stopping
at the first match. Lengths and positions here are JavaScript UTF-16 code units,
not user-perceived characters.

## Canonical source

Inspected revision: `19511bb171f3b360b006c94cf6d07e53cb446505`.

- [`packages/react/src/internals/filter.ts`](https://github.com/mui/base-ui/blob/19511bb171f3b360b006c94cf6d07e53cb446505/packages/react/src/internals/filter.ts)
- [`packages/react/src/internals/filter.test.ts`](https://github.com/mui/base-ui/blob/19511bb171f3b360b006c94cf6d07e53cb446505/packages/react/src/internals/filter.test.ts)
- [`packages/react/src/combobox/root/utils/useFilter.ts`](https://github.com/mui/base-ui/blob/19511bb171f3b360b006c94cf6d07e53cb446505/packages/react/src/combobox/root/utils/useFilter.ts)
- [`packages/react/src/combobox/root/utils/index.ts`](https://github.com/mui/base-ui/blob/19511bb171f3b360b006c94cf6d07e53cb446505/packages/react/src/combobox/root/utils/index.ts)

Upstream already caches filter objects by locale and collator options. This is
**not** a proposal to fix a collator being constructed for every item.

The relevant `contains` loop is:

```ts
const itemString = stringifyAsLabel(item, itemToString);

for (let i = 0; i <= itemString.length - query.length; i += 1) {
  if (collator.compare(itemString.slice(i, i + query.length), query) === 0) {
    return true;
  }
}
return false;
```

For N items, average label length L, and query length Q, a no-match scan can
perform approximately N × (L − Q + 1) native comparisons. The same work repeats
for each query. Component rendering overhead is a separate concern.

## A deterministic demonstration

Consider 10,000 labels containing `aaaaab`, with query `z`:

| Implementation | Native comparisons | Live label reads |
| --- | ---: | ---: |
| Upstream loop above | 60,000 | 10,000 |
| Query-scoped comparison cache | 2 | 10,000 |

Only `compare('a', 'z')` and `compare('b', 'z')` need to be evaluated once each.
The cache stores answers for **string comparison arguments**, not item identities
or previously computed labels. Changing an item's label still changes the next
search because its label is read again.

The 60,000 count follows directly from the source loop. Our regression verifies
the optimized count of two and the continued 10,000 converter calls. It also
covers queries of lengths 1, 2, 3, and 4 and fresh cache lifetimes.

## Proposed upstream changes

### First PR: small, framework-independent changes

1. **Resolve `collator.compare` once when creating the cached filter.** It is an
   accessor returning a bound function. Avoid repeatedly reading that accessor;
   do not describe each read as allocating a new function.
2. **Share a fixed-query matcher across one collection scan.** Cache whole-window
   comparison answers keyed by the window string. Keep the query and collator
   fixed for that matcher. A scan-local helper gives an explicit lifetime without
   changing the public `contains(item, query, converter)` signature.
3. **Keep converters live.** Call `stringifyAsLabel` for every candidate on every
   required scan. Do not cache `item → label` or reuse a previous query's results.
4. **Handle reentrancy.** If public `contains` shares a latest-query matcher,
   capture that matcher before invoking a converter: a converter can call the
   filter recursively with a different query.

Illustrative matcher core, not a complete proposed patch:

```ts
function createMatcher(compare: (a: string, b: string) => number, query: string) {
  const windows = new Map<string, boolean>();
  return (text: string) => {
    if (!query) return true;
    for (let i = 0; i <= text.length - query.length; i++) {
      const window = text.slice(i, i + query.length);
      let matches = windows.get(window);
      if (matches === undefined) {
        matches = compare(window, query) === 0;
        windows.set(window, matches);
      }
      if (matches) return true;
    }
    return false;
  };
}
```

### Follow-up: benchmark-driven fast paths

Our port needed further reductions to satisfy its development compute budget:

- Select the query-length strategy once instead of branching on length at every
  window.
- For short ASCII candidate windows, use typed-array indexing instead of hashing.
  **Intl still determines the answer on a cache miss**, even if the query contains
  non-ASCII text. Non-ASCII candidate windows retain the full UTF-16 fallback.
- Allocate three-unit lookup storage in pages, only as needed, rather than
  clearing a 2MiB table for every query.
- For longer queries where a label is exactly one window long, compare it directly
  instead of populating a map with thousands of whole-label windows. This helped
  the additional scan when selection fills an Autocomplete input with a label.
  It trades away cross-item cache reuse for that single-window branch; benchmark
  repeated equal-length labels as well as unique labels before adopting it.

These are candidates to measure in upstream, not a recommendation to copy every
local optimization into the first PR. We rejected a custom packed hash table and
an adjacent-window cache because browser measurements were worse. Memory usage,
small lists, mostly unique windows, and long queries matter alongside large lists.

## What we measured locally

Workload: the real 10,000-item Autocomplete and Combobox demos, both CSS Modules
and Tailwind, trusted input `9 → 99 → 999`, then ArrowDown, Enter, and Escape.

Solid 2 RC13's attribution engine reported `HOT_SCOPE_TIME` at its unchanged
**8ms of cumulative computation per 1000ms** budget. Our runner enabled the
runtime diagnostics and checked the interactions; it did not invent that budget.
This is separate from the Solid diagnostic correctness issue documented in
[`solidjs-rc13-issue.md`](./solidjs-rc13-issue.md).

The earlier filtering pipeline crossed the budget at roughly 9–11ms. The final
two fresh-browser passes recorded the following cumulative filter recomputation
times, including the selection scan when evaluated before popup disposal:

| Demo | Chromium, pass 1 / pass 2 | WebKit, pass 1 / pass 2 |
| --- | ---: | ---: |
| Autocomplete CSS Modules | 5.4 / 5.4ms | 6 / 5ms |
| Autocomplete Tailwind | 5.1 / 5.1ms | 5 / 5ms |
| Combobox CSS Modules | 4.1 / 3.7ms | 5 / 6ms |
| Combobox Tailwind | 3.9 / 4.2ms | 5 / 4ms |

These are **development attribution timings in the Solid port**, not production
latency, React measurements, or an isolated speedup attributable to one PR.
The final timing runs did not enable our comparison counters or CPU profiler.
All 20 behavior/diagnostic checks passed, with no runtime warnings or page errors.

## Required correctness tests

Use the original Intl sliding-window algorithm as an independent oracle, not the
optimized implementation as its own expected result. Cover:

- Locale, accent, case, punctuation, numeric, and sensitivity options.
- UTF-16 surrogate halves, combining marks, and ASCII/fallback boundaries.
- Fixed window lengths: `contains('a-b', 'ab')` must not become true simply by
  stripping punctuation.
- Empty queries, null inputs, converter exceptions, and invalid locale errors.
- Live/mutable labels, changed collections, and reentrant converters.
- Custom/null filters, external results, grouped ordering, limits, item identity,
  controlled acceptance/refusal, and selection behavior at integration level.
- Deterministic native-comparison counts and bounded cache lifetime/memory.

Preserve the empty-query short circuit before label conversion. Do not replace
Intl matching with lowercasing, normalization, or assumptions about collation
being independently composable character by character.

## How to validate a React upstream PR

1. Run the existing upstream filter and Combobox/Autocomplete regression suites.
2. Add the independent-oracle and work-count tests described above.
3. Benchmark the **same React build configuration** before and after the patch:
   compare native call counts separately from uninstrumented elapsed time.
4. Test Chromium and WebKit with small and 10,000-item lists, repeated and unique
   labels, short and long queries, and the selection-label scan.
5. Replay real typing, keyboard selection, clearing, and reopening; verify input
   identity, focus, caret, selection and ARIA behavior.
6. Report both time and allocation/memory tradeoffs. Do not infer React results
   from the Solid timings above.

## Local implementation and evidence

- `packages/solid/src/internals/filter.ts`
- `packages/solid/src/internals/filter.test.ts`
- `packages/solid/src/combobox/root/createDerivedItems.ts`
- `packages/solid/src/combobox/root/ComboboxDerivedItems.test.tsx`
- Beads: `bsolid-systemic-interactions.2.1` (closed with green evidence).

Our current focused test command passes **39 tests**:

```sh
rtk pnpm typescript
rtk pnpm exec tsc --noEmit -p docs/tsconfig.demos.json
rtk pnpm test:jsdom ComboboxDerivedItems filter.test ComboboxFilter --no-watch
```

Local-only browser evidence and runner (attach or turn into a portable fixture
before submitting upstream):

```text
/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/
  bsolid-filter-pipeline-probe.mjs
  bsolid-filter-final-gate.mjs
  bsolid-filter-final.json
```

The Solid-specific reactive query boundaries, virtualizer revision repairs, and
Tailwind ResizeObserver feedback fix are separate port work. They are not evidence
of corresponding React bugs and should not be bundled into this upstream PR.
