import {
  G as GlobalQueue,
  s as signal,
  a as setSignal,
  c as cleanup,
  r as read,
  N as NoOwnerError,
  C as ContextNotFoundError,
  g as getOwner,
  b as NOT_PENDING,
  u as unwrapOverride,
  S as STATUS_UNINITIALIZED,
  R as REACTIVE_DIRTY,
  d as REACTIVE_CHECK,
  e as resolveTransition,
  f as activeTransition,
  h as globalQueue,
  o as origin,
  i as ext,
  j as clock,
  k as getOrCreateLane,
  l as CONFIG_HAS_LANE,
  O as OVERRIDE_UNDEFINED,
  m as insertSubs,
  n as schedule,
  p as STATUS_PENDING,
  q as CONFIG_DERIVED_OVERRIDE,
  t as CONFIG_OPTIMISTIC,
  v as CONFIG_OVERRIDE_SUPERSEDED,
  w as hasActiveOverride,
  x as NotReadyError,
  y as activeLanes,
  z as signalLanes,
  A as laneHeld,
  E as EFFECT_RENDER,
  B as CONFIG_AUTHORITATIVE_OBSERVED,
  D as findLane,
  F as sourceObserved,
  H as resolveLane,
  I as stale,
  J as readsHeldCommitted,
  K as currentOptimisticLane,
  L as enterStagedRead,
  M as currentTransition,
  P as assignOrMergeLane,
  Q as queuePendingNode,
  T as latestReadActive,
  U as REACTIVE_MANUAL_WRITE,
  V as REACTIVE_OPTIMISTIC_DIRTY,
  W as LANE_RUN,
  X as attrHooks,
  Y as EFFECT_USER,
  Z as REACTIVE_DISPOSED,
  _ as dispose,
  $ as insertIntoHeap,
  a0 as queueFor,
  a1 as visibleOverride,
  a2 as unflushedValue,
  a3 as context,
  a4 as REACTIVE_RECOMPUTING_DEPS,
  a5 as markLateLinker,
  a6 as prepareComputed,
  a7 as tracking,
  a8 as link,
  a9 as enqueueSub,
  aa as setLatestReadActive,
  ab as setContextInternal,
  ac as optimisticComputed,
  ad as CONFIG_HAS_COMPANIONS,
  ae as unflushed,
  af as CONFIG_ADOPTED_UNFLUSHED,
  ag as CONFIG_CHILD_COMPANIONS,
  ah as runAsTransitionBatch,
  ai as unflushedCompanions,
  aj as setPendingCheckActive,
  ak as setStrictRead,
  al as strictRead,
  am as optimisticSignal,
  an as activeAffectsMarks,
  ao as pendingCheckActive,
  ap as STATUS_ERROR,
  aq as setEffectStatusNotify,
  ar as unwrapStatusError,
  as as haltReactivity,
  at as StatusError,
  au as trimStaleDeps,
  av as createEffectNode,
  aw as recompute,
  ax as reportDiagnostic,
  ay as emitDiagnostic,
  az as computed,
  aA as staleValues,
  aB as CONFIG_AUTO_DISPOSE,
  aC as CONFIG_CHILDREN_FORBIDDEN,
  aD as EFFECT_TRACKED,
  aE as setEffectCallback,
  aF as enterCallback,
  aG as exitCallback,
  aH as setTrackedQueueCallback,
  aI as _hitUnhandledAsync,
  aJ as resetUnhandledAsync,
  aK as setOrigin,
  aL as isThenable,
  aM as actionStepDepth,
  aN as flush,
  aO as enterActionStep,
  aP as exitActionStep,
  aQ as ROOT_ERROR_HOOK,
  aR as registerGraph,
  aS as runWithOwner,
  aT as setMemo,
  aU as dirtyQueue,
  aV as $REFRESH,
  aW as installAuthoritativeRead,
  aX as markRefresh,
  aY as createRoot,
  aZ as getObserver,
  a_ as CONFIG_DIRECT_COMMIT,
  a$ as CONFIG_AUTHORITATIVE_READ,
  b0 as entangleConfirmingTransitions,
  b1 as TimeoutError,
  b2 as untrack,
  b3 as Queue,
  b4 as CONFIG_FRESH_READ,
  b5 as forEachDependent,
  b6 as statusNotifierOf,
  b7 as shiftAffectsMarks,
  b8 as SUPPORTS_PROXY,
  b9 as setSlotUnobserved,
  ba as devGuardStoreSetterWrite,
  bb as devGuardStoreSetterResult,
  bc as projectionWriteActive,
  bd as setProjectionWriteActive,
  be as DEV$1,
  bf as isEqual,
  bg as rederiveHeld,
  bh as suppressComputedRecompute,
  bi as readNodeFast,
  bj as READ_SLOW,
  bk as throwPendingUntrackedRead,
  bl as warnStrictReadUntracked,
  bm as unlinkFirewallChild,
  bn as CONFIG_OWNED_WRITE,
  bo as ownsHold,
  bp as deferSlotRelease,
  bq as serve,
  br as slotSignal,
  bs as recordStaleReplay,
  bt as setStoreCommitHook,
  bu as heldDerivation,
  bv as asyncTailFlights,
  bw as untrackDepth,
  bx as checkPostAwaitRead,
  by as isDisposed,
  bz as scheduleWithheld,
  bA as handleAsync,
  bB as createTransition,
  bC as CONFIG_HELD_TRUTH,
  bD as createOwner,
  bE as spectate,
  bF as transitions,
  bG as reporterBlocksSource,
  bH as wakeParked,
  bI as notifyOnLane,
  bJ as REACTIVE_ZOMBIE,
  bK as queueRearm,
  bL as OBSERVE$1
} from "./dev-shared.js";
export {
  bM as clearSnapshots,
  bN as enforceLoadingBoundary,
  bO as getNextChildId,
  bP as markSnapshotScope,
  bQ as peekNextChildId,
  bR as releaseSnapshotScope,
  bS as resetErrorHalt,
  bT as setConsoleFooter,
  bU as setSnapshotCapture
} from "./dev-shared.js";

let externalSourceConfig = null;
/**
 * Registers a factory that bridges external reactive systems (e.g. MobX, Vue refs)
 * into Solid's tracking graph. Every computation will be wrapped so that the
 * external library can track its own dependencies alongside Solid's.
 *
 * Multiple calls pipe together: each new factory wraps the previous one.
 *
 * @param config.factory receives `(fn, trigger)` — wrap fn execution in external tracking,
 *   call trigger when external deps change. Return `{ track, dispose }`.
 * @param config.untrack optional wrapper for `untrack` — disables external tracking too.
 *
 * @example
 * ```ts
 * // Bridge an external "subscribe / notify" library into Solid's graph.
 * // `factory` wraps every Solid compute so the external library can attach
 * // its own dependency tracker; `trigger` re-runs the compute on external
 * // change. `untrack` mirrors Solid's `untrack()` into the external library
 * // so that reads inside `untrack(...)` don't get tracked twice.
 * enableExternalSource({
 *   factory: (compute, trigger) => {
 *     const sub = externalLib.subscribe(trigger);
 *     return {
 *       track: prev => externalLib.run(() => compute(prev)),
 *       dispose: () => sub.unsubscribe()
 *     };
 *   },
 *   untrack: fn => externalLib.untracked(fn)
 * });
 * ```
 */
// Wires a freshly created computed through the active external-source bridge.
// Lives here (installed on GlobalQueue while a config is active) rather than
// inline in core: esbuild cannot literal-track the mutable config binding the
// way rollup does, so an inline `if (externalSourceConfig)` block ships in
// every bundle even though only enableExternalSource() can make it reachable.
function wireExternalSource(self) {
  const bridgeSignal = signal(undefined, { equals: false, ownedWrite: true });
  const source = externalSourceConfig.factory(self._fn, () => {
    setSignal(bridgeSignal, undefined);
  });
  cleanup(() => source.dispose());
  self._fn = prev => {
    read(bridgeSignal);
    return source.track(prev);
  };
}
function externalUntrack(fn) {
  return externalSourceConfig.untrack(fn);
}
// The hooks mirror the config's liveness exactly (installed on enable,
// removed on reset) so core's null checks stay equivalent to the old
// `externalSourceConfig` truthiness checks.
function syncExternalHooks() {
  GlobalQueue._wireExternalSource = externalSourceConfig ? wireExternalSource : null;
  GlobalQueue._externalUntrack = externalSourceConfig ? externalUntrack : null;
}
function enableExternalSource(config) {
  const { factory, untrack: untrackFn = fn => fn() } = config;
  if (externalSourceConfig) {
    const { factory: oldFactory, untrack: oldUntrack } = externalSourceConfig;
    externalSourceConfig = {
      factory: (fn, trigger) => {
        const oldSource = oldFactory(fn, trigger);
        const source = factory(x => oldSource.track(x), trigger);
        return {
          track: x => source.track(x),
          dispose() {
            source.dispose();
            oldSource.dispose();
          }
        };
      },
      untrack: fn => oldUntrack(() => untrackFn(fn))
    };
  } else {
    externalSourceConfig = { factory, untrack: untrackFn };
  }
  syncExternalHooks();
}

/**
 * Context provides a form of dependency injection. It is used to save from needing to pass
 * data as props through intermediate components. This function creates a new context object
 * that can be used with `getContext` and `setContext`.
 *
 * A default value can be provided here which will be used when a specific value is not provided
 * via a `setContext` call.
 */
function createContext(defaultValue, description) {
  return { id: Symbol(description), defaultValue };
}
/**
 * Low-level owner-targeted context read. The user-facing read API is
 * `useContext` (in `solid-js`), which wraps this primitive. Exposed here for
 * cross-package wiring (e.g. hydration-aware context plumbing).
 *
 * @throws `NoOwnerError` if there's no owner at the time of call.
 * @throws `ContextNotFoundError` if a context value has not been set yet.
 *
 * @internal
 */
function getContext(context, owner = getOwner()) {
  if (!owner) {
    throw new NoOwnerError();
  }
  // `undefined` alone means unset — a provided `null` is a value (no `??`).
  let value = owner._context[context.id];
  if (value === undefined) value = context.defaultValue;
  if (value === undefined) {
    throw new ContextNotFoundError();
  }
  return value;
}
/**
 * Low-level owner-targeted context write. The user-facing API is
 * `createContext` (in `solid-js`); its provider component wraps this
 * primitive. Exposed here for cross-package wiring.
 *
 * @throws `NoOwnerError` if there's no owner at the time of call.
 *
 * @internal
 */
function setContext(context, value, owner = getOwner()) {
  if (!owner) {
    throw new NoOwnerError();
  }
  // We're creating a new object to avoid child context values being exposed to parent owners. If
  // we don't do this, everything will be a singleton and all hell will break lose.
  owner._context = {
    ...owner._context,
    [context.id]: value === undefined ? context.defaultValue : value
  };
}

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
/** The optimistic half of setSignal, fired when `_overrideValue !== undefined`. */
function optimisticWrite(el, v) {
  const hasOverride = el._x?._overrideValue !== NOT_PENDING;
  const currentValue = hasOverride ? unwrapOverride(el._x?._overrideValue) : el._value;
  if (typeof v === "function") v = v(currentValue);
  const valueChanged =
    !!(el._statusFlags & STATUS_UNINITIALIZED) ||
    // A dirty node's _value is stale (its queued recompute hasn't run — e.g.
    // a latest() shadow marked by the previous landing's companion snap), so
    // equality against it must not swallow the write. Without this, a sync
    // push returning the shadow to that stale value was dropped, the snap
    // recompute then committed the parent's old value, and the banner showed
    // the previous transition's target (#3041 follow-up).
    !!((el._flags ?? 0) & (REACTIVE_DIRTY | REACTIVE_CHECK)) ||
    !el._equals ||
    !el._equals(currentValue, v);
  if (!valueChanged) {
    // Same-value write with an active override still entangles the current
    // action's transition — the hold must outlast all overlapping actions —
    // and renews the override's PROVENANCE: the newer action re-asks the
    // question, so an older action's answer arriving later is stale to it
    // too (#3331; a same-value re-prediction otherwise let the first
    // action's slow source supersede and restart the downstream flight).
    if (hasOverride) {
      const transition = resolveTransition(el);
      if (transition && activeTransition !== transition) globalQueue.initTransition(transition);
      if (origin > el._x._overrideStamp) el._x._overrideStamp = origin;
    }
    return v;
  }
  if (hasOverride) {
    const transition = resolveTransition(el);
    if (transition) globalQueue.initTransition(transition);
  } else {
    // No revert target is stashed: while the override is active every reader
    // sees it (A17), so authoritative arrivals commit silently into _value and
    // reverting is just dropping the override — _value is already correct.
    globalQueue._batch._optimisticNodes.push(el);
  }
  // Stamp ownership on the node (post-merge, so entangled writers share the
  // joint root). resolveTransition prefers this over the lane's _transition,
  // which a shared subscriber can merge across transactions (#2912).
  ext(el)._overrideOwner = activeTransition;
  ext(el)._overrideTime = clock;
  // Provenance: the action asking. An answer an OLDER action's flight brings
  // back is a stale question and holds silently to commit (#3331).
  ext(el)._overrideStamp = origin;
  const lane = getOrCreateLane(el);
  ext(el)._optimisticLane = lane;
  // A fresh override re-masks: whatever truth is staged, this write is the
  // value for the graph again until the source answers it (#3331).
  el._config = (el._config | CONFIG_HAS_LANE) & -8912897;
  // Literal undefined must not land raw: the slot doubles as the optimistic
  // brand, and erasing it makes the write invisible and routes follow-up
  // writes off the optimistic path into permanent commits (#2898).
  ext(el)._overrideValue = v === undefined ? OVERRIDE_UNDEFINED : v;
  // syncCompanions only pokes _pendingSignal/_latestValueComputed — with
  // neither companion present the call is a guaranteed no-op.
  (el._x?._pendingSignal !== undefined || el._x?._latestValueComputed !== undefined) &&
    GlobalQueue._syncCompanions !== null &&
    GlobalQueue._syncCompanions(el, v);
  if (el._fn !== undefined) el._time = clock; // §12e: computed-only slot
  insertSubs(el, true);
  schedule();
  return v;
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
 */
function laneOverride(el, value, lane) {
  // The wake-only channel (#3009, see recomputeLane): a plain write to a
  // latest()-tracked source rides a companion-sourced lane with no
  // transaction on either side only to wake the verdict companions. Nothing
  // is speculative — the pass commits directly, as any plain write does.
  lane = findLane(lane);
  if (!lane._transition && !activeTransition && lane._source._x?._parentSource !== undefined) {
    el._value = value;
    return;
  }
  if (!hasActiveOverride(el)) {
    // It reverts with the lane's transaction (a landing runs outside any
    // flush, where the ambient batch would revert it at its own end); an
    // orphan lane's falls to the batch, adopted with it (initTransition) as a
    // write's is. No `_overrideOwner`: a derived override is a plain member,
    // its transaction its lane's (resolveTransition), and it merges lanes
    // through itself as any shared reader does (assignOrMergeLane). No
    // provenance stamp either: not an intent, any truth supersedes it.
    (lane._transition
      ? currentTransition(lane._transition)
      : globalQueue._batch
    )._optimisticNodes.push(el);
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
  el._config = (el._config | CONFIG_DERIVED_OVERRIDE) & ~CONFIG_OVERRIDE_SUPERSEDED;
  el._x._overrideValue = value === undefined ? OVERRIDE_UNDEFINED : value;
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
 */
function transitionBlocked(transition) {
  for (let i = 0; i < transition._optimisticNodes.length; i++) {
    const node = transition._optimisticNodes[i];
    if (
      !(node._config & CONFIG_DERIVED_OVERRIDE) &&
      node._x?._parentSource === undefined &&
      hasActiveOverride(node) &&
      "_statusFlags" in node &&
      node._statusFlags & STATUS_PENDING &&
      node._x?._error instanceof NotReadyError
    ) {
      return true;
    }
  }
  return false;
}
function resolveOptimisticNodes(nodes) {
  // Settlement writes below (snapCompanionsToState → updatePendingSignal-style
  // notifications) may push fresh optimistic nodes; only this batch settles
  // now, so iterate a fixed window and splice it out at the end.
  const len = nodes.length;
  for (let i = 0; i < len; i++) {
    const node = nodes[i];
    if (node._x !== null) node._x._optimisticLane = undefined;
    // Revert is a pure drop: there is no revert target to commit —
    // override-covered authoritative values hold in _pendingValue and
    // elevate on their OWN transition's schedule (A18 as re-ruled 2026-07-07).
    if (!(node._statusFlags & STATUS_PENDING)) node._statusFlags &= ~STATUS_UNINITIALIZED;
    const prevOverride = node._x?._overrideValue;
    // A derived override (lanes stage, #3479) has no truth of its own: the
    // slot disarms — the memo is plain again — and the override PROMOTES to
    // `_value`. Not superseded, nothing it derives from told it otherwise
    // (a source override that reverts to a differing truth dirties it just
    // above — sources join this list before their derivations — and its
    // recompute then replaces the promotion), so by the graph's invariant
    // the override IS what a recompute from the truth yields. Re-deriving
    // instead re-asked an async member's flight and held the transaction on
    // it — a waterfall after the reveal.
    const derived = node._config & CONFIG_DERIVED_OVERRIDE;
    ext(node)._overrideValue =
      derived && !(node._config & CONFIG_OPTIMISTIC) ? undefined : NOT_PENDING;
    // A superseded override's subscribers already re-derived from the truth
    // when it arrived (#3331) — the drop changes nothing they read. Everyone
    // else learns of the correction here: this drop IS their notification.
    const superseded = (node._config & CONFIG_OVERRIDE_SUPERSEDED) !== 0;
    node._config &= -8912897;
    if (
      !superseded &&
      prevOverride !== NOT_PENDING &&
      node._value !== unwrapOverride(prevOverride)
    ) {
      if (derived) node._value = unwrapOverride(prevOverride);
      else {
        // The guess lifts and what was beneath it differs: the screen
        // changes from the override to the committed value.
        if (attrHooks !== null)
          attrHooks.optimisticReverted(node, unwrapOverride(prevOverride), node._value, "reverted");
        insertSubs(node, true);
      }
    }
    node._transition = null;
    if (node._x !== null) node._x._overrideOwner = null;
  }
  // Settlement checkpoint (#2838): companions caught in this batch (or owned
  // by a node in it) re-derive from committed state, so verdicts survive the
  // transition that produced them (A19 — pending is a property of the data).
  for (let i = 0; i < len; i++) {
    const node = nodes[i];
    if (node._x?._pendingSignal || node._x?._latestValueComputed) GlobalQueue._snapCompanions(node);
    const owner = node._x?._parentSource;
    if (owner && (owner._x?._pendingSignal === node || owner._x?._latestValueComputed === node))
      GlobalQueue._snapCompanions(owner);
  }
  nodes.splice(0, len);
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
 */
function supersedeOverride(el, value) {
  const differs = !el._equals || !el._equals(value, unwrapOverride(el._x._overrideValue));
  if (!differs) {
    if (!(el._config & CONFIG_OVERRIDE_SUPERSEDED)) {
      if (el._config & CONFIG_AUTHORITATIVE_OBSERVED)
        GlobalQueue._notifyAuthoritativeObservers?.(el);
      return;
    }
    el._config &= ~CONFIG_OVERRIDE_SUPERSEDED;
  } else {
    // Provenance (#3331): an answer brought back by an OLDER action than the
    // one that wrote this override answers a question the user has since
    // changed. It is staged like any other landing and reveals if it is
    // still the truth when the transaction commits, but it does not move the
    // graph now — a slow source must not leak back in over a newer intent.
    // 0 is mainline (no action): always the current question.
    if (origin && origin < el._x._overrideStamp) return;
    el._config |= CONFIG_OVERRIDE_SUPERSEDED;
    // A fresh landing is staged in `_pendingValue` (landOnOverride) or is the
    // truth endOptimism read from it; the committed value with nothing staged
    // is the value the guess covered — the screen goes back, not forward.
    if (attrHooks !== null)
      attrHooks.optimisticReverted(
        el,
        unwrapOverride(el._x._overrideValue),
        value,
        el._pendingValue === NOT_PENDING && value === el._value ? "reverted" : "superseded"
      );
    const lane = el._x?._optimisticLane;
    if (lane) {
      const root = findLane(lane);
      const stack = [el];
      while (stack.length) {
        const n = stack.pop();
        const l = n._x?._optimisticLane;
        if (!l || findLane(l) !== root) continue;
        n._x._optimisticLane = undefined;
        root._pendingAsync.delete(n);
        for (let s = n._subs; s !== null; s = s._nextSub) stack.push(s._sub);
      }
    }
  }
  if (attrHooks !== null) attrHooks.asyncEnd(el, undefined, value, true);
  insertSubs(el);
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
 */
function endOptimism(transition) {
  if (
    !transition._acted ||
    transition._actions.length ||
    !transition._optimisticNodes.length ||
    transition._optimisticStores.size ||
    transitionBlocked(transition)
  )
    return false;
  for (const source of transition._asyncReporters.keys())
    if (
      sourceObserved(transition, source, transition) &&
      source._x?._pendingSources?.has(source) &&
      !resolveLane(source)
    )
      return false;
  let superseded = false;
  for (const node of transition._optimisticNodes) {
    if (
      !hasActiveOverride(node) ||
      node._x._parentSource ||
      // A derived override re-derives when its source's is superseded.
      node._config & (CONFIG_OVERRIDE_SUPERSEDED | CONFIG_DERIVED_OVERRIDE) ||
      node._statusFlags & STATUS_UNINITIALIZED
    )
      continue;
    const truth = node._pendingValue !== NOT_PENDING ? node._pendingValue : node._value;
    if (!node._equals || !node._equals(truth, unwrapOverride(node._x._overrideValue))) {
      supersedeOverride(node, truth);
      // Judged by the mark, not the call: a provenance refusal (an older
      // action's window is still open) leaves the node for a later pass.
      if (node._config & CONFIG_OVERRIDE_SUPERSEDED) superseded = true;
    }
  }
  return superseded;
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
 */
function overrideRead(el, c) {
  if (stale && readsHeldCommitted(el, c)) {
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
    if (el._statusFlags & STATUS_UNINITIALIZED) throw new NotReadyError(el);
    return el._value;
  }
  if (!(el._config & CONFIG_OVERRIDE_SUPERSEDED)) return unwrapOverride(el._x?._overrideValue);
  // The owning transaction: `_overrideOwner` (#2912), not the stamp — an
  // override written directly inside an action never passes the adoption
  // loop that stamps `_transition`, and a body-end supersession (#3427)
  // stages nothing that would queue it. Without the owner a stale reader of
  // a body-ended node read the committed truth beside a display still
  // showing the override.
  const owner = resolveTransition(el);
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
    (owner ?? globalQueue._batch)._gatedSubs.add(c);
    return unwrapOverride(el._x?._overrideValue);
  }
  if (stale && owner && activeTransition !== owner) return unwrapOverride(el._x?._overrideValue);
  // A superseded read is a staged read (A29) whether the truth is staged or
  // already committed: the pass that derives from it derives from the
  // owning transaction's world (the override is still displayed by it).
  enterStagedRead(el, owner);
  return el._pendingValue !== NOT_PENDING ? el._pendingValue : el._value;
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
 */
function landOnOverride(el, v) {
  if (!(el._config & CONFIG_OPTIMISTIC)) {
    const lane = currentOptimisticLane;
    if (lane === null) {
      if (!hasActiveOverride(el)) return setSignal(el, v);
    } else {
      // INV-11: the gate compares against the slot this pass publishes to —
      // the override when one is armed, the committed row otherwise.
      if (
        !el._equals ||
        !el._equals(hasActiveOverride(el) ? unwrapOverride(el._x._overrideValue) : el._value, v)
      ) {
        // Membership before the publish: `laneOverride` files the slot under
        // the lane's transaction, and the read path routes a tracked reader
        // of a lane member through `overrideRead` (CONFIG_HAS_LANE).
        assignOrMergeLane(el, lane);
        laneOverride(el, v, lane);
        insertSubs(el, true);
        schedule();
      }
      return v;
    }
  }
  const currentValue = el._pendingValue === NOT_PENDING ? el._value : el._pendingValue;
  if (typeof v === "function") v = v(currentValue);
  if (attrHooks !== null) attrHooks.write(el, currentValue, v);
  if (el._pendingValue === NOT_PENDING) queuePendingNode(el);
  el._pendingValue = v;
  GlobalQueue._syncCompanions?.(el, v);
  supersedeOverride(el, v);
  schedule();
  return v;
}
function runQueue(queue, type) {
  for (let i = 0; i < queue.length; i++) queue[i](type | LANE_RUN);
}
/**
 * Run effects from all lanes that are ready (no OBSERVED pending async — see
 * laneHeld).
 */
function runLaneEffects(type) {
  for (const lane of activeLanes) {
    if (lane._mergedInto || laneHeld(lane)) continue;
    const effects = lane._effectQueues[type - 1];
    if (effects.length) {
      lane._effectQueues[type - 1] = [];
      runQueue(effects, type);
    }
  }
  // Optimistic patch applications ride the same visibility slot as lane
  // effects (in-flight DOM updates); no-op unless patches registered.
  if (type === EFFECT_RENDER) GlobalQueue._drainPatchOptimistic?.();
}
function cleanupCompletedLanes(completingTransition) {
  for (const lane of activeLanes) {
    const owned = completingTransition
      ? lane._transition === completingTransition
      : !lane._transition;
    if (!owned) continue;
    if (!lane._mergedInto) {
      if (lane._effectQueues[0].length) runQueue(lane._effectQueues[0], EFFECT_RENDER);
      if (lane._effectQueues[1].length) runQueue(lane._effectQueues[1], EFFECT_USER);
    }
    if (lane._source._x?._optimisticLane === lane)
      if (lane._source._x !== null) lane._source._x._optimisticLane = undefined;
    lane._pendingAsync.clear();
    lane._effectQueues[0].length = 0;
    lane._effectQueues[1].length = 0;
    activeLanes.delete(lane);
    signalLanes.delete(lane._source);
  }
}
/** read()'s per-lane suspension test (pending-throw path, lane context). */
function laneSuspends(owner) {
  // An UNINITIALIZED async source suspends regardless of lane (#3276): a
  // lane mismatch preserves an already-committed stale value, but a source
  // with no committed truth has nothing to serve — the cross-lane read
  // surfaced a fabricated `undefined` where latest() itself suspends
  // (latestRead rethrows NotReady for tracked uninitialized reads). Lives
  // here rather than read()'s throw path so the floor bundles don't pay:
  // this is only reachable under a lane, which implies the engine.
  if (owner._statusFlags & STATUS_UNINITIALIZED) return true;
  // Per-lane suspension: only throw if in same lane as pending async
  // AND the node doesn't have an active WRITTEN override (overrides are the
  // visible value, downstream in the lane should read the override, not
  // throw). A derived override (#3479) is a previous speculative answer, not
  // an intent: the re-ask pending behind it suspends like any lane async.
  const pendingLane = owner._x?._optimisticLane;
  if (!pendingLane) return false;
  return (
    findLane(pendingLane) === findLane(currentOptimisticLane) &&
    (!hasActiveOverride(owner) || (owner._config & CONFIG_DERIVED_OVERRIDE) !== 0)
  );
}
/**
 * read()'s reveal carve-out asks whether a pending node is routed through a
 * LIVE lane: a lane-derived flight's inputs are already revealed through the
 * lane (the override, or latest()'s fresh value), so a stale reader of another
 * transaction must hold on the flight rather than show the node's committed
 * value beside them (#3334). Exact, not sticky: `resolveLane` clears a lane
 * reference the engine has since retired, so a node that was once lane-routed
 * and is now pending under a plain hold is judged by that hold alone.
 */
function laneLive(el) {
  return resolveLane(el) !== undefined;
}
/**
 * read()'s entanglement gate: a reader recomputing under an optimistic lane
 * that reads a pending mid-transition write sees the committed value; the sub
 * is recorded for replay at commit.
 */
function gatedRead(el, owner, c) {
  if (
    latestReadActive ||
    el._pendingValue === NOT_PENDING ||
    el._fn ||
    (owner !== el && !(owner._flags & REACTIVE_MANUAL_WRITE))
  ) {
    return false;
  }
  activeTransition._gatedSubs.add(c);
  return true;
}
/**
 * read()'s value selection under a lane: return the committed `_value` for
 * optimistic/lane-assigned signals, stale-mode reads, and pending owners.
 */
function laneReadsCommitted(el, owner, c) {
  if (
    el._x?._overrideValue !== undefined ||
    !!el._x?._optimisticLane ||
    !!(owner._statusFlags & STATUS_PENDING)
  ) {
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
    if (el._pendingValue !== NOT_PENDING && el._pendingValue !== el._value)
      (activeTransition ?? globalQueue._batch)._gatedSubs.add(c);
    return true;
  }
  if (owner === el && stale && c._x?._parentSource !== el) {
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
    if (el._pendingValue !== NOT_PENDING)
      (activeTransition ?? globalQueue._batch)._gatedSubs.add(c);
    return true;
  }
  return false;
}
/**
 * recompute()'s lane posture: resolve the node's own lane (own=true), or adopt
 * a dependency's optimistic lane (own=false — parent-deeper-than-owned-child
 * can run before its OPT-dirty child propagates).
 */
function recomputeLane(el, own) {
  if (own) {
    const lane = resolveLane(el);
    if (!lane) return null;
    // Wake-only lane demotion (#3009): a plain write to a latest()-tracked
    // source rides the optimistic channel only to wake verdict companions —
    // its lane is sourced by the companion shadow (_parentSource set) and owns
    // no transaction. When such a node is pulled mid-tick by a latest()/
    // isPending() probe, lane posture would direct-commit _value, leaking the
    // queued write into committed reads before the flush. Return `false` so
    // recompute() runs plain: the value stages and commits with the flush.
    // (el's own override slot excludes companions themselves; a lane merged
    // into a real optimistic lane resolves to a non-companion source.)
    if (
      !globalQueue._running &&
      !activeTransition &&
      !lane._transition &&
      lane._source._x?._parentSource !== undefined &&
      el._x?._overrideValue === undefined
    ) {
      if (el._x !== null) el._x._optimisticLane = undefined;
      return false;
    }
    return lane;
  }
  for (let d = el._deps; d; d = d._nextDep) {
    const dep = d._dep;
    if (dep._flags & REACTIVE_OPTIMISTIC_DIRTY) {
      const depLane = resolveLane(dep);
      if (depLane) {
        el._flags |= REACTIVE_OPTIMISTIC_DIRTY;
        assignOrMergeLane(el, depLane);
        return depLane;
      }
    }
  }
  return null;
}
/** recompute()'s catch path: record the pending async as the current lane's
 * (ownership — laneHeld decides the hold). The lane source's isPending
 * companion is NOT refreshed here: its verdict never read _pendingAsync, and
 * the source's own write/commit/settlement paths keep it current. */
function laneAsyncPending(el) {
  const lane = findLane(currentOptimisticLane);
  if (lane._source !== el) {
    lane._pendingAsync.add(el);
    ext(el)._optimisticLane = lane;
    el._config |= CONFIG_HAS_LANE;
  }
}
/** recompute()'s success path: the node's async settled, clear it from its lane. */
function laneAsyncSettled(el) {
  const resolvedLane = resolveLane(el);
  if (resolvedLane) {
    resolvedLane._pendingAsync.delete(el);
  }
}
function trackOptimisticStore(store) {
  // After initTransition, globalQueue._batch IS activeTransition (same reference)
  globalQueue._batch._optimisticStores.add(store);
  schedule();
}
/**
 * Installs the engine's hooks. Idempotent; called by every module that can
 * create optimistic state (verdict.ts at module top level, createOptimistic
 * and createOptimisticStore at first call) BEFORE any optimistic node exists.
 */
function installOptimisticEngine() {
  if (GlobalQueue._optimisticWrite !== null) return;
  GlobalQueue._optimisticWrite = optimisticWrite;
  GlobalQueue._resolveOptimistic = resolveOptimisticNodes;
  GlobalQueue._transitionBlocked = transitionBlocked;
  GlobalQueue._cleanupLanes = cleanupCompletedLanes;
  GlobalQueue._runLaneEffects = runLaneEffects;
  GlobalQueue._supersedeOverride = supersedeOverride;
  GlobalQueue._endOptimism = endOptimism;
  GlobalQueue._overrideRead = overrideRead;
  GlobalQueue._laneOverride = laneOverride;
  GlobalQueue._landOnOverride = landOnOverride;
  GlobalQueue._gatedRead = gatedRead;
  GlobalQueue._laneSuspends = laneSuspends;
  GlobalQueue._laneLive = laneLive;
  GlobalQueue._laneReadsCommitted = laneReadsCommitted;
  GlobalQueue._recomputeLane = recomputeLane;
  GlobalQueue._laneAsyncPending = laneAsyncPending;
  GlobalQueue._laneAsyncSettled = laneAsyncSettled;
  GlobalQueue._trackOptimisticStore = trackOptimisticStore;
}

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
 */
const suppressedProbes = new Map();
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
 * never allocates the set or pays the walk. */
function markFirewallChildCompanions(el) {
  const fw = el._firewall;
  if (!fw) return;
  fw._config |= CONFIG_CHILD_COMPANIONS;
  (ext(fw)._companionChildren ??= new Set()).add(el);
}
function getPendingSignal(el) {
  let ps = el._x?._pendingSignal;
  if (!ps) {
    // Start false, write true if pending - ensures reversion returns to false
    ps = optimisticSignal(false, { ownedWrite: true });
    ext(el)._pendingSignal = ps;
    el._config |= CONFIG_HAS_COMPANIONS;
    markFirewallChildCompanions(el);
    ext(ps)._parentSource = el;
    if (computePendingState(el)) backfillCompanion(el, ps, true);
    joinUnflushedResync(el);
  }
  return ps;
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
 */
function backfillCompanion(el, companion, value) {
  const transition = el._transition;
  if (transition) runAsTransitionBatch(transition, () => setSignal(companion, value));
  else setSignal(companion, value);
}
/** A28: a companion created while its source carries an UNFLUSHED write joins
 * the flush-start re-sync like a companion that existed at the write —
 * syncCompanions only reaches companions that exist at write time. Without
 * this the flush brings it current by a plain recompute instead of the
 * optimistic write: its readers are then staged under whatever transaction
 * the round entered (a memo over latest() of a held source was held with the
 * source, and its untracked reads answered the previous value until the hold
 * committed) rather than direct-committed as the optimistic view they are. */
function joinUnflushedResync(el) {
  if (unflushed(el)) unflushedCompanions.push(el);
}
/** The staged value the verdict channels answer for (A28): while a node
 * carries an unflushed write its `_pendingValue` is not yet part of any
 * flushed world, so the channels answer for the value the last flush left
 * staged (a held node's stash) or for nothing (NOT_PENDING). */
function flushedStaged(el) {
  if (!unflushed(el)) return el._pendingValue;
  // Ambient, or adopted before any flush (CONFIG_ADOPTED_UNFLUSHED): nothing
  // a flush carried is staged for it. A held rewrite: the stash.
  return el._transition === null || el._config & CONFIG_ADOPTED_UNFLUSHED
    ? NOT_PENDING
    : el._x._flushedStaged;
}
function collectPendingSources(el) {
  if (!pendingProbe) return;
  pendingProbe.sources.add(el);
  const owner = el._firewall || el;
  if (owner !== el) pendingProbe.sources.add(owner);
}
/**
 * Adds a node to the active isPending() probe without reading it. The store's
 * untracked-probe fallback (`witnessAffectsMark`) reaches this through
 * `GlobalQueue._witnessAffects` — its callers guard on `pendingCheckActive`,
 * which only flips inside `isPending()`, so the hook is always installed by
 * the time it can fire.
 */
function witnessAffects(node) {
  pendingProbe?.sources.add(node);
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
 */
function markWalk(el, seen) {
  if (el._x?._affectsCount) return true;
  // A real error outranks an inherited mark (A16/A24c): an errored node
  // answers probes with its error, not a coverage verdict, and coverage does
  // not flow through it — matching the rails' behavior, where propagation
  // stopped at errored nodes. A DIRECT mark on an errored node still reads
  // pending (the count check above), also matching.
  if (el._statusFlags & STATUS_ERROR) return false;
  if (seen.has(el)) return false;
  seen.add(el);
  const firewall = el._firewall;
  if (firewall && markWalk(firewall, seen)) return true;
  // Mid-recompute (the clearStatus companion poke runs before
  // trimStaleDeps), only the validated prefix [_deps.._depsTail] is this
  // pass's dependency set — walking past it would read dropped deps and
  // latch a stale verdict on the companion.
  const comp = el;
  const tail = comp._flags & REACTIVE_RECOMPUTING_DEPS ? comp._depsTail : undefined;
  if (tail !== null) {
    for (let d = comp._deps ?? null; d !== null; d = d._nextDep) {
      if (!d._pendingObserver && markWalk(d._dep, seen)) return true;
      if (d === tail) break;
    }
  }
  return false;
}
function quietPending(el) {
  if (el._x?._pendingSources) {
    for (const source of el._x._pendingSources) if (!source._x?._reask) return false;
    return true;
  }
  return el._x?._reask ?? false;
}
// NOTE: a loadingValue node's open loading window (_loading) is verdict-quiet
// on purpose: commit #0 answers the question by declaration, so the window
// reads NOT pending — first-load affordances live in the value channel
// (null / skeleton provenance the author encoded), and isPending stays what
// it always was: refetch truth for an answered question. This keeps the
// verdict fully correlated with transition-class machinery and keeps server
// (always false) and client hydration trivially consistent.
function newQuestionInFlight(comp) {
  return (
    !!(comp._statusFlags & STATUS_PENDING) &&
    !(comp._statusFlags & STATUS_UNINITIALIZED) &&
    !quietPending(comp)
  );
}
function computePendingState(el) {
  const comp = el;
  if (comp._flags & REACTIVE_DISPOSED) return false;
  // Mark coverage is transitive by dep-graph reachability: a latest() shadow
  // reaches its owner (and a store leaf its firewall) through its own deps,
  // so the one walk covers direct marks, derivation, and companion chains.
  // Gated: apps with no live mark pay one integer compare.
  if (activeAffectsMarks !== 0 && markWalk(el, new Set())) return true;
  const firewall = el._firewall;
  if (el._x?._parentSource) {
    const parentNode = el._x?._parentSource;
    const parent = parentNode._firewall || parentNode;
    return newQuestionInFlight(parent);
  }
  const staged = flushedStaged(el);
  if (firewall && staged !== NOT_PENDING && !hasActiveOverride(el)) {
    return (
      !!(firewall._flags & REACTIVE_MANUAL_WRITE) ||
      (!firewall._x?._inFlight && !(firewall._statusFlags & STATUS_PENDING)) ||
      (!!(firewall._statusFlags & STATUS_PENDING) && quietPending(firewall))
    );
  }
  // `!comp._loading`: a hold created while the loading window is still open is
  // the window's own landing in flight to its commit — verdict-quiet like the
  // rest of the window (the UNINITIALIZED check suppresses exactly this frame
  // for windowless first loads; born-committed nodes need their own gate, #2990).
  // A18 (d) for a body-end supersession (#3427): the truth at hand is the
  // COMMITTED value — nothing staged — yet the display still shows the
  // override; pending iff they differ, as for a staged arrival below.
  if (
    el._config & CONFIG_OVERRIDE_SUPERSEDED &&
    el._pendingValue === NOT_PENDING &&
    visibleOverride(el)
  )
    return !el._equals || !el._equals(el._value, unwrapOverride(el._x?._overrideValue));
  // A28 (2): an unflushed write is not yet observable — the verdict answers
  // for the flushed staged value.
  if (staged !== NOT_PENDING && !comp._loading) {
    // A18 (d): under a displayed override the observable value is the
    // override, so the verdict is "the arrived truth differs from it" —
    // even before the node's first commit. The UNINITIALIZED suppression
    // below is A19 exception (1), "no observable value exists to be
    // non-final"; an override is one (a node whose first landing was held
    // by a reveal it never got to commit, then superseded under its
    // override, read false here).
    if (visibleOverride(el))
      return !el._equals || !el._equals(staged, unwrapOverride(el._x?._overrideValue));
    // A quiet re-ask's held landing still answers the same question: the
    // classification survives the landing (asyncWrite) and dies with the
    // commit (commitPendingNode) — verdict-quiet through the reveal, like
    // the loading window above (#3178).
    // A staged value equal to the committed one is no proposal (A34, #3494): the
    // observable value IS final (A19). The coalesced `setShow(false);
    // setShow(true)` read pending through the flush that carried it — and,
    // stamped into a hold that flush opened, until the hold settled.
    if (
      !(comp._statusFlags & STATUS_UNINITIALIZED) &&
      !comp._x?._reask &&
      (!el._equals || !el._equals(el._value, staged))
    )
      return true;
  }
  return newQuestionInFlight(comp);
}
function syncCompanions(el, value) {
  if (el._x?._pendingSignal) updatePendingSignal(el);
  if (el._x?._latestValueComputed) setSignal(el._x?._latestValueComputed, value);
}
function updatePendingSignal(el) {
  if (el._x?._pendingSignal) {
    setSignal(el._x?._pendingSignal, computePendingState(el));
  }
  if (el._x?._latestValueComputed) updatePendingSignal(el._x?._latestValueComputed);
}
function updateChildCompanions(el) {
  const companions = el._x?._companionChildren;
  if (companions === undefined) return;
  for (const child of companions) updatePendingSignal(child);
}
/**
 * Re-derive every verdict companion downstream of `el` (subs + firewall
 * children, dedup'd). The affects() channel's poke walk: registration and
 * re-ask flips use the live write path (companion setSignal — its own lane
 * lets the wake escape an incomplete transition's effect stash, #2887);
 * mark release passes `snap` because it runs inside queue finalization,
 * where companion writes must land committed (a setSignal there would open
 * a fresh override window that nothing settles).
 */
function repollDownstreamVerdicts(el, snap = false) {
  const update = snap ? snapCompanionsToState : updatePendingSignal;
  const visited = new Set();
  const visit = node => {
    if (visited.has(node)) return;
    visited.add(node);
    if (node._x?._pendingSignal || node._x?._latestValueComputed) update(node);
    for (let s = node._subs; s !== null; s = s._nextSub) visit(s._sub);
    for (let child = node._x?._child ?? null; child !== null; child = child._nextChild) {
      visit(child);
    }
  };
  visit(el);
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
 */
function wakeSuppressedProbes(transition) {
  if (suppressedProbes.size === 0) return;
  let woke = false;
  for (const [node, probes] of suppressedProbes) {
    const nt = node._transition;
    const t = nt ? currentTransition(nt) : null;
    if (!t) {
      suppressedProbes.delete(node);
      continue;
    }
    if (t !== transition) continue;
    suppressedProbes.delete(node);
    const lane = node._x?._pendingSignal?._x?._optimisticLane;
    for (const p of probes) {
      if (p._flags & REACTIVE_DISPOSED) continue;
      p._flags |= REACTIVE_OPTIMISTIC_DIRTY;
      if (lane) assignOrMergeLane(p, lane);
      else if (p._x !== null) p._x._optimisticLane = undefined;
      enqueueSub(p);
      woke = true;
    }
  }
  if (woke) schedule();
}
function snapCompanionsToState(owner) {
  suppressedProbes.size !== 0 && suppressedProbes.delete(owner);
  const sig = owner._x?._pendingSignal;
  if (sig && (sig._x?._overrideValue === undefined || sig._x?._overrideValue === NOT_PENDING)) {
    const pending = computePendingState(owner);
    if (sig._value !== pending || sig._pendingValue !== NOT_PENDING) {
      sig._value = pending;
      sig._pendingValue = NOT_PENDING;
      insertSubs(sig);
      schedule();
    }
  }
  const shadow = owner._x?._latestValueComputed;
  if (shadow && !(shadow._flags & REACTIVE_DISPOSED)) {
    // A leaf whose firewall is disposed (the projection's teardown snaps its
    // companion-bearing leaves): the shadow's compute reads through a
    // disposed, possibly still-pending projection and would sit
    // NotReady/uninitialized forever — never derived, its backfilled override
    // dropped at the settle — against a leaf whose committed value differs
    // (INV-4 at the next quiescence; spec O5). It dies with its source;
    // getLatestValueComputed treats a disposed shadow as absent, so a later
    // read recreates it from the committed view.
    if (owner._firewall?._flags & REACTIVE_DISPOSED) {
      dispose(shadow);
      return;
    }
    if (
      (shadow._x?._overrideValue === undefined || shadow._x?._overrideValue === NOT_PENDING) &&
      shadow._pendingValue === NOT_PENDING &&
      !Object.is(shadow._value, owner._value) &&
      !(shadow._flags & (REACTIVE_DIRTY | REACTIVE_CHECK))
    ) {
      shadow._flags |= REACTIVE_DIRTY;
      insertIntoHeap(shadow, queueFor(shadow));
      insertSubs(shadow);
      schedule();
    }
    snapCompanionsToState(shadow);
  }
}
function getLatestValueComputed(el) {
  let lvc = el._x?._latestValueComputed;
  // A shadow disposed while unobserved (its gated reader unmounted at a
  // landing) is a corpse: sync writes into it equality-swallow against its
  // frozen _value, and a later read revives it via recompute — clearing
  // DISPOSED and re-deriving from the committed view, so the banner showed
  // the previous transition's target (#3041 follow-up). Treat it as absent;
  // recreation backfills from the in-flight write below.
  if (lvc && lvc._flags & REACTIVE_DISPOSED) lvc = undefined;
  if (!lvc) {
    const prevPending = latestReadActive;
    setLatestReadActive(false);
    const prevCheck = pendingCheckActive;
    setPendingCheckActive(false);
    const prevContext = context;
    setContextInternal(null); // Detach from owner so it isn't disposed with effects
    GlobalQueue._verdictPull = true;
    try {
      lvc = optimisticComputed(() => read(el), { ownedWrite: true });
    } finally {
      GlobalQueue._verdictPull = false;
    }
    // Dev: name the shadow after its source. A diagnostic raised on a read
    // through it (UNTRACKED_READ_AFTER_AWAIT on `latest(a)` after an await)
    // then names `latest(a)`, not the default "computed" every memo shares.
    lvc._name = `latest(${el._name})`;
    ext(el)._latestValueComputed = lvc;
    el._config |= CONFIG_HAS_COMPANIONS;
    markFirewallChildCompanions(el);
    ext(lvc)._parentSource = el; // Parent-child lane relationship
    // Backfill an in-flight write (mirrors getPendingSignal): the companion is
    // created lazily, possibly after the write was processed — syncCompanions
    // only pushes into companions that already exist, so the first latest()
    // read inside a held transition showed the committed value (#3041).
    const staged = flushedStaged(el);
    if (staged !== NOT_PENDING && !hasActiveOverride(el)) backfillCompanion(el, lvc, staged);
    joinUnflushedResync(el);
    setContextInternal(prevContext);
    setPendingCheckActive(prevCheck);
    setLatestReadActive(prevPending);
  }
  return lvc;
}
/** The latest()-mode read path, installed as GlobalQueue._latestRead. */
/** A7: the source has no visible value yet — judged on the OWNER, as read()
 * does: a store leaf behind a projection's firewall is a plain signal whose
 * `_value` is the seed (A25: a draft, never a value), and read() routes a
 * latest() read here before its own firewall/status logic. An override
 * displays a value even before the first commit (A17). */
function uninitializedSource(el) {
  const owner = el._firewall || el;
  return !!(owner._statusFlags & STATUS_UNINITIALIZED) && !hasActiveOverride(el);
}
function latestRead(el) {
  // A leaf of a DISPOSED projection has no flushed world left to mirror: a
  // shadow created for it now would read through the dead firewall, sit
  // NotReady/uninitialized forever, and no teardown would ever retire it (the
  // firewall's already ran — spec O5). Serve the committed value; create
  // nothing. (A read of a disposed node freezes at its last commit, #3024.)
  if (el._firewall?._flags & REACTIVE_DISPOSED) return el._value;
  const pendingComputed = getLatestValueComputed(el);
  const prevPending = latestReadActive;
  setLatestReadActive(false);
  const visibleValue = visibleOverride(el) ? unwrapOverride(el._x?._overrideValue) : el._value;
  // A28: an unflushed write is not the staged value latest() serves. The
  // shadow was written at the source's write to mirror it (A8) — consult it
  // only once a flush has carried the write.
  const u = unflushedValue(el);
  if (u !== NOT_PENDING) {
    // The reader derived from the flushed world because of an unflushed
    // write: it runs again in the flush that carries it (late linker) —
    // a pull may have cleared the mark the write's walk set.
    if (context !== null && context._flags & REACTIVE_RECOMPUTING_DEPS) markLateLinker(context);
    // Link the reader to the shadow so the flush that carries the write
    // updates it (the shadow itself already mirrors the write, A8).
    try {
      read(pendingComputed);
    } catch {
      /* the flushed value answers */
    } finally {
      setLatestReadActive(prevPending);
    }
    // An ambient write: the visible value (override or committed). A rewrite
    // of a held node: the staged value the last flush left.
    return el._transition === null ? visibleValue : u;
  }
  let value;
  try {
    // No mid-tick pull: writes become visible at flush (A28), so before the
    // flush the shadow is exactly as current as the flushed world — the read
    // below serves it as is. (#2922's pull, which brought the shadow current
    // against the unflushed write, is superseded: `flush()` first to read
    // your own write.)
    value = read(pendingComputed);
  } catch (e) {
    // A NotReady from the shadow of an INITIALIZED source means the shadow
    // is mid-flight: serve the visible (committed / override) value. An
    // uninitialized source has no visible value — latest() throws in every
    // scope rather than fabricate `undefined` for a `T` that excludes it
    // (A7; the unowned scope used to return undefined here).
    if (e instanceof NotReadyError && !uninitializedSource(el)) return visibleValue;
    throw e;
  } finally {
    setLatestReadActive(prevPending);
  }
  if (pendingComputed._statusFlags & STATUS_PENDING) {
    if (uninitializedSource(el)) throw new NotReadyError(el);
    return visibleValue;
  }
  // A render effect off the shadow's HELD lane sees the committed value and
  // re-runs at the release (#3460; lanes mirror transitions — see
  // readsHeldCommitted). Was: only a reader under ANOTHER lane; a mainline
  // reader, mounted or re-run by a sync write mid-hold, showed the
  // speculative value beside the lane's deferred readers.
  if (stale && context !== null && readsHeldCommitted(pendingComputed, context)) return el._value;
  // A shadow recomputed by the pull above (not at creation) holds its fresh
  // speculative value in _pendingValue; a contextless read() only surfaces
  // _value. Overrides stay authoritative (A17), and stale readers keep the
  // other transition's committed view, matching read()'s own selection.
  if (
    pendingComputed._pendingValue !== NOT_PENDING &&
    !hasActiveOverride(pendingComputed) &&
    !(stale && pendingComputed._transition && activeTransition !== pendingComputed._transition)
  )
    return pendingComputed._pendingValue;
  return value;
}
/**
 * A latest() shadow that is uninitialized only because it was CREATED during
 * an active flight — its parent source already has a committed value, so
 * latest() serves that as the visible value and a tracked reader has
 * something to pair a verdict with (#3166). Same parent resolution as
 * computePendingState. The pending signal companion also carries
 * `_parentSource` but is a plain signal (no `_fn`) that never goes pending,
 * so the `_fn` check is belt-and-braces for this call site.
 */
function latestShadowWithInitializedParent(owner) {
  if (typeof owner._fn !== "function") return false;
  const parentNode = owner._x?._parentSource;
  if (parentNode === undefined) return false;
  const parent = parentNode._firewall || parentNode;
  return !(parent._statusFlags & STATUS_UNINITIALIZED);
}
/** The isPending()-probe read path, installed as GlobalQueue._pendingCheck. */
function pendingCheckRead(el, c, owner, firewall) {
  setPendingCheckActive(false);
  if (typeof el._fn === "function") {
    GlobalQueue._verdictPull = true;
    try {
      prepareComputed(el, true);
    } finally {
      GlobalQueue._verdictPull = false;
    }
  }
  const ownerStatus = owner._statusFlags;
  if (
    c &&
    ownerStatus & STATUS_PENDING &&
    ownerStatus & STATUS_UNINITIALIZED &&
    // The suspend-throw is for a genuinely-first-load source: the tracked
    // reader has nothing to pair a verdict with, so it parks on the source.
    // A latest() SHADOW created lazily mid-flight is born uninitialized even
    // though its parent has a committed value latest() will serve — throwing
    // here (swallowed by latestRead's fallback) dropped the shadow from the
    // probe, so a tracked latest(isPending()) probe created during a
    // new-question flight cached `false` for that whole flight (#3166).
    // Defer to the PARENT's initialization state and fall through to normal
    // collection; the plain pending throw downstream still links the reader.
    !latestShadowWithInitializedParent(owner)
  ) {
    if (tracking && el !== c) link(el, c);
    setPendingCheckActive(true);
    throw owner._x?._error;
  }
  collectPendingSources(el);
  if (firewall) collectPendingSources(firewall);
  setPendingCheckActive(true);
}
/**
 * A held node whose transaction still has an async question in flight. The
 * probe's fresh-read pairing rule (#2831 — "a reader that sees the fresh
 * value must not also be told it is pending") only applies to LANDED answers
 * awaiting reveal; while the answer is still computing, the fresh value the
 * reader saw is an input, and pending remains the truth for every reader
 * (#3028).
 */
function heldAwaitingAsync(el) {
  const et = el._transition;
  const t = et ? currentTransition(et) : activeTransition;
  if (!t || t._done) return false;
  // A plain staged write (a signal/store leaf — no _fn) held while an action
  // is still running is an INPUT to a computation still in flight (#3078):
  // the pairing rule must not suppress the verdict, or a memo recomputing
  // mid-action reads the staged value, gets told "not pending", and
  // disagrees with a direct isPending() probe for the whole action window.
  // A computed's staged value is the opposite case — a LANDED answer
  // awaiting reveal — where the pairing rule stands even inside an open
  // action (#2831: a reader that saw the new value must not also see
  // pending); still-computing answers are covered by the reporter scan.
  if (t._actions.length && !el._fn) return true;
  // The reporter scan runs for an unstamped node too (#3457): a node staged
  // AFTER the transaction opened is pushed straight into the transaction's
  // batch (queuePendingNode, once initTransition adopted it) and only gets
  // its `_transition` stamp when the flush stashes the hold, but its staged
  // value is already the transaction's, and `t` resolved to that very
  // transaction above. Gating on the stamp let a memo whose recompute read
  // a sync memo's fresh staged value mid-flush pair "not pending" with it
  // (A10) while the transaction's async source was still computing, so a
  // memo-wrapped isPending() read false where a direct probe read true.
  for (const [source, reporters] of t._asyncReporters) {
    if (
      reporters.size &&
      source._statusFlags & STATUS_PENDING &&
      source._x?._error?.source === source
    )
      return true;
  }
  return false;
}
function recordFreshRead(el, value) {
  if (pendingProbe !== null && el._pendingValue !== NOT_PENDING && value === el._pendingValue) {
    if (heldAwaitingAsync(el)) return;
    pendingProbe.freshReads.add(el);
  }
}
function applyReask(el, hadReask) {
  const wasPending = !!(el._statusFlags & STATUS_PENDING);
  const isReask = hadReask && !(wasPending && !el._x?._reask);
  const changed = wasPending && (el._x?._reask ?? false) !== isReask;
  // Allocation-free for the quiet case: false is the extension default.
  if (isReask) ext(el)._reask = true;
  else if (el._x !== null) el._x._reask = false;
  return changed;
}
function latest(fn) {
  const prevLatest = latestReadActive;
  setLatestReadActive(true);
  try {
    return fn();
  } finally {
    setLatestReadActive(prevLatest);
  }
}
function isPending(fn) {
  const prevPendingCheck = pendingCheckActive;
  const prevProbe = pendingProbe;
  setPendingCheckActive(true);
  const probe = (pendingProbe = {
    found: false,
    sources: new Set(),
    freshReads: new Set(),
    suppressed: []
  });
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
    const prevLatest = latestReadActive;
    setLatestReadActive(false);
    const prevStrictRead = strictRead;
    setStrictRead(false);
    try {
      probe.sources.forEach(source => {
        if (read(getPendingSignal(source))) {
          if (!probe.freshReads.has(source)) probe.found = true;
          else probe.suppressed.push(source);
        }
      });
    } finally {
      setStrictRead(prevStrictRead);
      setLatestReadActive(prevLatest);
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
    if (
      tracking &&
      !probe.found &&
      probe.suppressed.length &&
      context &&
      typeof context._fn === "function"
    ) {
      for (const source of probe.suppressed) {
        let probes = suppressedProbes.get(source);
        if (!probes) suppressedProbes.set(source, (probes = new Set()));
        probes.add(context);
      }
    }
  };
  try {
    fn();
    collectPending();
    return probe.found;
  } catch (e) {
    collectPending();
    if (e instanceof NotReadyError) {
      const uninitialized = !!(e.source?._statusFlags & STATUS_UNINITIALIZED);
      if (probe.found && !uninitialized) return true;
      if (context && uninitialized) throw e;
    }
    return probe.found;
  } finally {
    setPendingCheckActive(prevPendingCheck);
    pendingProbe = prevProbe;
  }
}
// Hook installation (same late-binding pattern as GlobalQueue._update /
// _propagateAffects): core call sites fire these behind the same guards the
// direct calls used, so behavior is identical once this module loads.
GlobalQueue._syncCompanions = syncCompanions;
GlobalQueue._updatePendingSignal = updatePendingSignal;
GlobalQueue._updateChildCompanions = updateChildCompanions;
GlobalQueue._snapCompanions = snapCompanionsToState;
GlobalQueue._latestRead = latestRead;
GlobalQueue._pendingCheck = pendingCheckRead;
GlobalQueue._recordFresh = recordFreshRead;
GlobalQueue._applyReask = applyReask;
GlobalQueue._repollVerdicts = repollDownstreamVerdicts;
GlobalQueue._witnessAffects = witnessAffects;
GlobalQueue._wakeSuppressedProbes = wakeSuppressedProbes;

/**
 * Effects are the leaf nodes of our reactive graph. When their sources change, they are
 * automatically added to the queue of effects to re-execute, which will cause them to fetch their
 * sources and recompute
 */
function effect(compute, effect, error, options) {
  const isUser = !!options?.user;
  const node = createEffectNode(
    compute,
    effect,
    error,
    isUser ? EFFECT_USER : EFFECT_RENDER,
    options
  );
  recompute(node, true);
  // A first pass that derived from a live transaction's staged world was
  // staged into that transaction (recompute: born held); the transaction's
  // commit replays this effect. Its first run is not this creation's (A29).
  !options?.defer &&
    node._pendingValue === NOT_PENDING &&
    (node._type === EFFECT_USER || options?.schedule
      ? node._queue.enqueue(node._type, runEffect.bind(null, node))
      : runEffect(node, LANE_RUN));
  if (!node._parent) {
    const message =
      "[NO_OWNER_EFFECT] Effects created outside a reactive context will never be disposed";
    reportDiagnostic(
      emitDiagnostic(
        {
          code: "NO_OWNER_EFFECT",
          kind: "lifecycle",
          severity: "warn",
          message,
          ownerId: node.id,
          ownerName: node._name,
          data: { effectType: "effect" }
        },
        node
      )
    );
  }
}
function notifyEffectStatus(status, error) {
  // Use passed values if provided, otherwise read from node
  const actualStatus = status !== undefined ? status : this._statusFlags;
  const actualError = error !== undefined ? error : this._x?._error;
  if (actualStatus & STATUS_ERROR) {
    this._queue.notify(this, STATUS_PENDING, 0);
    if (this._type === EFFECT_USER) {
      // The error handler is the error arm of the effect phase (#2840 ruling):
      // queue it like the effect function. It runs in the same imperative,
      // writable scope, throws escalate the same way, and a held transition
      // (or optimistic lane) defers it exactly as it defers the success arm.
      // No payload is queued — the node already carries `_statusFlags`/`_error`,
      // and the runner dispatches on them, so a recovery before the effect
      // phase takes the success arm instead. Blocked forwards (explicit
      // `status` arg without node-state writes) don't queue: the status
      // re-propagates unblocked at commit.
      if (this._statusFlags & STATUS_ERROR) {
        this._modified = true;
        this._queue.enqueue(this._type, (this._boundRunEffect ??= runEffect.bind(null, this)));
      }
      return;
    }
    if (!this._queue.notify(this, STATUS_ERROR, STATUS_ERROR)) {
      haltReactivity(unwrapStatusError(actualError));
      throw actualError;
    }
  } else if (this._type === EFFECT_RENDER) {
    this._queue.notify(this, STATUS_PENDING | STATUS_ERROR, actualStatus, actualError);
    if (_hitUnhandledAsync && resetUnhandledAsync()) {
      // Async without a `Loading` ancestor is legal (the mount defers), so this
      // is a consistent FYI — an `Errored` above must not swallow it. The old
      // STATUS_ERROR re-notify here dated from when enforcement routed the
      // pending to the error boundary; that both suppressed the warning and
      // showed the error fallback in dev only (#2822). Reported once per
      // mount (resetUnhandledAsync gates), located at the first pending
      // effect's owner path.
      const message =
        "[ASYNC_OUTSIDE_LOADING_BOUNDARY] An async value was read outside a Loading boundary. The root mount will be deferred until all pending async settles.";
      reportDiagnostic(
        emitDiagnostic(
          {
            code: "ASYNC_OUTSIDE_LOADING_BOUNDARY",
            kind: "async",
            severity: "warn",
            message,
            ownerId: this.id,
            ownerName: this._name
          },
          this
        )
      );
    }
  }
}
function runEffect(node, type) {
  if (!node._modified || node._flags & REACTIVE_DISPOSED) return;
  // Ownership (#3319): a value computed under a transaction is applied by that
  // transaction's commit. The ordinary effect phase runs with a transaction
  // active only when the flush's finalize ENTERED one (every other path parks
  // or settles first): leave a run owned by a still-held transaction queued —
  // `_modified` stays set — and the next gate stashes it with the owner.
  // Mainline-owned runs (null) apply now. Lanes are exempt by design (they
  // apply their own effects ahead of their transaction — the optimistic view)
  // and mark their runs with LANE_RUN.
  //
  // Lane exemption has one exception (#3331): a lane runner for an effect that
  // no longer rides a lane — its optimistic source was superseded, so the lane
  // has no optimistic view left to apply, and the value this effect now
  // carries (or will, once its plain recompute lands) belongs to the still-held
  // transaction. Hand the run to the regular queue, where the transaction's
  // gate stashes it with the owner. Lane-less runners with no live owner
  // (reverts, wake-only lanes) apply now.
  if (
    node._valueTransition !== null &&
    !currentTransition(node._valueTransition)._done &&
    (type & LANE_RUN ? !node._x?._optimisticLane : activeTransition !== null)
  ) {
    node._queue.enqueue(node._type, node._boundRunEffect);
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
  if (node._statusFlags & STATUS_ERROR && node._type === EFFECT_USER) {
    const err = unwrapStatusError(node._x?._error);
    node._prevValue = node._value;
    node._modified = false;
    try {
      node._errorFn
        ? node._errorFn(err, () => {
            const prevCleanup = node._cleanup;
            node._cleanup = undefined;
            prevCleanup?.();
          })
        : console.error(err);
    } catch (error) {
      if (!node._queue.notify(node, STATUS_ERROR, STATUS_ERROR)) {
        haltReactivity(error);
        throw error;
      }
    }
    return;
  }
  // Captured before the callback: its own throw errors the node below, but
  // the compute pass that produced `_value` was clean, so its tail still goes.
  const cleanPass = node._x?._error == null;
  let prevStrictRead = false;
  {
    prevStrictRead = setStrictRead("an effect callback");
    setEffectCallback(true);
    enterCallback();
  }
  // Observe tier, like its `effectRunEnd` twin below: the frame the engine
  // opens here is what stamps the callback's writes as the effect's (the
  // cascade an observer reports) and what times the callback (the `effect`
  // record) — facts a production observer needs, not only a dev console.
  if (attrHooks !== null) attrHooks.effectRunStart(node);
  const prevCleanup = node._cleanup;
  node._cleanup = undefined;
  try {
    prevCleanup?.();
    const nextCleanup = node._effectFn(node._value, node._prevValue);
    if (true && nextCleanup !== undefined && typeof nextCleanup !== "function") {
      throw new Error(
        `${node._name || "effect"} callback returned an invalid cleanup value. Return a cleanup function or undefined.`
      );
    }
    // The final cleanup is invoked by disposeChildren at true disposal.
    node._cleanup = nextCleanup;
  } catch (error) {
    ext(node)._error = new StatusError(node, error);
    node._statusFlags |= STATUS_ERROR;
    if (!node._queue.notify(node, STATUS_ERROR, STATUS_ERROR)) {
      haltReactivity(error);
      throw error;
    }
  } finally {
    {
      setStrictRead(prevStrictRead);
      setEffectCallback(false);
      exitCallback();
    }
    node._prevValue = node._value;
    node._modified = false;
    // The run applied: this is the frame now, so the dependency tail the
    // compute pass left linked goes (A30, #3438 — `recompute` defers an
    // effect's trim while a run is owed; the twin of `commitPendingNode`'s
    // trim for a staged pass). An errored compute kept its full list with
    // `_depsTail` marking where it stopped; leave it, as the commit does.
    if (cleanPass) trimStaleDeps(node);
  }
  // Outside the try (see the rule in attribution-hooks.ts). Reached whether or
  // not the callback threw — a throw that escapes the catch above halts.
  if (attrHooks !== null) attrHooks.effectRunEnd(node);
}
GlobalQueue._runEffect = runEffect;
/**
 * Internal tracked effect - bypasses heap, goes directly to effect queue.
 * Runs as a leaf owner: child primitives and onCleanup are forbidden (true throws).
 * Uses stale reads.
 */
function trackedEffect(fn, options) {
  const run = () => {
    // `_modified` is NOT redundant with the heap: the heap dedups within a
    // pass, but a held transition's passes each enqueue `_run` into the same
    // user queue, and this gate is what collapses them into one run at commit.
    if (!node._modified || node._flags & REACTIVE_DISPOSED) return;
    setTrackedQueueCallback(true);
    try {
      node._modified = false;
      recompute(node);
    } finally {
      setTrackedQueueCallback(false);
    }
  };
  const node = computed(
    () => {
      const prevCleanup = node._cleanup;
      node._cleanup = undefined;
      prevCleanup?.();
      const cleanup = staleValues(fn);
      if (cleanup !== undefined && typeof cleanup !== "function") {
        throw new Error(
          `${node._name || "trackedEffect"} callback returned an invalid cleanup value. Return a cleanup function or undefined.`
        );
      }
      node._cleanup = cleanup;
    },
    { ...options, lazy: true }
  );
  node._cleanup = undefined;
  node._config = (node._config & ~CONFIG_AUTO_DISPOSE) | CONFIG_CHILDREN_FORBIDDEN;
  node._modified = true;
  node._type = EFFECT_TRACKED;
  // Observe-tier label: the computed literal defaulted its `_name` slot to
  // "computed"; relabel by kind (a store into the slot, not a new field).
  if (options?.name === undefined) node._name = "trackedEffect";
  // Status dispatch rides the SHARED notifier (statusNotifierOf keys off
  // _type): its error arm is behavior-identical to the closure that used to
  // live here, without the per-node NodeExtension allocation.
  node._run = run;
  // The first run rides the heap like every wake (GlobalQueue._update), so a
  // tracked effect created inside a render-effect callback runs after that
  // pass's staged writes commit, not before.
  enqueueSub(node);
  schedule();
  if (!node._parent) {
    const message =
      "[NO_OWNER_EFFECT] Effects created outside a reactive context will never be disposed";
    reportDiagnostic(
      emitDiagnostic(
        {
          code: "NO_OWNER_EFFECT",
          kind: "lifecycle",
          severity: "warn",
          message,
          ownerId: node.id,
          ownerName: node._name,
          data: { effectType: "trackedEffect" }
        },
        node
      )
    );
  }
}
// Install the shared effect status notifier (statusNotifierOf serves it to
// every effect node) — module-scope: any bundle that creates effects
// evaluates this module.
setEffectStatusNotify(notifyEffectStatus);

const ACTION_CALLED_IN_OWNED_SCOPE_MESSAGE =
  "[ACTION_CALLED_IN_OWNED_SCOPE] Calling an action inside an owned scope (component, computation) is not allowed. " +
  "Call it from an event handler or another imperative scope.";
/** Invocation order across all actions — the provenance every slice of an
 * action runs under (scheduler `origin`): the flights and overrides its
 * ambient windows issue are stamped with it, so a later action's override
 * can tell this action's late answer from its own (#3331). */
let actionSeq = 0;
function restoreTransition(seq, transition, fn) {
  const prevOrigin = setOrigin(seq);
  globalQueue.initTransition(transition);
  const result = fn();
  // A nested action resuming synchronously (its body yielded a non-thenable)
  // runs this inside the OUTER action's slice: draining here would park the
  // shared transaction and detach the outer body's remaining writes (the
  // flush() rule, scheduler.ts). The outer step's own return drains.
  if (actionStepDepth === 0) flush();
  setOrigin(prevOrigin);
  return result;
}
/**
 * The primitive for mutations: imperative async workflows whose *writes span
 * an async gap* — optimistic write, server round-trip, reconciling write —
 * where intermediate state must not leak and failure must revert cleanly
 * (pair with `createOptimistic` / `createOptimisticStore`).
 *
 * Navigation-shaped updates do not need an action. A plain setter call is
 * enough: reads pull the async, and downstream async computeds hold their
 * previous values per-node until the new ones are ready (`isPending` /
 * `latest` expose the in-flight state). Reach for `action` only when writes
 * happen *after* async work, not merely upstream of it.
 *
 * Framework-level actions (router form actions, server actions) are
 * specializations of this primitive: they are actions in exactly this sense —
 * the same transactional semantics — with form binding, serialization, and
 * submission tracking layered on top. The shared name is deliberate.
 *
 * Wraps a generator function so each invocation runs as a single transaction
 * (a "transition") that batches every signal/store write between yields. The
 * surrounding UI sees one atomic update per yielded step; nothing is committed
 * until the action either completes or the next `yield` resolves.
 *
 * `yield` is the transaction-safe suspension point: the action waits for a
 * yielded promise and re-enters the transaction before running the code after
 * it. A plain `await` does NOT — the runtime has no hook into an async
 * generator's internal await continuations, so code between an `await` and
 * the next `yield` runs OUTSIDE the transaction: writes to fresh signals
 * commit immediately, and anything that creates a reader there — `until()`,
 * `latest()`, a memo or effect, a mount — is created mainline, where a read of
 * this action's held state makes it born held (A29): staged with the
 * transaction and replayed at its commit. For `until()` that commit is the
 * settle its own promise holds open (#3482). `await` is still the ergonomic
 * choice for typed results; just put a bare `yield` before any write or
 * reader creation that follows it — including the expression of the next
 * `yield`, which is evaluated before the step re-enters:
 *
 * ```ts
 * const saved = await api.createTodo(text); // typed result
 * yield; // re-enter the transaction before writing or reading
 * setTodos(t => { ... });
 * yield until(() => todos.some(t => t.id === saved.id));
 * ```
 *
 * (For the same reason, don't call `flush()` inside an action body — it
 * drains the transaction mid-step.)
 *
 * Each call returns a `Promise` that resolves with the generator's return
 * value, or rejects if it throws. Pair with `createOptimistic` /
 * `createOptimisticStore` to apply tentative writes that auto-revert if the
 * action fails.
 *
 * @example
 * ```ts
 * const [todos, setTodos] = createOptimisticStore<Todo[]>([]);
 *
 * const addTodo = action(async function* (text: string) {
 *   const tempId = crypto.randomUUID();
 *   setTodos(t => { t.push({ id: tempId, text, pending: true }); }); // optimistic
 *   const saved = await api.createTodo(text); // network round-trip, typed
 *   yield; // re-enter the transaction
 *   setTodos(t => {
 *     const i = t.findIndex(x => x.id === tempId);
 *     if (i >= 0) t[i] = saved;
 *   });
 *   return saved;
 * });
 *
 * await addTodo("buy milk");
 * ```
 */
function action(genFn) {
  return (...args) => {
    // Invoking an action starts a transaction — like a write, it is invalid
    // synchronously inside an owned scope. The write guard can't catch this
    // at the real hazard point: post-await writes run with no ambient owner,
    // and a computation tracking what its action writes livelocks (every
    // write retriggers the compute, which fires a fresh invocation whose
    // transition supersedes the last — the value never commits). Same scope
    // test as setSignal: leaf imperative scopes (tracked effects, onSettled)
    // stay legal.
    {
      const owner = getOwner();
      if (owner && !(owner._config & CONFIG_CHILDREN_FORBIDDEN)) {
        emitDiagnostic({
          code: "ACTION_CALLED_IN_OWNED_SCOPE",
          kind: "write",
          severity: "error",
          message: ACTION_CALLED_IN_OWNED_SCOPE_MESSAGE,
          ownerId: owner.id,
          ownerName: owner._name
        });
        throw new Error(ACTION_CALLED_IN_OWNED_SCOPE_MESSAGE);
      }
    }
    return new Promise((resolve, reject) => {
      const it = genFn(...args);
      const seq = ++actionSeq;
      // The first slice's window runs to the scheduled flush, which clears
      // the provenance with the window — no restore here.
      setOrigin(seq);
      globalQueue.initTransition();
      let ctx = activeTransition;
      ctx._actions.push(it);
      ctx._acted = true;
      const done = (v, e, failed = false) => {
        ctx = currentTransition(ctx);
        const i = ctx._actions.indexOf(it);
        if (i >= 0) ctx._actions.splice(i, 1);
        // Re-adopt through initTransition like every other resumption site:
        // a bare setActiveTransition leaves globalQueue._batch as a detached
        // ambient batch, and anything registered before the scheduled flush
        // (held writes on a merging transition, optimistic overrides,
        // affects() marks) lands there with nothing to ever finalize it.
        globalQueue.initTransition(ctx);
        schedule();
        failed ? reject(e) : resolve(v);
      };
      const step = (v, err) => {
        let r;
        // Attribution hooks bracket the synchronous slice of generator body
        // this step runs (up to the next yield): writes inside are the
        // action's. Both sites sit outside the try (attribution-hooks.ts).
        if (attrHooks !== null) attrHooks.actionStepStart(it, genFn.name || undefined);
        // The body is on the stack between these brackets: flush() is
        // refused inside (FLUSH_IN_ACTION, scheduler.ts).
        enterActionStep();
        // Dev: the body's reads are imperative, not post-await reads of the
        // continuation that invoked the action (UNTRACKED_READ_AFTER_AWAIT).
        enterCallback();
        try {
          r = err ? it.throw(v) : it.next(v);
        } catch (e) {
          exitActionStep();
          exitCallback();
          if (attrHooks !== null) attrHooks.actionStepEnd(it);
          return done(undefined, e, true);
        }
        exitActionStep();
        exitCallback();
        if (attrHooks !== null) attrHooks.actionStepEnd(it);
        // A rejected iterator result (async generators) means the error already
        // escaped the generator body — it is completed, and throwing back in
        // would just reject again forever. Settle instead.
        if (isThenable(r)) return void r.then(run, e => done(undefined, e, true));
        run(r);
      };
      const run = r => {
        if (r.done) return done(r.value);
        // Thenable assimilation can itself throw synchronously (a `then`
        // getter, or a `then()` method that throws — #2918). Match `await`
        // semantics: the failure is thrown back into the generator at the
        // yield point (catchable there); if uncaught, step()'s guard settles
        // the action so its iterator never leaks in the transition. The
        // settled flag implements A+ 2.3.3.3.4.1: a throw after the thenable
        // already called a callback is ignored.
        let settled = false;
        try {
          if (isThenable(r.value))
            return void r.value.then(
              v => {
                if (settled) return;
                settled = true;
                restoreTransition(seq, ctx, () => step(v));
              },
              e => {
                if (settled) return;
                settled = true;
                restoreTransition(seq, ctx, () => step(e, true));
              }
            );
        } catch (e) {
          if (settled) return;
          settled = true;
          return void restoreTransition(seq, ctx, () => step(e, true));
        }
        restoreTransition(seq, ctx, () => step(r.value));
      };
      step();
    });
  };
}

let ambientHook;
const reported = new WeakSet();
/**
 * Registers the ambient client error hook — the one call a browser `init()`
 * makes to see every failure a boundary renders a fallback for, in
 * production. (Uncaught errors reach `reportError` / `window.onerror`.)
 *
 * ```ts
 * configureClientErrors({
 *   onError: (error, { ownerPath }) =>
 *     Sentry.captureException(error, {
 *       mechanism: { type: "solid.error_boundary", handled: true }
 *     })
 * });
 * ```
 */
function configureClientErrors(config) {
  if (config && config.onError !== undefined && typeof config.onError !== "function") {
    throw new TypeError(`Invalid onError: expected a function, received ${typeof config.onError}.`);
  }
  ambientHook = config ? config.onError : undefined;
}
/** The nearest root's hook above `owner` (parked under `ROOT_ERROR_HOOK`), else the ambient one. */
function hookFor(owner) {
  for (let o = owner; o; o = o._parent) {
    const hook = o[ROOT_ERROR_HOOK];
    if (hook !== undefined) return hook;
  }
  return ambientHook;
}
/** Component labels up the owner chain, root first — `_name` where the runtime keeps it. */
function labels(owner) {
  const path = [];
  for (let o = owner; o; o = o._parent) {
    const name = o._name;
    if (typeof name === "string" && name.length) path.push(name);
  }
  return path.length ? path.reverse() : undefined;
}
/**
 * Tells the client error hook about `error`, caught by the boundary whose
 * owner is `owner`, thrown by `thrower` (the computation the engine's status
 * wrapper named; unknown for a value that never crossed one) — once per
 * error object. A throwing hook is reported on the console and otherwise
 * ignored — a monitor must never take the app down.
 * @internal
 */
function reportClientError(error, owner, thrower) {
  const isObject = error !== null && (typeof error === "object" || typeof error === "function");
  if (isObject) {
    if (reported.has(error)) return;
    reported.add(error);
  }
  const hook = hookFor(owner);
  if (hook === undefined) return;
  const context = {};
  const boundary = labels(owner);
  const path = labels(thrower) ?? boundary;
  if (path !== undefined) context.ownerPath = path;
  if (boundary !== undefined) context.boundaryPath = boundary;
  try {
    hook(error, context);
  } catch (hookError) {
    console.error(hookError);
  }
}

/**
 * Low-level reactive-cleanup primitive. Registers a callback that runs when
 * the surrounding owner is disposed.
 *
 * **In 2.0 user code this is rare.** The two cases where you might reach for
 * it have better-shaped tools:
 *
 * - **Component lifecycle (mount/unmount, listeners, intervals):** use
 *   {@link onSettled} and **return** a cleanup function. Setup and teardown
 *   stay paired in one block. This replaces the 1.x `onMount` + `onCleanup`
 *   pairing.
 * - **Cleanup tied to an effect run:** `onCleanup` does not belong in
 *   `createEffect`'s apply phase. If a compute phase genuinely needs per-run
 *   teardown, that's usually a sign the work should be a memo/projection
 *   instead, or moved to `onSettled` if it's lifecycle-shaped.
 *
 * Where `onCleanup` is the right tool is **library / custom-primitive
 * internals** — coordinating disposal inside a `createRoot` body, or wiring
 * cleanup to a captured owner via `runWithOwner` from a custom factory.
 * Application code rarely needs to write any of those shapes directly.
 *
 * Must be called inside an owner. Calling outside an owner is a no-op (with a
 * dev-mode warning).
 *
 * Cannot be used inside `createTrackedEffect` or `onSettled` — return a
 * cleanup function from the callback body instead.
 *
 * Cleanups run in unwind order: an owner's children are disposed before its
 * own cleanups, and within one owner later registrations run before earlier
 * ones. In production a component body shares its enclosing owner, so
 * register cleanup before creating children when the order between them
 * matters.
 *
 * @example
 * ```ts
 * // Library shape: thread a resource's disposal into a *captured* owner
 * // from a factory that has no settle-phase setup of its own. `onSettled`
 * // would queue a callback we don't need; `onCleanup` is the leaner
 * // primitive when the only job is "register disposal on this owner".
 * function bindToOwner<T extends { dispose(): void }>(owner: Owner, resource: T): T {
 *   runWithOwner(owner, () => onCleanup(() => resource.dispose()));
 *   return resource;
 * }
 * ```
 */
function onCleanup(fn) {
  {
    const owner = getOwner();
    if (!owner) {
      const message =
        "[NO_OWNER_CLEANUP] onCleanup called outside a reactive context will never be run";
      reportDiagnostic(
        emitDiagnostic({
          code: "NO_OWNER_CLEANUP",
          kind: "lifecycle",
          severity: "warn",
          message
        })
      );
    } else if (owner._config & CONFIG_CHILDREN_FORBIDDEN) {
      const message =
        "[CLEANUP_IN_FORBIDDEN_SCOPE] Cannot use onCleanup inside createTrackedEffect or onSettled; return a cleanup function instead";
      emitDiagnostic({
        code: "CLEANUP_IN_FORBIDDEN_SCOPE",
        kind: "lifecycle",
        severity: "error",
        message,
        ownerId: owner.id,
        ownerName: owner._name
      });
      throw new Error(message);
    }
  }
  return cleanup(fn);
}
function accessor(node) {
  const fn = read.bind(null, node);
  fn[$REFRESH] = node;
  return fn;
}
function createSignal(first, second) {
  if (typeof first === "function") {
    const node = computed(first, second);
    node._config &= ~CONFIG_AUTO_DISPOSE;
    return [accessor(node), setMemo.bind(null, node)];
  }
  const node = signal(first, second);
  registerGraph(node, getOwner());
  return [accessor(node), setSignal.bind(null, node)];
}
function createMemo(compute, options) {
  return accessor(computed(compute, options));
}
/**
 * Creates a reactive effect with **separate compute and effect phases**.
 *
 * - `compute(prev)` runs reactively — *put all reactive reads here*. The
 *   returned value is passed to `effect` and is also the new "previous" value
 *   for the next run.
 * - `effect(next, prev?)` runs imperatively (untracked) after the queue
 *   flushes. *Put DOM writes / fetch / logging / subscriptions here.* It may
 *   return a cleanup function which runs before the next effect or on
 *   disposal.
 *
 * Reactive reads inside `effect` will *not* re-trigger this effect — that's
 * intentional. If you need a single-phase tracked effect, use
 * `createTrackedEffect` (with the tradeoffs noted there).
 *
 * Pass an `EffectBundle` (`{ effect, error }`) instead of a plain function to
 * intercept **compute-phase** errors — errors thrown by `compute` or arriving
 * from upstream reactive sources (including async rejections), which your own
 * code has no frame to `try/catch`. The `error` handler is the error arm of
 * the effect phase: it runs on the same schedule and in the same imperative,
 * writable scope as `effect` (setting error state via signals is fine), and
 * only for *settled* errors — a transient error that recovers before the
 * effect phase runs `effect` with the recovered value instead, and a held
 * transition defers it exactly as it defers `effect`. Without an `error`
 * handler a compute-phase error is logged and the effect simply skips that
 * run — a non-render effect's reactivity failing does not crash the app.
 * Rethrowing from `error` escalates it to the nearest error boundary
 * (halting the system if none exists).
 *
 * The **effect phase is different**: it is your own imperative code, so handle
 * failures with `try/catch` where they occur. An uncaught effect-phase throw
 * is treated as an unhandled application error — caught by the nearest
 * `createErrorBoundary`/`<Errored>`, and permanently halting the reactive
 * system if there is none. It is *not* routed to the bundle's `error` handler.
 *
 * ```typescript
 * createEffect<T>(compute, effectFn | { effect, error }, options?: EffectOptions);
 * ```
 * @param compute a function that receives its previous value and returns a new value used to react on a computation
 * @param effectFn a function that receives the new value and is used to perform side effects (return a cleanup function), or an `EffectBundle` with `effect` and `error` handlers
 * @param options `EffectOptions` -- name, defer, schedule, transparent
 *
 * @example
 * ```ts
 * const [count, setCount] = createSignal(0);
 *
 * createEffect(
 *   () => count(),                  // compute: tracks `count`
 *   value => console.log(value)     // effect: side effect
 * );
 *
 * setCount(1); // logs 1 after the next flush
 * ```
 *
 * @example
 * ```ts
 * createEffect(
 *   () => userId(),
 *   id => {
 *     const ctrl = new AbortController();
 *     fetch(`/users/${id}`, { signal: ctrl.signal });
 *     return () => ctrl.abort(); // cleanup before next run / disposal
 *   }
 * );
 * ```
 *
 * @description https://docs.solidjs.com/reference/basic-reactivity/create-effect
 */
function createEffect(compute, effectFn, options) {
  if (effectFn === undefined) {
    const message =
      "[MISSING_EFFECT_FN] createEffect requires both a compute function and an effect function. " +
      "Use `createEffect(() => signal(), value => doWork(value))`. " +
      "If you want a derived value, use `createMemo`. " +
      "If you want a one-shot side effect, just call the function directly.";
    emitDiagnostic({
      code: "MISSING_EFFECT_FN",
      kind: "lifecycle",
      severity: "error",
      message
    });
    throw new Error(message);
  }
  effect(compute, effectFn.effect || effectFn, effectFn.error, {
    user: true,
    ...options
  });
}
/**
 * Creates a reactive computation that runs during the render phase as DOM elements
 * are created and updated but not necessarily connected.
 *
 * Same compute / effect split as `createEffect`, but scheduled inside the render
 * queue rather than after it. Reach for this only when authoring renderer
 * plumbing (custom DOM bindings, JSX-generated `insert()` / `spread()` calls).
 * App code should use `createEffect`.
 *
 * ```typescript
 * createRenderEffect<T>(compute, effectFn, options?: EffectOptions);
 * ```
 * @param compute a function that receives its previous value and returns a new value used to react on a computation
 * @param effectFn a function that receives the new value and is used to perform side effects
 * @param options `EffectOptions` -- name, defer, schedule, transparent
 *
 * @example
 * ```ts
 * // Custom directive: bind an element's textContent to a reactive source.
 * function bindText(el: HTMLElement, source: () => string) {
 *   createRenderEffect(
 *     () => source(),
 *     value => { el.textContent = value; }
 *   );
 * }
 * ```
 *
 * @description https://docs.solidjs.com/reference/secondary-primitives/create-render-effect
 */
function createRenderEffect(compute, effectFn, options) {
  effect(compute, effectFn, undefined, options);
}
/**
 * Creates a tracked reactive effect where dependency tracking and side effects happen
 * in the same scope.
 *
 * @deprecated Do not use in new code. For a side effect that follows reactive
 * state, use `createEffect(compute, effect)` — it separates tracking from the
 * side effect, knows its dependencies before it runs, and participates in
 * async and transitions. For one-time DOM work after render (measuring,
 * attaching third-party widgets to a ref), use `onSettled`. Tracking from
 * inside the effect phase — the only thing this primitive adds — is retained
 * solely to ease 1.x migration: it runs beside user-effect callbacks after
 * values commit, never holds a transition, and cannot observe a write staged
 * earlier in the same flush by a signal it has not read yet.
 *
 * WARNING: Because tracking and effects happen in the same scope, this primitive
 * may run multiple times for a single change or show tearing (reading inconsistent
 * state). Use only when dynamic subscription patterns require same-scope tracking.
 *
 * The callback runs during the flush itself: writes made inside it are queued
 * into the same flush's continuation and are never visible to the callback's
 * own reads (reads return settled values, as in every effect-phase scope), and
 * `flush()` cannot be called from inside it (dev throws; production is a
 * no-op) — defer with `queueMicrotask(() => flush())` if needed.
 *
 * ```typescript
 * createTrackedEffect(compute, options?: { name?: string });
 * ```
 * @param compute a function that contains reactive reads to track and returns an optional cleanup function to run on disposal or before next execution
 * @param options -- name
 *
 * @example
 * ```ts
 * createTrackedEffect(() => {
 *   const target = focusedNode();
 *   if (!target) return;
 *
 *   const handler = () => log(target.value());
 *   target.on("change", handler);
 *
 *   return () => target.off("change", handler);
 * });
 * ```
 *
 * @description https://docs.solidjs.com/reference/secondary-primitives/create-tracked-effect
 */
function createTrackedEffect(compute, options) {
  trackedEffect(compute, options);
}
/**
 * Creates a reactive computation that runs after the render phase with flexible tracking.
 *
 * ```typescript
 * const track = createReaction(effectFn, options?: EffectOptions);
 * track(() => { // reactive reads });
 * ```
 * @param effectFn a function (or `EffectBundle`) that is called when tracked function is invalidated
 * @param options `EffectOptions` -- name, defer
 *
 * @example
 * ```ts
 * const [count, setCount] = createSignal(0);
 *
 * const track = createReaction(() => {
 *   console.log("count changed once, re-arm to listen again");
 *   track(() => count()); // re-arm
 * });
 *
 * track(() => count()); // initial arm
 *
 * setCount(1); // logs once, reaction re-armed for next change
 * ```
 *
 * @description https://docs.solidjs.com/reference/secondary-primitives/create-reaction
 */
function createReaction(effectFn, options) {
  let cl = undefined;
  cleanup(() => cl?.());
  const owner = getOwner();
  // The currently armed effect node. `track()` replaces the previous
  // subscription (1.x semantics): without disposing the superseded arm, its
  // sources stayed live (firing the callback for replaced dependencies), each
  // accumulated arm delivered its own fire, and un-fired arms leaked as live
  // effect nodes until the owner disposed (#2861).
  let arm;
  return tracking => {
    if (arm) {
      dispose(arm);
      arm = undefined;
    }
    runWithOwner(owner, () => {
      effect(
        () => (tracking(), (arm = getOwner())),
        node => {
          arm = undefined;
          cl?.();
          const cleanup = (effectFn.effect || effectFn)?.();
          if (true && cleanup !== undefined && typeof cleanup !== "function") {
            throw new Error(
              "Reaction callback returned an invalid cleanup value. Return a cleanup function or undefined."
            );
          }
          cl = cleanup;
          dispose(node);
        },
        effectFn.error,
        {
          ...options,
          user: true,
          defer: true
        }
      );
    });
  };
}
/** Delivers effect applies on a microtask instead of queueing them (#2930). */
class MicrotaskQueue extends Queue {
  enqueue(type, fn) {
    queueMicrotask(() => fn(type));
  }
}
/**
 * Awaits a reactive expression and returns its first fully-settled value as a
 * `Promise`. Pending async reads (`createMemo` returning a promise, etc.) are
 * waited on; once the expression returns synchronously without `NotReadyError`
 * the promise resolves with that value. If the expression settles with an
 * error instead — including an async source that rejects — the promise
 * rejects with it.
 *
 * Must be called *outside* a tracking scope — it doesn't subscribe, it just
 * resolves the current value once.
 *
 * @example
 * ```ts
 * const user = createMemo(() => fetch(`/users/${id()}`).then(r => r.json()));
 *
 * // outside any reactive scope
 * const initial = await resolve(() => user());
 * ```
 *
 * @param fn a reactive expression to resolve
 */
function resolve(fn) {
  if (getObserver()) {
    throw new Error(
      "Cannot call resolve inside a reactive scope; it only resolves the current value and does not track updates."
    );
  }
  return new Promise((res, rej) => {
    createRoot(dispose => {
      // Deliver effect applies on a microtask instead of the owner queue: an
      // incomplete transition stashes its effect queues until it settles, but
      // an action yielding this promise is itself what keeps the transition
      // open — the stashed res() deadlocked the action (#2930). The compute
      // still runs in place (under the transaction's view when created inside
      // an action step), and status/boundary notifications keep their normal
      // route through the inherited queue.
      const owner = getOwner();
      const queue = new MicrotaskQueue();
      queue._parent = owner._queue; // notify() forwards up the normal chain
      owner._queue = queue;
      // A user effect rather than a bare computed: computeds are pull-based and
      // are only re-enqueued when a pending source *resolves* — a rejection just
      // marks them errored, so nothing would re-run and the promise would never
      // settle (#2842). The effect's error channel is notified on rejection.
      effect(
        fn,
        value => {
          res(value);
          dispose();
        },
        err => {
          // The error arm already unwraps StatusError (#2840) — `err` is the
          // user's original error, matching what error boundaries expose.
          rej(err);
          dispose();
        },
        // DIRECT_COMMIT: a source settling INTO the held transaction (e.g. a
        // refresh this action issued) stages its landing; the effect's own
        // recompute must not stage too, or the microtask apply reads the
        // stale mainline value and resolves with old data.
        { user: true, _extraConfig: CONFIG_DIRECT_COMMIT }
      );
    });
  });
}
/**
 * Invalidates one reactive source, forcing it to re-execute even if its inputs
 * haven't changed, and returns a promise for the target's NEXT QUIESCENT
 * STATE — the re-ask (and anything that supersedes it) has settled.
 *
 * Pass either a Solid-created accessor or a projected store created from
 * `createStore(fn, ...)` / `createProjection(...)`. `refresh()` is a
 * write-like invalidation operation: it does not read the target's value, and
 * refreshing a plain signal accessor is a no-op that resolves immediately.
 *
 * The returned promise is safe to ignore (fire-and-forget refresh is
 * unchanged, and a failed refetch will not surface an unhandled rejection).
 * Awaiting it gives imperative flows the settle point without a reactive
 * read:
 * - Accessor targets resolve with the settled value; store targets resolve
 *   with the store node passed (reads through it are fresh after the await).
 * - A failed re-ask rejects with the error (inside an action's generator,
 *   `yield refresh(x)` throws back at the yield point and the action reverts
 *   like any other failure).
 * - Semantics are quiescence, not flight identity: if another refresh (or
 *   any invalidation) supersedes this one mid-flight, the promise waits for
 *   — and delivers — whatever finally lands.
 * - Inside an action, truth landing into the held transaction is STAGED;
 *   the promise still settles then (matching `resolve()`/`until()`, #2930)
 *   and delivers the staged value — the caller's own optimistic override is
 *   never the delivered value.
 * - The re-ask itself stays verdict-quiet exactly as before: `isPending`
 *   does not flip for a bare refresh (pair with `affects()` for a visible
 *   pending window).
 *
 * @example
 * ```ts
 * const user = createMemo(async () => fetch(`/users/${id()}`).then(r => r.json()));
 *
 * // Fire-and-forget re-fetch
 * <button onClick={() => refresh(user)}>Reload</button>;
 *
 * // Imperative settle point
 * const fresh = await refresh(user);
 * ```
 */
function refresh(target) {
  const node = target?.[$REFRESH];
  if (!node) {
    {
      const message =
        "[INVALID_REFRESH_TARGET] refresh() expects a Solid source accessor or refreshable store. " +
        "Pass the original source target, not a wrapper function or derived property read.";
      emitDiagnostic({
        code: "INVALID_REFRESH_TARGET",
        kind: "write",
        severity: "error",
        message
      });
      throw new Error(message);
    }
  }
  // Mark now, watch on a microtask. The waiter is resolve()'s machinery with
  // two extra reader bits, but it must NOT compute at call time (effects
  // recompute eagerly on creation): same-tick refreshes coalesce into ONE
  // re-ask only because every mark lands before anything pulls, and eager
  // per-call pulls turned three refreshes into three fetches. Deferred, the
  // waiter's first read sees the coalesced state: FRESH_READ pulls the node
  // through recompute if it is still dirty (self-deduping — a clean node
  // no-ops, so N waiters cost one pull; this also closes the race where a
  // waiter reads the PRE-re-ask value as settled and delivers stale), after
  // which the read either parks on the re-ask's pending window (async — the
  // settle walk re-runs it on every landing, equal-value and
  // staged-under-hold included, and a rejection arrives through the effect's
  // error channel) or serves the sync answer. AUTHORITATIVE_READ keeps an
  // action's own optimistic override out of the delivered value. resolve()'s
  // own eager compute is untouched: created after a refresh it still settles
  // stale-while-revalidate (#2930) — its contract is "first settled value",
  // not "next quiescent state".
  //
  // An authoritative reader is woken through a late-bound hook when the truth
  // lands EQUAL to a standing override (the A17-silent path). Every setter of
  // that reader bit must install it — until() does, and this waiter is the
  // other one (#3303: refresh of an optimistic in an app that never called
  // until() dereferenced the null hook).
  installAuthoritativeRead();
  markRefresh(node);
  const promise = new Promise((res, rej) => {
    queueMicrotask(() => {
      // No createRoot: the microtask has no ambient owner, so the effect is
      // naturally detached, and settle disposes the node directly — the root
      // added ~560B of otherwise-shakeable machinery for nothing but the
      // dev-mode NO_OWNER_EFFECT warning, so dev keeps a root husk purely to
      // stay quiet. The waiter swaps in its microtask queue during its own
      // first compute (before the initial apply enqueue), replacing the
      // root-owner plumbing.
      // Typed as the effect node, not Owner: the capture runs inside the
      // effect's own compute, where the ambient owner IS the effect —
      // exactly what dispose() takes.
      let waiter = null;
      const make = () =>
        effect(
          () => {
            if (waiter === null) {
              waiter = getOwner();
              const queue = new MicrotaskQueue();
              queue._parent = waiter._queue;
              waiter._queue = queue;
            }
            return read(node);
          },
          value => {
            res(typeof target === "function" ? value : target);
            dispose(waiter);
          },
          err => {
            rej(err);
            dispose(waiter);
          },
          {
            user: true,
            _extraConfig: CONFIG_DIRECT_COMMIT | CONFIG_AUTHORITATIVE_READ | CONFIG_FRESH_READ
          }
        );
      createRoot(make);
    });
  });
  // Fire-and-forget refresh must not turn a failed refetch into an unhandled
  // rejection; awaiting callers attach their own handlers to `promise`.
  promise.catch(() => {});
  return promise;
}
/**
 * Awaits a reactive predicate and resolves the first time it settles *truthy*,
 * with that (narrowed) value. Falsy results and pending async reads both mean
 * "not yet": the subscription stays live and re-evaluates as sources change.
 * If the predicate settles with an error — a throw, or an async source that
 * rejects — the promise rejects with it, as do timeout and abort.
 *
 * Where {@link resolve} answers "what is this value" (first settled value,
 * whatever it is), `until` answers "when does the world confirm this
 * condition". The difference matters inside an `action()`: `yield until(...)`
 * holds the action's transaction — and any optimistic state riding it — open
 * until the condition is independently true.
 *
 * To make that sound, `until`'s predicate reads the AUTHORITATIVE view — and
 * this is the one read-semantics difference from `resolve`, which reads the
 * normal (transaction's own) view where overrides are visible:
 *
 * - **Optimistic overrides are invisible** to the predicate. Your own
 *   tentative write can never satisfy your own ack, even on the
 *   single-primitive shape where the optimistic store IS the live-fed store.
 *   (Derived computeds serve their normal cached values — express the
 *   condition over sources of truth, not derived views of the overlay.)
 * - **Everything else reads normally, including uncommitted transition-staged
 *   data.** Real data is real wherever it currently lives. This is
 *   load-bearing, not a loophole: truth that arrives *into* the open
 *   transaction (a `refresh()` this action issued, an entangled landing)
 *   stages and cannot commit until the hold releases — a predicate that
 *   refused staged reads would deadlock on the very data it is waiting for.
 *
 * This is the acknowledgment mechanism for mutations confirmed on a live data
 * channel (sockets, subscriptions, live queries) rather than by the mutation's
 * own response: correlate by a client-generated id or version in the predicate,
 * and let truth arrive however it arrives — push, refetch, or another tab.
 *
 * Failure composes with action semantics: a rejection is thrown back into the
 * generator at the `yield` point — catchable there, or the action fails and
 * its optimistic state reverts.
 *
 * Must be called *outside* a tracking scope.
 *
 * Inside an action, call it from a step: after an `await`, put a bare `yield`
 * before `yield until(...)`. The runtime cannot hook an async generator's
 * `await` continuation, so the `until(...)` expression — which CREATES the
 * predicate's reader — would otherwise run outside the transaction; created
 * there it is born held (A29) and replays only at the commit its own promise
 * holds open (#3482). See {@link action}.
 *
 * @example
 * ```ts
 * const send = action(async function* (text: string) {
 *   const clientId = crypto.randomUUID();
 *   setMessages(m => { m.push({ clientId, text, pending: true }); }); // optimistic
 *   await socket.send({ clientId, text }); // fire-and-forget transport
 *   yield; // re-enter the transaction after the await
 *   // Hold until the live source echoes the write (authoritative view —
 *   // the optimistic row above cannot satisfy this):
 *   yield until(() => messages.some(m => m.clientId === clientId), { timeout: 10_000 });
 * });
 * ```
 *
 * @param fn a reactive predicate over authoritative state
 * @param options optional `timeout` (ms) and abort `signal`
 */
function until(fn, options) {
  if (getObserver()) {
    throw new Error(
      "Cannot call until inside a reactive scope; await it from an action or another imperative scope."
    );
  }
  // Late-bind the wakeup hook for the A17-silent ack paths (pay-for-use:
  // apps that never call until() never retain it).
  installAuthoritativeRead();
  // Flip-entanglement (#3164 follow-up): the transaction this until() holds
  // open (the action's, when yielded from one). The predicate is the user's
  // declaration of what confirms it — when a foreign transition's staged
  // write flips it truthy, that transition merges here and reveals at the
  // joint settle instead of painting the confirmation under live optimism.
  const awaiting = activeTransition;
  return new Promise((res, rej) => {
    const signal = options?.signal;
    if (signal?.aborted) return rej(signal.reason);
    createRoot(dispose => {
      // Same delivery contract as resolve() (#2930): effect applies ride a
      // microtask so the promise can settle while the transaction the caller
      // yielded it into is still open — that transaction being open is the
      // entire point of the hold.
      const owner = getOwner();
      const queue = new MicrotaskQueue();
      queue._parent = owner._queue;
      owner._queue = queue;
      let timer;
      let onAbort;
      const settle = fire => {
        if (timer !== undefined) clearTimeout(timer);
        if (onAbort !== undefined) signal.removeEventListener("abort", onAbort);
        fire();
        dispose();
      };
      effect(
        awaiting === null
          ? fn
          : () => {
              const value = fn();
              // Runs inside the compute (pure phase): the confirming
              // transition's stamps are live and its commit hasn't run, so
              // the merge lands before any reveal. Falsy evaluations skip —
              // non-flipping updates were never named as the confirmation.
              if (value) entangleConfirmingTransitions(getObserver(), awaiting);
              return value;
            },
        value => {
          // Falsy is "not yet": keep the subscription live and wait for the
          // next evaluation. Only a truthy settled value resolves.
          if (value) settle(() => res(value));
        },
        err => settle(() => rej(err)),
        // AUTHORITATIVE_READ: overrides invisible to the predicate.
        // DIRECT_COMMIT: truth that stages into the held transaction (a
        // refresh the action issued) must flow through to the microtask
        // apply — a staged effect value would deadlock the hold on data
        // the hold itself is keeping uncommitted.
        { user: true, _extraConfig: CONFIG_AUTHORITATIVE_READ | CONFIG_DIRECT_COMMIT }
      );
      if (options?.timeout !== undefined)
        timer = setTimeout(() => settle(() => rej(new TimeoutError())), options.timeout);
      if (signal !== undefined) {
        onAbort = () => settle(() => rej(signal.reason));
        signal.addEventListener("abort", onAbort, { once: true });
      }
    });
  });
}
function createOptimistic(first, second) {
  // Install before the node exists: only engine-installed programs can carry
  // an _overrideValue slot (same runtime-install pattern as
  // GlobalQueue._clearOptimisticStore in createOptimisticStore).
  installOptimisticEngine();
  if (typeof first === "function") {
    const node = optimisticComputed(first, second);
    node._config &= ~CONFIG_AUTO_DISPOSE;
    return [accessor(node), setSignal.bind(null, node)];
  }
  const node = optimisticSignal(first, second);
  registerGraph(node, getOwner());
  return [accessor(node), setSignal.bind(null, node)];
}
/**
 * Schedules `callback` to run **once** after the reactive graph has fully
 * settled — i.e. once every pending async read inside the current owner has
 * resolved and the queue has flushed. Each call registers a single fire; it
 * does not create an ongoing subscription.
 *
 * The canonical lifecycle primitive in 2.0. Three main usages:
 *
 * - **Component-level setup-and-teardown** *(the most common shape)*: run
 *   setup after the component's first stable render and **return a cleanup
 *   function** to dispose it on owner disposal. This is the replacement for
 *   the 1.x `onMount` + `onCleanup` pairing — setup and teardown live in one
 *   block, and `onCleanup` is no longer the right tool for component
 *   bodies. (`onMount` no longer exists in 2.0.)
 * - **Post-settle "ready" hook:** run once after a component's first stable
 *   render — analytics ping, focus, scroll-into-view, etc. No cleanup needed.
 * - **Inside an event handler:** schedule work to run after the action /
 *   transition triggered by the event has completed.
 *
 * Reactive reads inside the callback are *not* tracked — to react to
 * subsequent settles, register a new `onSettled` each time.
 *
 * The callback runs during the settle flush itself, which gives it the same
 * write semantics as every other effect-phase scope (the effect half of
 * `createEffect`, event handlers):
 *
 * - **Writes** are queued into the same flush's continuation — dependent memos
 *   and effects update before the flush returns — but reads inside the
 *   callback keep returning the settled (pre-write) values. A callback never
 *   observes its own unsettled write. Functional setters still compose:
 *   `set(v => v + 1)` twice increments twice.
 * - **`flush()` cannot be called** from inside the callback — the flush is
 *   already running (dev throws; production is a no-op). To force a drain
 *   after this settle, defer it: `queueMicrotask(() => flush())`.
 *
 * `onCleanup` is **not** allowed inside the callback — return a cleanup
 * function instead. The returned cleanup runs on owner disposal.
 *
 * A cleanup return is only honored when `onSettled` is called from an **owned**
 * scope (e.g. a component body). When it fires out of band from an *unowned*
 * scope — an event handler, a tracked effect, or another `onSettled` — there is
 * no owner lifecycle to bind a cleanup to; returning one is a dev-mode error
 * (and is dropped in production). Use the post-settle/event-handler forms below
 * for one-shot work, and keep setup-with-teardown in an owned scope.
 *
 * @example
 * ```tsx
 * // Component-level setup + teardown — replaces onMount + onCleanup.
 * // Subscribe to an external source on mount, unsubscribe on dispose.
 * function useViewportWidth() {
 *   const [width, setWidth] = createSignal(window.innerWidth);
 *   onSettled(() => {
 *     const onResize = () => setWidth(window.innerWidth);
 *     window.addEventListener("resize", onResize);
 *     return () => window.removeEventListener("resize", onResize);
 *   });
 *   return width;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Post-settle "ready" hook — no cleanup needed.
 * function Dashboard() {
 *   const data = createMemo(async () => fetchData());
 *
 *   onSettled(() => {
 *     analytics.track("dashboard.ready");
 *   });
 *
 *   return <Loading fallback={<Spinner />}><pre>{data()}</pre></Loading>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Event-handler — runs after the action settles.
 * function SaveButton() {
 *   const save = action(function* () {
 *     yield api.save();
 *   });
 *
 *   const handleClick = () => {
 *     save();
 *     onSettled(() => toast("Saved!"));
 *   };
 *
 *   return <button onClick={handleClick}>Save</button>;
 * }
 * ```
 *
 * @param callback Function to run; may return a cleanup function that fires
 *   on owner disposal
 */
function onSettled(callback) {
  const owner = getOwner();
  owner && !(owner._config & CONFIG_CHILDREN_FORBIDDEN)
    ? trackedEffect(() => untrack(callback), { name: "onSettled" })
    : globalQueue.enqueue(EFFECT_USER, function fire() {
        // Settled means derived. A settle that reverts optimism (or replays
        // gated reads) only enqueues the affected subscribers; the pass after
        // the commit re-derives them. Fired in the commit pass, the callback
        // read the optimistic source already reverted beside a sync memo of it
        // still holding the optimistic value — reads do not pull (#3411). Fall
        // to the next pass while the heap has work; `run` swapped the queue,
        // so this lands there, and `enqueue` keeps the drain alive.
        if (dirtyQueue._max >= dirtyQueue._min) return globalQueue.enqueue(EFFECT_USER, fire);
        // Unowned, out-of-band fire (no owner, or a children-forbidden one this
        // one-shot must not bind to): a returned cleanup has no lifecycle to
        // attach to. Reject it in dev; in production the return is simply
        // dropped — never bound to an unrelated owner or run eagerly.
        const cleanup = callback();
        if (cleanup !== undefined) {
          const message =
            "[SETTLED_CLEANUP_UNOWNED] onSettled returned a cleanup in an unowned scope; a cleanup can only be honored under an owner. Call your setup helper from an owned scope (e.g. the component body) instead of from inside an event handler, tracked effect, or another onSettled.";
          emitDiagnostic({
            code: "SETTLED_CLEANUP_UNOWNED",
            kind: "lifecycle",
            severity: "error",
            message
          });
          throw new Error(message);
        }
      });
}

/**
 * Ownership stamp (#3360): every backing the store ALLOCATES (CoW clones,
 * privatized committed backings) carries its owning target under this
 * enumerable symbol. One property write replaces the two weak-collection
 * registrations (ownership set + raw→target map) a fresh object used to pay
 * per draft — V8's identity-hash + ephemeron cost dominated the one-key
 * write floor. Enumerable so a spread copy (the plain-data clone path) stays
 * on the fast path and carries the stamp along.
 *
 * Owned backings are never user-reachable (`snapshot` copies them, the traps
 * hide the key), so every raw key walk in the store must skip `$OWNER`, and
 * ownership is answered by `isOwned` — a user object never carries it.
 * Overlay drafts (`Object.create(v)` over an owned `v`) inherit the stamp.
 */
const $OWNER = Symbol("STORE_OWNER");
/** raw → target for UNOWNED backings (user-ingested, adopted); owned
 * backings resolve through their `$OWNER` stamp. Boundary mechanism (O8). */
const storeNextLookup = new WeakMap();
/** A backing the store allocated and may mutate in place. */
function isOwned(raw) {
  return raw[$OWNER] !== undefined;
}
/** raw → target within a family (`null` = plain stores / the global map).
 * The stamp answers for backings owned by a target OF THAT FAMILY; anything
 * else (user objects, adoptees, another family's backings the family
 * re-registered for its own wrapper) resolves through the family's map. */
function lookupTarget$1(raw, fam) {
  const owner = raw[$OWNER];
  return owner !== undefined && owner.fam === fam ? owner : (fam?.map ?? storeNextLookup).get(raw);
}
function devAssertNeverUserMutation(target) {
  return;
}
let optHooks = null;
function setOptHooks(h) {
  optHooks = h;
}
/** Sticky descendants flag walk (§6d): reconcile's keyed pruning descends
 * only where subscriptions exist at/below. Nodes AND patches count. */
function markDescendants(target) {
  let t = target;
  while (t && !t.d) {
    t.d = true;
    t = t.u;
  }
}

/**
 * Brand symbols used internally by the store proxy / projection plumbing.
 * Cross-package wiring; not part of the user-facing API.
 *
 * @internal
 */
const $TRACK = Symbol("STORE_TRACK"),
  $TARGET = Symbol("STORE_TARGET"),
  $PROXY = Symbol("STORE_PROXY"),
  // The view record behind a merge()/omit() proxy (a `MergeView` or an
  // `OmitView`, utils.ts); a store answers `undefined` on its symbol fast
  // path. One read classifies any `$PROXY`-marked object — store, view, or
  // foreign — where asking `$TARGET` first and then each view kind was two
  // to four trap hops (see `viewOf`).
  $RECORD = Symbol("VIEW_RECORD"), // Node-map slot carrying a record-level `affects()` mark: any read through
  // the record witnesses it into the active isPending() probe.
  $AFFECTS = Symbol("STORE_AFFECTS");
// Structural field names of store targets (StoreNextTarget aliases these, so
// shared machinery — affects walks, tests — reads targets via the consts).
const STORE_VALUE = "v",
  STORE_NODE = "n",
  STORE_HAS = "h";
function lookupTarget(value, fam) {
  // Family registrations (projections/optimistic) first, then the global
  // next lookup. Proxies resolve through $TARGET directly.
  return (fam ? lookupTarget$1(value, fam) : undefined) ?? lookupTarget$1(value, null);
}
// Values marked raw never acquire a proxy identity: wrap() serves them as-is
// everywhere — deep stores hold them as leaf values replaced by reference.
// Once raw, always raw (identity stays single, just unwrapped). Consulted
// only on wrap-creation and ingest paths; reads never touch it.
const rawValues = new WeakSet();
/**
 * Marks a value as raw: no store will ever wrap it — every store presents it
 * as-is, tracked by reference at whatever slot holds it and updated by
 * replacement. Useful for class instances and external objects (editors,
 * scene graphs, Maps) and for record-shaped data updated wholesale. Sticky
 * for the value's lifetime.
 */
// Flipped on the first mark and exported as a LIVE binding: reconcile
// consults it on every recursable pair, and importing the boolean directly
// lets those sites skip even the function call when no shallow store or raw
// mark exists anywhere in the app.
let rawValuesUsed = false;
function isRawValue(value) {
  return rawValuesUsed && rawValues.has(value);
}
function markRawOne(v) {
  if (isWrappable(v)) {
    // A store proxy is already tracked elsewhere: the shallow boundary passes
    // it through by reference (replaced, never edited — same slot semantics
    // as a raw) instead of claiming it raw. The sticky mark is global, so
    // marking a live proxy would make wrap() serve it verbatim through every
    // OTHER store too — downstream deep stores then captured it instead of
    // wrapping it in their own family, and their writes landed in the
    // upstream store's override layer (#2932).
    if (v[$TARGET] !== undefined) return;
    if (lookupTarget$1(v, null) !== undefined)
      throw new Error(
        "shallow store: an ingested record is already tracked as a deep store — one value cannot present both wrapped and raw"
      );
    rawValuesUsed = true;
    rawValues.add(v);
  }
}
function markRawIngest(container) {
  if (Array.isArray(container)) {
    for (let i = 0, len = container.length; i < len; i++) markRawOne(container[i]);
  } else {
    for (const k in container) markRawOne(container[k]);
  }
}
const OBJECT_PROTO = Object.prototype;
// Per-prototype memo for the custom-proto branch of isWrappable: the verdict
// is fully determined by the prototype (tag and Node lineage both live on
// the chain), so each class pays the tag call once — not per read.
const wrappableProtos = new WeakMap();
function isWrappable(obj) {
  if (obj == null || typeof obj !== "object" || Object.isFrozen(obj)) return false;
  // Plain data and user class instances wrap; platform objects never do
  // (#2952). Native code brand-checks internal slots and throws through a
  // proxy (`Map.prototype.size`, `Date.prototype.getTime`, ...), so
  // collections and other built-ins can't honestly be stores — they get the
  // markRaw-children contract automatically: served raw, mutations land raw,
  // the property holding them still tracks (reassignment notifies). The tag
  // check separates them structurally: user classes stringify as
  // `[object Object]` while every native/host object carries its own brand
  // (`[object Map]`, `[object Date]`, `[object Headers]`, ...), including
  // subclasses, which inherit the tag. getPrototypeOf keeps the hot path
  // (plain and null-proto objects) intrinsic-only — no property lookup.
  const proto = Object.getPrototypeOf(obj);
  if (proto === OBJECT_PROTO || proto === null) return true;
  if (Array.isArray(obj)) return true;
  let wrappable = wrappableProtos.get(proto);
  if (wrappable === undefined) {
    wrappable =
      Object.prototype.toString.call(obj) === "[object Object]" &&
      // Dynamic Node check (kept dynamic so test/SSR overrides of
      // `globalThis.Node` are observed at call time): shimmed DOMs implement
      // nodes as plain user classes, which pass the tag check.
      (typeof Node === "undefined" || !(obj instanceof Node));
    wrappableProtos.set(proto, wrappable);
  }
  return wrappable;
}
let writeOverride = false;
function setWriteOverride(value) {
  writeOverride = value;
}
function getWriteOverride() {
  return writeOverride;
}
// Own enumerable keys including symbols (`Object.keys` drops symbol-keyed props). #2769
function ownEnumerableKeys(o) {
  return Reflect.ownKeys(o).filter(k => Object.prototype.propertyIsEnumerable.call(o, k));
}
/**
 * Scope inheritance for late-created nodes: every live mark whose identity
 * scope contains the owning record's raw — and, for keyed marks, whose key
 * is this property — gets counted on the new node. Inherited marks live
 * exactly as long as the scope's carrier — the release hook below drops
 * them with the entry.
 */
function inheritAffectsMarks(node, raw, property) {
  // A live scope exists, so affects.ts already installed the mark engine.
  for (const [carrier, entry] of affectsScopes) {
    if (
      carrier._x?._affectsCount &&
      entry.scope.has(raw) &&
      (entry.key === undefined || entry.key === property)
    ) {
      GlobalQueue._markAffects(node);
      entry.inherited.push(node);
    }
  }
}
const affectsScopes = new Map();
/** Next-store node factory for affects carriers/slots: injected by the
 * rewrite module (next targets alias the legacy field names, so everything
 * here EXCEPT node creation works on them structurally). */
let nextAffectsNodeResolver = null;
function setNextAffectsNodeResolver(fn) {
  nextAffectsNodeResolver = fn;
}
/** Next-store optimistic view for the declaration walk (optimistic rows
 * pushed before the declaration are in motion too — legacy reads its write
 * overlays; next composes armed-node overrides). */
let nextOptimisticViewResolver = null;
function setNextOptimisticViewResolver(fn) {
  nextOptimisticViewResolver = fn;
}
/** @internal birth inheritance for nodes created inside a live mark window —
 * exported for the rewrite's node factories. */
function affectsScopesLive() {
  return affectsScopes.size > 0;
}
/**
 * Snapshots the identities reachable from `value` into `scope`, reading
 * through write overlays (an optimistic row pushed before the declaration is
 * in motion too). Untracked by construction: walks raw values, never traps.
 * Every LIVE node under each reachable record — property leaves, `$TRACK`,
 * and has-nodes — collects into `found`: those are the graph edges existing
 * readers subscribed through, so the mark registers on them directly and
 * rides the status rails to everything derived. (Nodes born later inherit
 * from the scope in `getNode`.)
 */
function walkAffectsScope(
  value,
  entry,
  found,
  fam,
  // Cycle guard, fresh per declaration: the scope itself can't serve — a
  // re-declaration on the same carrier unions into a scope that already
  // holds the root, and must still descend to pick up records added since.
  visited
) {
  if (!isWrappable(value)) return;
  const target = value[$TARGET] || lookupTarget(value, fam);
  // Next targets: walk the pending backing when present (a draft's writes are
  // in motion too) and cover BOTH identities in the scope.
  let raw = target ? (target.pb ?? target[STORE_VALUE]) : value;
  if (visited.has(raw)) return;
  visited.add(raw);
  entry.scope.add(raw);
  if (target && target.pb) entry.scope.add(target[STORE_VALUE]);
  // Next optimistic families: enumerate the VISIBLE view (armed-node
  // overrides compose membership/values the raw doesn't carry).
  if (target && target.fam?.opt && nextOptimisticViewResolver)
    raw = nextOptimisticViewResolver(target, raw);
  if (target) {
    collectRecordNodes(target[STORE_NODE], found);
    collectRecordNodes(target[STORE_HAS], found);
    // The key-set and deep-witness nodes are record-level channels: a deep()
    // probe reads ONLY these (one pair per record), so a declared affects
    // scope must mark them like any property node.
    if (target.k) found.push(target.k);
    if (target.dk) found.push(target.dk);
    // Carry the effective family into untouched descendants (projections/
    // optimistic stores register children under their family).
    fam = target.fam ?? fam;
  }
  // Overlays are gone (next has no layer): raw enumeration; the optimistic
  // view composition above already folded armed-node membership/values in.
  if (Array.isArray(raw)) {
    for (let i = 0, len = raw.length; i < len; i++) {
      walkAffectsScope(raw[i], entry, found, fam, visited);
    }
    const symbols = Object.getOwnPropertySymbols(raw);
    for (let i = 0, l = symbols.length; i < l; i++) {
      if (symbols[i] === $OWNER) continue;
      const desc = Object.getOwnPropertyDescriptor(raw, symbols[i]);
      if (!desc || desc.get) continue;
      walkAffectsScope(desc.value, entry, found, fam, visited);
    }
  } else {
    const keys = Reflect.ownKeys(raw);
    for (let i = 0, l = keys.length; i < l; i++) {
      if (keys[i] === $OWNER) continue;
      const desc = Object.getOwnPropertyDescriptor(raw, keys[i]);
      if (!desc || desc.get) continue;
      walkAffectsScope(desc.value, entry, found, fam, visited);
    }
  }
}
/** All live signal nodes of one record's node map (string + symbol keyed). */
function collectRecordNodes(nodes, found) {
  if (!nodes) return;
  for (const key of Object.keys(nodes)) found.push(nodes[key]);
  const syms = Object.getOwnPropertySymbols(nodes);
  for (let i = 0, l = syms.length; i < l; i++) {
    // Another mark's carrier is its own channel — counting it here would
    // extend that sibling scope's lifetime to this declaration's.
    if (syms[i] !== $AFFECTS) found.push(nodes[syms[i]]);
  }
}
/**
 * Witness live mark coverage of a record into the active isPending() probe.
 * Tracked reads don't need this — they go through real signal nodes, which
 * carry marks directly (declaration walk or birth inheritance). This covers
 * UNTRACKED probes reading through records whose nodes never materialized
 * (no observer ever subscribed, so no node exists to carry the mark).
 * Callers guard on `pendingCheckActive`, so plain reads never pay for this.
 *
 * @internal
 */
function witnessAffectsMark(target, property) {
  // Callers guard on `pendingCheckActive`, which only flips inside
  // isPending() — the verdict layer is loaded and its hook installed.
  const own = target[STORE_NODE]?.[$AFFECTS];
  if (own?._x?._affectsCount) GlobalQueue._witnessAffects(own);
  if (affectsScopes.size) {
    // Chained backings (§7b): a wrapper's STORE_VALUE can be another store's
    // proxy — marks cover by identity of the BASE raw, so resolve the chain
    // and check every identity along it.
    let raw = target[STORE_VALUE];
    for (const [carrier, entry] of affectsScopes) {
      if (
        carrier !== own &&
        carrier._x?._affectsCount &&
        (entry.key === undefined || entry.key === property)
      ) {
        let r = raw;
        for (;;) {
          if (entry.scope.has(r)) {
            GlobalQueue._witnessAffects(carrier);
            break;
          }
          const t = r?.[$TARGET];
          if (t === undefined) break;
          const backing = t.pb ?? t[STORE_VALUE];
          if (backing === r) break;
          r = backing;
        }
      }
    }
  }
}
/**
 * Resolves the store nodes an `affects()` declaration marks: with a `key`,
 * the named slot's leaf node (upserted so the mark has an addressable
 * carrier); without, the record's $AFFECTS carrier plus every LIVE node in
 * its subtree (the edges existing readers subscribed through), with the
 * subtree's identities snapshotted into the mark's scope so nodes created
 * during the window — and untracked probes over captured proxies — resolve
 * against it (#2882).
 *
 * @internal
 */
function getStoreAffectsNodes(target, key) {
  GlobalQueue._releaseAffectsScope ||= node => {
    const entry = affectsScopes.get(node);
    if (!entry) return;
    affectsScopes.delete(node);
    for (let i = 0; i < entry.inherited.length; i++)
      GlobalQueue._releaseAffectsMark(entry.inherited[i]);
  };
  if (key === undefined) {
    const carrier = nextAffectsNodeResolver(target, $AFFECTS);
    let entry = affectsScopes.get(carrier);
    if (!entry) affectsScopes.set(carrier, (entry = { scope: new Set(), inherited: [] }));
    const result = [carrier];
    walkAffectsScope(target[$PROXY], entry, result, target.fam, new Set());
    return result;
  }
  const node = target.n?.[key] ?? nextAffectsNodeResolver(target, key);
  // Keyed marks resolve by identity too (#2904): another store family's
  // proxy can share this record's raw (a derived store swaps its backing to
  // the source's raw when its projection lands), and reads through it never
  // touch this target's node map. Scope is exactly the owning record's raw,
  // narrowed to this key for witness and birth inheritance.
  let entry = affectsScopes.get(node);
  if (!entry) affectsScopes.set(node, (entry = { scope: new Set(), inherited: [], key }));
  entry.scope.add(target[STORE_VALUE]);
  if (target.pb) entry.scope.add(target.pb);
  return [node];
}

/**
 * The counting half of a mark, shared by direct registration and store-scope
 * inheritance (a node created inside a live keyless mark's identity scope).
 * A mark is ONLY this count: coverage of everything derived from the node is
 * pull-derived by the verdict layer's `markWalk` (dep-graph reachability), so
 * nothing is stored downstream and nothing can be stranded or stripped by
 * mid-window recomputes.
 */
function markAffects(node) {
  ext(node)._affectsCount = (node._x?._affectsCount || 0) + 1;
  shiftAffectsMarks(1);
}
/**
 * Boundary visual channel: within a transaction, a live mark holds Loading
 * fallbacks / reveal ordering the way real in-flight async would — but the
 * notification is tagged visibility-only at the source (`_markVisual`), so
 * the root queue never registers reporters from it: marks are invisible to
 * ALL completion and settlement accounting by construction. Boundaries hold
 * the marked node in `_sources` while `_affectsCount` is live; the release
 * sweep (finalizePureQueue re-checks boundary children after mark release)
 * is the display-state update point. Ambient marks release inside the same
 * flush that would surface them, before effects run — verdict-only, netting
 * no visual change.
 */
function notifyMarkBoundaries(node) {
  if (!node._subs && !node._x?._child) return;
  const error = new NotReadyError(node);
  error._markVisual = true;
  const visited = new Set();
  const visit = sub => {
    if (visited.has(sub)) return;
    visited.add(sub);
    // Display consumers (render effects, boundary computeds) act on the
    // notification; descent stops there, exactly like the status rails.
    const notify = statusNotifierOf(sub);
    if (notify) {
      notify.call(sub, STATUS_PENDING, error);
      return;
    }
    forEachDependent(sub, visit);
  };
  forEachDependent(node, visit);
}
/**
 * Registers one `affects()` mark on a node: counts it, records the
 * registration with the current transaction (after initTransition the queue's
 * batch IS the active transition, mirroring `_optimisticNodes`), re-derives
 * every downstream verdict companion (the mark channel's only push — verdict
 * pokes, not state), and notifies boundary display state. Both walks run on
 * every registration (not just the first): subscribers gained since an
 * earlier overlapping registration get covered, and dedup stops re-descent.
 */
function registerAffectsMark(node) {
  markAffects(node);
  globalQueue._batch._affectsNodes.push(node);
  // Companions only exist once the verdict layer (isPending/latest) loaded;
  // without them there is no materialized verdict to poke.
  GlobalQueue._repollVerdicts !== null && GlobalQueue._repollVerdicts(node);
  notifyMarkBoundaries(node);
  schedule();
}
/**
 * Releases one registration. When the node's last mark drops, re-derives
 * every downstream verdict through the settlement snap (committed, not
 * transition-scoped — release runs inside queue finalization, where a
 * setSignal would open a fresh override window that nothing settles).
 */
function releaseAffectsMark(node) {
  shiftAffectsMarks(-1);
  node._x._affectsCount--;
  if (!node._x._affectsCount) {
    GlobalQueue._repollVerdicts !== null && GlobalQueue._repollVerdicts(node, true);
    GlobalQueue._releaseAffectsScope?.(node);
  }
}
/**
 * Releases one batch of affects marks (a settling transaction's, or the
 * ambient batch at a plain flush end).
 */
function releaseAffectsMarks(nodes) {
  for (let i = 0; i < nodes.length; i++) releaseAffectsMark(nodes[i]);
  nodes.length = 0;
}
// Late installation (same pattern as `GlobalQueue._update`): the mark engine
// lives with the feature so graphs that never declare a mark never ship it.
// Each call site is gated by state only this module creates (a non-empty
// `_affectsNodes` batch, a live scope in the store's `affectsScopes`), so the
// hooks are installed before the first time any of them can fire.
GlobalQueue._releaseAffectsMarks = releaseAffectsMarks;
GlobalQueue._markAffects = markAffects;
GlobalQueue._releaseAffectsMark = releaseAffectsMark;
function affects(target, key) {
  if (arguments.length > 2) {
    const message =
      "[INVALID_AFFECTS_TARGET] affects() takes a single optional key — extra keys are " +
      "not a path. Mark each slot with its own affects(record, key) call, or pass the " +
      'nested record itself: affects(state.user, "name").';
    emitDiagnostic({
      code: "INVALID_AFFECTS_TARGET",
      kind: "write",
      severity: "error",
      message
    });
    throw new Error(message);
  }
  const storeTarget = target?.[$TARGET];
  if (storeTarget) {
    const nodes = getStoreAffectsNodes(storeTarget, key);
    for (let i = 0; i < nodes.length; i++) registerAffectsMark(nodes[i]);
    return;
  }
  const node = target?.[$REFRESH];
  if (node) {
    if (key !== undefined) {
      const message =
        "[INVALID_AFFECTS_TARGET] affects() keys are only valid on store targets. " +
        "An accessor is a single slot — pass it alone, or target the store record that owns the property.";
      emitDiagnostic({
        code: "INVALID_AFFECTS_TARGET",
        kind: "write",
        severity: "error",
        message,
        nodeName: node._name
      });
      throw new Error(message);
    }
    registerAffectsMark(node);
    return;
  }
  {
    const message =
      "[INVALID_AFFECTS_TARGET] affects() expects a Solid source accessor or a store node. " +
      "Pass the store proxy (optionally with a property key) or the original accessor, " +
      "not a wrapper function or an already-read value.";
    emitDiagnostic({
      code: "INVALID_AFFECTS_TARGET",
      kind: "write",
      severity: "error",
      message
    });
    throw new Error(message);
  }
}

function trueFn() {
  return true;
}
/** @internal What a source ENTRY is, decided once when the view is built
 * (`merge()` learns it while flattening; `omit()` from its argument) and
 * carried beside the entry — `MergeView.kinds[i]`, `OmitView.kind` — so no
 * read has to ask. Asking is the cost: any brand check on a Proxy is a trap
 * (`instanceof` is a `getPrototypeOf` trap, ~20 ns on a store — as much as
 * the read itself), and a merge over a store did two per read. */
const SOURCE_PLAIN = 0; // a plain object: own keys fixed, data is data
const SOURCE_OMIT = 1; // an `OmitView` record (only as a merge entry)
const SOURCE_PROXY = 2; // a store or foreign proxy: everything is a trap
const SOURCE_MEMO = 3; // a function source (merge's memo): swaps objects
const SOURCE_MERGE = 4; // a `MergeView` record (only as an omit's source)
const EMPTY = Object.freeze({});
// The object behind a LEAF entry (any kind but OMIT): a memo is read
// (tracked, as merge's own reads are) and a nullish result has no keys.
function leafOf(s, kind) {
  return kind === SOURCE_MEMO ? ((s = s()) == null ? EMPTY : s) : s;
}
/** @internal The record behind an `omit()` proxy: `source` with `hidden`
 * keys removed. It is the proxy's TARGET, so the shared handler reads it as
 * plain fields — no per-instance closures — and it is what props consumers
 * walk directly (`merge`, `spread`, `ssrElement`): a view never materializes
 * a copy, and a consumer that knows the record never goes through its traps
 * (a `getOwnPropertyDescriptor` trap per key allocates a descriptor and a
 * getter, so enumerating a proxy costs more than the copy it was avoiding).
 * `hidden` is a key list or a predicate (`omit(props, k => k[0] === "$")`).
 *
 * An omit over a `merge()` holds the merge's RECORD (`MergeView`, kind
 * `SOURCE_MERGE`) — never its proxy, so no read hops through a trap — and is
 * one record however many leaves the merge has. A consumer walks it as ONE
 * filtered entry (`sourceKeys` / `sourceGet` recurse into the merge's
 * sources by function call), and a later `merge()` over it carries the
 * record as one entry instead of copying its leaves: on a component chain of
 * defaults + omit + spread (`merge(omit(merge(omit(props))))`) the layers
 * nest as records, each a few fields, where a flatten to leaf views built a
 * view and a combined key list per leaf per layer — the largest allocation
 * of a Kobalte-shaped render. A merge leaf may be merge's memo for a
 * function source; it is resolved on access. */
class OmitView {
  source;
  kind;
  hidden;
  /** see `MergeView.table` */
  table = 0;
  /** see `tableOwnKeys` / `tableDescriptor` */
  keys = undefined;
  descs = undefined;
  constructor(
    source,
    /** of `source` — PLAIN, PROXY (a store or a foreign proxy), MEMO, or
     * MERGE (a `MergeView` record); never OMIT, a view over a view folds
     * into one. */
    kind,
    hidden
  ) {
    this.source = source;
    this.kind = kind;
    this.hidden = hidden;
  }
}
function isHidden(view, key) {
  const h = view.hidden;
  return typeof h === "function" ? h(key) : h.includes(key);
}
// Both filters as one. Two key lists stay a key list (one `includes`, no
// closure); a predicate on either side needs a closure. An omit over a
// merge builds one combined list per leaf, per component layer, so the
// copy's form matters in every tier: `concat` runs the species/spreadable
// protocol (2–3× the cost of a copy once optimized), a hand loop is 2–4×
// `concat` in the interpreter and baseline tiers (a bytecode per element
// against one builtin), and a presized `new Array(n)` is holey, which takes
// `includes` off its fast path. `slice` + `push` of the (short) second list
// is within a third of the best form in every tier, and packed.
function combineHidden(a, b) {
  if (typeof a !== "function" && typeof b !== "function") {
    const out = a.slice();
    for (let i = 0; i < b.length; i++) out.push(b[i]);
    return out;
  }
  return key =>
    (typeof a === "function" ? a(key) : a.includes(key)) ||
    (typeof b === "function" ? b(key) : b.includes(key));
}
// The object a view filters (see `leafOf`).
function viewSource(view) {
  return leafOf(view.source, view.kind);
}
// The record behind a `$PROXY`-marked object that is one of OUR views, else
// undefined for a store or a foreign proxy. ONE read: the view traps answer
// `$RECORD` first thing and a store's `get` trap answers it `undefined` on
// its symbol fast path, so the question never reaches a store's generic
// read path (firewall gate, tracked key read), which is what an unknown
// symbol would take — and a foreign proxy forwards it to a target that has
// no such key. Asking `$TARGET` first and then each view kind was two to
// four trap hops per source at every `merge()`, `omit()` and `ssrElement`.
// Call only after `$PROXY in o` is known true.
function recordOf(o) {
  return o[$RECORD];
}
/** @internal The `OmitView` behind an `omit()` proxy, or undefined. */
function omitView(o) {
  if (o == null || !($PROXY in o)) return undefined;
  const r = o[$RECORD];
  return r instanceof OmitView ? r : undefined;
}
// A props SOURCE ENTRY is a plain object, a proxy (store, merge, omit — the
// last two are normally unwrapped first: `mergeView` / `omitView`), a memo,
// or an `OmitView` record, and travels with its kind. These three answer for
// an entry what `Object.keys` / `in` / `[]` answer for an object, so every
// consumer walks entries with one code path, an `OmitView` is filtered
// rather than materialized, and nothing is asked of a proxy but the read.
// Own keys of a leaf: a proxy answers through ONE `ownKeys` trap (a store's
// keeps the key set tracked; `Object.keys` on a proxy would add a descriptor
// trap per key); a plain object its enumerable string keys. What a memo
// holds is only known once read.
function leafKeys(leaf, kind) {
  if (kind === SOURCE_PLAIN) return Object.keys(leaf);
  if (kind === SOURCE_PROXY || leaf[$PROXY] === leaf) return Reflect.ownKeys(leaf);
  return Object.keys(leaf);
}
/** @internal Own string keys of a source entry — every consumer skips
 * symbols itself. */
function sourceKeys(s, kind) {
  if (kind === SOURCE_OMIT) {
    if (s.kind === SOURCE_MERGE) return mergeKeysOf(s.source, false, s);
    const keys = leafKeys(viewSource(s), s.kind);
    const out = [];
    for (let i = 0; i < keys.length; i++) if (!isHidden(s, keys[i])) out.push(keys[i]);
    return out;
  }
  return leafKeys(leafOf(s, kind), kind);
}
/** @internal `key in entry`. */
function sourceHas(s, kind, key) {
  if (kind === SOURCE_OMIT) {
    if (isHidden(s, key)) return false;
    return s.kind === SOURCE_MERGE ? mergeHas(s.source, key) : key in viewSource(s);
  }
  return key in leafOf(s, kind);
}
/** @internal `entry[key]` — the source's getter runs once, here. */
function sourceGet(s, kind, key) {
  if (kind === SOURCE_OMIT) {
    if (isHidden(s, key)) return undefined;
    return s.kind === SOURCE_MERGE ? mergeGet(s.source, key) : viewSource(s)[key];
  }
  return leafOf(s, kind)[key];
}
// An entry whose own key set is fixed: a plain object, or a view over one —
// an omit of a plain object, or of a merge whose entries all are. Not a
// store (its key set is a tracked signal), not a merge memo source (it
// swaps whole objects), and not any proxy that declares itself with
// `$PROXY in s` — a frames slot proxy answers `has` for every key and lists
// none, so only the `in` walk is right for it.
function entryHasStaticKeys(s, kind) {
  if (kind === SOURCE_PLAIN) return true;
  if (kind !== SOURCE_OMIT) return false;
  if (s.kind === SOURCE_PLAIN) return true;
  return s.kind === SOURCE_MERGE && mergeHasStaticKeys(s.source);
}
function mergeHasStaticKeys(view) {
  const f = view.sources,
    k = view.kinds;
  for (let i = 0; i < f.length; i++) if (!entryHasStaticKeys(f[i], k[i])) return false;
  return true;
}
/** @internal Whether the own key set of a props object cannot change
 * reactively: a plain object, or a merge/omit view over plain objects only.
 * A consumer may then decide from `Object.getOwnPropertyDescriptor` once —
 * "no `children` key" or "a data `children`" holds for the object's lifetime,
 * so no tracking scope is needed for it (#3388). For a store, or a view with
 * a store or memo leaf, keys can appear later and the reactive path is the
 * only correct one. */
function hasStaticKeys(o) {
  if (!($PROXY in o)) return true;
  const r = recordOf(o);
  if (r instanceof MergeView) return mergeHasStaticKeys(r);
  return r !== undefined && entryHasStaticKeys(r, SOURCE_OMIT);
}
/**
 * Whether `o[key]` can never change for the lifetime of `o`: the key is a
 * data property of a plain object, or is absent from an object whose key set
 * is fixed. A getter, a key on a store, a memo-backed `merge()` source, or
 * any key of an object whose keys can appear later (a store) is not static.
 *
 * Looks through `merge()`/`omit()` views to the leaf that owns the key. Any
 * object will do, but props are the case it exists for: the compiler encodes
 * a literal at the call site (`as="button"`) as a data property and an
 * expression (`as={isLink() ? "a" : "button"}`) as a getter, so a component
 * library reads the caller's own static/dynamic classification of a prop at
 * runtime — identically on server and client, the compiler emitting the same
 * own DESCRIPTORS on both (the object behind them may differ: the server
 * builds props as a plain-prototype instance with shared getters) — and can
 * take a no-computation path for the literal:
 *
 * ```tsx
 * const Tag = dynamic(() => props.as, { static: isStatic(props, "as") });
 * ```
 *
 * One descriptor lookup; no read of the value, nothing tracked.
 */
function isStatic(o, key) {
  if ($PROXY in o) {
    // A store answers its descriptor trap with a value; through a view the
    // descriptor is truthful (see `sourceDescriptor`). A foreign proxy is
    // opaque: nothing about it is known to be fixed.
    if (viewOf(o) === undefined) return false;
    const desc = Reflect.getOwnPropertyDescriptor(o, key);
    return desc === undefined ? hasStaticKeys(o) : desc.get === undefined;
  }
  const desc = Reflect.getOwnPropertyDescriptor(o, key);
  return desc === undefined || (desc.get === undefined && desc.set === undefined);
}
function accessorDescriptor(get, enumerable = true) {
  return { configurable: true, enumerable, get, set: trueFn };
}
/** The descriptor a consumer should see for `key` on an entry —
 * the view proxies answer `getOwnPropertyDescriptor` with it, so it tells the
 * truth through any depth of merge/omit layers.
 *
 * A DATA descriptor means "nothing reactive can hide behind this value": the
 * key is a data property of a plain-object leaf — the compiler's own
 * encoding of a static attribute. Everything else is an accessor: a getter
 * on a leaf, a key on a store proxy (its "data" is a signal), or a key on a
 * merge memo source (the whole object is reactive). That is what lets a
 * consumer skip a reactive node for a static prop at the bottom of a
 * component chain, and it is why the store case must NOT forward the store's
 * own descriptor, which reports a value.
 *
 * `configurable: true` always — the target has no such property, and the
 * Proxy invariants forbid reporting a non-configurable one. */
// `present` says the caller has already established `key in s` (a trap's
// shadowing walk did), so a store is not asked a second time.
function sourceDescriptor(s, kind, key, present = false) {
  if (kind === SOURCE_OMIT) {
    if (isHidden(s, key)) return undefined;
    return sourceDescriptor(s.source, s.kind, key, present);
  }
  // An omit's merge record: the descriptor of the last entry that has the
  // key, as the merge proxy's own trap answers (see `mergeDescriptor`).
  if (kind === SOURCE_MERGE) return mergeDescriptor(s, key);
  // A memo source (`merge(() => …)`) is reactive wholesale: whatever shape
  // the memo's current object has, the key is an accessor here.
  if (kind === SOURCE_MEMO) {
    return present || key in leafOf(s, kind)
      ? accessorDescriptor(() => leafOf(s, kind)[key])
      : undefined;
  }
  if (kind === SOURCE_PROXY) {
    // Another view (an omit's source may be a merge proxy) already answers
    // truthfully. A store's reported "data" is a signal, and a foreign proxy
    // (frames slot props) has no own descriptors: for both, existence is
    // `in` and the kind is accessor — one trap, and never the store's
    // descriptor path.
    if (recordOf(s) !== undefined) return Reflect.getOwnPropertyDescriptor(s, key);
    return present || key in s ? accessorDescriptor(() => s[key]) : undefined;
  }
  const desc = Reflect.getOwnPropertyDescriptor(s, key);
  if (desc === undefined) return undefined;
  if (desc.get !== undefined || desc.set !== undefined)
    return accessorDescriptor(() => s[key], desc.enumerable);
  // The proxy target has no such key, so the descriptor must be configurable;
  // Reflect's is a fresh object, so a configurable one is handed out as is.
  if (desc.configurable) return desc;
  return { configurable: true, enumerable: desc.enumerable, writable: true, value: desc.value };
}
// Own ENUMERABLE keys, symbols included, of an entry — the user-facing key
// set (`Object.keys(merged)`), where enumerability matters (#2769).
function sourceEnumerableKeys(s, kind) {
  {
    if (s.kind === SOURCE_MERGE) return mergeEnumerableKeys(s.source, s);
    const keys = ownEnumerableKeys(viewSource(s));
    const out = [];
    for (let i = 0; i < keys.length; i++) if (!isHidden(s, keys[i])) out.push(keys[i]);
    return out;
  }
}
// The target of a merge() proxy: the flattened sources, read by one shared
// handler — like OmitView, no per-instance closures. `sources` is what
// `mergeSources` answers.
/** @internal */
class MergeView {
  sources;
  kinds;
  /** key → the plain leaf that owns it (later sources win), built by an
   * enumeration or once the reads have paid for it (see `resolvedTable`)
   * when every leaf has static keys; `null` when one doesn't. Until then
   * the slot counts the per-key trap reads so far. One slot rather than a
   * counter field of its own: a view is built per source per component
   * layer, and each field initializer is a measurable share of a
   * constructor that small in the lower JIT tiers. */
  table = 0;
  /** see `tableOwnKeys` / `tableDescriptor` */
  keys = undefined;
  descs = undefined;
  constructor(
    sources,
    /** `kinds[i]` is what `sources[i]` is (see `SourceKind`). */
    kinds
  ) {
    this.sources = sources;
    this.kinds = kinds;
  }
}
/** @internal The `MergeView` behind a `merge()` proxy — its flattened
 * `sources` with their `kinds` — or undefined. */
function mergeView(o) {
  if (o == null || !($PROXY in o)) return undefined;
  const r = o[$RECORD];
  return r instanceof MergeView ? r : undefined;
}
/** @internal The record behind a merge() or omit() proxy — a `MergeView`
 * (flattened `sources` with their `kinds`) or an `OmitView` — or undefined
 * for anything else (a plain object, a store, a foreign proxy). Two fast
 * traps on a proxy (`has`, then `$RECORD`), none on a plain object. */
function viewOf(o) {
  return o != null && $PROXY in o ? o[$RECORD] : undefined;
}
/** @internal The resolved key table of a merge/omit view — every own key of
 * the view mapped to the plain object that owns it, in merged order (a key
 * at the position of the last source that carries it, see `tableSet`) — or
 * undefined when it has none: a leaf is a store or a memo source, whose
 * keys can change, or the object is not a view at all.
 *
 * This is the flat object the eager copy used to build, made lazily and
 * without copying: one pass over the leaves' own keys, then every
 * `get`/`has`/descriptor is one lookup plus one read of the owning leaf, and
 * a consumer (`spread` rerunning its effect) walks the table instead of
 * re-deriving shadowing from the leaves each time. Own keys only, as the
 * copy's were: a plain source's key set is fixed once merged (keys added to
 * it later are not seen — the copy didn't see them either).
 *
 * It is built by an ENUMERATION — the `ownKeys` trap, or a consumer asking
 * for it here — or once per-key reads have paid for it (`READS_FOR_TABLE`),
 * not on the first read. A per-key read has a direct answer (a walk of the
 * sources, last to first, one `in` each) whose cost is the source count,
 * while the table's is every key of every leaf, so the walk wins until a
 * view has been read about as many times as it has keys. On the server it
 * never is: a component reads its props a few times, the element enumerates
 * them once through its own source walk, and the view is gone — building on
 * first read there cost a component chain a table per layer (profiled on
 * the Kobalte-shaped chain: a third of SSR time in the table code and its
 * garbage). On the
 * client a view read on every reactive rerun crosses the threshold in its
 * first few updates and is one lookup per read from then on, as before.
 * Once built — by a `spread`, `Object.keys`, `{...props}`, or the count —
 * every trap uses it. */
function resolvedTable(o) {
  if (o == null || !($PROXY in o)) return undefined;
  const r = recordOf(o);
  if (r instanceof OmitView) return omitTable(r);
  return r === undefined ? undefined : mergeTable(r);
}
function mergeTable(view) {
  let table = view.table;
  if (typeof table !== "object") {
    // a read count: not decided yet
    const f = view.sources,
      k = view.kinds;
    for (let i = 0; i < f.length; i++) {
      if (!entryHasStaticKeys(f[i], k[i])) {
        view.table = null;
        return undefined;
      }
    }
    table = new Map();
    collectTable(table, view, undefined);
    view.table = table;
  }
  return table === null ? undefined : table;
}
// One pass over a merge record's leaves into `table`, through the nested
// omit-over-merge entries — the filters enclosing the current leaf are the
// `filters` stack — so a component chain builds ONE table at the view that
// asked, not one per layer. A key an entry hides that an EARLIER entry owned
// must stay: a filter applies to its own entry's contribution, not to the
// merge, which is exactly what the stack expresses. Every entry has static
// keys (the caller checked), so a leaf's own keys are the truth.
function collectTable(table, view, filters) {
  const f = view.sources,
    k = view.kinds;
  for (let i = 0; i < f.length; i++) {
    const leaf = f[i];
    if (k[i] === SOURCE_OMIT) {
      if (leaf.kind === SOURCE_MERGE) {
        if (filters === undefined) filters = [leaf];
        else filters.push(leaf);
        collectTable(table, leaf.source, filters);
        filters.pop();
        continue;
      }
      const src = leaf.source;
      const keys = Reflect.ownKeys(src);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (!isHidden(leaf, key) && !hiddenByAny(filters, key)) tableSet(table, key, src);
      }
    } else {
      const keys = Reflect.ownKeys(leaf);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (!hiddenByAny(filters, key)) tableSet(table, key, leaf);
      }
    }
  }
}
function hiddenByAny(filters, key) {
  if (filters !== undefined)
    for (let i = filters.length - 1; i >= 0; i--) if (isHidden(filters[i], key)) return true;
  return false;
}
// Key order is the merged one — every key at the position of the LAST source
// that carries it — the order `ssrElement`'s array form serializes in and the
// eager copy enumerated in, so a spread through a view and a spread over the
// sources emit the same attribute order.
function tableSet(table, key, leaf) {
  if (table.has(key)) table.delete(key);
  table.set(key, leaf);
}
// An omit view's table: its source's (a merge's table, or a plain object's
// own keys) minus the hidden keys. Cached on the record.
function omitTable(view) {
  let table = view.table;
  if (typeof table !== "object") {
    const src = view.source;
    if (view.kind === SOURCE_MERGE) {
      // One pass over the merge's leaves with this filter on the stack —
      // the merge record builds no table of its own for it.
      if (!mergeHasStaticKeys(src)) {
        view.table = null;
        return undefined;
      }
      table = new Map();
      collectTable(table, src, [view]);
    } else if (view.kind === SOURCE_PLAIN) {
      table = new Map();
      const keys = Reflect.ownKeys(src);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (!isHidden(view, key)) table.set(key, src);
      }
    } else {
      // a store or a memo: keys can change, no table
      view.table = null;
      return undefined;
    }
    view.table = table;
  }
  return table === null ? undefined : table;
}
// The user-facing key set of a resolved table: its keys that are enumerable
// on the leaf that owns them (`Object.keys(merged)`, #2769). Fixed, like the
// table, so it is built once per view: an `ownKeys` trap may hand back the
// same array every time (the engine copies it).
const propertyIsEnumerable$1 = Object.prototype.propertyIsEnumerable;
function tableOwnKeys(view, table) {
  let keys = view.keys;
  if (keys === undefined) {
    keys = view.keys = [];
    for (const [key, leaf] of table) if (propertyIsEnumerable$1.call(leaf, key)) keys.push(key);
  }
  return keys;
}
// The descriptor for a table key — its owning leaf's, truthful (see
// `sourceDescriptor`) — with the shape cached per key so an enumeration
// (`for…in`, `Object.keys`, `{...props}`: a descriptor trap per key, on
// every pass) does not re-read the leaf's descriptor and re-allocate a
// getter each time. An accessor reads live, so its descriptor is reused as
// is; a data descriptor is rebuilt with the current value.
function tableDescriptor(view, table, key) {
  const leaf = table.get(key);
  if (leaf === undefined) return undefined;
  let descs = view.descs;
  if (descs === undefined) descs = view.descs = new Map();
  let cached = descs.get(key);
  if (cached === undefined) {
    cached = sourceDescriptor(leaf, SOURCE_PLAIN, key);
    if (cached === undefined) return undefined;
    descs.set(key, cached);
    return cached;
  }
  if (cached.get !== undefined) return cached;
  return {
    configurable: true,
    enumerable: cached.enumerable,
    writable: cached.writable,
    value: leaf[key]
  };
}
// Per-key trap reads a view takes before building its table, from the
// break-even: a build is ~60 ns per key (an `ownKeys` share, a `has`, a
// `set`), a walk ~20 ns per source (an `in`, a hidden-list check), and a
// leaf carries about five keys — so the table has paid for itself after
// ~15 reads. Measured on the Kobalte-shaped chain: a walk is 2× a lookup at
// depth 1 and up to 10× for a first-source key at depth 7 (a walk through
// seven nested layers, a hidden-list check at each), so a view read on
// every update wants the table; a view read a handful of times (every
// server-side view) never wants it.
const READS_FOR_TABLE = 16;
// The table for a per-key trap: the one a view HAS (built by an enumeration
// or an earlier read, see `resolvedTable`), or the one this read pays for,
// or none — a walk answers. One per view type, so a trap pays no type check.
// A settled slot is an object (the Map, or `null`); a number is the count.
function mergeReadTable(view) {
  const table = view.table;
  if (typeof table === "object") return table === null ? undefined : table;
  if (table + 1 < READS_FOR_TABLE) {
    view.table = table + 1;
    return undefined;
  }
  return mergeTable(view);
}
// Only for an omit over a merge (`kind === SOURCE_MERGE`; the caller checks,
// inline — a call is not free in every tier): an omit over one object reads
// it directly — a list check and a property read, nothing a table would
// shorten.
function omitReadTable(view) {
  const table = view.table;
  if (typeof table === "object") return table === null ? undefined : table;
  if (table + 1 < READS_FOR_TABLE) {
    view.table = table + 1;
    return undefined;
  }
  return omitTable(view);
}
// The table a record HAS — built already by an enumeration or a trap's read
// count — or undefined. What a nested walk asks: a record reached through an
// outer view's entry counts no reads of its own (the outer view decides for
// the whole tree, and its table build then builds the inner ones), so the
// inner merges of a component chain build nothing on the server where the
// leaves are read a few times each.
function tableOf(view) {
  const table = view.table;
  return typeof table === "object" && table !== null ? table : undefined;
}
// "no entry has the key" — distinct from an entry that holds `undefined`.
const MISSING = Symbol();
// The read: the value of the last entry that has the key, or MISSING. ONE
// walk — a nested omit-over-merge entry answers presence and value together,
// so a chain of layers is walked once per read, not once per layer per
// level.
function mergeLookup(view, property) {
  const table = tableOf(view);
  if (table !== undefined) {
    const leaf = table.get(property);
    return leaf === undefined ? MISSING : leaf[property];
  }
  const f = view.sources,
    k = view.kinds;
  for (let i = f.length - 1; i >= 0; i--) {
    const kind = k[i];
    // The common leaf first, read in place: a component's props view is a
    // few plain objects, read once per key on the server.
    if (kind === SOURCE_PLAIN) {
      const s = f[i];
      if (property in s) return s[property];
      continue;
    }
    if (kind === SOURCE_OMIT) {
      const v = f[i];
      if (isHidden(v, property)) continue;
      if (v.kind === SOURCE_MERGE) {
        const value = mergeLookup(v.source, property);
        if (value !== MISSING) return value;
        continue;
      }
      const s = viewSource(v);
      if (property in s) return s[property];
    } else {
      const s = leafOf(f[i], kind);
      if (property in s) return s[property];
    }
  }
  return MISSING;
}
function mergeGet(view, property) {
  const value = mergeLookup(view, property);
  return value === MISSING ? undefined : value;
}
// `key in merge`, on the record.
function mergeHas(view, property) {
  const table = tableOf(view);
  if (table !== undefined) return table.has(property);
  const f = view.sources,
    k = view.kinds;
  for (let i = f.length - 1; i >= 0; i--) if (sourceHas(f[i], k[i], property)) return true;
  return false;
}
// The proxy's `getOwnPropertyDescriptor`, on the record.
function mergeDescriptor(view, property) {
  const table = tableOf(view);
  if (table !== undefined) return tableDescriptor(view, table, property);
  const f = view.sources,
    k = view.kinds;
  for (let i = f.length - 1; i >= 0; i--) {
    if (!sourceHas(f[i], k[i], property)) continue;
    // `in` also answers for inherited keys, which have no own descriptor.
    return (
      sourceDescriptor(f[i], k[i], property, true) ??
      accessorDescriptor(() => mergeGet(view, property))
    );
  }
  return undefined;
}
// Own keys of a merge record in merged order — every key at the position
// of the LAST entry that carries it, the order the table keeps and
// `ssrElement` serializes in. `enumerable` selects the user-facing set
// (`Object.keys`, #2769) over every own string key (a consumer's walk);
// `filter` is the omit this record is read through, applied as the keys
// are gathered so an omit over a merge builds ONE list per layer. A list
// with `indexOf` rather than a Set: a props object has a dozen keys, and a
// Set's hash store was 2 KB per row on the Kobalte-shaped chain.
function mergeKeysOf(view, enumerable, filter) {
  const out = [];
  collectKeys(view, filter === undefined ? undefined : [filter], enumerable, out, null);
  return out;
}
// One pass over a merge record's leaves — through its nested omit-over-merge
// entries, `filters` the omits enclosing the current leaf (see
// `collectTable`) — appending each leaf's keys to `keys` in merged order
// (a key already listed moves to the end: later wins) and, when `owners` is
// given, the object that owns the key at the same index. A consumer that
// reads every key once (`ssrElement`) then reads `owners[i][keys[i]]`: no
// `in` walk per key, no table. A memo leaf is resolved once here.
function collectKeys(view, filters, enumerable, keys, owners) {
  const f = view.sources,
    k = view.kinds;
  for (let i = 0; i < f.length; i++) {
    let leaf = f[i],
      kind = k[i];
    let filter;
    if (kind === SOURCE_OMIT) {
      if (leaf.kind === SOURCE_MERGE) {
        if (filters === undefined) filters = [leaf];
        else filters.push(leaf);
        collectKeys(leaf.source, filters, enumerable, keys, owners);
        filters.pop();
        continue;
      }
      filter = leaf;
      kind = leaf.kind;
      leaf = leaf.source;
    }
    leaf = leafOf(leaf, kind);
    const ks = enumerable ? ownEnumerableKeys(leaf) : leafKeys(leaf, kind);
    for (let j = 0; j < ks.length; j++) {
      const key = ks[j];
      if (filter !== undefined && isHidden(filter, key)) continue;
      if (hiddenByAny(filters, key)) continue;
      addKey(keys, owners, key, leaf);
    }
  }
}
// Append `key` owned by `owner`, moving an earlier listing to the end: later
// wins, and the position is the last owner's (the merged order).
function addKey(keys, owners, key, owner) {
  const at = keys.indexOf(key);
  if (at !== -1) {
    keys.splice(at, 1);
    if (owners !== null) owners.splice(at, 1);
  }
  keys.push(key);
  if (owners !== null) owners.push(owner);
}
/** @internal Every own string key of a props SOURCE — a plain object, a
 * store or foreign proxy, or a merge/omit view — appended to `keys` in
 * merged order with the object that owns each at the same index of
 * `owners`: a key already listed (by this source or an earlier one) moves
 * to the end, so several sources collected in turn give the order and the
 * winners a merge of them would. A consumer that reads each key once
 * (`ssrElement`) then reads `owners[i][keys[i]]` — the owner's getter runs
 * there, once — and asks nothing else of a view: no table, no `in` walk per
 * key through the merge/omit layers, no key list per leaf. One pass,
 * however deep the layers nest. Symbols are listed; the consumer skips
 * them. */
function sourceOwners(s, keys, owners) {
  if ($PROXY in s) {
    const view = viewOf(s);
    if (view === undefined) {
      // a store: one `ownKeys` trap, reads through `[]`
      const ks = Reflect.ownKeys(s);
      for (let i = 0; i < ks.length; i++) addKey(keys, owners, ks[i], s);
      return;
    }
    if (view instanceof OmitView) {
      if (view.kind === SOURCE_MERGE) return collectKeys(view.source, [view], false, keys, owners);
      const leaf = viewSource(view);
      const ks = leafKeys(leaf, view.kind);
      for (let i = 0; i < ks.length; i++)
        if (!isHidden(view, ks[i])) addKey(keys, owners, ks[i], leaf);
      return;
    }
    return collectKeys(view, undefined, false, keys, owners);
  }
  const ks = Object.keys(s);
  for (let i = 0; i < ks.length; i++) addKey(keys, owners, ks[i], s);
}
// The user-facing key set of a merge record, read through `filter` if given.
function mergeEnumerableKeys(view, filter) {
  const table = mergeTable(view);
  if (table === undefined) return mergeKeysOf(view, true, filter);
  const keys = tableOwnKeys(view, table);
  if (filter === undefined) return keys;
  const out = [];
  for (let i = 0; i < keys.length; i++) if (!isHidden(filter, keys[i])) out.push(keys[i]);
  return out;
}
const mergeTraps = {
  get(view, property, receiver) {
    // The private keys are symbols; a string read (every prop) skips the
    // compares. `$TARGET` is answered so a store check never walks the
    // sources (a leaf that is a store would answer it).
    if (typeof property === "symbol") {
      if (property === $PROXY) return receiver;
      if (property === $RECORD) return view;
      if (property === $TARGET) return undefined;
    }
    // A trap read counts toward the table (see `mergeReadTable`); the walk
    // itself is the record's. `mergeReadTable` and the plain walk of
    // `mergeLookup` are inlined here: a trap is entered from the runtime, so
    // nothing below it is inlined for it, and a component's props view is a
    // few plain objects read once per key on the server — the walk is the
    // whole read. A leaf that is not plain hands the walk to `mergeGet`,
    // which starts over (a plain leaf walked twice is two `in` checks).
    const state = view.table;
    let table;
    if (typeof state !== "object") {
      if (state + 1 < READS_FOR_TABLE) {
        view.table = state + 1;
        const f = view.sources,
          k = view.kinds;
        for (let i = f.length - 1; i >= 0; i--) {
          if (k[i] !== SOURCE_PLAIN) return mergeGet(view, property);
          // Read first, `in` only to tell a missing key from one holding
          // undefined: the last source is the one that usually has the key.
          const v = f[i][property];
          if (v !== undefined || property in f[i]) return v;
        }
        return undefined;
      }
      table = mergeTable(view);
      if (table === undefined) return mergeGet(view, property);
    } else if (state === null) return mergeGet(view, property);
    else table = state;
    const leaf = table.get(property);
    return leaf === undefined ? undefined : leaf[property];
  },
  has(view, property) {
    if (property === $PROXY) return true;
    if (property === $TARGET || property === $RECORD) return false;
    const table = mergeReadTable(view);
    if (table !== undefined) return table.has(property);
    return mergeHas(view, property);
  },
  set: trueFn,
  deleteProperty: trueFn,
  getOwnPropertyDescriptor(view, property) {
    if (property === $PROXY || property === $TARGET || property === $RECORD) return undefined;
    const table = mergeReadTable(view);
    if (table !== undefined) return tableDescriptor(view, table, property);
    return mergeDescriptor(view, property);
  },
  ownKeys(view) {
    return mergeEnumerableKeys(view);
  }
};
// An omit view reads its source directly — a hidden-key check and one
// property read; over a merge record, the merge's own walk by function call,
// never a trap. Once an enumeration or the read count has built its table
// (over a merge with plain leaves only: the merge's, filtered) every trap
// answers from that instead.
const omitTraps = {
  get(view, property, receiver) {
    if (property === $PROXY) return receiver;
    // `$RECORD` is THIS view — never the underlying merge's record, which is
    // unfiltered: handing a re-merge the merge's own sources would leak the
    // omitted keys (#3014). A consumer walks the omit record as ONE filtered
    // entry (`recordOf` tells the two records apart by class).
    if (property === $RECORD) return view;
    if (property === $TARGET) return undefined;
    if (view.kind === SOURCE_MERGE) {
      const table = omitReadTable(view);
      if (table !== undefined) {
        const leaf = table.get(property);
        return leaf === undefined ? undefined : leaf[property];
      }
      if (isHidden(view, property)) return undefined;
      return mergeGet(view.source, property);
    }
    if (isHidden(view, property)) return undefined;
    return viewSource(view)[property];
  },
  has(view, property) {
    if (property === $PROXY) return true;
    if (property === $TARGET || property === $RECORD) return false;
    if (view.kind === SOURCE_MERGE) {
      const table = omitReadTable(view);
      if (table !== undefined) return table.has(property);
      if (isHidden(view, property)) return false;
      return mergeHas(view.source, property);
    }
    if (isHidden(view, property)) return false;
    return property in viewSource(view);
  },
  set: trueFn,
  deleteProperty: trueFn,
  getOwnPropertyDescriptor(view, property) {
    if (property === $PROXY || property === $TARGET || property === $RECORD) return undefined;
    if (view.kind === SOURCE_MERGE) {
      const table = omitReadTable(view);
      if (table !== undefined) return tableDescriptor(view, table, property);
    }
    return sourceDescriptor(view, SOURCE_OMIT, property);
  },
  ownKeys(view) {
    if (view.kind === SOURCE_MERGE) {
      const table = omitTable(view);
      if (table !== undefined) return tableOwnKeys(view, table);
      // No table (a store or memo leaf): the merge's own key set, filtered.
      return sourceEnumerableKeys(view);
    }
    const keys = Reflect.ownKeys(viewSource(view));
    const out = [];
    for (let i = 0; i < keys.length; i++) if (!isHidden(view, keys[i])) out.push(keys[i]);
    return out;
  }
};
/** @internal The flattened sources behind a `merge()` proxy, or undefined.
 * A merge's writes are no-ops, so its sources are the whole truth. A COPY of
 * a merge (`{...merged}`, a descriptor copy) is a plain object that carries
 * no sources — `ownKeys` never lists $RECORD — so what is on the copy is
 * the truth there and every consumer reads it directly (#3384). */
function mergeSources(o) {
  const r = mergeView(o);
  return r === undefined ? undefined : r.sources;
}
/**
 * Merges multiple props-like objects into a single proxy that *preserves
 * reactivity*. Reads are forwarded to the right-most source that defines the
 * property, so later sources override earlier ones (like `Object.assign`).
 *
 * Function arguments are treated as memo-backed sources — useful for passing
 * derived defaults whose computation should track reactively.
 *
 * The result is a live VIEW of its sources, never a copy: creating it costs
 * nothing per key, every read goes to the source that owns the key (a getter
 * runs there, a data property is read live), and writing to it is a no-op.
 * A single non-function source is returned as is. To own a mutable object,
 * copy it: `{ ...merged }` snapshots the current values.
 *
 * Use this in component bodies to merge defaults / overrides without losing
 * Solid's per-property tracking.
 *
 * Reading props, here and anywhere: a prop's getter is defined only for a
 * read through its own object (`props.x`, `{ ...props }`, `Reflect.get`,
 * these views). Forwarding its descriptor onto another object and reading it
 * there is not supported — the compiler's server-side props keep their state
 * on the instance, so the getter needs its object as receiver. A copy that
 * must stay live defines its own getter that reads through the source, as
 * the no-Proxy paths of merge() and omit() do.
 *
 * @example
 * ```tsx
 * function Button(_props: { label: string; type?: string; disabled?: boolean }) {
 *   const props = merge({ type: "button", disabled: false }, _props);
 *
 *   return <button type={props.type} disabled={props.disabled}>{props.label}</button>;
 * }
 * ```
 */
function merge(...sources) {
  if (sources.length === 1 && typeof sources[0] !== "function") return sources[0];
  // Sized to the argument count up front: a view is built per source per
  // component layer, and growing two empty arrays by `push` was a third of
  // its construction. A nested view's sources may run past the count (the
  // array grows), a falsy source leaves it short (trimmed below).
  const flattened = new Array(sources.length);
  const kinds = new Array(sources.length);
  let n = 0;
  // The one non-falsy source, if there is exactly one: it IS the merge.
  let only = undefined;
  let count = 0;
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    if (!s) continue;
    count++;
    only = s;
    if (typeof s === "function") {
      flattened[n] = createMemo(s);
      kinds[n++] = SOURCE_MEMO;
      continue;
    }
    if ($PROXY in s) {
      // A store (or a foreign proxy) is a leaf as it is. A merge() proxy is
      // flattened through: its writes are no-ops, so its sources are exactly
      // what it reads. An omit() proxy joins as its view record — ONE entry,
      // its filter travelling with it, whether it is over a plain object or
      // a whole merge (never the merge's own sources, which would leak the
      // omitted keys, #3014). A consumer's walk recurses into the record.
      const r = recordOf(s);
      if (r instanceof MergeView) {
        for (let j = 0; j < r.sources.length; j++) {
          flattened[n] = r.sources[j];
          kinds[n++] = r.kinds[j];
        }
      } else if (r !== undefined) {
        flattened[n] = r;
        kinds[n++] = SOURCE_OMIT;
      } else {
        flattened[n] = s;
        kinds[n++] = SOURCE_PROXY;
      }
      continue;
    }
    flattened[n] = s;
    kinds[n++] = SOURCE_PLAIN;
  }
  if (n !== flattened.length) {
    flattened.length = n;
    kinds.length = n;
  }
  if (SUPPORTS_PROXY) {
    if (count === 1 && typeof only !== "function") return only;
    // Always a view, never a copy. Building a plain object here costs a
    // descriptor read, a bound getter and a defineProperty per key per
    // layer, and component libraries stack several layers per element
    // (defaults → omit → call-site statics → …), so the copies dominated
    // their render cost while every consumer that matters — `spread`,
    // `ssrElement`, a nested merge — reads the flattened sources directly
    // anyway (#3448). The view is O(1) to create and reads through to the
    // sources, so a data property on a source is read live, like a getter.
    // Writes to the result are no-ops (a consumer that needs its own object
    // copies: `{...merged}`, which the traps answer truthfully). Copies of
    // the result never carry $RECORD (#3384): `ownKeys` answers only the
    // sources' keys.
    return new Proxy(new MergeView(flattened, kinds), mergeTraps);
  }
  // No Proxy: an eager descriptor copy, semantics as close to the view as a
  // plain object allows (getters stay live; data properties are snapshots).
  const defined = Object.create(null);
  let nonTargetKey = false;
  let lastIndex = flattened.length - 1;
  for (let i = lastIndex; i >= 0; i--) {
    const source = flattened[i];
    if (!source) {
      i === lastIndex && lastIndex--;
      continue;
    }
    const sourceKeys = Object.getOwnPropertyNames(source);
    for (let j = sourceKeys.length - 1; j >= 0; j--) {
      const key = sourceKeys[j];
      if (key === "__proto__" || key === "constructor") continue;
      if (!defined[key]) {
        nonTargetKey = nonTargetKey || i !== lastIndex;
        const desc = Object.getOwnPropertyDescriptor(source, key);
        defined[key] = desc.get
          ? {
              enumerable: true,
              configurable: true,
              get: desc.get.bind(source)
            }
          : desc;
      }
    }
  }
  if (!nonTargetKey) return flattened[lastIndex];
  const target = {};
  const definedKeys = Object.keys(defined);
  for (let i = definedKeys.length - 1; i >= 0; i--) {
    const key = definedKeys[i],
      desc = defined[key];
    if (desc.get) Object.defineProperty(target, key, desc);
    else target[key] = desc.value;
  }
  return target;
}
function omit(props, ...keys) {
  let hidden = keys.length === 1 && typeof keys[0] === "function" ? keys[0] : keys;
  if (SUPPORTS_PROXY) {
    // A view over a view folds: one record, both filters, the original
    // source — so a consumer walks the real object however deep the omits go.
    // Over a merge() proxy the source is the merge's RECORD (see OmitView):
    // one record whatever the leaf count, read by function call.
    let source = props;
    let kind = SOURCE_PLAIN;
    if (typeof props === "function") kind = SOURCE_MEMO;
    else if ($PROXY in props) {
      kind = SOURCE_PROXY;
      const r = recordOf(props);
      if (r instanceof OmitView) {
        source = r.source;
        kind = r.kind;
        hidden = combineHidden(r.hidden, hidden);
      } else if (r !== undefined) {
        source = r;
        kind = SOURCE_MERGE;
      }
    }
    return new Proxy(new OmitView(source, kind, hidden), omitTraps);
  }
  const result = {};
  const propNames = Object.getOwnPropertyNames(props);
  const isHiddenKey =
    typeof hidden === "function"
      ? hidden
      : hidden.length > 4 && propNames.length > hidden.length
        ? (
            blocked => key =>
              blocked.has(key)
          )(new Set(hidden))
        : key => hidden.includes(key);
  for (const propName of propNames) {
    if (!isHiddenKey(propName)) {
      const desc = Object.getOwnPropertyDescriptor(props, propName);
      if (!desc.get && !desc.set && desc.enumerable && desc.writable && desc.configurable) {
        result[propName] = desc.value;
      } else if (desc.get || desc.set) {
        // An accessor is re-homed with its source as receiver, never copied
        // as-is: a props getter is only defined for a read THROUGH its own
        // object (the compiler's server props keep their state on the
        // instance, so a forwarded descriptor read on the copy throws). Same
        // rule as merge()'s copy path above.
        Object.defineProperty(result, propName, {
          enumerable: desc.enumerable,
          configurable: true,
          get: desc.get && desc.get.bind(props),
          set: desc.set && desc.set.bind(props)
        });
      } else Object.defineProperty(result, propName, desc);
    }
  }
  return result;
}

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
function createTarget(value, parent, parentKey, fam = parent?.fam ?? null) {
  // The proxy target carries the array exotic class when the value is an
  // array, so Array.isArray(proxy) is true; the fields live on it directly.
  // Direct field assignment in one fixed order (no Object.assign literal
  // copy): every target shares a hidden-class transition chain — createTarget
  // was the #2 store cost in the uibench creation profile.
  const t = Array.isArray(value) ? [] : new TargetShape();
  t.v = value;
  // Chained-backing flag (backing IS another store's proxy, §7b) — cached so
  // the hot read path never does a per-read symbol lookup on the backing.
  t.ch = value[$TARGET] !== undefined;
  t.pb = null;
  t.n = null;
  t.h = null;
  t.k = null;
  t.dk = null;
  t.wk = null;
  t.u = parent;
  t.pk = parentKey;
  t.px = null;
  t.d = false;
  t.a = false;
  t.sc = 0;
  t.kc = 0;
  t.nc = 0;
  t.ab = null;
  t.fam = fam;
  t.s = false;
  t.ovl = false;
  t.del = null;
  t.hv = null;
  t.ht = null;
  t.px = new Proxy(t, traps);
  // Legacy interop: shared machinery (affects walks, wrap dedupe) reads the
  // proxy off looked-up targets as a field.
  t[$PROXY] = t.px;
  (fam?.map ?? storeNextLookup).set(value, t);
  return t;
}
function wrapNext(value, parent = null, parentKey = null, fam = parent?.fam ?? null) {
  // markRaw'd values never wrap through ANY store (R42; sticky raw-marking
  // is one half of the never-both-wrapped-and-raw invariant, RUL-12).
  if (rawValuesUsed && isRawValue(value)) return value;
  const existing = lookupTarget$1(value, fam);
  if (existing !== undefined) return existing.px;
  const t = value[$TARGET];
  if (t !== undefined && t.px === value) {
    // Foreign-family proxies re-wrap into THIS family (writes stay isolated);
    // same-family and plain-store proxies pass through.
    if (fam === null || t.fam === fam) return value;
    return createTarget(value, parent, parentKey, fam).px;
  }
  return createTarget(value, parent, parentKey, fam).px;
}
/** Unwrap our own proxies to their current backing; leave everything else. */
function unwrapValue(v) {
  if (v == null || typeof v !== "object") return v;
  const t = v[$TARGET];
  if (t !== undefined && t.px === v && t.v !== undefined) {
    // A draft escaping into other storage must be a REAL container that
    // becomes this target's committed backing at fold (the shared-raw
    // contract) — a prototype overlay is neither.
    if (t.ovl) materializePB(t);
    return t.pb ?? t.v;
  }
  return v;
}
// ---------------------------------------------------------------------------
// nodes: pure subscription points (values used only for equality gating)
// Shared slot-node equality (create-floor diet): ONE function for every
// store node — `this` is the node (method-call convention at every _equals
// site), `_host` is the baked-in target backref. Logical-slot equality:
// values resolving to the same child target are the same slot
// (privatization/adoption swap raw identity without changing the logical
// value — only changed leaves notify, R9).
const slotNodeEquals = function (a, b) {
  return isEqual(a, b) || sameLogicalSlot(this._host, a, b);
};
// Shared slot-node unobserved handler (create-floor diet): registered once;
// the core sweep dispatches CONFIG_SLOT_NODE nodes here instead of holding a
// per-node closure in a per-node NodeExtension.
setSlotUnobserved(node => {
  // A live affects() mark keeps the node addressable (sweep parity).
  if (node._x?._affectsCount) return;
  // An active override or a staged write is state only the node holds (an
  // optimistic signal keeps its override whether or not anything reads it —
  // store parity, posture-store-parity S7): defer the release to the flush
  // that resolves it (the scheduler's transient-node sweep).
  if (hasActiveOverride(node) || node._pendingValue !== NOT_PENDING) return deferSlotRelease(node);
  const t = node._host;
  const key = node._key;
  if (t.n && t.n[key] === node) {
    delete t.n[key];
    t.nc--;
    // Projection leaves also leave the firewall child chain (#3351): a
    // dropped node is unreachable through the store — a fresh read makes a
    // fresh node — so the chain would only retain it and its last value.
    unlinkFirewallChild(node);
  }
});
function getNode(
  target,
  key,
  current,
  // First-read dedupe (create-floor slice 2): the get trap probes
  // accessor-ness right before creating the node — pass the verdict through
  // so creation skips the second descriptor scan. -1 = unknown (other
  // callers), 0/1 = probed.
  accKnown = -1
) {
  const nodes = (target.n ??= Object.create(null));
  let node = nodes[key];
  if (node === undefined) {
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
    const fold = heldFoldTransition(target);
    let held = heldAdoptionTransition(target);
    // A key the adoption left unchanged is not born holding (#3706).
    if (held !== null && !heldKey(target, key)) held = null;
    if (held !== null) current = target.hv[key];
    else if ((held = fold) !== null) current = target.v[key];
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
    const created = (node = slotSignal(
      current,
      slotNodeEquals,
      target,
      key,
      // Accessor-ness resolved ONCE per node (no per-object descriptor
      // scan on reads): accessor keys serve through Reflect.get with the
      // proxy receiver.
      accKnown === -1 ? isOwnAccessor(target.pb ?? target.v, key) : accKnown === 1,
      target.fam?.node ?? undefined
    ));
    // Attribution-only: name store property nodes by path segment so
    // attribution chains and wide-scope warnings read "store.todos" (or
    // "todos.title" when the store was declared with a name), not
    // "signal". Gated on the engine being installed — node creation is
    // the hottest store path, and the disabled cost must stay one null
    // check (nodes created before enable() stay generically named).
    if (attrHooks !== null) {
      created._name = storeLabel(target) + "." + String(key);
      stampNodeOwner(created, target);
    }
    // Optimistic families: arm the override slot — setSignal routes armed
    // nodes through the core engine (lanes, ownership, reverts all native).
    if (target.fam?.opt) {
      ext(created)._overrideValue = NOT_PENDING;
      created._config |= CONFIG_OPTIMISTIC;
    }
    // A node born inside a live mark's identity scope inherits the mark
    // (the declaration walk could only cover nodes existing then).
    if (key !== $AFFECTS && affectsScopesLive()) inheritAffectsMarks(created, target.v, key);
    if (held !== null)
      stageHeldKey(
        created,
        fold !== null
          ? target.del !== null && target.del.has(key)
            ? undefined
            : target.pb[key]
          : target.v[key],
        held
      );
    nodes[key] = node;
    target.nc++;
    markDescendants(target);
  }
  return node;
}
/** The live transaction holding an adoption on `target` (adoptPB's `ht`;
 * a latest()-pull PLAIN_HOLD is not a transaction), else null. */
function heldAdoptionTransition(target) {
  if (target.ht === null || target.ht === PLAIN_HOLD || heldMaskView(target) === null) return null;
  const txn = currentTransition(target.ht);
  return txn._done === false ? txn : null;
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
 * write-time stamp, resolved through merges), else null. */
function liveFoldTransition(target) {
  if (target.pb === null) return null;
  const fb = foldBatches.get(target);
  if (fb === undefined) return null;
  const txn = currentTransition(fb);
  return txn._done === false ? txn : null;
}
/** liveFoldTransition for node materialization (stageHeldKey). Inside the
 * draft the backing is the setter's working copy, not a flushed hold — its
 * nodes take their writes at setter exit (notifyWrites). Optimistic families
 * hold at the backing: tentative writes are node overrides over a discarded
 * clone, and a truth-staged landing is served through the fold's own hold
 * (heldTruthMasked for lane passes, pendingBackingVisible's hold arms for
 * the rest) — neither is a plain staged write to mirror. Chained
 * backings serve the inner store's live value, never a node value. */
function heldFoldTransition(target) {
  if (target.ch || target.fam?.opt === true || inDraft(target)) return null;
  return liveFoldTransition(target);
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
 */
function holdVisible(txn, c) {
  if (txn === null || ownsHold(txn)) return true;
  if (stale) {
    recordStaleReplay(txn, c);
    return false;
  }
  enterStagedRead(null, txn);
  return true;
}
// #3706: the keys an adoption under a live hold changed against the held
// view — the adoption twin of `wk` (#3688), keyed on the target. adoptPB
// records `[adopted object]`; the keys are diffed against IT, once, on the
// first held read (its children are re-pointed by then), and replace the
// entry. Never against the live backing — a mainline write during the hold
// replaces that, and its key is not the adoption's. WK_ALL holds the whole
// container.
const heldKeys = new WeakMap();
function heldKey(target, key) {
  let keys = heldKeys.get(target);
  if (Array.isArray(keys)) heldKeys.set(target, (keys = adoptionChangedKeys(target, keys[0])));
  return keys === WK_ALL || keys.has(key);
}
function adoptionChangedKeys(target, v) {
  const hv = target.hv;
  // A chained backing, an optimistic family, a chained held view, a swapped
  // or non-plain prototype (inherited accessors read through `this`): whole.
  if (
    v[$TARGET] !== undefined ||
    target.fam?.opt === true ||
    hv[$TARGET] !== undefined ||
    Object.getPrototypeOf(hv) !== Object.getPrototypeOf(v) ||
    !plainProto(v)
  )
    return WK_ALL;
  const keys = new Set();
  // Accessors are never invoked: they and a flipped enumerability are changes.
  for (const key of Reflect.ownKeys(hv))
    if (
      !hasOwn.call(v, key) ||
      isOwnAccessor(hv, key) ||
      isOwnAccessor(v, key) ||
      propertyIsEnumerable.call(hv, key) !== propertyIsEnumerable.call(v, key) ||
      !(isEqual(hv[key], v[key]) || sameLogicalSlot(target, hv[key], v[key]))
    )
      keys.add(key);
  for (const key of Reflect.ownKeys(v)) if (!hasOwn.call(hv, key)) keys.add(key);
  return keys;
}
function stageHeldKey(node, nv, txn) {
  if (slotNodeEquals.call(node, node._value, nv)) return;
  node._pendingValue = nv;
  node._transition = txn;
  txn._pendingNodes.push(node);
}
function sameLogicalSlot(target, a, b) {
  if (a === null || typeof a !== "object" || b === null || typeof b !== "object") return false;
  const at = lookupTarget$1(a, target.fam);
  return at !== undefined && at === lookupTarget$1(b, target.fam);
}
/**
 * Observe-tier: the owner each store root was created under. The proxy
 * cannot carry `_owner` itself (`registerGraph`'s stamp is swallowed by the
 * set trap outside a draft), so the root target keys it here and the store's
 * nodes copy it into `_owner` as they are created — an `OBSERVE.exclude`d
 * panel's store nodes are then excluded subjects, exactly like its signals.
 * Both ends are gated with the naming on the engine being installed: node
 * creation is the hottest store path, store creation is next, and the
 * disabled cost of each stays one null check. A store created before
 * `enable()` therefore has no recorded owner and its nodes are never excluded
 * subjects — the same boundary the naming draws; a panel enables first.
 */
const storeOwners = new WeakMap();
function storeRoot(target) {
  let root = target;
  while (root.u !== null) root = root.u;
  return root;
}
function storeRootOwner(target) {
  return storeOwners.get(storeRoot(target));
}
function stampNodeOwner(created, target) {
  created._owner = storeRootOwner(target) ?? null;
}
// Attribution-only: the store's declared name (`createStore(v, { name })`,
// what the compiler's `sourceNames.primitives` fills in). Property nodes are
// named `<store>.<key>` from it so chains read "todos.title" instead of the
// generic "store.title". Same gating and lifetime as storeOwners: recorded
// only while the engine is installed, keyed by the root target.
const storeNames = new WeakMap();
/** Record a store proxy's declared name for attribution labels (observe tiers). */
function nameStore(proxy, name) {
  if (attrHooks !== null && name) storeNames.set(proxy[$TARGET], name);
}
function storeLabel(target) {
  return storeNames.get(storeRoot(target)) ?? "store";
}
function getHasNode(target, key, present) {
  const nodes = (target.h ??= Object.create(null));
  let node = nodes[key];
  if (node === undefined) {
    const created = (node = signal(
      present,
      {
        equals: isEqual,
        unobserved() {
          if (created._x?._affectsCount) return;
          // The structural twin of the value slot's rule (setSlotUnobserved,
          // S7): an optimistic add/delete lives on this presence node as its
          // override — releasing it with the override on would let `in`,
          // `Object.keys` and descriptors fall back to committed structure
          // while the action is live. Defer to the flush that resolves it.
          if (hasActiveOverride(created) || created._pendingValue !== NOT_PENDING)
            return deferSlotRelease(created);
          if (target.h && target.h[key] === created) {
            delete target.h[key];
            unlinkFirewallChild(created);
          }
        }
      },
      target.fam?.node ?? undefined
    ));
    created._config |= CONFIG_OWNED_WRITE;
    if (attrHooks !== null) stampNodeOwner(created, target);
    if (target.fam?.opt) {
      ext(created)._overrideValue = NOT_PENDING;
      created._config |= CONFIG_OPTIMISTIC;
    }
    if (affectsScopesLive()) inheritAffectsMarks(created, target.v, key);
    nodes[key] = node;
    markDescendants(target);
  }
  return node;
}
/** Did `obs` link `target`'s key-set node in its CURRENT pass? The mirror of
 * link()'s O(1) repeat-touch check: the node's newest subscriber link is
 * this observer's, and — during a recompute — carries this pass's dep
 * generation (a link left from a previous pass is stale: the observer may
 * not re-read the key set this time). No dep-list scan, no allocation. A
 * probe observer (isPending()/latest() sentinel) never links, so it always
 * falls through to the presence read. */
function observerHoldsKeySet(target, obs) {
  const k = target.k;
  if (k === null) return false;
  const l = k._subsTail;
  return (
    l !== null &&
    l._sub === obs &&
    (!(obs._flags & REACTIVE_RECOMPUTING_DEPS) || l._gen === obs._depGen)
  );
}
function getKeySetNode(target) {
  let k = target.k;
  if (k === null) {
    const created = (k = signal(
      0,
      {
        equals: false,
        unobserved() {
          if (target.k === created) {
            target.k = null;
            unlinkFirewallChild(created);
          }
        }
      },
      target.fam?.node ?? undefined
    ));
    created._config |= CONFIG_OWNED_WRITE;
    if (attrHooks !== null) stampNodeOwner(created, target);
    if (target.fam?.opt) {
      ext(created)._overrideValue = NOT_PENDING;
      created._config |= CONFIG_OPTIMISTIC;
    }
    target.k = k;
    markDescendants(target);
  }
  return k;
}
function getDeepNode(target) {
  let dk = target.dk;
  if (dk === null) {
    const created = (dk = signal(
      0,
      {
        equals: false,
        unobserved() {
          if (target.dk === created) {
            target.dk = null;
            unlinkFirewallChild(created);
          }
        }
      },
      target.fam?.node ?? undefined
    ));
    created._config |= CONFIG_OWNED_WRITE;
    if (attrHooks !== null) stampNodeOwner(created, target);
    if (target.fam?.opt) {
      ext(created)._overrideValue = NOT_PENDING;
      created._config |= CONFIG_OPTIMISTIC;
    }
    if (affectsScopesLive()) inheritAffectsMarks(created, target.v, $TRACK);
    target.dk = dk;
    markDescendants(target);
  }
  return dk;
}
/** Deep-witness bump: any value/shape change on a record with a live deep()
 * subscriber notifies it. One null check when unused. */
function bumpDeep(t) {
  if (t.dk !== null) setSignal(t.dk, 1);
}
// ---------------------------------------------------------------------------
// pending backing + fold (the single mutation point)
/** target → committed backing at batch start (the fold diff's old side). */
const foldOlds = new Map();
let hookInstalled = false;
/** Shallow-clone `source` as a backing OWNED by `t` (stamped `$OWNER`, see
 * target.ts). Callers always pass their own committed backing as `source`. */
function cloneRaw(source, t) {
  // Plain-data fast path (#3360): a scanned `Object.prototype` container
  // whose own keys are all enumerable data clones by spread — the same
  // result as the descriptor walk below (own enumerable string+symbol keys,
  // normalized writable+configurable), at ~1/50th the cost.
  t.sc || scanAccessorsOnce(t);
  if (t.sc === 2) {
    const clone = { ...source };
    clone[$OWNER] = t;
    return clone;
  }
  // Descriptor-preserving shallow clone (R29: installed getters stay live;
  // ruled 2026-08-17: frozen sources clone unfrozen — theirs stays frozen).
  // Data descriptors normalize to writable+configurable (the clone is OURS to
  // mutate — R51's "source-non-configurable is writable through the store");
  // enumerability and accessors are preserved. The scan doubles as the
  // accessor-flag detector (free — we're enumerating descriptors anyway).
  const descs = Object.getOwnPropertyDescriptors(source);
  for (const key of Reflect.ownKeys(descs)) {
    const d = descs[key];
    if (key === "length" && Array.isArray(source)) continue;
    d.configurable = true;
    if (!d.get && !d.set) d.writable = true;
    else t.a = true;
  }
  const clone = Array.isArray(source)
    ? Object.defineProperties([], descs)
    : Object.create(Object.getPrototypeOf(source), descs);
  clone[$OWNER] = t;
  return clone;
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
 * 3–8× cheaper than any per-key loop. */
function wideClone(source, t) {
  const clone = Object.create(null);
  for (const key of Reflect.ownKeys(source)) clone[key] = source[key];
  Object.setPrototypeOf(clone, Object.prototype);
  clone[$OWNER] = t;
  return clone;
}
/** Copy own `key` from `from` onto `to`. A plain data slot (enumerable,
 * writable, configurable, no accessor) is a bare assignment — the common case
 * and the cheap one; anything else goes through defineProperty so accessors
 * and attribute flags survive the copy. */
function copyOwn(to, from, key) {
  const d = Object.getOwnPropertyDescriptor(from, key);
  if (d.get || d.set || !d.enumerable || !d.writable || !d.configurable)
    Object.defineProperty(to, key, d);
  else to[key] = d.value;
}
/** One-time own-accessor scan (Annex-B probes, no descriptor allocation);
 * returns true when the container is plain data (overlay-safe). Also grades
 * the container for the plain-data fast paths (`sc` = 2): `Object.prototype`
 * and every own key an enumerable data property — what a spread copies
 * exactly and what a bare assignment lands exactly. */
function scanAccessorsOnce(target) {
  const src = target.v;
  const keys = Reflect.ownKeys(src);
  let plain = Object.getPrototypeOf(src) === Object.prototype;
  for (const key of keys) {
    // Own keys shadow prototype accessors, so the lookups are exact here.
    if (lookupGetter.call(src, key) !== undefined || lookupSetter.call(src, key) !== undefined) {
      target.a = true;
      plain = false;
      break;
    }
    if (plain && !propertyIsEnumerable.call(src, key)) plain = false;
  }
  target.sc = plain ? 2 : 1;
  target.kc = keys.length;
  return !target.a;
}
/** Own-key count above which a draft opens as a prototype overlay rather
 * than a clone (#3360). Below it a spread clone of a plain container is
 * cheaper than the overlay's `Object.create` (V8 converts the committed
 * backing into a prototype, and every later flatten writes into that
 * prototype); above it the clone's O(keys) copy dominates (#3044). */
const OVERLAY_MIN_KEYS = 32;
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
 * counts up for keys new to the container and the delete commit counts down. */
const OVERLAY_REBUILD_MAX_KEYS = 1024;
const OVERLAY_REBUILD_MIN_ADDS = 16;
function overlayRebuilds(t, pb) {
  if (t.kc > OVERLAY_REBUILD_MAX_KEYS) return false;
  if (t.del !== null && t.del.size !== 0) return true;
  // Every trap write records its key, so the written-key count bounds the
  // adds — the common few-key fold (#3044's growing record) answers here
  // without enumerating the overlay.
  const wk = t.wk;
  if (wk !== null && wk !== WK_ALL && wk.size <= OVERLAY_REBUILD_MIN_ADDS) return false;
  const v = t.v;
  let adds = 0;
  for (const key of Reflect.ownKeys(pb))
    if (!hasOwn.call(v, key) && ++adds > OVERLAY_REBUILD_MIN_ADDS) return true;
  return false;
}
/** Downgrade a prototype-overlay pending backing to the clone path: builds
 * the real container (committed + overlay writes − deletes) that fold will
 * SWAP in as the committed backing, exactly as if the draft had started on
 * the clone path. Consumers that need a complete container (reconcile's
 * diff walks, drafts escaping into other storage) call this, and so does the
 * commit itself when the fold changed the key set (overlayRebuilds). Returns
 * the pending backing (the clone, or the pb as-is when not an overlay). */
function materializePB(target) {
  const pb = target.pb;
  if (!target.ovl) return pb;
  const clone = target.sc === 2 ? wideClone(target.v, target) : cloneRaw(target.v, target);
  // Deletes before writes (#3689): on a fast-mode clone (the descriptor
  // path) the first delete normalizes it once, and the writes then land as
  // O(1) dictionary adds instead of O(keys) map transitions each. Order is
  // free semantically — a rewritten key left `del` at write time, so no
  // write targets a deleted key.
  if (target.del !== null) {
    for (const key of target.del) delete clone[key];
    target.kc -= target.del.size;
    target.del = null;
  }
  // Plain-data grade (sc 2): bare assignment, as flattenOverlay does.
  for (const key of Reflect.ownKeys(pb))
    target.sc === 2 ? (clone[key] = pb[key]) : copyOwn(clone, pb, key);
  target.pb = clone;
  target.ovl = false;
  return clone;
}
function ensurePB(target) {
  let pb = target.pb;
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
  if (
    pb !== null &&
    !tentativePBs.has(pb) &&
    target.fam?.opt === true &&
    !projectionWriteActive &&
    !getWriteOverride() &&
    foldBatches.has(target)
  ) {
    stagedTruthPB.set(target, pb);
    pb = target.pb = null;
  }
  if (activeTransition !== null) foldBatches.set(target, activeTransition);
  if (pb === null) {
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
    const v = target.v;
    if (
      !target.fam?.opt &&
      !target.ch &&
      !Array.isArray(v) &&
      (target.sc !== 0 ? !target.a : scanAccessorsOnce(target)) &&
      target.kc > OVERLAY_MIN_KEYS &&
      isOwned(v)
    ) {
      // Inherits `v`'s $OWNER stamp — the overlay resolves and reads as
      // owned without a registration of its own.
      pb = target.pb = Object.create(v);
      target.ovl = true;
    } else pb = target.pb = cloneRaw(v, target);
    // Optimistic families: seed USER drafts from the OPTIMISTIC VIEW
    // (committed + active node overrides), so follow-up writes compose on
    // optimism instead of clobbering from base (#2951's compose half).
    // AUTHORITATIVE drafts (projection recompute / write-override landings)
    // seed from committed truth — seeding overrides there would fold a lane
    // value into the committed home ("authority wins at reveal" would break).
    if (target.fam?.opt && !projectionWriteActive && !getWriteOverride()) {
      tentativePBs.add(pb);
      const nodes = target.n;
      if (nodes !== null) {
        for (const key of Reflect.ownKeys(nodes)) {
          const node = nodes[key];
          if (hasActiveOverride(node)) pb[key] = unwrapOverride(node._x?._overrideValue);
        }
      }
      const has = target.h;
      if (has !== null) {
        for (const key of Reflect.ownKeys(has)) {
          const node = has[key];
          if (hasActiveOverride(node) && !unwrapOverride(node._x?._overrideValue)) delete pb[key];
        }
      }
    }
    queueFold(target);
  }
  return pb;
}
/** Sentinel holder for `t.ht`: a latest()-pull staged this adoption outside
 * any transition — the hold lasts until the fold commit (drainFolds). */
const PLAIN_HOLD = Symbol("plainHold");
/** True while a latest() read is pulling the projection computed up to date
 * (see the get trap): adoptions landing during the pull are speculative
 * against the un-flushed batch and stage a held view. (Not injectable — the
 * derived createStore overload retains projection machinery in every store
 * bundle, see treeshake.test.ts.) */
let latestPullActive = false;
/** Resolve the held committed view (#3074): answers the masked old backing
 * while the hold is live, and lazily clears a hold whose transition has
 * committed (transitions merge — resolve through currentTransition, same as
 * foldHeld's node stamps). */
function heldMaskView(t) {
  const ht = t.ht;
  if (ht === null) return null;
  if (ht !== PLAIN_HOLD && currentTransition(ht)?._done === true) return (t.ht = t.hv = null);
  return t.hv;
}
/**
 * Adoption (2026-08-16c): the incoming object becomes the committed backing
 * IMMEDIATELY — reconcile is eagerly visible to every reader (shipped
 * contract; only its notifications batch), unlike setter writes which stay
 * pending until flush. Ownership resets (incoming is unowned/user data). Any
 * staged draft clone folds into the diff and is discarded — next is the
 * authoritative base (R21/R32).
 */
function adoptPB(target, incoming, eager = false) {
  // Eager mode (plain-store adoption): the caller notifies inline after its
  // descent — no foldOlds queue/drain round trip (the reconcile diff IS the
  // fold diff; ~half of dbmon tick time was this duplication).
  if (!eager) {
    queueFold(target); // records the pre-batch old before we swap
    // Diff base = the view the nodes were last told (#3296). A draft's
    // setter-exit notifications already moved them to its pending backing,
    // so a later adoption diffs against THAT — against committed, a key the
    // draft changed and the adoption restores would never re-notify. An
    // adoption with no draft leaves nodes where they were: keep an existing
    // base, else the pre-batch committed (foldOlds' entry itself stays the
    // committed identity for the path-copy CAS). Eager callers read t.pb
    // directly; this hand-off exists because pb is gone by drain time.
    if (target.pb !== null) {
      if (target.ovl) materializePB(target);
      target.ab = target.pb;
    } else target.ab ??= foldOlds.get(target);
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
    target.ht = target.hv = null;
  } else if (activeTransition !== null || (!eager && latestPullActive)) {
    if (heldMaskView(target) === null) target.hv = target.v;
    target.ht = activeTransition ?? PLAIN_HOLD;
    if (!eager && activeTransition !== null) heldAdoptions.add(target);
    heldKeys.set(target, [incoming]);
  }
  target.pb = null;
  // Overlay and accessor-scan state describe the OUTGOING backing — a
  // swapped container must not inherit them: a stale `ovl` beside a nulled
  // pb crashes materializePB (unwrapValue consults ovl before the
  // null-coalesce), a stale `del` would read the adoptee's keys as deleted
  // in the next draft, and a stale plain-data verdict (`sc`/`a`) could
  // admit an accessor-bearing adoptee to the overlay path. Reset; the next
  // draft rescans once (#3044 audit follow-up).
  target.ovl = false;
  target.del = null;
  target.sc = 0;
  target.a = false;
  target.wk = null; // adoption supersedes staged trap writes
  target.v = incoming;
  target.ch = incoming[$TARGET] !== undefined;
  // An adoptee we own within this family (a draft aliasing one of the
  // family's own backings) re-stamps to its new owner — the stamp is the
  // family's registration for it; everything else registers in the map.
  const owner = incoming[$OWNER];
  if (owner !== undefined && owner.fam === target.fam) incoming[$OWNER] = target;
  else (target.fam?.map ?? storeNextLookup).set(incoming, target);
}
/** Sentinel for `t.wk`: the written-keys bound is unusable this batch (an
 * array length write implicitly deleted indices) — consumers full-scan. */
const WK_ALL = new Set();
const plainProto = o => {
  const p = Object.getPrototypeOf(o);
  return p === Object.prototype || p === Array.prototype || p === null;
};
function queueFold(target) {
  if (foldOlds.has(target)) return;
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
  foldOlds.set(target, target.v);
}
/** Fold write-attribution (#3089): a draft written while a transition is
 * active belongs to that transition — its fold must not commit before the
 * transition settles. Observed keys already defer through the held check in
 * drainFolds (their nodes carry _pendingValue); this write-time stamp is the
 * equivalent hold for UNOBSERVED keys, which have no node to consult.
 * Refreshed on every write; resolved through currentTransition at drain
 * (transitions merge — same rule as heldMaskView). */
const foldBatches = new WeakMap();
/** Parked truth-staged pending backings (#3164 fold): a tentative draft that
 * opens while a folded landing's backing is live moves the staged container
 * here (see ensurePB); the tentative discard in notifyOptimisticWrites
 * restores it in place of the usual null. */
const stagedTruthPB = new WeakMap();
/** Backings opened by TENTATIVE drafts (optimistic user setters): ensurePB's
 * truth-park must not fire against the draft's own container on its second
 * and later writes (the first write stamps foldBatches whenever an action's
 * transition is ambient). Entries die with their draft — tentative backings
 * are consumed at setter exit. */
const tentativePBs = new WeakSet();
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
 * half, one landing later). */
function draftSeesOverrides(target) {
  return target.pb === null || !tentativePBs.has(target.pb);
}
/** Committed-time privatization for parent-chain slot updates (path copying). */
function privatizeCommitted(target) {
  if (isOwned(target.v)) return;
  const before = target.v;
  const clone = cloneRaw(before, target);
  target.v = clone;
  target.ch = false;
  if (target.u) {
    privatizeCommitted(target.u);
    devAssertNeverUserMutation(target.u.v);
    // CAS, same as drainFolds' path copy: re-point the parent slot only
    // while it still holds the raw we cloned. A parent that folded EARLIER
    // in this drain may have replaced or deleted this slot (the same batch
    // wrote the child and then `parent.row = fresh` / `parent.length = 0`)
    // — an unconditional write resurrected the dropped child over it.
    const pv = target.u.v;
    const slot = parentSlotKey(target, before);
    if (pv[slot] === before) pv[slot] = target.v;
  }
}
/** Resolve the slot this child currently occupies in its parent's committed
 * backing (#3282). `pk` is stamped at wrap time and arrays MOVE: a reverse/
 * unshift/splice relocates the raw, and a fold that re-points the wrap-time
 * slot writes the clone over whichever row lives there now. Objects never
 * move keys, so the stamp is authoritative; for arrays, verify and re-locate
 * by identity when stale (fold-time only — never on a read path). */
function parentSlotKey(target, expected) {
  const pk = target.pk;
  const pv = target.u.v;
  if (pv[pk] === expected || !Array.isArray(pv)) return pk;
  const at = pv.indexOf(expected);
  if (at === -1) return pk;
  target.pk = at;
  return at;
}
/** Overlay commit (#3044): apply the batch's writes onto an OWNED committed
 * backing in place — O(written), not O(container). Unowned backings
 * privatize first (clone once, parents re-slotted) — the never-mutate-user-
 * data contract holds. Shared by the deferred fold (drainFolds) and the
 * projection landing's immediate commit (notifyWrites). */
function flattenOverlay(t, pb) {
  privatizeCommitted(t);
  const v = t.v;
  // Plain-data grade (sc 2): every own key on the overlay is an enumerable
  // writable data slot (set-trap writes; a non-plain defineProperty
  // downgrades the grade) — a bare assignment lands it without the
  // descriptor round trip.
  for (const key of Reflect.ownKeys(pb)) t.sc === 2 ? (v[key] = pb[key]) : copyOwn(v, pb, key);
  if (t.del !== null) {
    for (const key of t.del) delete v[key];
    t.kc -= t.del.size;
    t.del = null;
  }
  t.pb = null;
  t.ovl = false;
  t.wk = null; // written-keys window closes with the commit
}
function drainFolds() {
  if (foldOlds.size === 0) return;
  const entries = [...foldOlds];
  foldOlds.clear();
  for (const [t, old] of entries) {
    // A latest()-pull staging holds only until the fold commit: this flush
    // is committing the batch the pull ran ahead of. Transition holds stay —
    // they clear when their transition is done (heldMaskView).
    if (t.ht === PLAIN_HOLD) t.ht = t.hv = null;
    if (t.pb !== null) {
      // #3089: a fold written under a still-running transition defers to
      // that transition's settle (the write-time stamp covers unobserved
      // keys; observed keys also hit the pending-node held check below).
      const fb = foldBatches.get(t);
      if (fb !== undefined) {
        if (currentTransition(fb)._done === false) {
          foldOlds.set(t, old);
          continue;
        }
        foldBatches.delete(t);
      }
      // Setter path: nodes were setSignal'd at setter exit (write-time
      // notification — transitions/holds ride core machinery). Commit the
      // backing only for keys whose nodes have committed; a still-pending
      // node (transition-held) re-queues the target for the settling flush.
      let held = false;
      const pb = t.pb;
      const nodes = t.n;
      if (nodes !== null) {
        // Only written keys can hold (their nodes took the setSignal); the
        // wk bound keeps this O(written) — see notifyWrites. Same fallback
        // rules as the notify (WK_ALL / accessors / non-plain prototypes).
        const wkh = t.wk;
        const keys =
          wkh === null ||
          wkh === WK_ALL ||
          t.a === true ||
          // Overlay pbs chain to the COMMITTED object (#3044) — plainness is
          // the committed container's prototype, not the overlay's.
          !plainProto(t.ovl ? t.v : pb)
            ? Reflect.ownKeys(nodes)
            : wkh;
        for (const key of keys) {
          const node = nodes[key];
          if (node !== undefined && node._pendingValue !== NOT_PENDING) {
            held = true;
            break;
          }
        }
      }
      if (held) {
        foldOlds.set(t, old); // re-queue: commit happens when the hold settles
        continue;
      }
      if (t.ovl && (t.v !== old || !overlayRebuilds(t, pb))) {
        // Overlay flatten (#3044): the backing keeps its identity, so the
        // `t.v === old` gate below skips path copying (the parent slot
        // already points here) and the adopted-notify (setter notifications
        // happened at write time). A backing privatized mid-batch is a fresh
        // clone, never a prototype — in-place writes into it are cheap, and
        // the merge branch below is what a materialized pb would need anyway.
        flattenOverlay(t, pb);
      } else if (t.v !== old) {
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
        const v = t.v;
        const wk = t.wk;
        if (wk !== null && wk !== WK_ALL) {
          // The trap records every write/delete key — apply exactly those.
          for (const key of wk) {
            if (hasOwn.call(pb, key)) copyOwn(v, pb, key);
            else delete v[key];
          }
        } else {
          // Array length write poisoned the bound (WK_ALL) — value-diff
          // against the pre-batch old. Slots the draft never touched hold
          // the same raw reference in both, so descendant folds stay put.
          // Not copyOwn: the plain-value write is GATED on "the draft changed
          // this slot" — an untouched slot in pb holds the pre-batch reference,
          // and writing it back would clobber a descendant fold stitched into v.
          for (const key of Reflect.ownKeys(pb)) {
            const d = Object.getOwnPropertyDescriptor(pb, key);
            if (d.get || d.set || !d.enumerable || !d.writable || !d.configurable)
              Object.defineProperty(v, key, d);
            else if (d.value !== old[key] || !hasOwn.call(old, key)) v[key] = d.value;
          }
          for (const key of Reflect.ownKeys(old)) {
            if (!hasOwn.call(pb, key)) delete v[key];
          }
        }
        t.pb = null;
        t.wk = null; // written-keys window closes with the fold commit
      } else {
        // An overlay whose fold changed the key set rebuilds (#3689) and
        // takes the swap like a clone-path draft: the parent slot re-points
        // in the path copy below.
        t.v = t.ovl ? materializePB(t) : pb;
        t.ch = false; // pb is always a plain clone
        t.pb = null;
        t.wk = null; // written-keys window closes with the fold commit
      }
    }
    const base = t.ab;
    t.ab = null;
    if (t.v !== old) {
      // Path copying (CAS: see the eager-fold twin above). Slot resolved by
      // identity (#3282): an array move relocated the raw, so the wrap-time
      // pk may point at a sibling — a raw-slot CAS there both failed to
      // re-point AND (via privatizeCommitted's unguarded write) clobbered
      // the sibling.
      if (t.u) {
        const slot = parentSlotKey(t, old);
        if (t.u.v[slot] === old) {
          privatizeCommitted(t.u);
          devAssertNeverUserMutation(t.u.v);
          t.u.v[slot] = t.v;
        }
      }
    }
    // Adoption notify against the base the nodes were last told (#3296). A
    // no-op adoption (A -> B -> A before flush, no draft) has base === v and
    // nothing to say; a draft superseded by an adoption back to the SAME raw
    // still has (base = pending backing) !== v and must notify.
    if (base !== null && base !== t.v) notifyFold(t, base, t.v);
  }
}
/** Dev: dotted path of a target from its store root (`store.user.address`). */
function storePath$1(t) {
  let path = "";
  for (let cur = t; cur !== null; cur = cur.u)
    path = cur.pk === null ? "store" + path : "." + String(cur.pk) + path;
  return path;
}
/**
 * Dev (attribution engine installed): announce written keys whose old and new
 * values are both containers but different logical slots — the raw material
 * for the spread-copy diagnostic. The engine owns the verdict.
 */
function reportReplacedContainers(t, old, pb, writtenKeys) {
  const keys = writtenKeys ?? Reflect.ownKeys(pb);
  const isArray = Array.isArray(pb);
  const owner = storeRootOwner(t);
  for (const key of keys) {
    if ((isArray && key === "length") || key === $OWNER) continue;
    if (t.del !== null && t.del.has(key)) continue;
    const ov = unwrapValue(old[key]);
    const nv = unwrapValue(pb[key]);
    if (
      ov === null ||
      nv === null ||
      typeof ov !== "object" ||
      typeof nv !== "object" ||
      ov === nv ||
      targetsEqual(ov, nv)
    )
      continue;
    // Leaf census on the store side: leaves read through a draft are proxies
    // of the committed raws, so identity must be judged on unwrapped values.
    const isArr = Array.isArray(nv);
    if (isArr !== Array.isArray(ov)) continue;
    let total;
    let unchanged = 0;
    if (isArr) {
      total = nv.length;
      if (total > REPLACED_CENSUS_MAX) continue;
      const oldItems = new Set();
      for (const item of ov) oldItems.add(unwrapValue(item));
      for (const item of nv) if (oldItems.has(unwrapValue(item))) unchanged++;
    } else {
      const nkeys = Object.keys(nv);
      total = nkeys.length;
      if (total > REPLACED_CENSUS_MAX) continue;
      for (const k of nkeys) if (sameLeaf(ov[k], nv[k])) unchanged++;
    }
    attrHooks.storeReplaced(
      storePath$1(t) + "." + String(key),
      isArr,
      total,
      unchanged,
      isArr ? ov.length : Object.keys(ov).length,
      owner
    );
  }
}
const REPLACED_CENSUS_MAX = 64;
function sameLeaf(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  return unwrapValue(a) === unwrapValue(b) || targetsEqual(a, b);
}
/**
 * Setter-exit notification (write channel): diff the draft's pending backing
 * against committed and setSignal every changed OBSERVED key — write-time
 * notification with commit deferred to node commit, so transition holds,
 * isPending, affects, and lane machinery ride the core natively (§3's
 * "pending home = the node when a node exists"). Unobserved keys stay in the
 * pending backing and fold directly at commit.
 */
function notifyWrites(t) {
  let pb = t.pb;
  if (pb === null) return;
  // Optimistic channel: user writes on an optimistic family become node-level
  // engine writes (armed nodes route setSignal through optimisticWrite) — the
  // committed backing is NEVER touched; the draft clone is discarded. Reverts,
  // per-transaction ownership, and flash-at-flush are all core-native.
  // Projection recompute writes (projectionWriteActive) and projection draft
  // writes (write-override, incl. post-await async landings) are
  // authoritative and take the plain channel below (they commit silently
  // under overrides per the engine's no-revert-stash contract).
  if (t.fam?.opt) {
    if (!projectionWriteActive && !getWriteOverride()) {
      optHooks.notifyOptimisticWrites(t, pb);
      return;
    }
    // Authoritative path on an optimistic family: armed nodes must commit
    // silently (engine bypass) — without this, a landing's setSignals would
    // create lanes and block their own transition's settle.
    if (!projectionWriteActive) {
      setProjectionWriteActive(true);
      try {
        notifyWrites(t);
      } finally {
        setProjectionWriteActive(false);
      }
      return;
    }
  }
  const old = t.v;
  // Devtools mutation hook: full-key diff (dev-only cost) so unobserved
  // writes report too, matching the legacy set-trap hook. Overlay backings
  // materialize first so the diff walks a real container.
  if (DEV$1.hooks.onStoreNodeUpdate) {
    if (t.ovl) materializePB(t);
    pb = t.pb;
    for (const key of Reflect.ownKeys(pb)) {
      if ((Array.isArray(pb) && key === "length") || key === $OWNER) continue;
      const ov = old[key];
      const nv = pb[key];
      if (!isEqual(ov, nv)) DEV$1.hooks.onStoreNodeUpdate(t.px, key, nv, ov);
    }
    for (const key of Reflect.ownKeys(old)) {
      if (key in pb || key === $OWNER) continue;
      DEV$1.hooks.onStoreNodeUpdate(t.px, key, undefined, old[key]);
    }
  }
  const nodes = t.n;
  // Written-keys bound: trap writes record their keys, so the notify visits
  // O(written) nodes instead of every subscription on the record (a selection
  // map with thousands of per-key subscribers pays two visits per select,
  // not a full scan). Falls back to the full node scan when the bound can't
  // hold: no trap granularity (wk null), an array length write (WK_ALL —
  // implicit index deletes), accessors on the record (t.a — a getter node's
  // value can change when ANY key is written), or a non-plain prototype
  // (class instances: prototype getters derive from arbitrary fields).
  const wk0 = t.wk;
  // Overlay pbs chain to the COMMITTED object (#3044): a prototype-overlay
  // draft is plain data on its own layer, but its getPrototypeOf is the
  // committed container — judge plainness by the COMMITTED prototype or the
  // bound never engages for overlay writes (every plain-object setter batch
  // would full-scan: the exact selection-map workload wk exists for; jf
  // `select` regressed 2x on this).
  const writtenKeys = wk0 === WK_ALL || t.a === true || !plainProto(t.ovl ? t.v : pb) ? null : wk0;
  if (attrHooks !== null) reportReplacedContainers(t, old, pb, writtenKeys);
  if (nodes !== null) {
    const keys = writtenKeys ?? Reflect.ownKeys(nodes);
    for (const key of keys) {
      const node = nodes[key];
      if (node === undefined) continue;
      // Per-key accessor handling: the node's cached flag plus ONE getter
      // probe on the incoming side (getters arriving via merge/adoption).
      // Setter-only props read as data (value undefined) so lookupSetter is
      // not consulted on this hot path; prototype getters never own nodes.
      if (node.acc === true || (hasOwn.call(pb, key) && lookupGetter.call(pb, key) !== undefined)) {
        node.acc = isOwnAccessor(pb, key);
        const od = Object.getOwnPropertyDescriptor(old, key);
        const nd = Object.getOwnPropertyDescriptor(pb, key);
        if ((od && (od.get || od.set)) || (nd && (nd.get || nd.set))) {
          if (od?.get !== nd?.get || od?.set !== nd?.set || od?.value !== nd?.value)
            setSignal(node, () => FORCE);
          continue;
        }
        if (!isEqual(od?.value, nd?.value)) setSignal(node, () => nd?.value);
        continue;
      }
      // No old-side pre-compare: t.v lags across multi-batch windows (a
      // projection recompute can run before the prior fold commits) — the
      // node's OWN current value is the true old side, and setSignal's
      // internal equality already checks exactly that.
      const nv = t.del !== null && t.del.has(key) ? undefined : pb[key];
      // The derived store's setter reaching a leaf its own fold staged under
      // another transaction: not a proposal — the fold re-runs (#3612).
      if (derivedSetter !== null && node._firewall === derivedSetter && heldDerivation(node))
        heldDerivationHit = true;
      setSignal(node, () => nv);
    }
  }
  const has = t.h;
  if (has !== null) {
    const keys = writtenKeys ?? Reflect.ownKeys(has);
    for (const key of keys) {
      const node = has[key];
      if (node !== undefined) setSignal(node, key in pb && !(t.del !== null && t.del.has(key)));
    }
  }
  // Deep-witness (dk): setter writes must notify a deep() subscriber even on
  // keys with no node. O(written/pb keys) equality only when a witness exists.
  if (t.dk !== null) {
    if (t.del !== null && t.del.size !== 0) bumpDeep(t);
    else
      for (const key of writtenKeys ?? Reflect.ownKeys(pb)) {
        if (key === $OWNER) continue;
        const nv = pb[key];
        const ov = old[key];
        if (nv !== null && typeof nv === "object" ? !targetsEqual(ov, nv) : !isEqual(ov, nv)) {
          bumpDeep(t);
          break;
        }
      }
  }
  if (t.k !== null) {
    let changed;
    if (t.ovl) {
      // Overlay membership: only NEW own keys or deletes can change it.
      changed = t.del !== null && t.del.size !== 0;
      if (!changed) {
        for (const key of Reflect.ownKeys(pb)) {
          if (!hasOwn.call(old, key)) {
            changed = true;
            break;
          }
        }
      }
    } else {
      changed =
        Array.isArray(pb) && Array.isArray(old)
          ? arrayStructureChanged(old, pb)
          : membershipChanged(old, pb);
    }
    if (changed) setSignal(t.k, v => v + 1);
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
  if (t.fam !== null && t.pb !== null && getWriteOverride() && activeTransition === null) {
    // Landed truth (post-await write-override): immediately visible to every
    // reader — any staged held view is superseded.
    if (t.ht !== null) t.ht = t.hv = null;
    // Overlay landing (#3352): flatten in place — identity-stable, and
    // privatizeCommitted re-slots the parent itself when it has to clone an
    // unowned seed, so no path copy is needed. A landing that changed the
    // key set rebuilds instead (#3689) and swaps like a clone-path landing.
    if (t.ovl) {
      if (!overlayRebuilds(t, pb)) return flattenOverlay(t, pb);
      pb = materializePB(t);
    }
    const oldBacking = t.v;
    t.pb = null;
    t.v = pb;
    t.ch = false;
    if (t.u) {
      // Identity-resolved slot (#3282) — see drainFolds' path-copy twin.
      const slot = parentSlotKey(t, oldBacking);
      if (t.u.v[slot] === oldBacking) {
        privatizeCommitted(t.u);
        devAssertNeverUserMutation(t.u.v);
        t.u.v[slot] = pb;
      }
    }
  }
}
const FORCE = Symbol();
/** Same logical slot: both values resolve to one (re-pointed) child target —
 * adoption preserved identity, so the slot did not change (R9). */
function targetsEqual(ov, nv) {
  if (ov === null || typeof ov !== "object" || nv === null || typeof nv !== "object") return false;
  const ot = lookupTarget$1(ov, null);
  return ot !== undefined && ot === lookupTarget$1(nv, null);
}
function arrayStructureChanged(old, neu) {
  if (old.length !== neu.length) return true;
  for (let i = 0; i < neu.length; i++) {
    const ov = old[i];
    const nv = neu[i];
    if (!isEqual(ov, nv) && !targetsEqual(ov, nv)) return true;
  }
  return false;
}
function membershipChanged(old, neu) {
  const nk = Reflect.ownKeys(neu);
  // The $OWNER stamp is not membership: an owned side counts one key more.
  if (Reflect.ownKeys(old).length - +isOwned(old) !== nk.length - +isOwned(neu)) return true;
  for (const key of nk) if (key !== $OWNER && !(key in old)) return true;
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
 * adoption walk): accessor-aware compare + equality/identity-gated setSignal. */
function notifyKeyDiff(
  node,
  key,
  old,
  neu,
  // The incoming-side getter probe covers SETTER-channel arrivals (return-
  // form merges, defineProperty) — those flow through notifyWrites/
  // notifyFold, which probe. The RECONCILE channel (fused walk) passes
  // false: reconcile adopts immutable data by contract (R2a) and the pinned
  // getter-preservation tests are all setter-channel; skipping ~2 Annex-B
  // calls per key per tick is a measured dbmon win.
  probe = true
) {
  if (
    node.acc === true ||
    (probe && hasOwn.call(neu, key) && lookupGetter.call(neu, key) !== undefined)
  ) {
    node.acc = isOwnAccessor(neu, key);
    const od = Object.getOwnPropertyDescriptor(old, key);
    const nd = Object.getOwnPropertyDescriptor(neu, key);
    if ((od && (od.get || od.set)) || (nd && (nd.get || nd.set))) {
      // Accessor involved: never invoke; force-notify on shape change so
      // subscribers re-read (and re-track) through the trap.
      if (od?.get !== nd?.get || od?.set !== nd?.set || od?.value !== nd?.value)
        setSignal(node, () => FORCE);
      return;
    }
    const ov = od?.value;
    const nv = nd?.value;
    if (!isEqual(ov, nv) && !targetsEqual(ov, nv))
      setSignal(node, typeof nv === "function" ? () => nv : nv);
  } else {
    const ov = old[key];
    const nv = neu[key];
    // Direct value write when not a function (setSignal treats functions as
    // updaters) — saves a closure allocation per changed key on the fold
    // hot path.
    if (!isEqual(ov, nv) && !targetsEqual(ov, nv))
      setSignal(node, typeof nv === "function" ? () => nv : nv);
  }
}
/** Accessor-flag probe for the fused walk's early-continue (accessor keys
 * can never identity-skip: their VALUE is the descriptor's product). */
function hasAccessorFlag(node) {
  return node.acc === true;
}
/** Fused-walk per-key notification with values already in hand: the caller
 * fetched both sides and handled the identity skip; this applies the
 * accessor branch (cached flag only — reconcile channel) or the plain
 * equality/identity-gated write. */
function notifyKeyValue(node, key, ov, nv, old, neu) {
  if (node.acc === true) {
    notifyKeyDiff(node, key, old, neu, false);
    return;
  }
  // The pre-compare is NOT redundant with the node's equals: setSignal parks
  // a pending value and registers with the batch before equality applies at
  // commit (RUL-1), so identity-preserved slots (adopted child containers —
  // every row's fresh `queries` array) must be gated out HERE or each one
  // pays the full write machinery every tick (measured: +0.5ms/tick dbmon).
  if (!isEqual(ov, nv) && !targetsEqual(ov, nv))
    setSignal(node, typeof nv === "function" ? () => nv : nv);
}
/** Presence + membership halves of a fold notification (shared tail). */
function notifyFoldTail(t, old, neu) {
  const has = t.h;
  if (has !== null) {
    for (const key of Reflect.ownKeys(has)) setSignal(has[key], key in neu);
  }
  if (t.k !== null) {
    const changed =
      Array.isArray(neu) && Array.isArray(old)
        ? arrayStructureChanged(old, neu)
        : membershipChanged(old, neu);
    if (changed) setSignal(t.k, v => v + 1);
  }
}
function notifyFold(t, old, neu) {
  if (t.dk !== null && old !== neu) bumpDeep(t);
  // Optimistic targets: adoption notifications are authoritative landings —
  // bypass the engine (commit into _value; active overrides keep shadowing
  // until their transaction settles, per the no-revert-stash contract).
  if (t.fam?.opt && !projectionWriteActive) {
    setProjectionWriteActive(true);
    try {
      notifyFold(t, old, neu);
    } finally {
      setProjectionWriteActive(false);
    }
    return;
  }
  const nodes = t.n;
  if (nodes !== null) {
    for (const key of Reflect.ownKeys(nodes)) {
      notifyKeyDiff(nodes[key], key, old, neu);
    }
  }
  const has = t.h;
  if (has !== null) {
    for (const key of Reflect.ownKeys(has)) setSignal(has[key], key in neu);
  }
  if (t.k !== null) {
    // Key-set/$TRACK: objects notify on membership; arrays on any index or
    // length change (mapArray and iteration re-read values — R15).
    const changed =
      Array.isArray(neu) && Array.isArray(old)
        ? arrayStructureChanged(old, neu)
        : membershipChanged(old, neu);
    if (changed) setSignal(t.k, v => v + 1);
  }
}
// ---------------------------------------------------------------------------
// traps
/** >0 while inside a setter: writes allowed, reads are read-your-writes. */
let writing = 0;
/** Write scope keys (a family object or a plain store's root target): draft
 * semantics — write permission, read-your-writes, tracking suppression —
 * apply ONLY to targets under a scope being written. Reads of OTHER stores
 * inside a setter track normally (they are dependencies: a projection derive
 * reading another store must link it). */
let writeScopes = null;
function scopeKey(target) {
  if (target.fam !== null) return target.fam;
  let t = target;
  while (t.u !== null) t = t.u;
  return t;
}
function inDraft(target) {
  return writeScopes !== null && writeScopes.has(scopeKey(target));
}
/** Shallow serve rule (#2932): raw-marked data serves VERBATIM, but a
 * store-proxy slot value gets a boundary wrapper in THIS store's own family —
 * write isolation through derived chains (downstream writes must never land
 * upstream). markRawOne skips proxies for exactly this reason. */
function serveShallow(target, key, v) {
  if (v !== null && typeof v === "object" && v[$TARGET] !== undefined)
    return draftServe(target, wrapNext(v, target, key));
  return v;
}
/** Draft reads extend write permission to reachable stores (legacy Writing
 * semantics: wrapping a child through a draft get admits it — cross-store
 * writes like `s.inner.a = 10` work when `inner` is another store's proxy). */
function draftServe(target, proxy) {
  if (writeScopes !== null && inDraft(target)) {
    const ct = proxy?.[$TARGET];
    if (ct !== undefined && ct.v !== undefined) writeScopes.add(scopeKey(ct));
  }
  return proxy;
}
/** Targets written during the current (outermost) setter — notified at exit. */
const pendingNotify = new Set();
/** Targets adopted under a live transaction this setter (adoptPB set a
 * transaction hold) — their nodes are notified at the outermost exit. */
const heldAdoptions = new Set();
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
 */
function stageHeldAdoptions() {
  const staged = [...heldAdoptions];
  heldAdoptions.clear();
  for (const t of staged) {
    const base = t.ab;
    if (base === null || base === t.v) continue;
    notifyFold(t, base, t.v);
    t.ab = t.v;
  }
}
const UNSAFE_KEYS = new Set(["__proto__", "prototype", "constructor"]);
/** Mirror of core read()'s context rule: the OWNER context (not the tracking
 * observer) decides pending visibility, with Roots resolving to their parent
 * computed (#2687 — untracked reads inside mapArray Roots see in-flight
 * values mid-flush). CHILDREN_FORBIDDEN execution scopes (createTrackedEffect
 * / onSettled callbacks) get COMMITTED visibility (#3006), same as core. */
/** Core read()'s reader: the current computation, a root reading as its
 * parent computed (`context` persists under untrack — an untracked read
 * inside an effect is still that effect's read). */
function readerContext() {
  const c = getOwner();
  return c === null ? null : c._root ? (c._parentComputed ?? null) : c;
}
/** A pending fold is transition-held when any written node's parked value is
 * stamped by a live transition (a plain batch parking — the lazy-recompute
 * read case — has no transition stamp and serves fresh). */
function foldHeld(target) {
  const nodes = target.n;
  if (nodes === null) return false;
  for (const key of Reflect.ownKeys(nodes)) {
    const node = nodes[key];
    if (
      node._pendingValue !== NOT_PENDING &&
      node._transition != null &&
      node._transition._done !== true
    )
      return true;
  }
  return false;
}
/** The backing a reader is served. `key` (the get/has/descriptor traps)
 * scopes a fold hold to the keys the fold touched — see pendingBackingVisible —
 * and an adoption hold to the keys the adoption changed (heldKey). */
function readSource(target, key) {
  // Adoption hold first (#3074): an adoption staged under a live transaction
  // (or a latest()-pull, PLAIN_HOLD) serves the pre-hold committed view to
  // committed-visibility readers — context-free and children-forbidden ones,
  // and stale passes off a foreign hold. Drafts, write-override and latest()
  // see the adopted backing.
  const ht = target.ht;
  if (ht !== null && !latestReadActive && !inDraft(target) && !getWriteOverride()) {
    const hv = heldMaskView(target);
    // A key the adoption left unchanged derives nothing from the hold, for
    // any reader (#3706): the backing serves it.
    if (hv !== null && (key === undefined || heldKey(target, key))) {
      const c = readerContext();
      if (
        c === null ||
        c._config & CONFIG_CHILDREN_FORBIDDEN ||
        !holdVisible(ht === PLAIN_HOLD ? null : currentTransition(ht), c)
      )
        return hv;
    }
  }
  return pendingBackingVisible(target, false, key) ? target.pb : target.v;
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
 * held truth stays masked exactly as it is for per-key readers. */
function pendingBackingVisible(target, speculative, key) {
  if (target.pb === null) return false;
  // The writer's own channels compose on the pending backing regardless.
  if (inDraft(target) || getWriteOverride()) return true;
  // HELD truth on an optimistic family (#3164 fold) is masked from LANE
  // passes until the transaction's reveal (the backing-level twin of core
  // serve()'s CONFIG_HELD_TRUTH arm; authoritative postures and latest()
  // tunnel through inside heldTruthMasked). Every other reader takes the
  // hold arms below: committed for no pass, the staged backing for the
  // holding pass, stale-of-foreign or A29 for a foreign one.
  if (heldTruthMasked(target)) return false;
  const c = readerContext();
  if (c === null || c._config & CONFIG_CHILDREN_FORBIDDEN) {
    // No pass, or a children-forbidden one: the committed frame (A32) —
    // except the speculative peek (deep()/snapshot()), which sees ordinary
    // pending staging but never through a live foreign hold, and a
    // projection's pending backing, authoritative-elect for context-free
    // readers UNLESS a transition holds the node commits (downstream async
    // hold — stale committed is the contract; the write-time stamp covers
    // keys with no node, #3336) or the scope is children-forbidden (#3082).
    const txn = liveFoldTransition(target);
    if (speculative) return txn === null || ownsHold(txn);
    return target.fam !== null && c === null && !foldHeld(target) && txn === null;
  }
  const txn = liveFoldTransition(target);
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
  if (txn !== null && key !== undefined && !target.ch && target.fam?.opt !== true) {
    const wk = target.wk;
    if (wk != null && wk !== WK_ALL && !wk.has(key)) return false;
  }
  return holdVisible(txn, c);
}
/** #3164 fold: HELD truth on an optimistic family — a pending backing
 * stamped by a live transition that retains optimism — is masked from LANE
 * passes only (a lane paints display-ahead at the park, so it keeps
 * committed until the transaction's reveal — owning transaction or not);
 * the authoritative postures and latest() tunnel through, and every other
 * reader is served by the ordinary hold arms (a deriving pass is held with
 * the truth, A29). Un-stamped backings and optimism-free transitions keep
 * ordinary mid-batch/speculation visibility. */
function heldTruthMasked(target) {
  if (
    target.fam?.opt !== true ||
    currentOptimisticLane === null ||
    latestReadActive ||
    authoritativeServe()
  )
    return false;
  const fb = foldBatches.get(target);
  // opt families are only created by createOptimisticStore, whose module
  // install populates optHooks — the assertion holds by construction.
  return fb !== undefined && optHooks.retainsOptimism(fb);
}
const hasOwn = Object.prototype.hasOwnProperty;
// Allocation-free own-accessor probe (replaces eager descriptor scans — the
// single biggest creation cost in the uibench profile): Annex-B lookups
// return the fn or undefined with no descriptor object. Own data properties
// shadow prototype accessors, so hasOwn + lookup is an exact own-check.
const lookupGetter = Object.prototype.__lookupGetter__;
const lookupSetter = Object.prototype.__lookupSetter__;
const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
function isOwnAccessor(src, key) {
  return (
    hasOwn.call(src, key) &&
    (lookupGetter.call(src, key) !== undefined || lookupSetter.call(src, key) !== undefined)
  );
}
/** Authoritative-write wrapper exported for the optimistic module: sets the
 * scheduler's projectionWriteActive through THIS module's binding (proven to
 * share the instance core reads — cross-module live-binding writes from other
 * store modules were observed not to propagate under the test transform). */
function runAuthoritative(fn) {
  const was = projectionWriteActive;
  setProjectionWriteActive(true);
  try {
    return fn();
  } finally {
    setProjectionWriteActive(was);
  }
}
/** The reading computation is until()'s authoritative-view predicate — same
 * source of truth as core read()'s A17 carve-out (`context`, which persists
 * under untrack). optimisticView()'s composition gate consults exactly this:
 * write-side machinery (patch emission, tentative re-application) must keep
 * composing even when it runs inside an authoritative-write bracket. */
function authoritativeRead() {
  const c = context;
  return c !== null && (c._config & CONFIG_AUTHORITATIVE_READ) !== 0;
}
/** Serve-side authoritative gate: until()'s predicate PLUS truth authors —
 * the projection derive's draft (wrapDraft trap brackets, runAuthoritative;
 * the same posture pair ensurePB classifies drafts by). A source computing
 * the next truth must never read its callers' tentative overlays: a derive
 * continuation's `store.push` computing its index from an action's
 * optimistic row landed truth in the wrong slot and corrupted committed
 * state (#3108). Trap-level overlay serves gate on this so values, length,
 * membership, and keys leave the authoritative view together. */
function authoritativeServe() {
  return projectionWriteActive || getWriteOverride() || authoritativeRead();
}
/** Context-aware node view for reads outside tracking: active override >
 * held pending (owner context) > the BACKING value. Committed truth lives in
 * the backing (single-home rule, O6) — node `_value` is never served here,
 * so a lazy recompute's landing is immediately visible to the untracked
 * reader that forced it (backing commits eagerly; node values fold at flush).
 * FORCE sentinels never surface (they only bump subscribers of accessor
 * keys, which are served by the trap, not the node). */
function nodeValue(node, backing) {
  // Store-only tunnels, ahead of Rule 1: truth authors (authoritativeServe —
  // the projection derive's draft, the write-override continuation) see
  // staged truth and never an override; latest() reaching this untracked
  // path for a store key sees the in-flight parked value like an
  // owner-context reader does (#3075), the visible override first.
  let v;
  if (authoritativeServe()) v = node._pendingValue !== NOT_PENDING ? node._pendingValue : backing;
  else if (latestReadActive)
    v = visibleOverride(node)
      ? unwrapOverride(node._x?._overrideValue)
      : node._pendingValue !== NOT_PENDING
        ? node._pendingValue
        : backing;
  // Otherwise the one slow selection core read() uses (serve): override,
  // lane gate, A28, readerSeesCommitted / A29 — with the BACKING as the
  // committed value (single-home rule, O6).
  else v = serve(node, readerContext(), node._firewall || node, backing);
  return v === FORCE ? backing : v;
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
 * writer composes on hasActiveOverride, truth authors on the backing. */
function readerOverride(node, committed) {
  return node._config & CONFIG_OVERRIDE_SUPERSEDED
    ? nodeValue(node, committed)
    : unwrapOverride(node._x?._overrideValue);
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
 * non-chained — and is returned as is. Recurses down further chains. */
function resolveChainedRaw(target, key, v) {
  const innerT = target.v[$TARGET];
  if (innerT.ch) {
    const iv = resolveChainedRaw(innerT, key, v);
    return iv === v ? v : wrapNext(iv, innerT, key);
  }
  const owned = lookupTarget$1(v, innerT.fam);
  if (owned !== undefined) return owned.px;
  if ((innerT.v[key] === v || innerT.pb?.[key] === v) && isWrappable(v))
    return wrapNext(v, innerT, key);
  return v;
}
/** Serve an own data key: node-first when a node exists (pending visibility,
 * holds, lanes ride the node); backing otherwise. Chained backings (§7b: the
 * backing IS another store's proxy) serve the read-through value — the outer
 * node is linked only for adoption-swap notification, its value never
 * shadows the live chain. */
function serveDataKey(target, key, backingValue, src, node, accKnown = -1) {
  const chained = target.ch && src === target.v;
  let v = backingValue;
  // §6: on optimistic arrays LENGTH IS A VIEW, not a node value — one home
  // (backing ± presence overrides) for both length and indices makes torn
  // iteration impossible (a length node's value rides different visibility
  // rails than index overrides mid-settle). The node carries subscriptions;
  // its committed `_value` is never served here.
  if (key === "length" && target.fam?.opt === true && !chained && Array.isArray(src)) {
    if (!inDraft(target)) {
      const node = target.n?.length;
      if (node !== undefined) {
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
          const nv = read(node);
          if (hasActiveOverride(node) && !authoritativeServe())
            return nv === FORCE ? src.length : nv;
        } else if (hasActiveOverride(node) && !authoritativeServe()) {
          return nodeValue(node, src.length);
        }
      } else if (getObserver() !== null) {
        read(getNode(target, key, backingValue));
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
    return (
      authoritativeServe() || (inDraft(target) && !draftSeesOverrides(target))
        ? src
        : optHooks.optimisticView(target, src, inDraft(target))
    ).length;
  }
  if (inDraft(target)) {
    // Optimistic drafts before their first write have no pending backing yet;
    // reads must still see the live optimistic view (compose, not clobber —
    // #2951). Once ensurePB runs, the seeded clone carries the view.
    // AUTHORITATIVE drafts (projection derive) never overlay — ensurePB's
    // seeding rule, applied to the read side (#3108).
    if (target.fam?.opt && draftSeesOverrides(target) && !authoritativeServe()) {
      const node = target.n?.[key];
      if (node !== undefined && hasActiveOverride(node))
        v = unwrapOverride(node._x?._overrideValue);
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
      if (node === undefined) node = getNode(target, key, backingValue, accKnown);
      // read()'s plain-signal fast path hoisted over the call (legacy trap
      // parity): READ_SLOW = a global read window or non-plain node.
      let nv = readNodeFast(node);
      if (nv === READ_SLOW) nv = read(node);
      if (!chained || hasActiveOverride(node)) v = nv === FORCE ? backingValue : nv;
    } else if (node !== undefined && (!chained || hasActiveOverride(node))) {
      v = nodeValue(node, backingValue);
    }
  }
  // Shallow stores serve data raw; store-proxy slots get boundary wrappers.
  if (target.s) return serveShallow(target, key, v);
  if (target.ch && !chained && v !== null && typeof v === "object" && v[$TARGET] === undefined)
    v = resolveChainedRaw(target, key, v);
  if (node !== undefined) {
    // Wrap cache (see getNode): only wrappables are ever cached, so a hit
    // skips isWrappable too — pointer-compare replaces both checks.
    if (node.pxv === v && v !== undefined) return draftServe(target, node.px);
    if (!isWrappable(v)) return v;
    const p = wrapNext(v, target, key);
    node.px = p;
    node.pxv = v;
    return draftServe(target, p);
  }
  if (!isWrappable(v)) return v;
  return draftServe(target, wrapNext(v, target, key));
}
/** §6c store-wide status gate for reads that DON'T flow through a node:
 * untracked/raw fallthrough must still throw while the derive is
 * uninitialized (seed invisibility, proj R23) or errored (memo parity).
 * TRACKED reads never call this — store nodes carry `_firewall`, so core
 * read() links the node and throws the firewall's error itself (the node
 * link is what wakes async-memo readers when the landing writes values;
 * the firewall link rides the same read). */
function firewallGate(target) {
  // Own-draft ops are exempt: an async derive's continuation (generator body
  // after an `await`/`yield`) runs OUTSIDE the sync write scope (inDraft is
  // already false), but its draft-proxy traps mark every op with the write
  // override. Those reads are the derive working its own draft (state.push
  // reading .length) — gating them throws NotReadyError back into the derive
  // itself, which the post-await read diagnostic (#2987) then escalates to a
  // reactivity halt. The gate exists for EXTERNAL readers (seed invisibility,
  // proj R23); the derive is the author.
  if (projectionWriteActive || getWriteOverride()) return;
  const fw = target.fam?.node;
  if (fw != null && fw._statusFlags & (STATUS_UNINITIALIZED | STATUS_ERROR)) read(fw);
}
/** latest() pull (#3075): bring the projection computed up to date so the
 * read serves the IN-FLIGHT derivation — signal/memo parity, where core
 * read() routes latest() through a companion that recomputes speculatively.
 * The latest flag is suspended for the recompute (the derive's own reads
 * are normal reads), and latestPullActive marks any adoption it commits as
 * staged (see adoptPB) — the speculative swap must not leak to
 * committed-visibility readers before the flush. */
function pullProjectionForLatest(target) {
  const fw = target.fam.node;
  if (fw == null) return;
  const prevLatest = latestReadActive;
  setLatestReadActive(false);
  const prevPull = latestPullActive;
  latestPullActive = true;
  try {
    prepareComputed(fw, true);
  } finally {
    latestPullActive = prevPull;
    setLatestReadActive(prevLatest);
  }
}
const traps = {
  get(target, key, receiver) {
    // One typeof gates every brand-symbol compare off the hot string path
    // (four symbol comparisons per property read otherwise).
    if (typeof key !== "string") {
      if (key === $TARGET) return target;
      if (key === $PROXY) return receiver;
      if (key === $OWNER) return undefined; // ownership stamp: never a user key
      if (key === $RECORD) return undefined; // a store is no view (see `viewOf`)
      // refresh()/isPending resolve the projection computed through $REFRESH.
      if (key === $REFRESH) return target.fam?.node ?? undefined;
      if (key === $TRACK) {
        if (pendingCheckActive) witnessAffectsMark(target, key);
        if (target.fam !== null && getObserver() === null && !inDraft(target)) firewallGate(target);
        if (!inDraft(target) && getObserver() !== null) {
          read(getKeySetNode(target));
          // Structural chaining (§7b, #2864 / core R21): a chained backing's
          // $TRACK reads through to the INNER store's key-set — structural
          // notifications land on the source's own node, never on this
          // wrapper view's.
          const srcT = readSource(target);
          if (srcT[$TARGET] !== undefined) srcT[$TRACK];
        }
        return undefined;
      }
      // user symbols fall through to the generic path
    }
    if (pendingCheckActive) witnessAffectsMark(target, key);
    if (target.fam !== null && getObserver() === null && !inDraft(target)) firewallGate(target);
    // latest() pull (#3075): store traps never reach core read() without an
    // observer, so bring the projection computed up to date here — signal/
    // memo parity for latest() reads through a projection.
    if (target.fam !== null && latestReadActive && !inDraft(target) && !getWriteOverride())
      pullProjectionForLatest(target);
    const src = readSource(target, key);
    // Overlay delete (#3044): a prototype overlay cannot shadow a delete, so
    // deleted keys are tracked aside and read as absent in the pending view.
    if (target.del !== null && src === target.pb && target.del.has(key)) {
      if (!inDraft(target) && getObserver() !== null) read(getNode(target, key, undefined));
      return undefined;
    }
    // Hot inline case: existing PLAIN node (non-accessor), unchained backing,
    // tracked read of a present data key — the dbmon/uibench effect re-read
    // shape. Skips serveDataKey's frame, the FORCE compare (only accessor
    // keys ever hold the sentinel), and isWrappable for primitives.
    // ONE node-map lookup serves this block and the accessor probe below
    // (nothing between them creates nodes).
    const node0 = target.n?.[key];
    if (target.ch === false && writeScopes === null) {
      const nodeH = node0;
      if (nodeH !== undefined && nodeH.acc !== true && getObserver() !== null) {
        let nv = readNodeFast(nodeH);
        if (nv === READ_SLOW) nv = read(nodeH);
        if (nv === null || typeof nv !== "object") return nv;
        if (target.s) return serveShallow(target, key, nv);
        if (nodeH.pxv === nv) return nodeH.px;
        if (isWrappable(nv)) {
          const p = wrapNext(nv, target, key);
          nodeH.px = p;
          nodeH.pxv = nv;
          return p;
        }
        return nv;
      }
    }
    if (
      asyncTailFlights !== 0 &&
      untrackDepth === 0 &&
      !pendingCheckActive &&
      !inDraft(target) &&
      typeof key === "string" &&
      key !== "then" &&
      getObserver() === null &&
      // Own data keys only: a pending backing inherits unrewritten keys from `v`.
      (Object.prototype.hasOwnProperty.call(src, key) ||
        Object.prototype.hasOwnProperty.call(target.v, key))
    )
      // Once per store per computation: the holder is the root target, so a
      // row walk (`items.map(i => i.name)`) after an await reports the first
      // untracked key it touched, not one warning per row proxy.
      checkPostAwaitRead(
        target.n?.[key],
        storeRoot(target),
        undefined,
        key,
        ((target.fam?.node?._statusFlags ?? 0) & (STATUS_PENDING | STATUS_UNINITIALIZED)) ===
          (STATUS_PENDING | STATUS_UNINITIALIZED)
      );
    // Dev strictRead: untracked store reads in labeled scopes (component
    // bodies, effect callbacks) warn — the value can never update the reader.
    // `then` is exempt: resolving a promise with a store proxy (refresh()'s
    // waiter delivers the store, `Promise.resolve(store)`, `return store`
    // from an async function) makes the engine probe `.then` for
    // thenable-ness synchronously in the caller's scope. That is not a read
    // the user wrote, and it must neither warn nor escalate to the pending
    // throw — a throw out of promise resolution rejects the promise.
    if (
      strictRead &&
      !inDraft(target) &&
      typeof key === "string" &&
      key !== "then" &&
      getObserver() === null
    ) {
      // Safeguard parity with core read() (#2897): a component-body read of
      // a REFETCHING derived store escalates — the untracked reader can never
      // observe the in-flight update (strict-read matrix, opt R30–R34).
      if ((target.fam?.node?._statusFlags ?? 0) & STATUS_PENDING)
        throwPendingUntrackedRead(strictRead, { nodeName: key });
      warnStrictReadUntracked(strictRead, {
        nodeName: key,
        data: { strictRead, property: key, source: "store" }
      });
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
    let accProbe = -1;
    {
      let acc;
      if (node0 !== undefined) acc = node0.acc === true;
      else if (!inDraft(target) && getObserver() !== null) {
        acc = isOwnAccessor(src, key);
        if (src === (target.pb ?? target.v)) accProbe = acc ? 1 : 0;
      } else acc = false;
      if (acc) {
        if (!inDraft(target) && getObserver() !== null)
          read(node0 ?? getNode(target, key, undefined, accProbe));
        const v = Reflect.get(src, key, receiver);
        if (target.s) return serveShallow(target, key, v);
        return isWrappable(v) ? draftServe(target, wrapNext(v, target, key)) : v;
      }
    }
    // Plain-data fast path: no descriptor allocation per read.
    // Inherited pollution keys are never served (core R30) — checked before
    // the proto-function branch can leak `constructor`. Interned-string
    // compares beat a Set hash on this per-read path. Overlay pending
    // backings chain to the committed backing, so "own in the view" means
    // own on either layer (ownInView) — a genuine prototype method is one
    // that is own on NEITHER.
    const viewOvl = target.ovl && src === target.pb;
    if (
      (key === "constructor" || key === "__proto__" || key === "prototype") &&
      !hasOwn.call(src, key) &&
      !(viewOvl && hasOwn.call(target.v, key))
    )
      return undefined;
    let v = src[key];
    if (
      v === undefined ? !hasOwn.call(src, key) && !(viewOvl && hasOwn.call(target.v, key)) : false
    ) {
      // Inherited: prototype getters/methods run with the proxy receiver.
      v = Reflect.get(src, key, receiver);
      if (typeof v === "function") return v; // proto methods untracked
      // Reading a currently-absent own key subscribes to it (R12) — for any
      // target OUTSIDE its own draft scope, even mid-setter (#3037, above).
      if (v === undefined && !inDraft(target)) {
        if (getObserver() !== null) read(getNode(target, key, undefined, accProbe));
        const node = target.n?.[key];
        if (node) {
          const nv = nodeValue(node, undefined);
          if (target.s) return serveShallow(target, key, nv);
          return isWrappable(nv) ? draftServe(target, wrapNext(nv, target, key)) : nv;
        }
      } else if (
        v === undefined &&
        inDraft(target) &&
        target.fam?.opt &&
        draftSeesOverrides(target) &&
        // AUTHORITATIVE drafts (landing folds) never seed from overrides —
        // the caller's optimism is not truth (has-trap twin below).
        !authoritativeServe()
      ) {
        const node = target.n?.[key];
        // The draft is a WRITER channel (hasActiveOverride's rule): it
        // composes on the tick's own unflushed adds, as the has trap's draft
        // arm, visibleKeys and optimisticView do. Reader-gating this arm
        // (visibleOverride) made a second setter in the same action read
        // `undefined` where the first had pushed a row (#3665, rc.9).
        if (node !== undefined && hasActiveOverride(node))
          v = unwrapOverride(node._x?._overrideValue);
      }
      if (target.s) return serveShallow(target, key, v);
      return isWrappable(v) ? draftServe(target, wrapNext(v, target, key)) : v;
    }
    if (
      typeof v === "function" &&
      !hasOwn.call(src, key) &&
      !(viewOvl && hasOwn.call(target.v, key))
    )
      return v; // proto method
    return serveDataKey(target, key, v, src, node0, accProbe);
  },
  has(target, key) {
    if (key === $TARGET || key === $PROXY || key === $TRACK) return true;
    if (key === $OWNER || key === $RECORD) return false;
    if (pendingCheckActive) witnessAffectsMark(target, key);
    if (target.fam !== null && getObserver() === null && !inDraft(target)) firewallGate(target);
    const src = readSource(target, key);
    let present = key in src;
    // Overlay deletes read as absent in the pending view (#3044).
    if (present && target.del !== null && src === target.pb && target.del.has(key)) present = false;
    if (!inDraft(target)) {
      if (getObserver() !== null) {
        const node = getHasNode(target, key, present);
        // Authoritative-view readers get the right answer for free: core read()
        // skips the override arm for them, so nv is authoritative presence.
        const nv = read(node);
        if (hasActiveOverride(node)) present = !!nv;
      } else if (!authoritativeServe()) {
        const node = target.h?.[key];
        // The get trap's untracked selection (nodeValue → serve), so `in`
        // agrees with the tracked branch above and with `get`: a presence
        // override the landing superseded (#3331 — an optimistic delete
        // whose slot the truth refilled) answers the staged truth for a
        // deriving reader. Reading the override directly said "absent" while
        // `get` served the landed row, and HasProperty-driven copies (slice,
        // spread, map) left a hole (F5 `differ: delete *`).
        if (node !== undefined && hasActiveOverride(node)) present = !!nodeValue(node, present);
      }
    } else if (target.fam?.opt && draftSeesOverrides(target) && !authoritativeServe()) {
      const node = target.h?.[key];
      if (node !== undefined && hasActiveOverride(node))
        present = !!unwrapOverride(node._x?._overrideValue);
    }
    return present;
  },
  ownKeys(target) {
    if (pendingCheckActive) witnessAffectsMark(target);
    if (target.fam !== null && getObserver() === null && !inDraft(target)) firewallGate(target);
    if (!inDraft(target) && getObserver() !== null) read(getKeySetNode(target));
    return visibleKeys(target, readSource(target));
  },
  getOwnPropertyDescriptor(target, key) {
    if (key === $OWNER || key === $RECORD) return undefined;
    // A descriptor read is a PRESENCE read: it subscribes to the key's
    // presence node and witnesses affects()/isPending() exactly as `in` does
    // (structural oracle, 2026-09-17 — the trap read no node before, so a
    // render effect inspecting a key through getOwnPropertyDescriptor never
    // re-ran for an optimistic add or delete, and an isPending() probe over
    // it witnessed nothing). The value it reports rides the value node's
    // view through visibleDescriptor.
    //
    // EXCEPT for an enumerator (#3664): Object.keys / for...in / spread /
    // Object.entries / JSON.stringify take this trap once per key right
    // after `ownKeys`, which already subscribed the observer to the key-set
    // node — and that node bumps on every membership change, committed or
    // optimistic, so a presence node per key adds nothing the enumerator
    // can observe (rc.9 birthed one per key per object: ~640 B and a graph
    // node each, 10x the memory of a 30-key row's reader). When the
    // observer holds the key-set node in THIS pass, skip the presence read;
    // a lone descriptor read keeps its per-key precision.
    if (pendingCheckActive) witnessAffectsMark(target, key);
    const obs = getObserver();
    if (target.fam !== null && obs === null && !inDraft(target)) firewallGate(target);
    const src = readSource(target, key);
    const desc = visibleDescriptor(target, src, key);
    if (!inDraft(target) && obs !== null && !observerHoldsKeySet(target, obs)) {
      // The node is born from the source's presence (as `has` births it),
      // not the override-adjusted answer.
      let present = key in src;
      if (present && target.del !== null && src === target.pb && target.del.has(key))
        present = false;
      read(getHasNode(target, key, present));
    }
    if (desc === undefined) return undefined;
    // Array targets carry a real non-configurable `length` the proxy
    // invariant forces us to report faithfully; everything else reports
    // configurable via target indirection (core R51).
    if (!(key === "length" && Array.isArray(target))) desc.configurable = true;
    return desc;
  },
  set(target, key, value) {
    // Writes require the target's draft scope OR the projection write
    // override (post-await async draft writes arrive outside any window);
    // everything else is silently ignored (R23).
    const draft = inDraft(target);
    const override = !draft && getWriteOverride();
    if (!draft && !override) return true;
    if (key === "__proto__") return true; // pollution guard (core R30)
    // Unwrap BEFORE ensurePB: unwrapValue materializes a self-referencing
    // draft's overlay (replacing target.pb), so a pb local captured earlier
    // would be the abandoned overlay and the write would vanish.
    // Shallow slots store what was written VERBATIM — another store's proxy
    // passes through by reference (#2932; markRawOne skips proxies), while
    // deep stores unwrap to raw backings.
    const uv = target.s ? value : unwrapValue(value);
    const pb = ensurePB(target);
    pendingNotify.add(target);
    // Array length writes implicitly delete indices — the written-keys bound
    // can't see them, so poison to the full scan for this batch. Index
    // writes implicitly GROW length, so arrays always record it alongside.
    if (Array.isArray(pb)) {
      if (key === "length") target.wk = WK_ALL;
      else if (target.wk !== WK_ALL) {
        const wk = (target.wk ??= new Set());
        wk.add(key);
        wk.add("length");
      }
    } else {
      if (target.wk !== WK_ALL) (target.wk ??= new Set()).add(key);
      // Live own-key estimate for the overlay/clone choice (#3360) and the
      // overlay's commit choice (#3689): `in` sees through an overlay to the
      // committed keys, so this counts keys NEW to the container. Overlay
      // deletes are counted down when they commit (`del` is exact); clone-
      // path deletes are not (a stale high count on a narrow container only
      // picks the overlay a little early).
      if (!(key in pb)) target.kc++;
    }
    // Own data keys literally named "prototype"/"constructor" land as data —
    // defineProperty sidesteps a proto-chain setter named the same.
    if (UNSAFE_KEYS.has(key)) {
      Object.defineProperty(pb, key, {
        value: uv,
        writable: true,
        enumerable: true,
        configurable: true
      });
      if (target.del !== null) target.del.delete(key);
      return true;
    }
    // Overlay first-write DEFINES the own key: assignment through the proto
    // chain would reject on a non-writable committed property (the clone
    // path normalized descriptors for exactly this — R51 parity). A
    // plain-data-graded backing (sc 2, owned: every slot writable) takes the
    // bare assignment — it lands as an own key on the overlay all the same.
    if (target.ovl && target.sc !== 2 && !hasOwn.call(pb, key)) {
      Object.defineProperty(pb, key, {
        value: uv,
        writable: true,
        enumerable: true,
        configurable: true
      });
    } else pb[key] = uv;
    if (target.del !== null) target.del.delete(key);
    // Shallow ingest: written records are sticky raw-marked (one entity is
    // never both deep-wrapped and raw — R41/#2932, shared invariant).
    if (target.s && uv !== null && typeof uv === "object") markRawOne(uv);
    // Override-mode (post-await draft) writes have no setter exit — notify
    // per-op (setSignal equality-gates repeats).
    if (override) notifyWrites(target);
    return true;
  },
  defineProperty(target, key, desc) {
    const draft = inDraft(target);
    const override = !draft && getWriteOverride();
    if (!draft && !override) return true;
    if (key === "__proto__") return true;
    if (desc.get || desc.set) target.a = true;
    // Unwrap before ensurePB (see the set trap: self-reference materializes).
    if ("value" in desc) desc = { ...desc, value: unwrapValue(desc.value) };
    const pb = ensurePB(target);
    // A non-default data descriptor (or an accessor) leaves the plain-data
    // grade: the key reaches the committed backing as defined, so the spread
    // clone and bare-assignment paths no longer describe it.
    if (target.a || !(desc.enumerable && desc.writable && desc.configurable)) target.sc = 1;
    pendingNotify.add(target);
    if (target.wk !== WK_ALL) (target.wk ??= new Set()).add(key);
    Object.defineProperty(pb, key, desc);
    if (target.del !== null) target.del.delete(key);
    if (override) notifyWrites(target);
    return true;
  },
  deleteProperty(target, key) {
    const draft = inDraft(target);
    const override = !draft && getWriteOverride();
    if (!draft && !override) return true;
    const pb = ensurePB(target);
    pendingNotify.add(target);
    if (target.wk !== WK_ALL) (target.wk ??= new Set()).add(key);
    delete pb[key];
    // A prototype overlay cannot shadow a delete of a committed key —
    // record it aside (#3044); reads/has/ownKeys/commit consult the set.
    if (target.ovl && hasOwn.call(target.v, key)) (target.del ??= new Set()).add(key);
    if (override) notifyWrites(target);
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
 * holds as the fold's result (A34 amendment, #3612; core heldDerivation). */
let derivedSetter = null;
let heldDerivationHit = false;
/** The derived store's setter (CS-R31): within a synchronous frame the manual
 * write wins — the projection's recompute is masked for the tick. Across a
 * hold the write is not a proposal: a leaf the fold staged under another
 * transaction re-runs the fold under it, the write being the draft's prior
 * state (#3612). Decided from the leaf notifications, so the mask lands
 * after them (in the `finally`: a throwing setter's writes before the throw
 * were notified, and are masked as before). */
function derivedStoreWrite(node, proxy, fn) {
  derivedSetter = node;
  heldDerivationHit = false;
  try {
    storeSetterNext(proxy, fn);
  } finally {
    derivedSetter = null;
    heldDerivationHit ? rederiveHeld(node) : suppressComputedRecompute(node);
  }
}
function storeSetterNext(proxy, fn, guard = true) {
  if (guard) devGuardStoreSetterWrite();
  const target = proxy[$TARGET];
  const prevScopes = writeScopes;
  writeScopes = new Set();
  writeScopes.add(scopeKey(target));
  writing++;
  let result;
  try {
    // No untrack: the writing flag already disables store-node linking
    // (draft reads never self-track, proj R2), while EXTERNAL reads (signals
    // inside a projection derive) must keep tracking — they are the derive's
    // dependencies.
    result = fn(proxy);
  } finally {
    writing--;
    writeScopes = prevScopes;
    // Outermost setter exit: emit write-time notifications (setSignal per
    // changed observed key) so transition holds and lanes engage now.
    if (writing === 0 && pendingNotify.size) {
      const touched = [...pendingNotify];
      pendingNotify.clear();
      for (const t of touched) notifyWrites(t);
    }
  }
  // After the sync writes have notified (they were real, like an effect's
  // side effects before its invalid-cleanup throw) and before adoption.
  if (guard) devGuardStoreSetterResult(result);
  if (result !== undefined && result !== proxy && isWrappable(result)) {
    // Returned replacement: on an optimistic family (outside authoritative
    // writes) the replacement is itself an optimistic edit — diff it against
    // the visible view as engine writes (reverts at settle). Otherwise it is
    // an adoption of the incoming object (unowned).
    if (target.fam?.opt && !projectionWriteActive && !getWriteOverride()) {
      optHooks.notifyOptimisticWrites(target, unwrapValue(result));
    } else {
      adoptPB(target, unwrapValue(result));
    }
  }
  if (writing === 0 && heldAdoptions.size) stageHeldAdoptions();
}
// Affects integration: the legacy affects machinery reads next targets
// structurally (aliased field names); only node CREATION dispatches here.
setNextAffectsNodeResolver((t, key) =>
  key === $AFFECTS ? getNode(t, $AFFECTS, undefined) : getNode(t, key, (t.pb ?? t.v)[key])
);
function createStoreNext(initialValue, shallow = false) {
  if (shallow && true) {
    // Never both deep-wrapped and raw (R41/R44): a value already tracked as
    // a DEEP store cannot be ingested shallow.
    const existing = lookupTarget$1(initialValue, null);
    if (existing !== undefined && !existing.s)
      throw new Error("createStore({ shallow }): value is already tracked as a deep store");
    if (initialValue[$TARGET])
      throw new Error("createStore({ shallow }): value is already a store proxy");
  }
  const proxy = wrapNext(initialValue);
  if (shallow) {
    proxy[$TARGET].s = true;
    markRawIngest(initialValue);
  }
  {
    const owner = getOwner();
    // Dev-tier graph registration (owner signal lists, onGraph); the
    // `_owner` write itself never reaches the proxy, see storeOwners.
    registerGraph(proxy, owner);
    // Only once the engine is installed, like the node stamping it feeds: a
    // WeakMap.set per fresh store is a growing ephemeron table (~+35% on the
    // 2000-store create+commit shape, CodSpeed −11.7% on #3380's first cut)
    // and, disabled, buys nothing — a store created before enable() has no
    // excluded owner to inherit either way.
    // The declared name is the public `createStore`'s to record (`nameStore`,
    // same gate) — a parameter here would survive into the prod artifact.
    if (attrHooks !== null) storeOwners.set(proxy[$TARGET], owner);
  }
  const setter = fn => storeSetterNext(proxy, fn);
  return [proxy, setter];
}
// ---------------------------------------------------------------------------
// snapshot (next targets): the backing IS the plain raw graph — zero copy.
// Sees pending (R27) by reading pb. Chained/owned-copy caching lands with the
// utilities increment; this covers the createStore-suite contract.
/** True when `proxy` is a SHALLOW store (children served verbatim, slots
 * replaced by reference — #2932). The list driver uses this to choose the
 * slot-patch channel (collected row bodies) over per-record registration. */
function storeIsShallow(proxy) {
  const t = proxy?.[$TARGET];
  return t !== undefined && t.s === true;
}
/** True when `proxy` belongs to a projection/optimistic FAMILY. The list
 * driver must DECLINE family arrays (external audit finding): family
 * structural changes never emit row/slot ops (the setter channel is
 * fam-gated; optimistic writes ride node overrides), and the proxy identity
 * is stable so the each-watch cannot catch the change either — an engaged
 * list would freeze on optimistic/projection structural updates. Record-
 * level family patches are unaffected (they have their own emission). */
function storeHasFamily(proxy) {
  const t = proxy?.[$TARGET];
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
 * emission mirroring emitPatchOptimistic, plus revert resync. */
function storeHasOptimisticFamily(proxy) {
  const t = proxy?.[$TARGET];
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
 * (until()'s predicate, truth-author drafts) skip the overlay. */
function visibleKeys(target, src) {
  let keys;
  if (target.ovl && src === target.pb) {
    // Overlay merge (#3044): committed keys in their order, then this
    // batch's NEW keys, minus deletes.
    keys = Reflect.ownKeys(target.v);
    const del = target.del;
    if (del !== null && del.size !== 0) keys = keys.filter(key => !del.has(key));
    for (const key of Reflect.ownKeys(src)) {
      if (!hasOwn.call(target.v, key)) keys.push(key);
    }
  } else keys = Reflect.ownKeys(src);
  // Drop the $OWNER stamp (owned backings carry it as an own enumerable
  // symbol). Symbols enumerate last, so the scan stops at the first string.
  for (let i = keys.length - 1; i >= 0 && typeof keys[i] === "symbol"; i--) {
    if (keys[i] === $OWNER) {
      keys.splice(i, 1);
      break;
    }
  }
  if (
    !authoritativeServe() &&
    target.fam?.opt &&
    target.h !== null &&
    (!inDraft(target) || draftSeesOverrides(target))
  ) {
    let set = null;
    const draft = inDraft(target);
    for (const key of Reflect.ownKeys(target.h)) {
      const node = target.h[key];
      if (!(draft ? hasActiveOverride(node) : visibleOverride(node))) continue;
      set ??= new Set(keys);
      // Reader arm: a superseded presence override answers as `in` does
      // (readerOverride, #3331) — Object.keys listed one row fewer than the
      // traps served after a landing refilled an optimistically deleted slot.
      const present = draft
        ? unwrapOverride(node._x?._overrideValue)
        : readerOverride(node, set.has(key));
      if (present) set.add(key);
      else set.delete(key);
    }
    if (set !== null) return [...set];
  }
  return keys;
}
/** The data/accessor descriptor visible for `key` on `target` served from
 * `src`: overlay (#3044 — unwritten keys live on the committed backing,
 * deleted keys are absent) and optimistic presence overrides (an opt delete
 * hides the key; an opt add synthesizes a data descriptor from the value
 * node). `configurable` is the trap's concern (proxy invariant). */
function visibleDescriptor(target, src, key) {
  let desc = Object.getOwnPropertyDescriptor(src, key);
  if (target.ovl && src === target.pb) {
    if (target.del !== null && target.del.has(key)) return undefined;
    if (desc === undefined) desc = Object.getOwnPropertyDescriptor(target.v, key);
  }
  // Draft arm, the twin of visibleKeys' (#3665): a draft still composing on
  // the live view (no view-seeded backing yet) serves the writer rule
  // (hasActiveOverride); once ensurePB has seeded the draft's own backing,
  // `src` carries the view. Without it ownKeys listed a key the descriptor
  // reported absent, and every enumerator — Object.keys, spread, entries,
  // JSON.stringify, deep() — dropped the row a previous setter had added.
  const draft = inDraft(target);
  if (!authoritativeServe() && target.fam?.opt && (!draft || draftSeesOverrides(target))) {
    const node = target.h?.[key];
    if (node !== undefined && (draft ? hasActiveOverride(node) : visibleOverride(node))) {
      // Reader arm: presence as `in` serves it (readerOverride, #3331).
      const present = draft
        ? unwrapOverride(node._x?._overrideValue)
        : readerOverride(node, desc !== undefined);
      if (!present) return undefined; // opt delete
      if (desc === undefined) {
        const vn = target.n?.[key];
        return {
          // In a draft the value is the override itself (nodeValue routes
          // through serve — the reader rule — and would answer undefined).
          value:
            vn === undefined
              ? undefined
              : draft
                ? hasActiveOverride(vn)
                  ? unwrapOverride(vn._x?._overrideValue)
                  : undefined
                : nodeValue(vn, undefined),
          writable: true,
          enumerable: true,
          configurable: true
        };
      }
    }
  }
  return desc;
}
/** Tracking deep snapshot (`deep()` for next targets): subscribes to the
 * key-set and deep-witness node at every reachable level, then returns the
 * plain view. Shared references and cycles handled via the visited set. */
function deepNext(value) {
  const t0 = value?.[$TARGET];
  if (t0 === undefined || t0.px !== value) return value;
  const visited = new Set();
  // One membership node + one deep-witness node PER RECORD (legacy $TRACK
  // parity): the walk stays O(records) in subscriptions instead of O(paths)
  // in per-key nodes, and it walks TARGETS directly — no per-child proxy
  // round-trip (wrapNext → proxy → $TARGET trap) on the re-walk every
  // effect run performs.
  // Resolve `child` (a raw or a stored proxy found under `t`) to the target
  // that `t`'s family serves for it — created on first visit, as the get trap
  // would. Undefined = leaf (unwrappable or raw-marked).
  const childTarget = (t, child, key) => {
    let ct = lookupTarget$1(child, t.fam);
    if (ct === undefined) {
      if (!isWrappable(child)) return undefined;
      wrapNext(child, t, key);
      // Stored proxies (chained slots) that this family passes through
      // resolve to their own target.
      ct = lookupTarget$1(child, t.fam) ?? child[$TARGET];
    }
    return ct;
  };
  const walkT = t => {
    const src = readSource(t);
    if (visited.has(src)) return;
    visited.add(src);
    read(getKeySetNode(t));
    read(getDeepNode(t));
    // Chained backing (§7b): the committed backing IS another store's proxy.
    // Writes to the inner store bump the INNER record's witnesses; this
    // target's k/dk hear only its own family's writes (optimistic overrides).
    // Read through the whole chain — the $TRACK trap's rule (#2864 / R21)
    // applied to deep() (#3323). From `t.v`, not `src`: a pending backing is a
    // raw clone and would hide the chain. Non-chained targets pay one flag.
    for (let it = t; it.ch; ) {
      it = it.v[$TARGET];
      read(getKeySetNode(it));
      read(getDeepNode(it));
    }
    // Keys and children exactly as the traps serve them — the overlay merge
    // (#3044/#3283: a bare ownKeys over a pending backing mid-flush dropped
    // every untouched child from the re-subscribing effect's dependencies)
    // and optimistic presence overrides (a row added under a held action
    // lives in `h`/`n`, not the committed backing; the walk never reached its
    // record, so deep() was deaf to every write on it until settle).
    const opt = t.fam?.opt === true;
    for (const key of visibleKeys(t, src)) {
      const desc = visibleDescriptor(t, src, key);
      if (desc === undefined) continue;
      if (desc.get || desc.set) {
        t.a = true;
        continue; // accessors track through their own reads when invoked
      }
      let child = desc.value;
      // An active value override on an optimistic node shadows the backing's
      // child (an optimistic replacement `d[i] = {...}`) — follow what reads
      // serve, as nodeValue's leading arm does.
      if (opt) {
        const vn = t.n?.[key];
        if (vn !== undefined && hasActiveOverride(vn) && !authoritativeServe())
          child = unwrapOverride(vn._x._overrideValue);
      }
      if (child === null || typeof child !== "object") continue;
      // Through a chain the descriptor yields the INNERMOST raw: resolve it to
      // the inner family's proxy so this level wraps the chained `view[i]` the
      // get trap serves, never a fresh non-chained wrapper of the base raw.
      if (t.ch && child[$TARGET] === undefined) child = resolveChainedRaw(t, key, child);
      const ct = childTarget(t, child, key);
      if (ct === undefined) continue; // raw-marked: leaf by contract
      walkT(ct);
    }
  };
  walkT(t0);
  return snapshotNext(value);
}
/**
 * Snapshot with per-object registration resolution (RUL-12 DAG ruling): every
 * reachable wrappable resolves through its target's CURRENT backing, so
 * privatized subtrees are seen through any parent path. Identity-preserving:
 * a subtree with no substitutions below returns its own object (zero copy for
 * settled, never-diverged graphs).
 */
function snapshotNext(value) {
  const t = value?.[$TARGET];
  return snapshotWalk(value, new Map(), t?.fam ?? null);
}
function snapshotWalk(value, seen, fam) {
  if (value === null || typeof value !== "object") return value;
  // Resolve through the registration: proxies AND raws map to their target's
  // current backing (stale raw pointers through other parents resolve here).
  // Loops for chained backings (§7b: a projection's backing can be another
  // store's proxy — snapshot unwraps to the base raw).
  let src = value;
  // Chained backings can pass through several targets; optimistic overrides
  // on OUTER targets shadow the chain (§7b), so collect every opt target
  // encountered and compose their views over the resolved base, innermost
  // outward.
  let optOwners = null;
  for (let entry = true; ; entry = false) {
    const viaProxy = src?.[$TARGET]?.v !== undefined;
    let t = viaProxy ? src[$TARGET] : undefined;
    if (t === undefined && fam !== null) t = lookupTarget$1(src, fam);
    if (t === undefined) t = lookupTarget$1(src, null);
    if (t === undefined) break;
    // Entering a level from a RAW below a chained family: the raw resolves to
    // the INNER store's target, but this family's wrapper for it — keyed by
    // the inner proxy, §7b — is where the outer overrides live. Start from
    // the wrapper so they compose (#3323: a nested optimistic write on a view
    // row was served by reads but missing from deep()/snapshot()). Entry only:
    // the descent then runs wrapper → inner → raw and terminates.
    if (entry && !viaProxy && fam !== null && t.fam !== fam) {
      const outer = fam.map.get(t.px);
      if (outer !== undefined) t = outer;
    }
    if (t.fam !== null) fam = t.fam;
    if (t.fam?.opt === true) (optOwners ??= []).push(t);
    // The shared visibility decision (#3147): the speculative peek serves
    // pending staging, but a HELD landing is masked to committed exactly as
    // it is for per-key readers — the two families must answer alike while
    // a transaction holds store landings.
    const usePB = pendingBackingVisible(t, true);
    // Snapshot runs mid-flush (tracked memos execute before commit), so a
    // pending prototype overlay must present as a REAL merged container.
    if (usePB && t.ovl) materializePB(t);
    const backing = usePB ? t.pb : t.v;
    if (backing === src) break;
    src = backing;
  }
  if (!isWrappable(src)) return src;
  // Optimistic families: compose the visible view; a composed view is a fresh
  // object and snapshots via the owned/copy path (pinned `not.toBe` identity).
  if (optOwners !== null) {
    let view = src;
    for (let i = optOwners.length - 1; i >= 0; i--) {
      const o = optOwners[i];
      // Draft twin (#3665): deep()/snapshot() inside a setter is the writer's
      // channel and composes on the tick's own unflushed adds
      // (hasActiveOverride). A draft that has seeded its own backing from
      // the view already carries them in `src` — composing again would
      // clobber the draft's later writes with the overrides they superseded.
      const draft = inDraft(o);
      if (draft && !draftSeesOverrides(o)) continue;
      view = optHooks.optimisticView(o, view, draft);
    }
    if (view !== src) {
      const cachedView = seen.get(src);
      if (cachedView !== undefined) return cachedView;
      const isArr = Array.isArray(view);
      const copy = isArr ? [] : Object.create(Object.getPrototypeOf(view));
      seen.set(src, copy);
      for (const key of Reflect.ownKeys(view)) {
        if ((isArr && key === "length") || key === $OWNER) continue;
        const cv = view[key];
        copy[key] = cv !== null && typeof cv === "object" ? snapshotWalk(cv, seen, fam) : cv;
      }
      if (isArr) copy.length = view.length;
      return copy;
    }
  }
  const cached = seen.get(src);
  if (cached !== undefined) return cached;
  // OWNED (written) subtrees snapshot as copies (§7b: identity is only for
  // subtrees "unmodified relative to source"): non-enumerable symbols are
  // excluded (recon-snap R29), and the copy registers BEFORE descent so
  // cycles keep identity (FINDING-3).
  if (isOwned(src)) {
    const isArr = Array.isArray(src);
    const copy = isArr ? [] : Object.create(Object.getPrototypeOf(src));
    seen.set(src, copy);
    for (const key of Reflect.ownKeys(src)) {
      if ((isArr && key === "length") || key === $OWNER) continue;
      const desc = Object.getOwnPropertyDescriptor(src, key);
      if (typeof key === "symbol" && !desc.enumerable) continue;
      if (desc.get || desc.set) {
        Object.defineProperty(copy, key, desc);
        continue;
      }
      const cv = desc.value;
      const walked = cv !== null && typeof cv === "object" ? snapshotWalk(cv, seen, fam) : cv;
      if (desc.enumerable && desc.writable && desc.configurable) copy[key] = walked;
      else Object.defineProperty(copy, key, { ...desc, value: walked });
    }
    if (isArr && copy.length !== src.length) copy.length = src.length;
    return copy;
  }
  // UNOWNED (shared/user) subtrees keep identity unless a descendant
  // substituted; copy-on-substitution preserves the documented CoW contract.
  seen.set(src, src);
  let copy = null;
  for (const key of Reflect.ownKeys(src)) {
    const desc = Object.getOwnPropertyDescriptor(src, key);
    if (!desc || desc.get || desc.set) continue;
    const cv = desc.value;
    if (cv === null || typeof cv !== "object") continue;
    const walked = snapshotWalk(cv, seen, fam);
    if (walked !== cv) {
      if (copy === null) {
        copy = Array.isArray(src)
          ? [...src]
          : Object.create(Object.getPrototypeOf(src), Object.getOwnPropertyDescriptors(src));
        seen.set(src, copy);
      }
      copy[key] = walked;
    }
  }
  return copy ?? src;
}

/**
 * Store rewrite — reconcile, the adoption channel (INTERNALS-STORE-STATE.md
 * §3, decision 2026-08-16c). Reconcile never merge-writes: it adopts `next`
 * as the authoritative pending backing at every proxied level (pointer swap
 * folded at flush commit), notification riding the fold's descriptor diff.
 *
 * Structural optimizations (all kept, per 2026-08-17 morning ruling):
 * - Identity skip with completed proof: `incoming === backing && !owned` —
 *   sound because input is immutable by convention (R2a) and ownership marks
 *   the only writer the convention doesn't cover (us). Fixes FINDING-1.
 * - Reachability pruning: descent happens only where a child TARGET exists
 *   (proxies exist only where read) — never-subscribed subtrees are never
 *   walked (recon-snap R17), while a subscriber deep below an untracked path
 *   keeps its chain walkable because wrapping created the intermediate
 *   targets (recon-snap R16).
 * - Keyed matching ported semantics: key-matched rows keep proxy identity;
 *   key mismatch detaches (fresh proxy on next read, recon-snap R18);
 *   keyless items fall back positional; null/primitive slots are legal
 *   members (R11). Kind changes replace wholesale (R10).
 */
function reconcileNextState(value, state, key, replace = false) {
  if (state == null) throw new Error("Cannot reconcile null or undefined state");
  const t = state?.[$TARGET];
  if (t === undefined || t.px !== state) throw new Error("reconcile target is not a store proxy");
  // Reconcile's diff walks need a REAL pending container — a prototype
  // overlay (#3044) materializes to the clone path first (edge: reconcile
  // inside a setter that already wrote this target).
  if (t.ovl) materializePB(t);
  let keyFn = key === null ? null : typeof key === "string" ? item => item?.[key] : key;
  // §7b chained backing: a projection derive returning a LIVE store proxy
  // adopts the proxy itself as the backing — reads flow through the inner
  // store's traps, so consumers subscribe to the inner graph and updates
  // flow with no re-derive (#2941). The adoption diff still notifies THIS
  // store's existing subscribers of the swap.
  if (replace && value !== state && value?.[$TARGET] !== undefined) {
    const prev = t.pb ?? t.v;
    if (prev === value) return; // already chained to this store
    adoptPB(t, value);
    return;
  }
  const incoming = unwrapValue(value);
  if (keyFn) {
    // Root identity precondition — checked before ANY mutation, so a throwing
    // reconcile is atomic by construction (RUL-12 ruling). Projections
    // (replace=true) relax it: a root entity change merges in place — the
    // root proxy is stable for life (proj R5/R11) — and children are NOT
    // key-matched across the entity change (proj R7: keyFn drops to
    // positional so old-entity subtrees never merge into the new entity's).
    const prev = t.pb ?? t.v;
    const eq = keyFn(prev);
    if (eq !== undefined && !sameKey(keyFn(incoming), eq)) {
      if (!replace) throw new Error("Cannot reconcile states with different identity");
      // Entity change: wholesale swap. The root proxy is stable for life
      // (proj R5) but NOTHING below survives — children are never matched
      // across an entity change even when their own keys align (proj R7).
      // Displaced-raw unregistration (proj R10): the outgoing raw stops
      // resolving to this proxy; re-handed later it wraps fresh.
      const out = t.pb ?? t.v;
      if (isOwned(out))
        delete out[$OWNER]; // disown: wraps fresh if re-handed
      else (t.fam?.map ?? storeNextLookup).delete(out);
      adoptPB(t, incoming);
      return;
    }
  }
  // Tentative channel (§6b, RUL-5): a user-context reconcile on an optimistic
  // family parks as engine overrides — values, membership, and length ride
  // armed nodes (reverting with their transaction); committed raw is never
  // touched. Key-matched rows keep proxy identity by descending into the
  // existing child targets instead of overriding their parent slots.
  if (t.fam?.opt === true && !projectionWriteActive && !getWriteOverride()) {
    optHooks.applyTentative(t, incoming, keyFn);
    return;
  }
  applyAdopt(t, incoming, keyFn, replace);
}
function applyAdopt(t, incoming, keyFn, proj = false) {
  const prev = t.pb ?? t.v;
  // The sound identity skip (O7): same reference AND we never diverged it.
  if (incoming === prev && !isOwned(prev)) return;
  const fam = t.fam;
  // §6b (R28): the diff's previous-arrangement baseline is the LANE VIEW —
  // optimistic rows must be visible to key matching so a landing carrying the
  // same key recycles their proxies. Raw `prev` keeps the identity/ownership
  // roles above; only matching reads the view.
  const prevView = fam?.opt === true ? optHooks.optimisticView(t, prev) : prev;
  const nextArr = Array.isArray(incoming);
  // Plain stores notify inline AFTER the descent (child registrations feed
  // the fold diff's identity-preservation check); projections keep deferred
  // folds (downstream holds can form later in the flush).
  const eager = fam === null;
  const shallow = t.s === true;
  // Node-notify base is the view the nodes were last told (#3296): a draft
  // preceding this reconcile already moved them to its pending backing at
  // setter exit (prev, materialized above), so diffing incoming against the
  // committed backing would skip a key the draft changed and the reconcile
  // restores — the node would commit the superseded draft value.
  const old = prev;
  adoptPB(t, incoming, eager);
  // Shallow adoption: records are slot values — sticky raw-mark the incoming
  // set (R41) and never descend; slot notification is the positional diff.
  if (shallow) markRawIngest(incoming);
  if (Array.isArray(prevView) !== nextArr) {
    if (eager) notifyFold(t, old, incoming);
    return;
  }
  if (nextArr) {
    const prevRows = prevView;
    const nextRows = incoming;
    // Fused array walk (eager mode): per-index notification rides the same
    // loop as the descent (descend first — targetsEqual needs the child's
    // re-registration, R9). Length, trailing removed indexes, and any other
    // unvisited node keys land in the counted sweep below.
    const nodes = eager ? t.n : null;
    let nodesHit = 0;
    if (keyFn && !shallow) {
      // Positional-prefix fast path (legacy keyedMatch-walk parity): while
      // rows key-match in place — the steady-state polling shape — descend
      // directly with zero staging. The prevByKey map is built only for the
      // misaligned remainder, and never at all on aligned ticks.
      const plen = prevRows.length;
      const nlen = nextRows.length;
      let dkBumpedA = false;
      let i = 0;
      for (const end = Math.min(plen, nlen); i < end; i++) {
        const nv = nextRows[i];
        const pvRaw = prevRows[i];
        // Routing heuristic only (aligned vs keyed remainder) — both routes
        // notify identically and descend() is the one authoritative
        // validator, so bare typeof gates suffice here; full isWrappable
        // per row was the walk's dominant residual cost.
        if (
          pvRaw !== nv &&
          !(
            pvRaw !== null &&
            typeof pvRaw === "object" &&
            nv !== null &&
            typeof nv === "object" &&
            sameKey(keyFn(pvRaw), keyFn(nv))
          )
        )
          break; // misaligned: fall to the keyed remainder below
        // Identity skip inline (FINDING-1 guard), then descend the pair.
        if (
          (pvRaw !== nv || (nv !== null && typeof nv === "object" && isOwned(nv))) &&
          nv !== null &&
          typeof nv === "object"
        )
          descend(unwrapValue(pvRaw), nv, keyFn, fam, proj);
        if (
          t.dk !== null &&
          !dkBumpedA &&
          !(nv !== null && typeof nv === "object" ? targetsEqual(pvRaw, nv) : isEqual(pvRaw, nv))
        ) {
          bumpDeep(t);
          dkBumpedA = true;
        }
        if (nodes !== null) {
          const node = nodes[i];
          if (node !== undefined) {
            nodesHit++;
            notifyKeyValue(node, i, old[i], nv, old, incoming);
          }
        }
      }
      if (t.dk !== null && !dkBumpedA && i < nextRows.length) bumpDeep(t);
      const structStart = i; // misalignment point (== nlen on aligned ticks)
      let prevByKey = null;
      for (; i < nextRows.length; i++) {
        const nv = nextRows[i];
        // typeof gates route; descend validates (same contract as the prefix).
        if (nv !== null && typeof nv === "object") {
          const nk = keyFn(nv);
          let pv;
          if (nk !== undefined) {
            if (prevByKey === null) {
              // Occurrence-aware (re-audit 2, P1-5): duplicate keys queue
              // their prev INDICES (rows can themselves be arrays, so index
              // queues are the unambiguous encoding — same as buildRowOps)
              // and each is consumed ONCE. First-wins would adopt two next
              // rows into the SAME prev target while row ops retain two
              // separate DOM rows (the second one stale).
              prevByKey = new Map();
              // From structStart, not 0 (re-audit 3, P1-2): prefix-aligned
              // rows already adopted their incoming counterparts — re-offering
              // them here let a duplicate key adopt a prefix row AGAIN while
              // row ops (which correctly window from structStart) retained
              // the later occurrence's DOM row against a never-adopted target.
              for (let j = structStart; j < prevRows.length; j++) {
                const p = unwrapValue(prevRows[j]);
                if (p !== null && typeof p === "object") {
                  const pk = keyFn(p);
                  if (pk === undefined) continue;
                  const existing = prevByKey.get(pk);
                  if (existing === undefined) prevByKey.set(pk, j);
                  else if (Array.isArray(existing)) existing.push(j);
                  else prevByKey.set(pk, [existing, j]);
                }
              }
            }
            const m = prevByKey.get(nk);
            if (m === undefined) pv = undefined;
            else if (Array.isArray(m)) {
              pv = unwrapValue(prevRows[m.shift()]);
              if (m.length === 1) prevByKey.set(nk, m[0]);
            } else {
              pv = unwrapValue(prevRows[m]);
              prevByKey.delete(nk);
            }
          } else {
            pv = unwrapValue(prevRows[i]); // keyless item: positional fallback
          }
          descend(pv, nv, keyFn, fam, proj);
        }
        if (nodes !== null) {
          const node = nodes[i];
          if (node !== undefined) {
            nodesHit++;
            notifyKeyDiff(node, i, old, incoming, false);
          }
        }
      }
    } else {
      const dlen = Math.min(prevRows.length, nextRows.length);
      const nlen = nextRows.length;
      let dkBumpedP = false;
      for (let i = 0; i < nlen; i++) {
        const nvP = nextRows[i];
        if (!shallow && i < dlen && nvP !== null && typeof nvP === "object")
          descend(unwrapValue(prevRows[i]), nvP, keyFn, fam, proj);
        if (
          t.dk !== null &&
          !dkBumpedP &&
          !(nvP !== null && typeof nvP === "object"
            ? targetsEqual(prevRows[i], nvP)
            : isEqual(prevRows[i], nvP))
        ) {
          bumpDeep(t);
          dkBumpedP = true;
        }
        if (nodes !== null) {
          const node = nodes[i];
          if (node !== undefined) {
            nodesHit++;
            notifyKeyDiff(node, i, old, incoming, false);
          }
        }
      }
    }
    if (eager) {
      if (nodes !== null && nodesHit < t.nc) {
        for (const key of Reflect.ownKeys(nodes)) {
          // visited indexes are < nextRows.length; everything else sweeps
          const idx = typeof key === "string" ? +key : NaN;
          if (!(idx >= 0 && idx < nextRows.length))
            notifyKeyDiff(nodes[key], key, old, incoming, false);
        }
      }
      notifyFoldTail(t, old, incoming);
    }
    return;
  } else {
    // FUSED adoption walk (eager mode): one pass fetches each key's pair,
    // descends, then notifies its node inline — descend runs FIRST so the
    // child's re-registration is visible to targetsEqual (identity-preserved
    // slots must not notify, R9). This replaces the notifyFold re-walk that
    // doubled dbmon's diff cost. for-in covers own enumerable string keys
    // with no key-array allocation; symbols get a pass only when present.
    const nodes = eager ? t.n : null;
    let nodesHit = 0;
    let dkBumped = false;
    // The per-key body is inlined on purpose (legacy applyStateFast parity:
    // an extracted helper costs a call per key on the hottest object-diff
    // site). Reference-identical values early-continue BEFORE any other
    // work — sound only with the ownership guard (FINDING-1: an owned
    // backing is setter-diverged and must still diff).
    for (const k in incoming) {
      const nv = incoming[k];
      const ov = old[k];
      const isObj = nv !== null && typeof nv === "object";
      if (
        ov === nv &&
        (!isObj || !isOwned(nv)) &&
        (nodes === null || nodes[k] === undefined || !hasAccessorFlag(nodes[k]))
      ) {
        if (nodes !== null && nodes[k] !== undefined) nodesHit++;
        continue;
      }
      if (isObj && !shallow) descend(unwrapValue(prevView[k]), nv, keyFn, fam, proj);
      // Deep-witness (dk): value changes must notify even with NO per-key
      // node — deep() subscribes one node per record. Checked after descend
      // so in-place adoptions (same logical slot) don't bump; child records
      // carry their own witness. One flag + null check when unused.
      if (t.dk !== null && !dkBumped && !(isObj ? targetsEqual(ov, nv) : isEqual(ov, nv))) {
        bumpDeep(t);
        dkBumped = true;
      }
      if (nodes !== null) {
        const node = nodes[k];
        if (node !== undefined) {
          nodesHit++;
          notifyKeyValue(node, k, ov, nv, old, incoming);
        }
      }
    }
    const syms = Object.getOwnPropertySymbols(incoming);
    for (let i = 0; i < syms.length; i++) {
      const k = syms[i];
      if (k === $OWNER) continue;
      const nv = incoming[k];
      if (!shallow && nv !== null && typeof nv === "object")
        descend(unwrapValue(prevView[k]), nv, keyFn, fam, proj);
      if (nodes !== null) {
        const node = nodes[k];
        if (node !== undefined) {
          nodesHit++;
          notifyKeyValue(node, k, old[k], nv, old, incoming);
        }
      }
    }
    if (eager) {
      // Deleted-key nodes (in the map but absent from incoming) — counted
      // fast-out: when every node was visited, skip the sweep entirely.
      if (nodes !== null && nodesHit < t.nc) {
        for (const key of Reflect.ownKeys(nodes)) {
          if (!hasOwnP.call(incoming, key)) notifyKeyDiff(nodes[key], key, old, incoming, false);
        }
      }
      notifyFoldTail(t, old, incoming);
    }
    return;
  }
}
const hasOwnP = Object.prototype.hasOwnProperty;
/** Setter-channel row ops (the fold site calls this for array targets with
 * ops consumers): structural mutation through the setter — push/splice/index
/** Key equality for EVERY key comparison in this module (re-audit 2, P1-5):
 * SameValueZero, matching the adoption window's Map-based matcher — NaN keys
 * are equal to themselves, so aligned NaN rows stay aligned in the prefix
 * walk instead of forever misaligning. */
function sameKey(a, b) {
  return a === b || (a !== a && b !== b);
}
function descend(pv, nv, keyFn, fam, proj = false) {
  if (pv === null || typeof pv !== "object" || nv === null || typeof nv !== "object") return;
  // Lookup FIRST: a hit implies pv was wrappable and never raw-marked (only
  // wrappables acquire targets; rawValues never wrap) — one WeakMap get
  // replaces isWrappable(pv) + isRawValue(pv), and a miss prunes untracked
  // subtrees before any further checks.
  const ct = lookupTarget$1(pv, fam);
  if (ct === undefined) return; // nothing proxied below this pair
  // The NEW side still validates fully: a frozen/platform/markRaw'd incoming
  // value is a leaf for reconcile — replaced by reference, never recursed
  // into (R42); the parent's slot notification covers the change.
  if (!isWrappable(nv)) return;
  if (rawValuesUsed && isRawValue(nv)) return;
  nv = unwrapValue(nv);
  // Kind change replaces wholesale, never merges (R10): a target's carrier
  // class (array vs object) is fixed at creation, so the slot detaches and a
  // fresh proxy of the right kind wraps the incoming value on next read.
  if (Array.isArray(pv) !== Array.isArray(nv)) return;
  if (keyFn) {
    const pk = keyFn(pv);
    const nk = keyFn(nv);
    // Key mismatch detaches: the slot takes the new entity; the old proxy
    // keeps its (old) backing and a fresh proxy wraps the new value on read.
    // SameValueZero (re-audit 2, P1-5): NaN keys are self-equal — strict
    // inequality detached every NaN-keyed slot on every tick while the
    // Map-based row-ops matcher retained its DOM row (stale forever).
    if (pk !== undefined && nk !== undefined && !sameKey(pk, nk)) return;
  }
  // Reachability pruning (§6d) is MODE-dependent, both pinned:
  // - keyed matching descends only where subscriptions exist at/below (`d`) —
  //   captured-but-unobserved proxies deliberately detach and go stale
  //   (recon-snap R18; subscribing is what buys liveness);
  // - positional (key: null) pairing preserves slot identity unconditionally
  //   (recon-snap R8 — the fixed-shape dashboard pattern).
  // Projection merges (replace mode) preserve key-matched identity
  // UNCONDITIONALLY (proj R6: the slot keeps its proxy without needing a
  // subscriber below); plain keyed reconcile detaches unobserved captures
  // (recon-snap R18 — staleness is the pinned pruning contract).
  if (!proj && keyFn !== null && !ct.d) return;
  applyAdopt(ct, nv, keyFn, proj);
}

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
 */
function wrapDraft(inner, isActive, aroundWrite, shallow, afterWrite) {
  // One bracket for the three mutating traps. A write to a superseded or
  // disposed draft is dropped silently (proj R37 — the same fate as a
  // superseded async run's pending draft writes, R26). `afterWrite` runs
  // once the bracket has closed — outside it, so the scheduler's
  // projectionWriteActive guard no longer applies — and only for the
  // outermost bracket (a draft driven from inside an enclosing authoritative
  // scope, the optimistic derive, leaves scheduling to that scope's caller).
  const mutate = op => {
    if (!isActive()) return true;
    const was = projectionWriteActive;
    setWriteOverride(true);
    setProjectionWriteActive(true);
    try {
      aroundWrite ? aroundWrite(op) : op();
    } finally {
      setWriteOverride(false);
      setProjectionWriteActive(was);
    }
    if (!was && afterWrite) afterWrite();
    return true;
  };
  const traps = {
    get(_, prop) {
      let value;
      const was = projectionWriteActive;
      setWriteOverride(true);
      setProjectionWriteActive(true);
      try {
        value = inner[prop];
      } finally {
        setWriteOverride(false);
        setProjectionWriteActive(was);
      }
      // A shallow store's leaves are raw by contract (#3498): no draft proxy
      // over them, so identity holds and a frozen leaf is never trapped.
      return !shallow && typeof value === "object" && value !== null && prop !== $TARGET
        ? wrapDraft(value, isActive, aroundWrite, false, afterWrite)
        : value;
    },
    has(_, prop) {
      let value;
      const was = projectionWriteActive;
      setWriteOverride(true);
      setProjectionWriteActive(true);
      try {
        value = prop in inner;
      } finally {
        setWriteOverride(false);
        setProjectionWriteActive(was);
      }
      return value;
    },
    set: (_, prop, value) =>
      mutate(() => {
        inner[prop] = value;
      }),
    deleteProperty: (_, prop) =>
      mutate(() => {
        delete inner[prop];
      }),
    ownKeys() {
      const was = projectionWriteActive;
      setWriteOverride(true);
      setProjectionWriteActive(true);
      try {
        return Reflect.ownKeys(inner);
      } finally {
        setWriteOverride(false);
        setProjectionWriteActive(was);
      }
    },
    getOwnPropertyDescriptor(_, prop) {
      let d;
      const was = projectionWriteActive;
      setWriteOverride(true);
      setProjectionWriteActive(true);
      try {
        d = Reflect.getOwnPropertyDescriptor(inner, prop);
      } finally {
        setWriteOverride(false);
        setProjectionWriteActive(was);
      }
      // The dummy target doesn't hold the key, so a non-configurable report
      // would violate the proxy invariant. Store descriptors are already
      // normalized configurable; enforce it for raw leaves too.
      if (d) d.configurable = true;
      return d;
    },
    defineProperty: (_, prop, desc) =>
      mutate(() => {
        Reflect.defineProperty(inner, prop, desc);
      })
  };
  // Matching-kind dummy so Array.isArray(draft) answers like the store.
  return new Proxy(Array.isArray(inner) ? [] : {}, traps);
}
function createProjectionNextInternal(fn, seed, options) {
  const fam = {
    map: new WeakMap(),
    node: null,
    shallow: !!options?.shallow
  };
  const store = wrapNext(seed, null, null, fam);
  if (fam.shallow) {
    // Shallow projection: the root is the only wrapped level — slot values
    // serve raw, ingests sticky raw-mark (same t.s machinery as plain).
    store[$TARGET].s = true;
    markRawIngest(seed);
  }
  let nodeOptions;
  if (options?.seedLoadingValue) nodeOptions = { loadingValue: undefined };
  if (options?.name) {
    nodeOptions = { ...nodeOptions, name: options.name };
    nameStore(store, options.name);
  }
  const node = computed(() => {
    if (!fam.node) fam.node = getOwner();
    runProjectionComputedNext(store, fn, options?.key === undefined ? "id" : options.key);
  }, nodeOptions);
  node._config &= ~CONFIG_AUTO_DISPOSE;
  fam.node = node;
  return { store, node };
}
function createProjectionNext(fn, seed, options) {
  return createProjectionNextInternal(fn, seed, options).store;
}
/** Derived writable store (legacy parity): a projection whose public setter
 * masks the recompute for the tick (core R31 — the manual write wins over a
 * same-flush dependency change). Across a hold the write is not a proposal:
 * a leaf another transaction holds as the fold's result re-runs the fold
 * under it, the write being the draft's prior state (A34 amendment, #3612;
 * core derivedWrite). */
function createStoreDerivedNext(fn, seed, options) {
  const { store, node } = createProjectionNextInternal(fn, seed, options);
  return [store, f => derivedStoreWrite(node, store, f)];
}
// A detached copy of projection state: the root container alone for a shallow
// store — its leaves are raw references by contract and stay so (#3498) — the
// whole tree otherwise.
function cloneState(v, shallow) {
  return shallow ? (Array.isArray(v) ? v.slice() : { ...v }) : JSON.parse(JSON.stringify(v));
}
function runProjectionComputedNext(wrappedStore, fn, key, wrapCommit, aroundDraftWrite) {
  const owner = getOwner();
  const target = wrappedStore[$TARGET];
  const fam = target.fam;
  // Draft validity is per run (R37): live from here until the NEXT run starts
  // — this counter moves, whatever that run does (lands, throws NotReady,
  // awaits) — or the owner is disposed. Not "until no longer in flight": a
  // sync derive that subscribes to an external source and pushes into the
  // draft from the callback (#3585) is the model use, and the old gate
  // (`owner._x?._inFlight === result`) only admitted it by accident — while
  // nothing had read the projection yet (no `_x`), `undefined === undefined`.
  const run = (fam.run = (fam.run || 0) + 1);
  let result;
  // Open loading window (seedLoadingValue): the observable store IS commit #0
  // for the whole first flight — the derive works a detached shadow of the
  // seed so draft writes cannot tear through to readers (#2988). Every commit
  // point reconciles the shadow through the normal commit path. (A callback
  // that closes over the shadow writes into a dead clone once the window has
  // closed — the one carve-out from R37's one-draft-per-run model.)
  const shadow = owner._loading ? cloneState(target[STORE_VALUE], target.s) : null;
  const draft = wrapDraft(
    wrappedStore,
    () => fam.run === run && !isDisposed(owner),
    aroundDraftWrite,
    target.s,
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
      if (!(owner._statusFlags & STATUS_PENDING) && !owner._loading) scheduleWithheld();
    }
  );
  storeSetterNext(
    draft,
    s => {
      result = fn(shadow ?? s);
      const commit = v => {
        // Shadow run: commit a detached snapshot, never the shadow itself
        // (adoption takes the value by identity — handing it the live shadow
        // would fuse the draft to the observable store).
        if (shadow && (v === undefined || v === shadow)) v = cloneState(shadow, target.s);
        if (v === s || v === undefined) return;
        const write = () =>
          storeSetterNext(wrappedStore, st => reconcileNextState(v, st, key, true), false);
        wrapCommit ? wrapCommit(write, v) : write();
      };
      const sync = handleAsync(owner, result, commit);
      if (!owner._loading) commit(sync);
    },
    false
  );
  return owner;
}

/**
 * Store rewrite — optimistic stores (§3/§7, RUL-3): no store-side layer, no
 * backup snapshots. Nodes in an optimistic family are ARMED core signals
 * (`_overrideValue` slot), so every user write rides the engine's
 * optimisticWrite — per-transaction ownership, entanglement, reverts, and
 * flash-at-flush are inherited, not reimplemented. Membership edits live on
 * armed presence nodes (the §6 overlay), so structural optimism reverts with
 * the same per-transaction granularity (FINDING-2's fix by construction).
 *
 * Derived form = an optimistic projection. Landings follow the fold rule
 * (#3164, RUL-2 as re-ruled): while a transaction retains optimistic edits
 * on the family, truth that lands STAGES into that transaction — a keyed
 * identity-preserving walk written through the ordinary staged setter
 * channel — and reveals atomically at settle, exactly like a signal landing
 * under an active override (asyncWrite's held branch). Optimistic edits are
 * never consumed by landings; they live exactly as long as their transaction
 * and die by engine-native revert. With no retainer, landings commit
 * immediately under projectionWriteActive (authoritative, silently beneath
 * any bare-write overrides — those ride the flight's own transition, #2951).
 * Authoritative readers (until()'s predicate) tunnel into staged truth via
 * the node read path's pending-value arm. The transitionBlocked store-half
 * (#2951) is installed here for next-shaped targets, chaining the
 * legacy/engine checks.
 */
/** #3164 fold: a stamped truth is HELD (masked from ordinary readers until
 * the reveal) only while its transition is live AND retaining optimism —
 * overrides are what make partial-coverage composition a tear. A plain
 * async transition carries no overrides, so downstream computes must see
 * staged values to converge (normal speculation). Resolves merges first:
 * merge unions optimistic nodes/stores into the target. */
function transitionHoldsOptimism(transition) {
  const t = currentTransition(transition);
  return t._done !== true && (t._optimisticNodes.length !== 0 || t._optimisticStores.size !== 0);
}
let blockedInstalled = false;
function installNextBlockedHalf() {
  if (blockedInstalled) return;
  blockedInstalled = true;
  // Late-bind the optimistic machinery into the plain store/reconcile paths
  // (all call sites are fam?.opt-gated, so this always runs first) and the
  // affects witness's view resolver.
  setOptHooks({
    notifyOptimisticWrites,
    optimisticView,
    applyTentative,
    retainsOptimism: transitionHoldsOptimism
  });
  // The affects() declaration walk is a WRITER channel (A28 (5)): tagging a
  // parent covers the record as the writer sees it, this tick's optimistic
  // writes included — the draft view, not the reader view.
  setNextOptimisticViewResolver((t, raw) => optimisticView(t, raw, true));
  // Scheduler flush tails call _clearOptimisticStores whenever tracked
  // stores exist; next has no layer to clear — reverts are engine-native —
  // so the hook only empties the batch set.
  if (!GlobalQueue._clearOptimisticStores) {
    GlobalQueue._clearOptimisticStores = stores => {
      for (const px of stores) {
        const t = px?.[$TARGET];
        const overlaid = t?.fam?.overlaid;
        if (overlaid !== undefined) {
          for (const ot of overlaid) {
            // Keyset resync (classic channel twin): the keyset node's own
            // revert can compare EQUAL (a landing's bump matched the
            // tentative bump) while the arrangement underneath changed —
            // mapArray/ownKeys subscribers must re-read the post-revert
            // view. Authoritative bump: never re-arm the node we are
            // clearing.
            if (ot.k !== null) runAuthoritative(() => setSignal(ot.k, v => v + 1));
          }
        }
      }
      stores.clear();
    };
  }
  // Revert-side link refresh (#3672, §7b/O6): a chained node's `_value` is
  // never served — the base's live value is — so the engine cannot read
  // committed truth from it. The engine consults it at exactly two moments:
  // optimisticWrite's no-op check (the setter hands it the visible value,
  // see `emit` in notifyOptimisticWrites) and resolveOptimisticNodes'
  // notify compare (here). Left at the write-time value, a base commit
  // during the override — confirm 7, user writes back to the pre-write 5 —
  // made the revert compare 5 === 5 and notify nobody while the base read 7:
  // a memo over the view stayed at the guess forever (render effects were
  // rescued by readsHeldCommitted's replay). Refresh every armed node of
  // each chained host in the reverting batch to the base's live value right
  // before the compare, so it is exact: notify iff truth differs from the
  // guess. Untracked: a flush from inside a computation must not link it.
  const resolvePrev = GlobalQueue._resolveOptimistic;
  GlobalQueue._resolveOptimistic = nodes => {
    let seen = null;
    for (const node of nodes) {
      const t = node._host;
      if (t?.ch !== true || seen?.has(t)) continue;
      (seen ??= new Set()).add(t);
      untrack(() => {
        const base = t.v;
        for (const k of Reflect.ownKeys(t.n)) {
          const n = t.n[k];
          if (hasActiveOverride(n)) n._value = unwrapValue(base[k]);
        }
        if (t.h !== null)
          for (const k of Reflect.ownKeys(t.h)) {
            const h = t.h[k];
            if (hasActiveOverride(h)) h._value = k in base;
          }
      });
    }
    resolvePrev(nodes);
  };
  const chained = GlobalQueue._transitionBlocked;
  GlobalQueue._transitionBlocked = transition => {
    for (const store of transition._optimisticStores) {
      const t = store?.[$TARGET];
      const fam = t?.fam;
      const fw = fam?.node;
      // The hold exists to keep optimistic state alive until the store's own
      // truth lands (#2951). Once the family carries NO live overrides (a
      // landing consumed them, or they never existed), a pending firewall is
      // no reason to park the transaction — blocking then leaks it forever
      // when the in-flight question is never answered (undisposed fixtures).
      if (fw == null || !(fw._statusFlags & STATUS_PENDING)) continue;
      // Ownership is declared (#3146): only the flight's OWN transaction
      // parks on the flight (the #2951 anchor routed the bare write there).
      // A transaction that merely brushed the store never waits for truth
      // it does not carry. An undeclared flight is owned by the firewall's stamp.
      const ft = liveTransition(fam.ft ?? fw._transition);
      if (ft !== null && ft !== currentTransition(transition)) continue;
      if (familyHasLiveOverrides(fam)) return true;
    }
    return chained(transition);
  };
}
function familyHasLiveOverrides(fam) {
  const overlaid = fam.overlaid;
  if (overlaid === undefined || overlaid.size === 0) return false;
  for (const t of overlaid) {
    for (const bucket of [t.n, t.h]) {
      if (bucket === null) continue;
      for (const key of Reflect.ownKeys(bucket)) {
        const node = bucket[key];
        if (node._x?._overrideValue !== undefined && node._x?._overrideValue !== NOT_PENDING)
          return true;
      }
    }
    if (
      t.k !== null &&
      t.k._x?._overrideValue !== undefined &&
      t.k._x?._overrideValue !== NOT_PENDING
    )
      return true;
  }
  overlaid.clear(); // nothing live — drop the bookkeeping
  return false;
}
function createOptimisticStoreNext(first, second, third) {
  // Engine first (armed nodes need optimisticWrite installed before any
  // node exists), then the next-shape hooks.
  installOptimisticEngine();
  installNextBlockedHalf();
  const derived = typeof first === "function";
  const options = derived ? third : second;
  const initialValue = derived ? second : first;
  const fam = {
    map: new WeakMap(),
    node: null,
    shallow: !!options?.shallow,
    opt: true
  };
  const store = wrapNext(initialValue, null, null, fam);
  fam.px = store;
  nameStore(store, options?.name);
  // Same key resolution the projection channels use ("id" default) — replay's
  // satisfaction rule reads it off the family.
  const keyOption = options?.key === undefined ? "id" : options.key;
  fam.key =
    typeof keyOption === "function"
      ? keyOption
      : keyOption === null
        ? null
        : row => (isWrappable(row) ? row[keyOption] : undefined);
  if (fam.shallow) {
    store[$TARGET].s = true;
    markRawIngest(initialValue);
  }
  if (derived) {
    const fn = first;
    // #3146: an async settle event belongs to the flight's OWN transaction.
    // A live declared one re-enters (a merge if the generic settle path
    // already entered a graph-stamped stranger — the landing supersedes any
    // recompute deriving from that stranger's world); a dead one renews (per
    // A18(1) each arrival reveals on its own schedule, so per-yield
    // transactions die with their commit and the next settle event opens the
    // flight's next one — still declared, never anonymous). An UNDECLARED
    // flight (loading window) keeps the ambient reveal (#2933: the loading
    // rail is transaction-invisible).
    const enterFlightTransition = () => {
      const declared = fam.ft;
      if (declared == null) return;
      let ft = liveTransition(declared);
      if (ft === null) fam.ft = ft = createTransition();
      fam.node._transition = ft;
      globalQueue.initTransition(ft);
    };
    // Landing router (#3164 fold ruling): while a transaction retains
    // optimistic edits on this family, truth landings stage INTO it and
    // reveal atomically at settle; with no retainer they commit immediately
    // under the authoritative posture (async commits land outside the
    // computed's sync body, so the posture is re-applied here) — inside the
    // flight-owned transaction (#3146). Sync commits (the derive's body,
    // owner is the firewall itself) reveal with their own recompute's flush.
    const wrapCommit = (write, value) => {
      const txn = retainingTransition(fam);
      if (txn !== null) return void stageLanding(fam, txn, value);
      if (getOwner() !== fam.node) enterFlightTransition();
      runAuthoritative(write);
    };
    // Draft writes (the derive mutating its draft, sync body and post-await
    // continuations alike) are the same truth channel per-operation: bind
    // each op to the retaining transaction so its node writes stage and its
    // backing fold defers (ensurePB stamps foldBatches with the swapped-in
    // batch; the write-override eager-commit branch in notifyWrites yields
    // to any active transaction).
    const aroundDraftWrite = op => {
      const txn = retainingTransition(fam);
      if (txn === null) op();
      else runFolded(txn, op);
    };
    // Flight declaration (#3146): a recompute that registered a truth-flight
    // OWNS its transaction. The ask's transaction is recorded on the family
    // (created by the flight's own pending throw when none was ambient, the
    // causing write's/refresh's when one was — graph-driven causality) and
    // the firewall is stamped so every settle path resolves the flight's
    // transaction by construction, not by whatever last brushed the node.
    // When the ask took none (a dead stale stamp — the previous flight's,
    // cleared nowhere — bare-returns the pre-throw entry), the flight opens
    // its own here, same activation point as the pre-throw's creation: the
    // ambient batch (the causing write, same-tick bare optimism) adopts into
    // it exactly as it would have there, and the pending notification that
    // follows this unwind registers observers against it. The flight
    // also registers as its own async reporter: the transaction lives
    // exactly as long as the question is unanswered, observed or not — the
    // #2951 refetch-hold no longer depends on a tracked observer having
    // happened to register one. Loading-window flights declare nothing
    // (#2933: the loading rail is transaction-invisible); a sync run clears
    // the declaration.
    const declareFlight = self => {
      if (self._x?._inFlight == null) {
        if (!self._loading) fam.ft = null;
        return;
      }
      // First flight (#3146 carve-out): nothing has ever committed, so there
      // is no truth to keep on screen and no optimistic state to protect. An
      // uninitialized ask suspends its readers into their Loading boundary
      // exactly like a plain derived store's first flight — declaring a
      // transaction here instead held the ROOT MOUNT (render()'s scheduled
      // insert rides transitions) until the fetch landed, so the boundary's
      // fallback never showed and the whole page stayed blank. The loading
      // window (#2933) already declares nothing for the same reason; once
      // the first truth lands, every refetch flight declares as before.
      if (self._loading || self._statusFlags & STATUS_UNINITIALIZED) return;
      let txn = activeTransition;
      if (txn === null) globalQueue.initTransition((txn = createTransition()));
      fam.ft = txn;
      self._transition = txn;
      let reporters = txn._asyncReporters.get(self);
      if (reporters === undefined) txn._asyncReporters.set(self, (reporters = new Set()));
      reporters.add(self);
    };
    let nodeOptions;
    if (options?.seedLoadingValue) nodeOptions = { loadingValue: undefined };
    if (options?.name) nodeOptions = { ...nodeOptions, name: options.name };
    const node = computed(() => {
      const self = getOwner();
      try {
        runAuthoritative(() =>
          runProjectionComputedNext(
            store,
            fn,
            options?.key === undefined ? "id" : options.key,
            wrapCommit,
            aroundDraftWrite
          )
        );
      } finally {
        declareFlight(self);
      }
    }, nodeOptions);
    node._config &= ~CONFIG_AUTO_DISPOSE;
    fam.node = node;
  }
  return [
    store,
    fn => {
      // Retention ledger (#3164): record the owning transaction so landings
      // know to fold. Captured at entry — the action machinery has the
      // transaction ambient while user code runs; a bare write with no
      // transaction retains nothing (it rides the flight's own transition
      // per #2951 and dies with it).
      const txn = activeTransition;
      storeSetterNext(store, fn);
      if (txn !== null) (fam.rt ??= new Set()).add(txn);
    }
  ];
}
/** Resolve a retained transition through its merge chain (`_done` holds the
 * merge target while merged, `true` once settled). Null = dead. */
function liveTransition(txn) {
  if (txn === null) return null;
  while (typeof txn._done === "object") txn = txn._done;
  return txn._done === true ? null : txn;
}
/** The transaction truth landings fold into: the first live member of the
 * family's retention ledger (dead members prune here). Multiple live
 * retainers entangle through their shared family writes and settle
 * together, so folding into the first reaches all of them. */
function retainingTransition(fam) {
  const rt = fam.rt;
  if (rt === undefined || rt.size === 0) return null;
  let live = null;
  for (const txn of rt) {
    const resolved = liveTransition(txn);
    if (resolved === null) rt.delete(txn);
    else live ??= resolved;
  }
  return live;
}
/** Fold a landing into the retaining transaction (#3164): the landed value
 * is written through the ORDINARY staged setter channel — node writes park
 * as `_pendingValue` registered with the transaction's batch (speculation
 * and until()'s authoritative tunnel see them; live view stays coherent),
 * and the backing fold defers via the foldBatches stamp — under the
 * authoritative posture, so armed nodes take the engine bypass and no
 * override is created. The engine's own commit machinery reveals everything
 * atomically when the transaction settles (transitions never abort: failed
 * actions still commit — only optimistic overrides revert). */
function stageLanding(fam, txn, incoming) {
  runFolded(txn, () =>
    runAuthoritative(() =>
      storeSetterNext(
        fam.px,
        draft => {
          stagedApply(draft, unwrapValue(incoming), fam.key ?? null);
        },
        false
      )
    )
  );
}
/** Run a fold write inside the retaining transaction's batch, then
 * transition-stamp its staged nodes NOW (parity with the parked-transition
 * flush path's reassignPendingTransition): the stamp is what routes stale
 * (render) readers to the committed value — core read's cross-transaction
 * guard — and what makes foldHeld defer the backing for context-free
 * readers. A microtask staging never crosses that flush path, so without
 * the stamp a render effect's speculative recompute would compose staged
 * truth with live overrides — the #3164 tear, one window later. Armed
 * nodes additionally raise CONFIG_HELD_TRUTH: their staged value is
 * confirming truth masked from ordinary readers until the reveal (plain
 * staged nodes stay visible — normal speculation; override-covered nodes
 * stay unarmed — the override is their display and its revert their
 * notification, A17). */
function runFolded(txn, op) {
  runAsTransitionBatch(txn, op);
  const pending = txn._pendingNodes;
  for (let i = 0; i < pending.length; i++) {
    const node = pending[i];
    node._transition = txn;
    if (node._config & CONFIG_OPTIMISTIC && !hasActiveOverride(node))
      node._config |= CONFIG_HELD_TRUTH;
  }
}
/** Keyed identity-preserving deep merge through live draft proxies — the
 * staged twin of the adoption walk. Reads see the pending backing (staged
 * view), so consecutive landings during one hold compose; key-matched rows
 * keep their raw (and so their proxy) in the slot with only changed leaves
 * written; unmatched rows land wholesale. Runs inside stageLanding's
 * authoritative bracket: drafts seed from committed truth, never overlays. */
function stagedApply(cur, incoming, keyFn) {
  const curArr = Array.isArray(cur);
  if (curArr && Array.isArray(incoming)) {
    const len = incoming.length;
    if (keyFn !== null) {
      // Occurrence-aware key queues (parity with the adoption window):
      // duplicate keys match per occurrence, each current row consumed once.
      let byKey = null;
      const curLen = cur.length;
      for (let j = 0; j < curLen; j++) {
        const raw = unwrapValue(cur[j]);
        if (!isWrappable(raw)) continue;
        const k = keyFn(raw);
        if (k === undefined) continue;
        const q = (byKey ??= new Map()).get(k);
        if (q === undefined) byKey.set(k, [raw]);
        else q.push(raw);
      }
      // Echo adoption: an optimistic structural add whose key the landing
      // confirms must keep its raw (and so its proxy — list drivers keep the
      // DOM row). Tentative rows never reach committed truth (they live in
      // node overrides), so key-match the draft target's active override
      // rows as a secondary pool. Committed rows queued first own their
      // keys; overlay rows only extend coverage. Adopted raws enter staged
      // truth; at settle the override reverts and the reveal re-seats the
      // same raw.
      const overlayNodes = cur[$TARGET]?.n;
      if (overlayNodes != null) {
        for (const ok of Reflect.ownKeys(overlayNodes)) {
          const node = overlayNodes[ok];
          if (!hasActiveOverride(node)) continue;
          const raw = unwrapValue(unwrapOverride(node._x._overrideValue));
          if (!isWrappable(raw)) continue;
          const k = keyFn(raw);
          if (k === undefined) continue;
          const q = (byKey ??= new Map()).get(k);
          if (q === undefined) byKey.set(k, [raw]);
          else q.push(raw);
        }
      }
      for (let i = 0; i < len; i++) {
        const nv = incoming[i];
        let matched;
        if (isWrappable(nv) && byKey !== null) {
          const nk = keyFn(nv);
          if (nk !== undefined) {
            for (const [k, q] of byKey) {
              if (!sameKey(k, nk)) continue;
              matched = q.shift();
              if (q.length === 0) byKey.delete(k);
              break;
            }
          }
        }
        if (matched !== undefined) {
          if (unwrapValue(cur[i]) !== matched) cur[i] = matched;
          stagedApply(cur[i], nv, keyFn);
        } else {
          const pv = unwrapValue(cur[i]);
          if (!isEqual(pv, nv) && !targetsEqual(pv, nv)) cur[i] = nv;
        }
      }
    } else {
      for (let i = 0; i < len; i++) {
        const nv = incoming[i];
        const pv = unwrapValue(cur[i]);
        if (pv === nv) continue;
        if (isWrappable(nv) && isWrappable(pv) && Array.isArray(nv) === Array.isArray(pv))
          stagedApply(cur[i], nv, keyFn);
        else if (!isEqual(pv, nv) && !targetsEqual(pv, nv)) cur[i] = nv;
      }
    }
    if (cur.length !== len) cur.length = len;
    return;
  }
  // Object merge; also the degenerate root-kind-change shape (arrays accept
  // keyed writes/deletes, so a wholesale restatement still lands staged).
  for (const k of Reflect.ownKeys(incoming)) {
    if ((curArr && k === "length") || k === $OWNER) continue;
    const nv = incoming[k];
    const pv = unwrapValue(cur[k]);
    if (pv === nv) continue;
    if (isWrappable(nv) && isWrappable(pv) && Array.isArray(nv) === Array.isArray(pv)) {
      // Different-keyed entities never merge (tentative-channel parity):
      // the incoming object replaces the slot wholesale.
      if (keyFn !== null) {
        const pk = keyFn(pv);
        const nk = keyFn(nv);
        if (pk !== undefined && nk !== undefined && !sameKey(pk, nk)) {
          cur[k] = nv;
          continue;
        }
      }
      stagedApply(cur[k], nv, keyFn);
    } else if (!isEqual(pv, nv) && !targetsEqual(pv, nv)) {
      cur[k] = nv;
    }
  }
  for (const k of Reflect.ownKeys(cur)) {
    if ((curArr && k === "length") || k === $OWNER || k in incoming) continue;
    delete cur[k];
  }
}
// ---- optimistic-only store machinery (moved from next/store.ts /
// next/reconcile.ts so plain-store bundles tree-shake it) ----
/** Diff the draft against the current OPTIMISTIC VIEW (committed + active
 * overrides — the same view the draft was seeded from) and emit engine writes
 * for exactly the changed keys. Visible-view diffing keeps no-op writes from
 * entangling lanes (RUL-10 / opt R38). */
function notifyOptimisticWrites(t, pb) {
  // A bare write while the store's own truth is in flight rides the FLIGHT'S
  // OWN transaction (#2951 via the #3146 declaration): entangle it so the
  // override survives until the refetch settles instead of flash-reverting
  // at plain flush end. The blocked-check store-half keeps that transaction
  // from settling while the firewall is pending. Declared ownership replaces
  // the old circumstantial route through the firewall's `_transition` stamp,
  // which was whatever last brushed the node.
  const declared = t.fam?.ft;
  if (declared != null) {
    const ft = liveTransition(declared);
    if (ft !== null) globalQueue.initTransition(ft);
  }
  // The write is judged against what ordinary readers SEE, not against the
  // committed backing slot: under an adoption hold (#3074) `t.v` is already
  // the truth a live transaction is holding, and an optimistic write equal
  // to it compared as a no-op — no override, no lane, and the screen kept
  // the pre-hold value until the transaction committed (#3330's store
  // twin: `s.v = 1` after a `yield` while the derive had already staged
  // `v: 1`). Signal parity: the override reveals on its lane now, with its
  // derivations; the held truth reveals on the transaction's schedule.
  const old = heldMaskView(t) ?? t.v;
  // Compare RAWS on both sides (`nv` below is unwrapped already). A chained
  // target's `old` is the inner store's proxy, whose reads hand back inner
  // child PROXIES; the draft's clone holds the inner raws. Comparing the two
  // as-is marked every untouched row changed, and the overlay then served
  // each from an override as a fresh non-chained target — row identities
  // churned for the life of the action and snapped back at settle (#3323).
  const visible = (key, fallback) => {
    const node = t.n?.[key];
    return unwrapValue(
      node !== undefined && hasActiveOverride(node)
        ? unwrapOverride(node._x?._overrideValue)
        : fallback
    );
  };
  const visiblePresent = key => {
    const node = t.h?.[key];
    return node !== undefined && hasActiveOverride(node)
      ? !!unwrapOverride(node._x?._overrideValue)
      : key in old;
  };
  // Chained nodes are links (§7b, O6): their `_value` is never served and
  // never learns the base's commits, yet optimisticWrite's no-op check reads
  // it (#3672). Hand it the visible committed value at the write; the revert
  // compare gets the same treatment in installNextBlockedHalf.
  const emit = (node, ov, nv) => {
    if (t.ch && !hasActiveOverride(node)) node._value = ov;
    setSignal(node, () => nv);
  };
  let structural = false;
  const isArr = Array.isArray(pb);
  for (const key of Reflect.ownKeys(pb)) {
    if ((isArr && key === "length") || key === $OWNER) continue;
    const nv = unwrapValue(pb[key]);
    if (!visiblePresent(key)) {
      // Optimistic add: value node + presence node + membership bump.
      const ov = unwrapValue(old[key]);
      emit(getNode(t, key, ov), ov, nv);
      emit(getHasNode(t, key, key in old), key in old, true);
      structural = true;
    } else {
      const ov = visible(key, old[key]);
      if (!isEqual(ov, nv) && !targetsEqual(ov, nv)) {
        emit(getNode(t, key, ov), ov, nv);
        if (isArr) structural = true;
      }
    }
  }
  for (const key of Reflect.ownKeys(old)) {
    if ((isArr && key === "length") || key === $OWNER) continue;
    if (key in pb || !visiblePresent(key)) continue;
    // Optimistic delete: node reads undefined, presence flips, membership bumps.
    const ov = unwrapValue(old[key]);
    emit(getNode(t, key, ov), ov, undefined);
    emit(getHasNode(t, key, true), true, false);
    structural = true;
  }
  if (isArr) {
    const oldLen = visible("length", old.length);
    if (oldLen !== pb.length) {
      emit(getNode(t, "length", oldLen), oldLen, pb.length);
      structural = true;
    }
  }
  if (structural) setSignal(getKeySetNode(t), v => v + 1);
  // Deep-witness: optimistic value writes notify deep() subscribers too
  // (structural ones already ride the key-set bump above).
  bumpDeep(t);
  // Discard the draft — committed raw is untouched (revert target by
  // construction) — restoring any truth-staged backing this draft displaced
  // (#3164 fold: ensurePB parked it so tentative writes could not pollute
  // staged truth). Register the root store for the scheduler's settle hooks.
  t.pb = stagedTruthPB.get(t) ?? null;
  if (t.pb !== null) stagedTruthPB.delete(t);
  (t.fam.overlaid ??= new Set()).add(t);
  GlobalQueue._trackOptimisticStore?.(t.fam.px ?? t.px);
}
/** Optimistic-view composition for snapshot/deep (O1: snapshot is the CURRENT
 * view, lane values included; a fresh copy per call during pending windows —
 * RUL-12). Returns `src` untouched when no override is active on `t`.
 * Authoritative-view reads (until()'s predicate) skip composition entirely:
 * the predicate observes authoritative truth, never the caller's tentative
 * overlay. (Write-side emission callers never run under such a compute.) */
function optimisticView(t, src, draft = false) {
  if (t.fam?.opt !== true || authoritativeRead()) return src;
  let out = null;
  const ensure = () => (out ??= Array.isArray(src) ? [...src] : { ...src });
  // Reader composition (snapshot/deep, the length view with no armed length
  // node) takes a superseded override as the traps serve it (readerOverride,
  // #3331): the writer's draft and the write-side callers (applyTentative,
  // applyAdopt's key-matching view) keep the override itself.
  const reader = !draft && !authoritativeServe();
  const nodes = t.n;
  if (nodes !== null) {
    for (const key of Reflect.ownKeys(nodes)) {
      const node = nodes[key];
      // A28 (5): readers see an optimistic write once a flush carried it;
      // the draft (writer channel) composes on it now.
      if (!(draft ? hasActiveOverride(node) : visibleOverride(node))) continue;
      if (key === "length" && Array.isArray(src)) {
        const len = src.length;
        const ov = reader ? readerOverride(node, len) : unwrapOverride(node._x?._overrideValue);
        if (len !== ov) ensure().length = ov;
      } else {
        const cv = src[key];
        const ov = reader ? readerOverride(node, cv) : unwrapOverride(node._x?._overrideValue);
        if (!isEqual(cv, ov)) ensure()[key] = ov;
      }
    }
  }
  const has = t.h;
  if (has !== null) {
    for (const key of Reflect.ownKeys(has)) {
      const node = has[key];
      // A28 (5): readers see an optimistic write once a flush carried it;
      // the draft (writer channel) composes on it now.
      if (!(draft ? hasActiveOverride(node) : visibleOverride(node))) continue;
      const committed = key in (out ?? src);
      const present = !!(reader
        ? readerOverride(node, committed)
        : unwrapOverride(node._x?._overrideValue));
      if (!present && committed) delete ensure()[key];
    }
  }
  return out ?? src;
}
function applyTentative(t, incoming, keyFn) {
  const base = t.pb ?? t.v;
  const view = optimisticView(t, base);
  const fam = t.fam;
  const isArr = Array.isArray(incoming);
  if (Array.isArray(view) !== isArr) return; // kind change at root: flat overrides below
  const pairs = [];
  let pbLike;
  if (isArr) pbLike = [...incoming];
  else {
    pbLike = {};
    for (const k of Reflect.ownKeys(incoming)) if (k !== $OWNER) pbLike[k] = incoming[k];
  }
  const match = (pv, nv) => {
    if (!isWrappable(pv) || !isWrappable(nv)) return null;
    if (rawValuesUsed && (isRawValue(pv) || isRawValue(nv))) return null;
    if (Array.isArray(pv) !== Array.isArray(nv)) return null;
    if (keyFn) {
      const pk = keyFn(pv);
      const nk = keyFn(nv);
      // SameValueZero (re-audit 3, P1-3): parity with the plain reconcile
      // channel — NaN keys are self-equal.
      if (pk !== undefined && nk !== undefined && !sameKey(pk, nk)) return null;
    }
    return lookupTarget$1(unwrapValue(pv), fam) ?? null;
  };
  if (isArr) {
    const viewRows = view;
    let viewByKey = null;
    for (let i = 0; i < incoming.length; i++) {
      const nv = incoming[i];
      if (!isWrappable(nv)) continue;
      let pv;
      if (keyFn) {
        const nk = keyFn(nv);
        if (nk !== undefined) {
          if (viewByKey === null) {
            // Occurrence-aware index queues (re-audit 3, P1-3): parity with
            // the plain adoption window — duplicate keys match per
            // occurrence, each view row consumed once.
            viewByKey = new Map();
            for (let j = 0; j < viewRows.length; j++) {
              const p = unwrapValue(viewRows[j]);
              if (isWrappable(p)) {
                const pk = keyFn(p);
                if (pk === undefined) continue;
                const existing = viewByKey.get(pk);
                if (existing === undefined) viewByKey.set(pk, j);
                else if (Array.isArray(existing)) existing.push(j);
                else viewByKey.set(pk, [existing, j]);
              }
            }
          }
          const m = viewByKey.get(nk);
          if (m === undefined) pv = undefined;
          else if (Array.isArray(m)) {
            pv = unwrapValue(viewRows[m.shift()]);
            if (m.length === 1) viewByKey.set(nk, m[0]);
          } else {
            pv = unwrapValue(viewRows[m]);
            viewByKey.delete(nk);
          }
        } else pv = unwrapValue(viewRows[i]);
      } else pv = unwrapValue(viewRows[i]);
      const ct = match(pv, nv);
      if (ct !== null) {
        // Keep the existing row in the slot (identity preserved); recurse.
        pbLike[i] = unwrapValue(pv);
        pairs.push([ct, nv]);
      }
    }
  } else {
    for (const k of Reflect.ownKeys(incoming)) {
      if (k === $OWNER) continue;
      const pv = unwrapValue(view[k]);
      const nv = incoming[k];
      const ct = match(pv, nv);
      if (ct !== null) {
        pbLike[k] = pv;
        pairs.push([ct, nv]);
      }
    }
  }
  // Flat overrides for this level (adds, removals, moved slots, length, leaf
  // values) — preserve any live user draft backing across the call.
  const priorPB = t.pb;
  t.pb = null;
  notifyOptimisticWrites(t, pbLike);
  t.pb = priorPB;
  for (let i = 0; i < pairs.length; i++)
    applyTentative(pairs[i][0], unwrapValue(pairs[i][1]), keyFn);
}

const DELETE = Symbol("STORE_PATH_DELETE");
function isPrototypePollutionKey(part) {
  return part === "__proto__" || part === "constructor" || part === "prototype";
}
function updatePath(current, args, i = 0) {
  let part,
    prev = current;
  if (i < args.length - 1) {
    part = args[i];
    const partType = typeof part;
    const isArray = Array.isArray(current);
    if (partType === "string" && isPrototypePollutionKey(part)) return;
    if (Array.isArray(part)) {
      for (let j = 0; j < part.length; j++) {
        args[i] = part[j];
        updatePath(current, args, i);
      }
      args[i] = part;
      return;
    } else if (isArray && partType === "function") {
      for (let j = 0; j < current.length; j++) {
        if (part(current[j], j)) {
          args[i] = j;
          updatePath(current, args, i);
        }
      }
      args[i] = part;
      return;
    } else if (isArray && partType === "object") {
      const { from = 0, to = current.length - 1, by = 1 } = part;
      for (let j = from; j <= to; j += by) {
        args[i] = j;
        updatePath(current, args, i);
      }
      args[i] = part;
      return;
    } else if (i < args.length - 2) {
      updatePath(current[part], args, i + 1);
      return;
    }
    prev = current[part];
  }
  let value = args[args.length - 1];
  if (typeof value === "function") {
    value = value(prev);
    if (value === prev) return;
  }
  if (part === undefined && value == undefined) return;
  if (value === DELETE) {
    delete current[part];
  } else if (
    part === undefined ||
    (isWrappable(prev) && isWrappable(value) && !Array.isArray(value))
  ) {
    const target = part !== undefined ? current[part] : current;
    const keys = ownEnumerableKeys(value);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof key === "string" && isPrototypePollutionKey(key)) continue;
      const desc = Object.getOwnPropertyDescriptor(value, key);
      if (desc.get || desc.set) Object.defineProperty(target, key, desc);
      else target[key] = desc.value;
    }
  } else {
    current[part] = value;
  }
}
/**
 * Path-based setter helper for `createStore`. Call `storePath(...path, value)`
 * to produce a draft-mutating function suitable for passing to `setStore`.
 *
 * The canonical setter form in Solid 2.0 is the draft-mutating callback
 * (`setStore(s => { s.user.name = "Ada"; })`). `storePath` is a backwards-
 * compatibility helper for users porting from Solid 1.x's
 * `setStore("user", "name", "Ada")` style — it's optional and you can mix the
 * two styles freely.
 *
 * Path parts can be:
 * - a single key — `"user"`, `0`
 * - an array of keys — `[0, 1, 2]`
 * - a range over an array — `{ from?, to?, by? }`
 * - a filter `(item, index) => boolean` for arrays
 *
 * The final argument is the new value or an updater `(prev) => next`. Use
 * `storePath.DELETE` to remove a property.
 *
 * @example
 * ```ts
 * const [state, setState] = createStore({ user: { name: "Ada" }, todos: [] });
 *
 * setState(storePath("user", "name", "Grace"));
 * setState(storePath("todos", t => !t.done, "done", true)); // mark all undone as done
 * setState(storePath("user", "nickname", storePath.DELETE));
 * ```
 */
const storePath = /* @__PURE__ */ Object.assign(
  function storePath(...args) {
    return state => {
      updatePath(state, args);
    };
  },
  { DELETE }
);

function createStore(first, second, third) {
  if (typeof first === "function") return createStoreDerivedNext(first, second, third);
  {
    const store = createStoreNext(first, !!second?.shallow);
    if (second?.name) nameStore(store[0], second.name);
    return store;
  }
}
function reconcile(value, key = "id") {
  return state => reconcileNextState(value, state, key);
}
function snapshot(value) {
  return snapshotNext(value);
}
function deep(value) {
  return deepNext(value);
}

function mapArray(list, map, options) {
  const keyFn = typeof options?.keyed === "function" ? options.keyed : undefined;
  const indexes = map.length > 1;
  const wrappedMap = options?.name
    ? (...args) => {
        setStrictRead(options.name);
        try {
          return map(...args);
        } finally {
          setStrictRead(false);
        }
      }
    : map;
  const data = {
    _owner: createOwner(),
    _len: 0,
    _list: list,
    _items: [],
    _map: wrappedMap,
    _mappings: [],
    _nodes: [],
    _key: keyFn,
    _rows: keyFn || options?.keyed === false ? [] : undefined,
    _indexes: indexes && options?.keyed !== false ? [] : undefined,
    _byIndex: options?.keyed === false,
    _fallback: options?.fallback
  };
  const node = computed(
    updateKeyedMap.bind(data),
    options?.name ? { name: options.name } : undefined
  );
  // Untracked reads inside the internal owner resolve via _parentComputed; routing
  // them through node lets store-proxy lookups see pending writes (not stale _value).
  data._owner._parentComputed = node;
  node._config &= ~CONFIG_AUTO_DISPOSE;
  return accessor(node);
}
const pureOptions = { ownedWrite: true };
function trySmallMove(data, newItems, newLen, start) {
  const oldItems = data._items;
  const oldEnd = data._len - 1;
  const srcPos = [];
  const dstPos = [];
  const runs = []; // flat triples: oldStart, newStart, length
  let budget = 256;
  let i = start;
  let j = start;
  let inRun = false;
  while (i <= oldEnd && j <= newLen - 1) {
    const oldItem = oldItems[i];
    const newItem = newItems[j];
    if (oldItem === newItem) {
      if (!inRun) {
        runs.push(i, j, 0);
        inRun = true;
      }
      runs[runs.length - 1]++;
      i++;
      j++;
      continue;
    }
    inRun = false;
    // Bounded realignment lookahead, shorter distance wins.
    let del = -1;
    let lim = Math.min(32 - srcPos.length, oldEnd - i, budget);
    for (let a = 1; a <= lim; a++) {
      if (oldItems[i + a] === newItem) {
        del = a;
        break;
      }
    }
    budget -= del === -1 ? lim : del;
    let ins = -1;
    lim = Math.min(32 - dstPos.length, newLen - 1 - j, budget);
    for (let a = 1; a <= lim; a++) {
      if (newItems[j + a] === oldItem) {
        ins = a;
        break;
      }
    }
    budget -= ins === -1 ? lim : ins;
    if (del !== -1 && (ins === -1 || del <= ins)) {
      while (del-- > 0) srcPos.push(i++);
      continue;
    }
    if (ins !== -1) {
      while (ins-- > 0) dstPos.push(j++);
      continue;
    }
    if (budget <= 0 || srcPos.length === 32 || dstPos.length === 32) return false;
    srcPos.push(i++);
    dstPos.push(j++);
  }
  for (; i <= oldEnd; i++) {
    if (srcPos.length === 32) return false;
    srcPos.push(i);
  }
  for (; j <= newLen - 1; j++) {
    if (dstPos.length === 32) return false;
    dstPos.push(j);
  }
  return commitSmallMove(data, newItems, newLen, srcPos, dstPos, runs);
}
/** PHASE 2 of the small-move path, in its OWN function so that a pass which
 * only SCANS and bails (a full replace: the first structural pass of a page,
 * typically) compiles nothing but the scan — V8 parses and compiles lazily
 * per function, and cold `replace` measured +0.5 ms with both phases in one
 * body. Pairs displaced sources with destinations (an unmatched destination
 * is a replacement/insertion → general path), then commits: slice() the live
 * arrays, copy shifted runs, patch displaced pairs, dispose leftovers. */
function commitSmallMove(data, newItems, newLen, srcPos, dstPos, runs) {
  const oldItems = data._items;
  let i;
  let j;
  let consumed;
  if (dstPos.length !== 0) {
    consumed = new Array(srcPos.length);
    for (j = 0; j < dstPos.length; j++) {
      let found = -1;
      for (i = 0; i < srcPos.length; i++) {
        if (!consumed[i] && oldItems[srcPos[i]] === newItems[dstPos[j]]) {
          found = i;
          break;
        }
      }
      if (found === -1) return false;
      consumed[found] = true;
      dstPos[j] = (dstPos[j] << 6) | found; // pack pairing (found < 32)
    }
  }
  // DUPLICATES: the general path pairs equal identities by OCCURRENCE ORDER
  // (the chained index map). Displaced↔displaced pairing above is ascending
  // on both sides, so it agrees; but an aligned run was matched by POSITION,
  // and if a displaced identity also occurs inside a run the two algorithms
  // can hand different occurrences different owners (row-local state moves;
  // a shrink could dispose the wrong one). Decline that case — general path.
  if (srcPos.length !== 0 || dstPos.length !== 0) {
    const displaced = new Set();
    for (i = 0; i < srcPos.length; i++) displaced.add(oldItems[srcPos[i]]);
    for (j = 0; j < dstPos.length; j++) displaced.add(newItems[dstPos[j] >> 6]);
    for (let r = 0; r < runs.length; r += 3) {
      const ro = runs[r];
      for (let a = 0, n = runs[r + 2]; a < n; a++)
        if (displaced.has(oldItems[ro + a])) return false;
    }
  }
  const oldMappings = data._mappings;
  const oldNodes = data._nodes;
  const mappings = oldMappings.slice(0, newLen);
  const nodes = oldNodes.slice(0, newLen);
  for (let r = 0; r < runs.length; r += 3) {
    const ro = runs[r];
    const rn = runs[r + 1];
    if (ro !== rn) {
      for (let a = 0; a < runs[r + 2]; a++) {
        mappings[rn + a] = oldMappings[ro + a];
        nodes[rn + a] = oldNodes[ro + a];
      }
    }
  }
  for (j = 0; j < dstPos.length; j++) {
    const p = dstPos[j] >> 6;
    const q = srcPos[dstPos[j] & 63];
    mappings[p] = oldMappings[q];
    nodes[p] = oldNodes[q];
  }
  data._mappings = mappings;
  data._nodes = nodes;
  data._len = newLen;
  data._items = newItems.slice(0);
  // Dispose unmatched sources LAST (general-path ordering).
  for (i = 0; i < srcPos.length; i++) {
    if (consumed === undefined || !consumed[i]) oldNodes[srcPos[i]].dispose();
  }
  return true;
}
function updateKeyedMap() {
  const newItems = this._list() || [],
    newLen = newItems.length;
  newItems[$TRACK]; // top level tracking
  runWithOwner(this._owner, () => {
    let i,
      j,
      rows,
      indexes,
      // Mappers write freshly-created row/index signals into the STAGE
      // arrays (`rows`/`indexes`), never into `this._rows`/`this._indexes`.
      mapper = this._rows
        ? this._byIndex
          ? () => {
              rows[j] = signal(newItems[j], pureOptions);
              return this._map(accessor(rows[j]), j);
            }
          : () => {
              rows[j] = signal(newItems[j], pureOptions);
              indexes && (indexes[j] = signal(j, pureOptions));
              return this._map(accessor(rows[j]), indexes ? accessor(indexes[j]) : undefined);
            }
        : this._indexes
          ? () => {
              const item = newItems[j];
              indexes[j] = signal(j, pureOptions);
              return this._map(item, accessor(indexes[j]));
            }
          : () => {
              const item = newItems[j];
              return this._map(item);
            };
    // fast path for empty arrays
    if (newLen === 0) {
      if (this._len !== 0) {
        this._owner.dispose(false);
        this._nodes = [];
        this._items = [];
        this._mappings = [];
        this._len = 0;
        this._rows && (this._rows = []);
        this._indexes && (this._indexes = []);
      }
      if (this._fallback && !this._mappings[0]) {
        // an aborted fallback attempt leaves an owner without a mapping;
        // dispose it before re-creating
        this._nodes[0]?.dispose();
        this._mappings[0] = runWithOwner((this._nodes[0] = createOwner()), this._fallback);
      }
    }
    // fast path for new create
    else if (this._len === 0) {
      const mappings = new Array(newLen);
      const nodes = new Array(newLen);
      rows = this._rows && new Array(newLen);
      indexes = this._indexes && new Array(newLen);
      try {
        for (j = 0; j < newLen; j++) mappings[j] = runWithOwner((nodes[j] = createOwner()), mapper);
      } catch (err) {
        for (i = 0; i <= j; i++) nodes[i]?.dispose();
        throw err;
      }
      // commit
      if (this._nodes[0]) this._nodes[0].dispose(); // previous fallback
      this._mappings = mappings;
      this._nodes = nodes;
      rows && (this._rows = rows);
      indexes && (this._indexes = indexes);
      this._items = newItems.slice(0);
      this._len = newLen;
    } else {
      let start,
        end,
        newEnd,
        item,
        key,
        newIndices,
        newIndicesNext,
        removed,
        created,
        // Dev (attribution engine installed): the items behind the exited and
        // entered rows, for the list-identity census.
        removedItems,
        createdItems;
      // The pass's write to a per-slot signal (a row accessor in index mode,
      // an index accessor in keyed mode). The list's frame lives in these
      // writes as much as in the computed's result, so under a LANE pass they
      // are the lane's frame too (F1): a plain `setSignal` staged them into
      // the action's transaction and the row readers were served the
      // committed value until the action landed — `<For>` without `keyed`
      // showed the pre-action list for the whole action while the keyed modes
      // showed the optimistic one. The engine publishes the write as a
      // derived override on the slot (lanes stage, A17) and lands or
      // supersedes it when a plain pass later writes a slot still carrying
      // one (A18) — `landOnOverride`'s slot arm. Decided once per pass, not
      // per slot: a lane pass marks the map (`_laneSlots`: its slots may
      // carry overrides), a marked map routes every slot write through the
      // engine while any lane is live — a slot's override resolves with its
      // lane's transaction, or with the batch for an orphan lane
      // (resolveOptimisticNodes, then cleanupCompletedLanes, both before the
      // completion wakes any recompute), so a pass that finds no lane live
      // knows the slots are clean and drops the mark — and an unmarked map
      // takes `setSignal` directly. The engine is installed whenever a lane
      // is active.
      const write = (this._laneSlots =
        currentOptimisticLane !== null || (this._laneSlots && activeLanes.size !== 0))
        ? GlobalQueue._landOnOverride
        : setSignal;
      // skip common prefix
      for (
        start = 0, end = Math.min(this._len, newLen);
        start < end &&
        (this._items[start] === newItems[start] ||
          (this._rows && compare(this._key, this._items[start], newItems[start])));
        start++
      ) {
        if (this._rows) write(this._rows[start], newItems[start]);
      }
      // skip common suffix — counted only; retained entries land in one pass
      // at commit instead of being staged and copied twice
      for (
        end = this._len - 1, newEnd = newLen - 1;
        end >= start &&
        newEnd >= start &&
        (this._items[end] === newItems[newEnd] ||
          (this._rows && compare(this._key, this._items[end], newItems[newEnd])));
        end--, newEnd--
      );
      // no structural change (every position matched in place at equal
      // length — the common post-reconcile shape): keep the same mapped
      // array identity so downstream consumers don't re-run at all
      if (start === newLen && this._len === newLen) {
        this._items = newItems.slice(0);
        return;
      }
      // SMALL-MOVE FAST PATH: extracted to its own function — inlining it
      // here bloats updateKeyedMap past the JIT's optimization budget and
      // deoptimizes the GENERAL path (measured 2x on reverse). Gated to
      // LARGE trimmed windows: when the trims already shrank the window
      // (plain removals, tail edits), the general path is window-
      // proportional and cheap — the fast path would only re-walk what the
      // trims proved.
      if (
        newLen <= this._len &&
        end - start > 64 &&
        this._rows === undefined &&
        this._indexes === undefined
      ) {
        // PROBE before the scan: a small move keeps a mid-window item within
        // ±32 of its old position; a REPLACE (all fresh items — the shape
        // every page's first structural pass usually is) has it nowhere.
        // ~65 compares, no allocation, and the scan function is never
        // compiled for a replace (its cold first-call compile was the cost).
        const m = start + ((newEnd - start) >> 1);
        const probe = newItems[m];
        const hi = Math.min(end, m + 32);
        let k = Math.max(start, m - 32);
        while (k <= hi && this._items[k] !== probe) k++;
        if (k <= hi && trySmallMove(this, newItems, newLen, start)) return;
      }
      const dif = newLen - this._len;
      const temp = new Array(newLen);
      const tempNodes = new Array(newLen);
      rows = this._rows ? new Array(newLen) : undefined;
      indexes = this._indexes ? new Array(newLen) : undefined;
      // 0) prepare a map of all indices in the changed window of newItems,
      // scanning backwards so we encounter them in natural order
      newIndices = new Map();
      newIndicesNext = new Array(newEnd + 1);
      for (j = newEnd; j >= start; j--) {
        item = newItems[j];
        key = this._key ? this._key(item) : item;
        i = newIndices.get(key);
        newIndicesNext[j] = i === undefined ? -1 : i;
        newIndices.set(key, j);
      }
      // 1) step through the old changed window and see if items can be found
      // in the new set; if so, stage them at their new positions; if not,
      // queue them for disposal at commit
      for (i = start; i <= end; i++) {
        item = this._items[i];
        key = this._key ? this._key(item) : item;
        j = newIndices.get(key);
        if (j !== undefined && j !== -1) {
          temp[j] = this._mappings[i];
          tempNodes[j] = this._nodes[i];
          rows && (rows[j] = this._rows[i]);
          indexes && (indexes[j] = this._indexes[i]);
          j = newIndicesNext[j];
          newIndices.set(key, j);
        } else {
          (removed ??= []).push(this._nodes[i]);
          if (true && attrHooks !== null) (removedItems ??= []).push(item);
        }
      }
      // 2) create new rows into the temp arrays; an abort disposes only these
      try {
        for (j = start; j <= newEnd; j++) {
          if (tempNodes[j] !== undefined) continue;
          (created ??= []).push((tempNodes[j] = createOwner()));
          if (true && attrHooks !== null) (createdItems ??= []).push(newItems[j]);
          temp[j] = runWithOwner(tempNodes[j], mapper);
        }
      } catch (err) {
        if (created) for (i = 0; i < created.length; i++) created[i].dispose();
        throw err;
      }
      // 3) commit: land the retained prefix and suffix plus the staged window
      // into the fresh arrays, swap them in (new identity for downstream
      // change propagation), then dispose exited rows
      for (i = 0; i < start; i++) {
        temp[i] = this._mappings[i];
        tempNodes[i] = this._nodes[i];
        rows && (rows[i] = this._rows[i]);
        indexes && (indexes[i] = this._indexes[i]);
      }
      for (j = start; j <= newEnd; j++) {
        if (rows) write(rows[j], newItems[j]);
        if (indexes) write(indexes[j], j);
      }
      for (j = newEnd + 1; j < newLen; j++) {
        temp[j] = this._mappings[j - dif];
        tempNodes[j] = this._nodes[j - dif];
        if (rows) {
          rows[j] = this._rows[j - dif];
          write(rows[j], newItems[j]);
        }
        if (indexes) {
          indexes[j] = this._indexes[j - dif];
          if (dif !== 0) write(indexes[j], j);
        }
      }
      this._mappings = temp;
      this._nodes = tempNodes;
      rows && (this._rows = rows);
      indexes && (this._indexes = indexes);
      this._len = newLen;
      // save a copy of the mapped items for the next update
      this._items = newItems.slice(0);
      if (removed) for (i = 0; i < removed.length; i++) removed[i].dispose();
      if (true && attrHooks !== null && removedItems !== undefined && createdItems !== undefined)
        attrHooks.listChurn(
          this._owner._parentComputed,
          removedItems,
          createdItems,
          newLen,
          this._key !== undefined
        );
    }
  });
  return this._mappings;
}
/**
 * Reactively renders a callback `count` times, reusing previously-rendered
 * entries when only the count changes. Underlying helper for `<Repeat>`.
 *
 * - `options.from` — start index (default `0`); useful for offset/windowed
 *   rendering.
 * - `options.fallback` — accessor returning a value to show when count is `0`.
 *
 * @example
 * ```ts
 * const view = repeat(count, i => `Item ${i}`, { fallback: () => "empty" });
 * ```
 *
 * @description https://docs.solidjs.com/reference/reactive-utilities/repeat
 */
function repeat(count, map, options) {
  const wrappedMap = options?.name
    ? i => {
        setStrictRead(options.name);
        try {
          return map(i);
        } finally {
          setStrictRead(false);
        }
      }
    : map;
  const data = {
    _owner: createOwner(),
    _len: 0,
    _offset: 0,
    _count: count,
    _map: wrappedMap,
    _nodes: [],
    _mappings: [],
    _from: options?.from,
    _fallback: options?.fallback
  };
  const node = computed(updateRepeat.bind(data));
  // Same as mapArray: untracked reads inside the internal owner resolve via
  // _parentComputed, so async reads in row callbacks register with the node
  // (pending tracking + post-settle retry) instead of vanishing.
  data._owner._parentComputed = node;
  node._config &= ~CONFIG_AUTO_DISPOSE;
  return accessor(node);
}
// Same staged-commit discipline as `updateKeyedMap` (#2903): the retained
// window overlap is copied into fresh arrays, missing indexes are created
// into them, and `this` is only touched — including disposal of rows leaving
// the window — after every `_map` call succeeded. A NotReadyError mid-pass
// disposes only the owners this pass created and leaves prior state intact
// for the post-settle retry. The overlap math also subsumes the previous
// disjoint-window/front-clear/end-clear/shift special cases.
function updateRepeat() {
  const newLen = this._count();
  const from = this._from?.() || 0;
  runWithOwner(this._owner, () => {
    if (newLen === 0) {
      if (this._len !== 0) {
        this._owner.dispose(false);
        this._nodes = [];
        this._mappings = [];
        this._len = 0;
        // Reset offset to match the cleared data (#2767, repro 2).
        this._offset = 0;
      }
      if (this._fallback && !this._mappings[0]) {
        // an aborted fallback attempt leaves an owner without a mapping;
        // dispose it before re-creating
        this._nodes[0]?.dispose();
        this._mappings[0] = runWithOwner((this._nodes[0] = createOwner()), this._fallback);
      }
      return;
    }
    const to = from + newLen;
    const prevTo = this._offset + this._len;
    // Retained overlap [keepStart, keepEnd) in global indexes; empty when the
    // windows are disjoint or when coming from empty/fallback.
    const keepStart = Math.max(from, this._offset);
    const keepEnd = Math.min(to, prevTo);
    const mappings = new Array(newLen);
    const nodes = new Array(newLen);
    for (let i = keepStart; i < keepEnd; i++) {
      nodes[i - from] = this._nodes[i - this._offset];
      mappings[i - from] = this._mappings[i - this._offset];
    }
    try {
      for (let i = from; i < to; i++) {
        if (i >= keepStart && i < keepEnd) continue;
        mappings[i - from] = runWithOwner((nodes[i - from] = createOwner()), () => this._map(i));
      }
    } catch (err) {
      for (let i = from; i < to; i++)
        if ((i < keepStart || i >= keepEnd) && nodes[i - from]) nodes[i - from].dispose();
      throw err;
    }
    // commit: dispose the previous fallback or the rows leaving the window
    if (this._len === 0) this._nodes[0]?.dispose();
    else
      for (let i = this._offset; i < prevTo; i++)
        if (i < from || i >= to) this._nodes[i - this._offset].dispose();
    this._mappings = mappings;
    this._nodes = nodes;
    this._offset = from;
    this._len = newLen;
  });
  return this._mappings;
}
function compare(key, a, b) {
  return key ? key(a) === key(b) : true;
}

function boundaryComputed(fn, propagationMask) {
  const node = computed(fn, { name: "boundary", lazy: true });
  ext(node)._notifyStatus = (status, error) => {
    // Use passed values if provided, otherwise read from node
    const flags = status !== undefined ? status : node._statusFlags;
    const actualError = error !== undefined ? error : node._x?._error;
    // Notify both status dimensions like a render effect does; the queue chain
    // consumes this boundary's own type and forwards the remainder upward until
    // a boundary that handles it is found.
    node._statusFlags &= ~node._propagationMask;
    const handled = node._queue.notify(node, STATUS_PENDING | STATUS_ERROR, flags, actualError);
    // The queue is the only propagation channel: a foreign status must not stay
    // reader-visible on the tree, or reads re-throw it across the boundary and
    // link unrelated ambient contexts (the #2809 nested-boundary loop). Deps are
    // untouched, so the tree still recomputes when the foreign source settles.
    const foreign = flags & ~node._propagationMask & (STATUS_PENDING | STATUS_ERROR);
    if (foreign) {
      node._statusFlags &= ~foreign;
      if (node._x?._error === actualError && !(node._statusFlags & (STATUS_PENDING | STATUS_ERROR)))
        if (node._x !== null) node._x._error = undefined;
    }
    // An ERROR the chain could not deliver to any boundary is uncaught. The
    // scrub above already removed it from reader-visible state, so without
    // escalation here it would vanish entirely (#2884) — halt-and-throw,
    // exactly like an unhandled effect error.
    if (!handled && flags & STATUS_ERROR) {
      haltReactivity(unwrapStatusError(actualError));
      throw actualError;
    }
  };
  node._propagationMask = propagationMask;
  node._config &= ~CONFIG_AUTO_DISPOSE;
  recompute(node, true);
  return node;
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
 */
function onNode(owner, queue, onFn) {
  let mounted = false;
  const node = runWithOwner(owner, () =>
    computed(
      () => {
        try {
          onFn();
        } catch (e) {
          if (!(e instanceof NotReadyError)) throw e;
        }
        if (mounted) {
          if (currentOptimisticLane !== null) queue._rearmLane = currentOptimisticLane;
          queueRearm(queue);
        } else mounted = true;
      },
      { lazy: true }
    )
  );
  ext(node)._notifyStatus = (status, error) => {
    const flags = status !== undefined ? status : node._statusFlags;
    if (flags & STATUS_PENDING) {
      node._statusFlags &= ~STATUS_PENDING;
      if (node._x?._error instanceof NotReadyError) node._x._error = undefined;
      enqueueSub(node);
      schedule();
    }
    if (flags & STATUS_ERROR) {
      const actualError = error !== undefined ? error : node._x?._error;
      node._statusFlags &= ~STATUS_ERROR;
      if (node._x?._error === actualError && node._x !== null) node._x._error = undefined;
      if (!node._queue.notify(node, STATUS_ERROR, flags, actualError)) {
        haltReactivity(unwrapStatusError(actualError));
        throw actualError;
      }
    }
  };
  node._config &= ~CONFIG_AUTO_DISPOSE;
  recompute(node, true);
  return node;
}
function createBoundChildren(owner, fn, queue, mask) {
  const parentQueue = owner._queue;
  parentQueue.addChild((owner._queue = queue));
  cleanup(() => parentQueue.removeChild(owner._queue));
  // Named for the observe tier's owner paths: user content under a boundary
  // is owned by `children`, and the boundary's own two nodes read as
  // structure rather than as anonymous `computed`s between `<Loading>` and
  // the content (`<App> › <Loading> › children › <Feed>`).
  return runWithOwner(owner, () => {
    // The call, not the argument, is gated: `computed(fn, void 0)` would keep
    // a trailing argument in the prod artifact.
    const c = true ? computed(fn, { name: "children" }) : computed(fn);
    return boundaryComputed(() => flatten(read(c)), mask);
  });
}
const RevealControllerContext = /* @__PURE__ */ createContext(null);
let _revealUsed = false;
const FALSE_ACCESSOR = () => false;
const SEQUENTIAL_ACCESSOR = () => "sequential";
function isRevealController(slot) {
  return slot instanceof RevealController;
}
function isSlotReady(slot) {
  return isRevealController(slot) ? slot._isReady() : slot._sources.size === 0 && !slot._pending;
}
function isSlotMinimallyReady(slot) {
  return isRevealController(slot) ? slot._isMinimallyReady() : isSlotReady(slot);
}
function setSlotState(slot, controller, disabled, collapsed) {
  setSignal(slot._disabled, disabled);
  setSignal(slot._collapsed, collapsed);
  if (isRevealController(slot)) {
    if (!disabled && slot._parentController === controller) slot._parentController = undefined;
    return slot._evaluate(disabled, collapsed);
  }
  if (!disabled && slot._revealController === controller && slot._initialized)
    slot._revealController = undefined;
}
class RevealController {
  _orderAccessor;
  _collapsedAccessor;
  _slots = [];
  _parentController;
  _disabled = signal(false, { ownedWrite: true, _noSnapshot: true });
  _collapsed = signal(false, { ownedWrite: true, _noSnapshot: true });
  _ready = true;
  _minimallyReady = true;
  _evaluating = false;
  constructor(order, collapsed) {
    this._orderAccessor = order;
    this._collapsedAccessor = collapsed;
  }
  _forEachOwnedSlot(fn) {
    for (let i = 0; i < this._slots.length; i++) {
      const slot = this._slots[i];
      if ((isRevealController(slot) ? slot._parentController : slot._revealController) !== this)
        continue;
      if (fn(slot) === false) return false;
    }
    return true;
  }
  _isReady() {
    return this._forEachOwnedSlot(isSlotReady);
  }
  /**
   * "Minimally ready" = this group has something visible to show under its own policy.
   * Used by an enclosing `together` group to decide when it can release.
   * - `together`: every direct slot is minimally ready.
   * - `sequential`: the first owned slot is minimally ready (frontier can advance).
   * - `natural`: any owned slot is minimally ready.
   */
  _isMinimallyReady() {
    const order = untrack(this._orderAccessor);
    if (order === "together") return this._forEachOwnedSlot(isSlotMinimallyReady);
    if (order === "natural") {
      let hasSlot = false;
      let anyReady = false;
      this._forEachOwnedSlot(slot => {
        hasSlot = true;
        if (isSlotMinimallyReady(slot)) {
          anyReady = true;
          return false;
        }
      });
      return !hasSlot || anyReady;
    }
    // sequential: only the first owned slot matters.
    let firstReady = true;
    this._forEachOwnedSlot(slot => {
      firstReady = isSlotMinimallyReady(slot);
      return false;
    });
    return firstReady;
  }
  _register(slot) {
    if (this._slots.includes(slot)) return;
    this._slots.push(slot);
    const order = untrack(this._orderAccessor);
    (setSignal(slot._disabled, true),
      setSignal(
        slot._collapsed,
        order === "sequential" ? !!untrack(this._collapsedAccessor) : false
      ));
    untrack(() => this._evaluate());
  }
  _unregister(slot) {
    const index = this._slots.indexOf(slot);
    if (index >= 0) this._slots.splice(index, 1);
    untrack(() => this._evaluate());
  }
  _evaluate(disabledOverride, collapsedOverride) {
    if (this._evaluating) return;
    this._evaluating = true;
    const wasReady = this._ready;
    const wasMinReady = this._minimallyReady;
    try {
      const disabled = disabledOverride ?? read(this._disabled),
        order = untrack(this._orderAccessor),
        collapseTail = order === "sequential" && !!untrack(this._collapsedAccessor),
        collapsed = collapsedOverride ?? collapseTail;
      if (disabled) {
        // Held by an outer group. Propagate the hold (and whatever collapsed policy
        // the outer asked for) down the whole subtree. Inner order is ignored while
        // held; it resumes once the outer releases us.
        this._forEachOwnedSlot(slot => setSlotState(slot, this, true, collapsed));
      } else if (order === "natural") {
        // Each child reveals based on its own readiness. A nested controller slot
        // is released to run its own order locally — we bypass setSlotState for it
        // so the parent backpointer survives for upward readiness notifications.
        this._forEachOwnedSlot(slot => {
          if (isRevealController(slot)) {
            setSignal(slot._collapsed, false);
            setSignal(slot._disabled, false);
            slot._evaluate(false, false);
          } else {
            setSlotState(slot, this, !isSlotReady(slot), false);
          }
        });
      } else if (order === "together") {
        // Release when every direct slot is minimally ready (has something to show
        // under its own order). A fully-ready inner together is minimally ready;
        // sequential's first slot being ready is minimally ready; natural having any
        // ready child is minimally ready. This lets `together` guarantee a single
        // cohesive reveal without waiting for every grandchild.
        const minReady = this._forEachOwnedSlot(isSlotMinimallyReady);
        this._forEachOwnedSlot(slot => setSlotState(slot, this, !minReady, false));
      } else {
        let pendingSeen = false;
        this._forEachOwnedSlot(slot => {
          if (pendingSeen) return setSlotState(slot, this, true, collapseTail);
          if (isSlotReady(slot)) return setSlotState(slot, this, false, false);
          pendingSeen = true;
          // Frontier slot. For a leaf, holding `_disabled=true` is what keeps its
          // fallback visible. For a composite, we instead release it so it runs
          // its own order locally — its leaves will each show their own fallback
          // until their data lands. Outer still waits on full readiness before
          // advancing past this slot, and we bypass setSlotState so the parent
          // backpointer survives for upward readiness notifications.
          if (isRevealController(slot)) {
            setSignal(slot._collapsed, false);
            setSignal(slot._disabled, false);
            slot._evaluate(false, false);
          } else {
            setSlotState(slot, this, true, false);
          }
        });
      }
    } finally {
      this._ready = this._isReady();
      this._minimallyReady = this._isMinimallyReady();
      this._evaluating = false;
    }
    if (
      this._parentController &&
      (wasReady !== this._ready || wasMinReady !== this._minimallyReady)
    )
      this._parentController._evaluate();
  }
}
class CollectionQueue extends Queue {
  _collectionType;
  _sources = new Set();
  _tree;
  /** The output pass — fallback or content (createCollectionBoundary). */
  _output;
  _pending = true;
  _disabled = signal(false, { ownedWrite: true, _noSnapshot: true });
  _error;
  _collapsed = signal(false, { ownedWrite: true, _noSnapshot: true });
  _revealController;
  _initialized = false;
  /** The boundary's owner — where a `caught` report locates itself, set before the children are built (a creation-time throw arrives before `_tree`). */
  _owner;
  /** The lane the `on` pass that queued this re-arm ran under (onNode), if
   * any: the fallback swap is display-ahead — shown through the lane. */
  _rearmLane = null;
  constructor(type) {
    super();
    this._collectionType = type;
  }
  run(type) {
    if (!type || (read(this._disabled) && (!_revealUsed || read(this._collapsed)))) return;
    return super.run(type);
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
   * Children stay alive behind the fallback. */
  _rearm() {
    const lane = this._rearmLane;
    this._rearmLane = null;
    if (this._tree === undefined || this._tree._flags & REACTIVE_DISPOSED) return;
    if (!this._initialized) return;
    // Readers forwarded while this boundary showed content are what it
    // would wait on now. They never re-notify (status propagation dedupes on
    // the reader's `_pendingSources`), so the re-arm collects it from their
    // registrations — the one place a forwarded reader is recorded (INV-3)
    // — or a sibling reader's flight that lands first reveals them stale
    // (A33, #3459). Before the verdict, a registration may have stopped
    // counting without being pruned yet (its flight landed this pass):
    // `reporterBlocksSource` is the verdict's own test.
    const sources = new Set();
    let outside;
    for (const t of transitions)
      for (const [source, reporters] of t._asyncReporters) {
        let held = false;
        for (const reporter of reporters)
          if (this._holds(reporter) && reporterBlocksSource(reporter, source)) {
            held = true;
            sources.add(source);
            reporter._x?._pendingSources?.forEach(s => sources.add(s));
          }
        // DEV: the same source is also awaited by a live reporter OUTSIDE
        // this boundary — one whose hold the frame keeps, so the frame (and
        // the swap with it) waits for the very source the boundary is
        // waiting on: the fallback can never be seen. Deterministic and
        // structural — the one shape LOADING_ON_OUTSIDE_HOLD reports (below).
        // A frame held by OTHER pending data, or by the write's action, past
        // the content's landing is a race the fallback may lose, and a
        // legitimate outcome: not reported. Not for a display-ahead re-arm
        // either: that fallback shows now by the user's choice.
        if (held && lane === null && outside === undefined)
          for (const reporter of reporters)
            if (!this._holds(reporter) && reporterBlocksSource(reporter, source)) {
              outside = source;
              break;
            }
      }
    if (!sources.size) return;
    if (outside !== undefined) {
      const name = outside._name;
      reportUnseen(
        this,
        `${name ? `\`${name}\`` : "a source it is waiting on"} is also read outside it and holds the frame: the fallback can never be seen — the frame waits on the very source the boundary is waiting on. ` +
          "Move the outside read under the boundary so one hold owns the data. (Reading `latest()` in `on` shows the fallback now, beside the held frame.)",
        name
      );
    }
    this._initialized = false;
    this._sources = sources;
    this._pending = true;
    this._swap(lane);
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
   * writes committed, so a staged swap would be invisible to it). */
  _swap(lane) {
    if (lane === null) setSignal(this._disabled, true);
    else {
      this._disabled._value = true;
      notifyOnLane(this._disabled, lane);
    }
    // Observe: the staged swap is displayed when the transaction carrying
    // this pass commits; the lane's readers run in this drain.
    if (attrHooks !== null)
      attrHooks.boundaryFallback(this, this._tree, true, lane === null ? activeTransition : null);
  }
  /** Retry the collected failures of an error boundary: recompute each
   * source that threw, so the boundary can recover. */
  _retry() {
    for (const source of this._sources) {
      // Non-computed sources (patch-channel registrations under plain
      // owners) are not recomputable — their reset is the record's next
      // transition re-applying the patch (re-audit 2, P1-4).
      if (source._fn !== undefined) recompute(source);
    }
    schedule();
  }
  notify(node, type, flags, error) {
    if (!(type & this._collectionType)) return super.notify(node, type, flags, error);
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
    if (this._collectionType & STATUS_PENDING && this._initialized)
      return super.notify(node, type, flags, error);
    if (flags & this._collectionType) {
      this._pending = true;
      const source = error?.source || node._x?._error?.source;
      if (source) {
        const wasEmpty = this._sources.size === 0;
        this._sources.add(source);
        // A collecting boundary waits on everything the effect is pending on,
        // not only the source this notification carries. Status propagation
        // dedupes on the effect's `_pendingSources`: a source it already
        // carries (a flight that started before an `on` reset cleared the
        // set) is never re-reported, and that source's later re-flight
        // stays invisible — the boundary revealed when its one collected
        // source settled while the effect was still pending (#3375).
        if (this._collectionType & STATUS_PENDING)
          node._x?._pendingSources?.forEach(s => this._sources.add(s));
        if (wasEmpty) {
          setSignal(this._disabled, true);
          if (attrHooks !== null && this._collectionType & STATUS_PENDING)
            attrHooks.boundaryFallback(this, this._tree, true, activeTransition);
        }
        if (this._collectionType & STATUS_ERROR) {
          const caught = unwrapStatusError(source._x?._error);
          setSignal(this._error, caught);
          // The client error hook: this boundary renders its fallback for
          // it — the one road a rendered failure took that no global handler
          // ever saw. `source` is the computation that threw (the status
          // wrapper's, made at the first landing and kept downstream), so the
          // hook hears where it broke as well as where it was met. Once per
          // error object; a `reset()` re-collecting the same failure says
          // nothing new.
          reportClientError(caught, this._owner, source);
        }
      }
    }
    type &= ~this._collectionType;
    return type ? super.notify(node, type, flags, error) : true;
  }
  /** Is `reporter` live and routed to this boundary — under it, with no
   * collecting pending-type boundary in between (`reporterBlocksSource`'s test)? */
  _holds(reporter) {
    if (reporter._flags & (REACTIVE_ZOMBIE | REACTIVE_DISPOSED)) return false;
    for (let q = reporter._queue; q; q = q._parent) {
      if (q === this) return true;
      if (q._collectionType & STATUS_PENDING && !q._initialized) return false;
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
   * commit that initializes it. */
  _settled(source) {
    return !!(
      source._flags & REACTIVE_DISPOSED ||
      (!source._x?._affectsCount &&
        !(source._statusFlags & this._collectionType) &&
        !(this._collectionType & STATUS_ERROR && source._statusFlags & STATUS_PENDING) &&
        !(
          this._collectionType & STATUS_PENDING &&
          source._statusFlags & STATUS_UNINITIALIZED &&
          source._pendingValue !== NOT_PENDING
        ))
    );
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
   * commit sweep's reveal. */
  _judgeHeld() {
    if (this._initialized || !(this._output._statusFlags & STATUS_PENDING)) return;
    this._checkSources();
  }
  _checkSources() {
    for (const source of this._sources) if (this._settled(source)) this._sources.delete(source);
    if (!this._sources.size) {
      if (
        this._collectionType & STATUS_PENDING &&
        this._pending &&
        !this._initialized &&
        this._tree
      ) {
        this._pending = !!(this._tree._statusFlags & this._collectionType);
      } else {
        this._pending = false;
      }
      if (!this._pending) {
        setSignal(this._disabled, false);
        if (attrHooks !== null && this._collectionType & STATUS_PENDING)
          attrHooks.boundaryFallback(this, this._tree, false);
      }
    }
    if (_revealUsed) this._revealController?._evaluate();
  }
}
/** DEV: LOADING_ON_OUTSIDE_HOLD — a frame-following re-arm whose fallback
 * can never be seen, with the reason (`detail`) and the fix. One rule, at
 * the change (`_rearm`): the source the boundary waits on is also read
 * outside it. A fallback cleared after the fact — the frame held by an
 * action or by other pending data past the content's landing — is a race
 * the engine cannot tell from a structural hold, and a legitimate outcome:
 * never reported. Called only under `true`, so prod shakes it. */
function reportUnseen(queue, detail, name) {
  reportDiagnostic(
    emitDiagnostic(
      {
        code: "LOADING_ON_OUTSIDE_HOLD",
        kind: "async",
        severity: "warn",
        message: `[LOADING_ON_OUTSIDE_HOLD] \`on\` re-armed a Loading boundary, but ${detail}`,
        nodeName: name,
        data: { source: name }
      },
      queue._owner
    )
  );
}
function createCollectionBoundary(type, fn, fallback, onFn) {
  if (!getOwner()) {
    const message =
      "[NO_OWNER_BOUNDARY] Boundaries created outside a reactive context will never be disposed.";
    reportDiagnostic(
      emitDiagnostic({
        code: "NO_OWNER_BOUNDARY",
        kind: "lifecycle",
        severity: "warn",
        message,
        data: { boundaryType: type === STATUS_PENDING ? "loading" : "error" }
      })
    );
  }
  const owner = createOwner();
  if (_revealUsed) setContext(RevealControllerContext, null, owner);
  const queue = new CollectionQueue(type);
  queue._owner = owner;
  if (type === STATUS_ERROR)
    queue._error = signal(undefined, { ownedWrite: true, _noSnapshot: true });
  // The `on` dependencies live OUTSIDE the boundary, as the condition of a
  // `<Show>` wrapping it would: created before the owner's queue becomes
  // this boundary's (onNode).
  onFn && onNode(owner, queue, onFn);
  const tree = (queue._tree = createBoundChildren(owner, fn, queue, type));
  // Prime source tracking so reveal registration sees pending sources. A
  // bookkeeping read (`spectate`): the mounting pass derives nothing from
  // the tree — it must not be linked to it, nor enter the transaction a
  // tree born held (A29 under a boundary, #3540) was staged into.
  spectate(() => {
    let pending = false;
    try {
      read(tree);
    } catch (e) {
      if (e instanceof NotReadyError) pending = true;
      else throw e;
    }
    queue._pending =
      pending || !!(tree._statusFlags & type) || tree._x?._error instanceof NotReadyError;
  });
  const controller =
    _revealUsed && type === STATUS_PENDING ? getContext(RevealControllerContext) : null;
  if (controller) {
    queue._revealController = controller;
    controller._register(queue);
    cleanup(() => controller._unregister(queue));
  }
  return accessor(
    (queue._output = computed(
      () => {
        // `_disabled` selects fallback or content: set by a collecting
        // notification or a re-arm (`_rearm`), cleared by the sweep when the
        // collected sources settle — each re-runs this pass.
        if (!read(queue._disabled)) {
          const resolved = read(tree);
          if (!untrack(() => read(queue._disabled))) return ((queue._initialized = true), resolved);
        }
        // Collapsed reveal slots suppress their own output entirely; the
        // renderer treats the hole as empty, so the cast never leaks to users
        // outside a `createRevealOrder` scope.
        if (_revealUsed && read(queue._collapsed)) return undefined;
        return fallback(queue);
      },
      // Boundary structure, not a user source: its value is fallback-or-content and
      // legitimately swaps mid-hydration (reveal/resume), so it must never be frozen
      // by snapshot capture. The tree no longer carries foreign status flags, so
      // capture can't rely on PENDING to skip this node the way it used to.
      { name: "value", _noSnapshot: true }
    ))
  );
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
 */
function createLoadingBoundary(fn, fallback, options) {
  return createCollectionBoundary(STATUS_PENDING, fn, () => fallback(), options?.on);
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
 */
function createErrorBoundary(fn, fallback) {
  return createCollectionBoundary(STATUS_ERROR, fn, queue =>
    fallback(accessor(queue._error), () => queue._retry())
  );
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
 */
function createRevealOrder(fn, options) {
  _revealUsed = true;
  const owner = createOwner();
  const parentController = getContext(RevealControllerContext);
  const order = options?.order || SEQUENTIAL_ACCESSOR,
    collapsed = options?.collapsed || FALSE_ACCESSOR;
  const controller = new RevealController(order, collapsed);
  setContext(RevealControllerContext, controller, owner);
  return runWithOwner(owner, () => {
    const value = fn();
    const evaluate = computed(() => {
      order();
      collapsed();
      controller._evaluate();
    });
    // Post-construction rather than an options argument, so the prod call
    // keeps its shape; the observe node literal already carries the slot.
    if (true) evaluate._name = "reveal order";
    if (parentController) {
      controller._parentController = parentController;
      parentController._register(controller);
      cleanup(() => parentController._unregister(controller));
    }
    return value;
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
 */
function flatten(children, options) {
  if (typeof children === "function" && !children.length) {
    if (options?.doNotUnwrap) return children;
    do {
      children = children();
    } while (typeof children === "function" && !children.length);
  }
  if (
    options?.skipNonRendered &&
    (children == null || children === true || children === false || children === "")
  )
    return;
  if (Array.isArray(children)) {
    let results = [];
    if (flattenArray(children, results, options)) {
      return () => {
        let nested = [];
        flattenArray(results, nested, { ...options, doNotUnwrap: false });
        return nested;
      };
    }
    return results;
  }
  return children;
}
function flattenArray(children, results = [], options) {
  let notReady = null;
  let needsUnwrap = false;
  for (let i = 0; i < children.length; i++) {
    try {
      let child = children[i];
      if (typeof child === "function" && !child.length) {
        if (options?.doNotUnwrap) {
          results.push(child);
          needsUnwrap = true;
          continue;
        }
        do {
          child = child();
        } while (typeof child === "function" && !child.length);
      }
      if (Array.isArray(child)) {
        // OR, don't overwrite: an accessor already pushed under doNotUnwrap
        // still needs the resolving wrapper even when a later sibling
        // fragment contains no functions (#3133).
        needsUnwrap = flattenArray(child, results, options) || needsUnwrap;
      } else if (
        options?.skipNonRendered &&
        (child == null || child === true || child === false || child === "")
      ) {
        // skip
      } else results.push(child);
    } catch (e) {
      if (!(e instanceof NotReadyError)) throw e;
      notReady = e;
    }
  }
  if (notReady) throw notReady;
  return needsUnwrap;
}

/**
 * Observe tier (diagnostics channel, attribution hook slot + interaction
 * frame): dev and observe builds. The attribution engine itself is the
 * `@solidjs/signals/attribution` entry.
 */
const OBSERVE = OBSERVE$1;
/** Dev tier (devtools hooks, graph traversal, console reporting): dev builds only. */
const DEV = DEV$1;

export {
  $PROXY,
  $RECORD,
  $REFRESH,
  $TARGET,
  $TRACK,
  ContextNotFoundError,
  DEV,
  MergeView,
  NoOwnerError,
  NotReadyError,
  OBSERVE,
  OmitView,
  ROOT_ERROR_HOOK,
  SOURCE_MEMO,
  SOURCE_MERGE,
  SOURCE_OMIT,
  SOURCE_PLAIN,
  SOURCE_PROXY,
  SUPPORTS_PROXY,
  TimeoutError,
  action,
  affects,
  configureClientErrors,
  createContext,
  createEffect,
  createErrorBoundary,
  createLoadingBoundary,
  createMemo,
  createOptimistic,
  createOptimisticStoreNext as createOptimisticStore,
  createOwner,
  createProjectionNext as createProjection,
  createReaction,
  createRenderEffect,
  createRevealOrder,
  createRoot,
  createSignal,
  createStore,
  createTrackedEffect,
  deep,
  enableExternalSource,
  flatten,
  flush,
  getContext,
  getObserver,
  getOwner,
  hasStaticKeys,
  isDisposed,
  isEqual,
  isPending,
  isStatic,
  isWrappable,
  latest,
  mapArray,
  merge,
  mergeSources,
  mergeView,
  omit,
  omitView,
  onCleanup,
  onSettled,
  reconcile,
  refresh,
  repeat,
  resolve,
  resolvedTable,
  runWithOwner,
  setContext,
  snapshot,
  sourceGet,
  sourceHas,
  sourceKeys,
  sourceOwners,
  storeHasFamily,
  storeHasOptimisticFamily,
  storeIsShallow,
  storePath,
  until,
  untrack,
  viewOf
};
