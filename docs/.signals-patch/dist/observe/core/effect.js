import { REACTIVE_DISPOSED, LANE_RUN, STATUS_ERROR, EFFECT_USER, NOT_PENDING, CONFIG_AUTO_DISPOSE, CONFIG_CHILDREN_FORBIDDEN, EFFECT_TRACKED, EFFECT_RENDER, STATUS_PENDING } from "./constants.js";

import { setEffectStatusNotify, ext, createEffectNode, recompute, computed, staleValues } from "./core.js";

import { attrHooks } from "./attribution-hooks.js";

import "./dev.js";

import { unwrapStatusError, StatusError } from "./error.js";

import { trimStaleDeps } from "./graph.js";

import { enqueueSub } from "./heap.js";

import { GlobalQueue, currentTransition, activeTransition, haltReactivity, schedule } from "./scheduler.js";

/**
 * Effects are the leaf nodes of our reactive graph. When their sources change, they are
 * automatically added to the queue of effects to re-execute, which will cause them to fetch their
 * sources and recompute
 */ function effect(t, e, r, E) {
    const i = !!E?.user;
    const n = createEffectNode(t, e, r, i ? EFFECT_USER : EFFECT_RENDER, E);
    recompute(n, true);
    // A first pass that derived from a live transaction's staged world was
    // staged into that transaction (recompute: born held); the transaction's
    // commit replays this effect. Its first run is not this creation's (A29).
        !E?.defer && n._e === NOT_PENDING && (n.He === EFFECT_USER || E?.schedule ? n.T.enqueue(n.He, runEffect.bind(null, n)) : runEffect(n, LANE_RUN));
}

function notifyEffectStatus(t, e) {
    // Use passed values if provided, otherwise read from node
    const r = t !== undefined ? t : this.S;
    const E = e !== undefined ? e : this.o?._;
    if (r & STATUS_ERROR) {
        this.T.notify(this, STATUS_PENDING, 0);
        if (this.He === EFFECT_USER) {
            // The error handler is the error arm of the effect phase (#2840 ruling):
            // queue it like the effect function. It runs in the same imperative,
            // writable scope, throws escalate the same way, and a held transition
            // (or optimistic lane) defers it exactly as it defers the success arm.
            // No payload is queued — the node already carries `_statusFlags`/`_error`,
            // and the runner dispatches on them, so a recovery before the effect
            // phase takes the success arm instead. Blocked forwards (explicit
            // `status` arg without node-state writes) don't queue: the status
            // re-propagates unblocked at commit.
            if (this.S & STATUS_ERROR) {
                this.it = true;
                this.T.enqueue(this.He, this.Ct ??= runEffect.bind(null, this));
            }
            return;
        }
        if (!this.T.notify(this, STATUS_ERROR, STATUS_ERROR)) {
            haltReactivity(unwrapStatusError(E));
            throw E;
        }
    } else if (this.He === EFFECT_RENDER) {
        this.T.notify(this, STATUS_PENDING | STATUS_ERROR, r, E);
    }
}

function runEffect(t, e) {
    if (!t.it || t.oe & REACTIVE_DISPOSED) return;
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
        if (t.Gt !== null && !currentTransition(t.Gt).Dt && (e & LANE_RUN ? !t.o?.Ce : activeTransition !== null)) {
        t.T.enqueue(t.He, t.Ct);
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
        if (t.S & STATUS_ERROR && t.He === EFFECT_USER) {
        const e = unwrapStatusError(t.o?._);
        t.Mt = t.ce;
        t.it = false;
        try {
            t.Wt ? t.Wt(e, () => {
                const e = t.qt;
                t.qt = undefined;
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
        const r = t.o?._ == null;
    // Observe tier, like its `effectRunEnd` twin below: the frame the engine
    // opens here is what stamps the callback's writes as the effect's (the
    // cascade an observer reports) and what times the callback (the `effect`
    // record) — facts a production observer needs, not only a dev console.
        if (attrHooks !== null) attrHooks.effectRunStart(t);
    const E = t.qt;
    t.qt = undefined;
    try {
        E?.();
        const e = t.wt(t.ce, t.Mt);
        if (false && e !== undefined && typeof e !== "function") ;
        // The final cleanup is invoked by disposeChildren at true disposal.
                t.qt = e;
    } catch (e) {
        ext(t)._ = new StatusError(t, e);
        t.S |= STATUS_ERROR;
        if (!t.T.notify(t, STATUS_ERROR, STATUS_ERROR)) {
            haltReactivity(e);
            throw e;
        }
    } finally {
        t.Mt = t.ce;
        t.it = false;
        // The run applied: this is the frame now, so the dependency tail the
        // compute pass left linked goes (A30, #3438 — `recompute` defers an
        // effect's trim while a run is owed; the twin of `commitPendingNode`'s
        // trim for a staged pass). An errored compute kept its full list with
        // `_depsTail` marking where it stopped; leave it, as the commit does.
                if (r) trimStaleDeps(t);
    }
    // Outside the try (see the rule in attribution-hooks.ts). Reached whether or
    // not the callback threw — a throw that escapes the catch above halts.
        if (attrHooks !== null) attrHooks.effectRunEnd(t);
}

GlobalQueue.Rt = runEffect;

/**
 * Internal tracked effect - bypasses heap, goes directly to effect queue.
 * Runs as a leaf owner: child primitives and onCleanup are forbidden (false throws).
 * Uses stale reads.
 */ function trackedEffect(t, e) {
    const run = () => {
        // `_modified` is NOT redundant with the heap: the heap dedups within a
        // pass, but a held transition's passes each enqueue `_run` into the same
        // user queue, and this gate is what collapses them into one run at commit.
        if (!r.it || r.oe & REACTIVE_DISPOSED) return;
        try {
            r.it = false;
            recompute(r);
        } finally {}
    };
    const r = computed(() => {
        const e = r.qt;
        r.qt = undefined;
        e?.();
        const E = staleValues(t);
        r.qt = E;
    }, {
        ...e,
        lazy: true
    });
    r.qt = undefined;
    r.C = r.C & ~CONFIG_AUTO_DISPOSE | CONFIG_CHILDREN_FORBIDDEN;
    r.it = true;
    r.He = EFFECT_TRACKED;
    // Observe-tier label: the computed literal defaulted its `_name` slot to
    // "computed"; relabel by kind (a store into the slot, not a new field).
        if (e?.name === undefined) r._name = "trackedEffect";
    // Status dispatch rides the SHARED notifier (statusNotifierOf keys off
    // _type): its error arm is behavior-identical to the closure that used to
    // live here, without the per-node NodeExtension allocation.
        r.lt = run;
    // The first run rides the heap like every wake (GlobalQueue._update), so a
    // tracked effect created inside a render-effect callback runs after that
    // pass's staged writes commit, not before.
        enqueueSub(r);
    schedule();
}

// Install the shared effect status notifier (statusNotifierOf serves it to
// every effect node) — module-scope: any bundle that creates effects
// evaluates this module.
setEffectStatusNotify(notifyEffectStatus);

export { effect, trackedEffect };