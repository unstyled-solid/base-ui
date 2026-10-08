import { EFFECT_RENDER, EFFECT_USER, STATUS_PENDING, CONFIG_ADOPTED_UNFLUSHED, NOT_PENDING, REACTIVE_MANUAL_WRITE, STATUS_UNINITIALIZED, REACTIVE_OPTIMISTIC_DIRTY, REACTIVE_IN_HEAP_HEIGHT, REACTIVE_DISPOSED, CONFIG_HELD_TRUTH, CONFIG_HAS_COMPANIONS, EFFECT_TRACKED, CONFIG_INPUTS_PUBLISHED, REACTIVE_ZOMBIE, CONFIG_LANE_FRAME, CONFIG_HAS_LANE, CONFIG_HAS_SNAPSHOT, REACTIVE_RECOMPUTING_DEPS, REACTIVE_MISSED_WAKE, CONFIG_IN_SNAPSHOT_SCOPE, REACTIVE_SNAPSHOT_STALE, CONFIG_SLOT_NODE, CONFIG_HELD_CHILDREN, REACTIVE_REASK, CONFIG_AUTHORITATIVE_READ } from "./constants.js";

import { resyncUnflushedCompanions, currentOptimisticLane, slotUnobservedHook, markUnflushedStaged, hasActiveOverride } from "./core.js";

import { DEV } from "./dev.js";

import { NotReadyError } from "./error.js";

import { sweepDormant, trimStaleDeps } from "./graph.js";

import { runHeap, deleteFromHeap, enqueueSub } from "./heap.js";

import { activeLanes, assignOrMergeLane, findLane } from "./lanes.js";

export { getOrCreateLane, mergeLanes, resolveLane } from "./lanes.js";

import { devCheckFlushStart, devCheckActiveOverrides, devCensusCompanions, devCheckQuiescent } from "./invariants.js";

const transitions = new Set;

const dirtyQueue = {
    eE: new Array(2e3).fill(undefined),
    tE: false,
    ln: 0,
    EE: 0
};

const zombieQueue = {
    eE: new Array(2e3).fill(undefined),
    tE: false,
    ln: 0,
    EE: 0
};

/** runHeap callback that discards a queued zombie recompute instead of running
 * it: unlink pure recompute entries; strip just the recompute bit from dirtied
 * height-adjust entries so their height work still happens. A zombie dirtied
 * through the lane channel (OPTIMISTIC_DIRTY — an override or a `latest()`
 * companion) runs instead (#3444): a zombie renders mainline until the commit
 * disposes it, and the lane's values ARE the mainline frame — the still-visible
 * branch a held `Show` is removing showed the old `latest(count)` beside the
 * new one outside. Its pass runs under the lane and its run lands on the
 * lane's effect queue, so a held lane defers it exactly as it defers every
 * other reader's. */ function cancelZombieRecompute(e) {
    if (e.oe & REACTIVE_OPTIMISTIC_DIRTY && !laneZombie(e)) return GlobalQueue.Ke(e);
    if (e.oe & REACTIVE_IN_HEAP_HEIGHT) e.oe &= -140; else {
        deleteFromHeap(e, zombieQueue);
        e.oe &= -132;
    }
}

/** A member of a parked LANE frame (CONFIG_LANE_FRAME on the owner whose pass
 * parked it, #3662). The #3444 exception is for transaction zombies; a lane
 * frame's member is retired by the run that carries the lane's values, so its
 * lane-channel recompute is cancelled with the rest — run, it republished the
 * retired frame under those values. Mainline writes still reach it (#3463). */ function laneZombie(e) {
    let t = e;
    while (t !== null && t.oe & REACTIVE_ZOMBIE) t = t._parent;
    return t !== null && (t.C & CONFIG_LANE_FRAME) !== 0;
}

let clock = 0;

let activeTransition = null;

let scheduled = false;

let halted = false;

let haltNotified = false;

let syncDepth = 0;

let projectionWriteActive = false;

/** > 0 while an action's generator body is on the stack (the synchronous
 * slice between yields). Maintained by action.ts around `it.next()`. */ let actionStepDepth = 0;

function enterActionStep() {
    actionStepDepth++;
}

function exitActionStep() {
    actionStepDepth--;
}

// Store property nodes whose last subscriber left while they carried state
// the backing cannot reconstruct — an optimistic override (overrides live on
// nodes, over a clone the setter discards) or a staged write. Releasing the
// slot then would drop the override: an optimistic store key read `0` the
// moment its only reader gated away while the action was live (S7). Swept
// after each flush — a node still without subs whose override and staging
// have resolved is released through the slot hook; one that regained a
// subscriber leaves the set.
const transientStoreNodes = new Set;

/** Slot hook's deferral: release this node when its carried state resolves. */ function deferSlotRelease(e) {
    transientStoreNodes.add(e);
}

function canUseSimpleSyncFlush(e) {
    const t = e.m;
    return transitions.size === 0 && activeLanes.size === 0 && e.ft.length === 0 && t.cn.length === 0 && t.A.length === 0 && t.ti.size === 0 && transientStoreNodes.size === 0 && pendingRearms.size === 0;
}

function sweepTransientStoreNodes() {
    if (transientStoreNodes.size === 0) return;
    for (const e of transientStoreNodes) {
        if (e.u !== null) {
            transientStoreNodes.delete(e);
            continue;
        }
        if (e._e !== NOT_PENDING) continue;
        if (e.o?.Fe !== undefined && e.o?.Fe !== NOT_PENDING) continue;
        // A live affects() mark keeps the node addressable: sweeping it would
        // detach the refcount from the slot (a fresh probe would upsert a new,
        // unmarked node for the same property).
                if (e.o?.t) continue;
        transientStoreNodes.delete(e);
        if (e.C & CONFIG_SLOT_NODE) slotUnobservedHook(e); else e.o?.Hn?.();
    }
}

/**
 * Toggles the dev-mode "must be inside a `<Loading>` boundary" enforcement
 * window. Only `render()` calls this — wrapping the initial mount so that a
 * top-level uncaught async read surfaces the diagnostic. Not part of the
 * user-facing API.
 *
 * @internal
 */ function enforceLoadingBoundary(e) {}

function setProjectionWriteActive(e) {
    projectionWriteActive = e;
}

/**
 * Ambient work IS a transaction: the global queue always carries one
 * current-transaction-shaped batch (`globalQueue._batch`). With no transition
 * active, registrations (pending commits, optimistic nodes, affects marks,
 * optimistic stores) land in a plain ambient batch that the plain flush
 * finalizes; when a transition initializes it adopts the ambient batch's
 * contents and `_batch` becomes the transition itself, so later registrations
 * land there directly — no per-field aliasing.
 */ function createBatch() {
    return {
        be: clock,
        Gn: [],
        le: new Map,
        cn: [],
        A: [],
        ti: new Set,
        pe: [],
        dt: {
            Tt: [ [], [] ],
            ft: []
        },
        Rn: false,
        In: new Set,
        Dn: null
    };
}

function mergeTransitionState(e, t) {
    t.Rn = e;
    e.pe.push(...t.pe);
    e.Te ||= t.Te;
    for (const n of activeLanes) if (n.we === t) n.we = e;
    if (t.cn.length) {
        // Move (don't copy): the global queue's batch may still be the outgoing
        // transition, and the adoption pass in initTransition would re-push its
        // contents into the target — duplicating every entry.
        e.cn.push(...t.cn);
        t.cn.length = 0;
    }
    if (t.A.length) {
        // Move (don't copy): the global queue's batch may still be the outgoing
        // transition, and the adoption pass in initTransition would re-push its
        // contents into the target — double-releasing every mark.
        e.A.push(...t.A);
        t.A.length = 0;
    }
    for (const n of t.ti) e.ti.add(n);
    for (const [n, i] of t.le) {
        let t = e.le.get(n);
        if (!t) e.le.set(n, t = new Set);
        for (const e of i) t.add(e);
    }
    for (const n of t.In) e.In.add(n);
    if (t.Dn) (e.Dn ??= []).push(...t.Dn);
}

/**
 * Flip-entanglement (#3164 follow-up): `until()` is a declaration of
 * relatedness — the predicate names the condition that confirms the awaiting
 * transaction. When the predicate settles truthy, every live foreign
 * transition whose staged write it read IS the confirming event by the
 * user's own definition, so it merges into the awaiting transaction and
 * reveals at the joint settle — the cross-primitive twin of the family fold
 * (a landing on an optimism-carrying family joins the retaining
 * transaction). Non-flipping updates never pass through here: falsy
 * evaluations don't entangle, so unrelated traffic on the watched sources
 * reveals freely on its own schedule.
 *
 * Runs inside the predicate's compute (pure phase) — the confirming
 * transition's stamps are still live and its commit decision hasn't run, so
 * the merge lands before any reveal. Only the tree-shaken graphs that call
 * `until()` retain this.
 */ function entangleConfirmingTransitions(e, t) {
    t = currentTransition(t);
    if (t.Rn === true) return;
    // The confirming evidence is a dep whose value is STAGED (pending,
    // uncommitted) at flip evaluation — committed deps are public already and
    // carry nothing to entangle. A staged dep lives in one of two carriers: a
    // stamped transition, or the queue's current batch (ambient registrations
    // don't stamp; "ambient work IS a transaction" — the batch is the
    // carrier). The entangle STEALS the carrier's staged cargo — its pending
    // nodes move (re-stamped) into the awaiting transaction and reveal at its
    // settle — but never the carrier itself: its async reporters, actions,
    // and stashes are its own future (a live stream's flight must not chain
    // the awaiting transaction to landings that haven't happened; a merged
    // reporter deadlocked exactly that way).
        let n = false;
    for (let i = e.Ie; i !== null; i = i.Ne) {
        const r = i.Oe;
        if (r._e !== NOT_PENDING) {
            const e = r.we;
            const i = e != null ? currentTransition(e) : null;
            // Skip the awaiting transaction's own cargo (t === target: a
            // fold-staged landing or a write the action itself issued — hold and
            // reveal already correct) and dead carriers. Ambient-batch staging
            // (t === null) must leave the batch NOW — it commits at this flush's
            // end, which would reveal the confirmation under the live optimism
            // it just confirmed.
                        const s = i === null ? currentBatch.Gn : i !== t && i.Rn !== true ? i.Gn : null;
            if (s !== null) n = stealEntangledCargo(s, t) || n;
        }
        if (i === e.Nn) break;
    }
    // The steal never activates the awaiting transaction: the predicate can
    // flip inside another transaction's finalize heap, and adopting the queue
    // batch there hands the stolen cargo to that finalize's commit sweep — a
    // premature reveal at a foreign settle. Subscribers that computed against
    // the pre-steal world were re-dirtied by the steal itself, so this
    // flush's applies paint the mid-hold view (committed for lane and stale
    // readers; a deriving reader is held with the cargo); the cargo commits
    // at the awaiting transaction's own settle.
}

/** Move a confirming carrier's staged nodes into the awaiting transaction:
 * re-stamp and arm the held-truth mask (override-covered nodes skip it —
 * the override already hides their staged value per A17, and is usually
 * the very optimism this confirmation settles); the mask's commit
 * registers the settle-side post-revert wake. The carrier's array is
 * emptied so its own commit point commits none of the stolen cargo.
 *
 * EFFECT subs of stolen nodes re-run: any that recomputed against the
 * staging BEFORE the steal (the carrier's landing notified them as a plain
 * write) hold a private result derived from the carrier's world — one
 * that the next paint gate (stash-point lane run, a foreign flush's
 * completion drain) would apply as the carrier's. Re-running them now that
 * the cargo is the awaiting transaction's re-routes each by its posture in
 * this same heap pass: a lane pass keeps committed (the mask), a stale
 * render effect keeps committed and registers for the reveal's replay
 * (stale-of-foreign), and a deriving user effect is served the truth and
 * held with the transaction (A29). PURE computeds are deliberately NOT
 * re-run: a staged value of theirs is itself stolen cargo — held with the
 * transaction, so ordinary readers already serve their committed value —
 * while re-running them would re-derive the OLD world and re-stage it over
 * the held truth. The reveal re-notifies (commitPendingNodes), which is
 * when they re-derive for real. */ function stealEntangledCargo(e, t) {
    if (e === t.Gn || e.length === 0) return false;
    for (let n = 0; n < e.length; n++) {
        const i = e[n];
        i.we = t;
        t.Gn.push(i);
        // Override-covered nodes stay silent AND unmasked: the override is the
        // display (A17 — its staging never notified, its revert will), so their
        // subs saw nothing and re-running one would break the silence with a
        // duplicate fire of an unchanged view.
                if (!hasActiveOverride(i)) {
            i.C |= CONFIG_HELD_TRUTH;
            for (let e = i.u; e !== null; e = e.Ae) {
                const t = e.ge;
                if (t.je && !(t.C & CONFIG_AUTHORITATIVE_READ)) enqueueSub(t);
            }
        }
    }
    e.length = 0;
    transitions.add(t);
    return true;
}

/** `schedule()` armed `scheduled` but withheld the microtask because a
 * projection draft was writing (see below). Consumed by `scheduleWithheld`. */ let withheld = false;

function schedule() {
    if (halted) {
        notifyHalted();
        return;
    }
    if (scheduled) return;
    scheduled = true;
    if (!syncDepth && !globalQueue.Jn) {
        // A projection draft's writes withhold the microtask: a flight's landing
        // drains them (asyncWrite's flush), and a drain BEFORE the landing tears
        // the pre- and post-await halves of the run apart (createProjection.async
        // "notifies only changed paths"). A draft write that no landing will
        // follow re-arms through scheduleWithheld (proj R37).
        withheld = projectionWriteActive;
        if (!withheld) queueMicrotask(flush);
    }
}

/** Arm the microtask `schedule()` withheld under projectionWriteActive. The
 * projection draft calls this after a write made outside its run with no
 * flight up (proj R37): nothing else will drain, and leaving `scheduled`
 * armed with no microtask strands the whole scheduler — every later
 * `schedule()` early-returns — until something calls `flush()` by hand.
 * (`withheld` was set in the same synchronous slice as this call, so the
 * syncDepth/_running gates it passed still hold; a stale mark left by a
 * landing's own flush arms at worst one no-op drain.) */ function scheduleWithheld() {
    if (withheld) {
        withheld = false;
        queueMicrotask(flush);
    }
}

/**
 * Parked transactions whose reporter set changed without a write. A
 * transaction completes when nothing live reports a flight it waits on, but
 * the flush only judges the ACTIVE transaction: a parked one is re-entered by
 * a stamped node's landing or an action's resume. A reporter that stops
 * counting for another reason — its loading boundary flipped to the fallback
 * (#3375), or it was disposed by ambient work (#3372) — is neither: the
 * pruning in `reporterBlocksSource` would drop it at the next check, but no
 * check comes, and the writes held with it stay staged. Such sites record the
 * transaction here (deduped: one idle pass per transaction, however many
 * reporters changed); the flush re-enters it on an otherwise idle pass, so
 * the re-evaluation adopts no unrelated ambient work.
 */ const wokenTransitions = [];

/** Wake every parked transaction — for a site that knows a reporter stopped
 * counting but not whose (a boundary reset). */ function wakeParked() {
    for (const e of transitions) wokenTransitions.includes(e) || wokenTransitions.push(e);
    schedule();
}

/**
 * Boundaries whose `on` dependencies notified this flush (#3540; a Set:
 * many notifications, one re-arm). The notification arrives inside a pass,
 * at the height of the `on` reads — before the readers the write put in
 * flight are registered — so the re-arm waits for the heap and runs before
 * the verdict (GlobalQueue.run → drainRearms), still under the write's
 * transaction: the release is seen by the verdict that follows, and the
 * staged fallback swap lands with the write's frame.
 */ const pendingRearms = new Set;

function queueRearm(e) {
    pendingRearms.add(e);
    schedule();
}

/** The drain (see pendingRearms): each boundary decides for itself, from
 * what is pending under it now, whether re-arming means its fallback or
 * nothing. Snapshot first: a re-arm can queue another — a write it makes
 * notifying an `on` that reads it — which is the next pass's. */ function drainRearms() {
    const e = Array.from(pendingRearms);
    pendingRearms.clear();
    for (let t = 0; t < e.length; t++) e[t].se();
}

/** Transactions a mainline tick has PROPOSED against (A34, #3494): a write to a
 * node one of them holds — the same value or another — is a second proposal
 * on a contested node, and the tick reveals with the hold ("both are
 * suggesting a value; if one finished before the other that would be odd").
 * Entered at the next flush's start, where the ambient batch is adopted;
 * never from the write itself, which left `activeTransition` set across the
 * caller's block and made creation after the write the transaction's (A29). */ const batchJoins = [];

/**
 * Permanently halts the reactive system. Called when a user error escapes
 * every boundary — app state is undefined at that point, so scheduling stops
 * entirely rather than limping along with a half-applied update.
 */
/**
 * The key a root owner carries its client error hook under (`render`'s
 * `onError`) — registered, so a runtime writes it with no import of the hook
 * module (core/error-hooks.ts) and no property mangling in the way. Defined
 * HERE, not there: a runtime that only writes the key must not retain the
 * hook machinery (pay-for-use).
 */ const ROOT_ERROR_HOOK = Symbol.for("solid-js/root-error-hook");

function haltReactivity(e) {
    if (halted) return;
    halted = true;
    let t = "[REACTIVITY_HALTED]";
    // Surface the cause here too: callers rethrow it, but a creation-time throw
    // unwinds through ancestor recomputes that convert it to status instead of
    // surfacing it (#2884), so the rethrow alone cannot guarantee visibility.
    // Where the platform has one, hand the cause to its uncaught-error channel
    // (`reportError` → `error` event → window.onerror / error monitoring): a
    // halt that only reaches console.error leaves a page that LOOKS alive with
    // nothing an app or its telemetry can act on (#3338 — an uncaught throw
    // during the hydration render). The rethrow may reach the top as well in
    // the non-swallowed cases; a duplicate report beats a silent one.
        const n = e !== undefined && globalThis.reportError;
    n || e === undefined ? console.error(t) : console.error(t, e);
    n && n(e);
}

// Logs on the first write after a halt so a frozen interaction is traceable.
function notifyHalted() {
    if (haltNotified) return;
    haltNotified = true;
    console.error("[REACTIVITY_HALTED]");
}

/** @internal Test/dev-reload hook. Revives scheduling after a halt. */ function resetErrorHalt() {
    halted = false;
    haltNotified = false;
}

// Identifies one child-traversal pass in `Queue.run` so a rescan after the
// child list shifts can tell "already run this pass" from "still pending".
let queueRunToken = 0;

class Queue {
    _parent=null;
    Tt=[ [], [] ];
    ft=[];
    ht=0;
    created=clock;
    addChild(e) {
        this.ft.push(e);
        e._parent = this;
    }
    removeChild(e) {
        const t = this.ft.indexOf(e);
        if (t >= 0) {
            this.ft.splice(t, 1);
            e._parent = null;
        }
    }
    notify(e, t, n, i) {
        if (this._parent) return this._parent.notify(e, t, n, i);
        return false;
    }
    run(e) {
        if (this.Tt[e - 1].length) {
            const t = this.Tt[e - 1];
            this.Tt[e - 1] = [];
            runQueue(t, e);
        }
        // Effects run here can dispose owners, and disposal removes queues from
        // this list — the running child itself, an earlier sibling, or several at
        // once. A plain index walk then skips whatever shifted into the cursor.
        // Stamping each child before it runs makes the pass idempotent, so a shift
        // can be recovered by rescanning from the front and every child still runs
        // exactly once. Children appended mid-pass carry a stale stamp and run,
        // matching the previous live-array behaviour.
                const t = this.ft;
        const n = ++queueRunToken;
        for (let i = 0; i < t.length; ) {
            const r = t[i];
            if (r.ht !== n) {
                r.ht = n;
                r.run?.(e);
                if (t[i] !== r) {
                    i = 0;
                    continue;
                }
            }
            i++;
        }
    }
    enqueue(e, t) {
        if (e) {
            // Route to lane's effect queue if we're in an optimistic recomputation
            if (currentOptimisticLane) {
                const n = findLane(currentOptimisticLane);
                n.dn[e - 1].push(t);
            } else {
                this.Tt[e - 1].push(t);
            }
        }
        schedule();
    }
    stashQueues(e) {
        e.Tt[0].push(...this.Tt[0]);
        e.Tt[1].push(...this.Tt[1]);
        this.Tt = [ [], [] ];
        for (let t = 0; t < this.ft.length; t++) {
            let n = this.ft[t];
            let i = e.ft[t];
            if (!i) {
                i = {
                    Tt: [ [], [] ],
                    ft: []
                };
                e.ft[t] = i;
            }
            n.stashQueues(i);
        }
    }
    restoreQueues(e) {
        this.Tt[0].push(...e.Tt[0]);
        this.Tt[1].push(...e.Tt[1]);
        for (let t = 0; t < e.ft.length; t++) {
            const n = e.ft[t];
            let i = this.ft[t];
            if (i) i.restoreQueues(n);
        }
    }
}

class GlobalQueue extends Queue {
    Jn=false;
    // The current transaction-shaped batch: a plain ambient batch while no
    // transition is active, the active transition itself after initTransition.
    m=createBatch();
    static Ke;
    static en;
    static Cn;
    static _t=null;
    // Store-side hook: drops a keyless affects() mark's identity scope when the
    // carrier node's last registration releases (wired by store.ts, mirroring
    // _clearOptimisticStore).
    static p=null;
    // affects()-side hooks (wired by affects.ts, mirroring _update): the mark
    // engine — count/register/release — lives with the feature. Every call site
    // is gated by state only that module creates, so `!` invocations are safe
    // once the gate holds.
    static G=null;
    static M=null;
    static N=null;
    // External-source bridge (wired by enableExternalSource(); null while no
    // config is active — including after _resetExternalSourceConfig()).
    static Zn=null;
    static jn=null;
    // Verdict-layer hooks (wired by verdict.ts when isPending()/latest() are
    // imported; null in apps that never use them). Call sites either guard for
    // null or sit behind state only the verdict layer can create (`!` is safe
    // there: `_pendingSignal`/`_latestValueComputed` are only ever assigned by
    // verdict.ts, and `pendingCheckActive`/`latestReadActive` only flip inside
    // isPending()/latest()).
    static Ve=null;
    static Ge=null;
    static We=null;
    static ri=null;
    static et=null;
    static nt=null;
    static rt=null;
    static On=null;
    static k=null;
    static Et=null;
    // Re-asks probes whose verdict was provisionally suppressed by a fresh read
    // of a held value, once the transaction gains an async blocker (#3028).
    static Nt=null;
    // Optimistic-engine hooks (wired by core/optimistic.ts via
    // installOptimisticEngine(), called from verdict.ts / createOptimistic /
    // createOptimisticStore — every module that can create optimistic state).
    // Call sites are gated by state only the engine can create: an
    // `_overrideValue` slot, a lane in `activeLanes`, an `_optimisticNodes`
    // entry, or a non-null `currentOptimisticLane`, so `!` invocations are safe
    // once the gate holds.
    static ot=null;
    static oi=null;
    static ai=null;
    static li=null;
    static si=null;
    /** Patch-channel optimistic drain (next/patch.ts): optimistic emissions
     * apply at lane-effect timing — visible in flight, unlike the regular
     * effect queues an action stashes. Injected; null when unused. */
    static ui=null;
    static lt=null;
    static it=null;
    /** Is the node routed through a LIVE lane (`resolveLane`)? read()'s reveal
     * carve-out asks before showing a foreign-held pending node's committed
     * value: a lane-derived flight's inputs are already revealed through the
     * lane (#3334). Gated on CONFIG_HAS_LANE, which only the engine sets. */
    static tt=null;
    static $n=null;
    static an=null;
    static Sn=null;
    /** Authoritative-view reader wakeup: installed by until() and refresh() before
     * their first read. Call sites are gated by CONFIG_AUTHORITATIVE_OBSERVED, which
     * only such a reader's carve-out read can set, so `!` invocations are safe once
     * the gate holds (#3303). */
    static zn=null;
    static Tn=null;
    /** A18 supersession (#3331): own-source truth `value` landed under an active
     * override. The engine decides whether the graph re-derives — the value
     * differs from the override and is not a stale (older-action) answer (mark
     * the node, demote its lane cascade, notify), or returns to it after an
     * earlier differing arrival (clear the mark, notify) — and owns the
     * authoritative-observer wake for a silent confirm. Installed with the
     * optimistic engine; only reachable on a node that has an override. */
    static ke=null;
    /** The flush's pre-verdict step (#3427): once the transaction's action
     * bodies have all ended and nothing authoritative is left in flight, the
     * engine supersedes every override still in force with the truth it
     * reverts to, so the graph re-derives from it now, as the transaction's
     * held work, instead of after the flights the overrides fed have landed.
     * True when it superseded something: the caller re-runs the heap ahead of
     * the verdict. The engine owns every gate (acted, actions drained, has
     * overrides, no store edits, no authoritative flight); null without it. */
    static Ei=null;
    /** read()'s value for a TRACKED reader of a superseded node (#3331): the
     * staged truth, unless the reader is a stale (render) reader of another
     * transaction — then the displayed override, as it keeps a foreign
     * transaction's committed value over its staged write. */
    /** A tracked read of an active override: the lane outside-view rule
     * (#3460) and the A18 supersession selection (#3331) — see optimistic.ts. */
    static ut=null;
    /** A lane pass's publish for a memo (#3479, lanes stage): the speculative
     * result becomes a DERIVED override, `_value` stays committed — see
     * optimistic.ts laneOverride. Set with the engine, which a lane implies. */
    static Me=null;
    /** Verdict-layer recompute in progress (companion creation, latest()/
     * isPending() pulls): never born held — see core.ts enterStagedRead. */
    static Xn=false;
    /** setSignal's authoritative (projection-write) landing on an override-
     * covered node (#3331 store twin): stage the truth for its transaction's
     * commit whatever its relation to the committed value — a landing equal to
     * committed still differs from the override — then _supersedeOverride
     * decides. Installed with the optimistic engine; only reachable on a node
     * that has an override — or, from `mapArray` once a lane pass has run over
     * the map, on a per-slot signal (never CONFIG_OPTIMISTIC): the slot arm
     * publishes a lane pass's write as the slot's derived override, lands a
     * plain pass's write over one, and is the plain `setSignal` otherwise (F1,
     * see optimistic.ts landOnOverride). */
    static st=null;
    static fi=null;
    flush() {
        if (this.Jn) return;
        // Fast drain: nothing in flight but plain pending commits — no dirty
        // computeds, no queued effects, no child queues, no transitions/lanes/
        // optimistic state. Commit and go; anything a commit hook schedules
        // (companion snaps, store folds notifying subs) re-arms `scheduled`
        // below and the outer drain loop takes the full spine next round.
                if (activeTransition === null && dirtyQueue.EE < dirtyQueue.ln && this.Tt[0].length === 0 && this.Tt[1].length === 0 && this.ft.length === 0 && !wokenTransitions.length && !batchJoins.length && // a join must drain in its own tick (#3519 review)
        canUseSimpleSyncFlush(this)) {
            this.Jn = true;
            try {
                // A28: companions of nodes written since the last flush mirror the
                // flushed world — re-synced inside the running window (the write is
                // "flushed" from here on).
                resyncUnflushedCompanions();
                // Sweep first: unobserved() pulls swept nodes out of the dirty heap,
                // so a dormant memo dirtied in the same tick is reclaimed instead of
                // recomputed (matching the old inline dispose-on-read counts).
                                sweepDormant();
                commitPendingNodes();
            } finally {
                this.Jn = false;
            }
            clock++;
            scheduled = dirtyQueue.EE >= dirtyQueue.ln || this.Tt[0].length !== 0 || this.Tt[1].length !== 0 || this.m.Gn.length !== 0;
            return;
        }
        this.Jn = true;
        resyncUnflushedCompanions();
 // A28, see above
                try {
            // The tick proposed against a hold (#3494): adopt its batch into it.
            // Inside the try: the adoption runs user comparators (the no-proposal
            // drop), and a throw there must not leave `_running` set.
            while (batchJoins.length) this.initTransition(batchJoins.pop());
            if (false) ;
            // Before runHeap for the same reason as the fast drain above; late
            // subscribers (an effect reading a swept memo this flush) revive it,
            // which is the pay-for-use contract.
                        sweepDormant();
            runHeap(dirtyQueue, GlobalQueue.Ke);
            // The action bodies are over: the overrides they leave in force
            // revert at this settle, and the correction is this transaction's
            // held work — re-derived here, under it, ahead of the verdict — not a
            // waterfall after the flights the overrides fed (#3427). After the
            // heap, not before: a synchronous body's own writes (a refresh that
            // puts an override node's source in flight) are judged applied.
                        if (activeTransition && GlobalQueue.Ei?.(activeTransition)) runHeap(dirtyQueue, GlobalQueue.Ke);
            // Re-arm the boundaries whose `on` notified this pass (pendingRearms):
            // after the heap — what the notification put in flight is registered —
            // and before the verdict, under the transaction that carried it. The
            // boundary releases its hold and stages its fallback swap with the
            // frame; the heap re-runs so its output pass is staged too, ahead of
            // the verdict that commits or parks it (#3540).
                        if (pendingRearms.size) {
                drainRearms();
                runHeap(dirtyQueue, GlobalQueue.Ke);
            }
            if (activeTransition) {
                // A boundary whose fallback read something not ready is judged before
                // the verdict, under the transaction (boundaries.ts `_judgeHeld`,
                // #3540): its output is pending on that read and holds the frame,
                // and only a sweep re-runs it — the commit sweep, after the verdict
                // its own read keeps parking. Ready, it stages `_disabled` false with
                // the frame; the heap re-runs so the output drops the read ahead of
                // the verdict.
                if (this.ft.length) {
                    checkBoundaryChildren(this, true);
                    if (dirtyQueue.EE >= dirtyQueue.ln) runHeap(dirtyQueue, GlobalQueue.Ke);
                }
                const e = transitionComplete(activeTransition);
                if (!e) {
                    const e = activeTransition;
                    // Parked: the unchanged passes' inputs are held; their tails stay (A30).
                                        heldTrims.length = 0;
                    // When the parking batch IS the transition, all of its writes commit
                    // only with it — every zombie recompute they queued would run against
                    // a world the zombie never displays (zombies render mainline until
                    // commit), so cancel them instead of running them. Only an ambient
                    // batch's mainline writes (the #2916 shape below) legitimately reach
                    // zombies here. Height-adjust entries still process normally: a
                    // dirtied one keeps its height flag and falls through to runHeap's
                    // adjustHeight path on the next pass of the bucket.
                                        runHeap(zombieQueue, this.m === e ? cancelZombieRecompute : GlobalQueue.Ke);
                    // Detach: the stashed transition keeps its batch; ambient work that
                    // follows lands in a fresh one. If the batch is already a separate
                    // ambient one — action done() restored activeTransition without
                    // adopting the batch, and an ordinary write landed there before
                    // the scheduled flush (#2916) — keep it: replacing it would strand
                    // its queued pending nodes with held _pendingValues forever.
                                        if (this.m === e) currentBatch = this.m = createBatch();
                    // Run lane effects immediately (before stashing) - lanes with no pending async
                                        if (activeLanes.size) {
                        GlobalQueue.si(EFFECT_RENDER);
                        GlobalQueue.si(EFFECT_USER);
                    }
                    this.stashQueues(e.dt);
                    clock++;
                    // A kept ambient batch may hold pending nodes (#2916): stay
                    // scheduled so the outer drain loop commits them via the plain
                    // flush path instead of leaving them until the next natural flush.
                                        scheduled = dirtyQueue.EE >= dirtyQueue.ln || this.m.Gn.length > 0;
                    reassignPendingTransition(e.Gn);
                    activeTransition = null;
                    finalizePureQueue(null, true);
                    return;
                }
                const t = activeTransition;
                const n = this.m;
                n !== t && n.Gn.push(...t.Gn);
                this.restoreQueues(t.dt);
                transitions.delete(t);
                activeTransition = null;
                reassignPendingTransition(n.Gn);
                finalizePureQueue(t);
                if (n === t) {
                    // Drop the dead Transition wrapper but keep its (drained) containers
                    // as the ambient batch — late registrations during finalization live
                    // there and must survive to the next flush.
                    const e = createBatch();
                    e.Gn = n.Gn;
                    e.cn = n.cn;
                    e.A = n.A;
                    e.ti = n.ti;
                    currentBatch = this.m = e;
                }
            } else {
                if (canUseSimpleSyncFlush(this)) {
                    commitPendingNodes();
                    if (dirtyQueue.EE >= dirtyQueue.ln) {
                        runHeap(dirtyQueue, GlobalQueue.Ke);
                        commitPendingNodes();
                    }
                } else {
                    // Parked transactions elsewhere: their owners' zombies render
                    // mainline until the commit that disposes them, so a mainline write
                    // reaches them here (#2916, #3463). Commit THIS flush's pending nodes
                    // first (#3546): a zombie whose owner commits now is disposed by that
                    // commit and never reruns — the same fate it has when no transaction
                    // is parked, where this queue is not run at all. Run before the
                    // commit, it reran and notified its owner through the previous
                    // pass's dependency tail (kept by A30 until the commit trims it),
                    // and the owner recomputed a second time with identical inputs,
                    // creating and disposing one more child per write. Only the zombies
                    // of actually parked owners survive the commit and rerun; the
                    // finalize's own commit picks up whatever those reruns stage.
                    if (transitions.size) {
                        commitPendingNodes();
                        runHeap(zombieQueue, GlobalQueue.Ke);
                    }
                    finalizePureQueue();
                }
            }
            clock++;
            // Check if finalization added items to the heap (from optimistic reversion).
            // Finalization may also have ENTERED a transaction (a commit hook, boundary
            // sweep or recompute wrote a node it owns): effects computed under it
            // since are its to apply, not this flush's — runEffect leaves them queued
            // and the next pass parks them with it (#3319). Everything computed
            // mainline applies now. A write the finalize staged in the ambient
            // batch with no subscriber to dirty (an optimistic store settle's
            // keyset bump under a reader that never tracks the key set) is work
            // too — the fast drain and the park exit already count it — so the
            // next round commits it and the woken re-entry below does not adopt
            // it into a parked transaction it never belonged to (matrix F6).
                        scheduled = dirtyQueue.EE >= dirtyQueue.ln || activeTransition !== null || this.m.Gn.length !== 0;
            // Run lane effects first (for ready lanes), then regular effects
                        activeLanes.size && GlobalQueue.si(EFFECT_RENDER);
            this.run(EFFECT_RENDER);
            activeLanes.size && GlobalQueue.si(EFFECT_USER);
            this.run(EFFECT_USER);
            if (false) ;
            if (false && !scheduled && !activeTransition && transitions.size === 0 && activeLanes.size === 0) ;
            if (false) ;
        } finally {
            // Re-enter a woken transaction (see wokenTransitions) only from an
            // idle pass: entering adopts the ambient batch, and staged or dirty
            // ambient work would be held behind flights it never read. `scheduled`
            // is that test here — after the park exit as well as the normal one:
            // it was recomputed from the heap and the ambient batch's staged nodes
            // this pass, every write since re-armed it, and optimistic ambient
            // nodes reverted with the finalize — so a wake in a pass with work
            // simply falls to the next. (A staged node with no subscriber — the
            // finalize's keyset bump under a length-only reader — used to be
            // missed here: the wake adopted it, stamped it, and a later ambient
            // write to the same node joined the parked transaction and never
            // reverted; matrix F6.) Entering re-arms
            // it itself; a dead (completed) wake is a bare return in
            // initTransition, and the loop moves on to the next.
            while (!scheduled && !activeTransition && wokenTransitions.length) this.initTransition(wokenTransitions.pop());
            this.Jn = false;
        }
    }
    notify(e, t, n, i) {
        // Only track async if the boundary is propagating STATUS_PENDING (not caught by boundary)
        if (t & STATUS_PENDING) {
            if (n & STATUS_PENDING) {
                // Callers pass either nothing or this node's own `_x._error`, so `??`
                // is exact (a null error falls back to the same null).
                const t = i ?? e.o?._;
                // A visibility-only mark notification (the affects() boundary
                // channel) updates display state on its way up but must be invisible
                // to completion accounting BY CONSTRUCTION: it never registers a
                // reporter and never counts toward the loading-boundary diagnostic.
                                if (t?.l) return true;
                if (t) {
                    // A reveal can discover a flight started in an earlier flush. Hold
                    // the staged writes with that reader (A15), even if the reader is
                    // new. Fresh/reset loading boundaries consume pending before it
                    // reaches here. A reader already parked in a transition must not
                    // open a second one.
                    if (!activeTransition && !e.we && currentBatch.Gn.length) this.initTransition();
                    if (activeTransition) {
                        const n = t.source;
                        let i = activeTransition.le.get(n);
                        if (!i) activeTransition.le.set(n, i = new Set);
                        const r = i.size;
                        i.add(e);
                        if (i.size !== r) {
                            schedule();
                            GlobalQueue.Nt?.(activeTransition);
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }
    initTransition(e) {
        if (e) {
            e = currentTransition(e);
            // A finished transaction cannot be re-entered: its state is committed
            // or reverted, so "rejoining" it (A26) is meaningless and re-activating
            // it spins the drain loop (#3140). The refusal must be a bare return —
            // redirecting the caller to a fresh batch would re-arm the loop with a
            // new transaction identity each pass. Stamps are cleared at commit, so
            // this is a belt for paths that hand over a chased-dead reference
            // (merged chains, async settles racing completion).
                        if (e.Rn === true || e === activeTransition) return;
        }
        if (!e && activeTransition && activeTransition.be === clock) return;
        if (!activeTransition) {
            activeTransition = e ?? createBatch();
        } else if (e) {
            const t = activeTransition;
            mergeTransitionState(e, t);
            // Effects the outgoing transaction parked belong to the surviving one
            // now: back onto the live queue, where this flush parks them under
            // `transition` or runs them at its completion. The outgoing stash is
            // never read again — the transaction is dead (#3310).
                        this.restoreQueues(t.dt);
            transitions.delete(t);
            activeTransition = e;
        }
        transitions.add(activeTransition);
        activeTransition.be = clock;
        const t = this.m;
        if (t !== activeTransition) {
            // Adopt the ambient batch into the transaction, then make the
            // transaction the batch so later registrations land there directly.
            // Pending and optimistic nodes are re-stamped as the transaction's;
            // marks don't hijack the node's _transition — a mark on a plain signal
            // must not entangle unrelated writes to it; the same rule holds one hop
            // downstream: propagation never queues pended subscribers as pending
            // nodes, see propagateAffectsMark, #2893.
            // Adopted outside a flush: the staging is still unflushed — the stamp
            // must not make it read as held-and-carried (CONFIG_ADOPTED_UNFLUSHED;
            // the carrying flush clears it in reassignPendingTransition).
            const e = this.Jn ? 0 : CONFIG_ADOPTED_UNFLUSHED;
            for (let n = 0; n < t.Gn.length; n++) {
                const i = t.Gn[n];
                // A tick that nets to the committed value proposed nothing (A34, #3494):
                // `setShow(false); setShow(true)` beside a write that opens a hold
                // left `show` staged at its own value, stamped, pending to the
                // verdict, and its next mainline write held by a flight it never
                // derived from. Unstage it here — its subscribers were walked at the
                // write and re-derive the same value. Writes only: a signal's staging
                // is always one, a computed's only under REACTIVE_MANUAL_WRITE
                // (`createSignal(fn)`'s setter, #3519 review) — otherwise it is its
                // pass's result, which may equal an uninitialized `undefined` (a
                // born-held first pass). `_equals: false` opts out. The unstaging is
                // the commit's own path (commitPendingNode with nothing staged): the
                // manual-write flag, companions and the rest are cleaned up as a
                // commit would, and the node is stamped nowhere. Unstamped
                // only: a node already a transaction's — arriving here as a parked
                // batch folds into a merge — carries a FLUSHED proposal a later
                // rewrite brought back to the committed value; it is held, not
                // proposal-free. Dropped, it kept the dead stamp, and the next write
                // to it queued under the merged transaction a value the commit then
                // skipped as another's (fuzzer latest-2 #1470, S3).
                                if (i.we === null && i._e !== NOT_PENDING && (!i.he || i.oe & REACTIVE_MANUAL_WRITE && !(i.h & STATUS_UNINITIALIZED)) && i.xe && i.xe(i.ce, i._e)) {
                    i._e = NOT_PENDING;
                    commitPendingNode(i);
                    continue;
                }
                i.we = activeTransition;
                i.C |= e;
                activeTransition.Gn.push(i);
            }
            for (let e = 0; e < t.cn.length; e++) {
                const n = t.cn[e];
                n.we = activeTransition;
                activeTransition.cn.push(n);
            }
            if (t.A.length) activeTransition.A.push(...t.A);
            for (const e of t.ti) activeTransition.ti.add(e);
            // Gated readers recorded against the ambient batch move with it: their
            // replay-at-commit now happens at the transaction's completion.
                        if (t.In.size) {
                for (const e of t.In) activeTransition.In.add(e);
                t.In.clear();
            }
            currentBatch = this.m = activeTransition;
        }
        for (const e of activeLanes) {
            if (!e.we) e.we = activeTransition;
        }
        // A transaction's ambient window is one flush. Entering must therefore
        // guarantee a flush: a transaction opened with no writes (an action whose
        // first statements only await) otherwise leaves activeTransition and the
        // adopted batch armed across the async gap, and the next unrelated work
        // to arrive — an optimistic store's authoritative landing, a plain async
        // settle — is adopted into a transaction it has nothing to do with
        // (#3141). The scheduled flush parks the incomplete transaction through
        // the normal machinery and detaches the ambient slots first.
                schedule();
    }
}

function queuePendingNode(e) {
    currentBatch.Gn.push(e);
    if (!globalQueue.Jn) markUnflushedStaged();
 // A28
}

// Sticky: flips true on the first refresh() ever (the only setter of
// REACTIVE_REASK) so the hot notification loop skips the per-subscriber flag
// clear entirely in apps that never refresh.
let reaskArmed = false;

/** §12d: bumped by every recompute and every new subscriber edge. A node's
 * staged-rewrite skip is sound only while NOTHING recomputed or linked since
 * its last notify — a mid-batch pull can clean a marked subscriber, and a
 * skipped re-write would leave it stale. */ let notifyEpoch = 0;

function bumpNotifyEpoch() {
    notifyEpoch++;
}

function armReaskClear() {
    reaskArmed = true;
}

/** Provenance of the work currently running (A18 supersession, #3331): the
 * invocation sequence of the action whose ambient window this is — set by
 * action() for each slice; the flush that ends the window clears it — or,
 * inside an async landing, the sequence captured when that flight was
 * registered (asyncWrite sets it for the landing's synchronous propagation,
 * so a sync recompute downstream of the landing — an optimistic wrapper over
 * the async source — derives under the flight's provenance, and flights it
 * registers inherit it). 0 is mainline: no action, always the current
 * question. An override stamps this at its write (`_overrideStamp`); an
 * answer whose flight an OLDER action issued is a stale question the user
 * has since changed — it holds silently to commit instead of superseding. A
 * slow source must not leak back in over a newer intent. Transactions merge,
 * so the transition object cannot say WHICH action asked; this can. */ let origin = 0;

function setOrigin(e) {
    const t = origin;
    origin = e;
    return t;
}

function insertSubs(e, t = false) {
    // §12d: stamp before walking — setSignal's staged-rewrite fast path skips
    // the next walk for this node while the epoch holds (marking is idempotent).
    e.vn = notifyEpoch;
    // Get source lane: prefer node's own lane over current context
    // This is important for isPending signals which need their own lane to flush immediately
    // Presence bits gate the optional-slot probes (see constants.ts): one
    // masked read of the always-present _config instead of missing-property
    // lookups in the hottest notify loop. Bits are sticky — the field read
    // stays authoritative when a bit is set.
        const n = e.C;
    const i = (n & CONFIG_HAS_LANE ? e.o?.me : undefined) || currentOptimisticLane;
    const r = (n & CONFIG_HAS_SNAPSHOT) !== 0 && e.o?.sn !== undefined;
    const s = reaskArmed;
    for (let n = e.u; n !== null; n = n.Ae) {
        const e = n.ge;
        // A value-change notification is a new question for the subscriber: any
        // pending re-ask mark (refresh) it carried is superseded.
                if (s) e.oe &= ~REACTIVE_REASK;
        // Missed-wake latch (#3037): this write is landing while the subscriber
        // is mid-recompute (a nested pull committing beneath its reads), and the
        // heap refuses RECOMPUTING nodes. A gen-current link means the pass
        // already validated this dep — the value it read is now stale — so latch
        // for recompute's tail to reschedule. Untouched links need no latch (the
        // pass either re-reads them fresh or trims them), and neither does the
        // tail link: it is the read IN FLIGHT — read() links before it pulls, so
        // this very commit is what that read returns.
                if (e.oe & REACTIVE_RECOMPUTING_DEPS && n.Be === e.Ye && n !== e.Nn) e.oe |= REACTIVE_MISSED_WAKE;
        if (r && e.C & CONFIG_IN_SNAPSHOT_SCOPE) {
            e.oe |= REACTIVE_SNAPSHOT_STALE;
            continue;
        }
        if (t && i) {
            e.oe |= REACTIVE_OPTIMISTIC_DIRTY;
            assignOrMergeLane(e, i);
        } else if (t) {
            e.oe |= REACTIVE_OPTIMISTIC_DIRTY;
            // No source lane means reversion - clear subscriber's lane so effects go to regular queue
                        if (e.o) e.o.me = undefined;
        }
        enqueueSub(e);
    }
}

function commitPendingNode(e) {
    const t = e;
    if (!t.he) {
        if (e._e !== NOT_PENDING) {
            e.ce = e._e;
            e._e = NOT_PENDING;
        }
        if (e.C & CONFIG_HAS_COMPANIONS) GlobalQueue.ri(e);
        return;
    }
    if (e._e !== NOT_PENDING) {
        e.ce = e._e;
        e._e = NOT_PENDING;
        // A node born held (recompute) initializes at this commit.
                t.h &= ~STATUS_UNINITIALIZED;
        // Set _modified for effects, but not for tracked effects (they handle their own scheduling)
                if (e.je && e.je !== EFFECT_TRACKED) e.Xe = true;
        // A quiet re-ask classification preserved through a held landing dies
        // with the value commit — the commit IS the reveal (#3178). Gated on the
        // staged value: status propagation queues pending nodes whose windows
        // are still OPEN (no staged value), and their live classification must
        // survive this sweep.
                if (e.o) e.o.Le = false;
    }
    // The committed hold is the first observable answer for a loading-window
    // node — the window closes here, not at compute time (#2990). Unconditional
    // store to an always-present computed slot.
        t.ve = false;
    t.oe &= ~REACTIVE_MANUAL_WRITE;
    // The children this commit publishes are the frame's now (#3404) — and so
    // are the dependencies of the pass that produced the value: the previous
    // frame's tail goes (A30, #3410; `recompute` left it for a staged pass). Only
    // after a clean pass: `_error` is cleared by a clean pass or by the node's
    // own landing (whose pass was clean), so a set `_error` means the last pass
    // threw, kept its full list, and `_depsTail` marks where it stopped.
        if (t.o?._ == null) trimStaleDeps(t);
    // A LANE frame still parked here (#3662) rode a hold that stashed the run
    // that would have retired it: this commit applies that run, so it goes too.
        t.C &= -68157441;
    if (!(t.h & STATUS_PENDING)) t.h &= ~STATUS_UNINITIALIZED;
    // A flight this commit leaves in the air (unobserved, or observed only by
    // a boundary) now has PUBLISHED inputs: its committed value is stale
    // against the frame. read()'s reveal carve-out keys on the mark (#3305).
     else e.C |= CONFIG_INPUTS_PUBLISHED;
    if (t.o != null && (t.o._n !== null || t.o.fn !== null)) GlobalQueue.en(t, false, true);
    if (e.C & CONFIG_HAS_COMPANIONS) GlobalQueue.ri(e);
}

// Store commit hook (INTERNALS-STORE-STATE.md §3): installed by the store
// module at init (same treeshakeable pattern as _resolveOptimistic /
// _clearOptimisticStores). Folds committed store-node values into their
// backing objects at the same moment pending values commit — the single
// mutation point of the owned-raw model.
let storeCommitHook = null;

function setStoreCommitHook(e) {
    storeCommitHook = e;
}

/** Held truth committed this finalize, awaiting its post-revert wake (see
 * finalizePureQueue): the commit IS the reveal, but subscribers must not
 * re-derive until the settling transaction's optimistic overrides have
 * reverted — a commit-time wake recomputes them in the window where
 * confirming truth is committed and the override still displays, a torn
 * frame no timeline contains. */ const heldRevealed = [];

/** Unchanged passes with a stale dependency tail, waiting on this flush's
 * verdict (A30, #3469). A pass that changed nothing replaced nothing either —
 * and cannot know at its own tail whether the flush that ran it will park:
 * parked, its inputs are held and the committed frame still derives from the
 * tail (`b() ? b() : a()` computed `1` from the held `b`, equal to the `1` it
 * had from `a` — with `a` trimmed, the mainline `a = 2` never reached it).
 * Trimmed when the flush commits; dropped with a park, the tail stays linked
 * until a committing pass trims it (one spurious recompute at most). */ const heldTrims = [];

function commitPendingNodes() {
    while (heldTrims.length) trimStaleDeps(heldTrims.pop());
    const e = currentBatch.Gn;
    for (let t = 0; t < e.length; t++) {
        const n = e[t];
        commitPendingNode(n);
        // The stamp dies with the commit (#3143) — symmetric with
        // resolveOptimisticNodes clearing optimistic stamps. A stamp outliving
        // its transaction let any later write (even a value-equal no-op, which
        // re-opens before the equality bail) resurrect the finished transaction;
        // a boundary flag rewritten every finalize pass then spun the drain loop
        // forever (#3140). The held-truth mark dies the same death — the commit
        // IS the reveal — but its wake defers to the post-revert pass: ordinary
        // subscribers were masked to committed all hold (some re-derived against
        // that old view and cached it), and commits are otherwise silent
        // (staging already notified), so without a wake they'd hold the old
        // world forever.
                n.we = null;
        if (n.C & CONFIG_HELD_TRUTH) {
            n.C &= ~CONFIG_HELD_TRUTH;
            heldRevealed.push(n);
        }
    }
    e.length = 0;
    storeCommitHook?.();
}

function finalizePureQueue(e = null, t = false) {
    // For incomplete transitions, skip pending resolution and optimistic reversion
    // For completing transitions or no-transition, resolve pending and revert optimistic
    const n = currentBatch;
    const i = !t;
    if (i) commitPendingNodes();
    // A parked finalize sweeps nothing: the boundaries' staged swaps are the
    // transaction's, and a boundary whose own output parks the verdict was
    // judged under it in run(), ahead of the verdict (#3540).
        if (!t && globalQueue.ft.length) checkBoundaryChildren(globalQueue);
    // Contested effects (#3322) re-derive from the world this commit just
    // produced. Ahead of the heap run — not the post-heap gated replay — so
    // the recompute and the effect phase land in this same pass and the value
    // the other transaction wrote into the slot is never published.
    // (No clear: a completed transition is never finalized again.)
    // A transaction whose settle reverts optimism re-derives them post-revert
    // instead (below, with the gated replay): between commitPendingNodes and
    // _resolveOptimistic the truth is committed but the overrides still
    // display, and a re-derive here would compose the two — the #3164 tear,
    // one window later. The slot meanwhile holds the frame that is on screen.
        const r = e?.Dn;
    const s = i && (e ?? n).cn.length !== 0;
    if (r && !s) for (const e of r) if (!(e.oe & REACTIVE_DISPOSED)) enqueueSub(e);
    const o = dirtyQueue.EE >= dirtyQueue.ln;
    if (o) runHeap(dirtyQueue, GlobalQueue.Ke);
    if (i) {
        // Boundary checks, commit hooks and recomputes can enter a transaction,
        // which adopts the batch this finalize was settling: nothing batch-derived
        // may be committed or reverted here — the entered transaction owns it now
        // (#3319). A completing transaction's OWN containers are a different
        // matter: when the ambient batch was separate from it (the #2916 shape),
        // adoption never touched them and it must still settle them; when the
        // batch WAS the completing transaction, adoption re-stamped its contents
        // into the entered one and there is nothing left to settle.
        if (currentBatch !== n) {
            if (e === null || e === n) return;
        } else if (o) commitPendingNodes();
        // The settling batch: the completing transaction's, or the ambient one.
                const t = e ?? n;
        // Optimistic reversion: a non-empty batch means _optimisticWrite ran,
        // which installed the engine's hooks.
                if (t.cn.length) GlobalQueue.oi(t.cn);
        if (r && s) {
            for (const e of r) if (!(e.oe & REACTIVE_DISPOSED)) enqueueSub(e);
            schedule();
        }
        // Replay entanglement: subs recorded by the read-time gate get rescheduled
        // so they re-run with the now-committed values visible. The ambient batch
        // replays too — laneReadsCommitted records readers whose committed-view
        // read hid a same-tick plain write that just committed above (#2963).
                if (t.In.size) {
            for (const e of t.In) {
                if (e.oe & REACTIVE_DISPOSED) continue;
                enqueueSub(e);
            }
            t.In.clear();
            // A completing transition keeps the outer flush loop alive by itself;
            // the ambient batch needs the re-arm or the replay sits in the heap
            // until the next unrelated write.
                        schedule();
        }
        // Declared motion ends with the transaction: settle (or plain flush end
        // for ambient marks) releases each registration's refcount. A non-empty
        // batch means registerAffectsMark ran, which installed the hook. Marks
        // held boundary display state through the visual channel, and their
        // release is the display-state update point — re-run the boundary sweep
        // (the earlier sweep above ran while the marks were still live).
                if (t.A.length) {
            GlobalQueue.G(t.A);
            if (globalQueue.ft.length) checkBoundaryChildren(globalQueue);
        }
        // A non-empty set means trackOptimisticStore ran, which installed the
        // hook; the hook iterates, clears, and schedules (keeping the loop out of
        // core lets esbuild shake it — rollup already folds the null guard). The
        // completing transition scopes the clear to its own layer keys (#2899).
                if (t.ti.size) GlobalQueue._t(t.ti, e);
        // Held-truth reveal wake (#3164), post-revert by construction: this
        // finalize committed confirming truth whose subscribers were masked all
        // hold — some re-derived against the committed view (the staging, or a
        // confirming carrier's landing, notified them as a plain write) and
        // cached it, and stash-restored applies may carry those torn values.
        // Waking and recomputing HERE — after _resolveOptimistic and the store
        // clears above — means every apply paints the settled view; a wake at
        // commit time would recompute them in the window where truth is
        // committed but the settling transaction's overrides still display.
                if (heldRevealed.length !== 0) {
            while (heldRevealed.length) insertSubs(heldRevealed.pop());
            if (dirtyQueue.EE >= dirtyQueue.ln) {
                runHeap(dirtyQueue, GlobalQueue.Ke);
                commitPendingNodes();
            }
        }
        sweepTransientStoreNodes();
        // Lanes only enter activeLanes through the engine's getOrCreateLane.
                if (activeLanes.size) GlobalQueue.li(e);
    }
}

/** The boundary sweep: the commit's (`_checkSources`), or — `held`, before
 * the verdict (#3540) — the one for a collecting boundary whose output is
 * pending on its fallback's read (`_judgeHeld`). */ function checkBoundaryChildren(e, t) {
    for (const n of e.ft) {
        t ? n.Re?.() : n.Ee?.();
        checkBoundaryChildren(n, t);
    }
}

/**
 * Count of live `affects()` registrations across the system (including
 * store-scope inherited marks). Gates the read-path mark check in `read()` so
 * graphs that never use the feature pay one integer compare.
 */ let activeAffectsMarks = 0;

/**
 * Counter mutation seam for the mark engine in affects.ts: an imported `let`
 * binding is read-only, and the read-path gate above must stay a plain module
 * variable so `read()` pays one integer compare, not a function call.
 *
 * @internal
 */ function shiftAffectsMarks(e) {
    activeAffectsMarks += e;
}

function reassignPendingTransition(e) {
    for (let t = 0; t < e.length; t++) {
        e[t].we = activeTransition;
        e[t].C &= ~CONFIG_ADOPTED_UNFLUSHED;
 // this flush carried it
        }
}

const globalQueue = new GlobalQueue;

// Hot-path mirror of `globalQueue._batch`: `queuePendingNode` runs once per
// staged write and `commitPendingNodes` once per flush, and the extra
// property hop through `_batch` was a measured instruction-count regression
// (CodSpeed update1to1, PR #2905). The field stays authoritative for
// cross-module readers; every `_batch` assignment updates both.
let currentBatch = globalQueue.m;

function flush(e) {
    // Inside an action body the drain is incoherent (#3333): the action's
    // writes are held by its transaction until it settles, so a drain can't
    // reveal them — and the loop below only exits once `activeTransition` is
    // null, so it would PARK the transaction mid-slice and every write after it
    // in the body would land as a plain, committed write. The reporter's
    // "leading flush()" workaround was exactly that leak. Prod: run `fn` if
    // given (its writes stay in the transaction) and skip the drain.
    if (actionStepDepth > 0) {
        return e ? e() : undefined;
    }
    if (e) {
        syncDepth++;
        try {
            return e();
        } finally {
            // Decrement even if the drain throws (a throwing effect): a leaked
            // syncDepth would stop `schedule()` from ever queuing a microtask again.
            try {
                flush();
            } finally {
                syncDepth--;
            }
        }
    }
    if (globalQueue.Jn) {
        return;
    }
    if (halted) return;
    // `flush()` is an explicit drain point, so it must also process an active
    // transition even if no microtask was scheduled for it yet.
        while (scheduled || activeTransition) {
        globalQueue.flush();
    }
    // Provenance ends with the drain: every ambient window (an action's first
    // slice, a landing's propagation) runs to this flush.
        origin = 0;
}

function runQueue(e, t) {
    for (let n = 0; n < e.length; n++) e[n](t);
}

/** Does `reporter` still hold the transaction waiting on `source` — live,
 * routed to no collecting loading boundary, and deriving from the source in
 * its current pass? The verdict's per-reporter test (sourceObserved), also
 * a boundary re-arm's (boundaries.ts `_rearm` runs before the verdict prunes
 * registrations that stopped counting). */ function reporterBlocksSource(e, t, n) {
    const i = e.oe;
    if (i & REACTIVE_DISPOSED) return false;
    // A zombie renders until the commit that disposes it (#3463): while its
    // removal is staged in a live transaction it is still on screen, and what
    // it displays must stay consistent with the frame — a held `Show`'s
    // `Details: 0` beside the lane's `Value: 1` otherwise. Its say is moot for
    // the verdict of the transaction that stages the removal (`verdict`): done,
    // and the commit disposes it; not done, and it stays parked regardless. A
    // zombie whose removal commits this flush (owner's pass not held) is dead.
    // The owner is stamped when the flush parks; held in this flush, its
    // staging transaction is the active one.
        if (i & REACTIVE_ZOMBIE) {
        let t = e;
        while (t && t.oe & REACTIVE_ZOMBIE) t = t._parent;
        let i = t && (t.we || (t.C & CONFIG_HELD_CHILDREN ? activeTransition : null));
        // A LANE frame's member (#3662) is displayed until its owner's run
        // applies, and the lane's transaction is what applies it (its completion
        // runs the lane's queue): moot for that verdict, live for every other.
                if (!i && t && t.C & CONFIG_LANE_FRAME && t.o?.me) i = findLane(t.o.me).we;
        if (!i || (i = currentTransition(i)).Rn === true || i === n) return false;
    }
    // Fallback-caught async holds nothing. A collecting loading boundary
    // consumes the notification, so a reader under a fallback never registers —
    // but a reader registered while its boundary showed content stays
    // registered when the boundary's `on` later changes and it flips to the
    // fallback. The reader is behind the fallback now; if nothing outside the
    // boundary consumes the flight, the hold is over (A33, ruled 2026-09-12, #3375).
        for (let t = e.T; t; t = t._parent) if (t.te & STATUS_PENDING && !t.q) return false;
    // "Still derives from the source" is a question about THIS pass's reads:
    // the deps up to `_depsTail`. Past it lie the committed frame's — kept
    // linked by A30 until the commit trims them (a staged pass, an errored
    // one). Reading them here made a reporter whose pass had stopped reading
    // the source (a gate closed in the same flush as the write) look live, and
    // the hold it kept was the commit that would have trimmed the dep that
    // kept it (spec O3, same-flush form; fuzzer #3446 P1 cases 21/79). A
    // trimmed list ends at `_depsTail`, so the bound is free there; a pass
    // that read nothing has a null tail and derives from nothing.
    // The registration is trusted: a pending mark rides only this pass's links
    // (notifyStatus skips the kept tail), so a registered reporter read the
    // source, or threw on it.
        if (e.o?.ue?.has(t)) return true;
    const r = e.Nn;
    for (let n = r === null ? null : e.Ie; n; n = n === r ? null : n.Ne) {
        let e = n.Oe;
        while (e) {
            // Or through a memo pending on the flight (#3494): a stale reader
            // served a held memo's committed value never turned pending itself, so
            // its only trace of the flight is the memo between them — `copy` of
            // `details`. Judged dead, its transaction released `count=1` beside
            // the `Copy: 0` it displays. `_pendingSources` is transitive, so one
            // hop covers any depth.
            if (e === t || e.De === t || e.o?.ue?.has(t)) return true;
            e = e.o?.kn;
        }
    }
    return !!(e.h & STATUS_PENDING && e.o?._ instanceof NotReadyError && e.o?._.source === t);
}

/**
 * Does a live reporter of `transition` still observe `source` pending? Dead
 * reporters (disposed, behind a fallback, no longer reading the source) are
 * pruned as they are found, and the source's entry with them. Shared by the
 * settle verdict and the lane's hold check (`waitingTransition`): a live
 * action parks its transaction without a verdict, so this prune is the only
 * one an optimistic lane whose last async reader unmounted mid-action ever
 * gets — without it the lane held on the dead reporter's registration until
 * the flight it no longer observed landed (#3426).
 */ function sourceObserved(e, t, n) {
    const i = e.le.get(t);
    let r = false;
    for (const e of i ?? []) {
        if (reporterBlocksSource(e, t, n)) return true;
        // A zombie the verdict passes over is kept, not pruned (#3463): moot for
        // this verdict, it still holds a lane's reveal while the transaction
        // stays parked on something else.
                if (n && e.oe & REACTIVE_ZOMBIE) r = true; else i.delete(e);
    }
    if (!r) e.le.delete(t);
    return false;
}

function transitionComplete(e) {
    if (e.Rn) return true;
    if (e.pe.length) {
        return false;
    }
    let t = true;
    for (const n of e.le.keys()) {
        // The source blocks while its OWN flight is up — the self entry in its
        // pending sources (added by notifyStatus's source path, with status;
        // retired by the landing and the supersede sweep, so it implies
        // STATUS_PENDING). `_error.source` is not that test: propagation from an
        // input that went pending later overwrites it with the input (#3375 — a
        // boundary-consumed load re-asked under a held derivation), and the
        // still-flying source read as settled, committing the writes it was
        // asked with ahead of its answer.
        // Not the self entry alone: a source whose own flight an upstream re-ask
        // superseded is still pending — on that re-ask (#3462). Its reader cannot
        // render until the chain lands, and the landing folds this transaction in
        // (enterWaiting). Judged complete instead, a re-entry between the two (a
        // repeated write to a held signal) committed the held writes beside the
        // reader's stale frame.
        if (sourceObserved(e, n, e) && n.o?.ue?.size) {
            t = false;
            break;
        }
    }
    // Override blockage lives with the engine (absent hook = "no optimistic
    // blockage"); the hook's loops over _optimisticNodes/_optimisticStores are
    // no-ops when the transition holds neither, so no pre-check is needed.
        if (t && GlobalQueue.ai?.(e)) t = false;
    t && (e.Rn = true);
    return t;
}

/** A fresh, unentered transaction (#3146): the optimistic store's truth
 * flight DECLARES an owned transaction instead of relying on whatever the
 * ambient adoption machinery stamped on its firewall. Activate it with
 * initTransition; it is a plain batch until then. */ function createTransition() {
    return createBatch();
}

function currentTransition(e) {
    while (e.Rn && typeof e.Rn === "object") e = e.Rn;
    return e;
}

/**
 * The live transition blocked on `source` — the one whose render reader
 * observed it pending (INV-3 records the observation in whichever transaction
 * was active when the reader was notified). The observation is a fact about
 * the node, so a hold check must not assume it was recorded in the transaction
 * it happens to hold — lanes merge across transactions (#2912), and a merged
 * root's transaction knows nothing of the async its members' transactions
 * observed (#3335). Null when nobody is waiting — a registration whose every
 * reporter has since died is nobody (#3426).
 */ function waitingTransition(e) {
    for (const t of transitions) if (sourceObserved(t, e)) return t;
    return null;
}

/** A landing enters EVERY parked transaction still waiting on `source`, folding
 * them into the active one (A15: each reveal that discovered the flight
 * completes at its landing). The fold used to happen as the waiters' stamped
 * readers recomputed under the landing — recompute re-entering an effect's
 * stamp — which also folded in writes those readers merely shared a hole
 * with (#3407); effects no longer re-enter, so the landing folds explicitly.
 * Live iteration is safe: a merge deletes the outgoing (active) entry and
 * re-adds the visited one. */ function enterWaiting(e) {
    for (const t of transitions) if (sourceObserved(t, e)) globalQueue.initTransition(t);
}

function runInTransition(e, t) {
    const n = activeTransition;
    try {
        activeTransition = currentTransition(e);
        return t();
    } finally {
        activeTransition = n;
    }
}

/** Run `fn` with `transition` as BOTH the ambient transaction and the
 * registration batch, restoring both after. runInTransition alone is not
 * enough for code that WRITES on behalf of a transaction from inside someone
 * else's window (optimistic replay re-arming a still-open action's edits
 * during a landing commit, #3123): registrations route through the queue's
 * batch pointer, and a bare activeTransition swap leaves them in the ambient
 * batch — a plain batch "completes" at the next flush and reverts optimistic
 * registrations that were supposed to live with the transaction.
 * initTransition is the wrong tool here: it MERGES the currently ambient
 * transaction into the target, entangling whatever the interrupted window
 * belonged to. */ function runAsTransitionBatch(e, t) {
    const n = activeTransition;
    const i = globalQueue.m;
    try {
        activeTransition = currentTransition(e);
        currentBatch = globalQueue.m = activeTransition;
        return t();
    } finally {
        activeTransition = n;
        currentBatch = globalQueue.m = i;
    }
}

export { GlobalQueue, Queue, ROOT_ERROR_HOOK, actionStepDepth, activeAffectsMarks, activeLanes, activeTransition, armReaskClear, assignOrMergeLane, batchJoins, bumpNotifyEpoch, clock, createTransition, currentTransition, deferSlotRelease, dirtyQueue, enforceLoadingBoundary, entangleConfirmingTransitions, enterActionStep, enterWaiting, exitActionStep, finalizePureQueue, findLane, flush, globalQueue, haltReactivity, hasActiveOverride, heldTrims, insertSubs, notifyEpoch, origin, pendingRearms, projectionWriteActive, queuePendingNode, queueRearm, reaskArmed, reporterBlocksSource, resetErrorHalt, runAsTransitionBatch, runInTransition, schedule, scheduleWithheld, setOrigin, setProjectionWriteActive, setStoreCommitHook, shiftAffectsMarks, sourceObserved, storeCommitHook, transitions, waitingTransition, wakeParked, wokenTransitions, zombieQueue };