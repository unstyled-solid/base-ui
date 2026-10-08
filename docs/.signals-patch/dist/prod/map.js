import { computed, runWithOwner, signal, currentOptimisticLane, setSignal } from "./core/core.js";

import { activeLanes } from "./core/lanes.js";

import { createOwner } from "./core/owner.js";

import { GlobalQueue } from "./core/scheduler.js";

import { CONFIG_AUTO_DISPOSE } from "./core/constants.js";

import { attrHooks } from "./core/attribution-hooks.js";

import "./core/invariants.js";

import "./core/verdict.js";

import "./core/effect.js";

import { accessor } from "./signals.js";

import { $TRACK } from "./store/store.js";

import "./store/next/store.js";

function mapArray(t, s, e) {
    const i = typeof e?.keyed === "function" ? e.keyed : undefined;
    const r = s.length > 1;
    const n = s;
    const o = {
        ie: createOwner(),
        wt: 0,
        Ot: t,
        yt: [],
        At: n,
        Mt: [],
        St: [],
        Kn: i,
        jt: i || e?.keyed === false ? [] : undefined,
        kt: r && e?.keyed !== false ? [] : undefined,
        gt: e?.keyed === false,
        bt: e?.fallback
    };
    const h = computed(updateKeyedMap.bind(o), undefined);
    // Untracked reads inside the internal owner resolve via _parentComputed; routing
    // them through node lets store-proxy lookups see pending writes (not stale _value).
        o.ie.qn = h;
    h.C &= ~CONFIG_AUTO_DISPOSE;
    return accessor(h);
}

const pureOptions = {
    ownedWrite: true
};

function trySmallMove(t, s, e, i) {
    const r = t.yt;
    const n = t.wt - 1;
    const o = [];
    const h = [];
    const f = [];
 // flat triples: oldStart, newStart, length
        let c = 256;
    let a = i;
    let u = i;
    let l = false;
    while (a <= n && u <= e - 1) {
        const t = r[a];
        const i = s[u];
        if (t === i) {
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
            if (r[a + t] === i) {
                p = t;
                break;
            }
        }
        c -= p === -1 ? d : p;
        let m = -1;
        d = Math.min(32 - h.length, e - 1 - u, c);
        for (let e = 1; e <= d; e++) {
            if (s[u + e] === t) {
                m = e;
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
    for (;u <= e - 1; u++) {
        if (h.length === 32) return false;
        h.push(u);
    }
    return commitSmallMove(t, s, e, o, h, f);
}

/** PHASE 2 of the small-move path, in its OWN function so that a pass which
 * only SCANS and bails (a full replace: the first structural pass of a page,
 * typically) compiles nothing but the scan — V8 parses and compiles lazily
 * per function, and cold `replace` measured +0.5 ms with both phases in one
 * body. Pairs displaced sources with destinations (an unmatched destination
 * is a replacement/insertion → general path), then commits: slice() the live
 * arrays, copy shifted runs, patch displaced pairs, dispose leftovers. */ function commitSmallMove(t, s, e, i, r, n) {
    const o = t.yt;
    let h;
    let f;
    let c;
    if (r.length !== 0) {
        c = new Array(i.length);
        for (f = 0; f < r.length; f++) {
            let t = -1;
            for (h = 0; h < i.length; h++) {
                if (!c[h] && o[i[h]] === s[r[f]]) {
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
        if (i.length !== 0 || r.length !== 0) {
        const t = new Set;
        for (h = 0; h < i.length; h++) t.add(o[i[h]]);
        for (f = 0; f < r.length; f++) t.add(s[r[f] >> 6]);
        for (let s = 0; s < n.length; s += 3) {
            const e = n[s];
            for (let i = 0, r = n[s + 2]; i < r; i++) if (t.has(o[e + i])) return false;
        }
    }
    const a = t.Mt;
    const u = t.St;
    const l = a.slice(0, e);
    const p = u.slice(0, e);
    for (let t = 0; t < n.length; t += 3) {
        const s = n[t];
        const e = n[t + 1];
        if (s !== e) {
            for (let i = 0; i < n[t + 2]; i++) {
                l[e + i] = a[s + i];
                p[e + i] = u[s + i];
            }
        }
    }
    for (f = 0; f < r.length; f++) {
        const t = r[f] >> 6;
        const s = i[r[f] & 63];
        l[t] = a[s];
        p[t] = u[s];
    }
    t.Mt = l;
    t.St = p;
    t.wt = e;
    t.yt = s.slice(0);
    // Dispose unmatched sources LAST (general-path ordering).
        for (h = 0; h < i.length; h++) {
        if (c === undefined || !c[h]) u[i[h]].dispose();
    }
    return true;
}

function updateKeyedMap() {
    const t = this.Ot() || [], s = t.length;
    t[$TRACK];
 // top level tracking
        runWithOwner(this.ie, () => {
        let e, i, r, n, 
        // Mappers write freshly-created row/index signals into the STAGE
        // arrays (`rows`/`indexes`), never into `this._rows`/`this._indexes`.
        o = this.jt ? this.gt ? () => {
            r[i] = signal(t[i], pureOptions);
            return this.At(accessor(r[i]), i);
        } : () => {
            r[i] = signal(t[i], pureOptions);
            n && (n[i] = signal(i, pureOptions));
            return this.At(accessor(r[i]), n ? accessor(n[i]) : undefined);
        } : this.kt ? () => {
            const s = t[i];
            n[i] = signal(i, pureOptions);
            return this.At(s, accessor(n[i]));
        } : () => {
            const s = t[i];
            return this.At(s);
        };
        // fast path for empty arrays
                if (s === 0) {
            if (this.wt !== 0) {
                this.ie.dispose(false);
                this.St = [];
                this.yt = [];
                this.Mt = [];
                this.wt = 0;
                this.jt && (this.jt = []);
                this.kt && (this.kt = []);
            }
            if (this.bt && !this.Mt[0]) {
                // an aborted fallback attempt leaves an owner without a mapping;
                // dispose it before re-creating
                this.St[0]?.dispose();
                this.Mt[0] = runWithOwner(this.St[0] = createOwner(), this.bt);
            }
        }
        // fast path for new create
         else if (this.wt === 0) {
            const h = new Array(s);
            const f = new Array(s);
            r = this.jt && new Array(s);
            n = this.kt && new Array(s);
            try {
                for (i = 0; i < s; i++) h[i] = runWithOwner(f[i] = createOwner(), o);
            } catch (t) {
                for (e = 0; e <= i; e++) f[e]?.dispose();
                throw t;
            }
            // commit
                        if (this.St[0]) this.St[0].dispose();
 // previous fallback
                        this.Mt = h;
            this.St = f;
            r && (this.jt = r);
            n && (this.kt = n);
            this.yt = t.slice(0);
            this.wt = s;
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
                        const _ = (this.Wt = currentOptimisticLane !== null || this.Wt && activeLanes.size !== 0) ? GlobalQueue.st : setSignal;
            // skip common prefix
                        for (h = 0, f = Math.min(this.wt, s); h < f && (this.yt[h] === t[h] || this.jt && compare(this.Kn, this.yt[h], t[h])); h++) {
                if (this.jt) _(this.jt[h], t[h]);
            }
            // skip common suffix — counted only; retained entries land in one pass
            // at commit instead of being staged and copied twice
                        for (f = this.wt - 1, c = s - 1; f >= h && c >= h && (this.yt[f] === t[c] || this.jt && compare(this.Kn, this.yt[f], t[c])); f--, 
            c--) ;
            // no structural change (every position matched in place at equal
            // length — the common post-reconcile shape): keep the same mapped
            // array identity so downstream consumers don't re-run at all
                        if (h === s && this.wt === s) {
                this.yt = t.slice(0);
                return;
            }
            // SMALL-MOVE FAST PATH: extracted to its own function — inlining it
            // here bloats updateKeyedMap past the JIT's optimization budget and
            // deoptimizes the GENERAL path (measured 2x on reverse). Gated to
            // LARGE trimmed windows: when the trims already shrank the window
            // (plain removals, tail edits), the general path is window-
            // proportional and cheap — the fast path would only re-walk what the
            // trims proved.
                        if (s <= this.wt && f - h > 64 && this.jt === undefined && this.kt === undefined) {
                // PROBE before the scan: a small move keeps a mid-window item within
                // ±32 of its old position; a REPLACE (all fresh items — the shape
                // every page's first structural pass usually is) has it nowhere.
                // ~65 compares, no allocation, and the scan function is never
                // compiled for a replace (its cold first-call compile was the cost).
                const e = h + (c - h >> 1);
                const i = t[e];
                const r = Math.min(f, e + 32);
                let n = Math.max(h, e - 32);
                while (n <= r && this.yt[n] !== i) n++;
                if (n <= r && trySmallMove(this, t, s, h)) return;
            }
            const y = s - this.wt;
            const A = new Array(s);
            const M = new Array(s);
            r = this.jt ? new Array(s) : undefined;
            n = this.kt ? new Array(s) : undefined;
            // 0) prepare a map of all indices in the changed window of newItems,
            // scanning backwards so we encounter them in natural order
                        l = new Map;
            p = new Array(c + 1);
            for (i = c; i >= h; i--) {
                a = t[i];
                u = this.Kn ? this.Kn(a) : a;
                e = l.get(u);
                p[i] = e === undefined ? -1 : e;
                l.set(u, i);
            }
            // 1) step through the old changed window and see if items can be found
            // in the new set; if so, stage them at their new positions; if not,
            // queue them for disposal at commit
                        for (e = h; e <= f; e++) {
                a = this.yt[e];
                u = this.Kn ? this.Kn(a) : a;
                i = l.get(u);
                if (i !== undefined && i !== -1) {
                    A[i] = this.Mt[e];
                    M[i] = this.St[e];
                    r && (r[i] = this.jt[e]);
                    n && (n[i] = this.kt[e]);
                    i = p[i];
                    l.set(u, i);
                } else {
                    (d ??= []).push(this.St[e]);
                    if (false && attrHooks !== null) ;
                }
            }
            // 2) create new rows into the temp arrays; an abort disposes only these
                        try {
                for (i = h; i <= c; i++) {
                    if (M[i] !== undefined) continue;
                    (m ??= []).push(M[i] = createOwner());
                    if (false && attrHooks !== null) ;
                    A[i] = runWithOwner(M[i], o);
                }
            } catch (t) {
                if (m) for (e = 0; e < m.length; e++) m[e].dispose();
                throw t;
            }
            // 3) commit: land the retained prefix and suffix plus the staged window
            // into the fresh arrays, swap them in (new identity for downstream
            // change propagation), then dispose exited rows
                        for (e = 0; e < h; e++) {
                A[e] = this.Mt[e];
                M[e] = this.St[e];
                r && (r[e] = this.jt[e]);
                n && (n[e] = this.kt[e]);
            }
            for (i = h; i <= c; i++) {
                if (r) _(r[i], t[i]);
                if (n) _(n[i], i);
            }
            for (i = c + 1; i < s; i++) {
                A[i] = this.Mt[i - y];
                M[i] = this.St[i - y];
                if (r) {
                    r[i] = this.jt[i - y];
                    _(r[i], t[i]);
                }
                if (n) {
                    n[i] = this.kt[i - y];
                    if (y !== 0) _(n[i], i);
                }
            }
            this.Mt = A;
            this.St = M;
            r && (this.jt = r);
            n && (this.kt = n);
            this.wt = s;
            // save a copy of the mapped items for the next update
                        this.yt = t.slice(0);
            if (d) for (e = 0; e < d.length; e++) d[e].dispose();
            if (false && attrHooks !== null && w !== undefined && O !== undefined) ;
        }
    });
    return this.Mt;
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
 */ function repeat(t, s, e) {
    const i = s;
    const r = {
        ie: createOwner(),
        wt: 0,
        vt: 0,
        It: t,
        At: i,
        St: [],
        Mt: [],
        Ct: e?.from,
        bt: e?.fallback
    };
    const n = computed(updateRepeat.bind(r));
    // Same as mapArray: untracked reads inside the internal owner resolve via
    // _parentComputed, so async reads in row callbacks register with the node
    // (pending tracking + post-settle retry) instead of vanishing.
        r.ie.qn = n;
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
    const t = this.It();
    const s = this.Ct?.() || 0;
    runWithOwner(this.ie, () => {
        if (t === 0) {
            if (this.wt !== 0) {
                this.ie.dispose(false);
                this.St = [];
                this.Mt = [];
                this.wt = 0;
                // Reset offset to match the cleared data (#2767, repro 2).
                                this.vt = 0;
            }
            if (this.bt && !this.Mt[0]) {
                // an aborted fallback attempt leaves an owner without a mapping;
                // dispose it before re-creating
                this.St[0]?.dispose();
                this.Mt[0] = runWithOwner(this.St[0] = createOwner(), this.bt);
            }
            return;
        }
        const e = s + t;
        const i = this.vt + this.wt;
        // Retained overlap [keepStart, keepEnd) in global indexes; empty when the
        // windows are disjoint or when coming from empty/fallback.
                const r = Math.max(s, this.vt);
        const n = Math.min(e, i);
        const o = new Array(t);
        const h = new Array(t);
        for (let t = r; t < n; t++) {
            h[t - s] = this.St[t - this.vt];
            o[t - s] = this.Mt[t - this.vt];
        }
        try {
            for (let t = s; t < e; t++) {
                if (t >= r && t < n) continue;
                o[t - s] = runWithOwner(h[t - s] = createOwner(), () => this.At(t));
            }
        } catch (t) {
            for (let t = s; t < e; t++) if ((t < r || t >= n) && h[t - s]) h[t - s].dispose();
            throw t;
        }
        // commit: dispose the previous fallback or the rows leaving the window
                if (this.wt === 0) this.St[0]?.dispose(); else for (let t = this.vt; t < i; t++) if (t < s || t >= e) this.St[t - this.vt].dispose();
        this.Mt = o;
        this.St = h;
        this.vt = s;
        this.wt = t;
    });
    return this.Mt;
}

function compare(t, s, e) {
    return t ? t(s) === t(e) : true;
}

export { mapArray, repeat };