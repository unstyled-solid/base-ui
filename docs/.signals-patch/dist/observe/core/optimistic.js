import { NOT_PENDING, unwrapOverride, STATUS_UNINITIALIZED, REACTIVE_DIRTY, REACTIVE_CHECK, CONFIG_HAS_LANE, OVERRIDE_UNDEFINED, STATUS_PENDING, CONFIG_DERIVED_OVERRIDE, CONFIG_OPTIMISTIC, CONFIG_OVERRIDE_SUPERSEDED, EFFECT_RENDER, CONFIG_AUTHORITATIVE_OBSERVED, REACTIVE_MANUAL_WRITE, REACTIVE_OPTIMISTIC_DIRTY, LANE_RUN, EFFECT_USER } from "./constants.js";

import { attrHooks } from "./attribution-hooks.js";

import { ext, hasActiveOverride, stale, currentOptimisticLane, enterStagedRead, setSignal, latestReadActive } from "./core.js";

import { NotReadyError } from "./error.js";

import "./invariants.js";

import { resolveTransition, getOrCreateLane, activeLanes, signalLanes, laneHeld, findLane, resolveLane, readsHeldCommitted, assignOrMergeLane } from "./lanes.js";

import { GlobalQueue, activeTransition, globalQueue, origin, clock, insertSubs, schedule, sourceObserved, currentTransition, queuePendingNode } from "./scheduler.js";

/**
 * The optimistic write engine, moved out of core.ts/scheduler.ts. Everything
 * here serves only optimistic overrides — createOptimistic,
 * createOptimisticStore (and its store-node writes), and the verdict layer's
 * companions (which are optimistic nodes). Modules that can create optimistic
 * state call `installOptimisticEngine()` before creating it; apps that never
 * import one of those APIs never retain any of this.
 *
 * Core call sites fire the hooks behind guards on state only this module can
 * create (`_overrideValue !== undefined`, `currentOptimisticLane !== null`,
 * `_optimisticNodes.length`, `activeLanes.size`), so `!` invocations are safe
 * once the gate holds — the same late-binding contract as verdict.ts.
 */
/** The optimistic half of setSignal, fired when `_overrideValue !== undefined`. */ function optimisticWrite(e, n) {
    const i = e.o?.we !== NOT_PENDING;
    const r = i ? unwrapOverride(e.o?.we) : e.ce;
    if (typeof n === "function") n = n(r);
    const t = !!(e.S & STATUS_UNINITIALIZED) || 
    // A dirty node's _value is stale (its queued recompute hasn't run — e.g.
    // a latest() shadow marked by the previous landing's companion snap), so
    // equality against it must not swallow the write. Without this, a sync
    // push returning the shadow to that stale value was dropped, the snap
    // recompute then committed the parent's old value, and the banner showed
    // the previous transition's target (#3041 follow-up).
    !!((e.oe ?? 0) & (REACTIVE_DIRTY | REACTIVE_CHECK)) || !e.Fe || !e.Fe(r, n);
    if (!t) {
        // Same-value write with an active override still entangles the current
        // action's transition — the hold must outlast all overlapping actions —
        // and renews the override's PROVENANCE: the newer action re-asks the
        // question, so an older action's answer arriving later is stale to it
        // too (#3331; a same-value re-prediction otherwise let the first
        // action's slow source supersede and restart the downstream flight).
        if (i) {
            const n = resolveTransition(e);
            if (n && activeTransition !== n) globalQueue.initTransition(n);
            if (origin > e.o.yt) e.o.yt = origin;
        }
        return n;
    }
    if (i) {
        const n = resolveTransition(e);
        if (n) globalQueue.initTransition(n);
    } else {
        // No revert target is stashed: while the override is active every reader
        // sees it (A17), so authoritative arrivals commit silently into _value and
        // reverting is just dropping the override — _value is already correct.
        globalQueue.m.bn.push(e);
    }
    // Stamp ownership on the node (post-merge, so entangled writers share the
    // joint root). resolveTransition prefers this over the lane's _transition,
    // which a shared subscriber can merge across transactions (#2912).
        ext(e).Vt = activeTransition;
    ext(e).Pt = clock;
    // Provenance: the action asking. An answer an OLDER action's flight brings
    // back is a stale question and holds silently to commit (#3331).
        ext(e).yt = origin;
    const u = getOrCreateLane(e);
    ext(e).Ce = u;
    // A fresh override re-masks: whatever truth is staged, this write is the
    // value for the graph again until the source answers it (#3331).
        e.C = (e.C | CONFIG_HAS_LANE) & -8912897;
    // Literal undefined must not land raw: the slot doubles as the optimistic
    // brand, and erasing it makes the write invisible and routes follow-up
    // writes off the optimistic path into permanent commits (#2898).
        ext(e).we = n === undefined ? OVERRIDE_UNDEFINED : n;
    // syncCompanions only pokes _pendingSignal/_latestValueComputed — with
    // neither companion present the call is a guaranteed no-op.
        (e.o?.xe !== undefined || e.o?.Me !== undefined) && GlobalQueue.Le !== null && GlobalQueue.Le(e, n);
    if (e.Se !== undefined) e.Ge = clock;
 // §12e: computed-only slot
        insertSubs(e, true);
    schedule();
    return n;
}

/**
 * Lanes stage (#3479): a lane pass's publish for a memo. An optimistic
 * derivation is an override — the speculative result lives in the override
 * slot, `_value` stays the committed truth. The whole optimistic frame is then
 * in one place: the lane's readers and untracked reads see it (A17), a render
 * effect off the held lane sees the committed frame whole (readsHeldCommitted,
 * #3460) — the source's shadow AND its derivations — where a speculative
 * `_value` beside a committed shadow tore it. The node joins the
 * transaction's optimistic nodes on its first speculative publish; the revert
 * drops the override and re-derives it from the truth (a derived override has
 * no truth of its own — see resolveOptimisticNodes, endOptimism).
 */ function laneOverride(e, n, i) {
    // The wake-only channel (#3009, see recomputeLane): a plain write to a
    // latest()-tracked source rides a companion-sourced lane with no
    // transaction on either side only to wake the verdict companions. Nothing
    // is speculative — the pass commits directly, as any plain write does.
    i = findLane(i);
    if (!i.me && !activeTransition && i.xn.o?.$n !== undefined) {
        e.ce = n;
        return;
    }
    if (!hasActiveOverride(e)) {
        // It reverts with the lane's transaction (a landing runs outside any
        // flush, where the ambient batch would revert it at its own end); an
        // orphan lane's falls to the batch, adopted with it (initTransition) as a
        // write's is. No `_overrideOwner`: a derived override is a plain member,
        // its transaction its lane's (resolveTransition), and it merges lanes
        // through itself as any shared reader does (assignOrMergeLane). No
        // provenance stamp either: not an intent, any truth supersedes it.
        (i.me ? currentTransition(i.me) : globalQueue.m).bn.push(e);
    }
    // A lane pass's output is a derivation — also over a WRITTEN guess it
    // corrects (a `createOptimistic(fn)` re-derived from fresh upstream data):
    // the guess is gone, the slot holds fn's answer, and the revert promotes it
    // rather than dropping to a stale `_value` and re-asking downstream (the
    // next user write re-arms the guess: optimisticWrite clears the bit). No
    // `_overrideTime` stamp: that marks a user WRITE unflushed until the flush
    // that carries it (A28) and shields it from same-tick supersession — a pass's
    // result is neither (a pulled ownerless memo publishes outside any flush).
    // A fresh lane frame ends a supersession in force: the pass just dropped
    // the staged truth it pointed at (recompute, INV-11 corollary) — left set,
    // the flag served a `_value` never committed (fuzzer latest-1 #2481).
        e.C = (e.C | CONFIG_DERIVED_OVERRIDE) & ~CONFIG_OVERRIDE_SUPERSEDED;
    e.o.we = n === undefined ? OVERRIDE_UNDEFINED : n;
}

/**
 * transitionComplete's override blockage: a settling transition stays open
 * while one of its optimistic nodes holds an active override that is still
 * pending on real (non-affects-sentinel) async. A derived override's flight is
 * the lane's own work, never authoritative — it does not hold the settle.
 * Neither is a companion's (#3494): the `latest()` shadow backfilled under the
 * owner's transaction (A28 (3)) is an observation of the flight, and a
 * mainline `latest(details)` after the flight's last reader unmounted held the
 * released write until the orphaned request landed.
 */ function transitionBlocked(e) {
    for (let n = 0; n < e.bn.length; n++) {
        const i = e.bn[n];
        if (!(i.C & CONFIG_DERIVED_OVERRIDE) && i.o?.$n === undefined && hasActiveOverride(i) && "S" in i && i.S & STATUS_PENDING && i.o?._ instanceof NotReadyError) {
            return true;
        }
    }
    return false;
}

function resolveOptimisticNodes(e) {
    // Settlement writes below (snapCompanionsToState → updatePendingSignal-style
    // notifications) may push fresh optimistic nodes; only this batch settles
    // now, so iterate a fixed window and splice it out at the end.
    const n = e.length;
    for (let i = 0; i < n; i++) {
        const n = e[i];
        if (n.o !== null) n.o.Ce = undefined;
        // Revert is a pure drop: there is no revert target to commit —
        // override-covered authoritative values hold in _pendingValue and
        // elevate on their OWN transition's schedule (A18 as re-ruled 2026-07-07).
                if (!(n.S & STATUS_PENDING)) n.S &= ~STATUS_UNINITIALIZED;
        const r = n.o?.we;
        // A derived override (lanes stage, #3479) has no truth of its own: the
        // slot disarms — the memo is plain again — and the override PROMOTES to
        // `_value`. Not superseded, nothing it derives from told it otherwise
        // (a source override that reverts to a differing truth dirties it just
        // above — sources join this list before their derivations — and its
        // recompute then replaces the promotion), so by the graph's invariant
        // the override IS what a recompute from the truth yields. Re-deriving
        // instead re-asked an async member's flight and held the transaction on
        // it — a waterfall after the reveal.
                const t = n.C & CONFIG_DERIVED_OVERRIDE;
        ext(n).we = t && !(n.C & CONFIG_OPTIMISTIC) ? undefined : NOT_PENDING;
        // A superseded override's subscribers already re-derived from the truth
        // when it arrived (#3331) — the drop changes nothing they read. Everyone
        // else learns of the correction here: this drop IS their notification.
                const u = (n.C & CONFIG_OVERRIDE_SUPERSEDED) !== 0;
        n.C &= -8912897;
        if (!u && r !== NOT_PENDING && n.ce !== unwrapOverride(r)) {
            if (t) n.ce = unwrapOverride(r); else {
                // The guess lifts and what was beneath it differs: the screen
                // changes from the override to the committed value.
                if (attrHooks !== null) attrHooks.optimisticReverted(n, unwrapOverride(r), n.ce, "reverted");
                insertSubs(n, true);
            }
        }
        n.me = null;
        if (n.o !== null) n.o.Vt = null;
    }
    // Settlement checkpoint (#2838): companions caught in this batch (or owned
    // by a node in it) re-derive from committed state, so verdicts survive the
    // transition that produced them (A19 — pending is a property of the data).
        for (let i = 0; i < n; i++) {
        const n = e[i];
        if (n.o?.xe || n.o?.Me) GlobalQueue.Qn(n);
        const r = n.o?.$n;
        if (r && (r.o?.xe === n || r.o?.Me === n)) GlobalQueue.Qn(r);
    }
    e.splice(0, n);
}

/**
 * A18 supersession (#3331): the node's own source arrived with a value that
 * differs from its active override. "Knowing otherwise" ends the optimism for
 * the graph at once: the override stays only as the DISPLAYED value (untracked
 * reads, the applied frame) until the owning transaction commits, while
 * tracked readers see the staged truth and re-derive from it as that
 * transaction's held work — so async downstream restarts now, not at the
 * revert (no waterfall).
 *
 * The lane's job for this node is over: a lane applies an optimistic view
 * ahead of its transaction, and there is no optimistic view left — the
 * corrected cascade is plain transaction-held work (staged memos, effect runs
 * in the stashable queues). Demote the node and every cascade member that
 * rides this lane; the caller then notifies on the plain channel. Runners the
 * lane still holds for demoted effects (the optimistic frame that never got to
 * apply) defer to the regular queue in runEffect. In a lane merged with a
 * still-optimistic source, members shared with that source lose their lane
 * too and simply wait for the transaction — less optimistic, never torn.
 *
 * A later arrival EQUAL to the override (an earlier action's answer superseded
 * this one's; now this one's answer confirms it) ends the supersession: the
 * graph re-derives from the override, which is the truth again. Notifies the
 * subscribers in both cases. A plain matching confirmation (no supersession
 * in force) is A17-silent for ordinary subscribers and wakes only an
 * authoritative-view reader (until()'s predicate, refresh()'s waiter) that
 * observed this node past its override — "authoritative arrival equal to the
 * override" is exactly the acknowledgment it waits for (#3164, #3303). The
 * wake hook is installed by the setters of that bit; optional here because
 * the bit only implies the optimistic engine was consulted.
 */ function supersedeOverride(e, n) {
    const i = !e.Fe || !e.Fe(n, unwrapOverride(e.o.we));
    if (!i) {
        if (!(e.C & CONFIG_OVERRIDE_SUPERSEDED)) {
            if (e.C & CONFIG_AUTHORITATIVE_OBSERVED) GlobalQueue.Xt?.(e);
            return;
        }
        e.C &= ~CONFIG_OVERRIDE_SUPERSEDED;
    } else {
        // Provenance (#3331): an answer brought back by an OLDER action than the
        // one that wrote this override answers a question the user has since
        // changed. It is staged like any other landing and reveals if it is
        // still the truth when the transaction commits, but it does not move the
        // graph now — a slow source must not leak back in over a newer intent.
        // 0 is mainline (no action): always the current question.
        if (origin && origin < e.o.yt) return;
        e.C |= CONFIG_OVERRIDE_SUPERSEDED;
        // A fresh landing is staged in `_pendingValue` (landOnOverride) or is the
        // truth endOptimism read from it; the committed value with nothing staged
        // is the value the guess covered — the screen goes back, not forward.
                if (attrHooks !== null) attrHooks.optimisticReverted(e, unwrapOverride(e.o.we), n, e._e === NOT_PENDING && n === e.ce ? "reverted" : "superseded");
        const i = e.o?.Ce;
        if (i) {
            const n = findLane(i);
            const r = [ e ];
            while (r.length) {
                const e = r.pop();
                const i = e.o?.Ce;
                if (!i || findLane(i) !== n) continue;
                e.o.Ce = undefined;
                n.ke.delete(e);
                for (let n = e.u; n !== null; n = n.Pe) r.push(n.Ae);
            }
        }
    }
    if (attrHooks !== null) attrHooks.asyncEnd(e, undefined, n, true);
    insertSubs(e);
}

/**
 * The flush's pre-verdict step once the action bodies have ended (#3427).
 * The bodies were the optimism's justification; with them over, the
 * overrides still in force revert at the settle — unless the transaction is
 * still waiting on AUTHORITATIVE work: an override node's own source in
 * flight (`transitionBlocked` — that answer supersedes or confirms on
 * arrival), or a held flight that does not derive from an override (a plain
 * write's load the action asked for). Through that window the optimistic
 * world stands: a co-written "saving" flag stays rendered until the page it
 * covers lands (A17 — the optimistic world is one).
 *
 * The flights that DO derive from an override — routed through a live lane —
 * are obsolete: their input is the guess that is about to revert, and nobody
 * will read their answer. With nothing authoritative left, each override's
 * truth is already here (the staged value an A17-silent landing left, else
 * the committed value) and supersedes it now, exactly as an arriving
 * differing truth does (A18, #3331): the graph re-derives from it as this
 * transaction's held work — a lane-derived memo re-asks with the truth, its
 * other changed inputs included — and the transaction settles when THAT
 * lands. Before this the settle first waited for the obsolete flight,
 * revealed the obsolete optimistic frame when it landed, and only then
 * started the correction — a waterfall with a flash in the middle. Returns
 * whether it superseded anything (the caller re-runs the heap).
 *
 * The optimistic world is one, so it ends early only when all of it can. An
 * optimistic STORE edit cannot yet: its truth is the base layer under an
 * overlay that `_clearOptimisticStores` folds off at settlement, with no
 * tracked/displayed split — superseding its tracking signals alone would
 * re-derive readers against a still-displayed overlay (and a memo reading
 * both a signal and the store would ask a mixed question). A transaction
 * holding one keeps the settle-then-revert order throughout. Companions
 * (`_parentSource` set) are optimistic nodes too — a verdict written through
 * the optimistic path so it flushes ahead of the hold — but they answer for
 * their owner and snap at settlement (`_snapCompanions`), not here.
 */ function endOptimism(e) {
    if (!e.et || e.tt.length || !e.bn.length || e.En.size || transitionBlocked(e)) return false;
    for (const n of e.ae.keys()) if (sourceObserved(e, n, e) && n.o?.ue?.has(n) && !resolveLane(n)) return false;
    let n = false;
    for (const i of e.bn) {
        if (!hasActiveOverride(i) || i.o.$n || 
        // A derived override re-derives when its source's is superseded.
        i.C & (CONFIG_OVERRIDE_SUPERSEDED | CONFIG_DERIVED_OVERRIDE) || i.S & STATUS_UNINITIALIZED) continue;
        const e = i._e !== NOT_PENDING ? i._e : i.ce;
        if (!i.Fe || !i.Fe(e, unwrapOverride(i.o.we))) {
            supersedeOverride(i, e);
            // Judged by the mark, not the call: a provenance refusal (an older
            // action's window is still open) leaves the node for a later pass.
                        if (i.C & CONFIG_OVERRIDE_SUPERSEDED) n = true;
        }
    }
    return n;
}

/** read()'s value for a tracked reader of a superseded node: the truth —
 * staged, or already committed (a mainline landing commits at the head of
 * its flush, ahead of the heap run, and the override drops only at the
 * batch's end; in between the graph must not fall back to the override it
 * has left) — or the displayed override for a stale (render) reader of some
 * OTHER transaction, the same visibility a foreign transaction's staged
 * write has. */
/**
 * A tracked read of an active override (read()'s override arm). Lanes mirror
 * transitions (#3460): a render effect OFF the override's held lane — re-run
 * by a sync write, or mounted mid-hold — sees the committed value, as a stale
 * reader of a held transaction does, and publishes now; the lane's release
 * re-runs it (readsHeldCommitted). The lane defers the override's own readers'
 * runs, so the committed value is what is on screen — the override is the
 * visible value only once the lane has revealed (or, demoted at body-end,
 * A18). Otherwise the override displays, unless the node's own source
 * answered with a DIFFERENT value (A18 supersession, #3331): the optimism is
 * over for the graph — a tracked reader sees the staged truth — while the
 * override remains the DISPLAYED value for untracked reads (and for a stale
 * reader of some other transaction), and for a LANE pass (#3548, below).
 */ function overrideRead(e, n) {
    if (stale && readsHeldCommitted(e, n)) {
        // The committed frame of a node that has NEVER committed is nothing to
        // show (#3648): a memo whose first landing rode its lane (asyncWrite's
        // lane branch → a derived override) has no `_value` yet, and the outsider
        // was served a fabricated `undefined`. Uninitialized is loading, not
        // pending (A19 exception 1): the reader suspends, as it does on a
        // pending uninitialized source regardless of lane (#3276, laneSuspends).
        // readsHeldCommitted already queued its re-run on the lane's render
        // queue, which runs at the release — by then the commit has promoted the
        // override into `_value` (resolveOptimisticNodes), or the revert has
        // re-derived the node. Lane readers keep seeing the override (A17).
        if (e.S & STATUS_UNINITIALIZED) throw new NotReadyError(e);
        return e.ce;
    }
    if (!(e.C & CONFIG_OVERRIDE_SUPERSEDED)) return unwrapOverride(e.o?.we);
    // The owning transaction: `_overrideOwner` (#2912), not the stamp — an
    // override written directly inside an action never passes the adoption
    // loop that stamps `_transition`, and a body-end supersession (#3427)
    // stages nothing that would queue it. Without the owner a stale reader of
    // a body-ended node read the committed truth beside a display still
    // showing the override.
        const i = resolveTransition(e);
    // A lane pass composes the frame the lane applies AHEAD of the commit, so
    // it reads what is on screen — for a superseded node, the override (A18
    // (c): the applied screen keeps it until the transaction commits). The
    // supersession dropped this node's own lane; a LATER write's lane reaching
    // a shared reader (a list filtered on two rows' fields, #3548) otherwise
    // handed that pass the staged truth and applied it at once: one list
    // re-derived from the truth while its neighbours still displayed the
    // override — the same row rendered in two lanes. The reader is recorded
    // for replay at the owner's commit under laneReadsCommitted's contract:
    // the superseded drop notifies nobody (resolveOptimisticNodes assumes its
    // subscribers already derive from the truth), so the replay is what
    // brings this reader the revealed value.
        if (currentOptimisticLane !== null) {
        (i ?? globalQueue.m).Tt.add(n);
        return unwrapOverride(e.o?.we);
    }
    if (stale && i && activeTransition !== i) return unwrapOverride(e.o?.we);
    // A superseded read is a staged read (A29) whether the truth is staged or
    // already committed: the pass that derives from it derives from the
    // owning transaction's world (the override is still displayed by it).
        enterStagedRead(e, i);
    return e._e !== NOT_PENDING ? e._e : e.ce;
}

/**
 * An authoritative store landing on an override-covered node — a derived
 * optimistic store's own truth arriving over a tentative edit through the
 * projection-write channel (setSignal under projectionWriteActive). The
 * store twin of asyncWrite's override branch: the truth stages for its
 * transaction's commit whatever its relation to the committed value (a
 * landing equal to committed still differs from the override), companions
 * learn of it, and supersedeOverride decides the rest — A18 supersession with
 * action provenance, or an A17-silent confirmation (#3331). Before this the
 * landing took setSignal's plain path: a differing truth staged silently
 * under the override and the graph never moved until the commit.
 *
 * Slot arm (list-matrix F1): `mapArray`'s writes to its per-slot signals —
 * the row accessors of index mode, the index accessors of keyed mode; never
 * CONFIG_OPTIMISTIC, which is how the arm tells them from the store landings
 * above — once a lane pass has run over the map. The list's frame lives in
 * these writes as much as in the computed's result. Under a LANE pass the
 * write is the lane's frame, as the computed's result is (lanes stage,
 * `laneOverride`): the slot joins the lane carrying a DERIVED override —
 * `_value` stays the committed row, the lane's readers and untracked reads
 * see the override (A17), an off-lane render effect sees the committed frame
 * (#3460), the revert promotes or drops it with the lane's transaction. The
 * gate compares against the slot the pass publishes to (INV-11): the override
 * when armed, the committed row otherwise. A plain `setSignal` here staged
 * the write into the ACTION's transaction: `<For>` without `keyed` showed the
 * pre-action list for the whole action while the keyed modes showed the
 * optimistic one. A PLAIN pass over a slot still carrying the lane's frame —
 * the landing, the reversion, a mainline re-pass — is the truth arriving
 * under an override and takes the landing path below: a differing truth
 * supersedes, an equal one confirms and the revert promotes. Every pass
 * rewrites every slot whose value differs from the previous frame's (index
 * mode rewrites every surviving slot), so a slot the landing does NOT write
 * holds, by construction, what the truth yields. A slot with neither a lane
 * nor an override is the plain write.
 */ function landOnOverride(e, n) {
    if (!(e.C & CONFIG_OPTIMISTIC)) {
        const i = currentOptimisticLane;
        if (i === null) {
            if (!hasActiveOverride(e)) return setSignal(e, n);
        } else {
            // INV-11: the gate compares against the slot this pass publishes to —
            // the override when one is armed, the committed row otherwise.
            if (!e.Fe || !e.Fe(hasActiveOverride(e) ? unwrapOverride(e.o.we) : e.ce, n)) {
                // Membership before the publish: `laneOverride` files the slot under
                // the lane's transaction, and the read path routes a tracked reader
                // of a lane member through `overrideRead` (CONFIG_HAS_LANE).
                assignOrMergeLane(e, i);
                laneOverride(e, n, i);
                insertSubs(e, true);
                schedule();
            }
            return n;
        }
    }
    const i = e._e === NOT_PENDING ? e.ce : e._e;
    if (typeof n === "function") n = n(i);
    if (attrHooks !== null) attrHooks.write(e, i, n);
    if (e._e === NOT_PENDING) queuePendingNode(e);
    e._e = n;
    GlobalQueue.Le?.(e, n);
    supersedeOverride(e, n);
    schedule();
    return n;
}

function runQueue(e, n) {
    for (let i = 0; i < e.length; i++) e[i](n | LANE_RUN);
}

/**
 * Run effects from all lanes that are ready (no OBSERVED pending async — see
 * laneHeld).
 */ function runLaneEffects(e) {
    for (const n of activeLanes) {
        if (n.Mn || laneHeld(n)) continue;
        const i = n.It[e - 1];
        if (i.length) {
            n.It[e - 1] = [];
            runQueue(i, e);
        }
    }
    // Optimistic patch applications ride the same visibility slot as lane
    // effects (in-flight DOM updates); no-op unless patches registered.
        if (e === EFFECT_RENDER) GlobalQueue.Zn?.();
}

function cleanupCompletedLanes(e) {
    for (const n of activeLanes) {
        const i = e ? n.me === e : !n.me;
        if (!i) continue;
        if (!n.Mn) {
            if (n.It[0].length) runQueue(n.It[0], EFFECT_RENDER);
            if (n.It[1].length) runQueue(n.It[1], EFFECT_USER);
        }
        if (n.xn.o?.Ce === n) if (n.xn.o !== null) n.xn.o.Ce = undefined;
        n.ke.clear();
        n.It[0].length = 0;
        n.It[1].length = 0;
        activeLanes.delete(n);
        signalLanes.delete(n.xn);
    }
}

/** read()'s per-lane suspension test (pending-throw path, lane context). */ function laneSuspends(e) {
    // An UNINITIALIZED async source suspends regardless of lane (#3276): a
    // lane mismatch preserves an already-committed stale value, but a source
    // with no committed truth has nothing to serve — the cross-lane read
    // surfaced a fabricated `undefined` where latest() itself suspends
    // (latestRead rethrows NotReady for tracked uninitialized reads). Lives
    // here rather than read()'s throw path so the floor bundles don't pay:
    // this is only reachable under a lane, which implies the engine.
    if (e.S & STATUS_UNINITIALIZED) return true;
    // Per-lane suspension: only throw if in same lane as pending async
    // AND the node doesn't have an active WRITTEN override (overrides are the
    // visible value, downstream in the lane should read the override, not
    // throw). A derived override (#3479) is a previous speculative answer, not
    // an intent: the re-ask pending behind it suspends like any lane async.
        const n = e.o?.Ce;
    if (!n) return false;
    return findLane(n) === findLane(currentOptimisticLane) && (!hasActiveOverride(e) || (e.C & CONFIG_DERIVED_OVERRIDE) !== 0);
}

/**
 * read()'s reveal carve-out asks whether a pending node is routed through a
 * LIVE lane: a lane-derived flight's inputs are already revealed through the
 * lane (the override, or latest()'s fresh value), so a stale reader of another
 * transaction must hold on the flight rather than show the node's committed
 * value beside them (#3334). Exact, not sticky: `resolveLane` clears a lane
 * reference the engine has since retired, so a node that was once lane-routed
 * and is now pending under a plain hold is judged by that hold alone.
 */ function laneLive(e) {
    return resolveLane(e) !== undefined;
}

/**
 * read()'s entanglement gate: a reader recomputing under an optimistic lane
 * that reads a pending mid-transition write sees the committed value; the sub
 * is recorded for replay at commit.
 */ function gatedRead(e, n, i) {
    if (latestReadActive || e._e === NOT_PENDING || e.Se || n !== e && !(n.oe & REACTIVE_MANUAL_WRITE)) {
        return false;
    }
    activeTransition.Tt.add(i);
    return true;
}

/**
 * read()'s value selection under a lane: return the committed `_value` for
 * optimistic/lane-assigned signals, stale-mode reads, and pending owners.
 */ function laneReadsCommitted(e, n, i) {
    if (e.o?.we !== undefined || !!e.o?.Ce || !!(n.S & STATUS_PENDING)) {
        // The committed view hides a staged in-flight value that will promote
        // silently (commitPendingNode never re-notifies). gatedRead records plain
        // signals for replay at commit; async memos are excluded from it by the
        // `_fn` check and reach here instead — a lane-assigned source whose async
        // already settled (laneAsyncSettled keeps _optimisticLane) served its
        // committed value to a reader that never re-ran after the landing, so a
        // pending-gated branch stayed one value behind permanently (#3041
        // follow-up). Record the reader under the same replay contract — when
        // the commit will actually change what it read: a staged value equal to
        // the committed one (a lane recompute already published it, INV-11)
        // promotes to the same view, and a replay would only re-run effects
        // against an unchanged frame (#3330). An override-covered node's revert
        // notifies its own subscribers when the truth differs (resolveOptimistic
        // Nodes), so the reader is recorded only for the staged-vs-committed gap.
        if (e._e !== NOT_PENDING && e._e !== e.ce) (activeTransition ?? globalQueue.m).Tt.add(i);
        return true;
    }
    if (n === e && stale && i.o?.$n !== e) {
        // The committed view can hide a staged write (a lane member — even just
        // an isPending companion flip — puts the reader "under a lane"). The
        // staged value commits with no re-delivery (commitPendingNode never
        // re-notifies), so record the reader for replay at commit — the same
        // contract gatedRead provides (#2963). gatedRead itself only covers
        // signal reads where the reading computed differs from the source; the
        // owner === el memo/self read lands here instead. With a transaction
        // active the staged value promotes silently at ITS landing, so record
        // into the transaction (#3041 follow-up: a pending-gated branch that
        // first read its async source during the landing flush stayed one value
        // behind permanently); with none, into the ambient batch.
        if (e._e !== NOT_PENDING) (activeTransition ?? globalQueue.m).Tt.add(i);
        return true;
    }
    return false;
}

/**
 * recompute()'s lane posture: resolve the node's own lane (own=true), or adopt
 * a dependency's optimistic lane (own=false — parent-deeper-than-owned-child
 * can run before its OPT-dirty child propagates).
 */ function recomputeLane(e, n) {
    if (n) {
        const n = resolveLane(e);
        if (!n) return null;
        // Wake-only lane demotion (#3009): a plain write to a latest()-tracked
        // source rides the optimistic channel only to wake verdict companions —
        // its lane is sourced by the companion shadow (_parentSource set) and owns
        // no transaction. When such a node is pulled mid-tick by a latest()/
        // isPending() probe, lane posture would direct-commit _value, leaking the
        // queued write into committed reads before the flush. Return `false` so
        // recompute() runs plain: the value stages and commits with the flush.
        // (el's own override slot excludes companions themselves; a lane merged
        // into a real optimistic lane resolves to a non-companion source.)
                if (!globalQueue.$t && !activeTransition && !n.me && n.xn.o?.$n !== undefined && e.o?.we === undefined) {
            if (e.o !== null) e.o.Ce = undefined;
            return false;
        }
        return n;
    }
    for (let n = e.Ee; n; n = n.Ie) {
        const i = n.De;
        if (i.oe & REACTIVE_OPTIMISTIC_DIRTY) {
            const n = resolveLane(i);
            if (n) {
                e.oe |= REACTIVE_OPTIMISTIC_DIRTY;
                assignOrMergeLane(e, n);
                return n;
            }
        }
    }
    return null;
}

/** recompute()'s catch path: record the pending async as the current lane's
 * (ownership — laneHeld decides the hold). The lane source's isPending
 * companion is NOT refreshed here: its verdict never read _pendingAsync, and
 * the source's own write/commit/settlement paths keep it current. */ function laneAsyncPending(e) {
    const n = findLane(currentOptimisticLane);
    if (n.xn !== e) {
        n.ke.add(e);
        ext(e).Ce = n;
        e.C |= CONFIG_HAS_LANE;
    }
}

/** recompute()'s success path: the node's async settled, clear it from its lane. */ function laneAsyncSettled(e) {
    const n = resolveLane(e);
    if (n) {
        n.ke.delete(e);
    }
}

function trackOptimisticStore(e) {
    // After initTransition, globalQueue._batch IS activeTransition (same reference)
    globalQueue.m.En.add(e);
    schedule();
}

/**
 * Installs the engine's hooks. Idempotent; called by every module that can
 * create optimistic state (verdict.ts at module top level, createOptimistic
 * and createOptimisticStore at first call) BEFORE any optimistic node exists.
 */ function installOptimisticEngine() {
    if (GlobalQueue.Ln !== null) return;
    GlobalQueue.Ln = optimisticWrite;
    GlobalQueue.Bn = resolveOptimisticNodes;
    GlobalQueue.Yn = transitionBlocked;
    GlobalQueue.Wn = cleanupCompletedLanes;
    GlobalQueue.Kn = runLaneEffects;
    GlobalQueue.Qe = supersedeOverride;
    GlobalQueue.zn = endOptimism;
    GlobalQueue.Pn = overrideRead;
    GlobalQueue.je = laneOverride;
    GlobalQueue.Vn = landOnOverride;
    GlobalQueue.Fn = gatedRead;
    GlobalQueue.Dn = laneSuspends;
    GlobalQueue.Gn = laneLive;
    GlobalQueue.An = laneReadsCommitted;
    GlobalQueue._t = recomputeLane;
    GlobalQueue.Ot = laneAsyncPending;
    GlobalQueue.St = laneAsyncSettled;
    GlobalQueue.Jn = trackOptimisticStore;
}

export { installOptimisticEngine };