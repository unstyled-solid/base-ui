import { CONFIG_AUTO_DISPOSE, STATUS_PENDING, STATUS_UNINITIALIZED, NOT_PENDING, CONFIG_OPTIMISTIC, CONFIG_HELD_TRUTH, unwrapOverride } from "../../core/constants.js";

import { computed, untrack, hasActiveOverride, setSignal, isEqual, visibleOverride } from "../../core/core.js";

import { getOwner } from "../../core/owner.js";

import { activeTransition, GlobalQueue, currentTransition, globalQueue, createTransition, runAsTransitionBatch } from "../../core/scheduler.js";

import "../../core/invariants.js";

import "../../core/verdict.js";

import "../../core/effect.js";

import { installOptimisticEngine } from "../../core/optimistic.js";

import { $TARGET, markRawIngest, setNextOptimisticViewResolver, isWrappable, rawValuesUsed, isRawValue } from "../store.js";

import { runProjectionComputedNext } from "./projection.js";

import { wrapNext, runAuthoritative, storeSetterNext, unwrapValue, targetsEqual, heldMaskView, getNode, getHasNode, getKeySetNode, bumpDeep, stagedTruthPB, authoritativeRead, authoritativeServe, readerOverride } from "./store.js";

import { sameKey } from "./reconcile.js";

import { setOptHooks, $OWNER, lookupTarget } from "./target.js";

/**
 * Store rewrite — optimistic stores (§3/§7, RUL-3): no store-side layer, no
 * backup snapshots. Nodes in an optimistic family are ARMED core signals
 * (`_overrideValue` slot), so every user write rides the engine's
 * optimisticWrite — per-transaction ownership, entanglement, reverts, and
 * flash-at-flush are inherited, not reimplemented. Membership edits live on
 * armed presence nodes (the §6 overlay), so structural optimism reverts with
 * the same per-transaction granularity (FINDING-2's fix by construction).
 *
 * Derived form = an optimistic projection. Landings follow the fold rule
 * (#3164, RUL-2 as re-ruled): while a transaction retains optimistic edits
 * on the family, truth that lands STAGES into that transaction — a keyed
 * identity-preserving walk written through the ordinary staged setter
 * channel — and reveals atomically at settle, exactly like a signal landing
 * under an active override (asyncWrite's held branch). Optimistic edits are
 * never consumed by landings; they live exactly as long as their transaction
 * and die by engine-native revert. With no retainer, landings commit
 * immediately under projectionWriteActive (authoritative, silently beneath
 * any bare-write overrides — those ride the flight's own transition, #2951).
 * Authoritative readers (until()'s predicate) tunnel into staged truth via
 * the node read path's pending-value arm. The transitionBlocked store-half
 * (#2951) is installed here for next-shaped targets, chaining the
 * legacy/engine checks.
 */
/** #3164 fold: a stamped truth is HELD (masked from ordinary readers until
 * the reveal) only while its transition is live AND retaining optimism —
 * overrides are what make partial-coverage composition a tear. A plain
 * async transition carries no overrides, so downstream computes must see
 * staged values to converge (normal speculation). Resolves merges first:
 * merge unions optimistic nodes/stores into the target. */ function transitionHoldsOptimism(e) {
    const t = currentTransition(e);
    return t.Rn !== true && (t.cn.length !== 0 || t.ti.size !== 0);
}

let blockedInstalled = false;

function installNextBlockedHalf() {
    if (blockedInstalled) return;
    blockedInstalled = true;
    // Late-bind the optimistic machinery into the plain store/reconcile paths
    // (all call sites are fam?.opt-gated, so this always runs first) and the
    // affects witness's view resolver.
        setOptHooks({
        notifyOptimisticWrites: notifyOptimisticWrites,
        optimisticView: optimisticView,
        applyTentative: applyTentative,
        retainsOptimism: transitionHoldsOptimism
    });
    // The affects() declaration walk is a WRITER channel (A28 (5)): tagging a
    // parent covers the record as the writer sees it, this tick's optimistic
    // writes included — the draft view, not the reader view.
        setNextOptimisticViewResolver((e, t) => optimisticView(e, t, true));
    // Scheduler flush tails call _clearOptimisticStores whenever tracked
    // stores exist; next has no layer to clear — reverts are engine-native —
    // so the hook only empties the batch set.
        if (!GlobalQueue._t) {
        GlobalQueue._t = e => {
            for (const t of e) {
                const e = t?.[$TARGET];
                const n = e?.fam?.overlaid;
                if (n !== undefined) {
                    for (const e of n) {
                        // Keyset resync (classic channel twin): the keyset node's own
                        // revert can compare EQUAL (a landing's bump matched the
                        // tentative bump) while the arrangement underneath changed —
                        // mapArray/ownKeys subscribers must re-read the post-revert
                        // view. Authoritative bump: never re-arm the node we are
                        // clearing.
                        if (e.k !== null) runAuthoritative(() => setSignal(e.k, e => e + 1));
                    }
                }
            }
            e.clear();
        };
    }
    // Revert-side link refresh (#3672, §7b/O6): a chained node's `_value` is
    // never served — the base's live value is — so the engine cannot read
    // committed truth from it. The engine consults it at exactly two moments:
    // optimisticWrite's no-op check (the setter hands it the visible value,
    // see `emit` in notifyOptimisticWrites) and resolveOptimisticNodes'
    // notify compare (here). Left at the write-time value, a base commit
    // during the override — confirm 7, user writes back to the pre-write 5 —
    // made the revert compare 5 === 5 and notify nobody while the base read 7:
    // a memo over the view stayed at the guess forever (render effects were
    // rescued by readsHeldCommitted's replay). Refresh every armed node of
    // each chained host in the reverting batch to the base's live value right
    // before the compare, so it is exact: notify iff truth differs from the
    // guess. Untracked: a flush from inside a computation must not link it.
        const e = GlobalQueue.oi;
    GlobalQueue.oi = t => {
        let n = null;
        for (const e of t) {
            const t = e.Bn;
            if (t?.ch !== true || n?.has(t)) continue;
            (n ??= new Set).add(t);
            untrack(() => {
                const e = t.v;
                for (const n of Reflect.ownKeys(t.n)) {
                    const i = t.n[n];
                    if (hasActiveOverride(i)) i.ce = unwrapValue(e[n]);
                }
                if (t.h !== null) for (const n of Reflect.ownKeys(t.h)) {
                    const i = t.h[n];
                    if (hasActiveOverride(i)) i.ce = n in e;
                }
            });
        }
        e(t);
    };
    const t = GlobalQueue.ai;
    GlobalQueue.ai = e => {
        for (const t of e.ti) {
            const n = t?.[$TARGET];
            const i = n?.fam;
            const r = i?.node;
            // The hold exists to keep optimistic state alive until the store's own
            // truth lands (#2951). Once the family carries NO live overrides (a
            // landing consumed them, or they never existed), a pending firewall is
            // no reason to park the transaction — blocking then leaks it forever
            // when the in-flight question is never answered (undisposed fixtures).
                        if (r == null || !(r.h & STATUS_PENDING)) continue;
            // Ownership is declared (#3146): only the flight's OWN transaction
            // parks on the flight (the #2951 anchor routed the bare write there).
            // A transaction that merely brushed the store never waits for truth
            // it does not carry. An undeclared flight is owned by the firewall's stamp.
                        const o = liveTransition(i.ft ?? r.we);
            if (o !== null && o !== currentTransition(e)) continue;
            if (familyHasLiveOverrides(i)) return true;
        }
        return t(e);
    };
}

function familyHasLiveOverrides(e) {
    const t = e.overlaid;
    if (t === undefined || t.size === 0) return false;
    for (const e of t) {
        for (const t of [ e.n, e.h ]) {
            if (t === null) continue;
            for (const e of Reflect.ownKeys(t)) {
                const n = t[e];
                if (n.o?.Fe !== undefined && n.o?.Fe !== NOT_PENDING) return true;
            }
        }
        if (e.k !== null && e.k.o?.Fe !== undefined && e.k.o?.Fe !== NOT_PENDING) return true;
    }
    t.clear();
 // nothing live — drop the bookkeeping
        return false;
}

function createOptimisticStoreNext(e, t, n) {
    // Engine first (armed nodes need optimisticWrite installed before any
    // node exists), then the next-shape hooks.
    installOptimisticEngine();
    installNextBlockedHalf();
    const i = typeof e === "function";
    const r = i ? n : t;
    const o = i ? t : e;
    const s = {
        map: new WeakMap,
        node: null,
        shallow: !!r?.shallow,
        opt: true
    };
    const l = wrapNext(o, null, null, s);
    s.px = l;
    // Same key resolution the projection channels use ("id" default) — replay's
    // satisfaction rule reads it off the family.
        const u = r?.key === undefined ? "id" : r.key;
    s.key = typeof u === "function" ? u : u === null ? null : e => isWrappable(e) ? e[u] : undefined;
    if (s.shallow) {
        l[$TARGET].s = true;
        markRawIngest(o);
    }
    if (i) {
        const t = e;
        // #3146: an async settle event belongs to the flight's OWN transaction.
        // A live declared one re-enters (a merge if the generic settle path
        // already entered a graph-stamped stranger — the landing supersedes any
        // recompute deriving from that stranger's world); a dead one renews (per
        // A18(1) each arrival reveals on its own schedule, so per-yield
        // transactions die with their commit and the next settle event opens the
        // flight's next one — still declared, never anonymous). An UNDECLARED
        // flight (loading window) keeps the ambient reveal (#2933: the loading
        // rail is transaction-invisible).
                const enterFlightTransition = () => {
            const e = s.ft;
            if (e == null) return;
            let t = liveTransition(e);
            if (t === null) s.ft = t = createTransition();
            s.node.we = t;
            globalQueue.initTransition(t);
        };
        // Landing router (#3164 fold ruling): while a transaction retains
        // optimistic edits on this family, truth landings stage INTO it and
        // reveal atomically at settle; with no retainer they commit immediately
        // under the authoritative posture (async commits land outside the
        // computed's sync body, so the posture is re-applied here) — inside the
        // flight-owned transaction (#3146). Sync commits (the derive's body,
        // owner is the firewall itself) reveal with their own recompute's flush.
                const wrapCommit = (e, t) => {
            const n = retainingTransition(s);
            if (n !== null) return void stageLanding(s, n, t);
            if (getOwner() !== s.node) enterFlightTransition();
            runAuthoritative(e);
        };
        // Draft writes (the derive mutating its draft, sync body and post-await
        // continuations alike) are the same truth channel per-operation: bind
        // each op to the retaining transaction so its node writes stage and its
        // backing fold defers (ensurePB stamps foldBatches with the swapped-in
        // batch; the write-override eager-commit branch in notifyWrites yields
        // to any active transaction).
                const aroundDraftWrite = e => {
            const t = retainingTransition(s);
            if (t === null) e(); else runFolded(t, e);
        };
        // Flight declaration (#3146): a recompute that registered a truth-flight
        // OWNS its transaction. The ask's transaction is recorded on the family
        // (created by the flight's own pending throw when none was ambient, the
        // causing write's/refresh's when one was — graph-driven causality) and
        // the firewall is stamped so every settle path resolves the flight's
        // transaction by construction, not by whatever last brushed the node.
        // When the ask took none (a dead stale stamp — the previous flight's,
        // cleared nowhere — bare-returns the pre-throw entry), the flight opens
        // its own here, same activation point as the pre-throw's creation: the
        // ambient batch (the causing write, same-tick bare optimism) adopts into
        // it exactly as it would have there, and the pending notification that
        // follows this unwind registers observers against it. The flight
        // also registers as its own async reporter: the transaction lives
        // exactly as long as the question is unanswered, observed or not — the
        // #2951 refetch-hold no longer depends on a tracked observer having
        // happened to register one. Loading-window flights declare nothing
        // (#2933: the loading rail is transaction-invisible); a sync run clears
        // the declaration.
                const declareFlight = e => {
            if (e.o?.Ce == null) {
                if (!e.ve) s.ft = null;
                return;
            }
            // First flight (#3146 carve-out): nothing has ever committed, so there
            // is no truth to keep on screen and no optimistic state to protect. An
            // uninitialized ask suspends its readers into their Loading boundary
            // exactly like a plain derived store's first flight — declaring a
            // transaction here instead held the ROOT MOUNT (render()'s scheduled
            // insert rides transitions) until the fetch landed, so the boundary's
            // fallback never showed and the whole page stayed blank. The loading
            // window (#2933) already declares nothing for the same reason; once
            // the first truth lands, every refetch flight declares as before.
                        if (e.ve || e.h & STATUS_UNINITIALIZED) return;
            let t = activeTransition;
            if (t === null) globalQueue.initTransition(t = createTransition());
            s.ft = t;
            e.we = t;
            let n = t.le.get(e);
            if (n === undefined) t.le.set(e, n = new Set);
            n.add(e);
        };
        let n;
        if (r?.seedLoadingValue) n = {
            loadingValue: undefined
        };
        const i = computed(() => {
            const e = getOwner();
            try {
                runAuthoritative(() => runProjectionComputedNext(l, t, r?.key === undefined ? "id" : r.key, wrapCommit, aroundDraftWrite));
            } finally {
                declareFlight(e);
            }
        }, n);
        i.C &= ~CONFIG_AUTO_DISPOSE;
        s.node = i;
    }
    return [ l, e => {
        // Retention ledger (#3164): record the owning transaction so landings
        // know to fold. Captured at entry — the action machinery has the
        // transaction ambient while user code runs; a bare write with no
        // transaction retains nothing (it rides the flight's own transition
        // per #2951 and dies with it).
        const t = activeTransition;
        storeSetterNext(l, e);
        if (t !== null) (s.rt ??= new Set).add(t);
    } ];
}

/** Resolve a retained transition through its merge chain (`_done` holds the
 * merge target while merged, `true` once settled). Null = dead. */ function liveTransition(e) {
    if (e === null) return null;
    while (typeof e.Rn === "object") e = e.Rn;
    return e.Rn === true ? null : e;
}

/** The transaction truth landings fold into: the first live member of the
 * family's retention ledger (dead members prune here). Multiple live
 * retainers entangle through their shared family writes and settle
 * together, so folding into the first reaches all of them. */ function retainingTransition(e) {
    const t = e.rt;
    if (t === undefined || t.size === 0) return null;
    let n = null;
    for (const e of t) {
        const i = liveTransition(e);
        if (i === null) t.delete(e); else n ??= i;
    }
    return n;
}

/** Fold a landing into the retaining transaction (#3164): the landed value
 * is written through the ORDINARY staged setter channel — node writes park
 * as `_pendingValue` registered with the transaction's batch (speculation
 * and until()'s authoritative tunnel see them; live view stays coherent),
 * and the backing fold defers via the foldBatches stamp — under the
 * authoritative posture, so armed nodes take the engine bypass and no
 * override is created. The engine's own commit machinery reveals everything
 * atomically when the transaction settles (transitions never abort: failed
 * actions still commit — only optimistic overrides revert). */ function stageLanding(e, t, n) {
    runFolded(t, () => runAuthoritative(() => storeSetterNext(e.px, t => {
        stagedApply(t, unwrapValue(n), e.key ?? null);
    }, false)));
}

/** Run a fold write inside the retaining transaction's batch, then
 * transition-stamp its staged nodes NOW (parity with the parked-transition
 * flush path's reassignPendingTransition): the stamp is what routes stale
 * (render) readers to the committed value — core read's cross-transaction
 * guard — and what makes foldHeld defer the backing for context-free
 * readers. A microtask staging never crosses that flush path, so without
 * the stamp a render effect's speculative recompute would compose staged
 * truth with live overrides — the #3164 tear, one window later. Armed
 * nodes additionally raise CONFIG_HELD_TRUTH: their staged value is
 * confirming truth masked from ordinary readers until the reveal (plain
 * staged nodes stay visible — normal speculation; override-covered nodes
 * stay unarmed — the override is their display and its revert their
 * notification, A17). */ function runFolded(e, t) {
    runAsTransitionBatch(e, t);
    const n = e.Gn;
    for (let t = 0; t < n.length; t++) {
        const i = n[t];
        i.we = e;
        if (i.C & CONFIG_OPTIMISTIC && !hasActiveOverride(i)) i.C |= CONFIG_HELD_TRUTH;
    }
}

/** Keyed identity-preserving deep merge through live draft proxies — the
 * staged twin of the adoption walk. Reads see the pending backing (staged
 * view), so consecutive landings during one hold compose; key-matched rows
 * keep their raw (and so their proxy) in the slot with only changed leaves
 * written; unmatched rows land wholesale. Runs inside stageLanding's
 * authoritative bracket: drafts seed from committed truth, never overlays. */ function stagedApply(e, t, n) {
    const i = Array.isArray(e);
    if (i && Array.isArray(t)) {
        const i = t.length;
        if (n !== null) {
            // Occurrence-aware key queues (parity with the adoption window):
            // duplicate keys match per occurrence, each current row consumed once.
            let r = null;
            const o = e.length;
            for (let t = 0; t < o; t++) {
                const i = unwrapValue(e[t]);
                if (!isWrappable(i)) continue;
                const o = n(i);
                if (o === undefined) continue;
                const s = (r ??= new Map).get(o);
                if (s === undefined) r.set(o, [ i ]); else s.push(i);
            }
            // Echo adoption: an optimistic structural add whose key the landing
            // confirms must keep its raw (and so its proxy — list drivers keep the
            // DOM row). Tentative rows never reach committed truth (they live in
            // node overrides), so key-match the draft target's active override
            // rows as a secondary pool. Committed rows queued first own their
            // keys; overlay rows only extend coverage. Adopted raws enter staged
            // truth; at settle the override reverts and the reveal re-seats the
            // same raw.
                        const s = e[$TARGET]?.n;
            if (s != null) {
                for (const e of Reflect.ownKeys(s)) {
                    const t = s[e];
                    if (!hasActiveOverride(t)) continue;
                    const i = unwrapValue(unwrapOverride(t.o.Fe));
                    if (!isWrappable(i)) continue;
                    const o = n(i);
                    if (o === undefined) continue;
                    const l = (r ??= new Map).get(o);
                    if (l === undefined) r.set(o, [ i ]); else l.push(i);
                }
            }
            for (let o = 0; o < i; o++) {
                const i = t[o];
                let s;
                if (isWrappable(i) && r !== null) {
                    const e = n(i);
                    if (e !== undefined) {
                        for (const [t, n] of r) {
                            if (!sameKey(t, e)) continue;
                            s = n.shift();
                            if (n.length === 0) r.delete(t);
                            break;
                        }
                    }
                }
                if (s !== undefined) {
                    if (unwrapValue(e[o]) !== s) e[o] = s;
                    stagedApply(e[o], i, n);
                } else {
                    const t = unwrapValue(e[o]);
                    if (!isEqual(t, i) && !targetsEqual(t, i)) e[o] = i;
                }
            }
        } else {
            for (let r = 0; r < i; r++) {
                const i = t[r];
                const o = unwrapValue(e[r]);
                if (o === i) continue;
                if (isWrappable(i) && isWrappable(o) && Array.isArray(i) === Array.isArray(o)) stagedApply(e[r], i, n); else if (!isEqual(o, i) && !targetsEqual(o, i)) e[r] = i;
            }
        }
        if (e.length !== i) e.length = i;
        return;
    }
    // Object merge; also the degenerate root-kind-change shape (arrays accept
    // keyed writes/deletes, so a wholesale restatement still lands staged).
        for (const r of Reflect.ownKeys(t)) {
        if (i && r === "length" || r === $OWNER) continue;
        const o = t[r];
        const s = unwrapValue(e[r]);
        if (s === o) continue;
        if (isWrappable(o) && isWrappable(s) && Array.isArray(o) === Array.isArray(s)) {
            // Different-keyed entities never merge (tentative-channel parity):
            // the incoming object replaces the slot wholesale.
            if (n !== null) {
                const t = n(s);
                const i = n(o);
                if (t !== undefined && i !== undefined && !sameKey(t, i)) {
                    e[r] = o;
                    continue;
                }
            }
            stagedApply(e[r], o, n);
        } else if (!isEqual(s, o) && !targetsEqual(s, o)) {
            e[r] = o;
        }
    }
    for (const n of Reflect.ownKeys(e)) {
        if (i && n === "length" || n === $OWNER || n in t) continue;
        delete e[n];
    }
}

// ---- optimistic-only store machinery (moved from next/store.ts /
// next/reconcile.ts so plain-store bundles tree-shake it) ----
/** Diff the draft against the current OPTIMISTIC VIEW (committed + active
 * overrides — the same view the draft was seeded from) and emit engine writes
 * for exactly the changed keys. Visible-view diffing keeps no-op writes from
 * entangling lanes (RUL-10 / opt R38). */ function notifyOptimisticWrites(e, t) {
    // A bare write while the store's own truth is in flight rides the FLIGHT'S
    // OWN transaction (#2951 via the #3146 declaration): entangle it so the
    // override survives until the refetch settles instead of flash-reverting
    // at plain flush end. The blocked-check store-half keeps that transaction
    // from settling while the firewall is pending. Declared ownership replaces
    // the old circumstantial route through the firewall's `_transition` stamp,
    // which was whatever last brushed the node.
    const n = e.fam?.ft;
    if (n != null) {
        const e = liveTransition(n);
        if (e !== null) globalQueue.initTransition(e);
    }
    // The write is judged against what ordinary readers SEE, not against the
    // committed backing slot: under an adoption hold (#3074) `t.v` is already
    // the truth a live transaction is holding, and an optimistic write equal
    // to it compared as a no-op — no override, no lane, and the screen kept
    // the pre-hold value until the transaction committed (#3330's store
    // twin: `s.v = 1` after a `yield` while the derive had already staged
    // `v: 1`). Signal parity: the override reveals on its lane now, with its
    // derivations; the held truth reveals on the transaction's schedule.
        const i = heldMaskView(e) ?? e.v;
    // Compare RAWS on both sides (`nv` below is unwrapped already). A chained
    // target's `old` is the inner store's proxy, whose reads hand back inner
    // child PROXIES; the draft's clone holds the inner raws. Comparing the two
    // as-is marked every untouched row changed, and the overlay then served
    // each from an override as a fresh non-chained target — row identities
    // churned for the life of the action and snapped back at settle (#3323).
        const visible = (t, n) => {
        const i = e.n?.[t];
        return unwrapValue(i !== undefined && hasActiveOverride(i) ? unwrapOverride(i.o?.Fe) : n);
    };
    const visiblePresent = t => {
        const n = e.h?.[t];
        return n !== undefined && hasActiveOverride(n) ? !!unwrapOverride(n.o?.Fe) : t in i;
    };
    // Chained nodes are links (§7b, O6): their `_value` is never served and
    // never learns the base's commits, yet optimisticWrite's no-op check reads
    // it (#3672). Hand it the visible committed value at the write; the revert
    // compare gets the same treatment in installNextBlockedHalf.
        const emit = (t, n, i) => {
        if (e.ch && !hasActiveOverride(t)) t.ce = n;
        setSignal(t, () => i);
    };
    let r = false;
    const o = Array.isArray(t);
    for (const n of Reflect.ownKeys(t)) {
        if (o && n === "length" || n === $OWNER) continue;
        const s = unwrapValue(t[n]);
        if (!visiblePresent(n)) {
            // Optimistic add: value node + presence node + membership bump.
            const t = unwrapValue(i[n]);
            emit(getNode(e, n, t), t, s);
            emit(getHasNode(e, n, n in i), n in i, true);
            r = true;
        } else {
            const t = visible(n, i[n]);
            if (!isEqual(t, s) && !targetsEqual(t, s)) {
                emit(getNode(e, n, t), t, s);
                if (o) r = true;
            }
        }
    }
    for (const n of Reflect.ownKeys(i)) {
        if (o && n === "length" || n === $OWNER) continue;
        if (n in t || !visiblePresent(n)) continue;
        // Optimistic delete: node reads undefined, presence flips, membership bumps.
                const s = unwrapValue(i[n]);
        emit(getNode(e, n, s), s, undefined);
        emit(getHasNode(e, n, true), true, false);
        r = true;
    }
    if (o) {
        const n = visible("length", i.length);
        if (n !== t.length) {
            emit(getNode(e, "length", n), n, t.length);
            r = true;
        }
    }
    if (r) setSignal(getKeySetNode(e), e => e + 1);
    // Deep-witness: optimistic value writes notify deep() subscribers too
    // (structural ones already ride the key-set bump above).
        bumpDeep(e);
    // Discard the draft — committed raw is untouched (revert target by
    // construction) — restoring any truth-staged backing this draft displaced
    // (#3164 fold: ensurePB parked it so tentative writes could not pollute
    // staged truth). Register the root store for the scheduler's settle hooks.
        e.pb = stagedTruthPB.get(e) ?? null;
    if (e.pb !== null) stagedTruthPB.delete(e);
    (e.fam.overlaid ??= new Set).add(e);
    GlobalQueue.fi?.(e.fam.px ?? e.px);
}

/** Optimistic-view composition for snapshot/deep (O1: snapshot is the CURRENT
 * view, lane values included; a fresh copy per call during pending windows —
 * RUL-12). Returns `src` untouched when no override is active on `t`.
 * Authoritative-view reads (until()'s predicate) skip composition entirely:
 * the predicate observes authoritative truth, never the caller's tentative
 * overlay. (Write-side emission callers never run under such a compute.) */ function optimisticView(e, t, n = false) {
    if (e.fam?.opt !== true || authoritativeRead()) return t;
    let i = null;
    const ensure = () => i ??= Array.isArray(t) ? [ ...t ] : {
        ...t
    };
    // Reader composition (snapshot/deep, the length view with no armed length
    // node) takes a superseded override as the traps serve it (readerOverride,
    // #3331): the writer's draft and the write-side callers (applyTentative,
    // applyAdopt's key-matching view) keep the override itself.
        const r = !n && !authoritativeServe();
    const o = e.n;
    if (o !== null) {
        for (const e of Reflect.ownKeys(o)) {
            const i = o[e];
            // A28 (5): readers see an optimistic write once a flush carried it;
            // the draft (writer channel) composes on it now.
                        if (!(n ? hasActiveOverride(i) : visibleOverride(i))) continue;
            if (e === "length" && Array.isArray(t)) {
                const e = t.length;
                const n = r ? readerOverride(i, e) : unwrapOverride(i.o?.Fe);
                if (e !== n) ensure().length = n;
            } else {
                const n = t[e];
                const o = r ? readerOverride(i, n) : unwrapOverride(i.o?.Fe);
                if (!isEqual(n, o)) ensure()[e] = o;
            }
        }
    }
    const s = e.h;
    if (s !== null) {
        for (const e of Reflect.ownKeys(s)) {
            const o = s[e];
            // A28 (5): readers see an optimistic write once a flush carried it;
            // the draft (writer channel) composes on it now.
                        if (!(n ? hasActiveOverride(o) : visibleOverride(o))) continue;
            const l = e in (i ?? t);
            const u = !!(r ? readerOverride(o, l) : unwrapOverride(o.o?.Fe));
            if (!u && l) delete ensure()[e];
        }
    }
    return i ?? t;
}

function applyTentative(e, t, n) {
    const i = e.pb ?? e.v;
    const r = optimisticView(e, i);
    const o = e.fam;
    const s = Array.isArray(t);
    if (Array.isArray(r) !== s) return;
 // kind change at root: flat overrides below
        const l = [];
    let u;
    if (s) u = [ ...t ]; else {
        u = {};
        for (const e of Reflect.ownKeys(t)) if (e !== $OWNER) u[e] = t[e];
    }
    const match = (e, t) => {
        if (!isWrappable(e) || !isWrappable(t)) return null;
        if (rawValuesUsed && (isRawValue(e) || isRawValue(t))) return null;
        if (Array.isArray(e) !== Array.isArray(t)) return null;
        if (n) {
            const i = n(e);
            const r = n(t);
            // SameValueZero (re-audit 3, P1-3): parity with the plain reconcile
            // channel — NaN keys are self-equal.
                        if (i !== undefined && r !== undefined && !sameKey(i, r)) return null;
        }
        return lookupTarget(unwrapValue(e), o) ?? null;
    };
    if (s) {
        const e = r;
        let i = null;
        for (let r = 0; r < t.length; r++) {
            const o = t[r];
            if (!isWrappable(o)) continue;
            let s;
            if (n) {
                const t = n(o);
                if (t !== undefined) {
                    if (i === null) {
                        // Occurrence-aware index queues (re-audit 3, P1-3): parity with
                        // the plain adoption window — duplicate keys match per
                        // occurrence, each view row consumed once.
                        i = new Map;
                        for (let t = 0; t < e.length; t++) {
                            const r = unwrapValue(e[t]);
                            if (isWrappable(r)) {
                                const e = n(r);
                                if (e === undefined) continue;
                                const o = i.get(e);
                                if (o === undefined) i.set(e, t); else if (Array.isArray(o)) o.push(t); else i.set(e, [ o, t ]);
                            }
                        }
                    }
                    const r = i.get(t);
                    if (r === undefined) s = undefined; else if (Array.isArray(r)) {
                        s = unwrapValue(e[r.shift()]);
                        if (r.length === 1) i.set(t, r[0]);
                    } else {
                        s = unwrapValue(e[r]);
                        i.delete(t);
                    }
                } else s = unwrapValue(e[r]);
            } else s = unwrapValue(e[r]);
            const a = match(s, o);
            if (a !== null) {
                // Keep the existing row in the slot (identity preserved); recurse.
                u[r] = unwrapValue(s);
                l.push([ a, o ]);
            }
        }
    } else {
        for (const e of Reflect.ownKeys(t)) {
            if (e === $OWNER) continue;
            const n = unwrapValue(r[e]);
            const i = t[e];
            const o = match(n, i);
            if (o !== null) {
                u[e] = n;
                l.push([ o, i ]);
            }
        }
    }
    // Flat overrides for this level (adds, removals, moved slots, length, leaf
    // values) — preserve any live user draft backing across the call.
        const a = e.pb;
    e.pb = null;
    notifyOptimisticWrites(e, u);
    e.pb = a;
    for (let e = 0; e < l.length; e++) applyTentative(l[e][0], unwrapValue(l[e][1]), n);
}

export { createOptimisticStoreNext, notifyOptimisticWrites, optimisticView, transitionHoldsOptimism };