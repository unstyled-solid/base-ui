import { STATUS_UNINITIALIZED, CONFIG_CHILD_COMPANIONS, STATUS_ERROR, STATUS_PENDING, CONFIG_DERIVED_OVERRIDE, CONFIG_INPUTS_PUBLISHED, REACTIVE_DIRTY, REACTIVE_OPTIMISTIC_DIRTY, NOT_PENDING, unwrapOverride, CONFIG_AUTO_DISPOSE, REACTIVE_ZOMBIE, REACTIVE_DISPOSED } from "./constants.js";

import { attrHooks } from "./attribution-hooks.js";

import { untrack, ext, statusNotifierOf, hasActiveOverride, setSignal, context } from "./core.js";

import "./invariants.js";

import "./dev.js";

import { StatusError, NotReadyError } from "./error.js";

import { trimStaleDeps, unobserved } from "./graph.js";

import { enqueueSub } from "./heap.js";

import { assignOrMergeLane, resolveLane, resolveTransition } from "./lanes.js";

import { cleanup } from "./owner.js";

import { GlobalQueue, schedule, flush, queuePendingNode, insertSubs, clock, waitingTransition, currentTransition, globalQueue, enterWaiting, setOrigin, origin } from "./scheduler.js";

// The lazily-created Set is the ONE container for pending sources. Its
// predecessor — a singular slot promoted to a Set on the second source —
// created dual state whose migration invariant was easy to break: a third
// overlapping source landed beside the Set and removePendingSource refused
// to clear it, stranding the Set members' pending forever (#2893).
function addPendingSource(e, t) {
    if (e.o?.ue?.has(t)) return false;
    (ext(e).ue ??= new Set).add(t);
    return true;
}

function removePendingSource(e, t) {
    const n = e.o?.ue;
    if (!n?.delete(t)) return false;
    if (!n.size) e.o.ue = undefined;
    return true;
}

function clearPendingSources(e) {
    // This set is node-owned and never shared; dropping the sole reference
    // releases the set and every entry without a redundant clear() walk.
    if (e.o !== null) e.o.ue = undefined;
}

// A rejection-pending only resolves through the settle sweep over the
// SOURCE's subscribers, so it is retryable iff a tracked read created that
// edge: a dep that IS the source, or one whose own pending chain carries it
// (pending sources propagate the origin node, so this covers any depth).
// Also guards branch-local recovery: another dependency may still need the source.
function retryReaches(e, t) {
    for (let n = e.Ee; n; n = n.Ie) {
        const e = n.De.Ne || n.De;
        if (e === t || e.o?.ue?.has(t)) return true;
    }
    return false;
}

/**
 * A loading-window node hit an unready source (sync throw in recompute, or a
 * NotReadyError-rejected flight): register for the source's settle — the
 * settlePendingSource walk runs off `_pendingSources` + `_blocked` alone —
 * with NO read-visible pending status, no downstream propagation, no
 * transition, no lane registration. Commit #0 keeps serving.
 */ function parkLoadingWindow(e, t) {
    ext(e).Oe = true;
    if (t.source) addPendingSource(e, t.source);
    // A settled error is the node's answer ("the error stays the answer until
    // this retry can actually run") — the park must not replace it: reads
    // throw `_error` while STATUS_ERROR is set, and overwriting it here leaks
    // a pending-class NotReadyError from a read-invisible park (#2989).
        if (!(e.S & STATUS_ERROR)) setPendingError(e, t.source, t);
}

function setPendingError(e, t, n) {
    if (!t) {
        if (e.o !== null) e.o._ = null;
        return;
    }
    if (n instanceof NotReadyError && n.source === t) {
        ext(e)._ = n;
        return;
    }
    const r = e.o?._;
    if (!(r instanceof NotReadyError) || r.source !== t) {
        ext(e)._ = new NotReadyError(t);
    }
}

function forEachDependent(e, t) {
    for (let n = e.u; n !== null; n = n.Pe) t(n.Ae, n);
    // `?? null`: affects() marks route plain signals (no `_child` slot) through here.
        for (let n = e.o?.i ?? null; n !== null; n = n.ge) {
        for (let e = n.u; e !== null; e = e.Pe) t(e.Ae, e);
    }
}

// Queue a node to re-run on the next flush (used both when a pending source
// settles and when an `isPending` observer must re-evaluate after a real error):
// shared scheduling helper in heap.ts (tracked effects bypass the heap).
// Settle-time counterpart of unlinkSubs' last-one-out check. A lazy node that
// loses its last subscriber while STATUS_PENDING is exempt from autodispose
// (the in-flight work is an observer), so whatever CLEARS that pending state
// must run the release — otherwise the node stays linked and recomputes
// forever with zero subscribers (#2934). The node's own promise/iterator
// callbacks handle their own release (settleAutodispose in handleAsync); this
// covers derivatively-pending dependents, which have no callbacks of their own.
function releaseIfSettledUnobserved(e) {
    e.Se && e.C & CONFIG_AUTO_DISPOSE && !e.u && !(e.oe & REACTIVE_ZOMBIE) && !(e.S & STATUS_PENDING) && unobserved(e);
}

// Error-path sweep: notifyStatus(STATUS_ERROR) clears dependents' pending
// sources through its own recursion (no per-node settle callback), so after
// the propagation completes, walk the same graph for stranded lazy nodes.
// Collect-then-release so unobserved() never unlinks under the walk.
function releaseSettledDependents(e) {
    let t;
    const n = new Set;
    const visit = e => {
        if (n.has(e)) return;
        n.add(e);
        if (!e.u && e.C & CONFIG_AUTO_DISPOSE) (t ??= []).push(e);
        forEachDependent(e, visit);
    };
    forEachDependent(e, visit);
    if (t) for (const e of t) releaseIfSettledUnobserved(e);
}

// Error-dimension twin of settlePendingSource's blocked re-enqueue (#2949):
// a node in STATUS_ERROR that recovers by recomputing to an UNCHANGED value
// fires no value notification — the recovery is completely silent. But a
// dependent that re-ran during the error window consumed its dirty flag and
// committed nothing (the fresh sibling values it read were absorbed into an
// errored run), so its committed value is stale. The propagated error is one
// object identity down the whole dependent tree, and holding it is exactly
// the "blocked on this error" marker — re-enqueue those holders so they
// re-run: fresh values commit and flow, and a dependent with another
// still-broken source simply re-errors. Pending recovery uses
// settlePendingSource to clear inherited status and retry blocked readers.
// Walks the full dependent graph
// (releaseSettledDependents shape): identity holders can sit below an
// intermediate whose own error state has since been scrubbed or replaced
// (e.g. an error boundary's tree node).
function settleErroredDependents(e, t) {
    let n = false;
    const r = new Set;
    const visit = e => {
        if (r.has(e)) return;
        r.add(e);
        if (e.o?._ === t) {
            enqueueSub(e);
            n = true;
        }
        forEachDependent(e, visit);
    };
    forEachDependent(e, visit);
    if (n) schedule();
}

// Retire `source` from pending state along the dependent graph rooted at `el`.
// By default, `el` is the source whose flight settled or was superseded.
// With a distinct `source`, `el` is a recovered computation that dropped it:
// the source may still be pending, so dependents with another path to it stay pending.
function settlePendingSource(e, t = e) {
    // Landing and branch recovery already cleared el's own set. Superseded
    // re-parks can retain an abandoned self entry (source === el), which must
    // retire in the same walk as its propagated copies.
    removePendingSource(e, t);
    let n = false;
    let r;
    const o = new Set;
    // Companion updates no-op without the verdict layer (null hook).
        const i = GlobalQueue.Ue;
    const settle = s => {
        if (o.has(s)) return;
        // A conditional dropped this source, but another dependency can still
        // carry it. Only retire pending state inherited through the recovered
        // branch. Deliberately NOT marked visited on this early return: the
        // carrying dependency may itself be a later branch of this same walk
        // (two unchanged memos converging), and its visit must be free to
        // re-examine this node once that branch has retired the source.
                if (t !== e && retryReaches(s, t)) return;
        if (!removePendingSource(s, t)) return;
        o.add(s);
        s.Ge = clock;
        const u = s.o?.ue?.values().next().value;
        // STATUS_ERROR + pending sources only coexist via an errored loading
        // window's park (notifyStatus(STATUS_ERROR) clears pending sources
        // otherwise): the settled error stays the answer through the settle —
        // nulling it here would have reads throw `null` until the re-enqueued
        // retry lands, or lose it entirely if that retry parks again (#2989).
                const l = s.S & STATUS_ERROR;
        if (u) {
            if (!l) setPendingError(s, u);
            i?.(s);
        } else {
            s.S &= ~STATUS_PENDING;
            if (!l) setPendingError(s);
            i?.(s);
            if (s.o?.Oe) {
                enqueueSub(s);
                n = true;
            }
            if (s.o !== null) s.o.Oe = false;
            // Fully settled with nobody watching: release candidate (#2934). Checked
            // again at release time — deferred so unobserved() can't unlink subs
            // lists this walk is still iterating.
                        if (!s.u && s.C & CONFIG_AUTO_DISPOSE) (r ??= []).push(s);
        }
        forEachDependent(s, settle);
    };
    forEachDependent(e, settle);
    // Release before the flush schedule below: unobserved() pulls the node back
    // out of the heap, so the enqueueSub above never recomputes a released node.
        if (r) for (const e of r) releaseIfSettledUnobserved(e);
    if (n) schedule();
}

// Object-thenable detection (Promises/A+ shape).
function isThenable(e) {
    return e != null && typeof e === "object" && typeof e.then === "function";
}

/** Fire and clear a node's iterator-flight cancellation hook (#3122). */ function releaseFlightTeardown(e) {
    const t = e.o?.be;
    if (t != null) {
        e.o.be = null;
        t();
    }
}

function handleAsync(e, t, n) {
    let r = false;
    let o = false;
    if (typeof t === "object" && t !== null) {
        untrack(() => {
            r = t[Symbol.asyncIterator];
            o = !r && isThenable(t);
        });
    }
    if (!o && !r) {
        if (e.o !== null) e.o.pe = null;
        // A sync landing is the first real answer for a loadingValue node.
                e.ye = false;
        return t;
    }
    // Flight replacement relies on recompute's supersede release for iterator
    // teardown (#3122): every handleAsync call — including the projection
    // self-registration — runs during a recompute of `el`, which has already
    // fired _flightTeardown. A future non-recompute registration path must
    // release it here before overwriting _inFlight.
        ext(e).pe = t;
    // The run that asked this flight read every input without throwing: an
    // input still in flight was masked for it (an active override, A17), so
    // pending state those inputs propagated onto the node earlier does not
    // describe this answer. Drop it — the flight is the node's pending now.
    // The landing retires only the flight's own entry (landStatus, #3373), so
    // an entry that survived here would hold the node past its own answer.
        e.o.ue = undefined;
    // Provenance of the question this flight asks (#3331): the action whose
    // window is registering it, or the flight whose landing is. Its landings
    // propagate under it (asyncWrite) so an override downstream can tell a
    // stale answer from its own.
        const i = origin;
    // Attribution hook: a new flight is registered. Fired here (not in the
    // branches below) so every flight shape — plain thenable, iterator, the
    // flattened combinations — is announced exactly once, while the recompute
    // frame that caused it is still on the engine's stack. Not inside a try
    // (#2883 — see attribution-hooks.ts).
        if (attrHooks !== null) attrHooks.flightStart(e, t);
    let s;
    // Settle-time transition re-entry. The loading rail is invisible to
    // transactions (#2933): a boundary-caught first load never registers as an
    // async reporter, so its settle — the boundary's fallback -> content
    // reveal — must flow ambiently. The node can still carry a `_transition`
    // stamp (pending-node bookkeeping rides through the stamping sites), and
    // blindly re-entering that stamped, still-incomplete transaction stashed
    // the reveal with it — a deadlock when the transaction's completion
    // depended on the reveal (#2937). An ESCAPED first load did register and
    // keeps transition scheduling; initialized (value-holding) pending settles
    // are the transaction's reveal machinery and always re-enter.
        const settleTransition = () => {
        let t = resolveTransition(e);
        // A lane-routed node's landing is revealed by its lane, ahead of the
        // transaction that owns the lane (whose own commit is only the override's
        // confirm/revert). Entering that owner here would fold every transaction
        // waiting on this flight into it at the landing — a reveal that
        // discovered the flight (#3305) would then wait on the owner's action
        // instead of on the flight (#3334). Enter the waiter: the transaction
        // whose blocker this landing clears. Then every transaction waiting on
        // the flight folds in (enterWaiting): a reveal that discovered it
        // completes at its landing (A15) — a stampless node's fresh batch
        // included (its flight started under a batch that committed beneath it,
        // #3305). The fold used to happen as each stamped reader recomputed,
        // which effects no longer do (#3407).
                if (e.o?.Ce) t = waitingTransition(e) ?? t;
        if (t && e.S & STATUS_UNINITIALIZED && !currentTransition(t).ae.has(e)) {
            // Drop the stale stamp too: the plain settle write (setSignal) and the
            // stash-path restamp both re-enter the transaction through it.
            e.me = null;
            return;
        }
        globalQueue.initTransition(t);
        enterWaiting(e);
    };
    const handleError = n => {
        if (e.o?.pe !== t) return;
        // NotReadyError from rejected promises should be treated as pending, not error
                let r = n instanceof NotReadyError;
        if (r && e.ye) {
            // Loading window: the flight died waiting on an unready source. Keep
            // serving commit #0 — same parking as recompute's catch for sync
            // dependency throws. The dead flight is released so the clock-gated
            // error-retry pull (updateIfNecessary) can also re-ask.
            if (e.o !== null) e.o.pe = null;
            parkLoadingWindow(e, n);
            e.Ge = clock;
            return;
        }
        settleTransition();
        notifyStatus(e, r ? STATUS_PENDING : STATUS_ERROR, n);
        // A NotReady rejection is a landing into another pending source. The
        // rejected flight will never settle its self entry, so transfer ownership
        // after notifyStatus has propagated the replacement source.
                if (r) settlePendingSource(e);
        e.Ge = clock;
        // A real error settles derivatively-pending dependents (notifyStatus
        // cleared their pending sources), so stranded lazy ones release here —
        // the error twin of settlePendingSource's release (#2934).
                if (!r) releaseSettledDependents(e);
    };
    const asyncWrite = (r, o) => {
        if (e.o?.pe !== t) return;
        // If the node was dirtied by a newer write (optimistic override or regular),
        // skip this stale async result — the upcoming flush will recompute the node
        // with the new value, creating a fresh Promise that supersedes this one.
                if (e.oe & (REACTIVE_DIRTY | REACTIVE_OPTIMISTIC_DIRTY)) return;
        // The landing propagates under the flight's provenance (#3331) — through
        // the flush below, which clears it.
                setOrigin(i);
        settleTransition();
        const s = !!(e.S & STATUS_UNINITIALIZED);
        // Captured before clearStatus wipes it: a quiet re-ask's landing may be
        // transition-held below, and the displayed value keeps answering the same
        // question until the hold commits — the classification must survive to
        // that reveal or companion synchronization briefly classifies the held
        // old value as pending, a one-frame pulse to direct observers (#3178).
        // A truthy capture implies `_x` exists, so the restore writes it directly.
                const u = e.o?.ve;
        landStatus(e);
        if (u) e.o.ve = true;
        const l = resolveLane(e);
        if (l) l.ke.delete(e);
        // Attribution hook: lets the engine snapshot state before the landing
        // branches, so it can tell whether the plain path's setSignal committed a
        // change (and only then classify it as an async landing).
                if (attrHooks !== null) attrHooks.asyncStart(e);
        if (n) {
            try {
                n(r);
            } catch (e) {
                handleError(e);
                return;
            }
            if (s) landStatus(e, true);
        } else if (e.o?.we !== undefined && !(l && e.C & CONFIG_DERIVED_OVERRIDE)) {
            // A derived override's landing UNDER its lane is the lane's own work
            // (the branch below); demoted — its source superseded (A18) — the
            // landing is the truth the correction asked for, and holds and
            // supersedes here like the sync twin (recompute). Otherwise:
            // Optimistic node — resting OR covered by an active override — holds
            // through the shared pending-node path, exactly like a plain async memo,
            // so the commit clears STATUS_UNINITIALIZED (#2806) and elevation to
            // _value happens on this value's OWN transition schedule (A18 as
            // re-ruled 2026-07-07: _value only changes at commit points). With an
            // override active the hold and its eventual commit are unobservable
            // (A17 — every reader sees the override); the revert reveals whatever
            // has committed by then, so corrections reveal atomically with their
            // transition rather than escaping it.
            if (e._e === NOT_PENDING) queuePendingNode(e);
            e._e = r;
            // The hold is a companion-visible write like any other (A13/A19): the
            // clearStatus() above computed its verdict before the hold existed, so
            // isPending must re-derive (the value is not final until commit — V1)
            // and latest() must see the fresh in-flight value (V2). Subscribers are
            // only notified when the hold is visible to them: under an active
            // override every reader sees the override (A17), so waking subs would
            // re-show an unchanged view — the revert is the notification point.
            // Under an override the landing is handed to the engine's
            // supersedeOverride (A18 supersession, #3331): own-source truth that
            // differs from the override ends the optimism for the graph now (plain
            // channel, lane demoted); a matching arrival is silent except to an
            // authoritative-view reader (until()'s predicate) waiting on exactly
            // this staged truth (#3164 — without the wake the hold deadlocks: the
            // landing waits on the transaction, the transaction on the action, the
            // action on an until() never re-notified). The hook is installed with
            // the engine, which an active override implies. The propagation runs
            // under this flight's provenance (setOrigin above).
                        GlobalQueue.Le?.(e, r);
            if (!hasActiveOverride(e)) {
                if (attrHooks !== null) attrHooks.asyncEnd(e, undefined, r, true);
                insertSubs(e);
            } else GlobalQueue.Qe(e, r);
            e.Ge = clock;
        } else if (l) {
            // Route through lane's effect queue for independent flushing
            const t = e.He;
            const n = hasActiveOverride(e) ? unwrapOverride(e.o.we) : e.ce;
            const o = e.Fe;
            try {
                // `(prev, next)`, as every other commit path calls the comparator — a
                // user comparator keyed on which side is incoming (dynamic's binding
                // gate) reads the lane landing the same way it reads a sync commit.
                if (!t && s || !o || !o(n, r)) {
                    // Lanes stage (#3479): a memo's landing under its lane is a derived
                    // override, as its sync pass's result is (recompute) — `_value`
                    // stays the committed truth for readers off the lane.
                    if (t) e.ce = r; else GlobalQueue.je(e, r, l);
                    e.Ge = clock;
                    // The latest() shadow write gives latest() effects independent lanes; the
                    // _pendingSignal update is a no-op repeat of the clearStatus() call above
                    // (computePendingState doesn't read _value).
                                        GlobalQueue.Le?.(e, r);
                    insertSubs(e, true);
                }
            } catch (t) {
                // A user comparator throwing during async resolution has no caller to
                // surface to (we're in promise machinery) — route it through the node's
                // error status so boundaries contain it instead of an unhandled
                // rejection (#2837).
                notifyStatus(e, STATUS_ERROR, t);
            }
            // Attribution hook — unconditional, and OUTSIDE the try: rollup's
            // tryCatchDeoptimization retains anything referenced inside a try even
            // behind a folded false guard, so even a dev-only flag smuggled out of
            // the commit branch leaves prod residue (#2883). The engine instead
            // detects whether this landing committed by comparing the node against
            // its asyncStart snapshot (see attribution.ts).
                        if (attrHooks !== null) attrHooks.asyncEnd(e, n, r, true);
        } else {
            try {
                setSignal(e, () => r);
            } catch (t) {
                // Same containment as above: setSignal's comparator throw is the only
                // pre-commit failure here, and there is no user callsite to throw to.
                notifyStatus(e, STATUS_ERROR, t);
            }
            // Attribution hook: this path landed through setSignal, whose write
            // hook already saw any committed change — direct=false lets the engine
            // reclassify that write as an async landing iff it actually committed.
            // Outside the try (#2883 — see attribution-hooks.ts).
                        if (attrHooks !== null) attrHooks.asyncEnd(e, undefined, r, false);
        }
        // First real answer landing: the window closes when the answer becomes
        // OBSERVABLE. A direct commit is observable now; a transition-held write
        // (`_pendingValue` set above or inside setSignal) is not — the verdict's
        // held-value branch is window-gated, and commitPendingNode closes the
        // window when the hold commits, so no one-frame isPending pulse can leak
        // to live observers between the landing and its commit (#2990). The
        // quiet re-ask classification follows the same schedule (#3178).
                if (e._e === NOT_PENDING) {
            e.ye = false;
            if (u) e.o.ve = false;
            // The landing published: the dependency tail the flight's pass left
            // linked goes now (A30, #3410). A transition-held landing has not
            // replaced the committed frame — the committed value still derives
            // from the previous pass's inputs, and a mainline write to one of them
            // must reach this node and join its hold (its stamp) instead of
            // publishing beside the stale derivation (#3461: `b() ? b() : a()`
            // held on `b` dropped `a` at its landing, and `A: 1` then committed
            // beside `Selected: 0`). `commitPendingNode` trims a held landing.
                        trimStaleDeps(e);
        }
        settlePendingSource(e);
        schedule();
        flush();
        o?.();
    };
    // A pending node's in-flight promise is an observer: `unlinkSubs` skips
    // autodispose while STATUS_PENDING so subscriber churn can't orphan the
    // work (a lazy async memo would otherwise tear down and re-execute — one
    // fetch per suspended re-read). Settling is that observer's release, so
    // it runs the same last-one-out check the other release sites run.
    // Returns whether the node released, so the iterator branch can stop
    // pulling values instead of pumping an unobserved stream forever (#2935).
        const settleAutodispose = () => {
        if (e.C & CONFIG_AUTO_DISPOSE && !e.u && !(e.S & STATUS_PENDING)) {
            unobserved(e);
            return true;
        }
        return false;
    };
    // Consumes an AsyncIterable as this flight's value stream. Two postures:
    // LIVE (called synchronously from this read — the compute returned an
    // iterable directly, or a sync-settled thenable held one), where the
    // initial drain may stash a sync first yield for the caller to return and
    // close registration uses the ambient owner; and DEFERRED (the flattening
    // path — a thenable resolved to an iterable in a later microtask), where
    // there is no caller to serve and no ambient owner: sync-settled steps
    // write through asyncWrite, and close registration goes through the slot
    // the thenable branch pre-registered while it still owned the context.
    // Returns whether a sync answer landed (first yield or empty completion) —
    // meaningful only in the live posture.
        const consumeIterator = (n, r) => {
        const o = n[Symbol.asyncIterator]();
        let i = false;
        let u = false;
        let l = !r;
        const close = () => {
            if (u) return;
            u = true;
            try {
                const e = o.return?.();
                if (isThenable(e)) e.then(undefined, () => {});
            } catch {}
        };
        r ? r(close) : cleanup(close);
        // Flight-identity cancellation (#3122): the registration above is the
        // owner-death backstop, but its disposal list can be zombie-deferred
        // until the SUPERSEDING flight settles. The teardown slot fires at the
        // _inFlight release sites so supersede stops this stream immediately.
                ext(e).be = close;
        // Release check before each next pull: an unobserved lazy node must tear
        // down (its close above runs via disposal, closing the iterator) instead
        // of pumping the stream forever with zero subscribers (#2935).
                const iterateOrRelease = () => {
            if (!settleAutodispose()) iterate();
        };
        const iterate = () => {
            let n, r, f = false, a = false, c = true;
            // Protocol tolerance, matching `for await`: `await` unwraps whatever
            // next() returns — a thenable OR a bare IteratorResult. Real producers
            // use the bare form as a promise-free fast path when a value is already
            // buffered (seroval's deserialized streams do), so a bare result is
            // assimilated as an already-settled step instead of crashing on `.then`.
                        const S = o.next();
            const d = isThenable(S) ? S : {
                then: e => void e(S)
            };
            d.then(r => {
                // The sync stash only serves the INITIAL drain (handleAsync's caller
                // consumes syncValue / throws NotReady from it). A sync-settled step
                // after an async gap — seroval buffering values between pulls, a
                // sync-thenable producer mid-stream — has no caller reading the
                // stash: it must write through the async path or the value is
                // silently dropped. (The deferred posture never has a caller, so
                // initialRead starts false there and everything writes through.)
                if (c && l) {
                    n = r;
                    f = true;
                    if (r.done) u = true;
                } else if (e.o?.pe !== t) {
                    return;
                } else if (!r.done) {
                    i = true;
                    asyncWrite(r.value, iterateOrRelease);
                } else {
                    u = true;
                    if (i) {
                        schedule();
                        flush();
                    } else {
                        // Empty completion settles like the immediately-done sync path.
                        asyncWrite(undefined);
                    }
                    settleAutodispose();
                }
            }, n => {
                if (c && l) {
                    r = n;
                    a = true;
                } else if (e.o?.pe === t) {
                    u = true;
                    handleError(n);
                    settleAutodispose();
                }
            });
            c = false;
            if (a) {
                // Match the promise branch, but only rethrow during the initial read.
                u = true;
                handleError(r);
                if (l) throw r;
                return true;
            }
            if (f && !n.done) {
                s = n.value;
                i = true;
                return iterate();
            }
            return f && n.done;
        };
        const f = iterate();
        // Later iterate() calls run from asyncWrite, where rethrowing would be unhandled.
                l = false;
        return i || f;
    };
    // Landed-synchronously verdict for a LIVE iterator drain; null when no live
    // drain ran (plain promise flight, or a deferred flatten). Drives the
    // shared NotReady/loading tail below.
        let u = null;
    // Flatten one async level: a thenable that RESOLVES to an AsyncIterable —
    // the shape every async stub returning a stream produces — consumes as the
    // stream itself rather than settling on the iterable object. One level
    // only: A+ `then` already collapses nested thenables, so the resolved
    // value is never itself a thenable.
        const flattenIfIterable = (e, t) => {
        let n = false;
        if (typeof e === "object" && e !== null) {
            untrack(() => {
                n = e[Symbol.asyncIterator];
            });
        }
        if (!n) return false;
        const r = consumeIterator(e, t);
        if (!t) u = r;
        return true;
    };
    if (o) {
        let n = false, r = false, o, i = true;
        // Close registration for the flattening path. Consumption starts in a
        // microtask where the ambient owner is gone (or worse, someone else's),
        // so `cleanup()` can't be used — the close targets el's disposal list
        // directly, exactly where a live cleanup() during this recompute would
        // have put it. Deliberately NOT pre-registered at flight start: a
        // non-null `_disposal` reclassifies the node into recompute's deferred
        // (zombie) disposal path, and plain promise flights — the overwhelming
        // majority — must not pay that. Only a flight that actually flattens
        // becomes disposal-bearing, which is exactly the class a directly
        // returned iterable already occupies.
                const registerDeferredClose = t => {
            if (!e.Ve) e.Ve = t; else if (Array.isArray(e.Ve)) e.Ve.push(t); else e.Ve = [ e.Ve, t ];
        };
        t.then(r => {
            if (i) {
                s = r;
                n = true;
            } else if (e.o?.pe === t && !(e.oe & REACTIVE_DISPOSED) && flattenIfIterable(r, registerDeferredClose)) ; else {
                asyncWrite(r);
                settleAutodispose();
            }
        }, e => {
            if (i) {
                o = e;
                r = true;
            } else {
                handleError(e);
                settleAutodispose();
            }
        });
        i = false;
        if (r) {
            // Settle through the same status path an async rejection uses, then
            // unwind the in-progress synchronous read so the errored node isn't
            // momentarily read as `undefined`.
            handleError(o);
            throw o;
        } else if (!n) {
            // Loading window: serve commit #0 instead of suspending. No transition
            // is opened — first-flight work on a loadingValue node is loading-class
            // (invisible to boundaries and transitions); the flight itself is
            // already registered in _inFlight and lands through asyncWrite.
            if (e.ye) return e.ce;
            globalQueue.initTransition(resolveTransition(e));
            throw new NotReadyError(context);
        } else if (!flattenIfIterable(s)) {
            // Synchronously-resolved promise: the first real answer landed.
            e.ye = false;
        }
        // A sync-resolved promise holding an AsyncIterable flattened LIVE (we
        // are still inside the synchronous read): full initial-drain semantics
        // apply and the shared tail below settles the verdict.
        }
    if (r) flattenIfIterable(t);
    if (u !== null) {
        if (!u) {
            // Loading window: serve commit #0 (see the promise branch above).
            if (e.ye) return e.ce;
            globalQueue.initTransition(resolveTransition(e));
            throw new NotReadyError(context);
        }
        // A sync first yield (or immediate empty completion) is the first real
        // answer; async yields clear inside asyncWrite.
                e.ye = false;
    }
    return s;
}

function clearStatus(e, t = false) {
    if (e.o?.ue) clearPendingSources(e);
    if (e.o?.Oe) if (e.o !== null) e.o.Oe = false;
    // The pending window is over; its quiet classification dies with it.
    // (Unconditional: _reask is baked into the node literals, so this is a
    // plain store to an existing slot — no shape change.)
        if (e.o !== null) e.o.ve = false;
    e.S = t ? 0 : e.S & STATUS_UNINITIALIZED;
    if (e.o?._) setPendingError(e);
    // Update pending signal for isPending() reactivity (companions only exist
    // once the verdict layer created them, which installs the hooks).
        if (e.o?.xe || e.o?.Me) GlobalQueue.Ue(e);
    if (e.o?.i && e.C & CONFIG_CHILD_COMPANIONS && GlobalQueue.qe !== null) GlobalQueue.qe(e);
    const n = statusNotifierOf(e);
    if (n) n.call(e);
}

/**
 * Status clear for a flight LANDING (asyncWrite). A landing answers the
 * node's OWN question — it retires the node's self entry, not the pending
 * state its sources propagated onto it. An input re-asked while this flight
 * was up (a second write to the signal feeding `a` while `b`'s first flight
 * is in the air, #3373) marks `b` pending on `a` by propagation, with `b`'s
 * flight still current: nothing superseded it (the re-ask only changed `a`'s
 * status, not yet its value), so the landing arrives, and a full clear made
 * `b` answer with the stale value — the transaction's reporter for `a` found
 * nothing pending below it and committed the newer signal beside the older
 * derived value (`2 / 1`); `isPending(b)` read false for the gap (#3376).
 * With another source still pending the node stays derivatively pending on
 * it; the landed value is written below (the staged answer is still the
 * answer for the inputs it was asked with) and the input's own settle
 * releases it, or its value change recomputes the node into a fresh flight.
 * `_blocked` clears like a full clear: a landing that passed the `_inFlight`
 * guard was not superseded by a re-run (recompute nulls `_inFlight` first),
 * so the flag is the flight's own registration throw — the input settling
 * unchanged must not re-run the node (an extra flight for the same inputs).
 * The node is already STATUS_PENDING in that branch (only notifyStatus fills
 * the set, with status; a loading-window park cannot coexist with a live
 * flight since registration drops the set), so the flags only change when
 * the first landing retires UNINITIALIZED. `_error` must move off self: a
 * reader thrown NotReady(self) would park on a retired entry. Companions
 * keep their verdict (pending before and after; the write re-syncs them).
 */ function landStatus(e, t = false) {
    const n = e.o?.ue;
    // (The full clear below drops the set whether or not self was retired first.)
        if (n && (n.delete(e), n.size)) {
        e.o.Oe = false;
        if (t) e.S = STATUS_PENDING;
        setPendingError(e, n.values().next().value);
    } else clearStatus(e, t);
}

function notifyStatus(e, t, n, r, o) {
    // Wrap regular errors to track source node
    if (t === STATUS_ERROR && !(n instanceof StatusError) && !(n instanceof NotReadyError)) n = new StatusError(e, n);
    const i = t === STATUS_PENDING && n instanceof NotReadyError ? n.source : undefined;
    const s = i === e;
    // An optimistic node (a WRITTEN override slot) pending derivatively is a
    // boundary: its override is the answer, pending stops here (A17). A
    // derived override (#3479) is a previous speculative answer on a plain
    // member — pending flows through it as through any memo.
        const u = t === STATUS_PENDING && e.o?.we !== undefined && !(e.C & CONFIG_DERIVED_OVERRIDE) && !s;
    const l = u && hasActiveOverride(e);
    if (!r) {
        // Lane before companions: the companion pokes below may create the
        // node's pending-signal lane, whose parent is read from the node's lane
        // at creation. Assigned after them (as it was), a node made pending by
        // propagation before it rode the lane got a parentless companion lane,
        // and the isPending reader that also depends on the node merged it into
        // the held lane — the verdict then waited on the async it reports (#3379).
        if (o) assignOrMergeLane(e, o);
        if (t === STATUS_PENDING && i) {
            addPendingSource(e, i);
            // A fresh flight from a settled state starts with its inputs unpublished
            // (a replacement flight while still pending keeps the mark: the first
            // flight's committed inputs are still the frame).
                        if (!(e.S & STATUS_PENDING)) e.C &= ~CONFIG_INPUTS_PUBLISHED;
            e.S = STATUS_PENDING | e.S & STATUS_UNINITIALIZED;
            // Preserve the current source on this propagation so render-effect notification
            // can register every distinct pending source with the transition.
                        setPendingError(e, i, n);
        } else {
            clearPendingSources(e);
            e.S = t | (t !== STATUS_ERROR ? e.S & STATUS_UNINITIALIZED : 0);
            ext(e)._ = n;
        }
        GlobalQueue.Ue?.(e);
        if (e.o?.i && e.C & CONFIG_CHILD_COMPANIONS && GlobalQueue.qe !== null) GlobalQueue.qe(e);
    }
    const f = r || l;
    const a = r || u ? undefined : o;
    const c = statusNotifierOf(e);
    if (c) {
        if (r && t === STATUS_PENDING) {
            return;
        }
        if (f) {
            c.call(e, t, n);
        } else {
            c.call(e);
        }
        return;
    }
    forEachDependent(e, (e, r) => {
        e.Ge = clock;
        // A pending mark on a kept-tail link re-derives the subscriber instead of
        // marking it (A30, #3494 review; fuzzer latest-1 #2141; #3519 review).
        // Past `_depsTail` lie the committed frame's deps, kept by A30 because
        // that frame still derives from them while the pass that dropped them is
        // held (staged, or unchanged and parked). A source going pending there is
        // a question for the node's NEXT pass, not a fact about its current one:
        // marked, the node was registered as the flight's reporter and its holder
        // entangled with the flight (the A15 arm below) on a dep the held frame
        // never reads — an orphaned fetch held the truth (a hide joined to a
        // parked action, A34), and a manual flight nobody awaited held a gated
        // reader hidden forever (fuzzer branches-1 #1105). Skipped, the committed
        // frame published stale beside its new inputs (`query=1` beside a
        // `selected` derived from `remote(0)`). Re-derived, the pass decides: it
        // reads the dep and registers through its own read, or reads a held input
        // and enters that transaction (A29), or reads neither and is done. Clears
        // and errors still ride every link. A link inside the prefix carries the
        // pass's generation (`link()`), so the test is O(1); mid-pass the prefix
        // is what the pass has read so far, and the heap refuses a recomputing
        // node — a dep it has yet to reach registers through its own read.
                if (t === STATUS_PENDING && r.Ze !== e.We) {
            enqueueSub(e);
            schedule();
            return;
        }
        if (t === STATUS_PENDING && i && !e.o?.ue?.has(i) || t !== STATUS_PENDING && (e.o?._ !== n || e.o?.ue)) {
            // A pending-observer link is the subscription an `isPending` read created.
            // It exists so the observer re-runs when the source settles, but it must
            // not carry a real (non-NotReadyError) error — the synchronous `isPending`
            // read swallows those, and the async path must match. Re-run the observer
            // so `isPending` re-evaluates (to not-pending) instead of forwarding.
            if (r.Be && t !== STATUS_PENDING && !(n instanceof NotReadyError)) {
                enqueueSub(e);
                schedule();
                return;
            }
            // A memo another live transaction HOLDS — pending on its work, or
            // staged by it — made pending by THIS flight cannot reveal before the
            // flight lands: the two settle as one unit (A15, a shared derivation of
            // both — #3443). Propagation marks the held memo without recomputing it
            // (its inputs' values are unchanged), so this is the one moment the
            // entanglement is known; the memo's stamped re-entry at its next pass
            // came too late — the holder's own flight landed first and revealed the
            // inputs beside the stale sum. The stamp alone decides nothing (#3334):
            // a node the transaction once queued but holds nothing of — a switch's
            // shared output whose first flight the second write superseded — must
            // not drag the older flight into the newer reveal. Effects entangle
            // nothing (A15 shared-hole corollary): their reader registers with the
            // flight's transaction at queue notification.
                        if (!f) e.me ? i && !e.He && (e.S & STATUS_PENDING || e._e !== NOT_PENDING) && globalQueue.initTransition(e.me) : queuePendingNode(e);
            notifyStatus(e, t, n, f, a);
        }
    });
}

export { addPendingSource, clearStatus, forEachDependent, handleAsync, isThenable, notifyStatus, parkLoadingWindow, releaseFlightTeardown, releaseSettledDependents, setPendingError, settleErroredDependents, settlePendingSource };