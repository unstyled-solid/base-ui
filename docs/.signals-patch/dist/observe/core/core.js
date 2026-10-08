import { releaseFlightTeardown, handleAsync, clearStatus, parkLoadingWindow, notifyStatus, settlePendingSource, settleErroredDependents } from "./async.js";

import { NOT_PENDING, EFFECT_TRACKED, EFFECT_USER, REACTIVE_OPTIMISTIC_DIRTY, CONFIG_DERIVED_OVERRIDE, CONFIG_HELD_CHILDREN, CONFIG_LANE_FRAME, CONFIG_OPTIMISTIC, STATUS_UNINITIALIZED, STATUS_ERROR, STATUS_PENDING, REACTIVE_REASK, REACTIVE_RECOMPUTING_DEPS, REACTIVE_ZOMBIE, CONFIG_SYNC, CONFIG_HAS_LANE, REACTIVE_MISSED_WAKE, REACTIVE_DISPOSED, REACTIVE_SNAPSHOT_STALE, unwrapOverride, CONFIG_DIRECT_COMMIT, CONFIG_HAS_COMPANIONS, CONFIG_PROMOTED, CONFIG_ADOPTED_UNFLUSHED, CONFIG_CHILDREN_FORBIDDEN, CONFIG_FRESH_READ, CONFIG_INPUTS_PUBLISHED, CONFIG_AUTO_DISPOSE, REACTIVE_LAZY, REACTIVE_CHECK, REACTIVE_DIRTY, REACTIVE_IN_HEAP, REACTIVE_IN_HEAP_HEIGHT, REACTIVE_MANUAL_WRITE, CONFIG_AUTHORITATIVE_READ, CONFIG_OVERRIDE_SUPERSEDED, CONFIG_AUTHORITATIVE_OBSERVED, defaultContext, REACTIVE_NONE, CONFIG_HELD_TRUTH, CONFIG_TRANSPARENT, CONFIG_OWNED_WRITE, CONFIG_NO_SNAPSHOT, CONFIG_PLUMBING, CONFIG_IN_SNAPSHOT_SCOPE, NO_SNAPSHOT, CONFIG_HAS_SNAPSHOT, CONFIG_FW_CHILDREN, CONFIG_SLOT_NODE, STORE_SNAPSHOT_PROPS } from "./constants.js";

import { NotReadyError } from "./error.js";

import { clearDeps, trimStaleDeps, link, dormantNodes } from "./graph.js";

import { deleteFromHeap, queueFor, insertIntoHeapHeight, enqueueSub, markNode, markHeap, insertIntoHeap } from "./heap.js";

import { findLane } from "./lanes.js";

import { GRAPH_SIZE_WARN_AT, noteFanIn } from "./dev.js";

import { attrHooks } from "./attribution-hooks.js";

import "./invariants.js";

import { disposeChildren, markDisposal, linkChild, inheritId } from "./owner.js";

import { GlobalQueue, bumpNotifyEpoch, activeTransition, globalQueue, clock, currentTransition, insertSubs, queuePendingNode, wakeParked, heldTrims, runInTransition, schedule, batchJoins, notifyEpoch, dirtyQueue, projectionWriteActive, reaskArmed, armReaskClear } from "./scheduler.js";

// The heap's per-node step. A tracked effect's heap visit is its compute
// phase — empty, like a user effect whose compute reads nothing — and hands
// the callback to the user queue. Routing the wake through the heap, rather
// than straight into the queue at notify time, is what orders the run after
// the commit regardless of which phase the write came from: a write in a
// render-effect callback stages its value for the next pass, but a wake pushed
// directly into the user queue ran in the SAME pass, read the old value, and
// nothing re-notified it when the value landed (#3291).
GlobalQueue.nt = e => {
    if (e.He === EFFECT_TRACKED) {
        deleteFromHeap(e, queueFor(e));
        e.it = true;
        e.T.enqueue(EFFECT_USER, e.lt);
    } else recompute(e);
};

GlobalQueue.ut = disposeChildren;

let tracking = false;

/** @internal verdict-module glue */ function setPendingCheckActive(e) {
    pendingCheckActive = e;
}

/** @internal verdict-module glue */ function setLatestReadActive(e) {
    latestReadActive = e;
}

/** @internal verdict-module glue */ function setContextInternal(e) {
    context = e;
}

let stale = false;

let pendingCheckActive = false;

let latestReadActive = false;

let context = null;

let currentOptimisticLane = null;

/** Notify `node`'s subscribers on `lane`'s channel: they recompute as the
 * lane's passes — a memo publishes a derived override (lanes stage, #3479),
 * an effect runs from the lane's queue, at the park, ahead of the
 * transaction — the display-ahead view. The write itself is already staged
 * (setSignal) and commits with the frame; this walk shows it now. Used by a
 * boundary re-armed from a lane pass (boundaries.ts `_swap`, #3540). */ function notifyOnLane(e, t) {
    const n = currentOptimisticLane;
    currentOptimisticLane = t;
    try {
        insertSubs(e, true);
    } finally {
        currentOptimisticLane = n;
    }
}

let snapshotCaptureActive = false;

let snapshotSources = null;

function ownerInSnapshotScope(e) {
    while (e) {
        if (e.ot) return true;
        e = e._parent;
    }
    return false;
}

function setSnapshotCapture(e) {
    snapshotCaptureActive = e;
    if (e && !snapshotSources) snapshotSources = new Set;
}

function markSnapshotScope(e) {
    e.ot = true;
}

function releaseSnapshotScope(e) {
    e.ot = false;
    releaseSubtree(e);
    schedule();
}

function releaseSubtree(e) {
    let t = e.On;
    while (t) {
        if (t.ot) {
            t = t._n;
            continue;
        }
        if (t.Se) {
            const e = t;
            e.C &= ~CONFIG_IN_SNAPSHOT_SCOPE;
            if (e.oe & REACTIVE_SNAPSHOT_STALE) {
                e.oe &= ~REACTIVE_SNAPSHOT_STALE;
                e.oe |= REACTIVE_DIRTY;
                if (dirtyQueue.st > e.ft) dirtyQueue.st = e.ft;
                insertIntoHeap(e, dirtyQueue);
            }
        }
        releaseSubtree(t);
        t = t._n;
    }
}

function clearSnapshots() {
    if (snapshotSources) {
        for (const e of snapshotSources) {
            // The extension is a fixed-shape object with `_snapshotValue`
            // pre-initialized to undefined (see ext()), and every reader tests
            // `!== undefined` — assign, don't `delete`: deleting a field pushes the
            // object to dictionary mode for every later read of every field.
            const t = e.o;
            if (t != null) t.ct = undefined;
            // StoreNode targets share one pre-initialized hidden class (see
            // createStoreProxy) — same rule, and only when present so signal-node
            // sources don't grow the field.
                        if (e[STORE_SNAPSHOT_PROPS] !== undefined) e[STORE_SNAPSHOT_PROPS] = undefined;
        }
        snapshotSources = null;
    }
    snapshotCaptureActive = false;
}

function recompute(e, t = false) {
    // §12d: any recompute can clean a marked subscriber — invalidate skips.
    bumpNotifyEpoch();
    const n = e.He;
    // Attribution hook: fired before this run touches the dep list — `_deps`
    // still holds the previous run's links (the subscriptions that could have
    // triggered this run, and the baseline for the engine's subscription diff).
        let i = false;
    if (attrHooks !== null) attrHooks.recomputeStart(e, t);
    // Lane posture is resolved BEFORE the previous frame is parked below: a
    // lane pass parks a lane frame, not a transaction zombie (#3662, #3698;
    // see the parking site), so the decision must be known there. `lane` is applied to
    // `currentOptimisticLane` further down, once the previous posture is saved.
        let l = !!(e.oe & REACTIVE_OPTIMISTIC_DIRTY);
    let u = null;
    if (l) {
        u = GlobalQueue._t(e, true);
        // `false` = wake-only lane demotion: recompute plain so a mid-tick
        // latest()/isPending() pull stages instead of direct-committing (#3009).
        // The predicate lives with the engine (recomputeLane).
                if (u === false) l = false;
    } else if (e.C & CONFIG_DERIVED_OVERRIDE) {
        // Lanes stage (#3479): a pass over a live lane member carrying a derived
        // override is the lane's pass whatever channel dirtied it (a boundary
        // reset, an unrelated sync write) — its inputs serve the lane's view, so
        // its result is the lane's and belongs in the override slot. Run plain,
        // A18's sync twin below read that re-derived lane view as a differing
        // truth (a fresh array), superseded the override and demoted the lane;
        // the lane's next pass then dropped the staged "truth" and left the node
        // flagged superseded with nothing to serve (fuzzer latest-1 #2481). A
        // demoted node resolves no lane and stays plain: its pass IS the truth.
        u = GlobalQueue._t(e, true);
        if (u) l = true;
    } else if (activeTransition && !t && activeTransition.bn.length) {
        // Lane adoption: parent-deeper-than-owned-child can run before its OPT-dirty
        // child propagates. Walk deps once and inherit the OPT lane so this node
        // recomputes under the right posture and propagates correctly.
        u = GlobalQueue._t(e, false);
        if (u) l = true;
    }
    if (!t) {
        // A stamped memo re-enters its hold: its value is that transaction's work.
        // An effect's pass belongs to whatever dirtied it (A15 corollary: effects
        // don't entangle parallel transactions); it joins its stamp only when the
        // pass observes the held flight — queue notification (#3407).
        if (e.me && !n && activeTransition !== e.me) globalQueue.initTransition(e.me);
        deleteFromHeap(e, queueFor(e));
        if (e.o !== null) {
            e.o.pe = null;
            // Supersede is where an iterator flight dies (#3122): close it now.
            // Its cleanup(close) registration may sit in a zombie-deferred
            // disposal list that a held transition only drains when the
            // SUPERSEDING flight settles — cancellation must not wait for the
            // work that replaced it. Idempotent with the cleanup-channel close.
                        releaseFlightTeardown(e);
        }
        // Tracked effects run after finalizePureQueue, so dispose immediately
        // instead of deferring. Children built by an uncommitted recompute
        // (CONFIG_HELD_CHILDREN) die immediately too: no frame ever showed them.
        // Everything else is the committed frame's. Which frame retires it is
        // decided by who owns the pass, never by the node's kind (A15 lane work
        // and transaction work, ruled 2026-09-28, #3698). Transaction work — a
        // pass under a held transaction — defers them as zombies until this
        // node's commit, a transaction-owned node included (#3404): a parked
        // node's children predate the hold, and tearing them down when the
        // source lands ran cleanups before the transaction's atomic reveal.
        // Lane work — a pass over a lane, effect or memo alike — parks a LANE
        // frame instead (CONFIG_LANE_FRAME, #3662, #3698): the frame it replaces
        // leaves the screen when the lane's queue applies this pass (A30) — not
        // at the action's commit — and a held lane defers that with the frame
        // still displayed. The drain is the lane's first render entry for this
        // pass, pushed before the pass builds the new frame: cleanups before
        // side effects — the retired frame's `onCleanup`s run ahead of every
        // effect callback of the new frame. While the frame waits, the live
        // children were never shown: a superseding pass disposes them here like
        // held children, and the parked frame stays. Zombies exist for
        // transaction work only: #3662 gated the lane frame on `isEffect`, and a
        // memo's lane pass (its value a derived override, A17) parked a
        // transaction zombie that made the memo a pending node of the action,
        // stamped it, and sent its next mainline recompute through the
        // stamped-memo arm above — a `Show` whose `when` getter owns a
        // compiler-emitted memo held an unrelated sync write for the action's
        // lifetime, against the #3460 ruling that a lane never holds a sync write.
                if (n === EFFECT_TRACKED || e.C & (CONFIG_HELD_CHILDREN | CONFIG_LANE_FRAME)) disposeChildren(e); else if (e.On !== null || e.Ve !== null) {
            markDisposal(e);
            const t = ext(e);
            t.Et = e.Ve;
            t.dt = e.On;
            e.Ve = null;
            e.On = null;
            e.Nt = 0;
            if (u) {
                e.C |= CONFIG_LANE_FRAME;
                findLane(u).It[0].push(() => {
                    e.C &= ~CONFIG_LANE_FRAME;
                    disposeChildren(e, false, true);
                });
            }
        } else ;
    }
    // A derived override (lanes stage, #3479) is override-covered like a written
    // one: a plain pass over it — its source superseded (A18) — stages the truth
    // and supersedes the override through the sync twin below.
        const o = (e.C & (CONFIG_OPTIMISTIC | CONFIG_DERIVED_OVERRIDE)) !== 0 && e.o?.we !== NOT_PENDING && e.o?.we !== undefined;
    const r = !!(e.S & STATUS_UNINITIALIZED);
    // Capture both error and pending status before the compute clears them.
    // A conditional can drop its pending source and recover to an unchanged
    // value, leaving blocked dependents outside that source’s settle walk.
        const s = e.S & STATUS_ERROR ? e.o?._ : undefined;
    const a = (e.S & STATUS_PENDING) !== 0;
    const f = a ? e.o?.ue : undefined;
    // Pending SOURCE-hood, captured before the compute clears status: a node
    // whose own flight parked dependents self-registers in _pendingSources
    // (notifyStatus, isSource). If this recompute supersedes that flight and
    // settles synchronously, those dependents settle HERE — asyncWrite's
    // settlePendingSource walk never runs for a landing that was preempted
    // (#3181).
        const c = e.o?.ue?.has(e);
    // Re-ask classification lives in the verdict module; capture the flag before
    // the recompute wipes _flags below.
        const _ = (e.oe & REACTIVE_REASK) !== 0;
    // Captured before the compute clears it on a sync landing: if that landing
    // is transition-held below, the window must stay open until the hold
    // commits (commitPendingNode) — a closed window plus a held value reads as
    // a pending frame to live observers of the verdict (#2990).
        const E = e.ye;
    // Creation-time A29 (see enterStagedRead): a pass outside a flush that is
    // served a live transaction's staged value records the transaction here
    // and is staged INTO it below — "born held" — instead of committing.
        const d = stagedEntry;
    stagedEntry = null;
    const N = context;
    context = e;
    e.Je = null;
    e.We++;
    // REACTIVE_ZOMBIE is position, not scheduling state: it says the node sits
    // on its owner's `_pendingFirstChild` chain, and `disposeChildren` keys its
    // parent-chain splice off it. A zombie reruns for mainline writes until the
    // commit that disposes it (#3463), so the per-pass wipe here — and in the
    // finally below and in updateIfNecessary — must carry it (#3543): a
    // de-flagged zombie spliced itself out of the LIVE chain at disposal,
    // orphaning the owner's current child, which stayed subscribed forever.
        e.oe = REACTIVE_RECOMPUTING_DEPS | e.oe & REACTIVE_ZOMBIE;
    e.Ge = clock;
    let I = e._e === NOT_PENDING ? e.ce : e._e;
    let T = e.ft;
    let S = false;
    let O = tracking;
    let A = currentOptimisticLane;
    tracking = true;
    // A computed's fn establishes its OWN dependencies, so it must never run
    // inside a latest() read window: read() short-circuits through the
    // companion path before dependency linking, so a memo created (eagerly
    // computed) inside latest(fn) came out permanently dependency-less (#2926).
    // latestRead() already suspends the flag for its pull-recomputes; this
    // covers creation-time computes and flushes that run inside the window.
        const C = latestReadActive;
    latestReadActive = false;
    // A memo computes under its OWN lane posture, never the puller's (A31,
    // #3442): its value is one shared slot every reader sees, so a pull from a
    // lane-carrying reader (a probe effect on its companion lane pulling a sync
    // memo) must not run it with that lane's read carve-outs — under a lane, a
    // pending node on no lane serves its committed value instead of throwing,
    // and the memo then published a stale "settled" value, dropped its
    // pending status, and stopped holding its transaction. The branches below
    // re-establish the posture the memo itself owns (OPT-dirty, or adopted
    // through its deps). Effects keep the ambient lane: their runs are the
    // lane's own view.
        if (!n) currentOptimisticLane = null;
    // Lane posture lives with the engine: OPTIMISTIC_DIRTY is only ever set by
    // engine-driven paths, and _optimisticNodes is only pushed by
    // _optimisticWrite, so the hook is installed whenever either gate holds.
    // (Resolved at the top of this pass, ahead of the parking site.)
        if (u) currentOptimisticLane = u;
    const p = n && n !== EFFECT_USER;
    const R = stale;
    if (p) stale = true;
    // An effect recorded for this transaction's commit replay (it once read a
    // node the transaction held and showed the committed value) and now
    // recomputing UNDER the transaction sees its staged view: the value this
    // run produces is applied by the commit itself, and the stale recording
    // would publish the frame a second time. Drop it; the reads below re-record
    // if they are served the committed view again (a lane's committed read).
        if (n && activeTransition !== null && activeTransition.Tt.size) activeTransition.Tt.delete(e);
    try {
        if (!false && e.C & CONFIG_SYNC) {
            I = e.Se(I);
            if (e.o !== null) e.o.pe = null;
            e.ye = false;
        } else {
            // Snapshot `_inFlight` so we can detect whether `_fn` self-registered an async
            // subscription (e.g. `createProjection` calls `handleAsync` from inside its body
            // with a setter callback). In that case, the outer `handleAsync` call below would
            // clobber the fresh subscription, so we skip it and let the internally-registered
            // iteration drive updates.
            const t = e.o?.pe;
            const n = e.Se(I);
            const i = typeof n === "object" && n !== null;
            const l = e.o?.pe !== t;
            I = l || !i ? n : handleAsync(e, n);
            if (!l && !i) {
                if (e.o !== null) e.o.pe = null;
                // A sync (non-object) return is the first real answer; async-shaped
                // results clear inside handleAsync at their own landing points, and a
                // self-registered flight (inFlightChanged — projections) clears when
                // its internal handleAsync lands.
                                e.ye = false;
            }
        }
        // On a status-free node clearStatus is a guaranteed no-op: every field
        // its body gates on is either _statusFlags or lives in the cold
        // extension — no extension, no status to clear. (_x from an unrelated
        // installer just makes clearStatus a cheap re-verified no-op.)
        // A node born held keeps STATUS_UNINITIALIZED until its transaction
        // commits: it has no committed value, and read() holds its readers.
                if (e.S !== 0 || e.o !== null) clearStatus(e, t && stagedEntry === null);
        // _optimisticLane is only ever assigned by engine paths (CONFIG_HAS_LANE
        // is their sticky presence mark).
                if (e.C & CONFIG_HAS_LANE && e.o?.Ce) GlobalQueue.St(e);
    } catch (t) {
        const n = t instanceof NotReadyError;
        if (n && e.ye) {
            // Loading window with an unready sync dependency: register for the
            // source's settle (the settlePendingSource walk runs off
            // _pendingSources + _blocked alone) but take NO read-visible pending
            // status, no downstream propagation, no transition, no lane
            // registration — the committed loading value keeps serving. If the
            // node is currently errored the error stays the answer until this
            // retry can actually run.
            parkLoadingWindow(e, t);
        } else {
            // Track pending async in the lane (not the lane's source — it creates the lane
            // but doesn't belong to it). Set lane BEFORE notifyStatus for downstream propagation.
            if (n && currentOptimisticLane) GlobalQueue.Ot(e);
            let i = false;
            if (n) {
                ext(e).Oe = true;
                if (GlobalQueue.At !== null) i = GlobalQueue.At(e, _);
            }
            notifyStatus(e, n ? STATUS_PENDING : STATUS_ERROR, t, undefined, n ? e.o?.Ce : undefined);
            // The replacement source is fully propagated now. If no new flight
            // re-owned self, retire the superseded flight and its dependent copies.
                        if (n && c && !e.o?.pe) settlePendingSource(e);
            // A re-park drops what the earlier pass carried (#3456): a source this
            // pass no longer reaches — its branch switched, or a fresh flight
            // replaced the inputs' pending with its own — stays copied onto
            // dependents that reached it only through here, and its landing walk
            // stops at this node (nothing left to retire) before it finds them. A
            // dependent then waits forever on a flight it has no path to. The
            // re-park twin of the unchanged-value recovery sweep below; dependents
            // with another path keep the source (retryReaches).
                        if (n && f) for (const t of f) if (t !== e && !e.o?.ue?.has(t)) settlePendingSource(e, t);
            if (i) GlobalQueue.k(e);
        }
    } finally {
        tracking = O;
        latestReadActive = C;
        if (p) stale = R;
        // Consume the missed-wake latch (#3037, set by insertSubs): a dep write
        // landed beneath this pass on a link it had already validated. The wipe
        // below must not key off DIRTY/CHECK — the read-time pull protocol
        // (markNode(c) in read()) marks the running node as part of ordinary
        // bookkeeping, and those marks are correctly discarded here.
                S = (e.oe & REACTIVE_MISSED_WAKE) !== 0;
        // REACTIVE_DISPOSED survives too (#3621): the pass may have disposed its
        // own owner (a memo calling its root's `dispose()`, a cleanup doing so
        // #3601/#3606), and `disposeChildren` set the flag on this node
        // reentrantly. Dropped, the node read as live — `refresh()` re-ran it
        // and `isDisposed()` lied.
                e.oe = e.oe & (REACTIVE_ZOMBIE | REACTIVE_DISPOSED) | (t ? e.oe & REACTIVE_SNAPSHOT_STALE : 0);
        context = N;
    }
    // The cast re-widens: TS narrowed `stagedEntry` to `null` at the reset
    // above and does not invalidate that across the compute call that
    // `enterStagedRead` runs under. No emitted code.
        const G = stagedEntry;
    stagedEntry = d;
    // A node that died during its own pass (#3621) is dead at the end of it,
    // and the pass is void. Its owner's teardown already unlinked its deps,
    // removed it from the heap and ran its cleanups; what remains is what the
    // body did AFTER the `dispose()` call: reads that re-linked the dead node
    // to its sources (unlinked here — the leak that kept it re-running in a
    // torn-down tree), a flight it may have started (retired: the landing
    // checks `_inFlight` identity), and the value it returned. That value is
    // NOT published: a dead node freezes at its last committed value (#3024),
    // so nothing is staged, committed, or propagated to subscribers, and an
    // effect's run is not enqueued (runEffect would refuse it anyway). The
    // attribution frame opened at the top is still closed.
        if (e.oe & REACTIVE_DISPOSED) {
        clearDeps(e);
        if (e.o !== null) e.o.pe = null;
        if (attrHooks !== null) attrHooks.recomputeEnd(e, t, false, false, false, false);
        currentOptimisticLane = A;
        return;
    }
    if (!e.o?._) {
        // Observe-tier fan-in (HUGE_FAN_IN): the validated prefix [_deps.._depsTail]
        // IS this pass's distinct sources — count it here rather than per link. A
        // begin/end bracket around the pass plus a per-link increment measured
        // -5.8% on createRenderEffects:create1to1 (CodSpeed, dev tier) and cost
        // several points of the shape wins elsewhere; this walk is a fraction of
        // the reads that built the list and keeps no module state, so nested
        // pulls need no save/restore. (The stale tail is trimmed at the end of
        // this pass, or at its commit — see recompute's tail.)
        {
            let t = 0;
            for (let n = e.Ee; n !== null; n = n.Ie) {
                t++;
                if (n === e.Je) break;
            }
            if (t >= GRAPH_SIZE_WARN_AT) noteFanIn(e, t);
        }
        // INV-11 (#3330): the equality gate compares against the slot this run
        // publishes to. An override-covered node publishes the override; a lane
        // recompute (OPT-dirty) direct-commits `_value` — the lane's own reveal
        // schedule — so a transaction-held `_pendingValue` that already equals
        // the new result is not "unchanged": the screen still shows `_value`.
        // Only a transaction-staged run compares against `_pendingValue`.
                const u = o ? unwrapOverride(e.o?.we) : l || e._e === NOT_PENDING ? e.ce : e._e;
        let a = false;
        try {
            a = !n && r || !e.Fe || !e.Fe(u, I);
        } catch (t) {
            // A throwing user comparator is an error of this node's computation.
            // Route it through the same status path as a compute-phase throw so
            // error boundaries contain it; otherwise it unwinds the scheduler
            // flush, bypassing every boundary and wedging the queue (#2837).
            notifyStatus(e, STATUS_ERROR, t);
        }
        // A committed derived change becomes a cause for this node's subscribers,
        // chaining their attribution through this node to the root write.
                if (attrHooks !== null) {
            i = a && !e.o?._;
            if (i && !n && !t) attrHooks.derivedChanged(e);
        }
        // Effects use `_equals: false` (no per-effect closure). The side effects that
        // the equals closure used to perform — flagging the effect dirty and enqueueing
        // its runner — happen here instead. `!create` matches the previous `initialized`
        // gate: the explicit recompute(node, true) inside effect() does not enqueue, so
        // effect() can call its runner synchronously for the first run.
                if (n && a) {
            e.it = !e.o?._;
            // Reuse one bound runner per effect — runEffect no-ops on a stale
            // `_modified`, so re-enqueueing the same function is harmless.
                        if (!t) {
                e.T.enqueue(n, e.Ct ??= GlobalQueue.Rt.bind(null, e));
                // Contested effect (#3322). Effects don't entangle transactions (a
                // shared effect is not shared state), yet they have one value slot:
                // when this write commits under a different transaction
                // (`activeTransition`, null = mainline) than the one that produced the
                // previous value (`_valueTransition`), that view is gone. Rather than
                // merge the two, each commit re-derives the effect against its own
                // committed world (Transition._contested, re-dirtied by
                // finalizePureQueue ahead of the heap run). The previous owner always
                // needs it if still live: its commit is silent (staging already
                // notified) and the value it computed is gone. The new owner needs it
                // too, for the same reason, unless it is mainline — mainline publishes
                // what it computes. A previous owner that was mainline, or already
                // committed, left nothing to protect.
                                let t = e.Gt;
                if (t !== activeTransition) {
                    e.Gt = activeTransition;
                    if (t !== null && (t = currentTransition(t)) !== activeTransition && !t.Dt) {
                        (t.ht ??= []).push(e);
                        if (activeTransition !== null) (activeTransition.ht ??= []).push(e);
                    }
                }
            }
        }
        if (e.o?._) ; else if (a) {
            const i = o ? e.o?.we : undefined;
            if (t && G === null || 
            // Plain sync flush (no transition on either side) commits effect
            // values directly — the pending round-trip (queuePendingNode +
            // commitPendingNodes) exists to sequence transition reveals, and
            // paying it per effect on the plain path is pure overhead.
            // DIRECT_COMMIT effects (resolve/until) commit directly even under
            // their own held transition: their applies deliver on a microtask,
            // not the stashed queues, so a staged value would hand the immediate
            // apply stale state — see CONFIG_DIRECT_COMMIT.
            n && G === null && (activeTransition !== e.me || activeTransition === null || e.C & CONFIG_DIRECT_COMMIT) || l) {
                // Lanes stage (#3479): a lane pass on a memo publishes its speculative
                // result as an OVERRIDE — `_value` stays the committed truth, so a
                // reader off the lane (A17's committed view, #3460) sees a whole
                // committed frame: the source's shadow and its derivations together,
                // never a committed shadow beside a speculative memo. The lane's own
                // readers and untracked reads see the override (A17); the revert
                // drops it and re-derives (resolveOptimisticNodes). Effects keep the
                // direct commit — their `_value` is a run result the lane's queues
                // already sequence. Either way the lane pass drops any superseded
                // older hold so its queued commit can't clobber the fresh frame: a
                // hold staged on an earlier, lane-free pass of the SAME transaction
                // is superseded — left in place, the commit published the older
                // frame over the fresh one (#3377). A reversion pass (OPT-dirty with
                // no lane — the override dropped) commits directly: it IS the truth.
                if (l && !n && currentOptimisticLane !== null) GlobalQueue.je(e, I, currentOptimisticLane); else e.ce = I;
                if (l) e._e = NOT_PENDING;
            } else {
                e._e = I;
                if (G !== null) {
                    // Born held: the pass ran from mainline and derived from this
                    // transaction's staged world (enterStagedRead). Its value is the
                    // transaction's — staged into it directly, stamped, and committed
                    // with it; mainline's batch never sees it. A born-held effect
                    // skips its synchronous first run (effect()) and is replayed by
                    // the commit like a stale reader that showed the committed frame.
                    // (A re-pass under a fresh boundary — the in-flush form — is
                    // already the transaction's: restaged, not re-queued.)
                    if (e.me !== G) {
                        e.me = G;
                        G.In.push(e);
                    }
                    if (n) G.Tt.add(e);
                    // Under a boundary that has not revealed, a held first value is
                    // something not ready under it (#3540): the boundary collects this
                    // node as a source and shows its fallback; the source stays
                    // collected while born held (CollectionQueue._checkSources) and
                    // is released by the commit that initializes it. A boundary that
                    // already shows content is not told — it holds like any reader.
                                        if (underFreshLoadingBoundary(e)) e.T.notify(e, STATUS_PENDING, STATUS_PENDING, new NotReadyError(e));
                }
                // A window landing that gets held re-opens the window until the hold
                // commits — the verdict's held-value branch is window-gated (#2990).
                                if (E) e.ye = true;
                // A staged sync recompute is a write path like setSignal/asyncWrite,
                // so sync derivations of held sources stay visible to isPending()/latest()
                // (#2831). Both companion writes are transition-scoped (optimistic) and
                // auto-revert/re-derive at commit. Not gated on an active transition:
                // a plain flush can still become a hold after this recompute — an
                // async memo downstream pends and the batch is adopted into a
                // transaction (scheduler.enterTransition) — and nothing re-derives
                // the companion at adoption, so a memo held that way read
                // isPending() false while its held source read true (#3413).
                                if (e.C & CONFIG_HAS_COMPANIONS && GlobalQueue.Le !== null) GlobalQueue.Le(e, I);
            }
            // insertSubs only walks _subs (no scheduling of its own), so a
            // subscriber-less node has nothing to notify.
                        if (e.u !== null && (!o || l || e.o?.we !== i)) insertSubs(e, l || o);
            // A18 supersession, sync twin of asyncWrite's override branch (#3331):
            // this pass published truth that differs from the override (the gate
            // compared against it) into the transaction-held slot. Whether the
            // source is this node's own async or an upstream node it derives from
            // synchronously makes no difference — "the source recomputed". The
            // override stays displayed until the commit; the graph moves to the
            // staged truth now (plain channel, lane demoted). Ordering: "a new
            // value from the source" postdates the override — an override written
            // in this same tick (optimisticWrite stamps `_overrideTime`) is the
            // newer intent over whatever this pass derives from the batch's staged
            // inputs, and is not superseded by it.
             else if (o && !l && e.o.Pt !== clock) GlobalQueue.Qe(e, I);
        } else if (o) {
            // Unchanged value (equals the override) recomputed while the override
            // is active: _value may still be stale, so hold the authoritative value
            // for commit on its own transition's schedule — invisibly (A17/A18).
            if (e._e === NOT_PENDING) queuePendingNode(e);
            e._e = I;
            if (E) e.ye = true;
 // see the held branch above (#2990)
            // A confirmation after a supersession restores the override as the
            // graph's value and notifies; a plain confirmation wakes only an
            // authoritative-view reader (until()'s predicate, refresh()'s waiter)
            // that observed this node past its override — "authoritative arrival
            // equal to the override" is exactly the acknowledgment it waits for;
            // A17 silence holds for every ordinary subscriber. Both live in the
            // engine's supersedeOverride.
                        GlobalQueue.Qe(e, I);
        } else if (e.ft != T) {
            for (let t = e.u; t !== null; t = t.Pe) {
                insertIntoHeapHeight(t.Ae, queueFor(t.Ae));
            }
        }
        // Silent recovery: errored → unchanged value fires no notification, but
        // dependents still holding the propagated error consumed their dirty flag
        // in an errored run and may sit on stale commits (#2949). Changed-value
        // recoveries ride insertSubs above; a comparator throw re-errored the node
        // (el._x?._error re-set), so this only runs on a genuinely clean recovery.
                if (!a && !e.o?._) {
            if (s !== undefined) settleErroredDependents(e, s);
            // Self-registration (this node's own superseded flight) is the #3181
            // sweep's business below — retiring it here too would walk twice.
                        if (f) for (const t of f) if (t !== e) settlePendingSource(e, t);
        }
        // #3181: a synchronous settle supersedes the old landing callback, so
        // recompute owns its pending-source sweep. An uninitialized node without
        // a replacement source still has no truth to reveal and must stay parked.
                if (c && !(e.S & (STATUS_PENDING | STATUS_UNINITIALIZED))) {
            settlePendingSource(e);
            // The superseded flight will not enter its waiting transactions at
            // landing. Recheck them now so an unchanged value cannot leave their
            // writes parked after the last pending source has settled.
                        wakeParked();
        }
    }
    // A REPORTER whose pass stopped reading a source it reported on (a gate
    // closed) stops counting for the transaction waiting on it (A15 / #3426:
    // the hold lasts while a live reporter observes the flight). Nothing else
    // re-judges a parked transaction (see wokenTransitions; the disposal
    // (#3372) and boundary (#3375) twins of this site), so the writes it held
    // stayed staged for as long as the flight stayed up — forever, for one
    // that never lands (fuzzer #3446 P1, spec O3). The event is "this pass
    // dropped a dep" — deps past `_depsTail` (trimmed below, or kept by A30
    // for a staged pass), or a pass that read nothing — not "recovered from
    // pending": a reporter registered by the stale-reader carve-out
    // (heldFromStale, an INITIALIZED source refetching) displays the committed
    // value and is never pending (fuzzer case 79). Every parked transaction,
    // not the reporter's stamp: the transaction waiting on it registered it
    // without stamping it. One idle pass per parked transaction; done ones
    // return at re-entry. Effects only — reporters register from render-effect
    // notification (INV-3).
    // (`_depsTail` was reset at the top of the pass; TS keeps that narrowing.)
        const D = e.Je;
    if (n && (a && !(e.S & STATUS_PENDING) || (D === null ? e.Ee !== null : D.Ie !== null))) wakeParked();
    // Dependencies are the committed frame's until it is replaced (A30, #3410; the
    // deps twin of the held children above): a pass that staged its value
    // leaves the previous pass's tail linked for `commitPendingNode` to trim,
    // so a write to a dependency the committed value still derives from
    // reaches this node — and joins its hold if the stage is transaction-held
    // by then (a plain flush decides nothing here: the transaction that holds
    // the pass may open later in the same flush). A pass that published
    // directly (a first pass, a lane's own reveal) trims now. An errored pass
    // (a throw, NotReady included, or a comparator throw above) keeps its full
    // list as before — `_depsTail` marks where it stopped — and the commit
    // skips it by the same `_error`. An effect's frame is the run its value is
    // applied by, not the value slot (#3438): a direct-committed pass that
    // still owes a run (`_modified`) has not replaced what the last run
    // published — the same flush may stash that run into a transaction it
    // opens later — so its tail waits for `runEffect` to trim once the run
    // applies. A pass that changed nothing replaced nothing either (#3469): the
    // same flush may park with its inputs held, and the committed frame still
    // derives from the tail — its trim waits on the flush's verdict (heldTrims).
    // A tracked effect's pass IS its run (it bypasses the heap and runs after
    // the commit): the frame is replaced, trim now.
        if (!e.o?._ && e._e === NOT_PENDING && !(n && e.it)) {
        if (t || l || n === EFFECT_TRACKED) trimStaleDeps(e); else if (e.Je?.Ie ?? e.Ee) heldTrims.push(e);
    }
    // Attribution hook: fired before the lane restore so `currentOptimisticLane`
    // still reflects THIS run's posture. The facts distinguish an overlay
    // recompute (optimistic lane, transition replay, transition-held commit)
    // from a plain committed one — the engine must not blame overlay runs as
    // waste or double-count them against plain aggregates.
        if (attrHooks !== null) attrHooks.recomputeEnd(e, t, i, l || currentOptimisticLane !== null, activeTransition !== null || e.me !== null, e._e !== NOT_PENDING);
    currentOptimisticLane = A;
    // A parked LANE frame is not a hold (#3662): its drain is the effect's own
    // run, not a commit — the node is neither queued nor stamped for it, and
    // the release below (for transaction zombies) leaves it parked.
        const h = (e.C & CONFIG_LANE_FRAME) !== 0;
    const P = e._e !== NOT_PENDING || !h && e.o !== null && (e.o.dt !== null || e.o.Et !== null) || (e.S & (STATUS_PENDING | STATUS_UNINITIALIZED)) !== 0;
    // Override-covered holds (hasOverride) always queue: their commit belongs
    // to their own transition's schedule (A18 re-rule) and is unobservable
    // under the override (A17). Revert no longer commits anything, so an
    // unqueued covered hold would leak (INV-7) once the revert clears
    // _transition.
    
    // While a pass's result waits on a commit, its children (and `_disposal`)
    // wait with it, and a re-run may tear them down immediately
    // (CONFIG_HELD_CHILDREN, #3404). One exception: a transaction-owned effect
    // recomputed mainline (contested, #3322) published its value directly — a
    // `_pendingValue` left from an earlier held pass is that transaction's,
    // not this one's — so this pass's children are the frame's, and any
    // zombies deferred at the top are superseded on that same frame. Its
    // commit rides the transaction, not this flush: release them here rather
    // than let two generations render at once. A LANE pass is the same case
    // (#3662): it direct-commits ahead of its transaction, so its children are
    // the frame's too. Left flagged for an OLDER frame's zombies, the stamped
    // transaction's same-flush re-run below disposed the lane's freshly built
    // children (an insert's inner effect, its run still queued in the lane)
    // and held their replacements for a commit that never came.
        let F = P && (!t || G !== null || (e.S & STATUS_PENDING) !== 0);
    if (F && (!e.me || o)) queuePendingNode(e); else if (F && (activeTransition === null || l) && !(e.S & (STATUS_PENDING | STATUS_UNINITIALIZED))) {
        F = false;
        if (!h) disposeChildren(e, false, true);
    }
    if (F) e.C |= CONFIG_HELD_CHILDREN; else e.C &= ~CONFIG_HELD_CHILDREN;
    // (A born-held pass IS the transaction's staged view — nothing to refresh.)
        if (e.me && n && activeTransition !== e.me && G === null) {
        // The re-run refreshes the transaction's STAGED view (_pendingValue); the
        // value this pass published in _value belongs to the run that just
        // finished. Keep that ownership, or the effect phase parks a
        // mainline-computed value with the transaction (#3412).
        const t = e.Gt;
        runInTransition(e.me, () => recompute(e));
        e.Gt = t;
    }
    // Missed-wake reschedule (see the finally above): values this pass read
    // before the nested commit are stale, so run again now that the heap will
    // accept the node. Equality gates stop same-value landings from cascading,
    // and a re-run only latches again if another nested commit changes a dep
    // beneath it — convergent unless deps genuinely keep changing.
        if (S) {
        enqueueSub(e);
        schedule();
    }
}

function updateIfNecessary(e) {
    // Never re-enter a node that is currently computing: its dep bookkeeping
    // (_depsTail/_depGen) is live, and a nested recompute would corrupt it.
    // A mid-pass mark stays latched for recompute's own tail to reschedule
    // (#3037); readers meanwhile serve the values the pass has so far.
    // Never recompute a DISPOSED node either: recompute rewrites _flags and
    // would resurrect it (#2983) — readers serve its last value.
    if (e.oe & (REACTIVE_RECOMPUTING_DEPS | REACTIVE_DISPOSED)) return;
    if (e.oe & REACTIVE_CHECK) {
        for (let t = e.Ee; t; t = t.Ie) {
            const n = t.De;
            const i = n.Ne || n;
            if (i.Se) {
                updateIfNecessary(i);
            }
            if (e.oe & REACTIVE_DIRTY) {
                break;
            }
        }
    }
    if (e.oe & (REACTIVE_DIRTY | REACTIVE_OPTIMISTIC_DIRTY) || e.o?._ && e.Ge < clock && !e.o?.pe) {
        recompute(e);
    }
    // The guard above refused an already-disposed node; the recompute it just
    // ran may have disposed it (#3621) — carry the flag, or it comes back alive.
    // The manual-write mask is state, not scheduling (#3612): it says the
    // node's staging is a PROPOSAL, and only the commit (or a later-tick
    // refresh, #3026) lifts it — a pull that recomputed nothing must not, or
    // an isPending()/latest() probe decided whether a later write to a held
    // node was a second proposal or the derivation's `prev`.
        e.oe = e.oe & (REACTIVE_SNAPSHOT_STALE | REACTIVE_IN_HEAP | REACTIVE_IN_HEAP_HEIGHT | REACTIVE_ZOMBIE | REACTIVE_DISPOSED | REACTIVE_MANUAL_WRITE);
}

function computed(e, t) {
    const n = t?.transparent ?? false;
    // `in` (not `!== undefined`): an explicit `loadingValue: undefined` on a
    // `T | undefined` node is a real commit #0. The typeof guard tolerates
    // non-object option values that older call shapes force through `as any`.
        const i = t !== null && typeof t === "object" && "loadingValue" in t;
    // Two literals, one per tier, selected at build time (the observe flag is
    // a literal after replacement; the untaken branch is dead code). The observe
    // literal is the prod literal plus its `_name` slot — a slot in the
    // boilerplate, because a post-construction `self._name = …` forces a
    // hidden-class transition and an out-of-object property store on EVERY node
    // (measured: the whole of the observe tier's creation overhead). Keep the
    // two in sync — the dist artifact test pins observe's key set to prod's
    // plus `_name`.
        const l = {
        id: inheritId(t, n, context),
        C: (n ? CONFIG_TRANSPARENT : 0) | (t?.ownedWrite ? CONFIG_OWNED_WRITE : 0) | (!context || t?.lazy ? CONFIG_AUTO_DISPOSE : 0) | (t?.sync ? CONFIG_SYNC : 0) | (t?.Z ? CONFIG_NO_SNAPSHOT : 0) | (
        // Plumbing is an observe-tier notion (a name and records to
        // withhold); the prod literal never carries the bit.
        t?.Ft ? CONFIG_PLUMBING : 0) | (snapshotCaptureActive && ownerInSnapshotScope(context) ? CONFIG_IN_SNAPSHOT_SCOPE : 0),
        Fe: t?.equals ?? isEqual,
        Ve: null,
        T: context?.T ?? globalQueue,
        rt: context?.rt ?? defaultContext,
        Nt: 0,
        Se: e,
        ce: i ? t.loadingValue : undefined,
        ft: 0,
        gt: undefined,
        vt: null,
        Ee: null,
        Je: null,
        We: 0,
        u: null,
        Ht: null,
        _parent: context,
        _n: null,
        kt: null,
        On: null,
        oe: t?.lazy ? REACTIVE_LAZY : REACTIVE_NONE,
        S: i ? 0 : STATUS_UNINITIALIZED,
        Ge: clock,
        _e: NOT_PENDING,
        me: null,
        Lt: -1,
        ye: i,
        o: null,
        // The slot is always present (hidden class); plumbing leaves it
        // unset, which `ownerPath` skips.
        _name: t?.Ft ? undefined : t?.name ?? "computed"
    };
    if (t?.unobserved) ext(l).bt = t.unobserved;
    setupComputedNode(l, t);
    return l;
}

/** Lazily allocate a node's cold extension (ONE shape for signals and
 * computeds — `_x` access stays monomorphic). Installers write through
 * this; hot paths read `el._x?._field` gated by the _config presence bits.
 * Never call ext() just to store a field's default. */ function ext(e) {
    return e.o ??= {
        we: undefined,
        Vt: undefined,
        Pt: 0,
        Ut: NOT_PENDING,
        yt: 0,
        Ce: undefined,
        xe: undefined,
        Me: undefined,
        $n: undefined,
        t: 0,
        pe: null,
        be: null,
        _: undefined,
        Oe: undefined,
        ue: undefined,
        h: undefined,
        ve: false,
        i: null,
        bt: undefined,
        ct: undefined,
        Et: null,
        dt: null,
        xt: undefined
    };
}

/**
 * Build an Effect node with all effect-specific fields baked into a single object literal,
 * so V8 sees the full hidden class shape at construction time. Effects always run in lazy
 * mode (recompute is called explicitly by `effect()`), so we hardcode the lazy bits and skip
 * the auto-dispose CONFIG bit (effect() previously cleared it post-construction).
 */ function createEffectNode(e, t, n, i, l) {
    const u = l?.transparent ?? false;
    // Prod and observe boilerplates — see computed() for why the observe tier
    // gets its `_name` as a literal slot rather than a write after the fact.
    // The default label is the node kind (tracked effects relabel their computed
    // in trackedEffect); the wrappers in signals.ts no longer spread a name into
    // the options to get it.
        const o = {
        id: inheritId(l, u, context),
        C: (u ? CONFIG_TRANSPARENT : 0) | (l?.ownedWrite ? CONFIG_OWNED_WRITE : 0) | (l?.sync ? CONFIG_SYNC : 0) | (l?.Qt ?? 0) | (snapshotCaptureActive && ownerInSnapshotScope(context) ? CONFIG_IN_SNAPSHOT_SCOPE : 0),
        Fe: false,
        Ve: null,
        T: context?.T ?? globalQueue,
        rt: context?.rt ?? defaultContext,
        Nt: 0,
        Se: e,
        ce: undefined,
        ft: 0,
        gt: undefined,
        vt: null,
        Ee: null,
        Je: null,
        We: 0,
        u: null,
        Ht: null,
        _parent: context,
        _n: null,
        kt: null,
        On: null,
        oe: REACTIVE_LAZY,
        S: STATUS_UNINITIALIZED,
        Ge: clock,
        _e: NOT_PENDING,
        me: null,
        Lt: -1,
        ye: false,
        it: false,
        Mt: undefined,
        wt: t,
        Wt: n,
        qt: undefined,
        He: i,
        Gt: null,
        o: null,
        _name: l?.name ?? "effect"
    };
    // Effects dispatch status through the SHARED notifier (statusNotifierOf,
    // keyed off _type) — storing it per node forced a full NodeExtension
    // allocation on EVERY effect at creation (an alloc + 19 field stores,
    // +23% effect creation, caught by the creation benches). Only genuinely
    // per-node channels (boundaries) live on _x.
        if (l?.unobserved) ext(o).bt = l.unobserved;
    setupComputedNode(o, lazyOptions);
    return o;
}

/**
 * The shared status notifier for effect nodes, installed once by effect.ts
 * at module evaluation (`this`-dispatched — one function serves every
 * effect, so nodes never store it). Boundary computeds keep their own
 * per-node channel on `_x._notifyStatus`, which takes precedence.
 */ let effectStatusNotify = null;

function setEffectStatusNotify(e) {
    effectStatusNotify = e;
}

/** Resolve a node's status notifier: an own `_x` channel (boundaries) wins;
 * effect nodes (`_type` — EFFECT_PURE is 0, and only effect literals carry
 * the field) fall back to the shared notifier. Presence doubles as the
 * "display consumer" membership test in the status walks, exactly as the
 * per-node field did when every effect carried one. */ function statusNotifierOf(e) {
    const t = e.o?.h;
    if (t !== undefined) return t;
    return e.He ? effectStatusNotify ?? undefined : undefined;
}

const lazyOptions = {
    lazy: true
};

function setupComputedNode(e, t) {
    e.vt = e;
    const n = context?.Zt ? context.Yt : context;
    if (context) linkChild(context, e);
    if (n) e.ft = n.ft + 1;
    if (GlobalQueue.Bt !== null) GlobalQueue.Bt(e);
    !t?.lazy && recompute(e, true);
    if (snapshotCaptureActive && !t?.lazy) {
        if (!(e.S & STATUS_PENDING) && !(e.C & CONFIG_NO_SNAPSHOT)) {
            ext(e).ct = e.ce === undefined ? NO_SNAPSHOT : e.ce;
            e.C |= CONFIG_HAS_SNAPSHOT;
            snapshotSources.add(e);
        }
    }
}

function signal(e, t, n = null) {
    // Prod and observe boilerplates — see computed(). The observe literal adds
    // `_name` and `_owner` (the creating owner, stamped by registerGraph for
    // createSignal nodes so ownerPath can locate signal subjects; null here,
    // and staying null on internal signals — one shape either way).
    const i = {
        Fe: t?.equals ?? isEqual,
        C: (t?.ownedWrite ? CONFIG_OWNED_WRITE : 0) | (t?.Z ? CONFIG_NO_SNAPSHOT : 0),
        ce: e,
        u: null,
        Ht: null,
        Ge: clock,
        Ne: n,
        ge: n?.o?.i || null,
        jt: null,
        _e: NOT_PENDING,
        me: null,
        Lt: -1,
        o: null,
        _name: t?.name ?? "signal",
        ie: null
    };
    if (t?.unobserved) ext(i).bt = t.unobserved;
    if (n) linkFirewallChild(n, i);
    if (snapshotCaptureActive && !(i.C & CONFIG_NO_SNAPSHOT) && !((n?.S ?? 0) & STATUS_PENDING)) {
        ext(i).ct = e === undefined ? NO_SNAPSHOT : e;
        i.C |= CONFIG_HAS_SNAPSHOT;
        snapshotSources.add(i);
    }
    return i;
}

// ---------------------------------------------------------------------------
// SLOT SIGNALS (store leaves) — the create-floor diet. Store mounts
// materialize one signal per touched leaf (~13 × rows on dbmon), so per-node
// allocations are mount bytes: the generic path costs an options object, an
// equals closure, an unobserved closure, a NodeExtension to hold it, and
// three post-construction expandos (acc/px/pxv → hidden-class transitions).
// slotSignal bakes everything into ONE literal: `_host`/`_key` backrefs
// replace the closures (equals is a method call — `this` is the node; the
// unobserved sweep dispatches CONFIG_SLOT_NODE to one shared hook), and the
// store's wrap-cache fields are pre-shaped.
/** The shared slot-node unobserved handler — a live binding read directly by
 * the sweep sites (no wrapper frame, no null check: a CONFIG_SLOT_NODE node
 * existing implies the store module loaded and registered the hook). */ let slotUnobservedHook;

/** Install the shared slot-node unobserved handler (store module, once). */ function setSlotUnobserved(e) {
    slotUnobservedHook = e;
}

/** Push a new node onto its firewall's child chain (the literal already
 * points `_nextChild` at the old head). Doubly linked so a released leaf
 * unlinks in O(1) — the chain is walked per mark of the projection and
 * would otherwise grow by one node per leaf ever read (#3351). */ function linkFirewallChild(e, t) {
    const n = t.ge;
    if (n !== null) n.jt = t;
    ext(e).i = t;
    e.C |= CONFIG_FW_CHILDREN;
}

/** Release a firewall child the store no longer addresses (unobserved sweep
 * dropped it from its target's cache): unlink it from the chain so the
 * projection stops retaining it and its last value. The node keeps its own
 * `_nextChild` so a walk that is mid-chain on it still terminates. It also
 * leaves `_companionChildren` (#3503): the companions themselves are
 * permanent on the node, but the node is unreachable through the store, so
 * the set would only retain it and its last value. */ function unlinkFirewallChild(e) {
    const t = e;
    const n = t.Ne;
    if (!n) return;
    const i = t.jt;
    const l = t.ge;
    if (i !== null) i.ge = l; else if (n.o.i === t) n.o.i = l;
    if (l !== null) l.jt = i;
    t.jt = null;
    // #3503: the companion set is the last projection-side reference to a
    // released leaf; leaving it there kept the leaf and its last value alive
    // for the projection's lifetime after every latest()/isPending() reader
    // was disposed.
        n.o.xt?.delete(t);
}

function slotSignal(e, t, n, i, l, u = null) {
    // Prod and observe boilerplates — see computed(). The store relabels the
    // observe slot (`store.<key>`) when the attribution engine is installed.
    const o = {
        Fe: t,
        C: CONFIG_OWNED_WRITE | CONFIG_SLOT_NODE,
        ce: e,
        u: null,
        Ht: null,
        Ge: clock,
        Ne: u,
        ge: u?.o?.i || null,
        jt: null,
        _e: NOT_PENDING,
        me: null,
        Lt: -1,
        o: null,
        Kt: n,
        zt: i,
        acc: l,
        px: undefined,
        pxv: undefined,
        _name: "signal"
    };
    if (u) linkFirewallChild(u, o);
    if (snapshotCaptureActive && !((u?.S ?? 0) & STATUS_PENDING)) {
        ext(o).ct = e === undefined ? NO_SNAPSHOT : e;
        o.C |= CONFIG_HAS_SNAPSHOT;
        snapshotSources.add(o);
    }
    return o;
}

function optimisticSignal(e, t) {
    const n = signal(e, t);
    ext(n).we = NOT_PENDING;
    n.C |= CONFIG_OPTIMISTIC;
    return n;
}

function optimisticComputed(e, t) {
    const n = computed(e, t);
    ext(n).we = NOT_PENDING;
    n.C |= CONFIG_OPTIMISTIC;
    return n;
}

function isEqual(e, t) {
    return e === t;
}

/**
 * Runs `fn` outside of any reactive tracking — reads inside `fn` will not
 * subscribe the current scope. Returns whatever `fn` returns.
 *
 * Use `untrack` inside a memo or effect when you need to read a signal once
 * without making the surrounding computation depend on its future changes.
 *
 * Pass a `strictReadLabel` string to enable a dev-mode warning: any reactive
 * read inside `fn` that isn't inside a nested tracking scope will log a
 * warning naming the label.
 *
 * @example
 * ```ts
 * createEffect(
 *   () => trigger(),                 // tracks `trigger` only
 *   () => {
 *     const snapshot = untrack(() => state); // read once, untracked
 *     log(snapshot);
 *   }
 * );
 * ```
 */ function untrack(e, t) {
    if (GlobalQueue.Jt === null && !tracking && true) return e();
    const n = tracking;
    tracking = false;
    try {
        if (GlobalQueue.Jt !== null) return GlobalQueue.Jt(e);
        return e();
    } finally {
        tracking = n;
    }
}

/**
 * Set while runtime bookkeeping reads a node inside another node's pass (a
 * loading boundary priming its tree at creation, from whatever pass is
 * mounting it). `context` is that node, but the read is nobody's: the value
 * is probed, never derived from, so nothing the read would normally record
 * on `context` may be recorded — not the untracked-pending re-run link
 * (`read`, `!tracking`; #3528: a boundary's `on` key read this way from
 * `notify` linked the key's source into an unrelated async memo, a cycle that
 * never converged), and not a transaction entry (`enterStagedRead`; #3540: a
 * born-held tree would otherwise pull the mounting pass into the hold).
 */ let spectating = false;

/**
 * Evaluates `fn` untracked, recording nothing on the current `context`: no
 * untracked-pending re-run link, no transaction entry. For bookkeeping reads
 * made on behalf of no node — see `spectating`.
 */ function spectate(e) {
    const t = spectating;
    spectating = true;
    try {
        return untrack(e);
    } finally {
        spectating = t;
    }
}

/**
 * Bring a computed to a readable state: lazy/disposed nodes are (re)computed;
 * an isPending() probe (`refresh`) additionally pulls the node fully up to
 * date so its status flags reflect the current graph.
 */ function prepareComputed(e, t) {
    if (e.oe & REACTIVE_LAZY) {
        e.oe &= ~REACTIVE_LAZY;
        recompute(e, true);
    } else if (e.oe & REACTIVE_DISPOSED) {
        // Two disposal lifecycles share the flag (#3024). Observation-lifecycle
        // nodes (CONFIG_AUTO_DISPOSE) are dormant — torn down by unobserved()
        // when the last subscriber left — and reads reawaken them; that is the
        // pay-for-use contract. Owner-lifecycle nodes are dead: recomputing would
        // re-run user code in a torn-down tree (and discard manual writes on
        // derived-writable signals), so reads return the last committed value.
        if (e.C & CONFIG_AUTO_DISPOSE) {
            const t = e._parent;
            if (t !== null) {
                // A dormant node was off the chain when its owner died, so the strip
                // in disposeChildren missed it: freeze here instead (#3024).
                if (t.oe & REACTIVE_DISPOSED) {
                    e.C &= ~CONFIG_AUTO_DISPOSE;
                    return;
                }
                // A zombie never left its chain: settleAutodispose releases without
                // the !ZOMBIE check its siblings have, so this guard is load-bearing.
                                if (!(e.oe & REACTIVE_ZOMBIE)) linkChild(t, e);
            }
            recompute(e, true);
        }
    } else if (t) {
        updateIfNecessary(e);
    }
}

/**
 * Sentinel returned by readNodeFast when the plain-signal fast path does not
 * apply and the caller must fall back to the full read().
 */ const READ_SLOW = Symbol("read-slow");

/**
 * read()'s plain-signal fast path as a standalone entry for hot callers
 * (store traps). Safe to substitute for read() only because the bail
 * conditions mirror read()'s prelude and fast-path guard exactly: the
 * latestRead and pendingCheck windows run side-effectful hooks before the
 * fast path, `_fn` nodes need prepareComputed, and firewall / override /
 * snapshot / transition / lane / dev-strictRead state all take the full
 * resolution. Anything slow returns READ_SLOW; the caller then calls read().
 */
/**
 * Wake only authoritative-view readers (until() predicates) subscribed to `el`.
 * The A17-silent ack paths — an authoritative arrival equal to the active
 * override — use this so the predicate re-evaluates without re-firing
 * ordinary subscribers whose visible (override) value did not change.
 * Pay-for-use: reached through GlobalQueue._notifyAuthoritativeObservers,
 * installed at first until() call — apps that never use until() shake it.
 */ function notifyAuthoritativeObservers(e) {
    for (let t = e.u; t !== null; t = t.Pe) {
        const e = t.Ae;
        if (!(e.C & CONFIG_AUTHORITATIVE_READ)) continue;
        // Missed-wake latch (#3037), same contract as insertSubs: the reader may
        // itself have pulled this recompute (updateIfNecessary from its own
        // read), and the heap refuses RECOMPUTING nodes — latch so recompute's
        // tail reschedules it with the staged value visible.
                if (e.oe & REACTIVE_RECOMPUTING_DEPS && t.Ze === e.We && t !== e.Je) e.oe |= REACTIVE_MISSED_WAKE;
        enqueueSub(e);
    }
    schedule();
}

/** Installs the authoritative-reader wakeup hook. Idempotent; called by every
 * creator of a CONFIG_AUTHORITATIVE_READ computation — until() and refresh() —
 * before its first read (same late-binding contract as the optimistic engine;
 * the gating bit is only ever set by such a read, so the `!` call sites are
 * safe once every setter installs, #3303). */ function installAuthoritativeRead() {
    if (GlobalQueue.Xt === null) GlobalQueue.Xt = notifyAuthoritativeObservers;
}

/**
 * Stale-reader term of the value selections below: a render effect reading a
 * node some OTHER live transaction has staged sees the committed value. The
 * commit is silent — the staging walk was the notification — so a reader
 * that linked AFTER that walk (an effect created during the hold, a store
 * key first read under it) would show the old value past the reveal: record
 * it for the transaction's commit replay (the `_gatedSubs` contract lanes
 * already use). An effect the transaction itself computed re-derives at its
 * commit on its own (parked run, or the contested re-derive, #3322) and is
 * not recorded — replaying it too would publish the frame twice.
 *
 * Flight twin (the pending-branch carve-out): the reader is served the
 * node's committed, pre-flight value and now observes that flight — A15:
 * async work observed by a reader settles as one unit with the writes that
 * asked it — so it joins the transaction's reporters for the node. The
 * reporter the transaction recorded when the flight started may be gone (a
 * keyed remount disposed it, #3374); a completion check that found no live
 * reporter committed the writes ahead of the answer, tearing the new
 * reader's frame (`Count: 1` beside `Details: 0`). Joins an entry the
 * transaction already holds; a flight nobody had observed yet has none (the
 * reader is its first observer — a conditional that just revealed it, #3458)
 * and is notified up the reader's own queue chain under that transaction,
 * the one sanctioned registration site (INV-3): a collecting boundary above
 * the reader consumes it as it would any pending, an unboundaried reader
 * opens the entry — and the transaction, judged complete on its other
 * flights, revealed the inputs beside the reader's pre-flight value
 * otherwise (`Count: 1 | A: 1` beside `B: 0`). A staged signal or a settled
 * node registers nothing. Every reporter dies with its reader
 * (reporterBlocksSource: the read linked it as a dep). The node's own entry
 * is the only one that can matter: a chain's intermediate memo is re-pulled
 * by the read (updateIfNecessary's retry) and enters the transaction, so the
 * reader holds through the normal path; a node with its own flight that is
 * also pending on an upstream re-ask blocks through that flight until it
 * lands, and its landing re-runs the reader into the normal path.
 */
/** The replay half of the stale-of-foreign clause (A15 / A26): a stale reader
 * served the committed value because `txn` holds what it read re-runs at
 * txn's commit, when the value it was denied becomes the frame — unless its
 * own last value already came from that transaction. One registration for
 * the node path (heldFromStale) and the store's backing paths, which have
 * no node to carry the hold (heldFromReader, the adoption hold view). */ function recordStaleReplay(e, t) {
    const n = t.Gt;
    if (n == null || currentTransition(n) !== e) e.Tt.add(t);
}

/**
 * The ownership relation (DESIGN-CONSOLIDATION §6, ruled 2026-09-17): is
 * `hold` part of the running pass's world? A plain reader's world is the
 * transaction it runs under, through merges. A lane reader's world is its
 * lane AND the transition that owns the lane — the one asymmetry between a
 * lane and a separate transaction (a lane sees what lands from its parent as
 * its own; a separate transaction would wait for the parent to settle) —
 * see `ownsLane` in lanes.ts, built on this. One relation for the
 * stale-of-foreign clause (heldFromStale), the lane arm (readsHeldCommitted)
 * and the store's backing holds (foreignHold); `serve` has no lane arm of
 * its own, the lane's extra visibility lives here.
 */ function ownsHold(e) {
    return activeTransition !== null && currentTransition(e) === currentTransition(activeTransition);
}

function heldFromStale(e, t) {
    const n = e.me;
    if (n === null || ownsHold(n)) return false;
    const i = currentTransition(n);
    recordStaleReplay(i, t);
    const l = i.ae.get(e);
    if (l) l.add(t); else if (e.S & STATUS_PENDING) runInTransition(i, () => t.T.notify(t, STATUS_PENDING, STATUS_PENDING, e.o._));
    return true;
}

/**
 * A tracked computation about to be served a live transaction's staged value
 * derives from that transaction's world, so it enters the transaction and
 * this pass's result is held with it (A29, #3408). The write side (`setSignal`)
 * and a stamped node's recompute already enter; a reader that only now
 * starts reading the held node — a conditional memo whose branch flipped —
 * was the gap: it published a value derived from the staged world into the
 * mainline frame. Not for a probe (`isPending(() => x())` observes, it does
 * not derive) and a no-op for the ambient batch (`_transition` null) or the
 * transaction already active.
 */
/** The transaction a pass running OUTSIDE a flush was served a staged value
 * from (A29, creation-time form). Inside a flush the pass enters through
 * initTransition; outside one — a memo or effect created from mainline code
 * while a hold is live — entering would leave `activeTransition` and the
 * batch pointed at the transaction for the rest of the synchronous block,
 * so an unrelated write made after the mount was held with someone else's
 * action. The entry is the pass's alone: recompute stages the node into the
 * transaction (born held) and mainline is never touched.
 *
 * A pass under a FRESH loading boundary takes this path inside a flush too
 * (#3540). Born held is right for a plain memo or effect: published, its
 * value would tear the frame. A boundary that has not revealed yet is the
 * exception by definition — its job is to catch what is not ready under it
 * rather than let it hold: the pass is staged into the transaction as
 * above, and the boundary is told (recompute's born-held arm notifies it
 * with a `NotReadyError` sourced at the node) so it shows its fallback now
 * and reveals the staged result at the commit.
 * Entering instead adopted the whole flush into the hold — a `Show` that
 * flipped mainline to mount a `Loading` over a held value waited for the
 * hold with it. A boundary that already shows content keeps the entering
 * path: it has content to keep, and holds like any reader. */ let stagedEntry = null;

/** Is `el` routed to a loading boundary that still shows its fallback — the
 * nearest pending-collecting queue up its chain is uninitialized? (Measured
 * 2026-09-18: relocating the walk behind a `GlobalQueue` slot installed by
 * boundaries.ts saved ~8 B on the core floor and cost boundary-using apps
 * 50–70 B — the indirection's tokens outweigh the walk. Kept inline.) */ function underFreshLoadingBoundary(e) {
    for (let t = e.T; t !== null; t = t._parent) if (t.te & STATUS_PENDING) return !t.H;
    return false;
}

function enterStagedRead(e, t = e.me) {
    if (!t || t === activeTransition || pendingCheckActive) return;
    // A companion (the latest() shadow, the isPending() verdict signal) is the
    // engine's mirror of the flushed world — reading it, or being it, is an
    // observation, not a derivation from the hold: latest(x) never enters x's
    // transaction, and the shadow's own pass never enters either (it would
    // flip activeTransition under the reader that pulled it). (`el` is null for
    // a store backing served under a hold — no node, the transaction is the
    // fold's.)
        if (e?.o?.$n || context?.o?.$n) return;
    // A bookkeeping read (`spectate`) is nobody's derivation: it compares or
    // probes, and enters nothing — the boundary priming read of a born-held
    // tree must not enter the creator's pass into the hold (#3540).
        if (spectating) return;
    // Verdict machinery (GlobalQueue._verdictPull: companion creation and the
    // latest()/isPending() pulls — the latest() shadow is created before it is
    // marked optimistic, so the bit alone cannot tell) and optimistic nodes
    // (own lane posture, A31) read staged truth by design; they keep the
    // entering path.
    // (`context` is non-null here: every caller selected a value for a reader.)
        const n = context;
    const i = activeTransition === null && !globalQueue.$t;
    // Verdict pulls are observations, not derivations: a latest() /
    // isPending() call from mainline must never enter a transaction (it
    // would capture the rest of the caller's synchronous block).
        if (i && GlobalQueue.Tn) return;
    if (n.oe & REACTIVE_RECOMPUTING_DEPS && !(n.C & CONFIG_OPTIMISTIC) && (stagedEntry === null || stagedEntry === t) && (i || !GlobalQueue.Tn && underFreshLoadingBoundary(n))) {
        stagedEntry = t;
        return;
    }
    globalQueue.initTransition(t);
}

/**
 * Rule 1 (value selection), the full arm: does this reader see a STAGED
 * node's COMMITTED value? One implementation of the rule the fast paths
 * (readNodeFast, read's fast block) carry as their trivial ternary and that
 * every slow site — read's tail, the store's backing selection, the lane and
 * verdict arms — used to restate by hand (docs/DESIGN-CONSOLIDATION.md, move 3b). In order:
 * - no reader at all (an untracked read) — the committed frame;
 * - a reader under an optimistic lane the engine says reads committed
 *   (laneReadsCommitted: another lane's hold, #3460);
 * - nothing staged;
 * - a children-forbidden reader (createTrackedEffect / onSettled: the frame,
 *   never the graph — A32);
 * - a stale reader (render effect) of a FOREIGN transaction's staged write —
 *   committed, no entanglement (heldFromStale registers the replay; a node
 *   born held has no committed frame to fall back to, `noCommitted`);
 * - HELD truth (#3164, CONFIG_HELD_TRUTH) read by a LANE pass: staged
 *   confirming truth — fold-staged onto an armed family, or entangle-stolen
 *   by an awaited until() — is masked from lane passes only, owning
 *   transaction or not. A lane applies its frame display-ahead at the park,
 *   so a lane pass served the truth would paint the confirmation beside the
 *   optimism it confirms (`saving=true` beside the saved row — the #3164
 *   tear); it keeps committed and is re-run by the reveal's post-revert
 *   wake. Every other deriving reader falls through to A29 below: the truth
 *   is a staged value like any other, and the pass that derives from it is
 *   held with it — including the retaining transaction's own passes, which
 *   a superseded override already hands the truth (#3568: masking them
 *   composed the landed `length` with rows still masked to committed).
 *   latest() and authoritative readers (until()'s predicate) tunnel
 *   through — the tunnel that keeps the hold deadlock-free.
 * False means the reader derives from the staged value and enters its
 * transaction (enterStagedRead, A29).
 */ function readerSeesCommitted(e, t, n, i) {
    return !!(!t || currentOptimisticLane !== null && GlobalQueue.An(e, n, t) || e._e === NOT_PENDING || t.C & CONFIG_CHILDREN_FORBIDDEN || stale && !i && heldFromStale(e, t) || e.C & CONFIG_HELD_TRUTH && currentOptimisticLane !== null && !latestReadActive && !(t.C & CONFIG_AUTHORITATIVE_READ));
}

/** A28 — set when a node is staged (queuePendingNode) or a held node rewritten
 * (stashHeldRewrite) OUTSIDE a flush; cleared when the next flush begins. The
 * read sites test this one module boolean instead of `globalQueue._running`:
 * inside a flush it is false and the A28 arm costs nothing; outside, only a
 * tick with unflushed writes pays the staged-node check. */ let unflushedStaged = false;

function markUnflushedStaged() {
    unflushedStaged = true;
}

/** A28 — a write becomes visible at flush. Outside a flush, a node holding an
 * AMBIENT staged value (no transaction stamp) was written since the last
 * flush: ambient staging commits at flush end, so nothing else leaves a node
 * in this state; a stamped value is the flushed held world, which A28 says
 * latest() serves. Inside a flush the rule does not apply (A28 (4): promoted
 * within the round). Structural — no marker on the write path. */ function unflushed(e) {
    return unflushedValue(e) !== NOT_PENDING;
}

/** The value an unflushed node serves — the committed value for an ambient
 * write, the flushed staged value for a rewrite of a held node — or
 * NOT_PENDING when nothing is unflushed. Exempt: owned-write nodes (A28 (4):
 * a write issued inside a recompute is promoted at that recompute's end —
 * boundary and loading machinery, until()'s internals, signals declared for
 * in-computation writes) and engine companions (the isPending() verdict
 * signal, the latest() shadow: the system's own writes, made at the source's
 * write to mirror it, installing eagerly — A28, A8). */ function unflushedValue(e, t = e.ce) {
    if (globalQueue.$t || e._e === NOT_PENDING || e.C & CONFIG_PROMOTED || e.o?.$n) return NOT_PENDING;
    // Ambient, or adopted by a transaction before any flush carried the staging
    // (CONFIG_ADOPTED_UNFLUSHED): nothing flushed is staged — the committed
    // value answers (the caller's notion of committed: a store node's backing).
    // A held node: unflushed only if rewritten since the last flush (stash).
        if (e.me === null || e.C & CONFIG_ADOPTED_UNFLUSHED) return t;
    return e.o === null ? NOT_PENDING : e.o.Ut;
}

/** Held nodes rewritten since the last flush (setSignal); the flush clears
 * their stash — from then on latest() answers with the rewrite. */ const unflushedRewrites = [];

/** Nodes written inside a creation-time recompute (CONFIG_PROMOTED). */ const promotedWrites = [];

/** A28 (5): an optimistic write becomes the ACTIVE override at the flush that
 * carries it. `_overrideTime` is stamped with `clock` at the write and `clock`
 * advances after every flush, so "this tick, outside a flush" is unflushed. */ function unflushedOverride(e) {
    // Companions are optimistic signals written by the engine (see unflushed).
    return !globalQueue.$t && e.o?.Pt === clock && !e.o?.$n;
}

/** Active optimistic override on an armed node (an armed slot idles at
 * NOT_PENDING; undefined = unarmed plain node). The writer's own channels —
 * the draft, `in`/keys inside the setter — compose on this regardless of
 * flush state. */ function hasActiveOverride(e) {
    const t = e.o;
    return t !== null && t.we !== undefined && t.we !== NOT_PENDING;
}

/** The override a READER sees: installed, and carried by a flush (A28 (5) —
 * an optimistic write is a write; until its flush no reader sees it). One
 * implementation for read()'s override arm, the verdict channels
 * (latestRead, computePendingState) and the store's selection
 * (docs/DESIGN-CONSOLIDATION.md, move 3b). */ function visibleOverride(e) {
    return hasActiveOverride(e) && !unflushedOverride(e);
}

/** A derivation served the committed value because of an unflushed write
 * (A28) must run again in the flush that carries it — the late-linker case
 * (#3337's reason to defer the walk): it linked after the write walked. */ function markLateLinker(e) {
    // The pass's own tail re-enqueues on this latch (recompute's finally) —
    // a direct enqueue here would be wiped by the pass's flag reset.
    e.oe |= REACTIVE_MISSED_WAKE;
    return true;
}

/** Companion-bearing nodes written outside a flush (setSignal); the flush
 * that carries their writes re-syncs their companions (A28). */ const unflushedCompanions = [];

function resyncUnflushedCompanions() {
    unflushedStaged = false;
    // Length-guarded: the common flush has nothing here, and must allocate nothing.
    // Length-guarded: the common flush has nothing here and allocates nothing.
        if (unflushedRewrites.length !== 0) {
        for (const e of unflushedRewrites) e.o.Ut = NOT_PENDING;
        unflushedRewrites.length = 0;
    }
    if (promotedWrites.length !== 0) {
        for (const e of promotedWrites) e.C &= ~CONFIG_PROMOTED;
        promotedWrites.length = 0;
    }
    if (unflushedCompanions.length !== 0) {
        for (const e of unflushedCompanions) GlobalQueue.Le(e, e._e !== NOT_PENDING ? e._e : e.ce);
        unflushedCompanions.length = 0;
    }
}

function readNodeFast(e) {
    if (latestReadActive || pendingCheckActive || e.Se || e.Ne || e.o?.we !== undefined || e.o?.ct !== undefined || activeTransition !== null || currentOptimisticLane !== null || snapshotCaptureActive || 
    // A28: a staged node read outside a flush may serve its committed value;
    // that arm lives on the slow path so this body stays inlinable.
    unflushedStaged && e._e !== NOT_PENDING || false) return READ_SLOW;
    let t = context;
    if (t?.Zt) t = t.Yt;
    if (t && tracking) link(e, t);
    // Children-forbidden readers (createTrackedEffect / onSettled callbacks) get
    // committed visibility: like the effect half of createEffect and event
    // handlers, effect-phase code never observes its own unsettled write — the
    // write lands in the same flush's continuation (#3006).
    // A stale reader (render effect) recomputing with no transaction active is
    // mainline: a write staged by a live transaction (`_transition` stamped —
    // ambient staging never is) stays masked until that transaction's reveal,
    // the same rule the slow path applies (#3322). Without it a zombie
    // recompute, or a commit-time re-derive of a contested effect, published
    // another transaction's uncommitted value.
        return !t || e._e === NOT_PENDING || t.C & CONFIG_CHILDREN_FORBIDDEN || stale && heldFromStale(e, t) ? e.ce : (enterStagedRead(e), 
    e._e);
}

function read(e) {
    // Handle latest() mode: read from _latestValueComputed
    // Checked before isPending so that isPending(() => latest(x)) checks
    // the _pendingSignal of _latestValueComputed (async in flight) rather
    // than the original node (which stays "pending" while held in a transition).
    if (latestReadActive) return GlobalQueue.Cn(e);
    let t = context;
    if (t?.Zt) t = t.Yt;
    const n = e;
    const i = e.Ne;
    const l = i || e;
    // Handle isPending() mode: collect pending state while preserving normal read semantics.
    // Probe mode is suspended while preparing the node so nested reads during a
    // recompute don't collect into the probe.
        if (pendingCheckActive) {
        GlobalQueue.Rn(e, t, l, i);
    } else if (typeof n.Se === "function") {
        prepareComputed(e, false);
    }
    if (!n.Se && l === e && e.o?.we === undefined && e.o?.ct === undefined && activeTransition === null && currentOptimisticLane === null && !snapshotCaptureActive && (!unflushedStaged || e._e === NOT_PENDING) && // A28, see readNodeFast
    true) {
        if (t && tracking) link(e, t);
        // Committed visibility for children-forbidden readers and for stale
        // readers of a foreign transaction's staged write — see readNodeFast.
                return !t || e._e === NOT_PENDING || t.C & CONFIG_CHILDREN_FORBIDDEN || stale && heldFromStale(e, t) ? e.ce : (enterStagedRead(e), 
        e._e);
    }
    if (t && tracking) {
        link(e, t, pendingCheckActive);
        if (l.Se) {
            const n = queueFor(e);
            if (l.ft >= n.st) {
                markNode(t);
                markHeap(n);
                updateIfNecessary(l);
            }
            // Fresh-pull readers (awaitable refresh's waiter) recompute a dirty
            // source inline even when the height gate defers to the flush: the
            // waiter must park on the re-ask's window (or serve its sync answer),
            // never read the PRE-re-ask value as settled. Self-guarded: a clean
            // node no-ops and updateIfNecessary refuses disposed nodes (#2983) —
            // a dead target serves its last value, which is already quiescent.
             else if (t.C & CONFIG_FRESH_READ) updateIfNecessary(l);
            const i = l.ft;
            // parent check is shallow, might need to be recursive
                        if (i >= t.ft && e._parent !== t) {
                t.ft = i + 1;
            }
        }
    }
    if (l.S & STATUS_PENDING) {
        // A reader landing on a pending node throws — the reveal that discovered
        // the flight holds on it (A15: observed async settles as one unit) — with
        // one carve-out: a stale (render) reader of a node pending in some OTHER
        // transaction keeps showing the node's committed value, no entanglement
        // (parallel transactions; the reader is recorded for that transaction's
        // commit replay, `heldFromStale`). The carve-out is sound only while the
        // committed value is coherent with the visible frame, i.e. while the
        // flight's inputs are themselves unpublished: the stamp alone does not
        // say so (it is pending-node bookkeeping), so it is refused when the
        // inputs are on screen — committed by a batch that left the flight in
        // the air (CONFIG_INPUTS_PUBLISHED, #3305) or revealed through a lane
        // (optimistic / latest, #3334) — and the reader holds instead. An
        // UNINITIALIZED node has no committed value to show and holds too
        // (firewall-backed store reads always did; plain memos since the #3043
        // port): falling through served `undefined` as if settled and stranded
        // the reader outside both transactions, so it never re-ran.
        if (t && !(stale && !(l.S & STATUS_UNINITIALIZED) && !(l.C & CONFIG_INPUTS_PUBLISHED) && !(l.C & CONFIG_HAS_LANE && GlobalQueue.Gn(l)) && heldFromStale(l, t))) {
            // Per-lane suspension lives with the engine (a non-null lane implies it
            // is installed): under a lane, only same-lane pending async without an
            // active override throws — plus uninitialized sources regardless of
            // lane (#3276); that check rides laneSuspends so floor bundles don't
            // pay for it.
            if (currentOptimisticLane === null || GlobalQueue.Dn(l)) {
                // An untracked read of a pending node still re-runs its reader when
                // the node settles — unless nobody is reading (`spectating`, #3528)
                // or the reader is the node itself.
                if (!tracking && !spectating && e !== t) link(e, t);
                throw l.o?._;
            }
        } else if (!t && l.S & STATUS_UNINITIALIZED && 
        // An armed DERIVED override shields the uninitialized state from a
        // read with no reader identity (#3648 follow-up, A18 (d)): a memo
        // whose first landing rode its lane (asyncWrite's lane branch →
        // `laneOverride`) has no `_value` — the flag stays set until the lane's
        // commit promotes the override — yet the override IS the displayed
        // value of a pending node (A18 (c), the screen keeps it until the
        // commit), exactly as an initialized node re-deriving under its override
        // displays it. "Uninitialized must suspend" (#3276, A19 exception 1) was
        // written for a node with NOTHING to show; this node has the override.
        // The arm fires in the body-end window: the source override superseded
        // (A18 body-end, #3427), the memo re-deriving on the plain channel and
        // held, its own slot still armed. Fall through to serve()'s override
        // arm. Readers WITH identity are untouched: a tracked lane reader keeps
        // the override (A17), an off-lane one suspends (#3651, `overrideRead`).
        !(hasActiveOverride(e) && e.C & CONFIG_DERIVED_OVERRIDE)) {
            throw l.o?._;
        }
    }
    // `owner` is the computed itself, or the firewall behind a store node —
    // firewall-backed reads follow the same rules (memo parity, #2897 ruling):
    // an errored derive throws for every late reader instead of silently
    // serving node values (the seed, or last-good data after a failed refetch).
        if (l.Se && l.S & STATUS_ERROR) {
        // Only a genuine reactive re-read may retry an errored async source:
        // - tracking: owned/tracked scope only (never events / `untrack` / effect side-effect phase)
        // - !pendingCheckActive: an `isPending` probe observes the error, never refetches
        // - owner._time < clock: only on a later cycle than the one the error was found
        if (tracking && !pendingCheckActive && l.Ge < clock) {
            recompute(l);
            return read(e);
        } else throw l.o?._;
    }
    if (snapshotCaptureActive && t && t.C & CONFIG_IN_SNAPSHOT_SCOPE) {
        const n = e.o?.ct;
        if (n !== undefined) {
            const i = n === NO_SNAPSHOT ? undefined : n;
            const l = e._e !== NOT_PENDING ? e._e : e.ce;
            if (l !== i) t.oe |= REACTIVE_SNAPSHOT_STALE;
            return i;
        }
    }
    const u = serve(e, t, l, e.ce);
    if (!t && l === e && typeof n.Se === "function" && e.C & CONFIG_AUTO_DISPOSE && !(l.S & STATUS_PENDING) && !e.u && 
    // An untracked read served a visible override returned before this
    // sweep registration when the arm was inline; keep that.
    !visibleOverride(e)) {
        // Deferred, not inline (#3078): an inline unobserved() here made untracked
        // reads destructive — dispose on this read, full revival recompute on the
        // next — so consecutive reads could answer differently with no write in
        // between (the revival samples the ambient transition/lane context).
        // The sweep at flush finalization re-validates and reclaims; schedule()
        // guarantees that flush happens even if nothing else is queued.
        dormantNodes.add(e);
        schedule();
    }
    return u;
}

/**
 * Rule 1, the one slow implementation (DESIGN-CONSOLIDATION move 3b, step
 * 6c): the value a reader `c` (null = untracked, no pass) is served from
 * `el`, whose committed value is `committed` — the node's own `_value` for
 * a signal or memo, the BACKING for a store property node (single-home rule,
 * O6: committed truth lives in the backing and a node's `_value` is never
 * served for one). Called by read()'s slow tail and by the store's untracked
 * node path (nodeValue); the fast paths (readNodeFast, read's fast block)
 * keep their trivial ternary by design (perf, see the doc). Arms, in order:
 * - the override (A17), routed through the engine for a tracked reader under
 *   a lane or a supersession (A18), an authoritative reader marked instead;
 * - the lane entanglement gate (committed, recorded for replay);
 * - a node born held has nothing for an untracked reader (A19 exception 1);
 * - an unflushed write serves committed and re-runs the reader in the
 *   carrying flush (A28);
 * - readerSeesCommitted, else the staged value and the transaction (A29).
 */ function serve(e, t, n, i) {
    if (hasActiveOverride(e)) {
        // A17: the override IS the value for every reader — except an authoritative
        // reader (until()'s predicate carries CONFIG_AUTHORITATIVE_READ): it must
        // observe independently-arriving truth, and serving it the caller's own
        // tentative write would trivially satisfy the predicate. The bit is checked
        // on the reading computation itself, so a shared computed the predicate
        // pulls recomputes as ITSELF (context = the memo, no bit) under the normal
        // view. Fall through to normal value selection (staged `_pendingValue` is
        // authoritative — optimism never lives there); the sticky mark makes the
        // A17-silent "landing equals override" paths notify this node's subs so
        // the reader re-runs when truth arrives.
        // A28 (5): an optimistic write written this tick, outside a flush, is not
        // yet the active override — fall through to the normal selection (the
        // authoritative mark below still applies: until() must wake on landing).
        if (!(t && t.C & CONFIG_AUTHORITATIVE_READ) && !unflushedOverride(e)) {
            // A tracked read of an override is the engine's selection (a lane or a
            // supersession implies the engine): a render effect OFF the override's
            // held lane sees the committed value (#3460, lanes mirror transitions);
            // a node whose own source answered with a DIFFERENT value hands a
            // tracked reader the staged truth (A18 supersession, #3331). Untracked
            // reads display the override.
            if (t && e.C & (CONFIG_HAS_LANE | CONFIG_OVERRIDE_SUPERSEDED)) return GlobalQueue.Pn(e, t);
            return unwrapOverride(e.o?.we);
        }
        e.C |= CONFIG_AUTHORITATIVE_OBSERVED;
    }
    // Entanglement gate: a reader recomputing under an optimistic lane that reads
    // a pending mid-transition write sees the committed value. Projection-store
    // manual writes use the firewall's manual-write flag to opt into this path.
    // Async drivers are not under an optimistic lane and so bypass this, reading
    // _pendingValue for correct fetching. The sub is recorded for replay at commit
    // so it re-runs with the new committed view. (Gate details live with the
    // engine — a non-null lane implies it is installed.)
        if (currentOptimisticLane !== null && activeTransition !== null && t !== null && GlobalQueue.Fn(e, n, t)) {
        return i;
    }
    // In optimistic lane context, return _value for optimistic/lane-assigned signals
    // and for regular signals in stale mode (render effects). Non-stale readers (user
    // effects) see _pendingValue so that latest() and direct reads stay consistent.
    // (The lane-context clause lives with the engine.) Children-forbidden readers
    // (createTrackedEffect / onSettled callbacks) get committed visibility — see
    // readNodeFast (#3006).
    // A node born held (recompute) has a staged value and no committed one: a
    // stale reader cannot fall back to the committed frame, so it takes the
    // staged value and enters like a tracked reader (A29); an untracked reader
    // has nothing to serve and holds (A19 exception 1) — a bookkeeping read
    // (`spectate`) likewise: it derives nothing, so it cannot enter, and a
    // held-only value is simply not ready to it.
        const l = e._e !== NOT_PENDING && (e.S & STATUS_UNINITIALIZED) !== 0;
    if (l && (!t || spectating)) throw new NotReadyError(null);
    const u = t && unflushedStaged ? unflushedValue(e, i) : NOT_PENDING;
    if (u !== NOT_PENDING) {
        markLateLinker(t);
        if (pendingCheckActive) GlobalQueue.Hn(e, u);
        return u;
    }
    const o = readerSeesCommitted(e, t, n, l) ? i : (enterStagedRead(e), e._e);
    // Record that this isPending() probe observed the fresh pending value, so
    // the probe doesn't pair "pending" with the new value (#2831).
        if (pendingCheckActive) GlobalQueue.Hn(e, o);
    return o;
}

/** A28 — a rewrite of a HELD node outside a flush keeps the staged value the
 * last flush left, for latest()/verdicts, until the next flush carries it
 * (stash, cleared at that flush). Cold: only stamped nodes reach here. */ function stashHeldRewrite(e) {
    if (globalQueue.$t) return;
    const t = ext(e);
    if (t.Ut === NOT_PENDING) {
        t.Ut = e._e;
        unflushedRewrites.push(e);
        unflushedStaged = true;
    }
}

/** A28 (4) — written inside a recompute that runs OUTSIDE a flush (a
 * creation-time compute): promoted at that pass's end, visible to the rest of
 * the block. Cold: only contextual writes reach here. */ function notePromotedWrite(e) {
    if (globalQueue.$t || e.C & CONFIG_PROMOTED) return;
    e.C |= CONFIG_PROMOTED;
    promotedWrites.push(e);
}

/** Cold half of setSignal's snapshot arm (see there): first write during
 * capture to a plain signal without a live snapshot records the pre-write
 * value. Only plain user signals qualify. Computeds reach setSignal from an
 * async landing (asyncWrite), and a value arriving from async during the pass
 * REVEALS — the creation-time arm skips pending computeds for the same
 * reason. Firewall leaves belong to a projection whose compute is the tree's
 * own work, captured (or deliberately not) at creation. */ function captureWriteSnapshot(e, t) {
    if (e.C & CONFIG_NO_SNAPSHOT || e.Se !== undefined || e.Ne || e.o?.ct !== undefined) return;
    ext(e).ct = t === undefined ? NO_SNAPSHOT : t;
    e.C |= CONFIG_HAS_SNAPSHOT;
    snapshotSources.add(e);
}

function setSignal(e, t) {
    // A write to a held node is a second proposal on a contested node (A34, #3494):
    // the writer's tick reveals with the hold, the same value or another. Inside
    // a flush the round enters now; from mainline the entry waits for the next
    // flush's start (batchJoins) — entering here left activeTransition set for
    // the rest of the caller's block, so a memo created after the write became
    // the transaction's instead of mainline's (A28, A29). Before the equality
    // gate below: repeating the held value proposes it too — and that repeat
    // leaves through the gate, so the join schedules its own flush here; left
    // for the next flush to find, it adopted an unrelated tick (#3519 review).
    // A held DERIVATION is not a proposal (A34 amendment, #3612): the user
    // setters of derived nodes (setMemo, the derived store's setter) classify
    // the write before it reaches here — see heldDerivation — and re-derive
    // under the hold instead of masking; the join stands either way.
    if (e.me && activeTransition !== e.me) {
        if (globalQueue.$t) globalQueue.initTransition(e.me); else {
            batchJoins.push(e.me);
 // dupes: a bare return in initTransition
                        schedule();
        }
    }
    // The optimistic write path lives with the engine: only optimisticSignal /
    // optimisticComputed callers and optimistic store nodes carry an
    // _overrideValue slot (flagged by CONFIG_OPTIMISTIC — a masked read of the
    // always-present config instead of a missing-property probe), and every
    // module that installs one installs the engine first.
        if (e.C & CONFIG_OPTIMISTIC) {
        if (!projectionWriteActive) return GlobalQueue.Ln(e, t);
        // An authoritative store landing on an override-covered node: the store
        // twin of asyncWrite's override branch, decided by the engine (#3331).
                const n = e.o?.we;
        if (n !== undefined && n !== NOT_PENDING) return GlobalQueue.Vn(e, t);
    }
    const n = e._e === NOT_PENDING ? e.ce : e._e;
    if (typeof t === "function") t = t(n);
    // Uninitialized check first: the first commit has no previous value, so the
    // user comparator must not run against `undefined` (matches recompute).
        const i = !!(e.S & STATUS_UNINITIALIZED) || !e.Fe || !e.Fe(n, t);
    if (!i) return t;
    // Attribution hook: this committed write is where a re-run chain begins.
        if (attrHooks !== null) attrHooks.write(e, n, t);
    // A write during hydration's snapshot capture to a source that has no
    // snapshot — created BEFORE capture began (module-level state: an identity
    // minted from onSettled in the pass, a preference read from storage) —
    // captures the pre-write value now, so the write is held like any other:
    // in-scope readers keep serving what the server rendered with and replay
    // at release. Left uncaptured, the write cascades live through a claim
    // pass whose DOM writes are skipped, and a component rendered later in the
    // pass reads a value the server never had. Store leaves written here are
    // plain signals and qualify the same way.
        if (snapshotCaptureActive) captureWriteSnapshot(e, n);
    const l = e._e !== NOT_PENDING;
    if (!l) queuePendingNode(e);
    // A28 arms, gated on the loads the write already pays for (a plain ambient
    // rewrite outside a flush — the write-loop shape — costs `_transition` and
    // `context` here and nothing else; the arms themselves are cold helpers so
    // setSignal stays within every setter's inlining budget, ~300 B bytecode).
     else if (e.me !== null) stashHeldRewrite(e);
    e._e = t;
    if (context !== null) notePromotedWrite(e);
    // syncCompanions only pokes _pendingSignal/_latestValueComputed — with
    // neither companion present the call is a guaranteed no-op (companions are
    // only ever created, never removed, and creating one installs the hook and
    // sets CONFIG_HAS_COMPANIONS — one masked read replaces two optional-field
    // probes on every write).
        if (e.C & CONFIG_HAS_COMPANIONS && GlobalQueue.Le !== null) {
        GlobalQueue.Le(e, t);
        // A28 (2): the verdict computed here is the PRE-flush one (an unflushed
        // write is not pending); the flush that carries the write re-syncs so
        // the companions mirror the flushed world. Only companion nodes pay.
                if (!globalQueue.$t) unflushedCompanions.push(e);
    }
    // _time is a computed-only slot (§12e): writing it on a signal would fork
    // the lean shape. Every read site is computed-typed.
        if (e.Se !== undefined) e.Ge = clock;
    // Staged-rewrite fast path (§12d): a re-write to a node whose subscribers
    // were already walked — and where nothing has recomputed or linked since
    // (epoch) — re-stages the value and stops. The walk is idempotent (subs
    // marked, heap entries flag-guarded, effects queued once); lane and reask
    // contexts change what a walk MEANS, so they always walk.
        if (l && e.Lt === notifyEpoch && currentOptimisticLane === null && !reaskArmed) return t;
    insertSubs(e);
    schedule();
    return t;
}

/**
 * Suppresses automatic recomputation of `el` until the scheduler drains. Used
 * when a manual write should win over dependency changes queued in the same
 * tick. The MANUAL_WRITE flag is cleared by the pending-node drain; projection
 * computeds don't commit values, but they still need the same end-of-tick
 * cleanup point.
 */ function suppressComputedRecompute(e) {
    deleteFromHeap(e, queueFor(e));
    if (!(e.oe & REACTIVE_MANUAL_WRITE) && e._e === NOT_PENDING) {
        queuePendingNode(e);
        schedule();
    }
    e.oe = e.oe & -4 | REACTIVE_MANUAL_WRITE;
    e.Un = clock;
}

/** A34 amendment (#3612) — is `el`'s staging a DERIVATION another transaction
 * holds: stamped by a transaction that is not the writer's, and not a manual
 * proposal (the mask, on the node or — a store leaf — its firewall)? #2692's
 * "manual write wins" is a rule for one synchronous frame; across a hold the
 * held pass result is nobody's proposal, and a user setter reaching it
 * composes on the committed frame it was written against and becomes `prev`
 * for the transaction's re-derivation (rederiveHeld) instead of replacing it.
 * Writes made under the holding transaction masked the node and keep
 * A34(1)'s last-write-wins. Only the user setters ask; an async landing or a
 * companion writing a stamped node is the transaction's own work. */ function heldDerivation(e) {
    return e.me !== null && activeTransition !== e.me && !((e.Ne || e).oe & REACTIVE_MANUAL_WRITE);
}

/** The held-derivation write's second half: the node re-derives under its
 * hold with the written staging as the pass's `prev`. Nothing is masked. The
 * write took the A34 join (setSignal), which scheduled the flush that drains
 * this; recompute re-enters the stamp. */ function rederiveHeld(e) {
    e.oe |= REACTIVE_DIRTY;
 // over CHECK: the heap visit recomputes, not re-checks
        enqueueSub(e);
}

/**
 * User-facing setter for the memo form of `createSignal(fn)`. Behaves like
 * `setSignal`, but also cancels any pending recompute of the memo so the
 * manual value wins over a value that would otherwise be produced by an
 * upstream change in the same tick. Across a hold the write is not a
 * proposal: a memo another transaction holds as a pass result composes on the
 * committed value and re-derives under the hold with the write as `prev`
 * (A34 amendment, #3612; heldDerivation).
 */ function setMemo(e, t) {
    const n = heldDerivation(e);
    if (n && typeof t === "function") t = t(e.ce);
    const i = setSignal(e, t);
    n ? rederiveHeld(e) : suppressComputedRecompute(e);
    return i;
}

/**
 * Executes `fn` with the given `owner` set as the current owner. Any reactive
 * primitives (`createSignal`, `createMemo`, `createEffect`, `onCleanup`,
 * `cleanup`, etc.) created inside `fn` are attached to that owner, so they
 * are disposed when the owner is disposed.
 *
 * The classic pattern: capture the current owner with `getOwner()` inside a
 * component, then re-enter it from a callback (event handler, async resolve,
 * setTimeout) so disposables created in the callback get cleaned up with the
 * component.
 *
 * @example
 * ```ts
 * function delayed<T>(ms: number, fn: () => T) {
 *   const owner = getOwner();
 *   setTimeout(() => runWithOwner(owner, fn), ms);
 * }
 * ```
 */ function runWithOwner(e, t) {
    const n = context;
    const i = tracking;
    context = e;
    tracking = false;
    try {
        return t();
    } finally {
        context = n;
        tracking = i;
    }
}

function staleValues(e, t = true) {
    const n = stale;
    stale = t;
    try {
        return e();
    } finally {
        stale = n;
    }
}

/**
 * Core marking half of `refresh()` (the public wrapper lives in signals.ts —
 * it validates the target, marks through here, then builds the quiescence
 * promise on the resolve()/until() effect machinery). Flags the node's next
 * recompute as a quiet re-ask and schedules it; no-ops for non-derived or
 * disposed targets and for same-tick manual writes.
 */ function markRefresh(e) {
    if (typeof e.Se === "function" && !(e.oe & REACTIVE_DISPOSED)) {
        if (e.oe & REACTIVE_MANUAL_WRITE) {
            // A manual write in the CURRENT tick wins over the refresh (#2692).
            // A mask stamped in an earlier tick only survives because a
            // transaction (action) is holding the pending drain open; there the
            // refresh is a later, explicit re-ask and lifts the mask — otherwise
            // any setStore early in an action silently swallows every refresh()
            // for the rest of the transaction (#3026).
            if (e.Un === clock) return;
            e.oe &= ~REACTIVE_MANUAL_WRITE;
            // The lift falls through to the re-ask classification below. The held
            // write's value change already rides the transaction; the refetch it
            // asks for is the same question with unchanged inputs. Skipping the
            // mark here classified that refetch as a NEW question, which pends
            // every leaf (3.1) — an action doing setStore + yield + refresh(store)
            // lit up every sibling row, and affects() could not narrow it (a mark
            // only turns pending on). Same-question motion stays silent (3.4);
            // the written slot and any declared mark carry the pending instead.
                }
        // A refresh with no value-change dirt already queued is a re-ask of the
        // same question: mark it so the recompute classifies any resulting
        // pending window as quiet (not pending). If the node is already dirty
        // from a real input change, the question changed — don't mark.
        // REACTIVE_IN_HEAP counts as dirt: insertSubs schedules subscribers by
        // heap insertion alone (no DIRTY/CHECK flag), so a same-batch value
        // change followed by refresh() must not be laundered into a quiet re-ask.
                if (!(e.oe & (REACTIVE_DIRTY | REACTIVE_CHECK | REACTIVE_IN_HEAP))) {
            e.oe |= REACTIVE_REASK;
            armReaskClear();
        }
        e.oe = e.oe & ~REACTIVE_CHECK | REACTIVE_DIRTY;
        // A refresh() self-invalidation is a root cause too — the target's next
        // run has no changed dep to point at, so it points here instead.
                if (attrHooks !== null) attrHooks.refreshed(e);
        insertIntoHeap(e, queueFor(e));
        schedule();
    }
}

export { READ_SLOW, clearSnapshots, computed, context, createEffectNode, currentOptimisticLane, effectStatusNotify, enterStagedRead, ext, hasActiveOverride, heldDerivation, installAuthoritativeRead, isEqual, latestReadActive, markLateLinker, markRefresh, markSnapshotScope, markUnflushedStaged, notifyAuthoritativeObservers, notifyOnLane, optimisticComputed, optimisticSignal, ownsHold, pendingCheckActive, prepareComputed, read, readNodeFast, readerSeesCommitted, recompute, recordStaleReplay, rederiveHeld, releaseSnapshotScope, resyncUnflushedCompanions, runWithOwner, serve, setContextInternal, setEffectStatusNotify, setLatestReadActive, setMemo, setPendingCheckActive, setSignal, setSlotUnobserved, setSnapshotCapture, signal, slotSignal, slotUnobservedHook, snapshotCaptureActive, snapshotSources, spectate, spectating, stale, staleValues, statusNotifierOf, suppressComputedRecompute, tracking, unflushed, unflushedCompanions, unflushedOverride, unflushedStaged, unflushedValue, unlinkFirewallChild, untrack, visibleOverride };