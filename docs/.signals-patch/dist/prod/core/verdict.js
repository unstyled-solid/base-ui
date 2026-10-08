import { NOT_PENDING, REACTIVE_DISPOSED, REACTIVE_DIRTY, REACTIVE_CHECK, unwrapOverride, REACTIVE_RECOMPUTING_DEPS, STATUS_PENDING, STATUS_UNINITIALIZED, REACTIVE_OPTIMISTIC_DIRTY, REACTIVE_MANUAL_WRITE, CONFIG_OVERRIDE_SUPERSEDED, CONFIG_HAS_COMPANIONS, CONFIG_ADOPTED_UNFLUSHED, CONFIG_CHILD_COMPANIONS, STATUS_ERROR } from "./constants.js";

import { setSignal, visibleOverride, unflushedValue, context, markLateLinker, read, stale, hasActiveOverride, prepareComputed, tracking, ext, setLatestReadActive, setContextInternal, optimisticComputed, unflushed, unflushedCompanions, setPendingCheckActive, latestReadActive, optimisticSignal, pendingCheckActive } from "./core.js";

import { NotReadyError } from "./error.js";

import { link } from "./graph.js";

import { dispose } from "./owner.js";

import { insertIntoHeap, queueFor, enqueueSub } from "./heap.js";

import "./invariants.js";

import { readsHeldCommitted, assignOrMergeLane } from "./lanes.js";

import { installOptimisticEngine } from "./optimistic.js";

import { GlobalQueue, insertSubs, schedule, activeTransition, currentTransition, runAsTransitionBatch, activeAffectsMarks } from "./scheduler.js";

/**
 * The isPending()/latest() verdict layer, moved out of core.ts. Importing this
 * module installs the companion-maintenance hooks on GlobalQueue; apps that
 * never import isPending/latest never pay for any of it.
 */
// Companions (pending signals / latest shadows) are optimistic nodes: their
// writes go through the optimistic write path and their reversion rides the
// same lanes, so the verdict layer brings the engine with it.
installOptimisticEngine();

let pendingProbe = null;

/**
 * Probes whose verdict was suppressed by the fresh-read pairing rule while
 * the held write's fate was still undecided (see recordFreshRead /
 * wakeSuppressedProbes): held node → the wrapper computeds that probed it.
 * Entries die with the hold — the commit/revert snap clears them.
 */ const suppressedProbes = new Map;

/**
 * Get or create the pending signal for a node (lazy).
 * Used by isPending() to track pending state reactively.
 */
/** #3038: register a companion-carrying firewall child on its firewall's
 * companion set and arm the post-recompute snap (CONFIG_CHILD_COMPANIONS is
 * the one-load gate at the call sites). The snap then iterates exactly the
 * children someone asked verdicts of — O(companions) — never the full
 * `_child` chain, which carries one node per materialized leaf (the
 * O(all-leaves-ever-read)-per-update pathology). Entries live as long as the
 * store addresses the leaf — the unobserved sweep's `unlinkFirewallChild`
 * drops them (#3503); a store with no leaf-level isPending()/latest() reads
 * never allocates the set or pays the walk. */ function markFirewallChildCompanions(e) {
    const t = e.De;
    if (!t) return;
    t.C |= CONFIG_CHILD_COMPANIONS;
    (ext(t).Un ??= new Set).add(e);
}

function getPendingSignal(e) {
    let t = e.o?.Ze;
    if (!t) {
        // Start false, write true if pending - ensures reversion returns to false
        t = optimisticSignal(false, {
            ownedWrite: true
        });
        ext(e).Ze = t;
        e.C |= CONFIG_HAS_COMPANIONS;
        markFirewallChildCompanions(e);
        ext(t).kn = e;
        if (computePendingState(e)) backfillCompanion(e, t, true);
        joinUnflushedResync(e);
    }
    return t;
}

/**
 * A lazily created companion's first write mirrors state the owner already
 * carries — a held write, a pending verdict. The companion is created wherever
 * the first latest()/isPending() read happens to run, but the write belongs
 * to whatever HOLDS that state: written in the ambient window, the override
 * would register in the ambient batch and revert when that flush's round ends
 * — the shadow re-derived from the committed view, the verdict flipped false —
 * while the owner's hold was still on (#3336: A and B differing only in
 * whether a companion existed before the hold). A companion created lazily
 * answers as if it had always existed: its backfill is registered with the
 * owner's transaction and lives and reverts with it. A hold with no
 * transaction (a pending async, a same-flush staged write) is ambient and the
 * write stays ambient. (A28 (3), lifted from #3337.)
 */ function backfillCompanion(e, t, n) {
    const i = e.we;
    if (i) runAsTransitionBatch(i, () => setSignal(t, n)); else setSignal(t, n);
}

/** A28: a companion created while its source carries an UNFLUSHED write joins
 * the flush-start re-sync like a companion that existed at the write —
 * syncCompanions only reaches companions that exist at write time. Without
 * this the flush brings it current by a plain recompute instead of the
 * optimistic write: its readers are then staged under whatever transaction
 * the round entered (a memo over latest() of a held source was held with the
 * source, and its untracked reads answered the previous value until the hold
 * committed) rather than direct-committed as the optimistic view they are. */ function joinUnflushedResync(e) {
    if (unflushed(e)) unflushedCompanions.push(e);
}

/** The staged value the verdict channels answer for (A28): while a node
 * carries an unflushed write its `_pendingValue` is not yet part of any
 * flushed world, so the channels answer for the value the last flush left
 * staged (a held node's stash) or for nothing (NOT_PENDING). */ function flushedStaged(e) {
    if (!unflushed(e)) return e._e;
    // Ambient, or adopted before any flush (CONFIG_ADOPTED_UNFLUSHED): nothing
    // a flush carried is staged for it. A held rewrite: the stash.
        return e.we === null || e.C & CONFIG_ADOPTED_UNFLUSHED ? NOT_PENDING : e.o.bn;
}

function collectPendingSources(e) {
    if (!pendingProbe) return;
    pendingProbe.sources.add(e);
    const t = e.De || e;
    if (t !== e) pendingProbe.sources.add(t);
}

/**
 * Adds a node to the active isPending() probe without reading it. The store's
 * untracked-probe fallback (`witnessAffectsMark`) reaches this through
 * `GlobalQueue._witnessAffects` — its callers guard on `pendingCheckActive`,
 * which only flips inside `isPending()`, so the hook is always installed by
 * the time it can fire.
 */ function witnessAffects(e) {
    pendingProbe?.sources.add(e);
}

/**
 * The affects() coverage walk — the read half of the dedicated mark channel.
 * A node is covered by a live mark iff it carries one (`_affectsCount`) or
 * derives, through its CURRENT deps (hopping store firewalls), from a node
 * that does. Pull-based coverage means graph rewires, mid-window recomputes,
 * and probe-triggered recomputes can never strand or strip a mark — there is
 * nothing stored downstream to corrupt. Probe-created links
 * (`_pendingObserver`) are skipped so an `isPending` wrapper memo never
 * inherits the coverage it reports on.
 */ function markWalk(e, t) {
    if (e.o?.t) return true;
    // A real error outranks an inherited mark (A16/A24c): an errored node
    // answers probes with its error, not a coverage verdict, and coverage does
    // not flow through it — matching the rails' behavior, where propagation
    // stopped at errored nodes. A DIRECT mark on an errored node still reads
    // pending (the count check above), also matching.
        if (e.h & STATUS_ERROR) return false;
    if (t.has(e)) return false;
    t.add(e);
    const n = e.De;
    if (n && markWalk(n, t)) return true;
    // Mid-recompute (the clearStatus companion poke runs before
    // trimStaleDeps), only the validated prefix [_deps.._depsTail] is this
    // pass's dependency set — walking past it would read dropped deps and
    // latch a stale verdict on the companion.
        const i = e;
    const r = i.oe & REACTIVE_RECOMPUTING_DEPS ? i.Nn : undefined;
    if (r !== null) {
        for (let e = i.Ie ?? null; e !== null; e = e.Ne) {
            if (!e.ze && markWalk(e.Oe, t)) return true;
            if (e === r) break;
        }
    }
    return false;
}

function quietPending(e) {
    if (e.o?.ue) {
        for (const t of e.o.ue) if (!t.o?.Le) return false;
        return true;
    }
    return e.o?.Le ?? false;
}

// NOTE: a loadingValue node's open loading window (_loading) is verdict-quiet
// on purpose: commit #0 answers the question by declaration, so the window
// reads NOT pending — first-load affordances live in the value channel
// (null / skeleton provenance the author encoded), and isPending stays what
// it always was: refetch truth for an answered question. This keeps the
// verdict fully correlated with transition-class machinery and keeps server
// (always false) and client hydration trivially consistent.
function newQuestionInFlight(e) {
    return !!(e.h & STATUS_PENDING) && !(e.h & STATUS_UNINITIALIZED) && !quietPending(e);
}

function computePendingState(e) {
    const t = e;
    if (t.oe & REACTIVE_DISPOSED) return false;
    // Mark coverage is transitive by dep-graph reachability: a latest() shadow
    // reaches its owner (and a store leaf its firewall) through its own deps,
    // so the one walk covers direct marks, derivation, and companion chains.
    // Gated: apps with no live mark pay one integer compare.
        if (activeAffectsMarks !== 0 && markWalk(e, new Set)) return true;
    const n = e.De;
    if (e.o?.kn) {
        const t = e.o?.kn;
        const n = t.De || t;
        return newQuestionInFlight(n);
    }
    const i = flushedStaged(e);
    if (n && i !== NOT_PENDING && !hasActiveOverride(e)) {
        return !!(n.oe & REACTIVE_MANUAL_WRITE) || !n.o?.Ce && !(n.h & STATUS_PENDING) || !!(n.h & STATUS_PENDING) && quietPending(n);
    }
    // `!comp._loading`: a hold created while the loading window is still open is
    // the window's own landing in flight to its commit — verdict-quiet like the
    // rest of the window (the UNINITIALIZED check suppresses exactly this frame
    // for windowless first loads; born-committed nodes need their own gate, #2990).
    // A18 (d) for a body-end supersession (#3427): the truth at hand is the
    // COMMITTED value — nothing staged — yet the display still shows the
    // override; pending iff they differ, as for a staged arrival below.
        if (e.C & CONFIG_OVERRIDE_SUPERSEDED && e._e === NOT_PENDING && visibleOverride(e)) return !e.xe || !e.xe(e.ce, unwrapOverride(e.o?.Fe));
    // A28 (2): an unflushed write is not yet observable — the verdict answers
    // for the flushed staged value.
        if (i !== NOT_PENDING && !t.ve) {
        // A18 (d): under a displayed override the observable value is the
        // override, so the verdict is "the arrived truth differs from it" —
        // even before the node's first commit. The UNINITIALIZED suppression
        // below is A19 exception (1), "no observable value exists to be
        // non-final"; an override is one (a node whose first landing was held
        // by a reveal it never got to commit, then superseded under its
        // override, read false here).
        if (visibleOverride(e)) return !e.xe || !e.xe(i, unwrapOverride(e.o?.Fe));
        // A quiet re-ask's held landing still answers the same question: the
        // classification survives the landing (asyncWrite) and dies with the
        // commit (commitPendingNode) — verdict-quiet through the reveal, like
        // the loading window above (#3178).
        // A staged value equal to the committed one is no proposal (A34, #3494): the
        // observable value IS final (A19). The coalesced `setShow(false);
        // setShow(true)` read pending through the flush that carried it — and,
        // stamped into a hold that flush opened, until the hold settled.
                if (!(t.h & STATUS_UNINITIALIZED) && !t.o?.Le && (!e.xe || !e.xe(e.ce, i))) return true;
    }
    return newQuestionInFlight(t);
}

function syncCompanions(e, t) {
    if (e.o?.Ze) updatePendingSignal(e);
    if (e.o?.He) setSignal(e.o?.He, t);
}

function updatePendingSignal(e) {
    if (e.o?.Ze) {
        setSignal(e.o?.Ze, computePendingState(e));
    }
    if (e.o?.He) updatePendingSignal(e.o?.He);
}

function updateChildCompanions(e) {
    const t = e.o?.Un;
    if (t === undefined) return;
    for (const e of t) updatePendingSignal(e);
}

/**
 * Re-derive every verdict companion downstream of `el` (subs + firewall
 * children, dedup'd). The affects() channel's poke walk: registration and
 * re-ask flips use the live write path (companion setSignal — its own lane
 * lets the wake escape an incomplete transition's effect stash, #2887);
 * mark release passes `snap` because it runs inside queue finalization,
 * where companion writes must land committed (a setSignal there would open
 * a fresh override window that nothing settles).
 */ function repollDownstreamVerdicts(e, t = false) {
    const n = t ? snapCompanionsToState : updatePendingSignal;
    const i = new Set;
    const visit = e => {
        if (i.has(e)) return;
        i.add(e);
        if (e.o?.Ze || e.o?.He) n(e);
        for (let t = e.u; t !== null; t = t.Ae) visit(t.ge);
        for (let t = e.o?.i ?? null; t !== null; t = t.Ue) {
            visit(t);
        }
    };
    visit(e);
}

/**
 * The correction half of the provisional fresh-read suppression (see
 * collectPending): fired from the sanctioned async-registration site
 * (GlobalQueue.notify) when a transaction gains an in-flight async blocker.
 * Every probe that returned "not pending" purely because it read a held
 * value belonging to that transaction re-runs — its re-probe now sees the
 * live blocker through heldAwaitingAsync and lands the true verdict. The
 * wake mirrors a companion write's own notification (optimistic-dirty on the
 * companion's lane) so the corrected verdict commits and flushes immediately
 * instead of being held with the transaction it reports on.
 */ function wakeSuppressedProbes(e) {
    if (suppressedProbes.size === 0) return;
    let t = false;
    for (const [n, i] of suppressedProbes) {
        const r = n.we;
        const s = r ? currentTransition(r) : null;
        if (!s) {
            suppressedProbes.delete(n);
            continue;
        }
        if (s !== e) continue;
        suppressedProbes.delete(n);
        const o = n.o?.Ze?.o?.me;
        for (const e of i) {
            if (e.oe & REACTIVE_DISPOSED) continue;
            e.oe |= REACTIVE_OPTIMISTIC_DIRTY;
            if (o) assignOrMergeLane(e, o); else if (e.o !== null) e.o.me = undefined;
            enqueueSub(e);
            t = true;
        }
    }
    if (t) schedule();
}

function snapCompanionsToState(e) {
    suppressedProbes.size !== 0 && suppressedProbes.delete(e);
    const t = e.o?.Ze;
    if (t && (t.o?.Fe === undefined || t.o?.Fe === NOT_PENDING)) {
        const n = computePendingState(e);
        if (t.ce !== n || t._e !== NOT_PENDING) {
            t.ce = n;
            t._e = NOT_PENDING;
            insertSubs(t);
            schedule();
        }
    }
    const n = e.o?.He;
    if (n && !(n.oe & REACTIVE_DISPOSED)) {
        // A leaf whose firewall is disposed (the projection's teardown snaps its
        // companion-bearing leaves): the shadow's compute reads through a
        // disposed, possibly still-pending projection and would sit
        // NotReady/uninitialized forever — never derived, its backfilled override
        // dropped at the settle — against a leaf whose committed value differs
        // (INV-4 at the next quiescence; spec O5). It dies with its source;
        // getLatestValueComputed treats a disposed shadow as absent, so a later
        // read recreates it from the committed view.
        if (e.De?.oe & REACTIVE_DISPOSED) {
            dispose(n);
            return;
        }
        if ((n.o?.Fe === undefined || n.o?.Fe === NOT_PENDING) && n._e === NOT_PENDING && !Object.is(n.ce, e.ce) && !(n.oe & (REACTIVE_DIRTY | REACTIVE_CHECK))) {
            n.oe |= REACTIVE_DIRTY;
            insertIntoHeap(n, queueFor(n));
            insertSubs(n);
            schedule();
        }
        snapCompanionsToState(n);
    }
}

function getLatestValueComputed(e) {
    let t = e.o?.He;
    // A shadow disposed while unobserved (its gated reader unmounted at a
    // landing) is a corpse: sync writes into it equality-swallow against its
    // frozen _value, and a later read revives it via recompute — clearing
    // DISPOSED and re-deriving from the committed view, so the banner showed
    // the previous transition's target (#3041 follow-up). Treat it as absent;
    // recreation backfills from the in-flight write below.
        if (t && t.oe & REACTIVE_DISPOSED) t = undefined;
    if (!t) {
        const n = latestReadActive;
        setLatestReadActive(false);
        const i = pendingCheckActive;
        setPendingCheckActive(false);
        const r = context;
        setContextInternal(null);
 // Detach from owner so it isn't disposed with effects
                GlobalQueue.Xn = true;
        try {
            t = optimisticComputed(() => read(e), {
                ownedWrite: true
            });
        } finally {
            GlobalQueue.Xn = false;
        }
        ext(e).He = t;
        e.C |= CONFIG_HAS_COMPANIONS;
        markFirewallChildCompanions(e);
        ext(t).kn = e;
 // Parent-child lane relationship
        // Backfill an in-flight write (mirrors getPendingSignal): the companion is
        // created lazily, possibly after the write was processed — syncCompanions
        // only pushes into companions that already exist, so the first latest()
        // read inside a held transition showed the committed value (#3041).
                const s = flushedStaged(e);
        if (s !== NOT_PENDING && !hasActiveOverride(e)) backfillCompanion(e, t, s);
        joinUnflushedResync(e);
        setContextInternal(r);
        setPendingCheckActive(i);
        setLatestReadActive(n);
    }
    return t;
}

/** The latest()-mode read path, installed as GlobalQueue._latestRead. */
/** A7: the source has no visible value yet — judged on the OWNER, as read()
 * does: a store leaf behind a projection's firewall is a plain signal whose
 * `_value` is the seed (A25: a draft, never a value), and read() routes a
 * latest() read here before its own firewall/status logic. An override
 * displays a value even before the first commit (A17). */ function uninitializedSource(e) {
    const t = e.De || e;
    return !!(t.h & STATUS_UNINITIALIZED) && !hasActiveOverride(e);
}

function latestRead(e) {
    // A leaf of a DISPOSED projection has no flushed world left to mirror: a
    // shadow created for it now would read through the dead firewall, sit
    // NotReady/uninitialized forever, and no teardown would ever retire it (the
    // firewall's already ran — spec O5). Serve the committed value; create
    // nothing. (A read of a disposed node freezes at its last commit, #3024.)
    if (e.De?.oe & REACTIVE_DISPOSED) return e.ce;
    const t = getLatestValueComputed(e);
    const n = latestReadActive;
    setLatestReadActive(false);
    const i = visibleOverride(e) ? unwrapOverride(e.o?.Fe) : e.ce;
    // A28: an unflushed write is not the staged value latest() serves. The
    // shadow was written at the source's write to mirror it (A8) — consult it
    // only once a flush has carried the write.
        const r = unflushedValue(e);
    if (r !== NOT_PENDING) {
        // The reader derived from the flushed world because of an unflushed
        // write: it runs again in the flush that carries it (late linker) —
        // a pull may have cleared the mark the write's walk set.
        if (context !== null && context.oe & REACTIVE_RECOMPUTING_DEPS) markLateLinker(context);
        // Link the reader to the shadow so the flush that carries the write
        // updates it (the shadow itself already mirrors the write, A8).
                try {
            read(t);
        } catch {
            /* the flushed value answers */} finally {
            setLatestReadActive(n);
        }
        // An ambient write: the visible value (override or committed). A rewrite
        // of a held node: the staged value the last flush left.
                return e.we === null ? i : r;
    }
    let s;
    try {
        // No mid-tick pull: writes become visible at flush (A28), so before the
        // flush the shadow is exactly as current as the flushed world — the read
        // below serves it as is. (#2922's pull, which brought the shadow current
        // against the unflushed write, is superseded: `flush()` first to read
        // your own write.)
        s = read(t);
    } catch (t) {
        // A NotReady from the shadow of an INITIALIZED source means the shadow
        // is mid-flight: serve the visible (committed / override) value. An
        // uninitialized source has no visible value — latest() throws in every
        // scope rather than fabricate `undefined` for a `T` that excludes it
        // (A7; the unowned scope used to return undefined here).
        if (t instanceof NotReadyError && !uninitializedSource(e)) return i;
        throw t;
    } finally {
        setLatestReadActive(n);
    }
    if (t.h & STATUS_PENDING) {
        if (uninitializedSource(e)) throw new NotReadyError(e);
        return i;
    }
    // A render effect off the shadow's HELD lane sees the committed value and
    // re-runs at the release (#3460; lanes mirror transitions — see
    // readsHeldCommitted). Was: only a reader under ANOTHER lane; a mainline
    // reader, mounted or re-run by a sync write mid-hold, showed the
    // speculative value beside the lane's deferred readers.
        if (stale && context !== null && readsHeldCommitted(t, context)) return e.ce;
    // A shadow recomputed by the pull above (not at creation) holds its fresh
    // speculative value in _pendingValue; a contextless read() only surfaces
    // _value. Overrides stay authoritative (A17), and stale readers keep the
    // other transition's committed view, matching read()'s own selection.
        if (t._e !== NOT_PENDING && !hasActiveOverride(t) && !(stale && t.we && activeTransition !== t.we)) return t._e;
    return s;
}

/**
 * A latest() shadow that is uninitialized only because it was CREATED during
 * an active flight — its parent source already has a committed value, so
 * latest() serves that as the visible value and a tracked reader has
 * something to pair a verdict with (#3166). Same parent resolution as
 * computePendingState. The pending signal companion also carries
 * `_parentSource` but is a plain signal (no `_fn`) that never goes pending,
 * so the `_fn` check is belt-and-braces for this call site.
 */ function latestShadowWithInitializedParent(e) {
    if (typeof e.he !== "function") return false;
    const t = e.o?.kn;
    if (t === undefined) return false;
    const n = t.De || t;
    return !(n.h & STATUS_UNINITIALIZED);
}

/** The isPending()-probe read path, installed as GlobalQueue._pendingCheck. */ function pendingCheckRead(e, t, n, i) {
    setPendingCheckActive(false);
    if (typeof e.he === "function") {
        GlobalQueue.Xn = true;
        try {
            prepareComputed(e, true);
        } finally {
            GlobalQueue.Xn = false;
        }
    }
    const r = n.h;
    if (t && r & STATUS_PENDING && r & STATUS_UNINITIALIZED && 
    // The suspend-throw is for a genuinely-first-load source: the tracked
    // reader has nothing to pair a verdict with, so it parks on the source.
    // A latest() SHADOW created lazily mid-flight is born uninitialized even
    // though its parent has a committed value latest() will serve — throwing
    // here (swallowed by latestRead's fallback) dropped the shadow from the
    // probe, so a tracked latest(isPending()) probe created during a
    // new-question flight cached `false` for that whole flight (#3166).
    // Defer to the PARENT's initialization state and fall through to normal
    // collection; the plain pending throw downstream still links the reader.
    !latestShadowWithInitializedParent(n)) {
        if (tracking && e !== t) link(e, t);
        setPendingCheckActive(true);
        throw n.o?._;
    }
    collectPendingSources(e);
    if (i) collectPendingSources(i);
    setPendingCheckActive(true);
}

/**
 * A held node whose transaction still has an async question in flight. The
 * probe's fresh-read pairing rule (#2831 — "a reader that sees the fresh
 * value must not also be told it is pending") only applies to LANDED answers
 * awaiting reveal; while the answer is still computing, the fresh value the
 * reader saw is an input, and pending remains the truth for every reader
 * (#3028).
 */ function heldAwaitingAsync(e) {
    const t = e.we;
    const n = t ? currentTransition(t) : activeTransition;
    if (!n || n.Rn) return false;
    // A plain staged write (a signal/store leaf — no _fn) held while an action
    // is still running is an INPUT to a computation still in flight (#3078):
    // the pairing rule must not suppress the verdict, or a memo recomputing
    // mid-action reads the staged value, gets told "not pending", and
    // disagrees with a direct isPending() probe for the whole action window.
    // A computed's staged value is the opposite case — a LANDED answer
    // awaiting reveal — where the pairing rule stands even inside an open
    // action (#2831: a reader that saw the new value must not also see
    // pending); still-computing answers are covered by the reporter scan.
        if (n.pe.length && !e.he) return true;
    // The reporter scan runs for an unstamped node too (#3457): a node staged
    // AFTER the transaction opened is pushed straight into the transaction's
    // batch (queuePendingNode, once initTransition adopted it) and only gets
    // its `_transition` stamp when the flush stashes the hold, but its staged
    // value is already the transaction's, and `t` resolved to that very
    // transaction above. Gating on the stamp let a memo whose recompute read
    // a sync memo's fresh staged value mid-flush pair "not pending" with it
    // (A10) while the transaction's async source was still computing, so a
    // memo-wrapped isPending() read false where a direct probe read true.
        for (const [e, t] of n.le) {
        if (t.size && e.h & STATUS_PENDING && e.o?._?.source === e) return true;
    }
    return false;
}

function recordFreshRead(e, t) {
    if (pendingProbe !== null && e._e !== NOT_PENDING && t === e._e) {
        if (heldAwaitingAsync(e)) return;
        pendingProbe.freshReads.add(e);
    }
}

function applyReask(e, t) {
    const n = !!(e.h & STATUS_PENDING);
    const i = t && !(n && !e.o?.Le);
    const r = n && (e.o?.Le ?? false) !== i;
    // Allocation-free for the quiet case: false is the extension default.
        if (i) ext(e).Le = true; else if (e.o !== null) e.o.Le = false;
    return r;
}

function latest(e) {
    const t = latestReadActive;
    setLatestReadActive(true);
    try {
        return e();
    } finally {
        setLatestReadActive(t);
    }
}

function isPending(e) {
    const t = pendingCheckActive;
    const n = pendingProbe;
    setPendingCheckActive(true);
    const i = pendingProbe = {
        found: false,
        sources: new Set,
        freshReads: new Set,
        suppressed: []
    };
    const collectPending = () => {
        setPendingCheckActive(false);
        // Companion reads are mode-neutral plumbing: under an outer latest()
        // (isPending inside a latest window — #3104's memo shape) leaving latest
        // mode active dispatched these reads through latestRead, which built a
        // SHADOW OF THE PENDING SIGNAL itself. The next updatePendingSignal then
        // wrote that companion-on-companion from inside a recompute
        // (syncCompanions → setSignal on a shadow created without ownedWrite)
        // and halted dev with the owned-scope write guard. The creation paths
        // (getLatestValueComputed / getPendingSignal) already suspend both
        // modes; this read site must too.
                const e = latestReadActive;
        setLatestReadActive(false);
        try {
            i.sources.forEach(e => {
                if (read(getPendingSignal(e))) {
                    if (!i.freshReads.has(e)) i.found = true; else i.suppressed.push(e);
                }
            });
        } finally {
            setLatestReadActive(e);
            setPendingCheckActive(true);
        }
        // A "not pending" verdict that exists only because this reader saw the
        // fresh held value is provisional: if the write turns out NOT to commit
        // this flush (a downstream async pends and holds it), the suppression was
        // wrong and the wrapper must re-ask (#3028). Remember who to wake — the
        // async registration (GlobalQueue.notify) triggers wakeSuppressedProbes.
        // A TRACKED probe only (#3648): an `untrack(() => isPending(x))` inside a
        // memo asked for a one-shot answer and declined the re-run its tracked
        // form would get — enrolling its host anyway marked the memo OPT-dirty on
        // the companion's lane and re-ran it (a router `query()` refetched, its
        // first flight abandoned mid-air) for a verdict it never depended on.
                if (tracking && !i.found && i.suppressed.length && context && typeof context.he === "function") {
            for (const e of i.suppressed) {
                let t = suppressedProbes.get(e);
                if (!t) suppressedProbes.set(e, t = new Set);
                t.add(context);
            }
        }
    };
    try {
        e();
        collectPending();
        return i.found;
    } catch (e) {
        collectPending();
        if (e instanceof NotReadyError) {
            const t = !!(e.source?.h & STATUS_UNINITIALIZED);
            if (i.found && !t) return true;
            if (context && t) throw e;
        }
        return i.found;
    } finally {
        setPendingCheckActive(t);
        pendingProbe = n;
    }
}

// Hook installation (same late-binding pattern as GlobalQueue._update /
// _propagateAffects): core call sites fire these behind the same guards the
// direct calls used, so behavior is identical once this module loads.
GlobalQueue.Ve = syncCompanions;

GlobalQueue.Ge = updatePendingSignal;

GlobalQueue.We = updateChildCompanions;

GlobalQueue.ri = snapCompanionsToState;

GlobalQueue.et = latestRead;

GlobalQueue.nt = pendingCheckRead;

GlobalQueue.rt = recordFreshRead;

GlobalQueue.On = applyReask;

GlobalQueue.k = repollDownstreamVerdicts;

GlobalQueue.Et = witnessAffects;

GlobalQueue.Nt = wakeSuppressedProbes;

export { isPending, latest };