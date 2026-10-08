import "./core.js";

import { REACTIVE_IN_HEAP, REACTIVE_IN_HEAP_HEIGHT, REACTIVE_ZOMBIE, REACTIVE_RECOMPUTING_DEPS, REACTIVE_MANUAL_WRITE, REACTIVE_CHECK, REACTIVE_DIRTY, CONFIG_FW_CHILDREN } from "./constants.js";

import { zombieQueue, dirtyQueue } from "./scheduler.js";

/** The queue a node belongs to, picked from its own zombie flag. */ function queueFor(e) {
    return e.oe & REACTIVE_ZOMBIE ? zombieQueue : dirtyQueue;
}

/**
 * Schedule one subscriber to re-run on the next flush: inserted into its own
 * (zombie-flag-routed) heap with the `_min` cursor pulled down. Tracked
 * effects ride the heap too — the heap visit is their (empty) compute phase,
 * which hands the callback to the user queue once the pass has committed
 * (see GlobalQueue._update, #3291).
 */ function enqueueSub(e) {
    const E = queueFor(e);
    if (E.st > e.ft) E.st = e.ft;
    insertIntoHeap(e, E);
}

function actualInsertIntoHeap(e, E) {
    const t = (e._parent?.Zt ? e._parent.Yt?.ft : e._parent?.ft) ?? -1;
    if (t >= e.ft) e.ft = t + 1;
    const n = e.ft;
    const I = E.eE[n];
    if (I === undefined) E.eE[n] = e; else {
        const E = I.vt;
        E.gt = e;
        e.vt = E;
        I.vt = e;
    }
    if (n > E.EE) E.EE = n;
}

function insertIntoHeap(e, E) {
    let t = e.oe;
    // RECOMPUTING refusals are not always losses: a genuinely missed wake (a
    // write to a link this pass already validated) is latched link-side in
    // insertSubs as REACTIVE_MISSED_WAKE for recompute's tail (#3037).
        if (t & (REACTIVE_IN_HEAP | REACTIVE_RECOMPUTING_DEPS | REACTIVE_MANUAL_WRITE)) return;
    if (t & REACTIVE_CHECK) {
        e.oe = t & -4 | REACTIVE_DIRTY | REACTIVE_IN_HEAP;
    } else {
        e.oe = t | REACTIVE_IN_HEAP;
        // An unmarked node entering an already-marked heap is marked on the
        // spot, keeping the markHeap memo valid. `_marked` is only reset by
        // runHeap, so a write between two mid-tick pulls (read-time markHeap +
        // updateIfNecessary) would otherwise leave this node unmarked and every
        // downstream pull stale until the next flush (#2922: the second
        // `latest()` returned the first write's value). Invalidating the memo
        // instead re-walked the WHOLE heap on the next pull — with N effects
        // parked in the heap for a synchronous mount (each row writing a ref
        // signal its effect subscribes to), mounting N rows was O(N²) (#3350).
        // markNode's own guard skips an already-DIRTY node.
                if (E.tE) markNode(e);
    }
    if (!(t & REACTIVE_IN_HEAP_HEIGHT)) actualInsertIntoHeap(e, E);
}

function insertIntoHeapHeight(e, E) {
    let t = e.oe;
    if (t & (REACTIVE_IN_HEAP | REACTIVE_RECOMPUTING_DEPS | REACTIVE_IN_HEAP_HEIGHT | REACTIVE_MANUAL_WRITE)) return;
    e.oe = t | REACTIVE_IN_HEAP_HEIGHT;
    actualInsertIntoHeap(e, E);
}

function deleteFromHeap(e, E) {
    const t = e.oe;
    if (!(t & (REACTIVE_IN_HEAP | REACTIVE_IN_HEAP_HEIGHT))) return;
    e.oe = t & -25;
    const n = e.ft;
    if (e.vt === e) E.eE[n] = undefined; else {
        const t = e.gt;
        const I = E.eE[n];
        const o = t ?? I;
        if (e === I) E.eE[n] = t; else e.vt.gt = t;
        o.vt = e.vt;
    }
    e.vt = e;
    e.gt = undefined;
}

function markHeap(e) {
    if (e.tE) return;
    e.tE = true;
    for (let E = 0; E <= e.EE; E++) {
        for (let t = e.eE[E]; t !== undefined; t = t.gt) {
            if (t.oe & REACTIVE_IN_HEAP) markNode(t);
        }
    }
}

function markNode(e, E = REACTIVE_DIRTY) {
    const t = e.oe;
    if ((t & (REACTIVE_CHECK | REACTIVE_DIRTY)) >= E) return;
    e.oe = t & -4 | E;
    for (let E = e.u; E !== null; E = E.Pe) {
        markNode(E.Ae, REACTIVE_CHECK);
    }
    // Firewall children (projection machinery only): gate the cold-extension
    // deref on the config bit — markNode runs per sub edge per write, and an
    // unconditional _x chase here taxed every propagation (diamond -22%).
        if (e.C & CONFIG_FW_CHILDREN) {
        for (let E = e.o.i; E !== null; E = E.ge) {
            for (let e = E.u; e !== null; e = e.Pe) {
                markNode(e.Ae, REACTIVE_CHECK);
            }
        }
    }
}

function runHeap(e, E) {
    e.tE = false;
    for (e.st = 0; e.st <= e.EE; e.st++) {
        let t = e.eE[e.st];
        while (t !== undefined) {
            if (t.oe & REACTIVE_IN_HEAP) E(t); else adjustHeight(t, e);
            t = e.eE[e.st];
        }
    }
    e.EE = 0;
}

function adjustHeight(e, E) {
    deleteFromHeap(e, E);
    let t = e.ft;
    for (let E = e.Ee; E; E = E.Ie) {
        const e = E.De;
        const n = e.Ne || e;
        if (n.Se && n.ft >= t) t = n.ft + 1;
    }
    if (e.ft !== t) {
        e.ft = t;
        for (let E = e.u; E !== null; E = E.Pe) {
            // Route each subscriber by its own zombie flag, mirroring the
            // post-recompute height-adjust path. Inserting into the running `heap`
            // unconditionally can park a zombie in `dirtyQueue` (or a live node in
            // `zombieQueue`), breaking the flag/queue invariant `deleteFromHeap`
            // relies on — the same corruption class as #2759.
            insertIntoHeapHeight(E.Ae, queueFor(E.Ae));
        }
    }
}

export { deleteFromHeap, enqueueSub, insertIntoHeap, insertIntoHeapHeight, markHeap, markNode, queueFor, runHeap };