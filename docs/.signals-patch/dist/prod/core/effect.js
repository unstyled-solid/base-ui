import { REACTIVE_DISPOSED, LANE_RUN, STATUS_ERROR, EFFECT_USER, NOT_PENDING, CONFIG_AUTO_DISPOSE, CONFIG_CHILDREN_FORBIDDEN, EFFECT_TRACKED, EFFECT_RENDER, STATUS_PENDING } from "./constants.js";

import { setEffectStatusNotify, ext, createEffectNode, recompute, computed, staleValues } from "./core.js";

import { unwrapStatusError, StatusError } from "./error.js";

import { trimStaleDeps } from "./graph.js";

import { enqueueSub } from "./heap.js";

import { GlobalQueue, currentTransition, activeTransition, haltReactivity, schedule } from "./scheduler.js";

/**
 * Effects are the leaf nodes of our reactive graph. When their sources change, they are
 * automatically added to the queue of effects to re-execute, which will cause them to fetch their
 * sources and recompute
 */ function effect(t, e, E, r) {
    const n = !!r?.user;
    const i = createEffectNode(t, e, E, n ? EFFECT_USER : EFFECT_RENDER, r);
    recompute(i, true);
    // A first pass that derived from a live transaction's staged world was
    // staged into that transaction (recompute: born held); the transaction's
    // commit replays this effect. Its first run is not this creation's (A29).
        !r?.defer && i._e === NOT_PENDING && (i.je === EFFECT_USER || r?.schedule ? i.T.enqueue(i.je, runEffect.bind(null, i)) : runEffect(i, LANE_RUN));
}

function notifyEffectStatus(t, e) {
    // Use passed values if provided, otherwise read from node
    const E = t !== undefined ? t : this.h;
    const r = e !== undefined ? e : this.o?._;
    if (E & STATUS_ERROR) {
        this.T.notify(this, STATUS_PENDING, 0);
        if (this.je === EFFECT_USER) {
            // The error handler is the error arm of the effect phase (#2840 ruling):
            // queue it like the effect function. It runs in the same imperative,
            // writable scope, throws escalate the same way, and a held transition
            // (or optimistic lane) defers it exactly as it defers the success arm.
            // No payload is queued — the node already carries `_statusFlags`/`_error`,
            // and the runner dispatches on them, so a recovery before the effect
            // phase takes the success arm instead. Blocked forwards (explicit
            // `status` arg without node-state writes) don't queue: the status
            // re-propagates unblocked at commit.
            if (this.h & STATUS_ERROR) {
                this.Xe = true;
                this.T.enqueue(this.je, this.An ??= runEffect.bind(null, this));
            }
            return;
        }
        if (!this.T.notify(this, STATUS_ERROR, STATUS_ERROR)) {
            haltReactivity(unwrapStatusError(r));
            throw r;
        }
    } else if (this.je === EFFECT_RENDER) {
        this.T.notify(this, STATUS_PENDING | STATUS_ERROR, E, r);
    }
}

function runEffect(t, e) {
    if (!t.Xe || t.oe & REACTIVE_DISPOSED) return;
    // Ownership (#3319): a value computed under a transaction is applied by that
    // transaction's commit. The ordinary effect phase runs with a transaction
    // active only when the flush's finalize ENTERED one (every other path parks
    // or settles first): leave a run owned by a still-held transaction queued —
    // `_modified` stays set — and the next gate stashes it with the owner.
    // Mainline-owned runs (null) apply now. Lanes are exempt by design (they
    // apply their own effects ahead of their transaction — the optimistic view)
    // and mark their runs with LANE_RUN.
    
    // Lane exemption has one exception (#3331): a lane runner for an effect that
    // no longer rides a lane — its optimistic source was superseded, so the lane
    // has no optimistic view left to apply, and the value this effect now
    // carries (or will, once its plain recompute lands) belongs to the still-held
    // transaction. Hand the run to the regular queue, where the transaction's
    // gate stashes it with the owner. Lane-less runners with no live owner
    // (reverts, wake-only lanes) apply now.
        if (t.pn !== null && !currentTransition(t.pn).Rn && (e & LANE_RUN ? !t.o?.me : activeTransition !== null)) {
        t.T.enqueue(t.je, t.An);
        return;
    }
    // Error arm (#2840), user effects only: a compute-phase error that is still
    // the node's settled state at effect time runs the bundle's error handler in
    // this same imperative, writable scope. Unwrap the StatusError used for
    // source tracking — user code gets the error it threw, as boundaries do. No
    // handler: log and keep the system alive (the run was skipped). A handler
    // (or logging) consumes the error; a handler throw falls to the shared
    // catch below and escalates boundary-or-halt like any effect-phase throw.
    // Render effects bypass: their errors route to boundaries synchronously in
    // notifyEffectStatus, and a runner queued by an earlier valueChanged in the
    // same flush must not be hijacked by a later-arriving error status.
        if (t.h & STATUS_ERROR && t.je === EFFECT_USER) {
        const e = unwrapStatusError(t.o?._);
        t.xn = t.ce;
        t.Xe = false;
        try {
            t.Mn ? t.Mn(e, () => {
                const e = t.wn;
                t.wn = undefined;
                e?.();
            }) : console.error(e);
        } catch (e) {
            if (!t.T.notify(t, STATUS_ERROR, STATUS_ERROR)) {
                haltReactivity(e);
                throw e;
            }
        }
        return;
    }
    // Captured before the callback: its own throw errors the node below, but
    // the compute pass that produced `_value` was clean, so its tail still goes.
        const E = t.o?._ == null;
    const r = t.wn;
    t.wn = undefined;
    try {
        r?.();
        const e = t.Qn(t.ce, t.xn);
        if (false && e !== undefined && typeof e !== "function") ;
        // The final cleanup is invoked by disposeChildren at true disposal.
                t.wn = e;
    } catch (e) {
        ext(t)._ = new StatusError(t, e);
        t.h |= STATUS_ERROR;
        if (!t.T.notify(t, STATUS_ERROR, STATUS_ERROR)) {
            haltReactivity(e);
            throw e;
        }
    } finally {
        t.xn = t.ce;
        t.Xe = false;
        // The run applied: this is the frame now, so the dependency tail the
        // compute pass left linked goes (A30, #3438 — `recompute` defers an
        // effect's trim while a run is owed; the twin of `commitPendingNode`'s
        // trim for a staged pass). An errored compute kept its full list with
        // `_depsTail` marking where it stopped; leave it, as the commit does.
                if (E) trimStaleDeps(t);
    }
}

GlobalQueue.Cn = runEffect;

/**
 * Internal tracked effect - bypasses heap, goes directly to effect queue.
 * Runs as a leaf owner: child primitives and onCleanup are forbidden (false throws).
 * Uses stale reads.
 */ function trackedEffect(t, e) {
    const run = () => {
        // `_modified` is NOT redundant with the heap: the heap dedups within a
        // pass, but a held transition's passes each enqueue `_run` into the same
        // user queue, and this gate is what collapses them into one run at commit.
        if (!E.Xe || E.oe & REACTIVE_DISPOSED) return;
        try {
            E.Xe = false;
            recompute(E);
        } finally {}
    };
    const E = computed(() => {
        const e = E.wn;
        E.wn = undefined;
        e?.();
        const r = staleValues(t);
        E.wn = r;
    }, {
        ...e,
        lazy: true
    });
    E.wn = undefined;
    E.C = E.C & ~CONFIG_AUTO_DISPOSE | CONFIG_CHILDREN_FORBIDDEN;
    E.Xe = true;
    E.je = EFFECT_TRACKED;
    // Status dispatch rides the SHARED notifier (statusNotifierOf keys off
    // _type): its error arm is behavior-identical to the closure that used to
    // live here, without the per-node NodeExtension allocation.
        E.$e = run;
    // The first run rides the heap like every wake (GlobalQueue._update), so a
    // tracked effect created inside a render-effect callback runs after that
    // pass's staged writes commit, not before.
        enqueueSub(E);
    schedule();
}

// Install the shared effect status notifier (statusNotifierOf serves it to
// every effect node) — module-scope: any bundle that creates effects
// evaluates this module.
setEffectStatusNotify(notifyEffectStatus);

export { effect, trackedEffect };