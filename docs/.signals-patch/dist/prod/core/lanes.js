import { CONFIG_DERIVED_OVERRIDE, CONFIG_HAS_LANE, REACTIVE_DISPOSED } from "./constants.js";

import { hasActiveOverride, ext, ownsHold, currentOptimisticLane } from "./core.js";

import { enqueueSub } from "./heap.js";

import { currentTransition, activeTransition, waitingTransition } from "./scheduler.js";

// Map from optimistic signal to its lane (reused for multiple writes to same signal)
const signalLanes = new WeakMap;

// All active lanes (for cleanup on transition completion)
const activeLanes = new Set;

/**
 * Get an existing lane for a signal or create a new one.
 * Reuses lane for multiple writes to the same signal.
 */ function getOrCreateLane(n) {
    let e = signalLanes.get(n);
    if (e) {
        return findLane(e);
    }
    // Detect parent lane: _parentSource chains from pendingSignal → pendingValueComputed → original.
    // The child lane should not merge with the parent lane.
        const i = n.o?.kn;
    const t = i?.o?.me;
    const r = t ? findLane(t) : null;
    e = {
        ni: n,
        Qe: new Set,
        dn: [ [], [] ],
        ei: null,
        we: activeTransition,
        ii: r
    };
    signalLanes.set(n, e);
    activeLanes.add(e);
    // A companion may have written before the owner's first optimistic write
    // (affects() as an action's first statement pokes the verdict companion of a
    // still lane-less node, #2887), leaving its lane parentless. Adopt it now:
    // parent-child is a property of the nodes, not of write order — otherwise
    // the owner's write merges the companion's subscribers into this lane and
    // their effects wait on its async instead of flushing immediately.
        adoptCompanionLane(n.o?.Ze, e);
    adoptCompanionLane(n.o?.He, e);
    return e;
}

function adoptCompanionLane(n, e) {
    if (!n) return;
    const i = signalLanes.get(n);
    if (!i) return;
    const t = findLane(i);
    // Only the companion's own unmerged root is safely re-parentable: a root
    // that absorbed other lanes carries work that is not a child of this owner.
        if (t !== e && t.ni === n && !t.ii) t.ii = e;
}

/**
 * Union-find: find the root lane.
 */ function findLane(n) {
    while (n.ei) n = n.ei;
    return n;
}

/**
 * Is the lane held? `_pendingAsync` records the async the lane OWNS (derived
 * under it); a transaction's reporter map records the async a render effect
 * OBSERVED pending with no boundary taking it (INV-3, the one registration
 * site). A hold needs both — the same rule the transaction itself uses, so a
 * memo nobody renders, or one a fallback-showing boundary caught, cannot tear
 * a frame and holds nothing (#3289). An orphan lane has no observation record
 * and never holds.
 *
 * The observation is looked up per NODE, in whichever live transaction
 * recorded it — not in this lane's transaction. Lanes merge across
 * transactions (#2912: ownership never travels through lanes), so after a
 * merge the root's transaction holds the observations of only one member;
 * the async the other member's transaction observed must hold the merged
 * reveal just the same (A15 for lanes, #3335).
 */ function laneHeld(n) {
    if (!n.we) return false;
    for (const e of n.Qe) if (waitingTransition(e) !== null) return true;
    return false;
}

/**
 * Lanes mirror transitions (#3460): a render effect OFF a HELD lane that reads
 * a value the lane is revealing — an override, a `latest()` shadow — sees the
 * committed value, exactly as a stale reader of a held transaction does
 * (A15 reveal corollary): it publishes now, with the frame that is on screen
 * (the lane defers its own readers' runs, so the committed value is what is
 * visible), entangles nothing — a sync write is never held by a lane — and
 * re-derives at the release. The release re-run rides the lane's own render
 * queue, which runs when the lane reveals (runLaneEffects) or its transaction
 * commits (cleanupCompletedLanes). A reader ON the lane computes the lane's
 * reveal and takes the value as before.
 *
 * OFF the lane is provenance, not membership — the transaction mirror
 * exactly: a stale reader of a transaction is a pass that runs outside it. A
 * pass under the lane's own transaction is the lane's work — its write (lane
 * posture), or the landing of its async, which re-enters the transaction
 * (#3334) and runs a member with no ambient lane. Read as an outsider, that
 * pass published the committed view and queued a replay that revealed the
 * override beside its unready derivation at the release (`1:0` for an
 * optimistic frame that never became ready; #3479 review). Membership is the
 * wrong test the other way: a member re-run by a sibling's sync write is a
 * mainline pass and shows the committed view.
 */ function readsHeldCommitted(n, e) {
    const i = resolveLane(n);
    if (!i || !laneHeld(i)) return false;
    if (ownsLane(i, n)) return false;
    i.dn[0].push(() => e.oe & REACTIVE_DISPOSED || enqueueSub(e));
    return true;
}

/** The ownership relation for a lane hold (core `ownsHold`, §6 ruling 2): the
 * running pass owns `lane`'s hold if it runs under the transition that owns
 * the lane (the node's, resolved through override ownership and merges) or
 * inside the lane itself. */ function ownsLane(n, e) {
    if (activeTransition !== null) {
        const n = resolveTransition(e);
        if (n && ownsHold(n)) return true;
    }
    return currentOptimisticLane !== null && findLane(currentOptimisticLane) === n;
}

/**
 * Merge two lanes when their dependency graphs overlap.
 */ function mergeLanes(n, e) {
    n = findLane(n);
    e = findLane(e);
    if (n === e) return n;
    e.ei = n;
    // Move (not copy) the merged lane's work: after the merge all routing goes
    // through findLane() to the root, so anything left behind here is dead —
    // and anything *added* here later is a routing bug (INV-5).
        for (const i of e.Qe) n.Qe.add(i);
    e.Qe.clear();
    n.dn[0].push(...e.dn[0]);
    n.dn[1].push(...e.dn[1]);
    e.dn[0].length = 0;
    e.dn[1].length = 0;
    return n;
}

/**
 * Resolve a node's lane: follow union-find chain, verify active, clear if stale.
 */ function resolveLane(n) {
    const e = n.o?.me;
    if (!e) return undefined;
    const i = findLane(e);
    if (activeLanes.has(i)) return i;
    if (n.o !== null) n.o.me = undefined;
    return undefined;
}

function resolveTransition(n) {
    // An active override answers with its owner, not its lane: lanes are
    // scheduling affinity and a shared subscriber merges them across
    // transactions (#2912) — the merged root's _transition would hand this
    // node's override to whichever action wrote last through the shared
    // reader. Chase merge chains; a dead owner settled through another path.
    if (hasActiveOverride(n) && n.o?.Ln) {
        const e = ext(n).Ln = currentTransition(n.o?.Ln);
        if (e.Rn !== true) return e;
        if (n.o !== null) n.o.Ln = null;
    }
    return resolveLane(n)?.we ?? n.we;
}

/**
 * Assign or merge a lane onto a node. At convergence points (node already has
 * a different active lane), merge unless the node has an active override.
 */ function assignOrMergeLane(n, e) {
    const i = findLane(e);
    const t = n.o?.me;
    if (t) {
        // A merged lane is followed to its root like any other: the root is where
        // the subscriber's affinity lives now. Replacing it with the source lane
        // outright (as this once did) skipped the parent/child check below — an
        // isPending reader of two async siblings had their two companion lanes
        // merge, and the next parent-lane notification then moved it onto the
        // held parent, where its verdict waited on the async it reports (#3409).
        const r = findLane(t);
        if (activeLanes.has(r)) {
            // A WRITTEN override is its own lane's source and merges nothing
            // through it; a derived one (lanes stage, #3479) is a plain member —
            // the shared reader that merges two writers' lanes carries one.
            if (r !== i && (!hasActiveOverride(n) || n.C & CONFIG_DERIVED_OVERRIDE)) {
                // Parent-child lanes stay independent so isPending resolves without
                // waiting for the parent's async. The child keeps ownership.
                if (i.ii && findLane(i.ii) === r) {
                    ext(n).me = e;
                    n.C |= CONFIG_HAS_LANE;
                } else if (r.ii && findLane(r.ii) === i) ; else mergeLanes(i, r);
            }
            return;
        }
    }
    ext(n).me = e;
    n.C |= CONFIG_HAS_LANE;
}

export { activeLanes, assignOrMergeLane, findLane, getOrCreateLane, hasActiveOverride, laneHeld, mergeLanes, ownsLane, readsHeldCommitted, resolveLane, resolveTransition, signalLanes };