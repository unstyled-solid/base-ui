import { unwrapOverride, $REFRESH, CONFIG_CHILDREN_FORBIDDEN, CONFIG_OWNED_WRITE, NOT_PENDING, CONFIG_OPTIMISTIC, STATUS_UNINITIALIZED, STATUS_ERROR, REACTIVE_RECOMPUTING_DEPS, CONFIG_OVERRIDE_SUPERSEDED, CONFIG_AUTHORITATIVE_READ } from "../../core/constants.js";

import { setSlotUnobserved, setSignal, isEqual, rederiveHeld, suppressComputedRecompute, read, hasActiveOverride, pendingCheckActive, latestReadActive, readNodeFast, READ_SLOW, signal, unlinkFirewallChild, ext, visibleOverride, ownsHold, serve, setLatestReadActive, prepareComputed, slotSignal, stale, recordStaleReplay, enterStagedRead, context, currentOptimisticLane, heldDerivation } from "../../core/core.js";

import { projectionWriteActive, setProjectionWriteActive, activeTransition, schedule, currentTransition, deferSlotRelease, setStoreCommitHook } from "../../core/scheduler.js";

import "../../core/invariants.js";

import { getObserver, getOwner } from "../../core/owner.js";

import { $TARGET, isWrappable, markRawIngest, $PROXY, getWriteOverride, markRawOne, $RECORD, witnessAffectsMark, $TRACK, affectsScopesLive, inheritAffectsMarks, $AFFECTS, rawValuesUsed, isRawValue, setNextAffectsNodeResolver } from "../store.js";

import { lookupTarget, optHooks, storeNextLookup, $OWNER, isOwned, markDescendants, devAssertNeverUserMutation } from "./target.js";

/**
 * Store rewrite — increment 2: plain deep stores with pending-backing writes.
 * Contract: INTERNALS-STORE-STATE.md.
 *
 * Write model (RUL-1, unified): the first draft write to a target creates its
 * pending backing `pb` — a descriptor-preserving CoW clone. The draft mutates
 * `pb` natively (array methods, defineProperty, deletes all just work).
 * Reads: drafts and owner-context reads see `pb`; context-free reads see the
 * committed `b` until flush. At flush commit (core's storeCommitHook), each
 * written target folds: diff old `b` vs new backing notifies exactly the
 * changed keys through equality-gated nodes, then `b` becomes the new
 * backing. Setter return-value replacement parks the UNOWNED incoming object
 * in `pb` — adoption: fold swaps it in, ownership resets (2026-08-16c).
 *
 * Nodes carry no pending state — they are pure subscription points; `pb` is
 * the pending home. Laziness: a written target with no subscriptions folds as
 * a pointer swap with zero node work.
 */
// ---------------------------------------------------------------------------
// wrap / dedupe
/** Pre-shaped constructor for OBJECT proxy targets: V8 tips a bare `{}` into
 * dictionary mode once ~19 named properties are assigned onto it (the #3044
 * `ovl`/`del` fields crossed that line — every trap's field read became a
 * hash lookup, a 15% deep-dbmon tick regression). Declaring every field in a
 * constructor pre-allocates in-object slots so the map stays fast, with
 * headroom for future fields. The prototype is reset to `Object.prototype`
 * so proxy-forwarded semantics (getPrototypeOf, constructor) are exactly a
 * plain object's. Array targets keep the bare-`[]` path — they must carry
 * the array exotic class for `Array.isArray(proxy)`.
 *
 * ARRAY SHAPE RULE: arrays normalize their named properties to dictionary
 * mode as the count grows (V8 13.x: counts ≡ 0 mod 3 from 18 up), so the
 * target's named field count is capped at 20 — any future write-side state
 * beyond `wk` must ride an extension object (see target.ts), never new
 * named fields here. */
function TargetShape() {
    this.v = undefined;
    this.ch = undefined;
    this.pb = undefined;
    this.n = undefined;
    this.h = undefined;
    this.k = undefined;
    this.dk = undefined;
    this.u = undefined;
    this.pk = undefined;
    this.px = undefined;
    this.d = undefined;
    this.a = undefined;
    this.sc = undefined;
    this.kc = undefined;
    this.nc = undefined;
    this.ab = undefined;
    this.fam = undefined;
    this.s = undefined;
    this.ovl = undefined;
    this.del = undefined;
    this.wk = undefined;
    this.hv = undefined;
    this.ht = undefined;
}

TargetShape.prototype = Object.prototype;

function createTarget(e, t, n, r = t?.fam ?? null) {
    // The proxy target carries the array exotic class when the value is an
    // array, so Array.isArray(proxy) is true; the fields live on it directly.
    // Direct field assignment in one fixed order (no Object.assign literal
    // copy): every target shares a hidden-class transition chain — createTarget
    // was the #2 store cost in the uibench creation profile.
    const i = Array.isArray(e) ? [] : new TargetShape;
    i.v = e;
    // Chained-backing flag (backing IS another store's proxy, §7b) — cached so
    // the hot read path never does a per-read symbol lookup on the backing.
        i.ch = e[$TARGET] !== undefined;
    i.pb = null;
    i.n = null;
    i.h = null;
    i.k = null;
    i.dk = null;
    i.wk = null;
    i.u = t;
    i.pk = n;
    i.px = null;
    i.d = false;
    i.a = false;
    i.sc = 0;
    i.kc = 0;
    i.nc = 0;
    i.ab = null;
    i.fam = r;
    i.s = false;
    i.ovl = false;
    i.del = null;
    i.hv = null;
    i.ht = null;
    i.px = new Proxy(i, traps);
    // Legacy interop: shared machinery (affects walks, wrap dedupe) reads the
    // proxy off looked-up targets as a field.
        i[$PROXY] = i.px;
    (r?.map ?? storeNextLookup).set(e, i);
    return i;
}

function wrapNext(e, t = null, n = null, r = t?.fam ?? null) {
    // markRaw'd values never wrap through ANY store (R42; sticky raw-marking
    // is one half of the never-both-wrapped-and-raw invariant, RUL-12).
    if (rawValuesUsed && isRawValue(e)) return e;
    const i = lookupTarget(e, r);
    if (i !== undefined) return i.px;
    const l = e[$TARGET];
    if (l !== undefined && l.px === e) {
        // Foreign-family proxies re-wrap into THIS family (writes stay isolated);
        // same-family and plain-store proxies pass through.
        if (r === null || l.fam === r) return e;
        return createTarget(e, t, n, r).px;
    }
    return createTarget(e, t, n, r).px;
}

/** Unwrap our own proxies to their current backing; leave everything else. */ function unwrapValue(e) {
    if (e == null || typeof e !== "object") return e;
    const t = e[$TARGET];
    if (t !== undefined && t.px === e && t.v !== undefined) {
        // A draft escaping into other storage must be a REAL container that
        // becomes this target's committed backing at fold (the shared-raw
        // contract) — a prototype overlay is neither.
        if (t.ovl) materializePB(t);
        return t.pb ?? t.v;
    }
    return e;
}

// ---------------------------------------------------------------------------
// nodes: pure subscription points (values used only for equality gating)
// Shared slot-node equality (create-floor diet): ONE function for every
// store node — `this` is the node (method-call convention at every _equals
// site), `_host` is the baked-in target backref. Logical-slot equality:
// values resolving to the same child target are the same slot
// (privatization/adoption swap raw identity without changing the logical
// value — only changed leaves notify, R9).
const slotNodeEquals = function(e, t) {
    return isEqual(e, t) || sameLogicalSlot(this.Bn, e, t);
};

// Shared slot-node unobserved handler (create-floor diet): registered once;
// the core sweep dispatches CONFIG_SLOT_NODE nodes here instead of holding a
// per-node closure in a per-node NodeExtension.
setSlotUnobserved(e => {
    // A live affects() mark keeps the node addressable (sweep parity).
    if (e.o?.t) return;
    // An active override or a staged write is state only the node holds (an
    // optimistic signal keeps its override whether or not anything reads it —
    // store parity, posture-store-parity S7): defer the release to the flush
    // that resolves it (the scheduler's transient-node sweep).
        if (hasActiveOverride(e) || e._e !== NOT_PENDING) return deferSlotRelease(e);
    const t = e.Bn;
    const n = e.Kn;
    if (t.n && t.n[n] === e) {
        delete t.n[n];
        t.nc--;
        // Projection leaves also leave the firewall child chain (#3351): a
        // dropped node is unreachable through the store — a fresh read makes a
        // fresh node — so the chain would only retain it and its last value.
                unlinkFirewallChild(e);
    }
});

function getNode(e, t, n, 
// First-read dedupe (create-floor slice 2): the get trap probes
// accessor-ness right before creating the node — pass the verdict through
// so creation skips the second descriptor scan. -1 = unknown (other
// callers), 0/1 = probed.
r = -1) {
    const i = e.n ??= Object.create(null);
    let l = i[t];
    if (l === undefined) {
        // Born holding (#3330 store twin): a key first read while a live
        // transaction holds an ADOPTION on this target (adoptPB's `ht`) is
        // created as if it had existed when the hold was notified — the adopted
        // value already swapped into `v`, so committed is the held view
        // `hv[key]` and the adopted `v[key]` is staged under the transaction
        // (stageHeldKey). Its held-adoption notification (stageHeldAdoptions)
        // ran before the node existed and the drain has nothing left to say.
        // Without this the node was born from whichever view its first reader
        // saw and never learned the other. Two kinds of hold, one rule (#3336):
        //  - a held FOLD (pb): a setter's write to an unobserved key landed only
        //    in the pending backing; committed is `v[key]`, staged is `pb[key]`
        //    (undefined for a deleted key);
        //  - a held ADOPTION (ht): the adopted value already swapped into `v`;
        //    committed is the held view `hv[key]`, staged is `v[key]`.
        const o = heldFoldTransition(e);
        let s = heldAdoptionTransition(e);
        // A key the adoption left unchanged is not born holding (#3706).
                if (s !== null && !heldKey(e, t)) s = null;
        if (s !== null) n = e.hv[t]; else if ((s = o) !== null) n = e.v[t];
        // Create-floor diet: slotSignal bakes the whole node into one literal —
        // no options object, no equals/unobserved closures, no NodeExtension,
        // no post-construction expandos (acc + the wrap cache px/pxv are
        // pre-shaped fields: the proxy last served for this key and the raw it
        // wrapped — one pointer compare replaces the per-read WeakMap lookup in
        // wrapNext). ownedWrite rides the literal's config: the setter carries
        // the owned-scope write guard; node-level setSignals are internal
        // notification machinery. Projection nodes carry the projection
        // computed as their firewall: reads through them link the derive's
        // status/lifecycle (§7b).
                const f = l = slotSignal(n, slotNodeEquals, e, t, 
        // Accessor-ness resolved ONCE per node (no per-object descriptor
        // scan on reads): accessor keys serve through Reflect.get with the
        // proxy receiver.
        r === -1 ? isOwnAccessor(e.pb ?? e.v, t) : r === 1, e.fam?.node ?? undefined);
        // Optimistic families: arm the override slot — setSignal routes armed
        // nodes through the core engine (lanes, ownership, reverts all native).
                if (e.fam?.opt) {
            ext(f).Fe = NOT_PENDING;
            f.C |= CONFIG_OPTIMISTIC;
        }
        // A node born inside a live mark's identity scope inherits the mark
        // (the declaration walk could only cover nodes existing then).
                if (t !== $AFFECTS && affectsScopesLive()) inheritAffectsMarks(f, e.v, t);
        if (s !== null) stageHeldKey(f, o !== null ? e.del !== null && e.del.has(t) ? undefined : e.pb[t] : e.v[t], s);
        i[t] = l;
        e.nc++;
        markDescendants(e);
    }
    return l;
}

/** The live transaction holding an adoption on `target` (adoptPB's `ht`;
 * a latest()-pull PLAIN_HOLD is not a transaction), else null. */ function heldAdoptionTransition(e) {
    if (e.ht === null || e.ht === PLAIN_HOLD || heldMaskView(e) === null) return null;
    const t = currentTransition(e.ht);
    return t.Rn === false ? t : null;
}

/**
 * Materialization under a hold. A node created by a first tracked read while
 * a transaction holds this target must carry the same state a node that
 * existed when the hold was notified carries — a transaction-stamped
 * `_pendingValue` that core read() serves by ITS rules (a stale render reader
 * of a foreign transaction's write sees committed, an owner-context reader
 * inside the transaction sees the write) — or the reader's answer depends on
 * whether some OTHER reader had materialized the key before the hold. Stage
 * `nv` (the held value for the key — see getNode for which view it comes
 * from) as the holding transaction's write — directly, not through
 * setSignal: it is not a new write (it staged with the adoption's batch) and
 * it walks no subscriber (the node has none yet). Transition-stamped now, as
 * `runFolded` does — no parked-flush pass will stamp it.
 */
/** The live transaction holding `target`'s pending backing (the #3089
 * write-time stamp, resolved through merges), else null. */ function liveFoldTransition(e) {
    if (e.pb === null) return null;
    const t = foldBatches.get(e);
    if (t === undefined) return null;
    const n = currentTransition(t);
    return n.Rn === false ? n : null;
}

/** liveFoldTransition for node materialization (stageHeldKey). Inside the
 * draft the backing is the setter's working copy, not a flushed hold — its
 * nodes take their writes at setter exit (notifyWrites). Optimistic families
 * hold at the backing: tentative writes are node overrides over a discarded
 * clone, and a truth-staged landing is served through the fold's own hold
 * (heldTruthMasked for lane passes, pendingBackingVisible's hold arms for
 * the rest) — neither is a plain staged write to mirror. Chained
 * backings serve the inner store's live value, never a node value. */ function heldFoldTransition(e) {
    if (e.ch || e.fam?.opt === true || inDraft(e)) return null;
    return liveFoldTransition(e);
}

/**
 * Rule 1 at the backing, the hold half (core serve()'s stale-of-foreign and
 * A29 arms, for a container instead of a node): given the transaction
 * holding what a reader `c` (a pass; callers serve context-free readers the
 * committed container themselves) is about to be served, is the STAGED
 * container its to see? Its own hold, or none — yes. A foreign hold — a
 * stale pass (render effect) keeps the committed frame and is recorded for
 * replay at the hold's commit (recordStaleReplay, A15 / A26); a deriving
 * pass takes the staged world and enters the transaction (enterStagedRead,
 * A29). Shared by both hold kinds: a setter's fold (committed `v`, staged
 * `pb`, the write-time stamp) and an adoption under a transaction
 * (committed = the held view `hv`, staged = the adopted `v`, #3074).
 */ function holdVisible(e, t) {
    if (e === null || ownsHold(e)) return true;
    if (stale) {
        recordStaleReplay(e, t);
        return false;
    }
    enterStagedRead(null, e);
    return true;
}

// #3706: the keys an adoption under a live hold changed against the held
// view — the adoption twin of `wk` (#3688), keyed on the target. adoptPB
// records `[adopted object]`; the keys are diffed against IT, once, on the
// first held read (its children are re-pointed by then), and replace the
// entry. Never against the live backing — a mainline write during the hold
// replaces that, and its key is not the adoption's. WK_ALL holds the whole
// container.
const heldKeys = new WeakMap;

function heldKey(e, t) {
    let n = heldKeys.get(e);
    if (Array.isArray(n)) heldKeys.set(e, n = adoptionChangedKeys(e, n[0]));
    return n === WK_ALL || n.has(t);
}

function adoptionChangedKeys(e, t) {
    const n = e.hv;
    // A chained backing, an optimistic family, a chained held view, a swapped
    // or non-plain prototype (inherited accessors read through `this`): whole.
        if (t[$TARGET] !== undefined || e.fam?.opt === true || n[$TARGET] !== undefined || Object.getPrototypeOf(n) !== Object.getPrototypeOf(t) || !plainProto(t)) return WK_ALL;
    const r = new Set;
    // Accessors are never invoked: they and a flipped enumerability are changes.
        for (const i of Reflect.ownKeys(n)) if (!hasOwn.call(t, i) || isOwnAccessor(n, i) || isOwnAccessor(t, i) || propertyIsEnumerable.call(n, i) !== propertyIsEnumerable.call(t, i) || !(isEqual(n[i], t[i]) || sameLogicalSlot(e, n[i], t[i]))) r.add(i);
    for (const e of Reflect.ownKeys(t)) if (!hasOwn.call(n, e)) r.add(e);
    return r;
}

function stageHeldKey(e, t, n) {
    if (slotNodeEquals.call(e, e.ce, t)) return;
    e._e = t;
    e.we = n;
    n.Gn.push(e);
}

function sameLogicalSlot(e, t, n) {
    if (t === null || typeof t !== "object" || n === null || typeof n !== "object") return false;
    const r = lookupTarget(t, e.fam);
    return r !== undefined && r === lookupTarget(n, e.fam);
}

function getHasNode(e, t, n) {
    const r = e.h ??= Object.create(null);
    let i = r[t];
    if (i === undefined) {
        const l = i = signal(n, {
            equals: isEqual,
            unobserved() {
                if (l.o?.t) return;
                // The structural twin of the value slot's rule (setSlotUnobserved,
                // S7): an optimistic add/delete lives on this presence node as its
                // override — releasing it with the override on would let `in`,
                // `Object.keys` and descriptors fall back to committed structure
                // while the action is live. Defer to the flush that resolves it.
                                if (hasActiveOverride(l) || l._e !== NOT_PENDING) return deferSlotRelease(l);
                if (e.h && e.h[t] === l) {
                    delete e.h[t];
                    unlinkFirewallChild(l);
                }
            }
        }, e.fam?.node ?? undefined);
        l.C |= CONFIG_OWNED_WRITE;
        if (e.fam?.opt) {
            ext(l).Fe = NOT_PENDING;
            l.C |= CONFIG_OPTIMISTIC;
        }
        if (affectsScopesLive()) inheritAffectsMarks(l, e.v, t);
        r[t] = i;
        markDescendants(e);
    }
    return i;
}

/** Did `obs` link `target`'s key-set node in its CURRENT pass? The mirror of
 * link()'s O(1) repeat-touch check: the node's newest subscriber link is
 * this observer's, and — during a recompute — carries this pass's dep
 * generation (a link left from a previous pass is stale: the observer may
 * not re-read the key set this time). No dep-list scan, no allocation. A
 * probe observer (isPending()/latest() sentinel) never links, so it always
 * falls through to the presence read. */ function observerHoldsKeySet(e, t) {
    const n = e.k;
    if (n === null) return false;
    const r = n.mn;
    return r !== null && r.ge === t && (!(t.oe & REACTIVE_RECOMPUTING_DEPS) || r.Be === t.Ye);
}

function getKeySetNode(e) {
    let t = e.k;
    if (t === null) {
        const n = t = signal(0, {
            equals: false,
            unobserved() {
                if (e.k === n) {
                    e.k = null;
                    unlinkFirewallChild(n);
                }
            }
        }, e.fam?.node ?? undefined);
        n.C |= CONFIG_OWNED_WRITE;
        if (e.fam?.opt) {
            ext(n).Fe = NOT_PENDING;
            n.C |= CONFIG_OPTIMISTIC;
        }
        e.k = t;
        markDescendants(e);
    }
    return t;
}

function getDeepNode(e) {
    let t = e.dk;
    if (t === null) {
        const n = t = signal(0, {
            equals: false,
            unobserved() {
                if (e.dk === n) {
                    e.dk = null;
                    unlinkFirewallChild(n);
                }
            }
        }, e.fam?.node ?? undefined);
        n.C |= CONFIG_OWNED_WRITE;
        if (e.fam?.opt) {
            ext(n).Fe = NOT_PENDING;
            n.C |= CONFIG_OPTIMISTIC;
        }
        if (affectsScopesLive()) inheritAffectsMarks(n, e.v, $TRACK);
        e.dk = t;
        markDescendants(e);
    }
    return t;
}

/** Deep-witness bump: any value/shape change on a record with a live deep()
 * subscriber notifies it. One null check when unused. */ function bumpDeep(e) {
    if (e.dk !== null) setSignal(e.dk, 1);
}

// ---------------------------------------------------------------------------
// pending backing + fold (the single mutation point)
/** target → committed backing at batch start (the fold diff's old side). */ const foldOlds = new Map;

let hookInstalled = false;

/** Shallow-clone `source` as a backing OWNED by `t` (stamped `$OWNER`, see
 * target.ts). Callers always pass their own committed backing as `source`. */ function cloneRaw(e, t) {
    // Plain-data fast path (#3360): a scanned `Object.prototype` container
    // whose own keys are all enumerable data clones by spread — the same
    // result as the descriptor walk below (own enumerable string+symbol keys,
    // normalized writable+configurable), at ~1/50th the cost.
    t.sc || scanAccessorsOnce(t);
    if (t.sc === 2) {
        const n = {
            ...e
        };
        n[$OWNER] = t;
        return n;
    }
    // Descriptor-preserving shallow clone (R29: installed getters stay live;
    // ruled 2026-08-17: frozen sources clone unfrozen — theirs stays frozen).
    // Data descriptors normalize to writable+configurable (the clone is OURS to
    // mutate — R51's "source-non-configurable is writable through the store");
    // enumerability and accessors are preserved. The scan doubles as the
    // accessor-flag detector (free — we're enumerating descriptors anyway).
        const n = Object.getOwnPropertyDescriptors(e);
    for (const r of Reflect.ownKeys(n)) {
        const i = n[r];
        if (r === "length" && Array.isArray(e)) continue;
        i.configurable = true;
        if (!i.get && !i.set) i.writable = true; else t.a = true;
    }
    const r = Array.isArray(e) ? Object.defineProperties([], n) : Object.create(Object.getPrototypeOf(e), n);
    r[$OWNER] = t;
    return r;
}

/** Shallow copy of a WIDE plain-data (sc 2) backing for the overlay rebuild
 * (#3689). Own keys land on a null-prototype object — V8 creates those in
 * dictionary mode, so the copy is O(keys) hash inserts — and the prototype
 * is attached after. A spread builds a fast-mode object one map transition
 * per key; from a source in dictionary mode (a backing that took deletes)
 * whose key order differs from the last copy's, every transition is a fresh
 * map with an O(keys) descriptor copy: measured 270 µs vs 28 µs at 400 keys,
 * 1.3 ms vs 75 µs at 1000. Narrow, stable-shaped backings keep the spread
 * (cloneRaw): there the clone IC copies the property store at once and is
 * 3–8× cheaper than any per-key loop. */ function wideClone(e, t) {
    const n = Object.create(null);
    for (const t of Reflect.ownKeys(e)) n[t] = e[t];
    Object.setPrototypeOf(n, Object.prototype);
    n[$OWNER] = t;
    return n;
}

/** Copy own `key` from `from` onto `to`. A plain data slot (enumerable,
 * writable, configurable, no accessor) is a bare assignment — the common case
 * and the cheap one; anything else goes through defineProperty so accessors
 * and attribute flags survive the copy. */ function copyOwn(e, t, n) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    if (r.get || r.set || !r.enumerable || !r.writable || !r.configurable) Object.defineProperty(e, n, r); else e[n] = r.value;
}

/** One-time own-accessor scan (Annex-B probes, no descriptor allocation);
 * returns true when the container is plain data (overlay-safe). Also grades
 * the container for the plain-data fast paths (`sc` = 2): `Object.prototype`
 * and every own key an enumerable data property — what a spread copies
 * exactly and what a bare assignment lands exactly. */ function scanAccessorsOnce(e) {
    const t = e.v;
    const n = Reflect.ownKeys(t);
    let r = Object.getPrototypeOf(t) === Object.prototype;
    for (const i of n) {
        // Own keys shadow prototype accessors, so the lookups are exact here.
        if (lookupGetter.call(t, i) !== undefined || lookupSetter.call(t, i) !== undefined) {
            e.a = true;
            r = false;
            break;
        }
        if (r && !propertyIsEnumerable.call(t, i)) r = false;
    }
    e.sc = r ? 2 : 1;
    e.kc = n.length;
    return !e.a;
}

/** Own-key count above which a draft opens as a prototype overlay rather
 * than a clone (#3360). Below it a spread clone of a plain container is
 * cheaper than the overlay's `Object.create` (V8 converts the committed
 * backing into a prototype, and every later flatten writes into that
 * prototype); above it the clone's O(keys) copy dominates (#3044). */ const OVERLAY_MIN_KEYS = 32;

/** Overlay commit choice (#3689): flatten in place, or rebuild the backing
 * (materializePB, then the clone path's swap)? Measured on V8 (Node 26): a
 * committed backing that has served as an overlay prototype is kept as a
 * FAST-MODE prototype object up to V8's descriptor limit (1020 own
 * properties), and there every in-place DELETE is O(keys) — normalize to
 * dictionary plus re-optimize as a prototype, ~0.08 µs × keys — and every
 * in-place ADD is a map transition copying the descriptors, ~0.006 µs ×
 * keys. Detaching the overlay first does not help: prototype-ness is a
 * property of the object's map. One rebuild (wideClone, deletes, writes) is
 * ~0.07–0.09 µs × keys — the price of ONE in-place delete. So a fold that
 * deleted anything, or added more than ~16 keys, commits cheaper rebuilt (a
 * 400-key record churning 100 keys per commit, 10,000 membership readers:
 * 4.7 ms → 0.22 ms per step); a pure rewrite of existing keys — the
 * overlay's home case — stays in place at O(written).
 * Past the descriptor limit V8 keeps the backing in dictionary mode where
 * every in-place op is O(1), and a rebuild would be a pure O(keys) loss on
 * exactly the growing-record pattern the overlay exists for (#3044) — the
 * count gate keeps those in place. The gate reads `kc`, which the set trap
 * counts up for keys new to the container and the delete commit counts down. */ const OVERLAY_REBUILD_MAX_KEYS = 1024;

const OVERLAY_REBUILD_MIN_ADDS = 16;

function overlayRebuilds(e, t) {
    if (e.kc > OVERLAY_REBUILD_MAX_KEYS) return false;
    if (e.del !== null && e.del.size !== 0) return true;
    // Every trap write records its key, so the written-key count bounds the
    // adds — the common few-key fold (#3044's growing record) answers here
    // without enumerating the overlay.
        const n = e.wk;
    if (n !== null && n !== WK_ALL && n.size <= OVERLAY_REBUILD_MIN_ADDS) return false;
    const r = e.v;
    let i = 0;
    for (const e of Reflect.ownKeys(t)) if (!hasOwn.call(r, e) && ++i > OVERLAY_REBUILD_MIN_ADDS) return true;
    return false;
}

/** Downgrade a prototype-overlay pending backing to the clone path: builds
 * the real container (committed + overlay writes − deletes) that fold will
 * SWAP in as the committed backing, exactly as if the draft had started on
 * the clone path. Consumers that need a complete container (reconcile's
 * diff walks, drafts escaping into other storage) call this, and so does the
 * commit itself when the fold changed the key set (overlayRebuilds). Returns
 * the pending backing (the clone, or the pb as-is when not an overlay). */ function materializePB(e) {
    const t = e.pb;
    if (!e.ovl) return t;
    const n = e.sc === 2 ? wideClone(e.v, e) : cloneRaw(e.v, e);
    // Deletes before writes (#3689): on a fast-mode clone (the descriptor
    // path) the first delete normalizes it once, and the writes then land as
    // O(1) dictionary adds instead of O(keys) map transitions each. Order is
    // free semantically — a rewritten key left `del` at write time, so no
    // write targets a deleted key.
        if (e.del !== null) {
        for (const t of e.del) delete n[t];
        e.kc -= e.del.size;
        e.del = null;
    }
    // Plain-data grade (sc 2): bare assignment, as flattenOverlay does.
        for (const r of Reflect.ownKeys(t)) e.sc === 2 ? n[r] = t[r] : copyOwn(n, t, r);
    e.pb = n;
    e.ovl = false;
    return n;
}

function ensurePB(e) {
    let t = e.pb;
    // Truth-staged backing hand-off (#3164 fold): a TENTATIVE draft opening on
    // a target whose pending backing is truth-staged (a landing folded into a
    // retaining transaction — it carries a foldBatches stamp) must not share
    // the container. Tentative writes would pollute staged truth, and the
    // tentative discard (notifyOptimisticWrites nulls pb) would destroy the
    // landing. Park the staged backing and open a fresh draft seeded from the
    // optimistic view below; the tentative discard restores it. The
    // tentativePBs guard scopes this to draft OPEN: the draft's own backing
    // (foldBatches-stamped by its first write when an action's transition is
    // ambient) must not be parked by its own later writes.
        if (t !== null && !tentativePBs.has(t) && e.fam?.opt === true && !projectionWriteActive && !getWriteOverride() && foldBatches.has(e)) {
        stagedTruthPB.set(e, t);
        t = e.pb = null;
    }
    if (activeTransition !== null) foldBatches.set(e, activeTransition);
    if (t === null) {
        // Prototype-chain overlay (#3044): plain-data non-array containers open
        // drafts in O(1) — own keys are the writes, reads fall through to
        // committed. Projection and derived-store families take it too (#3352:
        // a derive touching one root key of a wide keyed record paid an
        // O(keys) clone per recompute). Everything else keeps the descriptor
        // clone: arrays (splice/length semantics), OPTIMISTIC families (the
        // view-seeding below writes and deletes on the draft container, and the
        // tentative discard/truth-park hand whole backings around), chained
        // backings (the committed layer is another store's proxy — an overlay
        // would route every read-through into its traps), accessor containers
        // (live getters).
        // The overlay pays off only for a WIDE container over an OWNED committed
        // backing (#3360). Narrow containers clone cheaper than they overlay (a
        // spread is a fast-path copy; `Object.create` turns the backing into a
        // V8 prototype and every later flatten writes into that prototype). An
        // unowned backing has to be privatized (cloned) at commit anyway, so an
        // overlay there would cost the create PLUS the clone PLUS a per-key
        // copy — the clone path does the one clone and swaps it in. The first
        // write on a fresh store is exactly that case.
        const n = e.v;
        if (!e.fam?.opt && !e.ch && !Array.isArray(n) && (e.sc !== 0 ? !e.a : scanAccessorsOnce(e)) && e.kc > OVERLAY_MIN_KEYS && isOwned(n)) {
            // Inherits `v`'s $OWNER stamp — the overlay resolves and reads as
            // owned without a registration of its own.
            t = e.pb = Object.create(n);
            e.ovl = true;
        } else t = e.pb = cloneRaw(n, e);
        // Optimistic families: seed USER drafts from the OPTIMISTIC VIEW
        // (committed + active node overrides), so follow-up writes compose on
        // optimism instead of clobbering from base (#2951's compose half).
        // AUTHORITATIVE drafts (projection recompute / write-override landings)
        // seed from committed truth — seeding overrides there would fold a lane
        // value into the committed home ("authority wins at reveal" would break).
                if (e.fam?.opt && !projectionWriteActive && !getWriteOverride()) {
            tentativePBs.add(t);
            const n = e.n;
            if (n !== null) {
                for (const e of Reflect.ownKeys(n)) {
                    const r = n[e];
                    if (hasActiveOverride(r)) t[e] = unwrapOverride(r.o?.Fe);
                }
            }
            const r = e.h;
            if (r !== null) {
                for (const e of Reflect.ownKeys(r)) {
                    const n = r[e];
                    if (hasActiveOverride(n) && !unwrapOverride(n.o?.Fe)) delete t[e];
                }
            }
        }
        queueFold(e);
    }
    return t;
}

/** Sentinel holder for `t.ht`: a latest()-pull staged this adoption outside
 * any transition — the hold lasts until the fold commit (drainFolds). */ const PLAIN_HOLD = Symbol("plainHold");

/** True while a latest() read is pulling the projection computed up to date
 * (see the get trap): adoptions landing during the pull are speculative
 * against the un-flushed batch and stage a held view. (Not injectable — the
 * derived createStore overload retains projection machinery in every store
 * bundle, see treeshake.test.ts.) */ let latestPullActive = false;

/** Resolve the held committed view (#3074): answers the masked old backing
 * while the hold is live, and lazily clears a hold whose transition has
 * committed (transitions merge — resolve through currentTransition, same as
 * foldHeld's node stamps). */ function heldMaskView(e) {
    const t = e.ht;
    if (t === null) return null;
    if (t !== PLAIN_HOLD && currentTransition(t)?.Rn === true) return e.ht = e.hv = null;
    return e.hv;
}

/**
 * Adoption (2026-08-16c): the incoming object becomes the committed backing
 * IMMEDIATELY — reconcile is eagerly visible to every reader (shipped
 * contract; only its notifications batch), unlike setter writes which stay
 * pending until flush. Ownership resets (incoming is unowned/user data). Any
 * staged draft clone folds into the diff and is discarded — next is the
 * authoritative base (R21/R32).
 */ function adoptPB(e, t, n = false) {
    // Eager mode (plain-store adoption): the caller notifies inline after its
    // descent — no foldOlds queue/drain round trip (the reconcile diff IS the
    // fold diff; ~half of dbmon tick time was this duplication).
    if (!n) {
        queueFold(e);
 // records the pre-batch old before we swap
        // Diff base = the view the nodes were last told (#3296). A draft's
        // setter-exit notifications already moved them to its pending backing,
        // so a later adoption diffs against THAT — against committed, a key the
        // draft changed and the adoption restores would never re-notify. An
        // adoption with no draft leaves nodes where they were: keep an existing
        // base, else the pre-batch committed (foldOlds' entry itself stays the
        // committed identity for the path-copy CAS). Eager callers read t.pb
        // directly; this hand-off exists because pb is gone by drain time.
                if (e.pb !== null) {
            if (e.ovl) materializePB(e);
            e.ab = e.pb;
        } else e.ab ??= foldOlds.get(e);
    }
    // #3074/#3075: a projection recompute deriving from uncommitted inputs
    // swaps the backing SPECULATIVELY — committed-visibility readers must
    // keep the pre-hold view until the hold resolves (a source held by a
    // live transition, or a latest()-pull ahead of the flush). Post-await
    // landings (write-override) stay immediately visible — landed truth —
    // and clear any hold. Optimistic families hold too (#3330 store twin):
    // their tentative edits ride the lane machinery, but a sync derive
    // adopting under a transaction is held TRUTH like any projection's —
    // unheld, handlers read it early and an optimistic write equal to it
    // compared as a no-op against the swapped-in backing. A plain store's
    // reconcile inside an action holds the same way: its nodes stage under the
    // transaction (the inline notify), and the backing must not show handlers
    // and stale readers what the tracked read masks (signal parity, #3336).
        if (getWriteOverride()) {
        e.ht = e.hv = null;
    } else if (activeTransition !== null || !n && latestPullActive) {
        if (heldMaskView(e) === null) e.hv = e.v;
        e.ht = activeTransition ?? PLAIN_HOLD;
        if (!n && activeTransition !== null) heldAdoptions.add(e);
        heldKeys.set(e, [ t ]);
    }
    e.pb = null;
    // Overlay and accessor-scan state describe the OUTGOING backing — a
    // swapped container must not inherit them: a stale `ovl` beside a nulled
    // pb crashes materializePB (unwrapValue consults ovl before the
    // null-coalesce), a stale `del` would read the adoptee's keys as deleted
    // in the next draft, and a stale plain-data verdict (`sc`/`a`) could
    // admit an accessor-bearing adoptee to the overlay path. Reset; the next
    // draft rescans once (#3044 audit follow-up).
        e.ovl = false;
    e.del = null;
    e.sc = 0;
    e.a = false;
    e.wk = null;
 // adoption supersedes staged trap writes
        e.v = t;
    e.ch = t[$TARGET] !== undefined;
    // An adoptee we own within this family (a draft aliasing one of the
    // family's own backings) re-stamps to its new owner — the stamp is the
    // family's registration for it; everything else registers in the map.
        const r = t[$OWNER];
    if (r !== undefined && r.fam === e.fam) t[$OWNER] = e; else (e.fam?.map ?? storeNextLookup).set(t, e);
}

/** Sentinel for `t.wk`: the written-keys bound is unusable this batch (an
 * array length write implicitly deleted indices) — consumers full-scan. */ const WK_ALL = new Set;

const plainProto = e => {
    const t = Object.getPrototypeOf(e);
    return t === Object.prototype || t === Array.prototype || t === null;
};

function queueFold(e) {
    if (foldOlds.has(e)) return;
    if (!hookInstalled) {
        hookInstalled = true;
        setStoreCommitHook(drainFolds);
    }
    // Always arm — "map non-empty ⇒ drain scheduled" is NOT an invariant: a
    // held re-queue, or an incomplete-transition flush (which skips
    // commitPendingNodes entirely), leaves entries behind after `scheduled`
    // was consumed. A size-gated arm then strands every LATER fold — queued
    // silently, never drained, committed base frozen at stale state while its
    // nodes commit (#3089). schedule() early-returns when already armed.
        schedule();
    foldOlds.set(e, e.v);
}

/** Fold write-attribution (#3089): a draft written while a transition is
 * active belongs to that transition — its fold must not commit before the
 * transition settles. Observed keys already defer through the held check in
 * drainFolds (their nodes carry _pendingValue); this write-time stamp is the
 * equivalent hold for UNOBSERVED keys, which have no node to consult.
 * Refreshed on every write; resolved through currentTransition at drain
 * (transitions merge — same rule as heldMaskView). */ const foldBatches = new WeakMap;

/** Parked truth-staged pending backings (#3164 fold): a tentative draft that
 * opens while a folded landing's backing is live moves the staged container
 * here (see ensurePB); the tentative discard in notifyOptimisticWrites
 * restores it in place of the usual null. */ const stagedTruthPB = new WeakMap;

/** Backings opened by TENTATIVE drafts (optimistic user setters): ensurePB's
 * truth-park must not fire against the draft's own container on its second
 * and later writes (the first write stamps foldBatches whenever an action's
 * transition is ambient). Entries die with their draft — tentative backings
 * are consumed at setter exit. */ const tentativePBs = new WeakSet;

/** A draft read composes the live optimistic view until the draft has opened
 * its OWN view-seeded backing (ensurePB seeds that clone from the view and
 * registers it in tentativePBs; from then on reads must see the draft's
 * writes, not the overrides they superseded). A pending backing that exists
 * for any other reason is not that clone — a truth landing staged into a
 * retaining transaction (#3164 fold) is authoritative truth WITHOUT the
 * live overrides. ensurePB parks such a backing on the draft's first WRITE
 * and reseeds from the view, but the reads that precede that write went to
 * the staged truth: `votes++` read base, wrote base+1, and the override it
 * emitted landed on the value already displayed — a second in-flight
 * increment made after a sibling's landing was invisible (#2951's compose
 * half, one landing later). */ function draftSeesOverrides(e) {
    return e.pb === null || !tentativePBs.has(e.pb);
}

/** Committed-time privatization for parent-chain slot updates (path copying). */ function privatizeCommitted(e) {
    if (isOwned(e.v)) return;
    const t = e.v;
    const n = cloneRaw(t, e);
    e.v = n;
    e.ch = false;
    if (e.u) {
        privatizeCommitted(e.u);
        devAssertNeverUserMutation(e.u.v);
        // CAS, same as drainFolds' path copy: re-point the parent slot only
        // while it still holds the raw we cloned. A parent that folded EARLIER
        // in this drain may have replaced or deleted this slot (the same batch
        // wrote the child and then `parent.row = fresh` / `parent.length = 0`)
        // — an unconditional write resurrected the dropped child over it.
                const n = e.u.v;
        const r = parentSlotKey(e, t);
        if (n[r] === t) n[r] = e.v;
    }
}

/** Resolve the slot this child currently occupies in its parent's committed
 * backing (#3282). `pk` is stamped at wrap time and arrays MOVE: a reverse/
 * unshift/splice relocates the raw, and a fold that re-points the wrap-time
 * slot writes the clone over whichever row lives there now. Objects never
 * move keys, so the stamp is authoritative; for arrays, verify and re-locate
 * by identity when stale (fold-time only — never on a read path). */ function parentSlotKey(e, t) {
    const n = e.pk;
    const r = e.u.v;
    if (r[n] === t || !Array.isArray(r)) return n;
    const i = r.indexOf(t);
    if (i === -1) return n;
    e.pk = i;
    return i;
}

/** Overlay commit (#3044): apply the batch's writes onto an OWNED committed
 * backing in place — O(written), not O(container). Unowned backings
 * privatize first (clone once, parents re-slotted) — the never-mutate-user-
 * data contract holds. Shared by the deferred fold (drainFolds) and the
 * projection landing's immediate commit (notifyWrites). */ function flattenOverlay(e, t) {
    privatizeCommitted(e);
    const n = e.v;
    // Plain-data grade (sc 2): every own key on the overlay is an enumerable
    // writable data slot (set-trap writes; a non-plain defineProperty
    // downgrades the grade) — a bare assignment lands it without the
    // descriptor round trip.
        for (const r of Reflect.ownKeys(t)) e.sc === 2 ? n[r] = t[r] : copyOwn(n, t, r);
    if (e.del !== null) {
        for (const t of e.del) delete n[t];
        e.kc -= e.del.size;
        e.del = null;
    }
    e.pb = null;
    e.ovl = false;
    e.wk = null;
 // written-keys window closes with the commit
}

function drainFolds() {
    if (foldOlds.size === 0) return;
    const e = [ ...foldOlds ];
    foldOlds.clear();
    for (const [t, n] of e) {
        // A latest()-pull staging holds only until the fold commit: this flush
        // is committing the batch the pull ran ahead of. Transition holds stay —
        // they clear when their transition is done (heldMaskView).
        if (t.ht === PLAIN_HOLD) t.ht = t.hv = null;
        if (t.pb !== null) {
            // #3089: a fold written under a still-running transition defers to
            // that transition's settle (the write-time stamp covers unobserved
            // keys; observed keys also hit the pending-node held check below).
            const e = foldBatches.get(t);
            if (e !== undefined) {
                if (currentTransition(e).Rn === false) {
                    foldOlds.set(t, n);
                    continue;
                }
                foldBatches.delete(t);
            }
            // Setter path: nodes were setSignal'd at setter exit (write-time
            // notification — transitions/holds ride core machinery). Commit the
            // backing only for keys whose nodes have committed; a still-pending
            // node (transition-held) re-queues the target for the settling flush.
                        let r = false;
            const i = t.pb;
            const l = t.n;
            if (l !== null) {
                // Only written keys can hold (their nodes took the setSignal); the
                // wk bound keeps this O(written) — see notifyWrites. Same fallback
                // rules as the notify (WK_ALL / accessors / non-plain prototypes).
                const e = t.wk;
                const n = e === null || e === WK_ALL || t.a === true || 
                // Overlay pbs chain to the COMMITTED object (#3044) — plainness is
                // the committed container's prototype, not the overlay's.
                !plainProto(t.ovl ? t.v : i) ? Reflect.ownKeys(l) : e;
                for (const e of n) {
                    const t = l[e];
                    if (t !== undefined && t._e !== NOT_PENDING) {
                        r = true;
                        break;
                    }
                }
            }
            if (r) {
                foldOlds.set(t, n);
 // re-queue: commit happens when the hold settles
                                continue;
            }
            if (t.ovl && (t.v !== n || !overlayRebuilds(t, i))) {
                // Overlay flatten (#3044): the backing keeps its identity, so the
                // `t.v === old` gate below skips path copying (the parent slot
                // already points here) and the adopted-notify (setter notifications
                // happened at write time). A backing privatized mid-batch is a fresh
                // clone, never a prototype — in-place writes into it are cheap, and
                // the merge branch below is what a materialized pb would need anyway.
                flattenOverlay(t, i);
            } else if (t.v !== n) {
                // Privatized mid-batch (#3271): an earlier fold in this drain
                // path-copied THROUGH this target — privatizeCommitted cloned the
                // committed backing, re-pointed the parent slot at the clone, and
                // stitched the descendant's fold into it. The draft's pb predates
                // that: swapping it in would clobber the descendant's fold, and the
                // parent CAS below (still comparing against `old`) would fail and
                // orphan this fold entirely — a projection draft writing descendant-
                // then-ancestor silently lost the ancestor write. Merge the batch's
                // writes onto the current container instead (the parent slot already
                // points at it). privatize first: an adopt-then-write batch can land
                // here with an unowned adoptee as t.v.
                privatizeCommitted(t);
                const e = t.v;
                const r = t.wk;
                if (r !== null && r !== WK_ALL) {
                    // The trap records every write/delete key — apply exactly those.
                    for (const t of r) {
                        if (hasOwn.call(i, t)) copyOwn(e, i, t); else delete e[t];
                    }
                } else {
                    // Array length write poisoned the bound (WK_ALL) — value-diff
                    // against the pre-batch old. Slots the draft never touched hold
                    // the same raw reference in both, so descendant folds stay put.
                    // Not copyOwn: the plain-value write is GATED on "the draft changed
                    // this slot" — an untouched slot in pb holds the pre-batch reference,
                    // and writing it back would clobber a descendant fold stitched into v.
                    for (const t of Reflect.ownKeys(i)) {
                        const r = Object.getOwnPropertyDescriptor(i, t);
                        if (r.get || r.set || !r.enumerable || !r.writable || !r.configurable) Object.defineProperty(e, t, r); else if (r.value !== n[t] || !hasOwn.call(n, t)) e[t] = r.value;
                    }
                    for (const t of Reflect.ownKeys(n)) {
                        if (!hasOwn.call(i, t)) delete e[t];
                    }
                }
                t.pb = null;
                t.wk = null;
 // written-keys window closes with the fold commit
                        } else {
                // An overlay whose fold changed the key set rebuilds (#3689) and
                // takes the swap like a clone-path draft: the parent slot re-points
                // in the path copy below.
                t.v = t.ovl ? materializePB(t) : i;
                t.ch = false;
 // pb is always a plain clone
                                t.pb = null;
                t.wk = null;
 // written-keys window closes with the fold commit
                        }
        }
        const e = t.ab;
        t.ab = null;
        if (t.v !== n) {
            // Path copying (CAS: see the eager-fold twin above). Slot resolved by
            // identity (#3282): an array move relocated the raw, so the wrap-time
            // pk may point at a sibling — a raw-slot CAS there both failed to
            // re-point AND (via privatizeCommitted's unguarded write) clobbered
            // the sibling.
            if (t.u) {
                const e = parentSlotKey(t, n);
                if (t.u.v[e] === n) {
                    privatizeCommitted(t.u);
                    devAssertNeverUserMutation(t.u.v);
                    t.u.v[e] = t.v;
                }
            }
        }
        // Adoption notify against the base the nodes were last told (#3296). A
        // no-op adoption (A -> B -> A before flush, no draft) has base === v and
        // nothing to say; a draft superseded by an adoption back to the SAME raw
        // still has (base = pending backing) !== v and must notify.
                if (e !== null && e !== t.v) notifyFold(t, e, t.v);
    }
}

/**
 * Setter-exit notification (write channel): diff the draft's pending backing
 * against committed and setSignal every changed OBSERVED key — write-time
 * notification with commit deferred to node commit, so transition holds,
 * isPending, affects, and lane machinery ride the core natively (§3's
 * "pending home = the node when a node exists"). Unobserved keys stay in the
 * pending backing and fold directly at commit.
 */ function notifyWrites(e) {
    let t = e.pb;
    if (t === null) return;
    // Optimistic channel: user writes on an optimistic family become node-level
    // engine writes (armed nodes route setSignal through optimisticWrite) — the
    // committed backing is NEVER touched; the draft clone is discarded. Reverts,
    // per-transaction ownership, and flash-at-flush are all core-native.
    // Projection recompute writes (projectionWriteActive) and projection draft
    // writes (write-override, incl. post-await async landings) are
    // authoritative and take the plain channel below (they commit silently
    // under overrides per the engine's no-revert-stash contract).
        if (e.fam?.opt) {
        if (!projectionWriteActive && !getWriteOverride()) {
            optHooks.notifyOptimisticWrites(e, t);
            return;
        }
        // Authoritative path on an optimistic family: armed nodes must commit
        // silently (engine bypass) — without this, a landing's setSignals would
        // create lanes and block their own transition's settle.
                if (!projectionWriteActive) {
            setProjectionWriteActive(true);
            try {
                notifyWrites(e);
            } finally {
                setProjectionWriteActive(false);
            }
            return;
        }
    }
    const n = e.v;
    const r = e.n;
    // Written-keys bound: trap writes record their keys, so the notify visits
    // O(written) nodes instead of every subscription on the record (a selection
    // map with thousands of per-key subscribers pays two visits per select,
    // not a full scan). Falls back to the full node scan when the bound can't
    // hold: no trap granularity (wk null), an array length write (WK_ALL —
    // implicit index deletes), accessors on the record (t.a — a getter node's
    // value can change when ANY key is written), or a non-plain prototype
    // (class instances: prototype getters derive from arbitrary fields).
        const i = e.wk;
    // Overlay pbs chain to the COMMITTED object (#3044): a prototype-overlay
    // draft is plain data on its own layer, but its getPrototypeOf is the
    // committed container — judge plainness by the COMMITTED prototype or the
    // bound never engages for overlay writes (every plain-object setter batch
    // would full-scan: the exact selection-map workload wk exists for; jf
    // `select` regressed 2x on this).
        const l = i === WK_ALL || e.a === true || !plainProto(e.ovl ? e.v : t) ? null : i;
    if (r !== null) {
        const i = l ?? Reflect.ownKeys(r);
        for (const l of i) {
            const i = r[l];
            if (i === undefined) continue;
            // Per-key accessor handling: the node's cached flag plus ONE getter
            // probe on the incoming side (getters arriving via merge/adoption).
            // Setter-only props read as data (value undefined) so lookupSetter is
            // not consulted on this hot path; prototype getters never own nodes.
                        if (i.acc === true || hasOwn.call(t, l) && lookupGetter.call(t, l) !== undefined) {
                i.acc = isOwnAccessor(t, l);
                const e = Object.getOwnPropertyDescriptor(n, l);
                const r = Object.getOwnPropertyDescriptor(t, l);
                if (e && (e.get || e.set) || r && (r.get || r.set)) {
                    if (e?.get !== r?.get || e?.set !== r?.set || e?.value !== r?.value) setSignal(i, () => FORCE);
                    continue;
                }
                if (!isEqual(e?.value, r?.value)) setSignal(i, () => r?.value);
                continue;
            }
            // No old-side pre-compare: t.v lags across multi-batch windows (a
            // projection recompute can run before the prior fold commits) — the
            // node's OWN current value is the true old side, and setSignal's
            // internal equality already checks exactly that.
                        const o = e.del !== null && e.del.has(l) ? undefined : t[l];
            // The derived store's setter reaching a leaf its own fold staged under
            // another transaction: not a proposal — the fold re-runs (#3612).
                        if (derivedSetter !== null && i.De === derivedSetter && heldDerivation(i)) heldDerivationHit = true;
            setSignal(i, () => o);
        }
    }
    const o = e.h;
    if (o !== null) {
        const n = l ?? Reflect.ownKeys(o);
        for (const r of n) {
            const n = o[r];
            if (n !== undefined) setSignal(n, r in t && !(e.del !== null && e.del.has(r)));
        }
    }
    // Deep-witness (dk): setter writes must notify a deep() subscriber even on
    // keys with no node. O(written/pb keys) equality only when a witness exists.
        if (e.dk !== null) {
        if (e.del !== null && e.del.size !== 0) bumpDeep(e); else for (const r of l ?? Reflect.ownKeys(t)) {
            if (r === $OWNER) continue;
            const i = t[r];
            const l = n[r];
            if (i !== null && typeof i === "object" ? !targetsEqual(l, i) : !isEqual(l, i)) {
                bumpDeep(e);
                break;
            }
        }
    }
    if (e.k !== null) {
        let r;
        if (e.ovl) {
            // Overlay membership: only NEW own keys or deletes can change it.
            r = e.del !== null && e.del.size !== 0;
            if (!r) {
                for (const e of Reflect.ownKeys(t)) {
                    if (!hasOwn.call(n, e)) {
                        r = true;
                        break;
                    }
                }
            }
        } else {
            r = Array.isArray(t) && Array.isArray(n) ? arrayStructureChanged(n, t) : membershipChanged(n, t);
        }
        if (r) setSignal(e.k, e => e + 1);
    }
    // Projection backing folds split by channel (two pinned contracts):
    // - sync-derive drafts (recompute body): NEVER eager — a downstream async
    //   hold can form LATER in the same flush and the leaf must stay at stale
    //   committed for context-free readers (spec-async "pends only the written
    //   leaf"). drainFolds commits when held-ness is knowable.
    // - post-await async LANDINGS (write-override per-op, microtask context —
    //   no enclosing flush can capture them): the data-level commit is
    //   IMMEDIATE — landed truth shows to untracked readers even while a
    //   downstream consumer's own async still holds the effect-level reveal
    //   (spec-async "verdicts never inherit consumers' in-flight state").
    //   EXCEPT under an active transaction (#3164 fold): a landing riding a
    //   retaining transaction (the optimistic module's aroundWrite binds it)
    //   stages instead — ensurePB stamped foldBatches, so the backing commits
    //   with the transaction and the reveal is atomic at settle. The pinned
    //   immediate-commit contract is stated over the no-transaction microtask
    //   posture, which `activeTransition === null` is exactly.
        if (e.fam !== null && e.pb !== null && getWriteOverride() && activeTransition === null) {
        // Landed truth (post-await write-override): immediately visible to every
        // reader — any staged held view is superseded.
        if (e.ht !== null) e.ht = e.hv = null;
        // Overlay landing (#3352): flatten in place — identity-stable, and
        // privatizeCommitted re-slots the parent itself when it has to clone an
        // unowned seed, so no path copy is needed. A landing that changed the
        // key set rebuilds instead (#3689) and swaps like a clone-path landing.
                if (e.ovl) {
            if (!overlayRebuilds(e, t)) return flattenOverlay(e, t);
            t = materializePB(e);
        }
        const n = e.v;
        e.pb = null;
        e.v = t;
        e.ch = false;
        if (e.u) {
            // Identity-resolved slot (#3282) — see drainFolds' path-copy twin.
            const r = parentSlotKey(e, n);
            if (e.u.v[r] === n) {
                privatizeCommitted(e.u);
                devAssertNeverUserMutation(e.u.v);
                e.u.v[r] = t;
            }
        }
    }
}

const FORCE = Symbol();

/** Same logical slot: both values resolve to one (re-pointed) child target —
 * adoption preserved identity, so the slot did not change (R9). */ function targetsEqual(e, t) {
    if (e === null || typeof e !== "object" || t === null || typeof t !== "object") return false;
    const n = lookupTarget(e, null);
    return n !== undefined && n === lookupTarget(t, null);
}

function arrayStructureChanged(e, t) {
    if (e.length !== t.length) return true;
    for (let n = 0; n < t.length; n++) {
        const r = e[n];
        const i = t[n];
        if (!isEqual(r, i) && !targetsEqual(r, i)) return true;
    }
    return false;
}

function membershipChanged(e, t) {
    const n = Reflect.ownKeys(t);
    // The $OWNER stamp is not membership: an owned side counts one key more.
        if (Reflect.ownKeys(e).length - +isOwned(e) !== n.length - +isOwned(t)) return true;
    for (const t of n) if (t !== $OWNER && !(t in e)) return true;
    return false;
}

/**
 * The fold diff walks SUBSCRIPTION KEYS ONLY (legacy parity: `for key in
 * nodes`): nodes exist exactly where something tracked, so unobserved data
 * costs nothing here regardless of object size. Accessor safety rides the
 * sticky `t.a` flag — a node's key was necessarily read, so the get trap has
 * already seen whether it is an accessor.
 */
/** One node's fold notification (shared by notifyFold's walk and the fused
 * adoption walk): accessor-aware compare + equality/identity-gated setSignal. */ function notifyKeyDiff(e, t, n, r, 
// The incoming-side getter probe covers SETTER-channel arrivals (return-
// form merges, defineProperty) — those flow through notifyWrites/
// notifyFold, which probe. The RECONCILE channel (fused walk) passes
// false: reconcile adopts immutable data by contract (R2a) and the pinned
// getter-preservation tests are all setter-channel; skipping ~2 Annex-B
// calls per key per tick is a measured dbmon win.
i = true) {
    if (e.acc === true || i && hasOwn.call(r, t) && lookupGetter.call(r, t) !== undefined) {
        e.acc = isOwnAccessor(r, t);
        const i = Object.getOwnPropertyDescriptor(n, t);
        const l = Object.getOwnPropertyDescriptor(r, t);
        if (i && (i.get || i.set) || l && (l.get || l.set)) {
            // Accessor involved: never invoke; force-notify on shape change so
            // subscribers re-read (and re-track) through the trap.
            if (i?.get !== l?.get || i?.set !== l?.set || i?.value !== l?.value) setSignal(e, () => FORCE);
            return;
        }
        const o = i?.value;
        const s = l?.value;
        if (!isEqual(o, s) && !targetsEqual(o, s)) setSignal(e, typeof s === "function" ? () => s : s);
    } else {
        const i = n[t];
        const l = r[t];
        // Direct value write when not a function (setSignal treats functions as
        // updaters) — saves a closure allocation per changed key on the fold
        // hot path.
                if (!isEqual(i, l) && !targetsEqual(i, l)) setSignal(e, typeof l === "function" ? () => l : l);
    }
}

/** Accessor-flag probe for the fused walk's early-continue (accessor keys
 * can never identity-skip: their VALUE is the descriptor's product). */ function hasAccessorFlag(e) {
    return e.acc === true;
}

/** Fused-walk per-key notification with values already in hand: the caller
 * fetched both sides and handled the identity skip; this applies the
 * accessor branch (cached flag only — reconcile channel) or the plain
 * equality/identity-gated write. */ function notifyKeyValue(e, t, n, r, i, l) {
    if (e.acc === true) {
        notifyKeyDiff(e, t, i, l, false);
        return;
    }
    // The pre-compare is NOT redundant with the node's equals: setSignal parks
    // a pending value and registers with the batch before equality applies at
    // commit (RUL-1), so identity-preserved slots (adopted child containers —
    // every row's fresh `queries` array) must be gated out HERE or each one
    // pays the full write machinery every tick (measured: +0.5ms/tick dbmon).
        if (!isEqual(n, r) && !targetsEqual(n, r)) setSignal(e, typeof r === "function" ? () => r : r);
}

/** Presence + membership halves of a fold notification (shared tail). */ function notifyFoldTail(e, t, n) {
    const r = e.h;
    if (r !== null) {
        for (const e of Reflect.ownKeys(r)) setSignal(r[e], e in n);
    }
    if (e.k !== null) {
        const r = Array.isArray(n) && Array.isArray(t) ? arrayStructureChanged(t, n) : membershipChanged(t, n);
        if (r) setSignal(e.k, e => e + 1);
    }
}

function notifyFold(e, t, n) {
    if (e.dk !== null && t !== n) bumpDeep(e);
    // Optimistic targets: adoption notifications are authoritative landings —
    // bypass the engine (commit into _value; active overrides keep shadowing
    // until their transaction settles, per the no-revert-stash contract).
        if (e.fam?.opt && !projectionWriteActive) {
        setProjectionWriteActive(true);
        try {
            notifyFold(e, t, n);
        } finally {
            setProjectionWriteActive(false);
        }
        return;
    }
    const r = e.n;
    if (r !== null) {
        for (const e of Reflect.ownKeys(r)) {
            notifyKeyDiff(r[e], e, t, n);
        }
    }
    const i = e.h;
    if (i !== null) {
        for (const e of Reflect.ownKeys(i)) setSignal(i[e], e in n);
    }
    if (e.k !== null) {
        // Key-set/$TRACK: objects notify on membership; arrays on any index or
        // length change (mapArray and iteration re-read values — R15).
        const r = Array.isArray(n) && Array.isArray(t) ? arrayStructureChanged(t, n) : membershipChanged(t, n);
        if (r) setSignal(e.k, e => e + 1);
    }
}

// ---------------------------------------------------------------------------
// traps
/** >0 while inside a setter: writes allowed, reads are read-your-writes. */ let writing = 0;

/** Write scope keys (a family object or a plain store's root target): draft
 * semantics — write permission, read-your-writes, tracking suppression —
 * apply ONLY to targets under a scope being written. Reads of OTHER stores
 * inside a setter track normally (they are dependencies: a projection derive
 * reading another store must link it). */ let writeScopes = null;

function scopeKey(e) {
    if (e.fam !== null) return e.fam;
    let t = e;
    while (t.u !== null) t = t.u;
    return t;
}

function inDraft(e) {
    return writeScopes !== null && writeScopes.has(scopeKey(e));
}

/** Shallow serve rule (#2932): raw-marked data serves VERBATIM, but a
 * store-proxy slot value gets a boundary wrapper in THIS store's own family —
 * write isolation through derived chains (downstream writes must never land
 * upstream). markRawOne skips proxies for exactly this reason. */ function serveShallow(e, t, n) {
    if (n !== null && typeof n === "object" && n[$TARGET] !== undefined) return draftServe(e, wrapNext(n, e, t));
    return n;
}

/** Draft reads extend write permission to reachable stores (legacy Writing
 * semantics: wrapping a child through a draft get admits it — cross-store
 * writes like `s.inner.a = 10` work when `inner` is another store's proxy). */ function draftServe(e, t) {
    if (writeScopes !== null && inDraft(e)) {
        const e = t?.[$TARGET];
        if (e !== undefined && e.v !== undefined) writeScopes.add(scopeKey(e));
    }
    return t;
}

/** Targets written during the current (outermost) setter — notified at exit. */ const pendingNotify = new Set;

/** Targets adopted under a live transaction this setter (adoptPB set a
 * transaction hold) — their nodes are notified at the outermost exit. */ const heldAdoptions = new Set;

/**
 * Write-time notification for a transaction-held adoption (#3330 store twin;
 * the setter path's notifyWrites twin for adoptions). A projection's fold
 * normally notifies its nodes at the drain — and the drain of a batch parked
 * in a live transaction is the transaction's COMMIT, so the nodes took the
 * adopted values as fresh writes at commit time: every subscriber was
 * re-marked and re-ran against a frame the lane had already published (a
 * third `v=1 d=2`), where a signal's write had staged at write time and
 * promoted silently. Staging here, inside the transaction's batch, makes the
 * two paths one: the nodes carry transition-stamped `_pendingValue`s, their
 * subscribers recompute in this flush and park with the transaction, and the
 * commit promotes without re-notifying. `ab` moves to the adopted backing —
 * the view the nodes were last told (#3296) — so the drain has nothing left
 * to say and only path-copies.
 */ function stageHeldAdoptions() {
    const e = [ ...heldAdoptions ];
    heldAdoptions.clear();
    for (const t of e) {
        const e = t.ab;
        if (e === null || e === t.v) continue;
        notifyFold(t, e, t.v);
        t.ab = t.v;
    }
}

const UNSAFE_KEYS = new Set([ "__proto__", "prototype", "constructor" ]);

/** Mirror of core read()'s context rule: the OWNER context (not the tracking
 * observer) decides pending visibility, with Roots resolving to their parent
 * computed (#2687 — untracked reads inside mapArray Roots see in-flight
 * values mid-flush). CHILDREN_FORBIDDEN execution scopes (createTrackedEffect
 * / onSettled callbacks) get COMMITTED visibility (#3006), same as core. */
/** Core read()'s reader: the current computation, a root reading as its
 * parent computed (`context` persists under untrack — an untracked read
 * inside an effect is still that effect's read). */ function readerContext() {
    const e = getOwner();
    return e === null ? null : e.Wn ? e.qn ?? null : e;
}

/** A pending fold is transition-held when any written node's parked value is
 * stamped by a live transition (a plain batch parking — the lazy-recompute
 * read case — has no transition stamp and serves fresh). */ function foldHeld(e) {
    const t = e.n;
    if (t === null) return false;
    for (const e of Reflect.ownKeys(t)) {
        const n = t[e];
        if (n._e !== NOT_PENDING && n.we != null && n.we.Rn !== true) return true;
    }
    return false;
}

/** The backing a reader is served. `key` (the get/has/descriptor traps)
 * scopes a fold hold to the keys the fold touched — see pendingBackingVisible —
 * and an adoption hold to the keys the adoption changed (heldKey). */ function readSource(e, t) {
    // Adoption hold first (#3074): an adoption staged under a live transaction
    // (or a latest()-pull, PLAIN_HOLD) serves the pre-hold committed view to
    // committed-visibility readers — context-free and children-forbidden ones,
    // and stale passes off a foreign hold. Drafts, write-override and latest()
    // see the adopted backing.
    const n = e.ht;
    if (n !== null && !latestReadActive && !inDraft(e) && !getWriteOverride()) {
        const r = heldMaskView(e);
        // A key the adoption left unchanged derives nothing from the hold, for
        // any reader (#3706): the backing serves it.
                if (r !== null && (t === undefined || heldKey(e, t))) {
            const e = readerContext();
            if (e === null || e.C & CONFIG_CHILDREN_FORBIDDEN || !holdVisible(n === PLAIN_HOLD ? null : currentTransition(n), e)) return r;
        }
    }
    return pendingBackingVisible(e, false, t) ? e.pb : e.v;
}

/** The single pb-vs-committed visibility decision (#3147), shared by per-key
 * backing reads (readSource) and deep()/snapshot composition (snapshotWalk)
 * so the two reader families can never disagree about a HELD landing.
 *
 * Signal-parity visibility (core read(): owner-context reads serve
 * _pendingValue, context-free reads serve committed — effects recompute
 * BEFORE commitPendingNodes in the flush, so the pending view must be
 * servable). Drafts (setter window OR projection write-override) and
 * owner-context reads see the pending backing; context-free reads see
 * committed. Node reads apply the same rule, so all homes agree.
 *
 * `speculative` is deep()/snapshot's posture: an untrack/deep PEEK that sees
 * ordinary pending staging regardless of owner context (the documented
 * divergence from context-free per-key reads) — but never through a hold:
 * held truth stays masked exactly as it is for per-key readers. */ function pendingBackingVisible(e, t, n) {
    if (e.pb === null) return false;
    // The writer's own channels compose on the pending backing regardless.
        if (inDraft(e) || getWriteOverride()) return true;
    // HELD truth on an optimistic family (#3164 fold) is masked from LANE
    // passes until the transaction's reveal (the backing-level twin of core
    // serve()'s CONFIG_HELD_TRUTH arm; authoritative postures and latest()
    // tunnel through inside heldTruthMasked). Every other reader takes the
    // hold arms below: committed for no pass, the staged backing for the
    // holding pass, stale-of-foreign or A29 for a foreign one.
        if (heldTruthMasked(e)) return false;
    const r = readerContext();
    if (r === null || r.C & CONFIG_CHILDREN_FORBIDDEN) {
        // No pass, or a children-forbidden one: the committed frame (A32) —
        // except the speculative peek (deep()/snapshot()), which sees ordinary
        // pending staging but never through a live foreign hold, and a
        // projection's pending backing, authoritative-elect for context-free
        // readers UNLESS a transition holds the node commits (downstream async
        // hold — stale committed is the contract; the write-time stamp covers
        // keys with no node, #3336) or the scope is children-forbidden (#3082).
        const n = liveFoldTransition(e);
        if (t) return n === null || ownsHold(n);
        return e.fam !== null && r === null && !foldHeld(e) && n === null;
    }
    const i = liveFoldTransition(e);
    // A hold changes what a reader of ONE key sees only through the fold's
    // writes to that key. A key the fold left alone reads the same from either
    // backing, so a pass reading it derives nothing from the hold: serve
    // committed, with no transaction entry and no stale replay (#3688 — a memo
    // reading an unchanged key beside an independent signal was held with
    // someone else's action). Per-node reads already have this precision (a
    // node with nothing staged enters nothing; stageHeldKey skips an equal
    // value); this is the same rule at the container gate. `wk` is the trap's
    // record of every write and delete this batch (deletes included, on the
    // overlay and clone paths alike); null (a fold with no trap writes) or
    // WK_ALL (an array length write) leaves the whole container held. Same
    // exclusions as heldFoldTransition: an optimistic family's draft is seeded
    // from node overrides the trap never saw, and a chained backing's
    // committed layer is a live proxy, not a frozen twin of the clone.
        if (i !== null && n !== undefined && !e.ch && e.fam?.opt !== true) {
        const t = e.wk;
        if (t != null && t !== WK_ALL && !t.has(n)) return false;
    }
    return holdVisible(i, r);
}

/** #3164 fold: HELD truth on an optimistic family — a pending backing
 * stamped by a live transition that retains optimism — is masked from LANE
 * passes only (a lane paints display-ahead at the park, so it keeps
 * committed until the transaction's reveal — owning transaction or not);
 * the authoritative postures and latest() tunnel through, and every other
 * reader is served by the ordinary hold arms (a deriving pass is held with
 * the truth, A29). Un-stamped backings and optimism-free transitions keep
 * ordinary mid-batch/speculation visibility. */ function heldTruthMasked(e) {
    if (e.fam?.opt !== true || currentOptimisticLane === null || latestReadActive || authoritativeServe()) return false;
    const t = foldBatches.get(e);
    // opt families are only created by createOptimisticStore, whose module
    // install populates optHooks — the assertion holds by construction.
        return t !== undefined && optHooks.retainsOptimism(t);
}

const hasOwn = Object.prototype.hasOwnProperty;

// Allocation-free own-accessor probe (replaces eager descriptor scans — the
// single biggest creation cost in the uibench profile): Annex-B lookups
// return the fn or undefined with no descriptor object. Own data properties
// shadow prototype accessors, so hasOwn + lookup is an exact own-check.
const lookupGetter = Object.prototype.__lookupGetter__;

const lookupSetter = Object.prototype.__lookupSetter__;

const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

function isOwnAccessor(e, t) {
    return hasOwn.call(e, t) && (lookupGetter.call(e, t) !== undefined || lookupSetter.call(e, t) !== undefined);
}

/** Authoritative-write wrapper exported for the optimistic module: sets the
 * scheduler's projectionWriteActive through THIS module's binding (proven to
 * share the instance core reads — cross-module live-binding writes from other
 * store modules were observed not to propagate under the test transform). */ function runAuthoritative(e) {
    const t = projectionWriteActive;
    setProjectionWriteActive(true);
    try {
        return e();
    } finally {
        setProjectionWriteActive(t);
    }
}

/** The reading computation is until()'s authoritative-view predicate — same
 * source of truth as core read()'s A17 carve-out (`context`, which persists
 * under untrack). optimisticView()'s composition gate consults exactly this:
 * write-side machinery (patch emission, tentative re-application) must keep
 * composing even when it runs inside an authoritative-write bracket. */ function authoritativeRead() {
    const e = context;
    return e !== null && (e.C & CONFIG_AUTHORITATIVE_READ) !== 0;
}

/** Serve-side authoritative gate: until()'s predicate PLUS truth authors —
 * the projection derive's draft (wrapDraft trap brackets, runAuthoritative;
 * the same posture pair ensurePB classifies drafts by). A source computing
 * the next truth must never read its callers' tentative overlays: a derive
 * continuation's `store.push` computing its index from an action's
 * optimistic row landed truth in the wrong slot and corrupted committed
 * state (#3108). Trap-level overlay serves gate on this so values, length,
 * membership, and keys leave the authoritative view together. */ function authoritativeServe() {
    return projectionWriteActive || getWriteOverride() || authoritativeRead();
}

/** Context-aware node view for reads outside tracking: active override >
 * held pending (owner context) > the BACKING value. Committed truth lives in
 * the backing (single-home rule, O6) — node `_value` is never served here,
 * so a lazy recompute's landing is immediately visible to the untracked
 * reader that forced it (backing commits eagerly; node values fold at flush).
 * FORCE sentinels never surface (they only bump subscribers of accessor
 * keys, which are served by the trap, not the node). */ function nodeValue(e, t) {
    // Store-only tunnels, ahead of Rule 1: truth authors (authoritativeServe —
    // the projection derive's draft, the write-override continuation) see
    // staged truth and never an override; latest() reaching this untracked
    // path for a store key sees the in-flight parked value like an
    // owner-context reader does (#3075), the visible override first.
    let n;
    if (authoritativeServe()) n = e._e !== NOT_PENDING ? e._e : t; else if (latestReadActive) n = visibleOverride(e) ? unwrapOverride(e.o?.Fe) : e._e !== NOT_PENDING ? e._e : t;
    // Otherwise the one slow selection core read() uses (serve): override,
    // lane gate, A28, readerSeesCommitted / A29 — with the BACKING as the
    // committed value (single-home rule, O6).
     else n = serve(e, readerContext(), e.De || e, t);
    return n === FORCE ? t : n;
}

/** The override a composed READER view (keys, descriptors, snapshot/deep,
 * optimisticView) takes from an armed node whose override is active — the
 * override itself, unless the node's own source superseded it (#3331,
 * CONFIG_OVERRIDE_SUPERSEDED): then the reader-aware selection `serve`
 * makes through nodeValue, so the composed view agrees with what `get`,
 * `in` and `length` serve the same reader (a deriving pass: the staged
 * truth; a lane pass or a context-free read: the override, A18). Composing
 * the raw override left Object.keys / snapshot() / deep() one row behind the
 * traps at a landing whose shape differed from the optimistic frame (F5
 * parity cases). Draft and authoritative callers never reach here — the
 * writer composes on hasActiveOverride, truth authors on the backing. */ function readerOverride(e, t) {
    return e.C & CONFIG_OVERRIDE_SUPERSEDED ? nodeValue(e, t) : unwrapOverride(e.o?.Fe);
}

/** §7b: a chained target's child found as a RAW — from its pending backing
 * (a cloneRaw of the inner proxy, whose descriptors yield the inner store's
 * raws) or from the deep() walk's descriptor read through the chain — must
 * resolve to the inner family's proxy for that object before this family
 * wraps it, so the overlay serves the same chained targets as the settled
 * state. Otherwise every row re-wrapped as a fresh non-chained target keyed
 * by the raw: identities churned for the life of an optimistic action and
 * snapped back at settle, and writes landed on those orphans while deep()'s
 * witnesses sat on the chained targets (#3323). The inner family owns the
 * raw iff it has served it or its backing holds that exact object at `key`;
 * anything else is a draft's own replacement object — view-owned, correctly
 * non-chained — and is returned as is. Recurses down further chains. */ function resolveChainedRaw(e, t, n) {
    const r = e.v[$TARGET];
    if (r.ch) {
        const e = resolveChainedRaw(r, t, n);
        return e === n ? n : wrapNext(e, r, t);
    }
    const i = lookupTarget(n, r.fam);
    if (i !== undefined) return i.px;
    if ((r.v[t] === n || r.pb?.[t] === n) && isWrappable(n)) return wrapNext(n, r, t);
    return n;
}

/** Serve an own data key: node-first when a node exists (pending visibility,
 * holds, lanes ride the node); backing otherwise. Chained backings (§7b: the
 * backing IS another store's proxy) serve the read-through value — the outer
 * node is linked only for adoption-swap notification, its value never
 * shadows the live chain. */ function serveDataKey(e, t, n, r, i, l = -1) {
    const o = e.ch && r === e.v;
    let s = n;
    // §6: on optimistic arrays LENGTH IS A VIEW, not a node value — one home
    // (backing ± presence overrides) for both length and indices makes torn
    // iteration impossible (a length node's value rides different visibility
    // rails than index overrides mid-settle). The node carries subscriptions;
    // its committed `_value` is never served here.
        if (t === "length" && e.fam?.opt === true && !o && Array.isArray(r)) {
        if (!inDraft(e)) {
            const i = e.n?.length;
            if (i !== undefined) {
                // An override-covered length node answers through the node's
                // reader-aware selection (serve: A17, the lane gate, A18
                // supersession) with the backing's length as committed — the rule
                // every index node takes through `get`, so `length` and indices
                // resolve against ONE rule for this reader. The view composition
                // below used to answer here and knows nothing of supersession
                // (#3331): at a landing whose length differs from the optimistic
                // frame, mapArray's tracked `length` (the get trap's node path) saw
                // the staged truth while its untracked `slice` inside its owner saw
                // the override, so `_items` came up short and the next pass keyed an
                // undefined row (F5, optimistic-list-mutation-matrix `differ`).
                if (getObserver() !== null) {
                    const e = read(i);
                    if (hasActiveOverride(i) && !authoritativeServe()) return e === FORCE ? r.length : e;
                } else if (hasActiveOverride(i) && !authoritativeServe()) {
                    return nodeValue(i, r.length);
                }
            } else if (getObserver() !== null) {
                read(getNode(e, t, n));
            }
        }
        // Truth authors read the backing's own length — an optimistic row from
        // the caller's transaction must not shift where the author's next write
        // lands (#3108). A tentative draft that has seeded its backing from the
        // view already carries the overrides in `src` (the draft arm every other
        // channel gates on draftSeesOverrides — `get`, `has`, visibleKeys,
        // snapshotWalk, #3665): composing them again put a slot the draft had
        // just spliced out back on top of its shrunken backing, so `length` read
        // one too long mid-splice and the second splice left a hole (F3,
        // optimistic-list-mutation-matrix "move head->tail + move middle").
                return (authoritativeServe() || inDraft(e) && !draftSeesOverrides(e) ? r : optHooks.optimisticView(e, r, inDraft(e))).length;
    }
    if (inDraft(e)) {
        // Optimistic drafts before their first write have no pending backing yet;
        // reads must still see the live optimistic view (compose, not clobber —
        // #2951). Once ensurePB runs, the seeded clone carries the view.
        // AUTHORITATIVE drafts (projection derive) never overlay — ensurePB's
        // seeding rule, applied to the read side (#3108).
        if (e.fam?.opt && draftSeesOverrides(e) && !authoritativeServe()) {
            const n = e.n?.[t];
            if (n !== undefined && hasActiveOverride(n)) s = unwrapOverride(n.o?.Fe);
        }
    } else {
        // §7b: a lane value on the outer node SHADOWS read-through — an active
        // override pierces the chained gate; otherwise chained backings always
        // serve the live inner value.
        if (getObserver() !== null) {
            // First tracked read: create + link (the wrap-cache branch below
            // populates px/pxv so read #2 skips wrapNext, slice 2). The value is
            // served THROUGH the node from this read on — a node born under a held
            // fold carries the hold (getNode, #3336), and the backing it was read
            // from does not.
            if (i === undefined) i = getNode(e, t, n, l);
            // read()'s plain-signal fast path hoisted over the call (legacy trap
            // parity): READ_SLOW = a global read window or non-plain node.
                        let r = readNodeFast(i);
            if (r === READ_SLOW) r = read(i);
            if (!o || hasActiveOverride(i)) s = r === FORCE ? n : r;
        } else if (i !== undefined && (!o || hasActiveOverride(i))) {
            s = nodeValue(i, n);
        }
    }
    // Shallow stores serve data raw; store-proxy slots get boundary wrappers.
        if (e.s) return serveShallow(e, t, s);
    if (e.ch && !o && s !== null && typeof s === "object" && s[$TARGET] === undefined) s = resolveChainedRaw(e, t, s);
    if (i !== undefined) {
        // Wrap cache (see getNode): only wrappables are ever cached, so a hit
        // skips isWrappable too — pointer-compare replaces both checks.
        if (i.pxv === s && s !== undefined) return draftServe(e, i.px);
        if (!isWrappable(s)) return s;
        const n = wrapNext(s, e, t);
        i.px = n;
        i.pxv = s;
        return draftServe(e, n);
    }
    if (!isWrappable(s)) return s;
    return draftServe(e, wrapNext(s, e, t));
}

/** §6c store-wide status gate for reads that DON'T flow through a node:
 * untracked/raw fallthrough must still throw while the derive is
 * uninitialized (seed invisibility, proj R23) or errored (memo parity).
 * TRACKED reads never call this — store nodes carry `_firewall`, so core
 * read() links the node and throws the firewall's error itself (the node
 * link is what wakes async-memo readers when the landing writes values;
 * the firewall link rides the same read). */ function firewallGate(e) {
    // Own-draft ops are exempt: an async derive's continuation (generator body
    // after an `await`/`yield`) runs OUTSIDE the sync write scope (inDraft is
    // already false), but its draft-proxy traps mark every op with the write
    // override. Those reads are the derive working its own draft (state.push
    // reading .length) — gating them throws NotReadyError back into the derive
    // itself, which the post-await read diagnostic (#2987) then escalates to a
    // reactivity halt. The gate exists for EXTERNAL readers (seed invisibility,
    // proj R23); the derive is the author.
    if (projectionWriteActive || getWriteOverride()) return;
    const t = e.fam?.node;
    if (t != null && t.h & (STATUS_UNINITIALIZED | STATUS_ERROR)) read(t);
}

/** latest() pull (#3075): bring the projection computed up to date so the
 * read serves the IN-FLIGHT derivation — signal/memo parity, where core
 * read() routes latest() through a companion that recomputes speculatively.
 * The latest flag is suspended for the recompute (the derive's own reads
 * are normal reads), and latestPullActive marks any adoption it commits as
 * staged (see adoptPB) — the speculative swap must not leak to
 * committed-visibility readers before the flush. */ function pullProjectionForLatest(e) {
    const t = e.fam.node;
    if (t == null) return;
    const n = latestReadActive;
    setLatestReadActive(false);
    const r = latestPullActive;
    latestPullActive = true;
    try {
        prepareComputed(t, true);
    } finally {
        latestPullActive = r;
        setLatestReadActive(n);
    }
}

const traps = {
    get(e, t, n) {
        // One typeof gates every brand-symbol compare off the hot string path
        // (four symbol comparisons per property read otherwise).
        if (typeof t !== "string") {
            if (t === $TARGET) return e;
            if (t === $PROXY) return n;
            if (t === $OWNER) return undefined;
 // ownership stamp: never a user key
                        if (t === $RECORD) return undefined;
 // a store is no view (see `viewOf`)
            // refresh()/isPending resolve the projection computed through $REFRESH.
                        if (t === $REFRESH) return e.fam?.node ?? undefined;
            if (t === $TRACK) {
                if (pendingCheckActive) witnessAffectsMark(e, t);
                if (e.fam !== null && getObserver() === null && !inDraft(e)) firewallGate(e);
                if (!inDraft(e) && getObserver() !== null) {
                    read(getKeySetNode(e));
                    // Structural chaining (§7b, #2864 / core R21): a chained backing's
                    // $TRACK reads through to the INNER store's key-set — structural
                    // notifications land on the source's own node, never on this
                    // wrapper view's.
                                        const t = readSource(e);
                    if (t[$TARGET] !== undefined) t[$TRACK];
                }
                return undefined;
            }
            // user symbols fall through to the generic path
                }
        if (pendingCheckActive) witnessAffectsMark(e, t);
        if (e.fam !== null && getObserver() === null && !inDraft(e)) firewallGate(e);
        // latest() pull (#3075): store traps never reach core read() without an
        // observer, so bring the projection computed up to date here — signal/
        // memo parity for latest() reads through a projection.
                if (e.fam !== null && latestReadActive && !inDraft(e) && !getWriteOverride()) pullProjectionForLatest(e);
        const r = readSource(e, t);
        // Overlay delete (#3044): a prototype overlay cannot shadow a delete, so
        // deleted keys are tracked aside and read as absent in the pending view.
                if (e.del !== null && r === e.pb && e.del.has(t)) {
            if (!inDraft(e) && getObserver() !== null) read(getNode(e, t, undefined));
            return undefined;
        }
        // Hot inline case: existing PLAIN node (non-accessor), unchained backing,
        // tracked read of a present data key — the dbmon/uibench effect re-read
        // shape. Skips serveDataKey's frame, the FORCE compare (only accessor
        // keys ever hold the sentinel), and isWrappable for primitives.
        // ONE node-map lookup serves this block and the accessor probe below
        // (nothing between them creates nodes).
                const i = e.n?.[t];
        if (e.ch === false && writeScopes === null) {
            const n = i;
            if (n !== undefined && n.acc !== true && getObserver() !== null) {
                let r = readNodeFast(n);
                if (r === READ_SLOW) r = read(n);
                if (r === null || typeof r !== "object") return r;
                if (e.s) return serveShallow(e, t, r);
                if (n.pxv === r) return n.px;
                if (isWrappable(r)) {
                    const i = wrapNext(r, e, t);
                    n.px = i;
                    n.pxv = r;
                    return i;
                }
                return r;
            }
        }
        // Accessor keys serve through Reflect.get with the PROXY receiver
        // (R20/R29: internal reads track; the node is linked for shape-change
        // notification but its value is never served). Accessor-ness comes from
        // the node's cached flag; the first TRACKED read (which creates the
        // node) probes once — untracked node-less reads take the plain path,
        // where a raw-receiver getter still returns correct committed values.
        // Tracking suppression is PER-TARGET (inDraft), never global: `writing`
        // counts every open setter anywhere, and a projection derive runs its
        // whole body inside one — a global gate silently swallowed EXTERNAL
        // absent-key/accessor subscriptions for every store read during any
        // derive, leaving nested projections permanently dependency-less when
        // their sources hadn't materialized yet (#3037).
        // First-read dedupe (create-floor slice 2): remember the probe verdict —
        // node creation downstream reuses it instead of re-scanning the
        // descriptor, but only when the probed object IS the one getNode would
        // scan (pb ?? v).
                let l = -1;
        {
            let o;
            if (i !== undefined) o = i.acc === true; else if (!inDraft(e) && getObserver() !== null) {
                o = isOwnAccessor(r, t);
                if (r === (e.pb ?? e.v)) l = o ? 1 : 0;
            } else o = false;
            if (o) {
                if (!inDraft(e) && getObserver() !== null) read(i ?? getNode(e, t, undefined, l));
                const o = Reflect.get(r, t, n);
                if (e.s) return serveShallow(e, t, o);
                return isWrappable(o) ? draftServe(e, wrapNext(o, e, t)) : o;
            }
        }
        // Plain-data fast path: no descriptor allocation per read.
        // Inherited pollution keys are never served (core R30) — checked before
        // the proto-function branch can leak `constructor`. Interned-string
        // compares beat a Set hash on this per-read path. Overlay pending
        // backings chain to the committed backing, so "own in the view" means
        // own on either layer (ownInView) — a genuine prototype method is one
        // that is own on NEITHER.
                const o = e.ovl && r === e.pb;
        if ((t === "constructor" || t === "__proto__" || t === "prototype") && !hasOwn.call(r, t) && !(o && hasOwn.call(e.v, t))) return undefined;
        let s = r[t];
        if (s === undefined ? !hasOwn.call(r, t) && !(o && hasOwn.call(e.v, t)) : false) {
            // Inherited: prototype getters/methods run with the proxy receiver.
            s = Reflect.get(r, t, n);
            if (typeof s === "function") return s;
 // proto methods untracked
            // Reading a currently-absent own key subscribes to it (R12) — for any
            // target OUTSIDE its own draft scope, even mid-setter (#3037, above).
                        if (s === undefined && !inDraft(e)) {
                if (getObserver() !== null) read(getNode(e, t, undefined, l));
                const n = e.n?.[t];
                if (n) {
                    const r = nodeValue(n, undefined);
                    if (e.s) return serveShallow(e, t, r);
                    return isWrappable(r) ? draftServe(e, wrapNext(r, e, t)) : r;
                }
            } else if (s === undefined && inDraft(e) && e.fam?.opt && draftSeesOverrides(e) && 
            // AUTHORITATIVE drafts (landing folds) never seed from overrides —
            // the caller's optimism is not truth (has-trap twin below).
            !authoritativeServe()) {
                const n = e.n?.[t];
                // The draft is a WRITER channel (hasActiveOverride's rule): it
                // composes on the tick's own unflushed adds, as the has trap's draft
                // arm, visibleKeys and optimisticView do. Reader-gating this arm
                // (visibleOverride) made a second setter in the same action read
                // `undefined` where the first had pushed a row (#3665, rc.9).
                                if (n !== undefined && hasActiveOverride(n)) s = unwrapOverride(n.o?.Fe);
            }
            if (e.s) return serveShallow(e, t, s);
            return isWrappable(s) ? draftServe(e, wrapNext(s, e, t)) : s;
        }
        if (typeof s === "function" && !hasOwn.call(r, t) && !(o && hasOwn.call(e.v, t))) return s;
 // proto method
                return serveDataKey(e, t, s, r, i, l);
    },
    has(e, t) {
        if (t === $TARGET || t === $PROXY || t === $TRACK) return true;
        if (t === $OWNER || t === $RECORD) return false;
        if (pendingCheckActive) witnessAffectsMark(e, t);
        if (e.fam !== null && getObserver() === null && !inDraft(e)) firewallGate(e);
        const n = readSource(e, t);
        let r = t in n;
        // Overlay deletes read as absent in the pending view (#3044).
                if (r && e.del !== null && n === e.pb && e.del.has(t)) r = false;
        if (!inDraft(e)) {
            if (getObserver() !== null) {
                const n = getHasNode(e, t, r);
                // Authoritative-view readers get the right answer for free: core read()
                // skips the override arm for them, so nv is authoritative presence.
                                const i = read(n);
                if (hasActiveOverride(n)) r = !!i;
            } else if (!authoritativeServe()) {
                const n = e.h?.[t];
                // The get trap's untracked selection (nodeValue → serve), so `in`
                // agrees with the tracked branch above and with `get`: a presence
                // override the landing superseded (#3331 — an optimistic delete
                // whose slot the truth refilled) answers the staged truth for a
                // deriving reader. Reading the override directly said "absent" while
                // `get` served the landed row, and HasProperty-driven copies (slice,
                // spread, map) left a hole (F5 `differ: delete *`).
                                if (n !== undefined && hasActiveOverride(n)) r = !!nodeValue(n, r);
            }
        } else if (e.fam?.opt && draftSeesOverrides(e) && !authoritativeServe()) {
            const n = e.h?.[t];
            if (n !== undefined && hasActiveOverride(n)) r = !!unwrapOverride(n.o?.Fe);
        }
        return r;
    },
    ownKeys(e) {
        if (pendingCheckActive) witnessAffectsMark(e);
        if (e.fam !== null && getObserver() === null && !inDraft(e)) firewallGate(e);
        if (!inDraft(e) && getObserver() !== null) read(getKeySetNode(e));
        return visibleKeys(e, readSource(e));
    },
    getOwnPropertyDescriptor(e, t) {
        if (t === $OWNER || t === $RECORD) return undefined;
        // A descriptor read is a PRESENCE read: it subscribes to the key's
        // presence node and witnesses affects()/isPending() exactly as `in` does
        // (structural oracle, 2026-09-17 — the trap read no node before, so a
        // render effect inspecting a key through getOwnPropertyDescriptor never
        // re-ran for an optimistic add or delete, and an isPending() probe over
        // it witnessed nothing). The value it reports rides the value node's
        // view through visibleDescriptor.
        
        // EXCEPT for an enumerator (#3664): Object.keys / for...in / spread /
        // Object.entries / JSON.stringify take this trap once per key right
        // after `ownKeys`, which already subscribed the observer to the key-set
        // node — and that node bumps on every membership change, committed or
        // optimistic, so a presence node per key adds nothing the enumerator
        // can observe (rc.9 birthed one per key per object: ~640 B and a graph
        // node each, 10x the memory of a 30-key row's reader). When the
        // observer holds the key-set node in THIS pass, skip the presence read;
        // a lone descriptor read keeps its per-key precision.
                if (pendingCheckActive) witnessAffectsMark(e, t);
        const n = getObserver();
        if (e.fam !== null && n === null && !inDraft(e)) firewallGate(e);
        const r = readSource(e, t);
        const i = visibleDescriptor(e, r, t);
        if (!inDraft(e) && n !== null && !observerHoldsKeySet(e, n)) {
            // The node is born from the source's presence (as `has` births it),
            // not the override-adjusted answer.
            let n = t in r;
            if (n && e.del !== null && r === e.pb && e.del.has(t)) n = false;
            read(getHasNode(e, t, n));
        }
        if (i === undefined) return undefined;
        // Array targets carry a real non-configurable `length` the proxy
        // invariant forces us to report faithfully; everything else reports
        // configurable via target indirection (core R51).
                if (!(t === "length" && Array.isArray(e))) i.configurable = true;
        return i;
    },
    set(e, t, n) {
        // Writes require the target's draft scope OR the projection write
        // override (post-await async draft writes arrive outside any window);
        // everything else is silently ignored (R23).
        const r = inDraft(e);
        const i = !r && getWriteOverride();
        if (!r && !i) return true;
        if (t === "__proto__") return true;
 // pollution guard (core R30)
        // Unwrap BEFORE ensurePB: unwrapValue materializes a self-referencing
        // draft's overlay (replacing target.pb), so a pb local captured earlier
        // would be the abandoned overlay and the write would vanish.
        // Shallow slots store what was written VERBATIM — another store's proxy
        // passes through by reference (#2932; markRawOne skips proxies), while
        // deep stores unwrap to raw backings.
                const l = e.s ? n : unwrapValue(n);
        const o = ensurePB(e);
        pendingNotify.add(e);
        // Array length writes implicitly delete indices — the written-keys bound
        // can't see them, so poison to the full scan for this batch. Index
        // writes implicitly GROW length, so arrays always record it alongside.
                if (Array.isArray(o)) {
            if (t === "length") e.wk = WK_ALL; else if (e.wk !== WK_ALL) {
                const n = e.wk ??= new Set;
                n.add(t);
                n.add("length");
            }
        } else {
            if (e.wk !== WK_ALL) (e.wk ??= new Set).add(t);
            // Live own-key estimate for the overlay/clone choice (#3360) and the
            // overlay's commit choice (#3689): `in` sees through an overlay to the
            // committed keys, so this counts keys NEW to the container. Overlay
            // deletes are counted down when they commit (`del` is exact); clone-
            // path deletes are not (a stale high count on a narrow container only
            // picks the overlay a little early).
                        if (!(t in o)) e.kc++;
        }
        // Own data keys literally named "prototype"/"constructor" land as data —
        // defineProperty sidesteps a proto-chain setter named the same.
                if (UNSAFE_KEYS.has(t)) {
            Object.defineProperty(o, t, {
                value: l,
                writable: true,
                enumerable: true,
                configurable: true
            });
            if (e.del !== null) e.del.delete(t);
            return true;
        }
        // Overlay first-write DEFINES the own key: assignment through the proto
        // chain would reject on a non-writable committed property (the clone
        // path normalized descriptors for exactly this — R51 parity). A
        // plain-data-graded backing (sc 2, owned: every slot writable) takes the
        // bare assignment — it lands as an own key on the overlay all the same.
                if (e.ovl && e.sc !== 2 && !hasOwn.call(o, t)) {
            Object.defineProperty(o, t, {
                value: l,
                writable: true,
                enumerable: true,
                configurable: true
            });
        } else o[t] = l;
        if (e.del !== null) e.del.delete(t);
        // Shallow ingest: written records are sticky raw-marked (one entity is
        // never both deep-wrapped and raw — R41/#2932, shared invariant).
                if (e.s && l !== null && typeof l === "object") markRawOne(l);
        // Override-mode (post-await draft) writes have no setter exit — notify
        // per-op (setSignal equality-gates repeats).
                if (i) notifyWrites(e);
        return true;
    },
    defineProperty(e, t, n) {
        const r = inDraft(e);
        const i = !r && getWriteOverride();
        if (!r && !i) return true;
        if (t === "__proto__") return true;
        if (n.get || n.set) e.a = true;
        // Unwrap before ensurePB (see the set trap: self-reference materializes).
                if ("value" in n) n = {
            ...n,
            value: unwrapValue(n.value)
        };
        const l = ensurePB(e);
        // A non-default data descriptor (or an accessor) leaves the plain-data
        // grade: the key reaches the committed backing as defined, so the spread
        // clone and bare-assignment paths no longer describe it.
                if (e.a || !(n.enumerable && n.writable && n.configurable)) e.sc = 1;
        pendingNotify.add(e);
        if (e.wk !== WK_ALL) (e.wk ??= new Set).add(t);
        Object.defineProperty(l, t, n);
        if (e.del !== null) e.del.delete(t);
        if (i) notifyWrites(e);
        return true;
    },
    deleteProperty(e, t) {
        const n = inDraft(e);
        const r = !n && getWriteOverride();
        if (!n && !r) return true;
        const i = ensurePB(e);
        pendingNotify.add(e);
        if (e.wk !== WK_ALL) (e.wk ??= new Set).add(t);
        delete i[t];
        // A prototype overlay cannot shadow a delete of a committed key —
        // record it aside (#3044); reads/has/ownKeys/commit consult the set.
                if (e.ovl && hasOwn.call(e.v, t)) (e.del ??= new Set).add(t);
        if (r) notifyWrites(e);
        return true;
    }
};

/** Low-level setter primitive: opens write mode on a next proxy, runs `fn`,
 * emits write-time notifications at outermost exit, applies returned
 * replacements as adoptions. `guard=false` skips the dev guards (owned-scope
 * write, thenable result) — projection recomputes legitimately write from
 * inside their computed, and their async derive is handled by the recompute,
 * not returned through here. */
/** The derived store (`createStore(fn)`) whose user setter is running, and
 * whether one of its leaf notifications hit a staging another transaction
 * holds as the fold's result (A34 amendment, #3612; core heldDerivation). */ let derivedSetter = null;

let heldDerivationHit = false;

/** The derived store's setter (CS-R31): within a synchronous frame the manual
 * write wins — the projection's recompute is masked for the tick. Across a
 * hold the write is not a proposal: a leaf the fold staged under another
 * transaction re-runs the fold under it, the write being the draft's prior
 * state (#3612). Decided from the leaf notifications, so the mask lands
 * after them (in the `finally`: a throwing setter's writes before the throw
 * were notified, and are masked as before). */ function derivedStoreWrite(e, t, n) {
    derivedSetter = e;
    heldDerivationHit = false;
    try {
        storeSetterNext(t, n);
    } finally {
        derivedSetter = null;
        heldDerivationHit ? rederiveHeld(e) : suppressComputedRecompute(e);
    }
}

function storeSetterNext(e, t, n = true) {
    const r = e[$TARGET];
    const i = writeScopes;
    writeScopes = new Set;
    writeScopes.add(scopeKey(r));
    writing++;
    let l;
    try {
        // No untrack: the writing flag already disables store-node linking
        // (draft reads never self-track, proj R2), while EXTERNAL reads (signals
        // inside a projection derive) must keep tracking — they are the derive's
        // dependencies.
        l = t(e);
    } finally {
        writing--;
        writeScopes = i;
        // Outermost setter exit: emit write-time notifications (setSignal per
        // changed observed key) so transition holds and lanes engage now.
                if (writing === 0 && pendingNotify.size) {
            const e = [ ...pendingNotify ];
            pendingNotify.clear();
            for (const t of e) notifyWrites(t);
        }
    }
    if (l !== undefined && l !== e && isWrappable(l)) {
        // Returned replacement: on an optimistic family (outside authoritative
        // writes) the replacement is itself an optimistic edit — diff it against
        // the visible view as engine writes (reverts at settle). Otherwise it is
        // an adoption of the incoming object (unowned).
        if (r.fam?.opt && !projectionWriteActive && !getWriteOverride()) {
            optHooks.notifyOptimisticWrites(r, unwrapValue(l));
        } else {
            adoptPB(r, unwrapValue(l));
        }
    }
    if (writing === 0 && heldAdoptions.size) stageHeldAdoptions();
}

// Affects integration: the legacy affects machinery reads next targets
// structurally (aliased field names); only node CREATION dispatches here.
setNextAffectsNodeResolver((e, t) => t === $AFFECTS ? getNode(e, $AFFECTS, undefined) : getNode(e, t, (e.pb ?? e.v)[t]));

function createStoreNext(e, t = false) {
    const n = wrapNext(e);
    if (t) {
        n[$TARGET].s = true;
        markRawIngest(e);
    }
    const setter = e => storeSetterNext(n, e);
    return [ n, setter ];
}

// ---------------------------------------------------------------------------
// snapshot (next targets): the backing IS the plain raw graph — zero copy.
// Sees pending (R27) by reading pb. Chained/owned-copy caching lands with the
// utilities increment; this covers the createStore-suite contract.
/** True when `proxy` is a SHALLOW store (children served verbatim, slots
 * replaced by reference — #2932). The list driver uses this to choose the
 * slot-patch channel (collected row bodies) over per-record registration. */ function storeIsShallow(e) {
    const t = e?.[$TARGET];
    return t !== undefined && t.s === true;
}

/** True when `proxy` belongs to a projection/optimistic FAMILY. The list
 * driver must DECLINE family arrays (external audit finding): family
 * structural changes never emit row/slot ops (the setter channel is
 * fam-gated; optimistic writes ride node overrides), and the proxy identity
 * is stable so the each-watch cannot catch the change either — an engaged
 * list would freeze on optimistic/projection structural updates. Record-
 * level family patches are unaffected (they have their own emission). */ function storeHasFamily(e) {
    const t = e?.[$TARGET];
    return t !== undefined && t.fam !== null;
}

/** True when `proxy` belongs to an OPTIMISTIC family specifically. The list
 * driver declines these (audit finding, narrowed): optimistic user writes
 * ride node-level overrides — they never enter the reconcile walk, so no
 * row/slot ops are emitted and an engaged list would freeze on optimistic
 * structural changes. PROJECTION (non-optimistic) families are drivable:
 * their recomputes go through the reconcile walk, whose emissions are
 * transition-stamped in the apply queue like any other (equivalence-matrix
 * gated). Re-admitting optimistic families requires a lane-timed structural
 * emission mirroring emitPatchOptimistic, plus revert resync. */ function storeHasOptimisticFamily(e) {
    const t = e?.[$TARGET];
    return t !== undefined && t.fam?.opt === true;
}

// ---------------------------------------------------------------------------
// visibility: what a reader sees on a record — ONE rule for the ownKeys /
// getOwnPropertyDescriptor traps and the deep() walk (#3323). The walk used
// to re-derive the trap rules over raw backings and missed each new one in
// turn (the #3044 overlay merge, then #3323's chain, then optimistic presence
// and value overrides); sharing the body makes parity structural.
/** Keys visible on `target` served from `src` (= readSource(target)): the
 * pending-overlay merge (#3044) and, on optimistic families, presence-node
 * overrides (§6, FINDING-2's fix). Draft reads before the first write overlay
 * too (pb, once created, is seeded with the view). Authoritative-view reads
 * (until()'s predicate, truth-author drafts) skip the overlay. */ function visibleKeys(e, t) {
    let n;
    if (e.ovl && t === e.pb) {
        // Overlay merge (#3044): committed keys in their order, then this
        // batch's NEW keys, minus deletes.
        n = Reflect.ownKeys(e.v);
        const r = e.del;
        if (r !== null && r.size !== 0) n = n.filter(e => !r.has(e));
        for (const r of Reflect.ownKeys(t)) {
            if (!hasOwn.call(e.v, r)) n.push(r);
        }
    } else n = Reflect.ownKeys(t);
    // Drop the $OWNER stamp (owned backings carry it as an own enumerable
    // symbol). Symbols enumerate last, so the scan stops at the first string.
        for (let e = n.length - 1; e >= 0 && typeof n[e] === "symbol"; e--) {
        if (n[e] === $OWNER) {
            n.splice(e, 1);
            break;
        }
    }
    if (!authoritativeServe() && e.fam?.opt && e.h !== null && (!inDraft(e) || draftSeesOverrides(e))) {
        let t = null;
        const r = inDraft(e);
        for (const i of Reflect.ownKeys(e.h)) {
            const l = e.h[i];
            if (!(r ? hasActiveOverride(l) : visibleOverride(l))) continue;
            t ??= new Set(n);
            // Reader arm: a superseded presence override answers as `in` does
            // (readerOverride, #3331) — Object.keys listed one row fewer than the
            // traps served after a landing refilled an optimistically deleted slot.
                        const o = r ? unwrapOverride(l.o?.Fe) : readerOverride(l, t.has(i));
            if (o) t.add(i); else t.delete(i);
        }
        if (t !== null) return [ ...t ];
    }
    return n;
}

/** The data/accessor descriptor visible for `key` on `target` served from
 * `src`: overlay (#3044 — unwritten keys live on the committed backing,
 * deleted keys are absent) and optimistic presence overrides (an opt delete
 * hides the key; an opt add synthesizes a data descriptor from the value
 * node). `configurable` is the trap's concern (proxy invariant). */ function visibleDescriptor(e, t, n) {
    let r = Object.getOwnPropertyDescriptor(t, n);
    if (e.ovl && t === e.pb) {
        if (e.del !== null && e.del.has(n)) return undefined;
        if (r === undefined) r = Object.getOwnPropertyDescriptor(e.v, n);
    }
    // Draft arm, the twin of visibleKeys' (#3665): a draft still composing on
    // the live view (no view-seeded backing yet) serves the writer rule
    // (hasActiveOverride); once ensurePB has seeded the draft's own backing,
    // `src` carries the view. Without it ownKeys listed a key the descriptor
    // reported absent, and every enumerator — Object.keys, spread, entries,
    // JSON.stringify, deep() — dropped the row a previous setter had added.
        const i = inDraft(e);
    if (!authoritativeServe() && e.fam?.opt && (!i || draftSeesOverrides(e))) {
        const t = e.h?.[n];
        if (t !== undefined && (i ? hasActiveOverride(t) : visibleOverride(t))) {
            // Reader arm: presence as `in` serves it (readerOverride, #3331).
            const l = i ? unwrapOverride(t.o?.Fe) : readerOverride(t, r !== undefined);
            if (!l) return undefined;
 // opt delete
                        if (r === undefined) {
                const t = e.n?.[n];
                return {
                    // In a draft the value is the override itself (nodeValue routes
                    // through serve — the reader rule — and would answer undefined).
                    value: t === undefined ? undefined : i ? hasActiveOverride(t) ? unwrapOverride(t.o?.Fe) : undefined : nodeValue(t, undefined),
                    writable: true,
                    enumerable: true,
                    configurable: true
                };
            }
        }
    }
    return r;
}

/** Tracking deep snapshot (`deep()` for next targets): subscribes to the
 * key-set and deep-witness node at every reachable level, then returns the
 * plain view. Shared references and cycles handled via the visited set. */ function deepNext(e) {
    const t = e?.[$TARGET];
    if (t === undefined || t.px !== e) return e;
    const n = new Set;
    // One membership node + one deep-witness node PER RECORD (legacy $TRACK
    // parity): the walk stays O(records) in subscriptions instead of O(paths)
    // in per-key nodes, and it walks TARGETS directly — no per-child proxy
    // round-trip (wrapNext → proxy → $TARGET trap) on the re-walk every
    // effect run performs.
    // Resolve `child` (a raw or a stored proxy found under `t`) to the target
    // that `t`'s family serves for it — created on first visit, as the get trap
    // would. Undefined = leaf (unwrappable or raw-marked).
        const childTarget = (e, t, n) => {
        let r = lookupTarget(t, e.fam);
        if (r === undefined) {
            if (!isWrappable(t)) return undefined;
            wrapNext(t, e, n);
            // Stored proxies (chained slots) that this family passes through
            // resolve to their own target.
                        r = lookupTarget(t, e.fam) ?? t[$TARGET];
        }
        return r;
    };
    const walkT = e => {
        const t = readSource(e);
        if (n.has(t)) return;
        n.add(t);
        read(getKeySetNode(e));
        read(getDeepNode(e));
        // Chained backing (§7b): the committed backing IS another store's proxy.
        // Writes to the inner store bump the INNER record's witnesses; this
        // target's k/dk hear only its own family's writes (optimistic overrides).
        // Read through the whole chain — the $TRACK trap's rule (#2864 / R21)
        // applied to deep() (#3323). From `t.v`, not `src`: a pending backing is a
        // raw clone and would hide the chain. Non-chained targets pay one flag.
                for (let t = e; t.ch; ) {
            t = t.v[$TARGET];
            read(getKeySetNode(t));
            read(getDeepNode(t));
        }
        // Keys and children exactly as the traps serve them — the overlay merge
        // (#3044/#3283: a bare ownKeys over a pending backing mid-flush dropped
        // every untouched child from the re-subscribing effect's dependencies)
        // and optimistic presence overrides (a row added under a held action
        // lives in `h`/`n`, not the committed backing; the walk never reached its
        // record, so deep() was deaf to every write on it until settle).
                const r = e.fam?.opt === true;
        for (const n of visibleKeys(e, t)) {
            const i = visibleDescriptor(e, t, n);
            if (i === undefined) continue;
            if (i.get || i.set) {
                e.a = true;
                continue;
 // accessors track through their own reads when invoked
                        }
            let l = i.value;
            // An active value override on an optimistic node shadows the backing's
            // child (an optimistic replacement `d[i] = {...}`) — follow what reads
            // serve, as nodeValue's leading arm does.
                        if (r) {
                const t = e.n?.[n];
                if (t !== undefined && hasActiveOverride(t) && !authoritativeServe()) l = unwrapOverride(t.o.Fe);
            }
            if (l === null || typeof l !== "object") continue;
            // Through a chain the descriptor yields the INNERMOST raw: resolve it to
            // the inner family's proxy so this level wraps the chained `view[i]` the
            // get trap serves, never a fresh non-chained wrapper of the base raw.
                        if (e.ch && l[$TARGET] === undefined) l = resolveChainedRaw(e, n, l);
            const o = childTarget(e, l, n);
            if (o === undefined) continue;
 // raw-marked: leaf by contract
                        walkT(o);
        }
    };
    walkT(t);
    return snapshotNext(e);
}

/**
 * Snapshot with per-object registration resolution (RUL-12 DAG ruling): every
 * reachable wrappable resolves through its target's CURRENT backing, so
 * privatized subtrees are seen through any parent path. Identity-preserving:
 * a subtree with no substitutions below returns its own object (zero copy for
 * settled, never-diverged graphs).
 */ function snapshotNext(e) {
    const t = e?.[$TARGET];
    return snapshotWalk(e, new Map, t?.fam ?? null);
}

function snapshotWalk(e, t, n) {
    if (e === null || typeof e !== "object") return e;
    // Resolve through the registration: proxies AND raws map to their target's
    // current backing (stale raw pointers through other parents resolve here).
    // Loops for chained backings (§7b: a projection's backing can be another
    // store's proxy — snapshot unwraps to the base raw).
        let r = e;
    // Chained backings can pass through several targets; optimistic overrides
    // on OUTER targets shadow the chain (§7b), so collect every opt target
    // encountered and compose their views over the resolved base, innermost
    // outward.
        let i = null;
    for (let e = true; ;e = false) {
        const t = r?.[$TARGET]?.v !== undefined;
        let l = t ? r[$TARGET] : undefined;
        if (l === undefined && n !== null) l = lookupTarget(r, n);
        if (l === undefined) l = lookupTarget(r, null);
        if (l === undefined) break;
        // Entering a level from a RAW below a chained family: the raw resolves to
        // the INNER store's target, but this family's wrapper for it — keyed by
        // the inner proxy, §7b — is where the outer overrides live. Start from
        // the wrapper so they compose (#3323: a nested optimistic write on a view
        // row was served by reads but missing from deep()/snapshot()). Entry only:
        // the descent then runs wrapper → inner → raw and terminates.
                if (e && !t && n !== null && l.fam !== n) {
            const e = n.map.get(l.px);
            if (e !== undefined) l = e;
        }
        if (l.fam !== null) n = l.fam;
        if (l.fam?.opt === true) (i ??= []).push(l);
        // The shared visibility decision (#3147): the speculative peek serves
        // pending staging, but a HELD landing is masked to committed exactly as
        // it is for per-key readers — the two families must answer alike while
        // a transaction holds store landings.
                const o = pendingBackingVisible(l, true);
        // Snapshot runs mid-flush (tracked memos execute before commit), so a
        // pending prototype overlay must present as a REAL merged container.
                if (o && l.ovl) materializePB(l);
        const s = o ? l.pb : l.v;
        if (s === r) break;
        r = s;
    }
    if (!isWrappable(r)) return r;
    // Optimistic families: compose the visible view; a composed view is a fresh
    // object and snapshots via the owned/copy path (pinned `not.toBe` identity).
        if (i !== null) {
        let e = r;
        for (let t = i.length - 1; t >= 0; t--) {
            const n = i[t];
            // Draft twin (#3665): deep()/snapshot() inside a setter is the writer's
            // channel and composes on the tick's own unflushed adds
            // (hasActiveOverride). A draft that has seeded its own backing from
            // the view already carries them in `src` — composing again would
            // clobber the draft's later writes with the overrides they superseded.
                        const r = inDraft(n);
            if (r && !draftSeesOverrides(n)) continue;
            e = optHooks.optimisticView(n, e, r);
        }
        if (e !== r) {
            const i = t.get(r);
            if (i !== undefined) return i;
            const l = Array.isArray(e);
            const o = l ? [] : Object.create(Object.getPrototypeOf(e));
            t.set(r, o);
            for (const r of Reflect.ownKeys(e)) {
                if (l && r === "length" || r === $OWNER) continue;
                const i = e[r];
                o[r] = i !== null && typeof i === "object" ? snapshotWalk(i, t, n) : i;
            }
            if (l) o.length = e.length;
            return o;
        }
    }
    const l = t.get(r);
    if (l !== undefined) return l;
    // OWNED (written) subtrees snapshot as copies (§7b: identity is only for
    // subtrees "unmodified relative to source"): non-enumerable symbols are
    // excluded (recon-snap R29), and the copy registers BEFORE descent so
    // cycles keep identity (FINDING-3).
        if (isOwned(r)) {
        const e = Array.isArray(r);
        const i = e ? [] : Object.create(Object.getPrototypeOf(r));
        t.set(r, i);
        for (const l of Reflect.ownKeys(r)) {
            if (e && l === "length" || l === $OWNER) continue;
            const o = Object.getOwnPropertyDescriptor(r, l);
            if (typeof l === "symbol" && !o.enumerable) continue;
            if (o.get || o.set) {
                Object.defineProperty(i, l, o);
                continue;
            }
            const s = o.value;
            const f = s !== null && typeof s === "object" ? snapshotWalk(s, t, n) : s;
            if (o.enumerable && o.writable && o.configurable) i[l] = f; else Object.defineProperty(i, l, {
                ...o,
                value: f
            });
        }
        if (e && i.length !== r.length) i.length = r.length;
        return i;
    }
    // UNOWNED (shared/user) subtrees keep identity unless a descendant
    // substituted; copy-on-substitution preserves the documented CoW contract.
        t.set(r, r);
    let o = null;
    for (const e of Reflect.ownKeys(r)) {
        const i = Object.getOwnPropertyDescriptor(r, e);
        if (!i || i.get || i.set) continue;
        const l = i.value;
        if (l === null || typeof l !== "object") continue;
        const s = snapshotWalk(l, t, n);
        if (s !== l) {
            if (o === null) {
                o = Array.isArray(r) ? [ ...r ] : Object.create(Object.getPrototypeOf(r), Object.getOwnPropertyDescriptors(r));
                t.set(r, o);
            }
            o[e] = s;
        }
    }
    return o ?? r;
}

export { adoptPB, arrayStructureChanged, authoritativeRead, authoritativeServe, bumpDeep, createStoreNext, deepNext, derivedStoreWrite, getHasNode, getKeySetNode, getNode, hasAccessorFlag, hasActiveOverride, heldMaskView, materializePB, membershipChanged, notifyFold, notifyFoldTail, notifyKeyDiff, notifyKeyValue, readerOverride, runAuthoritative, snapshotNext, stagedTruthPB, storeHasFamily, storeHasOptimisticFamily, storeIsShallow, storeSetterNext, targetsEqual, unwrapValue, visibleOverride, wrapNext };