import { computed, runWithOwner, signal, currentOptimisticLane, setSignal } from "./core/core.js";

import { activeLanes } from "./core/lanes.js";

import { createOwner } from "./core/owner.js";

import { GlobalQueue } from "./core/scheduler.js";

import { CONFIG_AUTO_DISPOSE } from "./core/constants.js";

import { attrHooks } from "./core/attribution-hooks.js";

import "./core/invariants.js";

import "./core/dev.js";

import "./core/verdict.js";

import "./core/effect.js";

import { accessor } from "./signals.js";

import { $TRACK } from "./store/store.js";

import "./store/next/store.js";

function mapArray(t, e, i) {
    const s = typeof i?.keyed === "function" ? i.keyed : undefined;
    const r = e.length > 1;
    const n = e;
    const o = {
        ie: createOwner(),
        oi: 0,
        hi: t,
        fi: [],
        ci: n,
        ai: [],
        ui: [],
        zt: s,
        li: s || i?.keyed === false ? [] : undefined,
        pi: r && i?.keyed !== false ? [] : undefined,
        di: i?.keyed === false,
        mi: i?.fallback
    };
    const h = computed(updateKeyedMap.bind(o), i?.name ? {
        name: i.name
    } : undefined);
    // Untracked reads inside the internal owner resolve via _parentComputed; routing
    // them through node lets store-proxy lookups see pending writes (not stale _value).
        o.ie.Yt = h;
    h.C &= ~CONFIG_AUTO_DISPOSE;
    return accessor(h);
}

const pureOptions = {
    ownedWrite: true
};

function trySmallMove(t, e, i, s) {
    const r = t.fi;
    const n = t.oi - 1;
    const o = [];
    const h = [];
    const f = [];
 // flat triples: oldStart, newStart, length
        let c = 256;
    let a = s;
    let u = s;
    let l = false;
    while (a <= n && u <= i - 1) {
        const t = r[a];
        const s = e[u];
        if (t === s) {
            if (!l) {
                f.push(a, u, 0);
                l = true;
            }
            f[f.length - 1]++;
            a++;
            u++;
            continue;
        }
        l = false;
        // Bounded realignment lookahead, shorter distance wins.
                let p = -1;
        let d = Math.min(32 - o.length, n - a, c);
        for (let t = 1; t <= d; t++) {
            if (r[a + t] === s) {
                p = t;
                break;
            }
        }
        c -= p === -1 ? d : p;
        let m = -1;
        d = Math.min(32 - h.length, i - 1 - u, c);
        for (let i = 1; i <= d; i++) {
            if (e[u + i] === t) {
                m = i;
                break;
            }
        }
        c -= m === -1 ? d : m;
        if (p !== -1 && (m === -1 || p <= m)) {
            while (p-- > 0) o.push(a++);
            continue;
        }
        if (m !== -1) {
            while (m-- > 0) h.push(u++);
            continue;
        }
        if (c <= 0 || o.length === 32 || h.length === 32) return false;
        o.push(a++);
        h.push(u++);
    }
    for (;a <= n; a++) {
        if (o.length === 32) return false;
        o.push(a);
    }
    for (;u <= i - 1; u++) {
        if (h.length === 32) return false;
        h.push(u);
    }
    return commitSmallMove(t, e, i, o, h, f);
}

/** PHASE 2 of the small-move path, in its OWN function so that a pass which
 * only SCANS and bails (a full replace: the first structural pass of a page,
 * typically) compiles nothing but the scan — V8 parses and compiles lazily
 * per function, and cold `replace` measured +0.5 ms with both phases in one
 * body. Pairs displaced sources with destinations (an unmatched destination
 * is a replacement/insertion → general path), then commits: slice() the live
 * arrays, copy shifted runs, patch displaced pairs, dispose leftovers. */ function commitSmallMove(t, e, i, s, r, n) {
    const o = t.fi;
    let h;
    let f;
    let c;
    if (r.length !== 0) {
        c = new Array(s.length);
        for (f = 0; f < r.length; f++) {
            let t = -1;
            for (h = 0; h < s.length; h++) {
                if (!c[h] && o[s[h]] === e[r[f]]) {
                    t = h;
                    break;
                }
            }
            if (t === -1) return false;
            c[t] = true;
            r[f] = r[f] << 6 | t;
 // pack pairing (found < 32)
                }
    }
    // DUPLICATES: the general path pairs equal identities by OCCURRENCE ORDER
    // (the chained index map). Displaced↔displaced pairing above is ascending
    // on both sides, so it agrees; but an aligned run was matched by POSITION,
    // and if a displaced identity also occurs inside a run the two algorithms
    // can hand different occurrences different owners (row-local state moves;
    // a shrink could dispose the wrong one). Decline that case — general path.
        if (s.length !== 0 || r.length !== 0) {
        const t = new Set;
        for (h = 0; h < s.length; h++) t.add(o[s[h]]);
        for (f = 0; f < r.length; f++) t.add(e[r[f] >> 6]);
        for (let e = 0; e < n.length; e += 3) {
            const i = n[e];
            for (let s = 0, r = n[e + 2]; s < r; s++) if (t.has(o[i + s])) return false;
        }
    }
    const a = t.ai;
    const u = t.ui;
    const l = a.slice(0, i);
    const p = u.slice(0, i);
    for (let t = 0; t < n.length; t += 3) {
        const e = n[t];
        const i = n[t + 1];
        if (e !== i) {
            for (let s = 0; s < n[t + 2]; s++) {
                l[i + s] = a[e + s];
                p[i + s] = u[e + s];
            }
        }
    }
    for (f = 0; f < r.length; f++) {
        const t = r[f] >> 6;
        const e = s[r[f] & 63];
        l[t] = a[e];
        p[t] = u[e];
    }
    t.ai = l;
    t.ui = p;
    t.oi = i;
    t.fi = e.slice(0);
    // Dispose unmatched sources LAST (general-path ordering).
        for (h = 0; h < s.length; h++) {
        if (c === undefined || !c[h]) u[s[h]].dispose();
    }
    return true;
}

function updateKeyedMap() {
    const t = this.hi() || [], e = t.length;
    t[$TRACK];
 // top level tracking
        runWithOwner(this.ie, () => {
        let i, s, r, n, 
        // Mappers write freshly-created row/index signals into the STAGE
        // arrays (`rows`/`indexes`), never into `this._rows`/`this._indexes`.
        o = this.li ? this.di ? () => {
            r[s] = signal(t[s], pureOptions);
            return this.ci(accessor(r[s]), s);
        } : () => {
            r[s] = signal(t[s], pureOptions);
            n && (n[s] = signal(s, pureOptions));
            return this.ci(accessor(r[s]), n ? accessor(n[s]) : undefined);
        } : this.pi ? () => {
            const e = t[s];
            n[s] = signal(s, pureOptions);
            return this.ci(e, accessor(n[s]));
        } : () => {
            const e = t[s];
            return this.ci(e);
        };
        // fast path for empty arrays
                if (e === 0) {
            if (this.oi !== 0) {
                this.ie.dispose(false);
                this.ui = [];
                this.fi = [];
                this.ai = [];
                this.oi = 0;
                this.li && (this.li = []);
                this.pi && (this.pi = []);
            }
            if (this.mi && !this.ai[0]) {
                // an aborted fallback attempt leaves an owner without a mapping;
                // dispose it before re-creating
                this.ui[0]?.dispose();
                this.ai[0] = runWithOwner(this.ui[0] = createOwner(), this.mi);
            }
        }
        // fast path for new create
         else if (this.oi === 0) {
            const h = new Array(e);
            const f = new Array(e);
            r = this.li && new Array(e);
            n = this.pi && new Array(e);
            try {
                for (s = 0; s < e; s++) h[s] = runWithOwner(f[s] = createOwner(), o);
            } catch (t) {
                for (i = 0; i <= s; i++) f[i]?.dispose();
                throw t;
            }
            // commit
                        if (this.ui[0]) this.ui[0].dispose();
 // previous fallback
                        this.ai = h;
            this.ui = f;
            r && (this.li = r);
            n && (this.pi = n);
            this.fi = t.slice(0);
            this.oi = e;
        } else {
            let h, f, c, a, u, l, p, d, m, 
            // Dev (attribution engine installed): the items behind the exited and
            // entered rows, for the list-identity census.
            w, O;
            // The pass's write to a per-slot signal (a row accessor in index mode,
            // an index accessor in keyed mode). The list's frame lives in these
            // writes as much as in the computed's result, so under a LANE pass they
            // are the lane's frame too (F1): a plain `setSignal` staged them into
            // the action's transaction and the row readers were served the
            // committed value until the action landed — `<For>` without `keyed`
            // showed the pre-action list for the whole action while the keyed modes
            // showed the optimistic one. The engine publishes the write as a
            // derived override on the slot (lanes stage, A17) and lands or
            // supersedes it when a plain pass later writes a slot still carrying
            // one (A18) — `landOnOverride`'s slot arm. Decided once per pass, not
            // per slot: a lane pass marks the map (`_laneSlots`: its slots may
            // carry overrides), a marked map routes every slot write through the
            // engine while any lane is live — a slot's override resolves with its
            // lane's transaction, or with the batch for an orphan lane
            // (resolveOptimisticNodes, then cleanupCompletedLanes, both before the
            // completion wakes any recompute), so a pass that finds no lane live
            // knows the slots are clean and drops the mark — and an unmarked map
            // takes `setSignal` directly. The engine is installed whenever a lane
            // is active.
                        const _ = (this.wi = currentOptimisticLane !== null || this.wi && activeLanes.size !== 0) ? GlobalQueue.Vn : setSignal;
            // skip common prefix
                        for (h = 0, f = Math.min(this.oi, e); h < f && (this.fi[h] === t[h] || this.li && compare(this.zt, this.fi[h], t[h])); h++) {
                if (this.li) _(this.li[h], t[h]);
            }
            // skip common suffix — counted only; retained entries land in one pass
            // at commit instead of being staged and copied twice
                        for (f = this.oi - 1, c = e - 1; f >= h && c >= h && (this.fi[f] === t[c] || this.li && compare(this.zt, this.fi[f], t[c])); f--, 
            c--) ;
            // no structural change (every position matched in place at equal
            // length — the common post-reconcile shape): keep the same mapped
            // array identity so downstream consumers don't re-run at all
                        if (h === e && this.oi === e) {
                this.fi = t.slice(0);
                return;
            }
            // SMALL-MOVE FAST PATH: extracted to its own function — inlining it
            // here bloats updateKeyedMap past the JIT's optimization budget and
            // deoptimizes the GENERAL path (measured 2x on reverse). Gated to
            // LARGE trimmed windows: when the trims already shrank the window
            // (plain removals, tail edits), the general path is window-
            // proportional and cheap — the fast path would only re-walk what the
            // trims proved.
                        if (e <= this.oi && f - h > 64 && this.li === undefined && this.pi === undefined) {
                // PROBE before the scan: a small move keeps a mid-window item within
                // ±32 of its old position; a REPLACE (all fresh items — the shape
                // every page's first structural pass usually is) has it nowhere.
                // ~65 compares, no allocation, and the scan function is never
                // compiled for a replace (its cold first-call compile was the cost).
                const i = h + (c - h >> 1);
                const s = t[i];
                const r = Math.min(f, i + 32);
                let n = Math.max(h, i - 32);
                while (n <= r && this.fi[n] !== s) n++;
                if (n <= r && trySmallMove(this, t, e, h)) return;
            }
            const y = e - this.oi;
            const A = new Array(e);
            const M = new Array(e);
            r = this.li ? new Array(e) : undefined;
            n = this.pi ? new Array(e) : undefined;
            // 0) prepare a map of all indices in the changed window of newItems,
            // scanning backwards so we encounter them in natural order
                        l = new Map;
            p = new Array(c + 1);
            for (s = c; s >= h; s--) {
                a = t[s];
                u = this.zt ? this.zt(a) : a;
                i = l.get(u);
                p[s] = i === undefined ? -1 : i;
                l.set(u, s);
            }
            // 1) step through the old changed window and see if items can be found
            // in the new set; if so, stage them at their new positions; if not,
            // queue them for disposal at commit
                        for (i = h; i <= f; i++) {
                a = this.fi[i];
                u = this.zt ? this.zt(a) : a;
                s = l.get(u);
                if (s !== undefined && s !== -1) {
                    A[s] = this.ai[i];
                    M[s] = this.ui[i];
                    r && (r[s] = this.li[i]);
                    n && (n[s] = this.pi[i]);
                    s = p[s];
                    l.set(u, s);
                } else {
                    (d ??= []).push(this.ui[i]);
                    if (true && attrHooks !== null) (w ??= []).push(a);
                }
            }
            // 2) create new rows into the temp arrays; an abort disposes only these
                        try {
                for (s = h; s <= c; s++) {
                    if (M[s] !== undefined) continue;
                    (m ??= []).push(M[s] = createOwner());
                    if (true && attrHooks !== null) (O ??= []).push(t[s]);
                    A[s] = runWithOwner(M[s], o);
                }
            } catch (t) {
                if (m) for (i = 0; i < m.length; i++) m[i].dispose();
                throw t;
            }
            // 3) commit: land the retained prefix and suffix plus the staged window
            // into the fresh arrays, swap them in (new identity for downstream
            // change propagation), then dispose exited rows
                        for (i = 0; i < h; i++) {
                A[i] = this.ai[i];
                M[i] = this.ui[i];
                r && (r[i] = this.li[i]);
                n && (n[i] = this.pi[i]);
            }
            for (s = h; s <= c; s++) {
                if (r) _(r[s], t[s]);
                if (n) _(n[s], s);
            }
            for (s = c + 1; s < e; s++) {
                A[s] = this.ai[s - y];
                M[s] = this.ui[s - y];
                if (r) {
                    r[s] = this.li[s - y];
                    _(r[s], t[s]);
                }
                if (n) {
                    n[s] = this.pi[s - y];
                    if (y !== 0) _(n[s], s);
                }
            }
            this.ai = A;
            this.ui = M;
            r && (this.li = r);
            n && (this.pi = n);
            this.oi = e;
            // save a copy of the mapped items for the next update
                        this.fi = t.slice(0);
            if (d) for (i = 0; i < d.length; i++) d[i].dispose();
            if (true && attrHooks !== null && w !== undefined && O !== undefined) attrHooks.listChurn(this.ie.Yt, w, O, e, this.zt !== undefined);
        }
    });
    return this.ai;
}

/**
 * Reactively renders a callback `count` times, reusing previously-rendered
 * entries when only the count changes. Underlying helper for `<Repeat>`.
 *
 * - `options.from` — start index (default `0`); useful for offset/windowed
 *   rendering.
 * - `options.fallback` — accessor returning a value to show when count is `0`.
 *
 * @example
 * ```ts
 * const view = repeat(count, i => `Item ${i}`, { fallback: () => "empty" });
 * ```
 *
 * @description https://docs.solidjs.com/reference/reactive-utilities/repeat
 */ function repeat(t, e, i) {
    const s = e;
    const r = {
        ie: createOwner(),
        oi: 0,
        Oi: 0,
        _i: t,
        ci: s,
        ui: [],
        ai: [],
        yi: i?.from,
        mi: i?.fallback
    };
    const n = computed(updateRepeat.bind(r));
    // Same as mapArray: untracked reads inside the internal owner resolve via
    // _parentComputed, so async reads in row callbacks register with the node
    // (pending tracking + post-settle retry) instead of vanishing.
        r.ie.Yt = n;
    n.C &= ~CONFIG_AUTO_DISPOSE;
    return accessor(n);
}

// Same staged-commit discipline as `updateKeyedMap` (#2903): the retained
// window overlap is copied into fresh arrays, missing indexes are created
// into them, and `this` is only touched — including disposal of rows leaving
// the window — after every `_map` call succeeded. A NotReadyError mid-pass
// disposes only the owners this pass created and leaves prior state intact
// for the post-settle retry. The overlap math also subsumes the previous
// disjoint-window/front-clear/end-clear/shift special cases.
function updateRepeat() {
    const t = this._i();
    const e = this.yi?.() || 0;
    runWithOwner(this.ie, () => {
        if (t === 0) {
            if (this.oi !== 0) {
                this.ie.dispose(false);
                this.ui = [];
                this.ai = [];
                this.oi = 0;
                // Reset offset to match the cleared data (#2767, repro 2).
                                this.Oi = 0;
            }
            if (this.mi && !this.ai[0]) {
                // an aborted fallback attempt leaves an owner without a mapping;
                // dispose it before re-creating
                this.ui[0]?.dispose();
                this.ai[0] = runWithOwner(this.ui[0] = createOwner(), this.mi);
            }
            return;
        }
        const i = e + t;
        const s = this.Oi + this.oi;
        // Retained overlap [keepStart, keepEnd) in global indexes; empty when the
        // windows are disjoint or when coming from empty/fallback.
                const r = Math.max(e, this.Oi);
        const n = Math.min(i, s);
        const o = new Array(t);
        const h = new Array(t);
        for (let t = r; t < n; t++) {
            h[t - e] = this.ui[t - this.Oi];
            o[t - e] = this.ai[t - this.Oi];
        }
        try {
            for (let t = e; t < i; t++) {
                if (t >= r && t < n) continue;
                o[t - e] = runWithOwner(h[t - e] = createOwner(), () => this.ci(t));
            }
        } catch (t) {
            for (let t = e; t < i; t++) if ((t < r || t >= n) && h[t - e]) h[t - e].dispose();
            throw t;
        }
        // commit: dispose the previous fallback or the rows leaving the window
                if (this.oi === 0) this.ui[0]?.dispose(); else for (let t = this.Oi; t < s; t++) if (t < e || t >= i) this.ui[t - this.Oi].dispose();
        this.ai = o;
        this.ui = h;
        this.Oi = e;
        this.oi = t;
    });
    return this.ai;
}

function compare(t, e, i) {
    return t ? t(e) === t(i) : true;
}

export { mapArray, repeat };