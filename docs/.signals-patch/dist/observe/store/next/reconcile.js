import { isEqual } from "../../core/core.js";

import "../../core/dev.js";

import { projectionWriteActive } from "../../core/scheduler.js";

import "../../core/invariants.js";

import "../../core/verdict.js";

import "../../core/effect.js";

import { $TARGET, markRawIngest, isWrappable, rawValuesUsed, isRawValue, getWriteOverride } from "../store.js";

import { materializePB, adoptPB, unwrapValue, notifyFold, targetsEqual, bumpDeep, notifyKeyValue, notifyKeyDiff, notifyFoldTail, hasAccessorFlag } from "./store.js";

import { isOwned, $OWNER, storeNextLookup, optHooks, lookupTarget } from "./target.js";

/**
 * Store rewrite — reconcile, the adoption channel (INTERNALS-STORE-STATE.md
 * §3, decision 2026-08-16c). Reconcile never merge-writes: it adopts `next`
 * as the authoritative pending backing at every proxied level (pointer swap
 * folded at flush commit), notification riding the fold's descriptor diff.
 *
 * Structural optimizations (all kept, per 2026-08-17 morning ruling):
 * - Identity skip with completed proof: `incoming === backing && !owned` —
 *   sound because input is immutable by convention (R2a) and ownership marks
 *   the only writer the convention doesn't cover (us). Fixes FINDING-1.
 * - Reachability pruning: descent happens only where a child TARGET exists
 *   (proxies exist only where read) — never-subscribed subtrees are never
 *   walked (recon-snap R17), while a subscriber deep below an untracked path
 *   keeps its chain walkable because wrapping created the intermediate
 *   targets (recon-snap R16).
 * - Keyed matching ported semantics: key-matched rows keep proxy identity;
 *   key mismatch detaches (fresh proxy on next read, recon-snap R18);
 *   keyless items fall back positional; null/primitive slots are legal
 *   members (R11). Kind changes replace wholesale (R10).
 */ function reconcileNextState(e, t, n, o = false) {
    if (t == null) throw new Error("");
    const i = t?.[$TARGET];
    if (i === undefined || i.px !== t) throw new Error("");
    // Reconcile's diff walks need a REAL pending container — a prototype
    // overlay (#3044) materializes to the clone path first (edge: reconcile
    // inside a setter that already wrote this target).
        if (i.ovl) materializePB(i);
    let f = n === null ? null : typeof n === "string" ? e => e?.[n] : n;
    // §7b chained backing: a projection derive returning a LIVE store proxy
    // adopts the proxy itself as the backing — reads flow through the inner
    // store's traps, so consumers subscribe to the inner graph and updates
    // flow with no re-derive (#2941). The adoption diff still notifies THIS
    // store's existing subscribers of the swap.
        if (o && e !== t && e?.[$TARGET] !== undefined) {
        const t = i.pb ?? i.v;
        if (t === e) return;
 // already chained to this store
                adoptPB(i, e);
        return;
    }
    const l = unwrapValue(e);
    if (f) {
        // Root identity precondition — checked before ANY mutation, so a throwing
        // reconcile is atomic by construction (RUL-12 ruling). Projections
        // (replace=true) relax it: a root entity change merges in place — the
        // root proxy is stable for life (proj R5/R11) — and children are NOT
        // key-matched across the entity change (proj R7: keyFn drops to
        // positional so old-entity subtrees never merge into the new entity's).
        const e = i.pb ?? i.v;
        const t = f(e);
        if (t !== undefined && !sameKey(f(l), t)) {
            if (!o) throw new Error("");
            // Entity change: wholesale swap. The root proxy is stable for life
            // (proj R5) but NOTHING below survives — children are never matched
            // across an entity change even when their own keys align (proj R7).
            // Displaced-raw unregistration (proj R10): the outgoing raw stops
            // resolving to this proxy; re-handed later it wraps fresh.
                        const e = i.pb ?? i.v;
            if (isOwned(e)) delete e[$OWNER]; // disown: wraps fresh if re-handed
             else (i.fam?.map ?? storeNextLookup).delete(e);
            adoptPB(i, l);
            return;
        }
    }
    // Tentative channel (§6b, RUL-5): a user-context reconcile on an optimistic
    // family parks as engine overrides — values, membership, and length ride
    // armed nodes (reverting with their transaction); committed raw is never
    // touched. Key-matched rows keep proxy identity by descending into the
    // existing child targets instead of overriding their parent slots.
        if (i.fam?.opt === true && !projectionWriteActive && !getWriteOverride()) {
        optHooks.applyTentative(i, l, f);
        return;
    }
    applyAdopt(i, l, f, o);
}

function applyAdopt(e, t, n, o = false) {
    const i = e.pb ?? e.v;
    // The sound identity skip (O7): same reference AND we never diverged it.
        if (t === i && !isOwned(i)) return;
    const f = e.fam;
    // §6b (R28): the diff's previous-arrangement baseline is the LANE VIEW —
    // optimistic rows must be visible to key matching so a landing carrying the
    // same key recycles their proxies. Raw `prev` keeps the identity/ownership
    // roles above; only matching reads the view.
        const l = f?.opt === true ? optHooks.optimisticView(e, i) : i;
    const r = Array.isArray(t);
    // Plain stores notify inline AFTER the descent (child registrations feed
    // the fold diff's identity-preservation check); projections keep deferred
    // folds (downstream holds can form later in the flush).
        const s = f === null;
    const u = e.s === true;
    // Node-notify base is the view the nodes were last told (#3296): a draft
    // preceding this reconcile already moved them to its pending backing at
    // setter exit (prev, materialized above), so diffing incoming against the
    // committed backing would skip a key the draft changed and the reconcile
    // restores — the node would commit the superseded draft value.
        const a = i;
    adoptPB(e, t, s);
    // Shallow adoption: records are slot values — sticky raw-mark the incoming
    // set (R41) and never descend; slot notification is the positional diff.
        if (u) markRawIngest(t);
    if (Array.isArray(l) !== r) {
        if (s) notifyFold(e, a, t);
        return;
    }
    if (r) {
        const i = l;
        const r = t;
        // Fused array walk (eager mode): per-index notification rides the same
        // loop as the descent (descend first — targetsEqual needs the child's
        // re-registration, R9). Length, trailing removed indexes, and any other
        // unvisited node keys land in the counted sweep below.
                const c = s ? e.n : null;
        let d = 0;
        if (n && !u) {
            // Positional-prefix fast path (legacy keyedMatch-walk parity): while
            // rows key-match in place — the steady-state polling shape — descend
            // directly with zero staging. The prevByKey map is built only for the
            // misaligned remainder, and never at all on aligned ticks.
            const l = i.length;
            const s = r.length;
            let u = false;
            let p = 0;
            for (const y = Math.min(l, s); p < y; p++) {
                const l = r[p];
                const s = i[p];
                // Routing heuristic only (aligned vs keyed remainder) — both routes
                // notify identically and descend() is the one authoritative
                // validator, so bare typeof gates suffice here; full isWrappable
                // per row was the walk's dominant residual cost.
                                if (s !== l && !(s !== null && typeof s === "object" && l !== null && typeof l === "object" && sameKey(n(s), n(l)))) break;
 // misaligned: fall to the keyed remainder below
                // Identity skip inline (FINDING-1 guard), then descend the pair.
                                if ((s !== l || l !== null && typeof l === "object" && isOwned(l)) && l !== null && typeof l === "object") descend(unwrapValue(s), l, n, f, o);
                if (e.dk !== null && !u && !(l !== null && typeof l === "object" ? targetsEqual(s, l) : isEqual(s, l))) {
                    bumpDeep(e);
                    u = true;
                }
                if (c !== null) {
                    const e = c[p];
                    if (e !== undefined) {
                        d++;
                        notifyKeyValue(e, p, a[p], l, a, t);
                    }
                }
            }
            if (e.dk !== null && !u && p < r.length) bumpDeep(e);
            const y = p;
 // misalignment point (== nlen on aligned ticks)
                        let w = null;
            for (;p < r.length; p++) {
                const e = r[p];
                // typeof gates route; descend validates (same contract as the prefix).
                                if (e !== null && typeof e === "object") {
                    const t = n(e);
                    let l;
                    if (t !== undefined) {
                        if (w === null) {
                            // Occurrence-aware (re-audit 2, P1-5): duplicate keys queue
                            // their prev INDICES (rows can themselves be arrays, so index
                            // queues are the unambiguous encoding — same as buildRowOps)
                            // and each is consumed ONCE. First-wins would adopt two next
                            // rows into the SAME prev target while row ops retain two
                            // separate DOM rows (the second one stale).
                            w = new Map;
                            // From structStart, not 0 (re-audit 3, P1-2): prefix-aligned
                            // rows already adopted their incoming counterparts — re-offering
                            // them here let a duplicate key adopt a prefix row AGAIN while
                            // row ops (which correctly window from structStart) retained
                            // the later occurrence's DOM row against a never-adopted target.
                                                        for (let e = y; e < i.length; e++) {
                                const t = unwrapValue(i[e]);
                                if (t !== null && typeof t === "object") {
                                    const o = n(t);
                                    if (o === undefined) continue;
                                    const i = w.get(o);
                                    if (i === undefined) w.set(o, e); else if (Array.isArray(i)) i.push(e); else w.set(o, [ i, e ]);
                                }
                            }
                        }
                        const e = w.get(t);
                        if (e === undefined) l = undefined; else if (Array.isArray(e)) {
                            l = unwrapValue(i[e.shift()]);
                            if (e.length === 1) w.set(t, e[0]);
                        } else {
                            l = unwrapValue(i[e]);
                            w.delete(t);
                        }
                    } else {
                        l = unwrapValue(i[p]);
 // keyless item: positional fallback
                                        }
                    descend(l, e, n, f, o);
                }
                if (c !== null) {
                    const e = c[p];
                    if (e !== undefined) {
                        d++;
                        notifyKeyDiff(e, p, a, t, false);
                    }
                }
            }
        } else {
            const l = Math.min(i.length, r.length);
            const s = r.length;
            let p = false;
            for (let y = 0; y < s; y++) {
                const s = r[y];
                if (!u && y < l && s !== null && typeof s === "object") descend(unwrapValue(i[y]), s, n, f, o);
                if (e.dk !== null && !p && !(s !== null && typeof s === "object" ? targetsEqual(i[y], s) : isEqual(i[y], s))) {
                    bumpDeep(e);
                    p = true;
                }
                if (c !== null) {
                    const e = c[y];
                    if (e !== undefined) {
                        d++;
                        notifyKeyDiff(e, y, a, t, false);
                    }
                }
            }
        }
        if (s) {
            if (c !== null && d < e.nc) {
                for (const e of Reflect.ownKeys(c)) {
                    // visited indexes are < nextRows.length; everything else sweeps
                    const n = typeof e === "string" ? +e : NaN;
                    if (!(n >= 0 && n < r.length)) notifyKeyDiff(c[e], e, a, t, false);
                }
            }
            notifyFoldTail(e, a, t);
        }
        return;
    } else {
        // FUSED adoption walk (eager mode): one pass fetches each key's pair,
        // descends, then notifies its node inline — descend runs FIRST so the
        // child's re-registration is visible to targetsEqual (identity-preserved
        // slots must not notify, R9). This replaces the notifyFold re-walk that
        // doubled dbmon's diff cost. for-in covers own enumerable string keys
        // with no key-array allocation; symbols get a pass only when present.
        const i = s ? e.n : null;
        let r = 0;
        let c = false;
        // The per-key body is inlined on purpose (legacy applyStateFast parity:
        // an extracted helper costs a call per key on the hottest object-diff
        // site). Reference-identical values early-continue BEFORE any other
        // work — sound only with the ownership guard (FINDING-1: an owned
        // backing is setter-diverged and must still diff).
                for (const s in t) {
            const d = t[s];
            const p = a[s];
            const y = d !== null && typeof d === "object";
            if (p === d && (!y || !isOwned(d)) && (i === null || i[s] === undefined || !hasAccessorFlag(i[s]))) {
                if (i !== null && i[s] !== undefined) r++;
                continue;
            }
            if (y && !u) descend(unwrapValue(l[s]), d, n, f, o);
            // Deep-witness (dk): value changes must notify even with NO per-key
            // node — deep() subscribes one node per record. Checked after descend
            // so in-place adoptions (same logical slot) don't bump; child records
            // carry their own witness. One flag + null check when unused.
                        if (e.dk !== null && !c && !(y ? targetsEqual(p, d) : isEqual(p, d))) {
                bumpDeep(e);
                c = true;
            }
            if (i !== null) {
                const e = i[s];
                if (e !== undefined) {
                    r++;
                    notifyKeyValue(e, s, p, d, a, t);
                }
            }
        }
        const d = Object.getOwnPropertySymbols(t);
        for (let e = 0; e < d.length; e++) {
            const s = d[e];
            if (s === $OWNER) continue;
            const c = t[s];
            if (!u && c !== null && typeof c === "object") descend(unwrapValue(l[s]), c, n, f, o);
            if (i !== null) {
                const e = i[s];
                if (e !== undefined) {
                    r++;
                    notifyKeyValue(e, s, a[s], c, a, t);
                }
            }
        }
        if (s) {
            // Deleted-key nodes (in the map but absent from incoming) — counted
            // fast-out: when every node was visited, skip the sweep entirely.
            if (i !== null && r < e.nc) {
                for (const e of Reflect.ownKeys(i)) {
                    if (!hasOwnP.call(t, e)) notifyKeyDiff(i[e], e, a, t, false);
                }
            }
            notifyFoldTail(e, a, t);
        }
        return;
    }
}

const hasOwnP = Object.prototype.hasOwnProperty;

/** Setter-channel row ops (the fold site calls this for array targets with
 * ops consumers): structural mutation through the setter — push/splice/index
/** Key equality for EVERY key comparison in this module (re-audit 2, P1-5):
 * SameValueZero, matching the adoption window's Map-based matcher — NaN keys
 * are equal to themselves, so aligned NaN rows stay aligned in the prefix
 * walk instead of forever misaligning. */ function sameKey(e, t) {
    return e === t || e !== e && t !== t;
}

function descend(e, t, n, o, i = false) {
    if (e === null || typeof e !== "object" || t === null || typeof t !== "object") return;
    // Lookup FIRST: a hit implies pv was wrappable and never raw-marked (only
    // wrappables acquire targets; rawValues never wrap) — one WeakMap get
    // replaces isWrappable(pv) + isRawValue(pv), and a miss prunes untracked
    // subtrees before any further checks.
        const f = lookupTarget(e, o);
    if (f === undefined) return;
 // nothing proxied below this pair
    // The NEW side still validates fully: a frozen/platform/markRaw'd incoming
    // value is a leaf for reconcile — replaced by reference, never recursed
    // into (R42); the parent's slot notification covers the change.
        if (!isWrappable(t)) return;
    if (rawValuesUsed && isRawValue(t)) return;
    t = unwrapValue(t);
    // Kind change replaces wholesale, never merges (R10): a target's carrier
    // class (array vs object) is fixed at creation, so the slot detaches and a
    // fresh proxy of the right kind wraps the incoming value on next read.
        if (Array.isArray(e) !== Array.isArray(t)) return;
    if (n) {
        const o = n(e);
        const i = n(t);
        // Key mismatch detaches: the slot takes the new entity; the old proxy
        // keeps its (old) backing and a fresh proxy wraps the new value on read.
        // SameValueZero (re-audit 2, P1-5): NaN keys are self-equal — strict
        // inequality detached every NaN-keyed slot on every tick while the
        // Map-based row-ops matcher retained its DOM row (stale forever).
                if (o !== undefined && i !== undefined && !sameKey(o, i)) return;
    }
    // Reachability pruning (§6d) is MODE-dependent, both pinned:
    // - keyed matching descends only where subscriptions exist at/below (`d`) —
    //   captured-but-unobserved proxies deliberately detach and go stale
    //   (recon-snap R18; subscribing is what buys liveness);
    // - positional (key: null) pairing preserves slot identity unconditionally
    //   (recon-snap R8 — the fixed-shape dashboard pattern).
    // Projection merges (replace mode) preserve key-matched identity
    // UNCONDITIONALLY (proj R6: the slot keeps its proxy without needing a
    // subscriber below); plain keyed reconcile detaches unobserved captures
    // (recon-snap R18 — staleness is the pinned pruning contract).
        if (!i && n !== null && !f.d) return;
    applyAdopt(f, t, n, i);
}

export { reconcileNextState, sameKey };