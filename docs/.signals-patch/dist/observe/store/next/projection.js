import { computed } from "../../core/core.js";

import { isDisposed, getOwner } from "../../core/owner.js";

import { setProjectionWriteActive, projectionWriteActive, scheduleWithheld } from "../../core/scheduler.js";

import { handleAsync } from "../../core/async.js";

import "../../core/verdict.js";

import "../../core/effect.js";

import { CONFIG_AUTO_DISPOSE, STATUS_PENDING } from "../../core/constants.js";

import "../../core/dev.js";

import { $TARGET, STORE_VALUE, markRawIngest, setWriteOverride } from "../store.js";

import { reconcileNextState } from "./reconcile.js";

import { storeSetterNext, wrapNext, nameStore, derivedStoreWrite } from "./store.js";

/**
 * Store rewrite — projections (§7/§7b): a projection is a computed store.
 * The derive runs inside a computed whose recompute merges its output into
 * the projection's backing through the adoption channel (replace-mode root:
 * entity changes merge in place, the root proxy is stable for life). Children
 * wrap into the projection's own FAMILY (writes land here, never in a source
 * family), and every family node carries the projection computed as its
 * firewall — reads link the derive's status and lifecycle natively. The §6c
 * status gate in the traps makes an uninitialized async derive's seed
 * unobservable through every read surface.
 *
 * Mirrors the legacy runProjectionComputed shape (shadow runs for open
 * loading windows, handleAsync landings, commit-through-setter) on next
 * primitives; the generic draft write-traps are reused from the legacy
 * module unchanged.
 */
/**
 * Wrap a store proxy as a projection DRAFT: every operation carries the write
 * override (the derive is the author — its ops must not hit the §6c firewall
 * gate, even in a continuation after an `await`/`yield` where the sync write
 * scope has closed).
 *
 * FAKE TARGET, not the store proxy itself (#3060): after a proxy trap
 * returns, the engine runs spec invariant validation against the proxy's
 * TARGET — [[OwnPropertyKeys]] after ownKeys, [[GetOwnProperty]] after
 * set/getOwnPropertyDescriptor/defineProperty. With the store proxy as
 * target those checks re-enter the store's traps OUTSIDE the override
 * bracket (the trap's finally has already run), so `Object.keys(state)` in
 * a derive continuation fired the firewall gate and re-threw the
 * projection's own pending NotReadyError into the derive. A dummy of
 * matching kind (array/object, same trick as the store's own TargetShape)
 * keeps invariant validation away from the store entirely; the traps
 * forward to the closed-over inner proxy inside the bracket.
 *
 * Save/restore projectionWriteActive, never hard-reset: the draft can be
 * driven from inside an enclosing authoritative-write scope (next-store
 * optimistic derives), and a hard `false` would clobber it mid-derive.
 */ function wrapDraft(e, t, r, o, i) {
    // One bracket for the three mutating traps. A write to a superseded or
    // disposed draft is dropped silently (proj R37 — the same fate as a
    // superseded async run's pending draft writes, R26). `afterWrite` runs
    // once the bracket has closed — outside it, so the scheduler's
    // projectionWriteActive guard no longer applies — and only for the
    // outermost bracket (a draft driven from inside an enclosing authoritative
    // scope, the optimistic derive, leaves scheduling to that scope's caller).
    const mutate = e => {
        if (!t()) return true;
        const o = projectionWriteActive;
        setWriteOverride(true);
        setProjectionWriteActive(true);
        try {
            r ? r(e) : e();
        } finally {
            setWriteOverride(false);
            setProjectionWriteActive(o);
        }
        if (!o && i) i();
        return true;
    };
    const n = {
        get(n, c) {
            let s;
            const l = projectionWriteActive;
            setWriteOverride(true);
            setProjectionWriteActive(true);
            try {
                s = e[c];
            } finally {
                setWriteOverride(false);
                setProjectionWriteActive(l);
            }
            // A shallow store's leaves are raw by contract (#3498): no draft proxy
            // over them, so identity holds and a frozen leaf is never trapped.
                        return !o && typeof s === "object" && s !== null && c !== $TARGET ? wrapDraft(s, t, r, false, i) : s;
        },
        has(t, r) {
            let o;
            const i = projectionWriteActive;
            setWriteOverride(true);
            setProjectionWriteActive(true);
            try {
                o = r in e;
            } finally {
                setWriteOverride(false);
                setProjectionWriteActive(i);
            }
            return o;
        },
        set: (t, r, o) => mutate(() => {
            e[r] = o;
        }),
        deleteProperty: (t, r) => mutate(() => {
            delete e[r];
        }),
        ownKeys() {
            const t = projectionWriteActive;
            setWriteOverride(true);
            setProjectionWriteActive(true);
            try {
                return Reflect.ownKeys(e);
            } finally {
                setWriteOverride(false);
                setProjectionWriteActive(t);
            }
        },
        getOwnPropertyDescriptor(t, r) {
            let o;
            const i = projectionWriteActive;
            setWriteOverride(true);
            setProjectionWriteActive(true);
            try {
                o = Reflect.getOwnPropertyDescriptor(e, r);
            } finally {
                setWriteOverride(false);
                setProjectionWriteActive(i);
            }
            // The dummy target doesn't hold the key, so a non-configurable report
            // would violate the proxy invariant. Store descriptors are already
            // normalized configurable; enforce it for raw leaves too.
                        if (o) o.configurable = true;
            return o;
        },
        defineProperty: (t, r, o) => mutate(() => {
            Reflect.defineProperty(e, r, o);
        })
    };
    // Matching-kind dummy so Array.isArray(draft) answers like the store.
        return new Proxy(Array.isArray(e) ? [] : {}, n);
}

function createProjectionNextInternal(e, t, r) {
    const o = {
        map: new WeakMap,
        node: null,
        shallow: !!r?.shallow
    };
    const i = wrapNext(t, null, null, o);
    if (o.shallow) {
        // Shallow projection: the root is the only wrapped level — slot values
        // serve raw, ingests sticky raw-mark (same t.s machinery as plain).
        i[$TARGET].s = true;
        markRawIngest(t);
    }
    let n;
    if (r?.seedLoadingValue) n = {
        loadingValue: undefined
    };
    if (r?.name) {
        n = {
            ...n,
            name: r.name
        };
        nameStore(i, r.name);
    }
    const c = computed(() => {
        if (!o.node) o.node = getOwner();
        runProjectionComputedNext(i, e, r?.key === undefined ? "id" : r.key);
    }, n);
    c.C &= ~CONFIG_AUTO_DISPOSE;
    o.node = c;
    return {
        store: i,
        node: c
    };
}

function createProjectionNext(e, t, r) {
    return createProjectionNextInternal(e, t, r).store;
}

/** Derived writable store (legacy parity): a projection whose public setter
 * masks the recompute for the tick (core R31 — the manual write wins over a
 * same-flush dependency change). Across a hold the write is not a proposal:
 * a leaf another transaction holds as the fold's result re-runs the fold
 * under it, the write being the draft's prior state (A34 amendment, #3612;
 * core derivedWrite). */ function createStoreDerivedNext(e, t, r) {
    const {store: o, node: i} = createProjectionNextInternal(e, t, r);
    return [ o, e => derivedStoreWrite(i, o, e) ];
}

// A detached copy of projection state: the root container alone for a shallow
// store — its leaves are raw references by contract and stay so (#3498) — the
// whole tree otherwise.
function cloneState(e, t) {
    return t ? Array.isArray(e) ? e.slice() : {
        ...e
    } : JSON.parse(JSON.stringify(e));
}

function runProjectionComputedNext(e, t, r, o, i) {
    const n = getOwner();
    const c = e[$TARGET];
    const s = c.fam;
    // Draft validity is per run (R37): live from here until the NEXT run starts
    // — this counter moves, whatever that run does (lands, throws NotReady,
    // awaits) — or the owner is disposed. Not "until no longer in flight": a
    // sync derive that subscribes to an external source and pushes into the
    // draft from the callback (#3585) is the model use, and the old gate
    // (`owner._x?._inFlight === result`) only admitted it by accident — while
    // nothing had read the projection yet (no `_x`), `undefined === undefined`.
        const l = s.run = (s.run || 0) + 1;
    let a;
    // Open loading window (seedLoadingValue): the observable store IS commit #0
    // for the whole first flight — the derive works a detached shadow of the
    // seed so draft writes cannot tear through to readers (#2988). Every commit
    // point reconciles the shadow through the normal commit path. (A callback
    // that closes over the shadow writes into a dead clone once the window has
    // closed — the one carve-out from R37's one-draft-per-run model.)
        const u = n.ye ? cloneState(c[STORE_VALUE], c.s) : null;
    const f = wrapDraft(e, () => s.run === l && !isDisposed(n), i, c.s, 
    // A write after the run returned takes the override channel (pending
    // backing + per-op notify + fold) and arms the drain itself when no
    // landing will: a flight still up — pending, or the loading window's
    // first flight — drains at its landing, and must not be drained early.
    // Not gated on the run having returned: the body's own writes withhold
    // the microtask too, and a derive body only ever runs outside a flush at
    // creation (reruns are flush-driven) — a top-level sync projection in a
    // createRoot stranded the scheduler until an explicit flush(). Arming
    // mid-body is safe: the microtask fires after this synchronous slice,
    // when the body has returned or parked, and an initial async run's
    // pre-await half drains before its landing exactly as it does when the
    // creation ran inside a flush — nothing reads it before the landing
    // (the node is uninitialized, proj R23).
    () => {
        if (!(n.S & STATUS_PENDING) && !n.ye) scheduleWithheld();
    });
    storeSetterNext(f, i => {
        a = t(u ?? i);
        const commit = t => {
            // Shadow run: commit a detached snapshot, never the shadow itself
            // (adoption takes the value by identity — handing it the live shadow
            // would fuse the draft to the observable store).
            if (u && (t === undefined || t === u)) t = cloneState(u, c.s);
            if (t === i || t === undefined) return;
            const write = () => storeSetterNext(e, e => reconcileNextState(t, e, r, true), false);
            o ? o(write, t) : write();
        };
        const s = handleAsync(n, a, commit);
        if (!n.ye) commit(s);
    }, false);
    return n;
}

export { createProjectionNext, createStoreDerivedNext, runProjectionComputedNext };