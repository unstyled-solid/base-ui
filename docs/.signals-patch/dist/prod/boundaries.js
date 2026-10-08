import { runWithOwner, signal, spectate, computed, read, untrack, setSignal, notifyOnLane, recompute, currentOptimisticLane, ext } from "./core/core.js";

import { NotReadyError, unwrapStatusError } from "./core/error.js";

import { createOwner, cleanup } from "./core/owner.js";

import { Queue, transitions, reporterBlocksSource, wakeParked, schedule, queueRearm, haltReactivity } from "./core/scheduler.js";

import { getContext, setContext, createContext } from "./core/context.js";

import { STATUS_PENDING, STATUS_ERROR, REACTIVE_DISPOSED, REACTIVE_ZOMBIE, STATUS_UNINITIALIZED, NOT_PENDING, CONFIG_AUTO_DISPOSE } from "./core/constants.js";

import "./core/invariants.js";

import { enqueueSub } from "./core/heap.js";

import "./core/verdict.js";

import "./core/effect.js";

import { reportClientError } from "./core/error-hooks.js";

import { accessor } from "./signals.js";

function boundaryComputed(e, t) {
    const r = computed(e, {
        lazy: true
    });
    ext(r).S = (e, t) => {
        // Use passed values if provided, otherwise read from node
        const n = e !== undefined ? e : r.h;
        const i = t !== undefined ? t : r.o?._;
        // Notify both status dimensions like a render effect does; the queue chain
        // consumes this boundary's own type and forwards the remainder upward until
        // a boundary that handles it is found.
                r.h &= ~r.R;
        const s = r.T.notify(r, STATUS_PENDING | STATUS_ERROR, n, i);
        // The queue is the only propagation channel: a foreign status must not stay
        // reader-visible on the tree, or reads re-throw it across the boundary and
        // link unrelated ambient contexts (the #2809 nested-boundary loop). Deps are
        // untouched, so the tree still recomputes when the foreign source settles.
                const o = n & ~r.R & (STATUS_PENDING | STATUS_ERROR);
        if (o) {
            r.h &= ~o;
            if (r.o?._ === i && !(r.h & (STATUS_PENDING | STATUS_ERROR))) if (r.o !== null) r.o._ = undefined;
        }
        // An ERROR the chain could not deliver to any boundary is uncaught. The
        // scrub above already removed it from reader-visible state, so without
        // escalation here it would vanish entirely (#2884) — halt-and-throw,
        // exactly like an unhandled effect error.
                if (!s && n & STATUS_ERROR) {
            haltReactivity(unwrapStatusError(i));
            throw i;
        }
    };
    r.R = t;
    r.C &= ~CONFIG_AUTO_DISPOSE;
    recompute(r, true);
    return r;
}

/**
 * A boundary's `on` dependencies (#3540): `onFn` runs tracked, as a
 * computation whose value is discarded — what it READS is the point. Every
 * run after the first is a notification (a source it read was written, went
 * pending, or landed; an optimistic write notifies like any other) and
 * queues the boundary for re-arming once this pass's heap has run
 * (scheduler.ts `pendingRearms`: the re-arm needs what the notifying write
 * put in flight, which this pass — at the height of its reads — runs ahead
 * of). The value is never compared: a thunk that returns a fresh object per
 * run but reads nothing reactive never re-arms, and one that returns the
 * same constant re-arms whenever a read source changes. A zero-argument
 * function is an accessor, tracked like any other.
 *
 * The pass's posture is the notification's. A plain pass derives from the
 * frame the write belongs to, and the re-arm follows that frame. A pass
 * under a lane read display-ahead state — `latest()` (its shadow is an
 * optimistic computed), an optimistic write — and the re-arm shows the
 * fallback through that lane (`_rearmLane`): now, beside whatever frame a
 * transaction still holds.
 *
 * Created under `owner` while the owner's queue is still the parent's, so
 * the node belongs to the parent boundary, not to this one — as the
 * condition of a `<Show>` wrapping the boundary would. Two status rules set
 * it apart from a plain memo:
 * - Pending is not the parent's: a source of `on` that is not ready is a
 *   notification for this boundary (it re-arms: the fallback shows here, not
 *   in an outer boundary). Propagation marks the node without a pass, so the
 *   channel scrubs the mark and re-derives it; the pass reads the source
 *   (linking to its landing) and catches. The node never registers as a
 *   reporter: `on` reading a pending source holds no frame.
 * - An error IS the parent's, as a wrapping `<Show>` condition's would be:
 *   forwarded up the queue chain like a render effect's; uncaught, it halts
 *   (#2884).
 */ function onNode(e, t, r) {
    let n = false;
    const i = runWithOwner(e, () => computed(() => {
        try {
            r();
        } catch (e) {
            if (!(e instanceof NotReadyError)) throw e;
        }
        if (n) {
            if (currentOptimisticLane !== null) t.O = currentOptimisticLane;
            queueRearm(t);
        } else n = true;
    }, {
        lazy: true
    }));
    ext(i).S = (e, t) => {
        const r = e !== undefined ? e : i.h;
        if (r & STATUS_PENDING) {
            i.h &= ~STATUS_PENDING;
            if (i.o?._ instanceof NotReadyError) i.o._ = undefined;
            enqueueSub(i);
            schedule();
        }
        if (r & STATUS_ERROR) {
            const e = t !== undefined ? t : i.o?._;
            i.h &= ~STATUS_ERROR;
            if (i.o?._ === e && i.o !== null) i.o._ = undefined;
            if (!i.T.notify(i, STATUS_ERROR, r, e)) {
                haltReactivity(unwrapStatusError(e));
                throw e;
            }
        }
    };
    i.C &= ~CONFIG_AUTO_DISPOSE;
    recompute(i, true);
    return i;
}

function createBoundChildren(e, t, r, n) {
    const i = e.T;
    i.addChild(e.T = r);
    cleanup(() => i.removeChild(e.T));
    // Named for the observe tier's owner paths: user content under a boundary
    // is owned by `children`, and the boundary's own two nodes read as
    // structure rather than as anonymous `computed`s between `<Loading>` and
    // the content (`<App> › <Loading> › children › <Feed>`).
        return runWithOwner(e, () => {
        // The call, not the argument, is gated: `computed(fn, void 0)` would keep
        // a trailing argument in the prod artifact.
        const e = false ? computed(t, {
            name: "children"
        }) : computed(t);
        return boundaryComputed(() => flatten(read(e)), n);
    });
}

const RevealControllerContext = /* @__PURE__ */ createContext(null);

let _revealUsed = false;

const FALSE_ACCESSOR = () => false;

const SEQUENTIAL_ACCESSOR = () => "sequential";

function isRevealController(e) {
    return e instanceof RevealController;
}

function isSlotReady(e) {
    return isRevealController(e) ? e.I() : e.U.size === 0 && !e.v;
}

function isSlotMinimallyReady(e) {
    return isRevealController(e) ? e.D() : isSlotReady(e);
}

function setSlotState(e, t, r, n) {
    setSignal(e.P, r);
    setSignal(e.L, n);
    if (isRevealController(e)) {
        if (!r && e.j === t) e.j = undefined;
        return e.B(r, n);
    }
    if (!r && e.W === t && e.q) e.W = undefined;
}

class RevealController {
    V;
    F;
    Z=[];
    j;
    P=signal(false, {
        ownedWrite: true,
        H: true
    });
    L=signal(false, {
        ownedWrite: true,
        H: true
    });
    J=true;
    K=true;
    X=false;
    constructor(e, t) {
        this.V = e;
        this.F = t;
    }
    Y(e) {
        for (let t = 0; t < this.Z.length; t++) {
            const r = this.Z[t];
            if ((isRevealController(r) ? r.j : r.W) !== this) continue;
            if (e(r) === false) return false;
        }
        return true;
    }
    I() {
        return this.Y(isSlotReady);
    }
    /**
     * "Minimally ready" = this group has something visible to show under its own policy.
     * Used by an enclosing `together` group to decide when it can release.
     * - `together`: every direct slot is minimally ready.
     * - `sequential`: the first owned slot is minimally ready (frontier can advance).
     * - `natural`: any owned slot is minimally ready.
     */    D() {
        const e = untrack(this.V);
        if (e === "together") return this.Y(isSlotMinimallyReady);
        if (e === "natural") {
            let e = false;
            let t = false;
            this.Y(r => {
                e = true;
                if (isSlotMinimallyReady(r)) {
                    t = true;
                    return false;
                }
            });
            return !e || t;
        }
        // sequential: only the first owned slot matters.
                let t = true;
        this.Y(e => {
            t = isSlotMinimallyReady(e);
            return false;
        });
        return t;
    }
    $(e) {
        if (this.Z.includes(e)) return;
        this.Z.push(e);
        const t = untrack(this.V);
        setSignal(e.P, true), setSignal(e.L, t === "sequential" ? !!untrack(this.F) : false);
        untrack(() => this.B());
    }
    ee(e) {
        const t = this.Z.indexOf(e);
        if (t >= 0) this.Z.splice(t, 1);
        untrack(() => this.B());
    }
    B(e, t) {
        if (this.X) return;
        this.X = true;
        const r = this.J;
        const n = this.K;
        try {
            const r = e ?? read(this.P), n = untrack(this.V), i = n === "sequential" && !!untrack(this.F), s = t ?? i;
            if (r) {
                // Held by an outer group. Propagate the hold (and whatever collapsed policy
                // the outer asked for) down the whole subtree. Inner order is ignored while
                // held; it resumes once the outer releases us.
                this.Y(e => setSlotState(e, this, true, s));
            } else if (n === "natural") {
                // Each child reveals based on its own readiness. A nested controller slot
                // is released to run its own order locally — we bypass setSlotState for it
                // so the parent backpointer survives for upward readiness notifications.
                this.Y(e => {
                    if (isRevealController(e)) {
                        setSignal(e.L, false);
                        setSignal(e.P, false);
                        e.B(false, false);
                    } else {
                        setSlotState(e, this, !isSlotReady(e), false);
                    }
                });
            } else if (n === "together") {
                // Release when every direct slot is minimally ready (has something to show
                // under its own order). A fully-ready inner together is minimally ready;
                // sequential's first slot being ready is minimally ready; natural having any
                // ready child is minimally ready. This lets `together` guarantee a single
                // cohesive reveal without waiting for every grandchild.
                const e = this.Y(isSlotMinimallyReady);
                this.Y(t => setSlotState(t, this, !e, false));
            } else {
                let e = false;
                this.Y(t => {
                    if (e) return setSlotState(t, this, true, i);
                    if (isSlotReady(t)) return setSlotState(t, this, false, false);
                    e = true;
                    // Frontier slot. For a leaf, holding `_disabled=true` is what keeps its
                    // fallback visible. For a composite, we instead release it so it runs
                    // its own order locally — its leaves will each show their own fallback
                    // until their data lands. Outer still waits on full readiness before
                    // advancing past this slot, and we bypass setSlotState so the parent
                    // backpointer survives for upward readiness notifications.
                                        if (isRevealController(t)) {
                        setSignal(t.L, false);
                        setSignal(t.P, false);
                        t.B(false, false);
                    } else {
                        setSlotState(t, this, true, false);
                    }
                });
            }
        } finally {
            this.J = this.I();
            this.K = this.D();
            this.X = false;
        }
        if (this.j && (r !== this.J || n !== this.K)) this.j.B();
    }
}

class CollectionQueue extends Queue {
    te;
    U=new Set;
    re;
    /** The output pass — fallback or content (createCollectionBoundary). */
    ne;
    v=true;
    P=signal(false, {
        ownedWrite: true,
        H: true
    });
    _;
    L=signal(false, {
        ownedWrite: true,
        H: true
    });
    W;
    q=false;
    /** The boundary's owner — where a `caught` report locates itself, set before the children are built (a creation-time throw arrives before `_tree`). */
    ie;
    /** The lane the `on` pass that queued this re-arm ran under (onNode), if
     * any: the fallback swap is display-ahead — shown through the lane. */
    O=null;
    constructor(e) {
        super();
        this.te = e;
    }
    run(e) {
        if (!e || read(this.P) && (!_revealUsed || read(this.L))) return;
        return super.run(e);
    }
    /** An `on` dependency notified (onNode → scheduler `pendingRearms`);
     * drained after the heap, before the verdict, under the notifying write's
     * transaction (#3540). A boundary showing content is fresh again: it
     * releases its hold now and, if anything under it is still pending, swaps
     * to its fallback. The swap is staged, so it lands with the write's frame
     * — at once when nothing else holds it, with the rest of the new page
     * when something outside the boundary does; if the pending lands first,
     * `_checkSources` clears it and no fallback is shown. An `on` that read a
     * lane (`latest()`, an optimistic write) asked for the change now:
     * `_rearmLane` shows the swap through the lane, beside the held frame.
     * Children stay alive behind the fallback. */    se() {
        const e = this.O;
        this.O = null;
        if (this.re === undefined || this.re.oe & REACTIVE_DISPOSED) return;
        if (!this.q) return;
        // Readers forwarded while this boundary showed content are what it
        // would wait on now. They never re-notify (status propagation dedupes on
        // the reader's `_pendingSources`), so the re-arm collects it from their
        // registrations — the one place a forwarded reader is recorded (INV-3)
        // — or a sibling reader's flight that lands first reveals them stale
        // (A33, #3459). Before the verdict, a registration may have stopped
        // counting without being pruned yet (its flight landed this pass):
        // `reporterBlocksSource` is the verdict's own test.
                const t = new Set;
        for (const e of transitions) for (const [r, n] of e.le) {
            for (const e of n) if (this.ae(e) && reporterBlocksSource(e, r)) {
                t.add(r);
                e.o?.ue?.forEach(e => t.add(e));
            }
        }
        if (!t.size) return;
        this.q = false;
        this.U = t;
        this.v = true;
        this.fe(e);
        // Those readers are behind the fallback now: they stop blocking
        // (`reporterBlocksSource`), and the transactions they were holding must
        // be re-judged for it (A33, #3375) — the active one by the verdict that
        // follows this drain, parked ones by the wake. A live action keeps its
        // transaction parked regardless (transitionComplete): its batch commits
        // when it settles, intact.
                wakeParked();
    }
    /** Show the fallback: the swap the output pass selects on. Staged, it is
     * the frame's and lands with its commit. Re-armed from a lane pass
     * (`lane`), it is the current frame's — committed outright, as the lane's
     * view already is on screen — and shown through the lane: the output pass
     * publishes a derived override and its readers run from the lane's queue,
     * at the park, ahead of the transaction (a lane pass reads staged plain
     * writes committed, so a staged swap would be invisible to it). */    fe(e) {
        if (e === null) setSignal(this.P, true); else {
            this.P.ce = true;
            notifyOnLane(this.P, e);
        }
    }
    /** Retry the collected failures of an error boundary: recompute each
     * source that threw, so the boundary can recover. */    Se() {
        for (const e of this.U) {
            // Non-computed sources (patch-channel registrations under plain
            // owners) are not recomputable — their reset is the record's next
            // transition re-applying the patch (re-audit 2, P1-4).
            if (e.he !== undefined) recompute(e);
        }
        schedule();
    }
    notify(e, t, r, n) {
        if (!(t & this.te)) return super.notify(e, t, r, n);
        // Routing is dimension-independent: each boundary consumes only its own
        // status dimension from the mask (`type &= ~collectionType` below) and
        // forwards the remainder up the queue chain. An error inside a `Loading`
        // needs no special rule — the ERROR dimension survives consumption here and
        // reaches the `Errored` that catches it natively, and `flags & collectionType`
        // keeps this boundary from collecting a node that isn't actually pending.
        // Symmetrically, a pending inside an `Errored` forwards on the PENDING
        // dimension, while a status already caught by an inner boundary arrives with
        // its dimension consumed from the mask and is correctly not re-routed
        // (the Loading > Errored > content composition escape, #2856).
                if (this.te & STATUS_PENDING && this.q) return super.notify(e, t, r, n);
        if (r & this.te) {
            this.v = true;
            const t = n?.source || e.o?._?.source;
            if (t) {
                const r = this.U.size === 0;
                this.U.add(t);
                // A collecting boundary waits on everything the effect is pending on,
                // not only the source this notification carries. Status propagation
                // dedupes on the effect's `_pendingSources`: a source it already
                // carries (a flight that started before an `on` reset cleared the
                // set) is never re-reported, and that source's later re-flight
                // stays invisible — the boundary revealed when its one collected
                // source settled while the effect was still pending (#3375).
                                if (this.te & STATUS_PENDING) e.o?.ue?.forEach(e => this.U.add(e));
                if (r) {
                    setSignal(this.P, true);
                }
                if (this.te & STATUS_ERROR) {
                    const e = unwrapStatusError(t.o?._);
                    setSignal(this._, e);
                    // The client error hook: this boundary renders its fallback for
                    // it — the one road a rendered failure took that no global handler
                    // ever saw. `source` is the computation that threw (the status
                    // wrapper's, made at the first landing and kept downstream), so the
                    // hook hears where it broke as well as where it was met. Once per
                    // error object; a `reset()` re-collecting the same failure says
                    // nothing new.
                                        reportClientError(e, this.ie, t);
                }
            }
        }
        t &= ~this.te;
        return t ? super.notify(e, t, r, n) : true;
    }
    /** Is `reporter` live and routed to this boundary — under it, with no
     * collecting pending-type boundary in between (`reporterBlocksSource`'s test)? */    ae(e) {
        if (e.oe & (REACTIVE_ZOMBIE | REACTIVE_DISPOSED)) return false;
        for (let t = e.T; t; t = t._parent) {
            if (t === this) return true;
            if (t.te & STATUS_PENDING && !t.q) return false;
        }
        return false;
    }
    /** Has a collected source stopped counting for this boundary? A source
     * with a live affects() mark holds display state for the mark's lifetime
     * (the visual channel): the marked node carries no status of its own, so
     * the count is the liveness test. The release sweep (finalizePureQueue
     * after mark release) re-runs this check. A source born held under this
     * boundary (recompute, #3540) carries no status either: it is collected
     * while it has a staged value and no committed one, and released by the
     * commit that initializes it. */    de(e) {
        return !!(e.oe & REACTIVE_DISPOSED || !e.o?.t && !(e.h & this.te) && !(this.te & STATUS_ERROR && e.h & STATUS_PENDING) && !(this.te & STATUS_PENDING && e.h & STATUS_UNINITIALIZED && e._e !== NOT_PENDING));
    }
    /** The pre-verdict sweep (scheduler run(), #3540): a collecting boundary
     * whose OUTPUT is pending — its fallback read something not ready — is
     * judged here, under the transaction. That output is what an initialized
     * parent holds the frame on, and it derives from `_disabled`, not the
     * tree: the tree settling never re-runs it, only a sweep does, and the
     * commit sweep runs after the verdict the output's own read keeps parking
     * — the content waited for the fallback's flight. Judged ready here, the
     * boundary stages `_disabled` false with the frame and the output re-runs
     * in this heap: it reads the tree and drops the fallback's read (recompute
     * settles a pass's outgoing pending sources), so the verdict sees the
     * release. A boundary showing a ready fallback parks nothing and keeps the
     * commit sweep's reveal. */    Re() {
        if (this.q || !(this.ne.h & STATUS_PENDING)) return;
        this.Ee();
    }
    Ee() {
        for (const e of this.U) if (this.de(e)) this.U.delete(e);
        if (!this.U.size) {
            if (this.te & STATUS_PENDING && this.v && !this.q && this.re) {
                this.v = !!(this.re.h & this.te);
            } else {
                this.v = false;
            }
            if (!this.v) {
                setSignal(this.P, false);
            }
        }
        if (_revealUsed) this.W?.B();
    }
}

function createCollectionBoundary(e, t, r, n) {
    const i = createOwner();
    if (_revealUsed) setContext(RevealControllerContext, null, i);
    const s = new CollectionQueue(e);
    s.ie = i;
    if (e === STATUS_ERROR) s._ = signal(undefined, {
        ownedWrite: true,
        H: true
    });
    // The `on` dependencies live OUTSIDE the boundary, as the condition of a
    // `<Show>` wrapping it would: created before the owner's queue becomes
    // this boundary's (onNode).
        n && onNode(i, s, n);
    const o = s.re = createBoundChildren(i, t, s, e);
    // Prime source tracking so reveal registration sees pending sources. A
    // bookkeeping read (`spectate`): the mounting pass derives nothing from
    // the tree — it must not be linked to it, nor enter the transaction a
    // tree born held (A29 under a boundary, #3540) was staged into.
        spectate(() => {
        let t = false;
        try {
            read(o);
        } catch (e) {
            if (e instanceof NotReadyError) t = true; else throw e;
        }
        s.v = t || !!(o.h & e) || o.o?._ instanceof NotReadyError;
    });
    const l = _revealUsed && e === STATUS_PENDING ? getContext(RevealControllerContext) : null;
    if (l) {
        s.W = l;
        l.$(s);
        cleanup(() => l.ee(s));
    }
    return accessor(s.ne = computed(() => {
        // `_disabled` selects fallback or content: set by a collecting
        // notification or a re-arm (`_rearm`), cleared by the sweep when the
        // collected sources settle — each re-runs this pass.
        if (!read(s.P)) {
            const e = read(o);
            if (!untrack(() => read(s.P))) return s.q = true, e;
        }
        // Collapsed reveal slots suppress their own output entirely; the
        // renderer treats the hole as empty, so the cast never leaks to users
        // outside a `createRevealOrder` scope.
                if (_revealUsed && read(s.L)) return undefined;
        return r(s);
    }, 
    // Boundary structure, not a user source: its value is fallback-or-content and
    // legitimately swaps mid-hydration (reveal/resume), so it must never be frozen
    // by snapshot capture. The tree no longer carries foreign status flags, so
    // capture can't rely on PENDING to skip this node the way it used to.
    {
        H: true
    }));
}

/**
 * Lower-level primitive that backs the `<Loading>` flow control. Catches
 * pending async reads inside `fn` and renders `fallback` until they settle.
 *
 * App code should use `<Loading fallback={...}>` instead — reach for this only
 * when authoring custom boundary components.
 *
 * @param fn the tracked subtree
 * @param fallback the fallback shown while async reads in `fn` are unresolved
 * @param options `on` — a dependency list: a tracked function whose reads
 *   re-arm the boundary. Its return value is irrelevant (never compared);
 *   what matters is what it reads. Without `on`, a boundary that has shown
 *   content keeps it through a refetch (the pending holds with the
 *   transaction). With `on`, a write to anything it reads makes the boundary
 *   fresh again: it stops waiting on its current content, and if something
 *   under it is pending it shows `fallback` until the new content is ready;
 *   if nothing is pending, the notification is a no-op. The fallback lands
 *   with the same frame as the change that caused it — now, when nothing
 *   else holds that frame; together with the rest of the new page during a
 *   held navigation, not before it. If the same data is also read outside
 *   the boundary, the frame waits on it and the fallback can never be seen
 *   (DEV warns `LOADING_ON_OUTSIDE_HOLD`); the fix is structural — move the
 *   outside read under the boundary so one hold owns the data. A frame held
 *   past the content's landing by something else (the write's action, other
 *   pending data) also shows no fallback; that is a race the fallback may
 *   lose, a legitimate outcome, and not reported. A display-ahead read in
 *   `on` (`latest()`) shows the fallback now, beside the held frame; that
 *   is a capability, not the recommended shape. Optimistic writes and a
 *   source going pending notify like any other. The children are not
 *   re-created — they stay alive behind the fallback.
 *
 * @example
 * ```tsx
 * // Custom boundary component built on top of the primitive.
 * function MyLoading(props: { fallback: JSX.Element; children: JSX.Element }) {
 *   return createLoadingBoundary(
 *     () => props.children,
 *     () => props.fallback
 *   ) as unknown as JSX.Element;
 * }
 * ```
 */ function createLoadingBoundary(e, t, r) {
    return createCollectionBoundary(STATUS_PENDING, e, () => t(), r?.on);
}

/**
 * Lower-level primitive that backs the `<Errored>` flow control. Catches
 * thrown errors inside `fn` and invokes `fallback(error, reset)` instead.
 * `error` is an accessor for the latest captured error; `reset()` recomputes
 * the failing sources so the boundary can attempt to recover.
 *
 * App code should use `<Errored fallback={...}>` instead — reach for this only
 * when authoring custom boundary components.
 *
 * @example
 * ```tsx
 * // Custom boundary that wraps the primitive and adds telemetry.
 * function TracedErrored(props: { fallback: (e: () => unknown) => JSX.Element; children: JSX.Element }) {
 *   return createErrorBoundary(
 *     () => props.children,
 *     (err, reset) => {
 *       reportError(err());
 *       return props.fallback(err);
 *     }
 *   ) as unknown as JSX.Element;
 * }
 * ```
 */ function createErrorBoundary(e, t) {
    return createCollectionBoundary(STATUS_ERROR, e, e => t(accessor(e._), () => e.Se()));
}

/**
 * Coordinate the reveal timing of sibling loading boundaries.
 *
 * Accepts reactive accessors:
 * - `order`: `"sequential"` (default) | `"together"` | `"natural"`.
 *   - `"sequential"` — classic frontier reveal: siblings reveal in registration order
 *     as each resolves; later siblings stay hidden until earlier ones complete.
 *   - `"together"` — every direct slot stays on its fallback until the whole group
 *     is "minimally ready" (each direct slot has produced its own first visible
 *     content under its own order), then the whole group releases at once.
 *   - `"natural"` — children reveal independently (as each resolves). At the top
 *     level this is a no-op compared to not using `createRevealOrder`; the mode
 *     exists for nesting, where the group registers as a single composite slot to
 *     any enclosing `createRevealOrder`.
 * - `collapsed`: only meaningful when `order === "sequential"`. When set, tail siblings
 *   past the frontier suppress their own fallback output. Ignored under `"together"`
 *   and `"natural"` — those orders have no frontier.
 *
 * Nested `createRevealOrder` groups compose: the inner controller registers as a
 * single slot in the outer controller and is held on its fallbacks until the outer
 * releases that slot. Once released, the inner controller runs its own order locally
 * over anything still pending. There is no opt-out from an outer hold.
 *
 * "Minimally ready" is what an order considers its first visible content:
 * - `sequential` — frontier-0 is minimally ready (leaf: on resolve; nested: via its
 *   own minimal signal).
 * - `together` — every direct slot is minimally ready.
 * - `natural` — any direct slot has visible content (leaves on resolve; nested
 *   composites via their own minimal signal).
 *
 * @example
 * ```ts
 * // Primitive form of `<Reveal>` — coordinate sibling loading boundaries
 * // programmatically. App code uses the JSX `<Reveal>` component instead.
 * // Both options are accessors so they can react to state changes.
 * createRevealOrder(
 *   () => renderSiblings(),
 *   { order: () => mode(), collapsed: () => true }
 * );
 * ```
 */ function createRevealOrder(e, t) {
    _revealUsed = true;
    const r = createOwner();
    const n = getContext(RevealControllerContext);
    const i = t?.order || SEQUENTIAL_ACCESSOR, s = t?.collapsed || FALSE_ACCESSOR;
    const o = new RevealController(i, s);
    setContext(RevealControllerContext, o, r);
    return runWithOwner(r, () => {
        const t = e();
        const r = computed(() => {
            i();
            s();
            o.B();
        });
        // Post-construction rather than an options argument, so the prod call
        // keeps its shape; the observe node literal already carries the slot.
                if (false) ;
        if (n) {
            o.j = n;
            n.$(o);
            cleanup(() => n.ee(o));
        }
        return t;
    });
}

/**
 * Resolves a children value to its renderable form: unwraps zero-arg functions
 * (accessors), recursively flattens arrays, and optionally skips
 * non-rendering values (`null`, `undefined`, `true`, `false`, `""`).
 *
 * Used internally by flow components and by the renderer to walk a children
 * tree. App code rarely needs this directly — see `children()` in `solid-js`
 * for the user-facing helper that memoizes the result.
 *
 * @param children value or array of values to flatten
 * @param options
 *   - `skipNonRendered` — drop values that won't render
 *   - `doNotUnwrap` — leave function children as-is (caller will resolve)
 *
 * @example
 * ```ts
 * // Custom renderer walking a children tree manually. Most authors should
 * // use `children()` from solid-js, which memoizes the resolved value.
 * function renderChildren(value: unknown): unknown {
 *   return flatten(value, { skipNonRendered: true });
 * }
 * ```
 */ function flatten(e, t) {
    if (typeof e === "function" && !e.length) {
        if (t?.doNotUnwrap) return e;
        do {
            e = e();
        } while (typeof e === "function" && !e.length);
    }
    if (t?.skipNonRendered && (e == null || e === true || e === false || e === "")) return;
    if (Array.isArray(e)) {
        let r = [];
        if (flattenArray(e, r, t)) {
            return () => {
                let e = [];
                flattenArray(r, e, {
                    ...t,
                    doNotUnwrap: false
                });
                return e;
            };
        }
        return r;
    }
    return e;
}

function flattenArray(e, t = [], r) {
    let n = null;
    let i = false;
    for (let s = 0; s < e.length; s++) {
        try {
            let n = e[s];
            if (typeof n === "function" && !n.length) {
                if (r?.doNotUnwrap) {
                    t.push(n);
                    i = true;
                    continue;
                }
                do {
                    n = n();
                } while (typeof n === "function" && !n.length);
            }
            if (Array.isArray(n)) {
                // OR, don't overwrite: an accessor already pushed under doNotUnwrap
                // still needs the resolving wrapper even when a later sibling
                // fragment contains no functions (#3133).
                i = flattenArray(n, t, r) || i;
            } else if (r?.skipNonRendered && (n == null || n === true || n === false || n === "")) {
                // skip
            } else t.push(n);
        } catch (e) {
            if (!(e instanceof NotReadyError)) throw e;
            n = e;
        }
    }
    if (n) throw n;
    return i;
}

export { CollectionQueue, RevealController, createErrorBoundary, createLoadingBoundary, createRevealOrder, flatten };