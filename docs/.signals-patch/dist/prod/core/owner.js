import { REACTIVE_DISPOSED, CONFIG_CHILD_COMPANIONS, STATUS_PENDING, CONFIG_AUTO_DISPOSE, REACTIVE_ZOMBIE, REACTIVE_IN_HEAP, REACTIVE_IN_HEAP_HEIGHT, CONFIG_TRANSPARENT, defaultContext } from "./constants.js";

import { context, runWithOwner, pendingCheckActive, latestReadActive, tracking } from "./core.js";

import { clearDeps, unobserved } from "./graph.js";

import { deleteFromHeap, queueFor, insertIntoHeap, insertIntoHeapHeight } from "./heap.js";

import { GlobalQueue, wokenTransitions, schedule, zombieQueue, dirtyQueue, globalQueue } from "./scheduler.js";

const PENDING_OWNER = {};

 // Dummy owner to trigger store's read() path
function markDisposal(e) {
    let n = e.tn;
    while (n) {
        const e = n.oe;
        n.oe = e | REACTIVE_ZOMBIE;
        // migrate height-adjust entries too, not just recompute entries: every
        // `deleteFromHeap` call site picks the queue from the zombie flag, so a
        // node left physically linked in `dirtyQueue` after being zombified gets
        // unlinked from the wrong queue on dispose, corrupting the bucket and
        // livelocking the next `runHeap` that reaches it (#2759)
                if (e & (REACTIVE_IN_HEAP | REACTIVE_IN_HEAP_HEIGHT)) {
            deleteFromHeap(n, e & REACTIVE_ZOMBIE ? zombieQueue : dirtyQueue);
            if (e & REACTIVE_IN_HEAP) insertIntoHeap(n, zombieQueue); else insertIntoHeapHeight(n, zombieQueue);
        }
        markDisposal(n);
        n = n.un;
    }
}

function dispose(e) {
    // Direct disposal is death, not dormancy: strip the observation lifecycle
    // so a later read freezes at the last committed value instead of
    // reawakening the node (#3024). The teardown itself (heap removal — a node
    // left queued would be recomputed and resurrected by the next flush (#2983)
    // — dep unlinking, child disposal) is exactly unobserved()'s body; only
    // this flag distinguishes death from dormancy.
    e.C &= ~CONFIG_AUTO_DISPOSE;
    unobserved(e);
}

function disposeChildren(e, n = false, t) {
    const i = e.oe;
    if (i & REACTIVE_DISPOSED) return;
    // A previous frame parked as zombies (#3404) dies with its owner (#3024):
    // the commit that would retire it returns on the DISPOSED flag set below,
    // so it drains here or its cleanups never run and the zombies stay
    // subscribed, to rerun in a torn-down tree (#3561). Death only (`self`):
    // a rerun's `disposeChildren(el)` leaves the frame rendering until commit.
        if (n && !t && e.o !== null && (e.o._n !== null || e.o.fn !== null)) disposeChildren(e, false, true);
    if (n) {
        e.oe = i | REACTIVE_DISPOSED;
        // Companions are created detached and outlive their owner, but a verdict
        // must not: a disposed source can never settle, so an isPending companion
        // latched `true` here would hold a spinner forever (INV-9, the PR #2845
        // edge). Snap runs after the DISPOSED flag is set so the oracle reads
        // false, and notifies subscribers still watching the companion.
                const n = e;
        if (n.o?.Ze || n.o?.He) GlobalQueue.ri(n);
        // A firewall's leaves have no lifecycle of their own, so a companion on
        // one of them outlives its source the same way (INV-9's rationale). The
        // firewall knows which leaves carry companions (CONFIG_CHILD_COMPANIONS,
        // #3038): snap them with it — the snap retires a shadow whose firewall is
        // disposed (spec O5).
                if (n.C & CONFIG_CHILD_COMPANIONS) n.o.Un.forEach(GlobalQueue.ri);
        // A pending reader parked in a transaction may be the only thing holding
        // it (#3372): its death is a completion event the transaction must be
        // re-judged for, and nothing else re-enters a parked transaction.
                const t = n.we;
        if (t && n.h & STATUS_PENDING && !wokenTransitions.includes(t)) wokenTransitions.push(t), 
        schedule();
    }
    if (n && e.he && e.o !== null) e.o.Ce = null;
    let l = t ? e.o?._n ?? null : e.tn;
    if (!t) e.tn = null;
    while (l) {
        const e = l;
        // Owner teardown is death regardless of the child's own lifecycle
        // (#3024): strip AUTO_DISPOSE so a post-disposal read freezes at the
        // last committed value instead of reawakening in a torn-down tree.
        // Runs before the recursion so already-dormant children (whose
        // disposeChildren call early-returns on REACTIVE_DISPOSED) die too.
        // Only unobserved()'s own node keeps its dormancy — it is never in
        // this loop; its children are rebuilt fresh on reawaken.
                e.C &= ~CONFIG_AUTO_DISPOSE;
        // Heap removal must not be gated on `_deps`: a dependency-free
        // computation queued by refresh() has a null dep list but still sits in
        // the dirty heap, and left there the post-disposal flush recomputes it —
        // recompute() rewriting `_flags` clears REACTIVE_DISPOSED and the node
        // comes back to life (post-unmount runs, leaked cleanups, #2983).
        // deleteFromHeap self-guards on the in-heap flags (and tolerates plain
        // Owners, whose _flags is undefined), so no gate here.
                deleteFromHeap(e, queueFor(e));
        clearDeps(e);
        // The chain is detached above so a node a cleanup links mid-drain lands
        // on the fresh head and survives. Pointing each drained child's prev at
        // itself routes its later splice onto the detached chain, never the head,
        // and keeps the dev owner-chain-head invariant honest for those children.
                l.gn = l;
        disposeChildren(l, true);
        // Read after, not before: a sibling this disposal made dormant spliced
        // itself out of the detached chain, and a cleanup may then have linked
        // it at the fresh head, which rewrote the `_nextSibling` a pre-read
        // would still be holding.
                l = l.un;
    }
    if (t) {
        if (e.o !== null) e.o._n = null;
    } else e.En = 0;
    // O(1) splice out of parent's chain on individual dispose. Skipped during
    // batch dispose (parent already disposed) and zombie disposal (node sits on
    // parent's _pendingFirstChild). We leave node._nextSibling intact so outer
    // walks that already advanced past us still reach later siblings.
        if (n && !t && !(i & REACTIVE_ZOMBIE) && e._parent !== null && !(e._parent.oe & REACTIVE_DISPOSED)) {
        const n = e.gn;
        const t = e.un;
        if (n !== null) n.un = t; else e._parent.tn = t;
        if (t !== null) t.gn = n;
        e.gn = null;
    }
    runDisposal(e, t);
    // Final effect-returned cleanup fires at true disposal, after `_disposal`
    // to mirror rerun ordering (compute-phase teardown first, cleanup last).
        if (n && e.wn) {
        const n = e.wn;
        e.wn = undefined;
        n();
    }
}

function linkChild(e, n) {
    const t = e.tn;
    n.gn = null;
    n.un = t;
    if (t !== null) t.gn = n;
    e.tn = n;
}

function runDisposal(e, n) {
    // Detach the list BEFORE running it (#3601), as `_cleanup` is (#2813). A
    // cleanup that disposes an ancestor re-enters this node through the death
    // walk while the loop is still running; with the list still attached, that
    // walk ran every entry a second time. Detached, the re-entrant drain finds
    // nothing. The same shape latched a throwing cleanup: the list survived the
    // throw and every later drain re-ran and re-threw it.
    const t = n ? e.o?.fn : e.qe;
    if (!t) return;
    if (n) e.o.fn = null; else e.qe = null;
    if (Array.isArray(t)) {
        // Unwind order (#3572, restores 1.x #1562): later registrations run
        // before earlier ones. Children have already been disposed by the caller,
        // so with LIFO a body that registers cleanup before creating its children
        // tears down after them — the same order a per-component owner gives.
        for (let e = t.length - 1; e >= 0; e--) {
            const n = t[e];
            n.call(n);
        }
    } else {
        t.call(t);
    }
}

function childId(e, n) {
    let t = e;
    while (t.C & CONFIG_TRANSPARENT && t._parent) t = t._parent;
    if (t.id != null) return formatId(t.id, n ? t.En++ : t.En);
    throw new Error("");
}

/**
 * Allocates and returns the next stable child id for `owner`. Used by
 * hydration plumbing and `createUniqueId`. Not part of the user-facing API.
 *
 * @internal
 */ function getNextChildId(e) {
    return childId(e, true);
}

/**
 * The id a freshly-created node inherits: an explicit `options.id` wins;
 * transparent nodes share their parent's id; otherwise the parent's next
 * child id is consumed (or `undefined` outside an id-carrying tree).
 */ function inheritId(e, n, t) {
    return e?.id ?? (n ? t?.id : t?.id != null ? getNextChildId(t) : undefined);
}

/**
 * Returns the *next* child id for `owner` without consuming it. Used by
 * hydration plumbing to peek at the id a future child will receive.
 *
 * @internal
 */ function peekNextChildId(e) {
    return childId(e, false);
}

function formatId(e, n) {
    const t = n.toString(36), i = t.length - 1;
    return e + (i ? String.fromCharCode(64 + i) : "") + t;
}

/**
 * Returns the currently-tracking observer (the computation that subscribes to
 * reactive reads at this point), or `null` if reads here would be untracked.
 * Used by reactive primitives that need to know whether they're inside a
 * tracking scope. App code rarely needs this — see `getOwner()` for the
 * lifecycle owner instead.
 *
 * @example
 * ```ts
 * // Library predicate: only register a hot-path subscription when the
 * // caller is inside a tracking scope (memo / effect compute / JSX).
 * function trackIfTracked(source: () => unknown) {
 *   if (getObserver()) source();
 * }
 * ```
 */ function getObserver() {
    if (pendingCheckActive || latestReadActive) return PENDING_OWNER;
    return tracking ? context : null;
}

/**
 * Returns the current reactive **owner** — the lifecycle node that the next
 * `cleanup()` / `onCleanup()` / `createSignal()` etc. will be attached to.
 *
 * Returns `null` if called outside any owner. Capture the owner with
 * `getOwner()` and re-enter it later with `runWithOwner(owner, fn)` to attach
 * disposables created from a callback (event handler, async resolution, etc.)
 * back to a component's lifecycle.
 *
 * @example
 * ```ts
 * function defer<T>(fn: () => T) {
 *   const owner = getOwner();
 *   queueMicrotask(() => runWithOwner(owner, fn));
 * }
 * ```
 */ function getOwner() {
    return context;
}

/**
 * Low-level: registers `fn` as a disposal callback on the current owner.
 * Most code should use `onCleanup()` from `solid-js`, which adds dev-mode
 * checks. `cleanup()` is the unchecked primitive used by internals.
 */ function cleanup(e) {
    if (!context) return e;
    if (!context.qe) context.qe = e; else if (Array.isArray(context.qe)) context.qe.push(e); else context.qe = [ context.qe, e ];
    return e;
}

/**
 * Returns `true` if the owner has been disposed (or marked zombie pending
 * disposal). Pair with a captured owner to bail out of late callbacks whose
 * surrounding component already unmounted.
 *
 * @example
 * ```ts
 * function onSettleSafe(fn: () => void) {
 *   const owner = getOwner();
 *   queueMicrotask(() => {
 *     if (owner && isDisposed(owner)) return; // component unmounted; skip
 *     runWithOwner(owner, fn);
 *   });
 * }
 * ```
 */ function isDisposed(e) {
    return !!(e.oe & (REACTIVE_DISPOSED | REACTIVE_ZOMBIE));
}

function disposeRootSelf(e = true) {
    disposeChildren(this, e);
}

/**
 * Creates a fresh owner attached as a child of the current owner (or as a
 * detached root if there is none). Used by framework internals to group
 * cleanups; app code should use `createRoot()` (host a reactive scope outside
 * a component) or `runWithOwner()` (re-enter a captured owner).
 *
 * @internal
 */ function createOwner(e) {
    const n = context;
    const t = e?.transparent ?? false;
    // Prod and observe boilerplates (see core.ts computed()). The observe
    // literal carries the `_name` slot the rendering layer fills with the
    // component label (`owner._name = "<App>"`) — a slot, so labelling a root
    // is a plain store rather than a shape fork between labelled and plain roots.
        const i = {
        id: inheritId(e, t, n),
        C: t ? CONFIG_TRANSPARENT : 0,
        Wn: true,
        qn: n?.Wn ? n.qn : n,
        tn: null,
        un: null,
        gn: null,
        qe: null,
        T: n?.T ?? globalQueue,
        Je: n?.Je || defaultContext,
        En: 0,
        o: null,
        _parent: n,
        dispose: disposeRootSelf
    };
    if (n) linkChild(n, i);
    return i;
}

/**
 * Creates a reactive root — an owner scope with its own `dispose()`. A root
 * created inside an existing owner is owned by it and is disposed when the
 * parent is disposed; call `dispose()` to tear it down earlier. To create a
 * root that outlives its creator, detach explicitly:
 * `runWithOwner(null, () => createRoot(...))`. Pass `id` to seed hydration
 * ids for the tree it owns.
 *
 * `dispose()` tears down every signal, memo, effect, and `onCleanup`
 * registered inside the root.
 *
 * Use this to host long-lived reactive scopes outside of a component (custom
 * controllers, app bootstrapping, tests). Inside a component, prefer
 * letting Solid's component lifecycle own things.
 *
 * @example
 * ```ts
 * // At module level there is no owner, so this root lives until disposed.
 * const dispose = createRoot(dispose => {
 *   const [n, setN] = createSignal(0);
 *   createEffect(() => n(), value => console.log(value));
 *   setInterval(() => setN(x => x + 1), 1000);
 *   return dispose;
 * });
 *
 * // Later, to tear everything down:
 * dispose();
 *
 * // Inside an owner (component, effect, another root), detach explicitly
 * // if the root must outlive its creator:
 * const detached = runWithOwner(null, () => createRoot(d => d));
 * ```
 *
 * @description https://docs.solidjs.com/reference/reactive-utilities/create-root
 */ function createRoot(e, n) {
    const t = createOwner(n);
    return runWithOwner(t, () => e(() => t.dispose()));
}

export { cleanup, createOwner, createRoot, dispose, disposeChildren, getNextChildId, getObserver, getOwner, inheritId, isDisposed, linkChild, markDisposal, peekNextChildId };