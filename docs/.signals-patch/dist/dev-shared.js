/**
 * Thrown by a tracked read whose value is currently pending (an async memo /
 * `createSignal(asyncFn)` / projection / store derivation that hasn't settled
 * yet). Surfacing through the reactive graph is what suspends the consumer
 * scope — the nearest enclosing `<Loading>` boundary catches the throw and
 * renders its fallback until the source resolves.
 *
 * App code rarely catches this directly; `<Loading>` is the canonical
 * handler. The error type is exposed for advanced cases — e.g. interop layers
 * that bridge Solid's pending-throw protocol to a different async strategy,
 * or tests that want to assert on the suspension shape.
 *
 * @example
 * ```ts
 * // Advanced: distinguish "not ready yet" from a real error in custom
 * // boundary plumbing. App code should rely on `<Loading>` / `<Errored>`.
 * try {
 *   const value = readReactiveSource();
 * } catch (err) {
 *   if (err instanceof NotReadyError) throw err; // re-throw to suspend
 *   reportError(err);
 * }
 * ```
 */
class NotReadyError extends Error {
  source;
  constructor(source) {
    super();
    this.source = source;
  }
}
class StatusError extends Error {
  source;
  constructor(source, original) {
    super(original instanceof Error ? original.message : String(original), {
      cause: original
    });
    this.source = source;
  }
}
/** Return the user's error from an internal status wrapper. */
function unwrapStatusError(error) {
  return error instanceof StatusError ? error.cause : error;
}
/**
 * Rejection value of `until(fn, { timeout })` when the predicate does not turn
 * truthy within the window. Inside an `action()`, the rejection is thrown back
 * in at the `yield` point — catchable there, or the action fails and its
 * optimistic state reverts.
 */
class TimeoutError extends Error {
  constructor(message = "Timed out waiting for condition") {
    super(message);
    this.name = "TimeoutError";
  }
}
class NoOwnerError extends Error {
  constructor() {
    super("Context can only be accessed under a reactive root.");
  }
}
class ContextNotFoundError extends Error {
  constructor() {
    super(
      "Context must either be created with a default value or a value must be provided before accessing it."
    );
  }
}

const REACTIVE_NONE = 0;
const REACTIVE_CHECK = 1 << 0;
const REACTIVE_DIRTY = 1 << 1;
const REACTIVE_RECOMPUTING_DEPS = 1 << 2;
const REACTIVE_IN_HEAP = 1 << 3;
const REACTIVE_IN_HEAP_HEIGHT = 1 << 4;
const REACTIVE_ZOMBIE = 1 << 5;
const REACTIVE_DISPOSED = 1 << 6;
const REACTIVE_OPTIMISTIC_DIRTY = 1 << 7;
const REACTIVE_SNAPSHOT_STALE = 1 << 8;
const REACTIVE_LAZY = 1 << 9;
const REACTIVE_MANUAL_WRITE = 1 << 10;
/**
 * The pending recompute is a re-ask of the same question: `refresh()` dirtied
 * the node while no tracked input changed value. Cleared whenever a real
 * value-change notification arrives (`insertSubs`), and consumed by
 * `recompute` into the node's `_reask` classification — a quiet (re-ask)
 * pending window does not read as pending (question-scoped pending model).
 */
const REACTIVE_REASK = 1 << 11;
/**
 * A dependency write landed while this subscriber was mid-recompute — a
 * nested pull committed beneath one of its reads (#3037). The heap refuses
 * RECOMPUTING nodes, so recompute's tail consumes this latch and reschedules:
 * values the pass read before the nested commit are stale. Only set for
 * links validated this pass (gen-current): a write to an untouched link is
 * either re-read later in the pass (fresh) or trimmed with it (not a dep).
 */
const REACTIVE_MISSED_WAKE = 1 << 12;
// Static configuration bits packed into Owner/Computed/Signal _config.
const CONFIG_OWNED_WRITE = 1 << 0;
const CONFIG_NO_SNAPSHOT = 1 << 1;
const CONFIG_TRANSPARENT = 1 << 2;
const CONFIG_IN_SNAPSHOT_SCOPE = 1 << 3;
const CONFIG_CHILDREN_FORBIDDEN = 1 << 4;
const CONFIG_AUTO_DISPOSE = 1 << 5;
const CONFIG_SYNC = 1 << 6;
// Presence bits (stage-3 hot-path monomorphism, DESIGN-PATCH-CHANNEL §11b):
// optional per-node slots (_overrideValue, _pendingSignal/_latestValueComputed,
// _snapshotValue, _optimisticLane) are NOT part of every node's hidden class —
// reading a missing property defeats V8's inline caches on the hottest write/
// notify loops. These bits live on the always-present `_config` so hot paths
// pay one monomorphic masked read and only touch the optional field when its
// installer flagged it. Bits are STICKY ("may be set") — the guarded field
// read remains authoritative.
const CONFIG_OPTIMISTIC = 1 << 7;
const CONFIG_HAS_COMPANIONS = 1 << 8;
const CONFIG_HAS_SNAPSHOT = 1 << 9;
const CONFIG_HAS_LANE = 1 << 10;
/** Set on a FIREWALL computed when any of its child signals creates an
 * isPending()/latest() companion. Gates the post-recompute child-companion
 * walk (#3038): a store computed's `_child` chain holds one node per
 * materialized leaf, so walking it unconditionally makes every update cost
 * O(all leaves ever read). Sticky — set at companion creation, never
 * cleared; sync-only apps never set it and never pay the walk. */
const CONFIG_CHILD_COMPANIONS = 1 << 11;
/** Set on a computed when its first firewall child signal is installed
 * (projection machinery). Gates markNode's firewall-children walk with one
 * masked read of the always-present _config — the walk's old `_child` read
 * moved into the cold extension (§12), and an unconditional `_x` deref per
 * marked node measurably taxed the propagation hot path (diamond -22%). */
const CONFIG_FW_CHILDREN = 1 << 12;
/** Authoritative-view reader (`until()`): while this node computes, reads
 * dodge active optimistic OVERRIDES only — the predicate must observe
 * arriving truth, never the caller's own tentative writes (which would
 * trivially satisfy it). Everything else reads normally, INCLUDING
 * transition-staged `_pendingValue`: staged data is authoritative (optimism
 * lives only in override slots), and a hold that refused staged reads would
 * deadlock on data the open transaction itself is holding (a refresh the
 * action issued lands staged and cannot commit until the hold releases).
 * read() checks the bit on the reading computation (`context`) directly — no
 * ambient flag — so a shared computed the predicate pulls recomputes as
 * itself (no bit) under the normal view, and its cache never forks. */
const CONFIG_AUTHORITATIVE_READ = 1 << 13;
/** Sticky mark: an authoritative-view reader read this node PAST an active
 * override. The ack shape — an authoritative arrival EQUAL to the override —
 * rides paths that are deliberately silent under A17 (every ordinary reader
 * sees the override, so an equal landing changes nothing for them). A marked
 * node notifies those readers on such paths anyway, so the landed truth is
 * seen without re-firing ordinary subscribers. Never cleared — only nodes an
 * until() predicate observed mid-override pay. */
const CONFIG_AUTHORITATIVE_OBSERVED = 1 << 14;
/** Promise-delivery effect (resolve()/until()): commits its computed value
 * directly even when recomputing under its own held transition. These
 * effects deliver applies on a microtask (#2930) instead of the stashed
 * effect queues, so the value must ride the same immediate schedule — a
 * staged value with an immediate apply delivers stale state (resolve) or
 * deadlocks the hold (until). Safe because the node is a private leaf: no
 * subscriber reads an effect's value, only its own apply does. */
const CONFIG_DIRECT_COMMIT = 1 << 15;
/** Fresh-pull reader (awaitable `refresh()`'s waiter effect): a read of a
 * dirty source recomputes it inline even when the height gate defers to the
 * flush. Closes the same-flush ordering race where a waiter created
 * alongside a refresh() mark read the PRE-re-ask value as settled and
 * delivered stale; with the pull, the waiter either parks on the re-ask's
 * pending window (async — woken by the settle walk, which runs on every
 * landing including equal-value ones) or serves its sync answer. resolve()
 * deliberately keeps that race — its contract is "first settled value"
 * (#2930), not "next quiescent state". */
const CONFIG_FRESH_READ = 1 << 16;
/** HELD truth (#3164): this node's staged `_pendingValue` is confirming
 * truth riding a transaction that retains optimism, revealed only at that
 * transaction's settle. Two arming sites, one meaning: the store fold
 * (a landing staged into the retaining transaction) and until()'s
 * flip-entanglement (a foreign carrier's staged write, stolen when it
 * flipped the awaited predicate truthy). Override-covered nodes never
 * arm: the override is their display and its revert their notification
 * (A17).
 *
 * To a DERIVING reader the truth is a staged value like any other: a memo
 * or user effect served it enters the transaction and is held with it
 * (A29), so a pass that composes it with a superseded override's truth
 * composes ONE staged world — never staged truth beside committed
 * neighbours (#3568: the mask served the retaining transaction's own pass
 * the landed `length` through the override while the rows past it stayed
 * committed, and `<For>` walked into a hole). Stale readers of a foreign
 * transaction keep committed through the stale-of-foreign clause,
 * untracked reads keep committed (Rule 1), and latest() and until()'s
 * predicate tunnel through — the exemption that keeps holds deadlock-free.
 *
 * The one reader the mark gates is a LANE pass, owning transaction or not
 * (ruled 2026-09-22, superseding #3589's owner exemption): a lane applies
 * its frame display-ahead at the park, so a lane pass served the truth
 * would paint the confirmation beside the optimism it confirms —
 * `saving=true` beside the saved row, a frame no timeline contains
 * (GabbeV's union tear). It keeps committed and is re-run by the reveal's
 * post-revert wake. A lane under the retaining transaction owns its
 * overrides and its lane cargo (`ownsLane`), not the transaction's
 * confirming truth. Cleared at commit (the commit IS the reveal);
 * subscribers masked during the hold are woken by finalizePureQueue's
 * post-revert pass. */
const CONFIG_HELD_TRUTH = 1 << 17;
/** SLOT node (store leaf): created through `slotSignal` with `_host`/`_key`
 * backrefs baked into the literal. The unobserved sweep dispatches these to
 * the ONE shared hook (`setSlotUnobserved`) instead of a per-node closure
 * held in a per-node extension — store mounts materialize one signal per
 * touched leaf, so per-node allocations (options object, equals closure,
 * unobserved closure, NodeExtension) were the measured create-floor bytes
 * (warm dbmon profile: store node machinery ~36% + GC ~29%). */
const CONFIG_SLOT_NODE = 1 << 18;
/** Optimistic node whose own source arrived with a value DIFFERENT from its
 * active override (A18 supersession, #3331). The override survives only as
 * the displayed value — untracked reads and the applied frame keep it until
 * the owning transaction commits — while the graph has already moved to the
 * staged truth in `_pendingValue`: tracked readers see it and the corrected
 * cascade is that transaction's held work. Set by the two own-source write
 * paths (asyncWrite, transition-held recompute); cleared by a fresh optimistic
 * write (a new override re-masks) and by the revert. */
const CONFIG_OVERRIDE_SUPERSEDED = 1 << 19;
/** HELD children (#3404): this node's `_firstChild` chain (and `_disposal`
 * list) was built by a recompute whose result has not committed — a staged
 * value, a pending window, or a run under a held transaction. A later
 * recompute may tear those children down immediately: nothing observable
 * was ever built on them. Unset, the children belong to the committed frame
 * and a recompute defers them as zombies (`_pendingFirstChild`) until this
 * node commits — regardless of whether the recompute runs under a
 * transaction. A parked node (status propagation stamps `_transition`
 * without recomputing) recomputed when its source lands otherwise disposed
 * its committed children mid-hold, running their cleanups before the
 * transaction's atomic reveal. Cleared by `commitPendingNode`. Transaction
 * work only (A15 lane work and transaction work, #3698): zombies are parked
 * by a pass under a held transaction; a pass over a lane parks a LANE frame
 * instead (`CONFIG_LANE_FRAME`), whatever the node's kind. */
const CONFIG_HELD_CHILDREN = 1 << 20;
/** The frame parked in `_pendingFirstChild` / `_pendingDisposal` is a LANE
 * frame (#3662, #3698; A15 lane work and transaction work): a lane pass —
 * on an effect or a memo alike — publishes into the lane's frame (an
 * effect's run; a memo's derived override, A17), so the frame it replaces
 * leaves the screen when the lane applies (A30) — not at the action's
 * commit like #3404's transaction zombies, and not at the pass (a held lane
 * defers the apply with the frame still displayed). Drained by the lane's
 * render entry the parking site pushed ahead of the new frame's effects
 * (cleanups before side effects), by `commitPendingNode` if a hold commits
 * the node first, or with the owner's death. While set the parked frame is
 * not a hold (the node is not queued or stamped for it — lane work never
 * makes its node transaction work), a superseding pass disposes the
 * never-shown live children on the spot, and a lane-channel dirty on a
 * member is cancelled (`laneZombie`). Ruled 2026-09-28 (#3698): a pass is
 * lane work or transaction work by its owner, never by node kind. #3662
 * flagged effects only, and a memo's lane pass parked a transaction zombie
 * that queued and stamped the memo as the action's pending node, so its
 * next mainline recompute re-entered the hold. */
const CONFIG_LANE_FRAME = 1 << 26;
/** In-flight async node whose inputs were PUBLISHED while it was pending: a
 * batch or transaction committed with the node still `STATUS_PENDING` (an
 * unobserved flight, #3305), so the inputs are on screen and the node's
 * committed `_value` is stale against them. Governs read()'s reveal
 * carve-out: a stale (render) reader in some OTHER transaction may show a
 * foreign-held pending node's committed value — parallel transactions, no
 * entanglement — only while that value is coherent with the visible frame,
 * i.e. while the flight's inputs are themselves held (unpublished) and not
 * lane-revealed. Set by `commitPendingNodes`; cleared when the node next
 * enters pending fresh (a new flight from a settled state). */
const CONFIG_INPUTS_PUBLISHED = 1 << 21;
/** A28 (4): the node was written inside a recompute that ran OUTSIDE a flush
 * (a creation-time compute — boundary machinery, a mapArray's first run). Such
 * a write is promoted at that recompute's end: readers in the same block see
 * it. Cleared when the next flush begins; set only on that rare path. */
const CONFIG_PROMOTED = 1 << 22;
/** A28 for same-tick adoption: the node was staged outside a flush and then
 * adopted by a transaction (initTransition) before any flush carried the
 * staging — the stamp says "held", but nothing flushed is staged for it, so
 * on no channel is the write visible yet: `latest()` answers the committed
 * value, the verdict sees nothing pending (as the store's leaves already did
 * through their own selection). Cleared when the carrying flush re-stamps the
 * transaction's pending nodes (reassignPendingTransition). */
const CONFIG_ADOPTED_UNFLUSHED = 1 << 24;
/** The node's active override is a DERIVED one: a lane pass published its
 * speculative result into the override slot instead of `_value` (lanes
 * stage — an optimistic derivation is an override, #3479). Its truth is not
 * `_value` but a recompute from its inputs' truth, so the body-end
 * supersession (`endOptimism`) and the authoritative-flight blockage
 * (`transitionBlocked`) skip it; the revert drops the override and re-derives
 * it (`resolveOptimisticNodes`). Cleared with the override. */
const CONFIG_DERIVED_OVERRIDE = 1 << 23;
/** Observe tiers only: the node is framework plumbing (the `solid-js/refresh`
 * HMR memo between a component's root and its body) — it has no name, is no
 * segment of any owner path, and the attribution engine records nothing about
 * it (creation, re-runs, checks), while the nodes it owns stay fully observed.
 * Set from the internal `_plumbing` option at creation; never set in prod. */
const CONFIG_PLUMBING = 1 << 25;
const STATUS_PENDING = 1 << 0;
const STATUS_ERROR = 1 << 1;
const STATUS_UNINITIALIZED = 1 << 2;
const EFFECT_RENDER = 1;
const EFFECT_USER = 2;
const EFFECT_TRACKED = 3;
/** OR-ed into the `type` a lane passes to its effect runners: lane runs
 * apply ahead of their transaction and are exempt from ownership parking. */
const LANE_RUN = 4;
const NOT_PENDING = {};
const NO_SNAPSHOT = {};
/**
 * Stand-in stored in `_overrideValue` for an optimistic write of literal
 * `undefined` (#2898). The slot doubles as the optimistic-node brand
 * (`undefined` = not optimistic, `NOT_PENDING` = at rest), so the raw value
 * would erase the node's optimistic identity: the write turns invisible and
 * follow-up writes route off the optimistic path and commit permanently.
 * Same shape as NO_SNAPSHOT. Sites that surface the override VALUE unwrap
 * via `visibleOverrideValue`; slot identity tests stay raw.
 */
const OVERRIDE_UNDEFINED = {};
/** Unwrap an active override's stored value for surfacing to readers (#2898). */
function unwrapOverride(v) {
  return v === OVERRIDE_UNDEFINED ? undefined : v;
}
const STORE_SNAPSHOT_PROPS = "sp";
const SUPPORTS_PROXY = typeof Proxy === "function";
const defaultContext = {};
/**
 * Brand symbol used by `Refreshable<T>` values (projection stores, async
 * memos) to expose their underlying computation to `refresh()`. Not part of
 * the user-facing API.
 *
 * @internal
 */
const $REFRESH = Symbol("refresh");

let attrHooks = null;
/**
 * The installed engine, registered on `globalThis` as well (the records
 * channel's reason, see `Records`): a wire layer bundled without a framework
 * import — `@solidjs/web`'s server-function client — stamps the records it
 * emits through the engine's `currentOrigin`, and this is its reach. The
 * module binding stays the core's own read (one null check per hook site);
 * the registration mirrors it.
 */
const INSTALLED = Symbol.for("@solidjs/signals/observe/attribution");
function setAttributionHooks(hooks) {
  attrHooks = hooks;
  globalThis[INSTALLED] = hooks ?? undefined;
}
/**
 * Run `fn` as the handler of a user interaction: every root write it performs
 * (and every action step, effect or flight the write causes) is attributed to
 * `ref` by whichever engine is installed. The web runtime wraps event
 * dispatch in this; custom renderers and test harnesses call it themselves.
 * With no engine installed it is `fn()` — the wiring, not the engine, so it
 * lives in core and is reachable as `OBSERVE.attribution.withInteraction`.
 *
 * The `finally` is deliberate and safe under the try rule above: this
 * function is referenced only from the `OBSERVE` object, which prod builds
 * fold to `undefined`, so nothing retains it there.
 */
function withInteraction(ref, fn) {
  // Pin the engine for the frame: a handler that disables it mid-way must
  // still close the frame it opened (the engine tolerates a close after
  // disable()), and one that enables it mid-way opened no frame to close.
  const hooks = attrHooks;
  if (hooks === null) return fn();
  hooks.interactionStart(ref);
  let returned;
  try {
    return (returned = fn());
  } finally {
    hooks.interactionEnd(returned);
  }
}
/**
 * Run `fn` as a declared unit of work — a router's navigation: every root
 * write it performs is attributed to `ref` (and, through it, to the enclosing
 * interaction when there is one), so the hold those writes wait in, the
 * re-runs they cause and the verdicts on them all carry the route's name
 * instead of a bare signal's. Same contract as `withInteraction`: the wiring,
 * not the engine; `fn()` with no engine installed. Reachable as
 * `OBSERVE.attribution.withOrigin`.
 *
 * ```ts
 * OBSERVE
 *   ? OBSERVE.attribution.withOrigin(
 *       { kind: "navigation", name: match.pattern, to, from, params: match.params },
 *       () => setLocation(to)
 *     )
 *   : setLocation(to);
 * ```
 */
function withOrigin(ref, fn) {
  const hooks = attrHooks;
  if (hooks === null) return fn();
  hooks.originStart(ref);
  try {
    return fn();
  } finally {
    hooks.originEnd();
  }
}
/**
 * The provenance a root write performed now would carry, as the installed
 * engine sees it (`AttributionHooks.currentOrigin`); `undefined` with no
 * engine, or when nothing is in effect. Reachable as
 * `OBSERVE.attribution.currentOrigin` — how a runtime stamps a fact of its
 * own (a server-function call) with the interaction or navigation it ran
 * for, so an observer joins the two by identity.
 */
function currentOrigin() {
  const hooks = attrHooks;
  return hooks === null ? undefined : hooks.currentOrigin();
}

/** First warning when a change reaches (or a pass tracks) this many edges. */
const GRAPH_SIZE_WARN_AT = 2000;
/** Re-warn once the count has grown by this much since the last warning. */
const GRAPH_SIZE_WARN_EVERY = 500;
const hooks = {};
const diagnosticListeners = new Set();
const diagnosticCaptures = new Set();
let diagnosticSequence = 0;
let consoleFooter;
const footeredCodes = new Set();
/**
 * Registers the console footer appended to the first console report of
 * each diagnostic code — a discovery pointer to deeper guidance. Reported
 * events carry it as trailing lines of the same console entry; events that
 * surface as a thrown error instead get it as a follow-up line. Returning
 * undefined for an event suppresses the footer. Passing undefined
 * unregisters and resets the once-per-code memory.
 *
 * @internal A seam for `solid-js`, which owns the repair skill the footer
 * names and installs it from both of its entries; not part of `DEV`. No-op
 * outside dev builds, where nothing reports to the console.
 */
function setConsoleFooter(footer) {
  consoleFooter = footer;
  footeredCodes.clear();
}
const diagnostics = {
  subscribe(listener) {
    diagnosticListeners.add(listener);
    return () => diagnosticListeners.delete(listener);
  },
  emit(event, subject = null) {
    return emitDiagnostic(event, subject);
  },
  capture() {
    const events = [];
    diagnosticCaptures.add(events);
    return {
      get events() {
        return events;
      },
      clear() {
        events.length = 0;
      },
      stop() {
        diagnosticCaptures.delete(events);
        return [...events];
      }
    };
  }
};
const attributionSlot = {
  get installed() {
    return attrHooks;
  },
  withInteraction,
  withOrigin,
  currentOrigin
};
const RECORDS = Symbol.for("@solidjs/signals/observe/records");
function recordsChannel() {
  const g = globalThis;
  if (g[RECORDS]) return g[RECORDS];
  const listeners = new Map();
  const bodyListeners = new Map();
  return (g[RECORDS] = {
    subscribe(type, listener, options) {
      const current = listeners.get(type);
      // Set semantics: one entry per function, however often it is passed —
      // the first subscription's options stand for it.
      if (current === undefined || !current.includes(listener)) {
        listeners.set(type, current === undefined ? [listener] : [...current, listener]);
        if (options !== undefined && options.bodies) {
          let wanting = bodyListeners.get(type);
          if (wanting === undefined) bodyListeners.set(type, (wanting = new Set()));
          wanting.add(listener);
        }
      }
      return () => {
        const list = listeners.get(type);
        if (list === undefined || !list.includes(listener)) return;
        const next = list.filter(l => l !== listener);
        if (next.length > 0) listeners.set(type, next);
        else listeners.delete(type);
        const wanting = bodyListeners.get(type);
        if (wanting !== undefined && wanting.delete(listener) && wanting.size === 0)
          bodyListeners.delete(type);
      };
    },
    observed(type, facet) {
      return facet === "bodies" ? bodyListeners.has(type) : listeners.has(type);
    },
    emit(type, event, live) {
      const list = listeners.get(type);
      if (list === undefined) return;
      // A throwing listener is reported and the rest still hear the record.
      // The try/catch per call allocates nothing unless something throws.
      for (let i = 0; i < list.length; i++) {
        try {
          list[i](event, live);
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
}
const OBSERVE = {
  diagnostics,
  records: recordsChannel(),
  attribution: attributionSlot,
  // Replaced by solid-js's server entry (see `ServerObserve`); on the
  // client the slot stays this placeholder. The cast: the interface is
  // empty HERE and gains its members by augmentation downstream.
  server: {},
  exclude(owner) {
    markedOwners.set(owner, true);
    hasExclusions = true;
  },
  include(owner) {
    // No flag flip: with nothing excluded there is nothing to re-admit,
    // and the walk stays short-circuited.
    markedOwners.set(owner, false);
  },
  isExcluded,
  ownerPath
};
// --- Excluded owners ---------------------------------------------------------------
//
// An observer that lives inside the observed app (an adapter's panel,
// devtools) marks its root; both channels check the subject's owner chain —
// the same walk `ownerPath` already makes — and stay silent under it. An
// observer that WRAPS the app (a toolbar around it) excludes its own root
// and includes the app's back: one map, `true` excluded / `false` included,
// and the nearest marker up the chain decides. The flag short-circuits the
// walk for the common case of no exclusions (an include with nothing
// excluded changes no verdict, so it does not flip it).
const markedOwners = new WeakMap();
let hasExclusions = false;
/** Events built for an excluded subject: never delivered, never reported. */
const suppressedEvents = new WeakSet();
function isExcluded(subject) {
  if (!hasExclusions || !subject) return false;
  let owner = "_parent" in subject ? subject : (subject._owner ?? null);
  for (; owner !== null; owner = owner._parent) {
    const marked = markedOwners.get(owner);
    if (marked !== undefined) return marked;
  }
  return false;
}
/** For engines that cache the verdict per node: is anything excluded at all? */
function anyExcluded() {
  return hasExclusions;
}
/** Was `entry` built for an excluded subject? Once-per-key reporters must not spend their slot on it. */
function isSuppressed(entry) {
  return suppressedEvents.has(entry);
}
// The repair guide: the `reactivity-diagnostics` skill `solid-js` ships,
// one section per code, at its stable GitHub path. GitHub heading anchors
// are lowercased with underscores kept (`### SILENT_HOLD` → `#silent_hold`).
const GUIDE_URL =
  "https://github.com/solidjs/solid/blob/main/packages/solid/skills/reactivity-diagnostics/SKILL.md";
const DEV = {
  hooks,
  getChildren,
  getSignals,
  getParent,
  getSources,
  getObservers,
  report: reportDiagnostic,
  guideUrl(code) {
    return `${GUIDE_URL}#${code.toLowerCase()}`;
  }
};
/**
 * Dev-mode internal consistency check. A failure means the reactive system
 * contradicted itself (not that user code misbehaved) — see
 * INTERNALS-ASYNC-STATE.md for the invariant catalog. Throws under false
 * so the suite (and fuzzing) treats any violation as a hard failure; logs in
 * dev builds so user apps degrade instead of crashing.
 */
function assertInvariant(condition, name, message) {
  if (condition) return;
  const full = `[INVARIANT_VIOLATION] ${name}: ${message}`;
  const entry = emitDiagnostic({
    code: "INVARIANT_VIOLATION",
    kind: "error",
    severity: "error",
    message: full,
    data: { invariant: name }
  });
  reportDiagnostic(entry);
}
/**
 * Root-first names of the owners enclosing `subject` (inclusive when the
 * subject is itself a named owner). Signals hop to their registering owner
 * (`_owner`, set by registerGraph). Unnamed owners are skipped so the path
 * reads as the component tree plus the scope: `<App> › <TodoRow> › effect`.
 * Public as `OBSERVE.ownerPath`; the core's own sites import it directly.
 */
function ownerPath(subject) {
  if (!subject) return undefined;
  let owner = "_parent" in subject ? subject : (subject._owner ?? null);
  const path = [];
  for (; owner !== null; owner = owner._parent) {
    const name = owner._name;
    if (typeof name === "string" && name.length) path.push(name);
  }
  return path.length ? path.reverse() : undefined;
}
/**
 * Records a diagnostic on the structured channel (listeners, captures) and
 * returns the entry. `subject` locates it: the current reactive `context` by
 * default (right for the synchronous rule checks — they fire inside the
 * scope that misbehaved); pass the node for scheduler-time findings whose
 * ambient context is the flush, or `null` for events that have no location
 * by nature. An `ownerPath` already on the event wins over the subject walk
 * (hosts whose owners are not signals' owners compute their own). Console
 * output is a separate, dev-tier step — see `reportDiagnostic`.
 */
function emitDiagnostic(event, subject = context) {
  const entry = {
    sequence: ++diagnosticSequence,
    ...event
  };
  // The observer's own subtree: build the entry (the caller may throw its
  // message) but tell nobody.
  if (isExcluded(subject)) {
    suppressedEvents.add(entry);
    return entry;
  }
  if (entry.ownerPath === undefined) {
    const path = ownerPath(subject);
    if (path) entry.ownerPath = path;
  }
  const live = subject ?? undefined;
  if (live !== undefined) eventSubjects.set(entry, live);
  for (const listener of diagnosticListeners) listener(entry, live);
  for (const capture of diagnosticCaptures) capture.push(entry);
  // Footer for events that never reach reportDiagnostic because the call site
  // throws the message instead (every such site is severity "error"): a
  // microtask lands it below the thrown error. Sites that DO report consume
  // the once-per-code slot synchronously first, so this finds it taken and
  // stays silent — one console entry per finding. Advisory (`info`) events
  // are structured-channel only and get no footer: nothing on the console
  // for it to follow. Dev-tier: the footer is console guidance.
  if (entry.severity === "error" && consoleFooter && !footeredCodes.has(entry.code)) {
    queueMicrotask(() => {
      const footer = takeFooter(entry);
      if (footer) console.warn(footer);
    });
  }
  return entry;
}
/** The once-per-code footer text, consuming the slot. Undefined if taken or unregistered. */
function takeFooter(entry) {
  if (!consoleFooter || footeredCodes.has(entry.code)) return undefined;
  footeredCodes.add(entry.code);
  return consoleFooter(entry);
}
/**
 * The subject each emitted event was about, for the console step, which
 * runs after `emitDiagnostic` returned and can show what the node knows: a
 * rendering runtime may stamp a binding effect with the DOM element it
 * writes (`_devElement`), and a live element reference beside the message
 * is the most addressable pointer a console can print. Listeners get the
 * subject as their second argument instead; the map exists only to carry
 * it from `emitDiagnostic` to `reportDiagnostic` across the call site's
 * `reportDiagnostic(emitDiagnostic(…))`. Weak, keyed by the entry.
 */
const eventSubjects = new WeakMap();
/**
 * The console face of a diagnostic — ONE entry per finding: the message, the
 * owner path (`in <App> › <TodoRow> › effect`) so a human can locate it, the
 * once-per-code footer as trailing lines, and — when the subject is a
 * binding effect the rendering runtime tagged — the element it writes, as a
 * second console argument (hover highlights it, click jumps to Elements).
 * Severity picks the console method. Call sites report the entry
 * `emitDiagnostic` returned so the structured and console channels never
 * disagree. Dev-tier: in an observe build this is a no-op, so wiring paths
 * that both emit and report (graph-size warnings) reach the channel only —
 * production observability never writes to the console.
 */
function reportDiagnostic(entry) {
  if (suppressedEvents.has(entry)) return;
  let text = entry.message;
  if (entry.ownerPath) text += `\n  in ${entry.ownerPath.join(" › ")}`;
  const footer = takeFooter(entry);
  if (footer) text += `\n${footer}`;
  const element = eventSubjects.get(entry)?._devElement;
  const args = element !== undefined ? [text, element] : [text];
  entry.severity === "error" ? console.error(...args) : console.warn(...args);
}
/**
 * Shared strict-read diagnostics for core read() and the store proxy traps.
 * Single source for the message text — the #2897 safeguard parity between
 * memos and stores is exactly these firing identically from both paths.
 */
function throwPendingUntrackedRead(strictReadLabel, fields) {
  const message =
    `[PENDING_ASYNC_UNTRACKED_READ] Reading a pending async value directly in ${strictReadLabel}. ` +
    `Async values must be read within a tracking scope (JSX, a memo, or an effect's compute function).`;
  emitDiagnostic({
    code: "PENDING_ASYNC_UNTRACKED_READ",
    kind: "async",
    severity: "error",
    message,
    ...fields,
    data: { strictRead: strictReadLabel }
  });
  throw new Error(message);
}
function warnStrictReadUntracked(strictReadLabel, fields) {
  // Name the value when the name says something — a `name` option or a store
  // key (#3675). The constructors' defaults ("signal", "computed") would only
  // restate what "reactive value" already says.
  const nodeName = fields?.nodeName;
  const named = nodeName !== undefined && nodeName !== "signal" && nodeName !== "computed";
  const message =
    `[STRICT_READ_UNTRACKED] Reactive value${named ? ` "${nodeName}"` : ""} read directly in ` +
    `${strictReadLabel} will not update. ` +
    `Move it into a tracking scope (JSX, a memo, or an effect's compute function).`;
  reportDiagnostic(
    emitDiagnostic({
      code: "STRICT_READ_UNTRACKED",
      kind: "strict-read",
      severity: "warn",
      message,
      data: { strictRead: strictReadLabel },
      ...fields
    })
  );
}
/**
 * Observe-tier: stamp a signal with its creating owner so `ownerPath` can
 * locate signal subjects. The per-owner `_signals` list and the devtools
 * `onGraph` hook are dev-tier — the observe build pays one property write.
 */
function registerGraph(value, owner) {
  value._owner = owner;
  {
    if (owner) {
      if (!owner._signals) owner._signals = [];
      owner._signals.push(value);
    }
    DEV.hooks.onGraph?.(value, owner);
  }
}
function clearSignals(node) {
  node._signals = undefined;
}
/**
 * Observe-tier: the live top-level roots — owners created with no parent
 * (`render()`'s root, a `createRoot()` at module scope, a devtools panel).
 * Held weakly so an undisposed root nothing references still collects; a
 * root a subscription keeps alive is exactly the leak `graphSize()` exists
 * to count. Registered by `createOwner` and released by its disposal, so
 * the cost is one Set write per top-level root, never per node.
 */
const liveRoots = new Set();
const rootRefs = new WeakMap();
const rootReaper =
  typeof FinalizationRegistry === "function"
    ? new FinalizationRegistry(ref => liveRoots.delete(ref))
    : null;
function registerRoot(owner) {
  // Observe-tier bodies: folded to a bare return in prod so the mangler and
  // the bundle never see the walk.
  if (typeof WeakRef !== "function") return;
  const ref = new WeakRef(owner);
  rootRefs.set(owner, ref);
  liveRoots.add(ref);
  rootReaper?.register(owner, ref, ref);
}
function unregisterRoot(owner) {
  const ref = rootRefs.get(owner);
  if (ref === undefined) return;
  rootRefs.delete(owner);
  liveRoots.delete(ref);
  rootReaper?.unregister(ref);
}
/**
 * The live top-level roots, for a walk of the owner tree (the engine's
 * `graphSize`): dead refs are dropped as they are met. Empty in prod.
 */
function liveRootOwners() {
  const out = [];
  for (const ref of liveRoots) {
    const root = ref.deref();
    if (root === undefined) liveRoots.delete(ref);
    else out.push(root);
  }
  return out;
}
// Graph traversal helpers
function getChildren(owner) {
  const children = [];
  let child = owner._firstChild;
  while (child) {
    children.push(child);
    child = child._nextSibling;
  }
  return children;
}
function getSignals(owner) {
  return owner._signals ? [...owner._signals] : [];
}
function getParent(owner) {
  return owner._parent;
}
function getSources(computation) {
  const sources = [];
  let link = computation._deps;
  while (link) {
    sources.push(link._dep);
    link = link._nextDep;
  }
  return sources;
}
function getObservers(node) {
  const observers = [];
  let link = node._subs;
  while (link) {
    observers.push(link._sub);
    link = link._nextSub;
  }
  return observers;
}
/**
 * Graph-size warnings are once per node, re-warning only when the count has
 * grown by GRAPH_SIZE_WARN_EVERY since the last one — off-node, so the
 * pathological handful of nodes that ever reach the threshold are the only
 * ones that cost anything, and no node carries a bookkeeping field for it.
 */
const graphSizeWarnedAt = new WeakMap();
function shouldWarnGraphSize(node, count) {
  const last = graphSizeWarnedAt.get(node);
  if (last !== undefined && count < last + GRAPH_SIZE_WARN_EVERY) return false;
  graphSizeWarnedAt.set(node, count);
  return true;
}
/**
 * Observe-tier: a committed change on `node` is about to re-run `count`
 * subscribers. Two reporters, one finding, one dedupe: the core counts the
 * notify walk in `insertSubs` as it goes (fan-out costs exactly one local
 * increment in a loop that already visits every edge, and nothing at link
 * time) and fires from GRAPH_SIZE_WARN_AT up, always-on wherever the
 * channel exists — a graph-size pathology should surface without asking.
 * The attribution engine, while enabled, reports the same code from its
 * lower `fanOut` threshold (default 250) on the root writes it stamps, with
 * the write kind it knows, and hands over to the core at
 * GRAPH_SIZE_WARN_AT so one change never carries two findings. Both fire on
 * the write rather than the link: a fan-out that is never written costs
 * nothing, and one that is re-runs every subscriber this flush. Once per
 * node, re-warning only once the count has grown by GRAPH_SIZE_WARN_EVERY.
 */
function noteFanOut(node, count, write) {
  if (!shouldWarnGraphSize(node, count)) return;
  const name = node._name;
  const message =
    `[HUGE_FAN_OUT] ${name ? `Signal "${name}"` : "A signal"} changed with ${count} subscribers — ` +
    `every one re-runs this flush. If many independent computations read the same value ` +
    `(for example every row of a list comparing against one selected id), prefer a per-key ` +
    `store or projection so only the items whose result flipped update.`;
  reportDiagnostic(
    emitDiagnostic(
      {
        code: "HUGE_FAN_OUT",
        kind: "graph",
        severity: "warn",
        message,
        nodeName: name,
        ownerId: node.id,
        ownerName: name,
        data: write === undefined ? { count } : { count, write }
      },
      node
    )
  );
}
/**
 * Observe-tier: a recompute pass of `node` tracked `count` distinct sources
 * (its trimmed dep list, walked once at the end of the pass — see recompute;
 * no per-link work, no pass bracket). Fires from GRAPH_SIZE_WARN_AT up.
 */
function noteFanIn(node, count) {
  if (!shouldWarnGraphSize(node, count)) return;
  const name = node._name;
  const message =
    `[HUGE_FAN_IN] ${name ? `Computation "${name}"` : "A computation"} tracked ${count} sources. ` +
    `It will re-run when any of them change. Narrow the read or split the derivation so each ` +
    `computation tracks only what it needs.`;
  reportDiagnostic(
    emitDiagnostic(
      {
        code: "HUGE_FAN_IN",
        kind: "graph",
        severity: "warn",
        message,
        nodeName: name,
        ownerId: node.id,
        ownerName: name,
        data: { count }
      },
      node
    )
  );
}
/**
 * Dev-only: attribute reads that run after an `await` inside an async compute.
 * JS has no async context, so a native-promise flight is consumed by a uniquely
 * named async function instead of `.then`; V8's async stack traces then carry a
 * `__solidAsyncCompute_<id>` frame on every read in the compute's continuation.
 * `await` on a native promise settles on the same tick as `.then`, so dev and
 * prod timing match. Other thenables, and engines without async frames
 * (Firefox, Safari), are left alone and never warn.
 */
let asyncTailFlights = 0;
// Weak so a flight that never settles cannot pin its computation (the promise's
// reactions close over it); dead or superseded entries are swept as the registry grows.
const tailFlights = new Map();
const warnedTailReads = new WeakMap();
let tailFlightId = 0;
const TAIL_FRAME = /^__solidAsyncCompute_(\d+)$/;
function watchAsyncTail(el, flight) {
  if (!(flight instanceof Promise) || flight.constructor !== Promise) return flight;
  return {
    then(onFulfilled, onRejected) {
      const id = ++tailFlightId;
      const name = `__solidAsyncCompute_${id}`;
      // Retire the entry before settling so reads made by the landing itself stay quiet.
      const done = () => {
        if (tailFlights.delete(id)) asyncTailFlights--;
      };
      if (tailFlights.size >= nextTailSweep) sweepTailFlights();
      asyncTailFlights++;
      tailFlights.set(id, { el: new WeakRef(el), flight: new WeakRef(flight) });
      ({
        async [name]() {
          let value;
          try {
            value = await flight;
          } catch (error) {
            done();
            return onRejected(error);
          }
          done();
          onFulfilled(value);
        }
      })[name]();
      return undefined;
    }
  };
}
/**
 * `dep` is the node a tracked read would have linked (undefined when a store key
 * was never tracked); `holder`/`key` identify the read for once-only reporting.
 */
function checkPostAwaitRead(dep, holder, key, nodeName, throwsPending) {
  // Continuations resume with no owner; mount, flush, and effect reads always have one.
  if (context !== null) return;
  // Code Solid itself runs synchronously on the continuation's stack also has
  // no owner: effect callbacks (the continuation called flush()), cleanups (it
  // called dispose()), and an action's body (it invoked the action). Their
  // reads are imperative by design, and the async frame below them belongs to
  // the caller, not to them.
  if (callbackDepth !== 0) return;
  if (disposalDepth !== 0) {
    // Teardown is synchronous, so a depth still raised on the next microtask
    // was left behind by a cleanup that threw (owner.ts brackets it without
    // try/finally, which would survive into prod). Clear it then, or every
    // later check would stay silent.
    if (!disposalHealQueued) {
      disposalHealQueued = true;
      queueMicrotask(healDisposalDepth);
    }
    return;
  }
  // One capture per microtask window answers "no flight on the stack" for
  // every read until the queue turns: the common case — untracked reads
  // elsewhere while a flight is open — costs one capture. A positive answer is
  // never reused: one drain resumes every sibling continuation whose promise
  // settled (N memos awaiting one fetch), so the flight on the stack changes
  // between reads inside the same window. Each read inside a flight captures
  // afresh, which is what makes the attribution causal rather than "some
  // flight is open". The reset can land a few jobs late, so a window that
  // opened on an unowned read hides a continuation queued before the reset
  // (pinned as a known false negative); it can never invent a warning.
  let id = windowFlight;
  if (id === undefined) {
    id = windowFlight = attributedFlight();
    queueMicrotask(resetWindowFlight);
  } else if (id !== 0) id = attributedFlight();
  if (id === 0) return;
  const entry = tailFlights.get(id);
  const el = entry?.el.deref();
  // A never-resolved pending read throws, and async.ts reports it on rejection.
  // A refetching source serves its old value instead, so that read still warns.
  if (!el || throwsPending || el === dep) return;
  const flight = entry.flight.deref();
  if (!flight || el._x?._inFlight !== flight) return;
  if (dep !== undefined)
    for (let d = el._deps; d !== null; d = d._nextDep) if (d._dep === dep) return;
  let byHolder = warnedTailReads.get(el);
  if (!byHolder) warnedTailReads.set(el, (byHolder = new WeakMap()));
  let keys = byHolder.get(holder);
  if (!keys) byHolder.set(holder, (keys = new Set()));
  if (keys.has(key)) return;
  keys.add(key);
  reportDiagnostic(
    emitDiagnostic(
      {
        code: "UNTRACKED_READ_AFTER_AWAIT",
        kind: "async",
        severity: "warn",
        message:
          `[UNTRACKED_READ_AFTER_AWAIT] ${nodeName ? `"${nodeName}"` : "A reactive value"} was ` +
          `first read after an \`await\` in an async computation, so it is not a dependency: ` +
          `the computation will not re-run when it changes. Read it before the first \`await\`, ` +
          `or wrap the read in untrack() if a one-time value is intended.`,
        ownerId: el.id,
        ownerName: el._name,
        nodeName
      },
      el
    )
  );
}
// Sweeping only when the registry doubles keeps registration O(1) amortized.
let nextTailSweep = 64;
function sweepTailFlights() {
  for (const [id, { el, flight }] of tailFlights) {
    const node = el.deref();
    const current = flight.deref();
    if (!node || !current || node._x?._inFlight !== current) {
      tailFlights.delete(id);
      asyncTailFlights--;
    }
  }
  nextTailSweep = Math.max(64, tailFlights.size * 2);
}
let windowFlight;
function resetWindowFlight() {
  windowFlight = undefined;
}
let disposalHealQueued = false;
function healDisposalDepth() {
  disposalHealQueued = false;
  if (disposalDepth !== 0) resetDisposalDepth();
}
/** The innermost tail flight on the async stack, or 0. Reads V8 call sites, skipping `.stack` formatting. */
function attributedFlight() {
  const V8Error = Error;
  if (!V8Error.captureStackTrace) return 0;
  const prevPrepare = V8Error.prepareStackTrace;
  const prevLimit = V8Error.stackTraceLimit;
  const target = {};
  let sites;
  V8Error.prepareStackTrace = (_, callSites) => callSites;
  // The tail frame sits BELOW every synchronous frame between the read and
  // the continuation (helpers, array callbacks, the store trap, read() and
  // this function itself), plus one async frame per awaited helper on the way
  // back to the compute. Node's default of 10 loses it behind a modest helper
  // chain; 50 covers a deep one without paying for the frame walk in the
  // common case, where the stack is far shorter and the limit is never
  // reached. A read more than ~40 synchronous frames deep is a false negative.
  V8Error.stackTraceLimit = 50;
  try {
    V8Error.captureStackTrace(target, attributedFlight);
    sites = target.stack;
  } finally {
    V8Error.prepareStackTrace = prevPrepare;
    V8Error.stackTraceLimit = prevLimit;
  }
  if (!Array.isArray(sites)) return 0;
  for (const site of sites) {
    const match = TAIL_FRAME.exec(site.getFunctionName?.() ?? "");
    if (match) return +match[1];
  }
  return 0;
}

function createAsyncReporters() {
  return new Map();
}
/**
 * INV-2: a node with an *active* override must be registered for reversion in
 * the queue's or a transition's `_optimisticNodes`. An unregistered active
 * override would survive transition completion forever. Runs at the end of
 * every flush (not just quiescence — the invariant holds mid-transition).
 * (There is no revert-target requirement: authoritative values commit
 * silently into `_value` under the override mask — A17 — so reverting is
 * just dropping the override.)
 */
function devCheckActiveOverrides(isRegisteredForRevert) {
  return;
}
/** INV-1: an isPending() probe must never leak past its own call. */
function devCheckFlushStart() {
  return;
}
/**
 * Companion-vs-oracle census (#2838 pre-work). A NON-ASSERTING diff logger:
 * at the end of every flush it compares each live companion's cached state
 * against a fresh oracle and logs every distinct divergence fingerprint once
 * (console, `[census]` prefix). Legit lane-scoped windows will show up too —
 * the census exists to enumerate the full taxonomy of mid-flight divergence
 * so the write-driven redesign knows every case it must produce, not to
 * judge them. Enabled only when the COMPANION_CENSUS env var is set (in
 * addition to `false`), so normal test runs pay one boolean check.
 */
typeof globalThis !== "undefined" && !!globalThis.process?.env?.COMPANION_CENSUS;
function devCensusCompanions(isQueuedForCommit) {
  return;
}
/**
 * Quiescence checks. Run only when the system is fully drained: nothing
 * scheduled, no active/stashed transitions, no live lanes. At that point no
 * transition-scoped state may survive, and the lazily-created companions must
 * agree with a fresh computation of their owner's state.
 */
function devCheckQuiescent(isQueuedForCommit) {
  return;
}

// Map from optimistic signal to its lane (reused for multiple writes to same signal)
const signalLanes = new WeakMap();
// All active lanes (for cleanup on transition completion)
const activeLanes = new Set();
/**
 * Get an existing lane for a signal or create a new one.
 * Reuses lane for multiple writes to the same signal.
 */
function getOrCreateLane(signal) {
  let lane = signalLanes.get(signal);
  if (lane) {
    return findLane(lane);
  }
  // Detect parent lane: _parentSource chains from pendingSignal → pendingValueComputed → original.
  // The child lane should not merge with the parent lane.
  const parentSource = signal._x?._parentSource;
  const parentOptLane = parentSource?._x?._optimisticLane;
  const parentLane = parentOptLane ? findLane(parentOptLane) : null;
  lane = {
    _source: signal,
    _pendingAsync: new Set(),
    _effectQueues: [[], []],
    _mergedInto: null,
    _transition: activeTransition,
    _parentLane: parentLane
  };
  signalLanes.set(signal, lane);
  activeLanes.add(lane);
  // A companion may have written before the owner's first optimistic write
  // (affects() as an action's first statement pokes the verdict companion of a
  // still lane-less node, #2887), leaving its lane parentless. Adopt it now:
  // parent-child is a property of the nodes, not of write order — otherwise
  // the owner's write merges the companion's subscribers into this lane and
  // their effects wait on its async instead of flushing immediately.
  adoptCompanionLane(signal._x?._pendingSignal, lane);
  adoptCompanionLane(signal._x?._latestValueComputed, lane);
  return lane;
}
function adoptCompanionLane(companion, parent) {
  if (!companion) return;
  const companionLane = signalLanes.get(companion);
  if (!companionLane) return;
  const root = findLane(companionLane);
  // Only the companion's own unmerged root is safely re-parentable: a root
  // that absorbed other lanes carries work that is not a child of this owner.
  if (root !== parent && root._source === companion && !root._parentLane) root._parentLane = parent;
}
/**
 * Union-find: find the root lane.
 */
function findLane(lane) {
  while (lane._mergedInto) lane = lane._mergedInto;
  return lane;
}
/**
 * Is the lane held? `_pendingAsync` records the async the lane OWNS (derived
 * under it); a transaction's reporter map records the async a render effect
 * OBSERVED pending with no boundary taking it (INV-3, the one registration
 * site). A hold needs both — the same rule the transaction itself uses, so a
 * memo nobody renders, or one a fallback-showing boundary caught, cannot tear
 * a frame and holds nothing (#3289). An orphan lane has no observation record
 * and never holds.
 *
 * The observation is looked up per NODE, in whichever live transaction
 * recorded it — not in this lane's transaction. Lanes merge across
 * transactions (#2912: ownership never travels through lanes), so after a
 * merge the root's transaction holds the observations of only one member;
 * the async the other member's transaction observed must hold the merged
 * reveal just the same (A15 for lanes, #3335).
 */
function laneHeld(lane) {
  if (!lane._transition) return false;
  for (const node of lane._pendingAsync) if (waitingTransition(node) !== null) return true;
  return false;
}
/**
 * Lanes mirror transitions (#3460): a render effect OFF a HELD lane that reads
 * a value the lane is revealing — an override, a `latest()` shadow — sees the
 * committed value, exactly as a stale reader of a held transaction does
 * (A15 reveal corollary): it publishes now, with the frame that is on screen
 * (the lane defers its own readers' runs, so the committed value is what is
 * visible), entangles nothing — a sync write is never held by a lane — and
 * re-derives at the release. The release re-run rides the lane's own render
 * queue, which runs when the lane reveals (runLaneEffects) or its transaction
 * commits (cleanupCompletedLanes). A reader ON the lane computes the lane's
 * reveal and takes the value as before.
 *
 * OFF the lane is provenance, not membership — the transaction mirror
 * exactly: a stale reader of a transaction is a pass that runs outside it. A
 * pass under the lane's own transaction is the lane's work — its write (lane
 * posture), or the landing of its async, which re-enters the transaction
 * (#3334) and runs a member with no ambient lane. Read as an outsider, that
 * pass published the committed view and queued a replay that revealed the
 * override beside its unready derivation at the release (`1:0` for an
 * optimistic frame that never became ready; #3479 review). Membership is the
 * wrong test the other way: a member re-run by a sibling's sync write is a
 * mainline pass and shows the committed view.
 */
function readsHeldCommitted(owner, c) {
  const lane = resolveLane(owner);
  if (!lane || !laneHeld(lane)) return false;
  if (ownsLane(lane, owner)) return false;
  lane._effectQueues[0].push(() => c._flags & REACTIVE_DISPOSED || enqueueSub(c));
  return true;
}
/** The ownership relation for a lane hold (core `ownsHold`, §6 ruling 2): the
 * running pass owns `lane`'s hold if it runs under the transition that owns
 * the lane (the node's, resolved through override ownership and merges) or
 * inside the lane itself. */
function ownsLane(lane, owner) {
  if (activeTransition !== null) {
    const t = resolveTransition(owner);
    if (t && ownsHold(t)) return true;
  }
  return currentOptimisticLane !== null && findLane(currentOptimisticLane) === lane;
}
/**
 * Merge two lanes when their dependency graphs overlap.
 */
function mergeLanes(lane1, lane2) {
  lane1 = findLane(lane1);
  lane2 = findLane(lane2);
  if (lane1 === lane2) return lane1;
  lane2._mergedInto = lane1;
  // Move (not copy) the merged lane's work: after the merge all routing goes
  // through findLane() to the root, so anything left behind here is dead —
  // and anything *added* here later is a routing bug (INV-5).
  for (const node of lane2._pendingAsync) lane1._pendingAsync.add(node);
  lane2._pendingAsync.clear();
  lane1._effectQueues[0].push(...lane2._effectQueues[0]);
  lane1._effectQueues[1].push(...lane2._effectQueues[1]);
  lane2._effectQueues[0].length = 0;
  lane2._effectQueues[1].length = 0;
  return lane1;
}
/**
 * Resolve a node's lane: follow union-find chain, verify active, clear if stale.
 */
function resolveLane(el) {
  const lane = el._x?._optimisticLane;
  if (!lane) return undefined;
  const root = findLane(lane);
  if (activeLanes.has(root)) return root;
  if (el._x !== null) el._x._optimisticLane = undefined;
  return undefined;
}
function resolveTransition(el) {
  // An active override answers with its owner, not its lane: lanes are
  // scheduling affinity and a shared subscriber merges them across
  // transactions (#2912) — the merged root's _transition would hand this
  // node's override to whichever action wrote last through the shared
  // reader. Chase merge chains; a dead owner settled through another path.
  if (hasActiveOverride(el) && el._x?._overrideOwner) {
    const owner = (ext(el)._overrideOwner = currentTransition(el._x?._overrideOwner));
    if (owner._done !== true) return owner;
    if (el._x !== null) el._x._overrideOwner = null;
  }
  return resolveLane(el)?._transition ?? el._transition;
}
/**
 * Assign or merge a lane onto a node. At convergence points (node already has
 * a different active lane), merge unless the node has an active override.
 */
function assignOrMergeLane(el, sourceLane) {
  const sourceRoot = findLane(sourceLane);
  const existing = el._x?._optimisticLane;
  if (existing) {
    // A merged lane is followed to its root like any other: the root is where
    // the subscriber's affinity lives now. Replacing it with the source lane
    // outright (as this once did) skipped the parent/child check below — an
    // isPending reader of two async siblings had their two companion lanes
    // merge, and the next parent-lane notification then moved it onto the
    // held parent, where its verdict waited on the async it reports (#3409).
    const existingRoot = findLane(existing);
    if (activeLanes.has(existingRoot)) {
      // A WRITTEN override is its own lane's source and merges nothing
      // through it; a derived one (lanes stage, #3479) is a plain member —
      // the shared reader that merges two writers' lanes carries one.
      if (
        existingRoot !== sourceRoot &&
        (!hasActiveOverride(el) || el._config & CONFIG_DERIVED_OVERRIDE)
      ) {
        // Parent-child lanes stay independent so isPending resolves without
        // waiting for the parent's async. The child keeps ownership.
        if (sourceRoot._parentLane && findLane(sourceRoot._parentLane) === existingRoot) {
          ext(el)._optimisticLane = sourceLane;
          el._config |= CONFIG_HAS_LANE;
        } else if (existingRoot._parentLane && findLane(existingRoot._parentLane) === sourceRoot);
        else mergeLanes(sourceRoot, existingRoot);
      }
      return;
    }
  }
  ext(el)._optimisticLane = sourceLane;
  el._config |= CONFIG_HAS_LANE;
}

const transitions = new Set();
const dirtyQueue = {
  _heap: new Array(2000).fill(undefined),
  _marked: false,
  _min: 0,
  _max: 0
};
const zombieQueue = {
  _heap: new Array(2000).fill(undefined),
  _marked: false,
  _min: 0,
  _max: 0
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
 * other reader's. */
function cancelZombieRecompute(el) {
  if (el._flags & REACTIVE_OPTIMISTIC_DIRTY && !laneZombie(el)) return GlobalQueue._update(el);
  if (el._flags & REACTIVE_IN_HEAP_HEIGHT) el._flags &= -140;
  else {
    deleteFromHeap(el, zombieQueue);
    el._flags &= -132;
  }
}
/** A member of a parked LANE frame (CONFIG_LANE_FRAME on the owner whose pass
 * parked it, #3662). The #3444 exception is for transaction zombies; a lane
 * frame's member is retired by the run that carries the lane's values, so its
 * lane-channel recompute is cancelled with the rest — run, it republished the
 * retired frame under those values. Mainline writes still reach it (#3463). */
function laneZombie(el) {
  let p = el;
  while (p !== null && p._flags & REACTIVE_ZOMBIE) p = p._parent;
  return p !== null && (p._config & CONFIG_LANE_FRAME) !== 0;
}
let clock = 0;
let activeTransition = null;
let scheduled = false;
let halted = false;
let haltNotified = false;
let syncDepth = 0;
let projectionWriteActive = false;
let inTrackedQueueCallback = false;
/** > 0 while an action's generator body is on the stack (the synchronous
 * slice between yields). Maintained by action.ts around `it.next()`. */
let actionStepDepth = 0;
function enterActionStep() {
  actionStepDepth++;
}
function exitActionStep() {
  actionStepDepth--;
}
let _enforceLoadingBoundary = false;
let _hitUnhandledAsync = false;
// Once per enforcement window: the ASYNC_OUTSIDE_LOADING_BOUNDARY finding is a
// fact about the MOUNT ("the root mount will be deferred"), not about each
// pending render effect — N async siblings at mount used to produce N copies.
let _reportedUnhandledAsync = false;
// Store property nodes whose last subscriber left while they carried state
// the backing cannot reconstruct — an optimistic override (overrides live on
// nodes, over a clone the setter discards) or a staged write. Releasing the
// slot then would drop the override: an optimistic store key read `0` the
// moment its only reader gated away while the action was live (S7). Swept
// after each flush — a node still without subs whose override and staging
// have resolved is released through the slot hook; one that regained a
// subscriber leaves the set.
const transientStoreNodes = new Set();
/** Slot hook's deferral: release this node when its carried state resolves. */
function deferSlotRelease(node) {
  transientStoreNodes.add(node);
}
function canUseSimpleSyncFlush(queue) {
  const batch = queue._batch;
  return (
    transitions.size === 0 &&
    activeLanes.size === 0 &&
    queue._children.length === 0 &&
    batch._optimisticNodes.length === 0 &&
    batch._affectsNodes.length === 0 &&
    batch._optimisticStores.size === 0 &&
    transientStoreNodes.size === 0 &&
    pendingRearms.size === 0 // a re-arm queued outside a pass drains in run()
  );
}
function sweepTransientStoreNodes() {
  if (transientStoreNodes.size === 0) return;
  for (const node of transientStoreNodes) {
    if (node._subs !== null) {
      transientStoreNodes.delete(node);
      continue;
    }
    if (node._pendingValue !== NOT_PENDING) continue;
    if (node._x?._overrideValue !== undefined && node._x?._overrideValue !== NOT_PENDING) continue;
    // A live affects() mark keeps the node addressable: sweeping it would
    // detach the refcount from the slot (a fresh probe would upsert a new,
    // unmarked node for the same property).
    if (node._x?._affectsCount) continue;
    transientStoreNodes.delete(node);
    if (node._config & CONFIG_SLOT_NODE) slotUnobservedHook(node);
    else node._x?._unobserved?.();
  }
}
/**
 * Consume the unhandled-async hit. Returns whether this is the first report
 * of the current enforcement window — the caller warns only then.
 */
function resetUnhandledAsync() {
  _hitUnhandledAsync = false;
  if (_reportedUnhandledAsync) return false;
  _reportedUnhandledAsync = true;
  return true;
}
/**
 * Toggles the dev-mode "must be inside a `<Loading>` boundary" enforcement
 * window. Only `render()` calls this — wrapping the initial mount so that a
 * top-level uncaught async read surfaces the diagnostic. Not part of the
 * user-facing API.
 *
 * @internal
 */
function enforceLoadingBoundary(enabled) {
  _enforceLoadingBoundary = enabled;
  if (enabled) _reportedUnhandledAsync = false;
}
function setProjectionWriteActive(value) {
  projectionWriteActive = value;
}
function setTrackedQueueCallback(value) {
  inTrackedQueueCallback = value;
}
// Dev-only marker for the effect half of createEffect/createRenderEffect, so
// flush() can report the no-op instead of failing silently (React parity).
let inEffectCallback = false;
function setEffectCallback(value) {
  inEffectCallback = value;
}
/**
 * Ambient work IS a transaction: the global queue always carries one
 * current-transaction-shaped batch (`globalQueue._batch`). With no transition
 * active, registrations (pending commits, optimistic nodes, affects marks,
 * optimistic stores) land in a plain ambient batch that the plain flush
 * finalizes; when a transition initializes it adopts the ambient batch's
 * contents and `_batch` becomes the transition itself, so later registrations
 * land there directly — no per-field aliasing.
 */
function createBatch() {
  return {
    _time: clock,
    _pendingNodes: [],
    _asyncReporters: createAsyncReporters(),
    _optimisticNodes: [],
    _affectsNodes: [],
    _optimisticStores: new Set(),
    _actions: [],
    _queueStash: { _queues: [[], []], _children: [] },
    _done: false,
    _gatedSubs: new Set(),
    _contested: null
  };
}
function mergeTransitionState(target, outgoing) {
  if (attrHooks !== null) attrHooks.transitionMerged(target, outgoing);
  outgoing._done = target;
  target._actions.push(...outgoing._actions);
  target._acted ||= outgoing._acted;
  for (const lane of activeLanes) if (lane._transition === outgoing) lane._transition = target;
  if (outgoing._optimisticNodes.length) {
    // Move (don't copy): the global queue's batch may still be the outgoing
    // transition, and the adoption pass in initTransition would re-push its
    // contents into the target — duplicating every entry.
    target._optimisticNodes.push(...outgoing._optimisticNodes);
    outgoing._optimisticNodes.length = 0;
  }
  if (outgoing._affectsNodes.length) {
    // Move (don't copy): the global queue's batch may still be the outgoing
    // transition, and the adoption pass in initTransition would re-push its
    // contents into the target — double-releasing every mark.
    target._affectsNodes.push(...outgoing._affectsNodes);
    outgoing._affectsNodes.length = 0;
  }
  for (const store of outgoing._optimisticStores) target._optimisticStores.add(store);
  for (const [source, reporters] of outgoing._asyncReporters) {
    let targetReporters = target._asyncReporters.get(source);
    if (!targetReporters) target._asyncReporters.set(source, (targetReporters = new Set()));
    for (const reporter of reporters) targetReporters.add(reporter);
  }
  for (const sub of outgoing._gatedSubs) target._gatedSubs.add(sub);
  if (outgoing._contested) (target._contested ??= []).push(...outgoing._contested);
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
 */
function entangleConfirmingTransitions(obs, target) {
  target = currentTransition(target);
  if (target._done === true) return;
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
  let stole = false;
  for (let l = obs._deps; l !== null; l = l._nextDep) {
    const dep = l._dep;
    if (dep._pendingValue !== NOT_PENDING) {
      const stamp = dep._transition;
      const t = stamp != null ? currentTransition(stamp) : null;
      // Skip the awaiting transaction's own cargo (t === target: a
      // fold-staged landing or a write the action itself issued — hold and
      // reveal already correct) and dead carriers. Ambient-batch staging
      // (t === null) must leave the batch NOW — it commits at this flush's
      // end, which would reveal the confirmation under the live optimism
      // it just confirmed.
      const carrier =
        t === null
          ? currentBatch._pendingNodes
          : t !== target && t._done !== true
            ? t._pendingNodes
            : null;
      if (carrier !== null) stole = stealEntangledCargo(carrier, target) || stole;
    }
    if (l === obs._depsTail) break;
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
 * when they re-derive for real. */
function stealEntangledCargo(carrier, target) {
  if (carrier === target._pendingNodes || carrier.length === 0) return false;
  for (let i = 0; i < carrier.length; i++) {
    const node = carrier[i];
    node._transition = target;
    target._pendingNodes.push(node);
    // Override-covered nodes stay silent AND unmasked: the override is the
    // display (A17 — its staging never notified, its revert will), so their
    // subs saw nothing and re-running one would break the silence with a
    // duplicate fire of an unchanged view.
    if (!hasActiveOverride(node)) {
      node._config |= CONFIG_HELD_TRUTH;
      for (let s = node._subs; s !== null; s = s._nextSub) {
        const sub = s._sub;
        if (sub._type && !(sub._config & CONFIG_AUTHORITATIVE_READ)) enqueueSub(sub);
      }
    }
  }
  carrier.length = 0;
  transitions.add(target);
  return true;
}
/** `schedule()` armed `scheduled` but withheld the microtask because a
 * projection draft was writing (see below). Consumed by `scheduleWithheld`. */
let withheld = false;
function schedule() {
  if (halted) {
    notifyHalted();
    return;
  }
  if (scheduled) return;
  scheduled = true;
  if (!syncDepth && !globalQueue._running) {
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
 * landing's own flush arms at worst one no-op drain.) */
function scheduleWithheld() {
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
 */
const wokenTransitions = [];
/** Wake every parked transaction — for a site that knows a reporter stopped
 * counting but not whose (a boundary reset). */
function wakeParked() {
  for (const t of transitions) wokenTransitions.includes(t) || wokenTransitions.push(t);
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
 */
const pendingRearms = new Set();
function queueRearm(boundary) {
  pendingRearms.add(boundary);
  schedule();
}
/** The drain (see pendingRearms): each boundary decides for itself, from
 * what is pending under it now, whether re-arming means its fallback or
 * nothing. Snapshot first: a re-arm can queue another — a write it makes
 * notifying an `on` that reads it — which is the next pass's. */
function drainRearms() {
  const queued = Array.from(pendingRearms);
  pendingRearms.clear();
  for (let i = 0; i < queued.length; i++) queued[i]._rearm();
}
/** Transactions a mainline tick has PROPOSED against (A34, #3494): a write to a
 * node one of them holds — the same value or another — is a second proposal
 * on a contested node, and the tick reveals with the hold ("both are
 * suggesting a value; if one finished before the other that would be odd").
 * Entered at the next flush's start, where the ambient batch is adopted;
 * never from the write itself, which left `activeTransition` set across the
 * caller's block and made creation after the write the transaction's (A29). */
const batchJoins = [];
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
 */
const ROOT_ERROR_HOOK = Symbol.for("solid-js/root-error-hook");
function haltReactivity(cause) {
  if (halted) return;
  halted = true;
  let message = "[REACTIVITY_HALTED]";
  {
    message +=
      " An uncaught error halted the reactive system. No further updates will be processed. Handle errors with <Errored> or treat this as a crash.";
    emitDiagnostic({
      code: "REACTIVITY_HALTED",
      kind: "error",
      severity: "error",
      message
    });
  }
  // Surface the cause here too: callers rethrow it, but a creation-time throw
  // unwinds through ancestor recomputes that convert it to status instead of
  // surfacing it (#2884), so the rethrow alone cannot guarantee visibility.
  // Where the platform has one, hand the cause to its uncaught-error channel
  // (`reportError` → `error` event → window.onerror / error monitoring): a
  // halt that only reaches console.error leaves a page that LOOKS alive with
  // nothing an app or its telemetry can act on (#3338 — an uncaught throw
  // during the hydration render). The rethrow may reach the top as well in
  // the non-swallowed cases; a duplicate report beats a silent one.
  const report = cause !== undefined && globalThis.reportError;
  report || cause === undefined ? console.error(message) : console.error(message, cause);
  report && report(cause);
}
// Logs on the first write after a halt so a frozen interaction is traceable.
function notifyHalted() {
  if (haltNotified) return;
  haltNotified = true;
  console.error(
    "[REACTIVITY_HALTED] Update ignored: the reactive system was halted by an earlier uncaught error."
  );
}
/** @internal Test/dev-reload hook. Revives scheduling after a halt. */
function resetErrorHalt() {
  halted = false;
  haltNotified = false;
}
// Identifies one child-traversal pass in `Queue.run` so a rescan after the
// child list shifts can tell "already run this pass" from "still pending".
let queueRunToken = 0;
class Queue {
  _parent = null;
  _queues = [[], []];
  _children = [];
  _ranAt = 0;
  created = clock;
  addChild(child) {
    this._children.push(child);
    child._parent = this;
  }
  removeChild(child) {
    const index = this._children.indexOf(child);
    if (index >= 0) {
      this._children.splice(index, 1);
      child._parent = null;
    }
  }
  notify(node, mask, flags, error) {
    if (this._parent) return this._parent.notify(node, mask, flags, error);
    return false;
  }
  run(type) {
    if (this._queues[type - 1].length) {
      const effects = this._queues[type - 1];
      this._queues[type - 1] = [];
      runQueue(effects, type);
    }
    // Effects run here can dispose owners, and disposal removes queues from
    // this list — the running child itself, an earlier sibling, or several at
    // once. A plain index walk then skips whatever shifted into the cursor.
    // Stamping each child before it runs makes the pass idempotent, so a shift
    // can be recovered by rescanning from the front and every child still runs
    // exactly once. Children appended mid-pass carry a stale stamp and run,
    // matching the previous live-array behaviour.
    const children = this._children;
    const token = ++queueRunToken;
    for (let i = 0; i < children.length; ) {
      const child = children[i];
      if (child._ranAt !== token) {
        child._ranAt = token;
        child.run?.(type);
        if (children[i] !== child) {
          i = 0;
          continue;
        }
      }
      i++;
    }
  }
  enqueue(type, fn) {
    if (type) {
      // Route to lane's effect queue if we're in an optimistic recomputation
      if (currentOptimisticLane) {
        const lane = findLane(currentOptimisticLane);
        lane._effectQueues[type - 1].push(fn);
      } else {
        this._queues[type - 1].push(fn);
      }
    }
    schedule();
  }
  stashQueues(stub) {
    // Attribution hook: the parking transition's lane effects have run; its
    // queues are being stashed. Root call only (children recurse below).
    if (attrHooks !== null && this === globalQueue) attrHooks.holdEnd();
    stub._queues[0].push(...this._queues[0]);
    stub._queues[1].push(...this._queues[1]);
    this._queues = [[], []];
    for (let i = 0; i < this._children.length; i++) {
      let child = this._children[i];
      let childStub = stub._children[i];
      if (!childStub) {
        childStub = { _queues: [[], []], _children: [] };
        stub._children[i] = childStub;
      }
      child.stashQueues(childStub);
    }
  }
  restoreQueues(stub) {
    this._queues[0].push(...stub._queues[0]);
    this._queues[1].push(...stub._queues[1]);
    for (let i = 0; i < stub._children.length; i++) {
      const childStub = stub._children[i];
      let child = this._children[i];
      if (child) child.restoreQueues(childStub);
    }
  }
}
class GlobalQueue extends Queue {
  _running = false;
  // The current transaction-shaped batch: a plain ambient batch while no
  // transition is active, the active transition itself after initTransition.
  _batch = createBatch();
  static _update;
  static _dispose;
  static _runEffect;
  static _clearOptimisticStores = null;
  // Store-side hook: drops a keyless affects() mark's identity scope when the
  // carrier node's last registration releases (wired by store.ts, mirroring
  // _clearOptimisticStore).
  static _releaseAffectsScope = null;
  // affects()-side hooks (wired by affects.ts, mirroring _update): the mark
  // engine — count/register/release — lives with the feature. Every call site
  // is gated by state only that module creates, so `!` invocations are safe
  // once the gate holds.
  static _releaseAffectsMarks = null;
  static _markAffects = null;
  static _releaseAffectsMark = null;
  // External-source bridge (wired by enableExternalSource(); null while no
  // config is active — including after _resetExternalSourceConfig()).
  static _wireExternalSource = null;
  static _externalUntrack = null;
  // Verdict-layer hooks (wired by verdict.ts when isPending()/latest() are
  // imported; null in apps that never use them). Call sites either guard for
  // null or sit behind state only the verdict layer can create (`!` is safe
  // there: `_pendingSignal`/`_latestValueComputed` are only ever assigned by
  // verdict.ts, and `pendingCheckActive`/`latestReadActive` only flip inside
  // isPending()/latest()).
  static _syncCompanions = null;
  static _updatePendingSignal = null;
  static _updateChildCompanions = null;
  static _snapCompanions = null;
  static _latestRead = null;
  static _pendingCheck = null;
  static _recordFresh = null;
  static _applyReask = null;
  static _repollVerdicts = null;
  static _witnessAffects = null;
  // Re-asks probes whose verdict was provisionally suppressed by a fresh read
  // of a held value, once the transaction gains an async blocker (#3028).
  static _wakeSuppressedProbes = null;
  // Optimistic-engine hooks (wired by core/optimistic.ts via
  // installOptimisticEngine(), called from verdict.ts / createOptimistic /
  // createOptimisticStore — every module that can create optimistic state).
  // Call sites are gated by state only the engine can create: an
  // `_overrideValue` slot, a lane in `activeLanes`, an `_optimisticNodes`
  // entry, or a non-null `currentOptimisticLane`, so `!` invocations are safe
  // once the gate holds.
  static _optimisticWrite = null;
  static _resolveOptimistic = null;
  static _transitionBlocked = null;
  static _cleanupLanes = null;
  static _runLaneEffects = null;
  /** Patch-channel optimistic drain (next/patch.ts): optimistic emissions
   * apply at lane-effect timing — visible in flight, unlike the regular
   * effect queues an action stashes. Injected; null when unused. */
  static _drainPatchOptimistic = null;
  static _gatedRead = null;
  static _laneSuspends = null;
  /** Is the node routed through a LIVE lane (`resolveLane`)? read()'s reveal
   * carve-out asks before showing a foreign-held pending node's committed
   * value: a lane-derived flight's inputs are already revealed through the
   * lane (#3334). Gated on CONFIG_HAS_LANE, which only the engine sets. */
  static _laneLive = null;
  static _laneReadsCommitted = null;
  static _recomputeLane = null;
  static _laneAsyncPending = null;
  /** Authoritative-view reader wakeup: installed by until() and refresh() before
   * their first read. Call sites are gated by CONFIG_AUTHORITATIVE_OBSERVED, which
   * only such a reader's carve-out read can set, so `!` invocations are safe once
   * the gate holds (#3303). */
  static _notifyAuthoritativeObservers = null;
  static _laneAsyncSettled = null;
  /** A18 supersession (#3331): own-source truth `value` landed under an active
   * override. The engine decides whether the graph re-derives — the value
   * differs from the override and is not a stale (older-action) answer (mark
   * the node, demote its lane cascade, notify), or returns to it after an
   * earlier differing arrival (clear the mark, notify) — and owns the
   * authoritative-observer wake for a silent confirm. Installed with the
   * optimistic engine; only reachable on a node that has an override. */
  static _supersedeOverride = null;
  /** The flush's pre-verdict step (#3427): once the transaction's action
   * bodies have all ended and nothing authoritative is left in flight, the
   * engine supersedes every override still in force with the truth it
   * reverts to, so the graph re-derives from it now, as the transaction's
   * held work, instead of after the flights the overrides fed have landed.
   * True when it superseded something: the caller re-runs the heap ahead of
   * the verdict. The engine owns every gate (acted, actions drained, has
   * overrides, no store edits, no authoritative flight); null without it. */
  static _endOptimism = null;
  /** read()'s value for a TRACKED reader of a superseded node (#3331): the
   * staged truth, unless the reader is a stale (render) reader of another
   * transaction — then the displayed override, as it keeps a foreign
   * transaction's committed value over its staged write. */
  /** A tracked read of an active override: the lane outside-view rule
   * (#3460) and the A18 supersession selection (#3331) — see optimistic.ts. */
  static _overrideRead = null;
  /** A lane pass's publish for a memo (#3479, lanes stage): the speculative
   * result becomes a DERIVED override, `_value` stays committed — see
   * optimistic.ts laneOverride. Set with the engine, which a lane implies. */
  static _laneOverride = null;
  /** Verdict-layer recompute in progress (companion creation, latest()/
   * isPending() pulls): never born held — see core.ts enterStagedRead. */
  static _verdictPull = false;
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
  static _landOnOverride = null;
  static _trackOptimisticStore = null;
  flush() {
    if (this._running) return;
    this._running = true;
    resyncUnflushedCompanions(); // A28, see above
    try {
      // The tick proposed against a hold (#3494): adopt its batch into it.
      // Inside the try: the adoption runs user comparators (the no-proposal
      // drop), and a throw there must not leave `_running` set.
      while (batchJoins.length) this.initTransition(batchJoins.pop());
      if (true) devCheckFlushStart();
      // Before runHeap for the same reason as the fast drain above; late
      // subscribers (an effect reading a swept memo this flush) revive it,
      // which is the pay-for-use contract.
      sweepDormant();
      runHeap(dirtyQueue, GlobalQueue._update);
      // The action bodies are over: the overrides they leave in force
      // revert at this settle, and the correction is this transaction's
      // held work — re-derived here, under it, ahead of the verdict — not a
      // waterfall after the flights the overrides fed (#3427). After the
      // heap, not before: a synchronous body's own writes (a refresh that
      // puts an override node's source in flight) are judged applied.
      if (activeTransition && GlobalQueue._endOptimism?.(activeTransition))
        runHeap(dirtyQueue, GlobalQueue._update);
      // Re-arm the boundaries whose `on` notified this pass (pendingRearms):
      // after the heap — what the notification put in flight is registered —
      // and before the verdict, under the transaction that carried it. The
      // boundary releases its hold and stages its fallback swap with the
      // frame; the heap re-runs so its output pass is staged too, ahead of
      // the verdict that commits or parks it (#3540).
      if (pendingRearms.size) {
        drainRearms();
        runHeap(dirtyQueue, GlobalQueue._update);
      }
      if (activeTransition) {
        // A boundary whose fallback read something not ready is judged before
        // the verdict, under the transaction (boundaries.ts `_judgeHeld`,
        // #3540): its output is pending on that read and holds the frame,
        // and only a sweep re-runs it — the commit sweep, after the verdict
        // its own read keeps parking. Ready, it stages `_disabled` false with
        // the frame; the heap re-runs so the output drops the read ahead of
        // the verdict.
        if (this._children.length) {
          checkBoundaryChildren(this, true);
          if (dirtyQueue._max >= dirtyQueue._min) runHeap(dirtyQueue, GlobalQueue._update);
        }
        const isComplete = transitionComplete(activeTransition);
        if (!isComplete) {
          const stashedTransition = activeTransition;
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
          runHeap(
            zombieQueue,
            this._batch === stashedTransition ? cancelZombieRecompute : GlobalQueue._update
          );
          // Detach: the stashed transition keeps its batch; ambient work that
          // follows lands in a fresh one. If the batch is already a separate
          // ambient one — action done() restored activeTransition without
          // adopting the batch, and an ordinary write landed there before
          // the scheduled flush (#2916) — keep it: replacing it would strand
          // its queued pending nodes with held _pendingValues forever.
          if (this._batch === stashedTransition) currentBatch = this._batch = createBatch();
          // Run lane effects immediately (before stashing) - lanes with no pending async
          if (activeLanes.size) {
            GlobalQueue._runLaneEffects(EFFECT_RENDER);
            GlobalQueue._runLaneEffects(EFFECT_USER);
          }
          this.stashQueues(stashedTransition._queueStash);
          clock++;
          // A kept ambient batch may hold pending nodes (#2916): stay
          // scheduled so the outer drain loop commits them via the plain
          // flush path instead of leaving them until the next natural flush.
          scheduled = dirtyQueue._max >= dirtyQueue._min || this._batch._pendingNodes.length > 0;
          reassignPendingTransition(stashedTransition._pendingNodes);
          activeTransition = null;
          finalizePureQueue(null, true);
          return;
        }
        const completingTransition = activeTransition;
        const batch = this._batch;
        batch !== completingTransition &&
          batch._pendingNodes.push(...completingTransition._pendingNodes);
        this.restoreQueues(completingTransition._queueStash);
        transitions.delete(completingTransition);
        activeTransition = null;
        reassignPendingTransition(batch._pendingNodes);
        finalizePureQueue(completingTransition);
        if (batch === completingTransition) {
          // Drop the dead Transition wrapper but keep its (drained) containers
          // as the ambient batch — late registrations during finalization live
          // there and must survive to the next flush.
          const fresh = createBatch();
          fresh._pendingNodes = batch._pendingNodes;
          fresh._optimisticNodes = batch._optimisticNodes;
          fresh._affectsNodes = batch._affectsNodes;
          fresh._optimisticStores = batch._optimisticStores;
          currentBatch = this._batch = fresh;
        }
      } else {
        if (canUseSimpleSyncFlush(this)) {
          commitPendingNodes();
          if (dirtyQueue._max >= dirtyQueue._min) {
            runHeap(dirtyQueue, GlobalQueue._update);
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
            runHeap(zombieQueue, GlobalQueue._update);
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
      scheduled =
        dirtyQueue._max >= dirtyQueue._min ||
        activeTransition !== null ||
        this._batch._pendingNodes.length !== 0;
      // Run lane effects first (for ready lanes), then regular effects
      activeLanes.size && GlobalQueue._runLaneEffects(EFFECT_RENDER);
      this.run(EFFECT_RENDER);
      activeLanes.size && GlobalQueue._runLaneEffects(EFFECT_USER);
      this.run(EFFECT_USER);
      if (true) {
        devCheckActiveOverrides(n => {
          if (this._batch._optimisticNodes.includes(n)) return true;
          if (activeTransition?._optimisticNodes.includes(n)) return true;
          for (const t of transitions) if (t._optimisticNodes.includes(n)) return true;
          return false;
        });
        devCensusCompanions(n => this._batch._pendingNodes.includes(n));
      }
      if (
        true &&
        !scheduled &&
        !activeTransition &&
        transitions.size === 0 &&
        activeLanes.size === 0
      ) {
        // Fully drained: no transition-scoped state may survive this point.
        devCheckQuiescent(n => this._batch._pendingNodes.includes(n));
      }
      if (true) DEV.hooks.onUpdate?.();
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
      while (!scheduled && !activeTransition && wokenTransitions.length)
        this.initTransition(wokenTransitions.pop());
      this._running = false;
    }
  }
  notify(node, mask, flags, error) {
    // Only track async if the boundary is propagating STATUS_PENDING (not caught by boundary)
    if (mask & STATUS_PENDING) {
      if (flags & STATUS_PENDING) {
        // Callers pass either nothing or this node's own `_x._error`, so `??`
        // is exact (a null error falls back to the same null).
        const actualError = error ?? node._x?._error;
        // A visibility-only mark notification (the affects() boundary
        // channel) updates display state on its way up but must be invisible
        // to completion accounting BY CONSTRUCTION: it never registers a
        // reporter and never counts toward the loading-boundary diagnostic.
        if (actualError?._markVisual) return true;
        if (actualError) {
          // A reveal can discover a flight started in an earlier flush. Hold
          // the staged writes with that reader (A15), even if the reader is
          // new. Fresh/reset loading boundaries consume pending before it
          // reaches here. A reader already parked in a transition must not
          // open a second one.
          if (!activeTransition && !node._transition && currentBatch._pendingNodes.length)
            this.initTransition();
          if (activeTransition) {
            const source = actualError.source;
            let reporters = activeTransition._asyncReporters.get(source);
            if (!reporters) activeTransition._asyncReporters.set(source, (reporters = new Set()));
            const prevSize = reporters.size;
            reporters.add(node);
            if (reporters.size !== prevSize) {
              schedule();
              GlobalQueue._wakeSuppressedProbes?.(activeTransition);
            }
          }
        }
        if (_enforceLoadingBoundary) _hitUnhandledAsync = true;
      }
      return true;
    }
    return false;
  }
  initTransition(transition) {
    if (transition) {
      transition = currentTransition(transition);
      // A finished transaction cannot be re-entered: its state is committed
      // or reverted, so "rejoining" it (A26) is meaningless and re-activating
      // it spins the drain loop (#3140). The refusal must be a bare return —
      // redirecting the caller to a fresh batch would re-arm the loop with a
      // new transaction identity each pass. Stamps are cleared at commit, so
      // this is a belt for paths that hand over a chased-dead reference
      // (merged chains, async settles racing completion).
      if (transition._done === true || transition === activeTransition) return;
    }
    if (!transition && activeTransition && activeTransition._time === clock) return;
    if (!activeTransition) {
      activeTransition = transition ?? createBatch();
    } else if (transition) {
      const outgoing = activeTransition;
      mergeTransitionState(transition, outgoing);
      // Effects the outgoing transaction parked belong to the surviving one
      // now: back onto the live queue, where this flush parks them under
      // `transition` or runs them at its completion. The outgoing stash is
      // never read again — the transaction is dead (#3310).
      this.restoreQueues(outgoing._queueStash);
      transitions.delete(outgoing);
      activeTransition = transition;
    }
    transitions.add(activeTransition);
    activeTransition._time = clock;
    const batch = this._batch;
    if (batch !== activeTransition) {
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
      const adopted = this._running ? 0 : CONFIG_ADOPTED_UNFLUSHED;
      for (let i = 0; i < batch._pendingNodes.length; i++) {
        const node = batch._pendingNodes[i];
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
        if (
          node._transition === null &&
          node._pendingValue !== NOT_PENDING &&
          (!node._fn ||
            (node._flags & REACTIVE_MANUAL_WRITE && !(node._statusFlags & STATUS_UNINITIALIZED))) &&
          node._equals &&
          node._equals(node._value, node._pendingValue)
        ) {
          node._pendingValue = NOT_PENDING;
          commitPendingNode(node);
          continue;
        }
        node._transition = activeTransition;
        node._config |= adopted;
        activeTransition._pendingNodes.push(node);
      }
      for (let i = 0; i < batch._optimisticNodes.length; i++) {
        const node = batch._optimisticNodes[i];
        node._transition = activeTransition;
        activeTransition._optimisticNodes.push(node);
      }
      if (batch._affectsNodes.length) activeTransition._affectsNodes.push(...batch._affectsNodes);
      for (const store of batch._optimisticStores) activeTransition._optimisticStores.add(store);
      // Gated readers recorded against the ambient batch move with it: their
      // replay-at-commit now happens at the transaction's completion.
      if (batch._gatedSubs.size) {
        for (const sub of batch._gatedSubs) activeTransition._gatedSubs.add(sub);
        batch._gatedSubs.clear();
      }
      currentBatch = this._batch = activeTransition;
    }
    for (const lane of activeLanes) {
      if (!lane._transition) lane._transition = activeTransition;
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
function queuePendingNode(node) {
  lastStagedNodeName = node._name ?? null;
  currentBatch._pendingNodes.push(node);
  if (!globalQueue._running) markUnflushedStaged(); // A28
}
// Dev-only attribution for the flush loop guard (#3140): when the guard
// trips, naming what the loop kept chewing on lets the app author attribute
// the runaway without patching dist.
let lastStagedNodeName = null;
// Sticky: flips true on the first refresh() ever (the only setter of
// REACTIVE_REASK) so the hot notification loop skips the per-subscriber flag
// clear entirely in apps that never refresh.
let reaskArmed = false;
/** §12d: bumped by every recompute and every new subscriber edge. A node's
 * staged-rewrite skip is sound only while NOTHING recomputed or linked since
 * its last notify — a mid-batch pull can clean a marked subscriber, and a
 * skipped re-write would leave it stale. */
let notifyEpoch = 0;
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
 * so the transition object cannot say WHICH action asked; this can. */
let origin = 0;
function setOrigin(seq) {
  const prev = origin;
  origin = seq;
  return prev;
}
function insertSubs(node, optimistic = false) {
  // §12d: stamp before walking — setSignal's staged-rewrite fast path skips
  // the next walk for this node while the epoch holds (marking is idempotent).
  node._notifiedAt = notifyEpoch;
  // Get source lane: prefer node's own lane over current context
  // This is important for isPending signals which need their own lane to flush immediately
  // Presence bits gate the optional-slot probes (see constants.ts): one
  // masked read of the always-present _config instead of missing-property
  // lookups in the hottest notify loop. Bits are sticky — the field read
  // stays authoritative when a bit is set.
  const cfg = node._config;
  const sourceLane =
    (cfg & CONFIG_HAS_LANE ? node._x?._optimisticLane : undefined) || currentOptimisticLane;
  const hasSnapshot = (cfg & CONFIG_HAS_SNAPSHOT) !== 0 && node._x?._snapshotValue !== undefined;
  const clearReask = reaskArmed;
  // Observe-tier fan-out: this walk visits every subscriber edge anyway, so
  // the graph-size count is one local increment here and no field anywhere.
  let fanOut = 0;
  for (let s = node._subs; s !== null; s = s._nextSub) {
    const sub = s._sub;
    fanOut++;
    // A value-change notification is a new question for the subscriber: any
    // pending re-ask mark (refresh) it carried is superseded.
    if (clearReask) sub._flags &= ~REACTIVE_REASK;
    // Missed-wake latch (#3037): this write is landing while the subscriber
    // is mid-recompute (a nested pull committing beneath its reads), and the
    // heap refuses RECOMPUTING nodes. A gen-current link means the pass
    // already validated this dep — the value it read is now stale — so latch
    // for recompute's tail to reschedule. Untouched links need no latch (the
    // pass either re-reads them fresh or trims them), and neither does the
    // tail link: it is the read IN FLIGHT — read() links before it pulls, so
    // this very commit is what that read returns.
    if (sub._flags & REACTIVE_RECOMPUTING_DEPS && s._gen === sub._depGen && s !== sub._depsTail)
      sub._flags |= REACTIVE_MISSED_WAKE;
    if (hasSnapshot && sub._config & CONFIG_IN_SNAPSHOT_SCOPE) {
      sub._flags |= REACTIVE_SNAPSHOT_STALE;
      continue;
    }
    if (optimistic && sourceLane) {
      sub._flags |= REACTIVE_OPTIMISTIC_DIRTY;
      assignOrMergeLane(sub, sourceLane);
    } else if (optimistic) {
      sub._flags |= REACTIVE_OPTIMISTIC_DIRTY;
      // No source lane means reversion - clear subscriber's lane so effects go to regular queue
      if (sub._x) sub._x._optimisticLane = undefined;
    }
    enqueueSub(sub);
  }
  if (fanOut >= GRAPH_SIZE_WARN_AT) noteFanOut(node, fanOut);
}
function commitPendingNode(n) {
  const c = n;
  if (!c._fn) {
    if (n._pendingValue !== NOT_PENDING) {
      n._value = n._pendingValue;
      n._pendingValue = NOT_PENDING;
    }
    if (n._config & CONFIG_HAS_COMPANIONS) GlobalQueue._snapCompanions(n);
    return;
  }
  if (n._pendingValue !== NOT_PENDING) {
    n._value = n._pendingValue;
    n._pendingValue = NOT_PENDING;
    // A node born held (recompute) initializes at this commit.
    c._statusFlags &= ~STATUS_UNINITIALIZED;
    // Set _modified for effects, but not for tracked effects (they handle their own scheduling)
    if (n._type && n._type !== EFFECT_TRACKED) n._modified = true;
    // A quiet re-ask classification preserved through a held landing dies
    // with the value commit — the commit IS the reveal (#3178). Gated on the
    // staged value: status propagation queues pending nodes whose windows
    // are still OPEN (no staged value), and their live classification must
    // survive this sweep.
    if (n._x) n._x._reask = false;
  }
  // The committed hold is the first observable answer for a loading-window
  // node — the window closes here, not at compute time (#2990). Unconditional
  // store to an always-present computed slot.
  c._loading = false;
  c._flags &= ~REACTIVE_MANUAL_WRITE;
  // The children this commit publishes are the frame's now (#3404) — and so
  // are the dependencies of the pass that produced the value: the previous
  // frame's tail goes (A30, #3410; `recompute` left it for a staged pass). Only
  // after a clean pass: `_error` is cleared by a clean pass or by the node's
  // own landing (whose pass was clean), so a set `_error` means the last pass
  // threw, kept its full list, and `_depsTail` marks where it stopped.
  if (c._x?._error == null) trimStaleDeps(c);
  // A LANE frame still parked here (#3662) rode a hold that stashed the run
  // that would have retired it: this commit applies that run, so it goes too.
  c._config &= -68157441;
  if (!(c._statusFlags & STATUS_PENDING)) c._statusFlags &= ~STATUS_UNINITIALIZED;
  // A flight this commit leaves in the air (unobserved, or observed only by
  // a boundary) now has PUBLISHED inputs: its committed value is stale
  // against the frame. read()'s reveal carve-out keys on the mark (#3305).
  else n._config |= CONFIG_INPUTS_PUBLISHED;
  if (c._x != null && (c._x._pendingFirstChild !== null || c._x._pendingDisposal !== null))
    GlobalQueue._dispose(c, false, true);
  if (n._config & CONFIG_HAS_COMPANIONS) GlobalQueue._snapCompanions(n);
}
// Store commit hook (INTERNALS-STORE-STATE.md §3): installed by the store
// module at init (same treeshakeable pattern as _resolveOptimistic /
// _clearOptimisticStores). Folds committed store-node values into their
// backing objects at the same moment pending values commit — the single
// mutation point of the owned-raw model.
let storeCommitHook = null;
function setStoreCommitHook(fn) {
  storeCommitHook = fn;
}
/** Held truth committed this finalize, awaiting its post-revert wake (see
 * finalizePureQueue): the commit IS the reveal, but subscribers must not
 * re-derive until the settling transaction's optimistic overrides have
 * reverted — a commit-time wake recomputes them in the window where
 * confirming truth is committed and the override still displays, a torn
 * frame no timeline contains. */
const heldRevealed = [];
/** Unchanged passes with a stale dependency tail, waiting on this flush's
 * verdict (A30, #3469). A pass that changed nothing replaced nothing either —
 * and cannot know at its own tail whether the flush that ran it will park:
 * parked, its inputs are held and the committed frame still derives from the
 * tail (`b() ? b() : a()` computed `1` from the held `b`, equal to the `1` it
 * had from `a` — with `a` trimmed, the mainline `a = 2` never reached it).
 * Trimmed when the flush commits; dropped with a park, the tail stays linked
 * until a committing pass trims it (one spurious recompute at most). */
const heldTrims = [];
function commitPendingNodes() {
  while (heldTrims.length) trimStaleDeps(heldTrims.pop());
  const pendingNodes = currentBatch._pendingNodes;
  for (let i = 0; i < pendingNodes.length; i++) {
    const node = pendingNodes[i];
    commitPendingNode(node);
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
    node._transition = null;
    if (node._config & CONFIG_HELD_TRUTH) {
      node._config &= ~CONFIG_HELD_TRUTH;
      heldRevealed.push(node);
    }
  }
  pendingNodes.length = 0;
  storeCommitHook?.();
}
function finalizePureQueue(completingTransition = null, incomplete = false) {
  // For incomplete transitions, skip pending resolution and optimistic reversion
  // For completing transitions or no-transition, resolve pending and revert optimistic
  const finalizingBatch = currentBatch;
  const resolvePending = !incomplete;
  if (resolvePending) commitPendingNodes();
  // A parked finalize sweeps nothing: the boundaries' staged swaps are the
  // transaction's, and a boundary whose own output parks the verdict was
  // judged under it in run(), ahead of the verdict (#3540).
  if (!incomplete && globalQueue._children.length) checkBoundaryChildren(globalQueue);
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
  const contested = completingTransition?._contested;
  const revertsOptimism =
    resolvePending && (completingTransition ?? finalizingBatch)._optimisticNodes.length !== 0;
  if (contested && !revertsOptimism)
    for (const el of contested) if (!(el._flags & REACTIVE_DISPOSED)) enqueueSub(el);
  const ranHeap = dirtyQueue._max >= dirtyQueue._min;
  if (ranHeap) runHeap(dirtyQueue, GlobalQueue._update);
  if (resolvePending) {
    // Boundary checks, commit hooks and recomputes can enter a transaction,
    // which adopts the batch this finalize was settling: nothing batch-derived
    // may be committed or reverted here — the entered transaction owns it now
    // (#3319). A completing transaction's OWN containers are a different
    // matter: when the ambient batch was separate from it (the #2916 shape),
    // adoption never touched them and it must still settle them; when the
    // batch WAS the completing transaction, adoption re-stamped its contents
    // into the entered one and there is nothing left to settle.
    if (currentBatch !== finalizingBatch) {
      if (completingTransition === null || completingTransition === finalizingBatch) return;
    } else if (ranHeap) commitPendingNodes();
    // The settling batch: the completing transaction's, or the ambient one.
    const batch = completingTransition ?? finalizingBatch;
    // Optimistic reversion: a non-empty batch means _optimisticWrite ran,
    // which installed the engine's hooks.
    if (batch._optimisticNodes.length) GlobalQueue._resolveOptimistic(batch._optimisticNodes);
    if (contested && revertsOptimism) {
      for (const el of contested) if (!(el._flags & REACTIVE_DISPOSED)) enqueueSub(el);
      schedule();
    }
    // Replay entanglement: subs recorded by the read-time gate get rescheduled
    // so they re-run with the now-committed values visible. The ambient batch
    // replays too — laneReadsCommitted records readers whose committed-view
    // read hid a same-tick plain write that just committed above (#2963).
    if (batch._gatedSubs.size) {
      for (const sub of batch._gatedSubs) {
        if (sub._flags & REACTIVE_DISPOSED) continue;
        enqueueSub(sub);
      }
      batch._gatedSubs.clear();
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
    if (batch._affectsNodes.length) {
      GlobalQueue._releaseAffectsMarks(batch._affectsNodes);
      if (globalQueue._children.length) checkBoundaryChildren(globalQueue);
    }
    // A non-empty set means trackOptimisticStore ran, which installed the
    // hook; the hook iterates, clears, and schedules (keeping the loop out of
    // core lets esbuild shake it — rollup already folds the null guard). The
    // completing transition scopes the clear to its own layer keys (#2899).
    if (batch._optimisticStores.size)
      GlobalQueue._clearOptimisticStores(batch._optimisticStores, completingTransition);
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
      if (dirtyQueue._max >= dirtyQueue._min) {
        runHeap(dirtyQueue, GlobalQueue._update);
        commitPendingNodes();
      }
    }
    sweepTransientStoreNodes();
    // Lanes only enter activeLanes through the engine's getOrCreateLane.
    if (activeLanes.size) GlobalQueue._cleanupLanes(completingTransition);
  }
}
/** The boundary sweep: the commit's (`_checkSources`), or — `held`, before
 * the verdict (#3540) — the one for a collecting boundary whose output is
 * pending on its fallback's read (`_judgeHeld`). */
function checkBoundaryChildren(queue, held) {
  for (const child of queue._children) {
    held ? child._judgeHeld?.() : child._checkSources?.();
    checkBoundaryChildren(child, held);
  }
}
/**
 * Count of live `affects()` registrations across the system (including
 * store-scope inherited marks). Gates the read-path mark check in `read()` so
 * graphs that never use the feature pay one integer compare.
 */
let activeAffectsMarks = 0;
/**
 * Counter mutation seam for the mark engine in affects.ts: an imported `let`
 * binding is read-only, and the read-path gate above must stay a plain module
 * variable so `read()` pays one integer compare, not a function call.
 *
 * @internal
 */
function shiftAffectsMarks(delta) {
  activeAffectsMarks += delta;
}
function reassignPendingTransition(pendingNodes) {
  for (let i = 0; i < pendingNodes.length; i++) {
    pendingNodes[i]._transition = activeTransition;
    pendingNodes[i]._config &= ~CONFIG_ADOPTED_UNFLUSHED; // this flush carried it
  }
}
const globalQueue = new GlobalQueue();
// Hot-path mirror of `globalQueue._batch`: `queuePendingNode` runs once per
// staged write and `commitPendingNodes` once per flush, and the extra
// property hop through `_batch` was a measured instruction-count regression
// (CodSpeed update1to1, PR #2905). The field stays authoritative for
// cross-module readers; every `_batch` assignment updates both.
let currentBatch = globalQueue._batch;
function flush(fn) {
  // Inside an action body the drain is incoherent (#3333): the action's
  // writes are held by its transaction until it settles, so a drain can't
  // reveal them — and the loop below only exits once `activeTransition` is
  // null, so it would PARK the transaction mid-slice and every write after it
  // in the body would land as a plain, committed write. The reporter's
  // "leading flush()" workaround was exactly that leak. Prod: run `fn` if
  // given (its writes stay in the transaction) and skip the drain.
  if (actionStepDepth > 0) {
    {
      throw new Error(
        "[FLUSH_IN_ACTION] flush() inside an action body is not allowed. An action's writes are held in its " +
          "transaction and commit when the action settles: flush() cannot reveal them, and draining here would " +
          "detach the writes that follow from the transaction. Remove the flush(); to observe the result, read " +
          "after the action resolves."
      );
    }
  }
  if (fn) {
    syncDepth++;
    try {
      return fn();
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
  if (globalQueue._running) {
    if (inTrackedQueueCallback) {
      throw new Error(
        "Cannot call flush() from inside onSettled or createTrackedEffect. flush() is not reentrant there. " +
          "Writes made here are processed in the same flush's continuation; to force a drain afterwards, defer it: queueMicrotask(() => flush())."
      );
    }
    if (inEffectCallback) {
      const message =
        "[FLUSH_IN_EFFECT_CALLBACK] flush() called from inside an effect callback is a no-op: the flush that runs effects is already in progress. " +
        "Writes made here are processed in the same flush's continuation; to force a drain afterwards, defer it: queueMicrotask(() => flush()).";
      reportDiagnostic(
        emitDiagnostic({
          code: "FLUSH_IN_EFFECT_CALLBACK",
          kind: "lifecycle",
          severity: "warn",
          message
        })
      );
    }
    return;
  }
  if (halted) return;
  let count = 0;
  // Attribution: whether this call drained anything, so `flushEnd` fires once
  // per real drain and never for a no-op call. The declaration is dead in
  // prod (its only write is behind true) and rollup drops it.
  let drained = false;
  // The drain's opening instant, under the loop's own condition so it fires
  // exactly when `flushEnd` below will. Outside every try (see the rule in
  // attribution-hooks.ts).
  if (attrHooks !== null && (scheduled || activeTransition)) attrHooks.flushStart();
  // `flush()` is an explicit drain point, so it must also process an active
  // transition even if no microtask was scheduled for it yet.
  while (scheduled || activeTransition) {
    if (++count === 1e5) {
      // Attribution beats a bare guard (#3140): say what kept the loop alive.
      // A completed transition being re-activated reads `done=true` here —
      // the corpse-revival signature — while application-driven runaways
      // (#2843) usually show staged work naming the culprit node.
      const t = activeTransition;
      throw new Error(
        `Potential Infinite Loop Detected. Kept alive by ${scheduled ? "scheduled work" : "an active transition"}${
          t
            ? `; transition: done=${t._done === true}, pending=${t._pendingNodes.length}, optimistic=${t._optimisticNodes.length}, asyncReporters=${t._asyncReporters.size}`
            : ""
        }${lastStagedNodeName ? `; last staged node: ${lastStagedNodeName}` : ""}`
      );
    }
    globalQueue.flush();
    drained = true;
  }
  // Provenance ends with the drain: every ambient window (an action's first
  // slice, a landing's propagation) runs to this flush.
  origin = 0;
  // Outside every try in this function (see the rule in attribution-hooks.ts):
  // the drain loop above is the one place all scheduled work funnels through,
  // so this is the "committed and effects ran, or parked" instant for
  // everything the loop processed.
  if (drained && attrHooks !== null) attrHooks.flushEnd();
}
function runQueue(queue, type) {
  for (let i = 0; i < queue.length; i++) queue[i](type);
}
/** Does `reporter` still hold the transaction waiting on `source` — live,
 * routed to no collecting loading boundary, and deriving from the source in
 * its current pass? The verdict's per-reporter test (sourceObserved), also
 * a boundary re-arm's (boundaries.ts `_rearm` runs before the verdict prunes
 * registrations that stopped counting). */
function reporterBlocksSource(reporter, source, verdict) {
  const flags = reporter._flags;
  if (flags & REACTIVE_DISPOSED) return false;
  // A zombie renders until the commit that disposes it (#3463): while its
  // removal is staged in a live transaction it is still on screen, and what
  // it displays must stay consistent with the frame — a held `Show`'s
  // `Details: 0` beside the lane's `Value: 1` otherwise. Its say is moot for
  // the verdict of the transaction that stages the removal (`verdict`): done,
  // and the commit disposes it; not done, and it stays parked regardless. A
  // zombie whose removal commits this flush (owner's pass not held) is dead.
  // The owner is stamped when the flush parks; held in this flush, its
  // staging transaction is the active one.
  if (flags & REACTIVE_ZOMBIE) {
    let p = reporter;
    while (p && p._flags & REACTIVE_ZOMBIE) p = p._parent;
    let t = p && (p._transition || (p._config & CONFIG_HELD_CHILDREN ? activeTransition : null));
    // A LANE frame's member (#3662) is displayed until its owner's run
    // applies, and the lane's transaction is what applies it (its completion
    // runs the lane's queue): moot for that verdict, live for every other.
    if (!t && p && p._config & CONFIG_LANE_FRAME && p._x?._optimisticLane)
      t = findLane(p._x._optimisticLane)._transition;
    if (!t || (t = currentTransition(t))._done === true || t === verdict) return false;
  }
  // Fallback-caught async holds nothing. A collecting loading boundary
  // consumes the notification, so a reader under a fallback never registers —
  // but a reader registered while its boundary showed content stays
  // registered when the boundary's `on` later changes and it flips to the
  // fallback. The reader is behind the fallback now; if nothing outside the
  // boundary consumes the flight, the hold is over (A33, ruled 2026-09-12, #3375).
  for (let q = reporter._queue; q; q = q._parent)
    if (q._collectionType & STATUS_PENDING && !q._initialized) return false;
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
  if (reporter._x?._pendingSources?.has(source)) return true;
  const tail = reporter._depsTail;
  for (
    let dep = tail === null ? null : reporter._deps;
    dep;
    dep = dep === tail ? null : dep._nextDep
  ) {
    let current = dep._dep;
    while (current) {
      // Or through a memo pending on the flight (#3494): a stale reader
      // served a held memo's committed value never turned pending itself, so
      // its only trace of the flight is the memo between them — `copy` of
      // `details`. Judged dead, its transaction released `count=1` beside
      // the `Copy: 0` it displays. `_pendingSources` is transitive, so one
      // hop covers any depth.
      if (
        current === source ||
        current._firewall === source ||
        current._x?._pendingSources?.has(source)
      )
        return true;
      current = current._x?._parentSource;
    }
  }
  return !!(
    reporter._statusFlags & STATUS_PENDING &&
    reporter._x?._error instanceof NotReadyError &&
    reporter._x?._error.source === source
  );
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
 */
function sourceObserved(transition, source, verdict) {
  const reporters = transition._asyncReporters.get(source);
  let kept = false;
  for (const reporter of reporters ?? []) {
    if (reporterBlocksSource(reporter, source, verdict)) return true;
    // A zombie the verdict passes over is kept, not pruned (#3463): moot for
    // this verdict, it still holds a lane's reveal while the transaction
    // stays parked on something else.
    if (verdict && reporter._flags & REACTIVE_ZOMBIE) kept = true;
    else reporters.delete(reporter);
  }
  if (!kept) transition._asyncReporters.delete(source);
  return false;
}
function transitionComplete(transition) {
  if (transition._done) return true;
  if (transition._actions.length) {
    // A live action parks the transaction regardless of async state.
    if (attrHooks !== null) attrHooks.holdStart(transition);
    return false;
  }
  let done = true;
  for (const source of transition._asyncReporters.keys()) {
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
    if (sourceObserved(transition, source, transition) && source._x?._pendingSources?.size) {
      done = false;
      break;
    }
  }
  // Override blockage lives with the engine (absent hook = "no optimistic
  // blockage"); the hook's loops over _optimisticNodes/_optimisticStores are
  // no-ops when the transition holds neither, so no pre-check is needed.
  if (done && GlobalQueue._transitionBlocked?.(transition)) done = false;
  // Attribution hook: this verdict is the fork between settling (held writes
  // commit next — `_pendingNodes` still lists them) and parking (the flush
  // runs the lane effects, then stashes; `holdEnd` fires from stashQueues).
  // Fired here rather than at flush()'s call site because that site is inside
  // a `try` (see the rule in attribution-hooks.ts).
  if (attrHooks !== null)
    done ? attrHooks.transitionSettled(transition) : attrHooks.holdStart(transition);
  done && (transition._done = true);
  return done;
}
/** A fresh, unentered transaction (#3146): the optimistic store's truth
 * flight DECLARES an owned transaction instead of relying on whatever the
 * ambient adoption machinery stamped on its firewall. Activate it with
 * initTransition; it is a plain batch until then. */
function createTransition() {
  return createBatch();
}
function currentTransition(transition) {
  while (transition._done && typeof transition._done === "object") transition = transition._done;
  return transition;
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
 */
function waitingTransition(source) {
  for (const t of transitions) if (sourceObserved(t, source)) return t;
  return null;
}
/** A landing enters EVERY parked transaction still waiting on `source`, folding
 * them into the active one (A15: each reveal that discovered the flight
 * completes at its landing). The fold used to happen as the waiters' stamped
 * readers recomputed under the landing — recompute re-entering an effect's
 * stamp — which also folded in writes those readers merely shared a hole
 * with (#3407); effects no longer re-enter, so the landing folds explicitly.
 * Live iteration is safe: a merge deletes the outgoing (active) entry and
 * re-adds the visited one. */
function enterWaiting(source) {
  for (const t of transitions) if (sourceObserved(t, source)) globalQueue.initTransition(t);
}
function runInTransition(transition, fn) {
  const prevTransition = activeTransition;
  try {
    activeTransition = currentTransition(transition);
    return fn();
  } finally {
    activeTransition = prevTransition;
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
 * belonged to. */
function runAsTransitionBatch(transition, fn) {
  const prevTransition = activeTransition;
  const prevBatch = globalQueue._batch;
  try {
    activeTransition = currentTransition(transition);
    currentBatch = globalQueue._batch = activeTransition;
    return fn();
  } finally {
    activeTransition = prevTransition;
    currentBatch = globalQueue._batch = prevBatch;
  }
}

/** The queue a node belongs to, picked from its own zombie flag. */
function queueFor(n) {
  return n._flags & REACTIVE_ZOMBIE ? zombieQueue : dirtyQueue;
}
/**
 * Schedule one subscriber to re-run on the next flush: inserted into its own
 * (zombie-flag-routed) heap with the `_min` cursor pulled down. Tracked
 * effects ride the heap too — the heap visit is their (empty) compute phase,
 * which hands the callback to the user queue once the pass has committed
 * (see GlobalQueue._update, #3291).
 */
function enqueueSub(node) {
  const queue = queueFor(node);
  if (queue._min > node._height) queue._min = node._height;
  insertIntoHeap(node, queue);
}
function actualInsertIntoHeap(n, heap) {
  const parentHeight =
    (n._parent?._root ? n._parent._parentComputed?._height : n._parent?._height) ?? -1;
  if (parentHeight >= n._height) n._height = parentHeight + 1;
  const height = n._height;
  const heapAtHeight = heap._heap[height];
  if (heapAtHeight === undefined) heap._heap[height] = n;
  else {
    const tail = heapAtHeight._prevHeap;
    tail._nextHeap = n;
    n._prevHeap = tail;
    heapAtHeight._prevHeap = n;
  }
  if (height > heap._max) heap._max = height;
}
function insertIntoHeap(n, heap) {
  let flags = n._flags;
  // RECOMPUTING refusals are not always losses: a genuinely missed wake (a
  // write to a link this pass already validated) is latched link-side in
  // insertSubs as REACTIVE_MISSED_WAKE for recompute's tail (#3037).
  if (flags & (REACTIVE_IN_HEAP | REACTIVE_RECOMPUTING_DEPS | REACTIVE_MANUAL_WRITE)) return;
  if (flags & REACTIVE_CHECK) {
    n._flags = (flags & -4) | REACTIVE_DIRTY | REACTIVE_IN_HEAP;
  } else {
    n._flags = flags | REACTIVE_IN_HEAP;
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
    if (heap._marked) markNode(n);
  }
  if (!(flags & REACTIVE_IN_HEAP_HEIGHT)) actualInsertIntoHeap(n, heap);
}
function insertIntoHeapHeight(n, heap) {
  let flags = n._flags;
  if (
    flags &
    (REACTIVE_IN_HEAP | REACTIVE_RECOMPUTING_DEPS | REACTIVE_IN_HEAP_HEIGHT | REACTIVE_MANUAL_WRITE)
  )
    return;
  n._flags = flags | REACTIVE_IN_HEAP_HEIGHT;
  actualInsertIntoHeap(n, heap);
}
function deleteFromHeap(n, heap) {
  const flags = n._flags;
  if (!(flags & (REACTIVE_IN_HEAP | REACTIVE_IN_HEAP_HEIGHT))) return;
  n._flags = flags & -25;
  const height = n._height;
  if (n._prevHeap === n) heap._heap[height] = undefined;
  else {
    const next = n._nextHeap;
    const dhh = heap._heap[height];
    const end = next ?? dhh;
    if (n === dhh) heap._heap[height] = next;
    else n._prevHeap._nextHeap = next;
    end._prevHeap = n._prevHeap;
  }
  n._prevHeap = n;
  n._nextHeap = undefined;
}
function markHeap(heap) {
  if (heap._marked) return;
  heap._marked = true;
  for (let i = 0; i <= heap._max; i++) {
    for (let el = heap._heap[i]; el !== undefined; el = el._nextHeap) {
      if (el._flags & REACTIVE_IN_HEAP) markNode(el);
    }
  }
}
function markNode(el, newState = REACTIVE_DIRTY) {
  const flags = el._flags;
  if ((flags & (REACTIVE_CHECK | REACTIVE_DIRTY)) >= newState) return;
  el._flags = (flags & -4) | newState;
  for (let link = el._subs; link !== null; link = link._nextSub) {
    markNode(link._sub, REACTIVE_CHECK);
  }
  // Firewall children (projection machinery only): gate the cold-extension
  // deref on the config bit — markNode runs per sub edge per write, and an
  // unconditional _x chase here taxed every propagation (diamond -22%).
  if (el._config & CONFIG_FW_CHILDREN) {
    for (let child = el._x._child; child !== null; child = child._nextChild) {
      for (let link = child._subs; link !== null; link = link._nextSub) {
        markNode(link._sub, REACTIVE_CHECK);
      }
    }
  }
}
function runHeap(heap, recompute) {
  heap._marked = false;
  for (heap._min = 0; heap._min <= heap._max; heap._min++) {
    let el = heap._heap[heap._min];
    while (el !== undefined) {
      if (el._flags & REACTIVE_IN_HEAP) recompute(el);
      else adjustHeight(el, heap);
      el = heap._heap[heap._min];
    }
  }
  heap._max = 0;
}
function adjustHeight(el, heap) {
  deleteFromHeap(el, heap);
  let newHeight = el._height;
  for (let d = el._deps; d; d = d._nextDep) {
    const dep1 = d._dep;
    const dep = dep1._firewall || dep1;
    if (dep._fn && dep._height >= newHeight) newHeight = dep._height + 1;
  }
  if (el._height !== newHeight) {
    el._height = newHeight;
    for (let s = el._subs; s !== null; s = s._nextSub) {
      // Route each subscriber by its own zombie flag, mirroring the
      // post-recompute height-adjust path. Inserting into the running `heap`
      // unconditionally can park a zombie in `dirtyQueue` (or a live node in
      // `zombieQueue`), breaking the flag/queue invariant `deleteFromHeap`
      // relies on — the same corruption class as #2759.
      insertIntoHeapHeight(s._sub, queueFor(s._sub));
    }
  }
}

const PENDING_OWNER = {}; // Dummy owner to trigger store's read() path
function markDisposal(el) {
  let child = el._firstChild;
  while (child) {
    const flags = child._flags;
    child._flags = flags | REACTIVE_ZOMBIE;
    // migrate height-adjust entries too, not just recompute entries: every
    // `deleteFromHeap` call site picks the queue from the zombie flag, so a
    // node left physically linked in `dirtyQueue` after being zombified gets
    // unlinked from the wrong queue on dispose, corrupting the bucket and
    // livelocking the next `runHeap` that reaches it (#2759)
    if (flags & (REACTIVE_IN_HEAP | REACTIVE_IN_HEAP_HEIGHT)) {
      deleteFromHeap(child, flags & REACTIVE_ZOMBIE ? zombieQueue : dirtyQueue);
      if (flags & REACTIVE_IN_HEAP) insertIntoHeap(child, zombieQueue);
      else insertIntoHeapHeight(child, zombieQueue);
    }
    markDisposal(child);
    child = child._nextSibling;
  }
}
function dispose(node) {
  // Direct disposal is death, not dormancy: strip the observation lifecycle
  // so a later read freezes at the last committed value instead of
  // reawakening the node (#3024). The teardown itself (heap removal — a node
  // left queued would be recomputed and resurrected by the next flush (#2983)
  // — dep unlinking, child disposal) is exactly unobserved()'s body; only
  // this flag distinguishes death from dormancy.
  node._config &= ~CONFIG_AUTO_DISPOSE;
  unobserved(node);
}
function disposeChildren(node, self = false, zombie) {
  const flags = node._flags;
  if (flags & REACTIVE_DISPOSED) return;
  // A previous frame parked as zombies (#3404) dies with its owner (#3024):
  // the commit that would retire it returns on the DISPOSED flag set below,
  // so it drains here or its cleanups never run and the zombies stay
  // subscribed, to rerun in a torn-down tree (#3561). Death only (`self`):
  // a rerun's `disposeChildren(el)` leaves the frame rendering until commit.
  if (
    self &&
    !zombie &&
    node._x !== null &&
    (node._x._pendingFirstChild !== null || node._x._pendingDisposal !== null)
  )
    disposeChildren(node, false, true);
  if (self) {
    node._flags = flags | REACTIVE_DISPOSED;
    if (node._parent === null && node._root) unregisterRoot(node);
    // Companions are created detached and outlive their owner, but a verdict
    // must not: a disposed source can never settle, so an isPending companion
    // latched `true` here would hold a spinner forever (INV-9, the PR #2845
    // edge). Snap runs after the DISPOSED flag is set so the oracle reads
    // false, and notifies subscribers still watching the companion.
    const n = node;
    if (n._x?._pendingSignal || n._x?._latestValueComputed) GlobalQueue._snapCompanions(n);
    // A firewall's leaves have no lifecycle of their own, so a companion on
    // one of them outlives its source the same way (INV-9's rationale). The
    // firewall knows which leaves carry companions (CONFIG_CHILD_COMPANIONS,
    // #3038): snap them with it — the snap retires a shadow whose firewall is
    // disposed (spec O5).
    if (n._config & CONFIG_CHILD_COMPANIONS)
      n._x._companionChildren.forEach(GlobalQueue._snapCompanions);
    // A pending reader parked in a transaction may be the only thing holding
    // it (#3372): its death is a completion event the transaction must be
    // re-judged for, and nothing else re-enters a parked transaction.
    const t = n._transition;
    if (t && n._statusFlags & STATUS_PENDING && !wokenTransitions.includes(t))
      (wokenTransitions.push(t), schedule());
  }
  if (self && true) clearSignals(node);
  if (self && node._fn && node._x !== null) node._x._inFlight = null;
  let child = zombie ? (node._x?._pendingFirstChild ?? null) : node._firstChild;
  if (!zombie) node._firstChild = null;
  while (child) {
    const n = child;
    // Owner teardown is death regardless of the child's own lifecycle
    // (#3024): strip AUTO_DISPOSE so a post-disposal read freezes at the
    // last committed value instead of reawakening in a torn-down tree.
    // Runs before the recursion so already-dormant children (whose
    // disposeChildren call early-returns on REACTIVE_DISPOSED) die too.
    // Only unobserved()'s own node keeps its dormancy — it is never in
    // this loop; its children are rebuilt fresh on reawaken.
    n._config &= ~CONFIG_AUTO_DISPOSE;
    // Heap removal must not be gated on `_deps`: a dependency-free
    // computation queued by refresh() has a null dep list but still sits in
    // the dirty heap, and left there the post-disposal flush recomputes it —
    // recompute() rewriting `_flags` clears REACTIVE_DISPOSED and the node
    // comes back to life (post-unmount runs, leaked cleanups, #2983).
    // deleteFromHeap self-guards on the in-heap flags (and tolerates plain
    // Owners, whose _flags is undefined), so no gate here.
    deleteFromHeap(n, queueFor(n));
    clearDeps(n);
    // The chain is detached above so a node a cleanup links mid-drain lands
    // on the fresh head and survives. Pointing each drained child's prev at
    // itself routes its later splice onto the detached chain, never the head,
    // and keeps the dev owner-chain-head invariant honest for those children.
    child._prevSibling = child;
    disposeChildren(child, true);
    // Read after, not before: a sibling this disposal made dormant spliced
    // itself out of the detached chain, and a cleanup may then have linked
    // it at the fresh head, which rewrote the `_nextSibling` a pre-read
    // would still be holding.
    child = child._nextSibling;
  }
  if (zombie) {
    if (node._x !== null) node._x._pendingFirstChild = null;
  } else node._childCount = 0;
  // O(1) splice out of parent's chain on individual dispose. Skipped during
  // batch dispose (parent already disposed) and zombie disposal (node sits on
  // parent's _pendingFirstChild). We leave node._nextSibling intact so outer
  // walks that already advanced past us still reach later siblings.
  if (
    self &&
    !zombie &&
    !(flags & REACTIVE_ZOMBIE) &&
    node._parent !== null &&
    !(node._parent._flags & REACTIVE_DISPOSED)
  ) {
    const prev = node._prevSibling;
    const next = node._nextSibling;
    // A node with no predecessor must be the chain's head. The only way it
    // is not: it was flagged live but sits elsewhere (#3543 — a zombie that
    // lost REACTIVE_ZOMBIE), and the write below would clobber the head with
    // a stale `_nextSibling`, orphaning every live child ahead of it.
    assertInvariant(
      prev !== null || node._parent._firstChild === node,
      "owner-chain-head",
      "head node is not parent._firstChild — a node was spliced while flagged live but not in the chain (see #3543)"
    );
    if (prev !== null) prev._nextSibling = next;
    else node._parent._firstChild = next;
    if (next !== null) next._prevSibling = prev;
    node._prevSibling = null;
  }
  runDisposal(node, zombie);
  // Final effect-returned cleanup fires at true disposal, after `_disposal`
  // to mirror rerun ordering (compute-phase teardown first, cleanup last).
  if (self && node._cleanup) {
    const effectCleanup = node._cleanup;
    node._cleanup = undefined;
    enterDisposal();
    effectCleanup();
    exitDisposal();
  }
}
function linkChild(parent, node) {
  const head = parent._firstChild;
  node._prevSibling = null;
  node._nextSibling = head;
  if (head !== null) head._prevSibling = node;
  parent._firstChild = node;
}
function runDisposal(node, zombie) {
  // Detach the list BEFORE running it (#3601), as `_cleanup` is (#2813). A
  // cleanup that disposes an ancestor re-enters this node through the death
  // walk while the loop is still running; with the list still attached, that
  // walk ran every entry a second time. Detached, the re-entrant drain finds
  // nothing. The same shape latched a throwing cleanup: the list survived the
  // throw and every later drain re-ran and re-threw it.
  const disposal = zombie ? node._x?._pendingDisposal : node._disposal;
  if (!disposal) return;
  if (zombie) node._x._pendingDisposal = null;
  else node._disposal = null;
  // No try/finally: it would survive into prod (rollup keeps the frame). A
  // throw leaves the depth raised; dev.ts clears the stale count on the next
  // microtask, since teardown never spans one (core.ts).
  enterDisposal();
  if (Array.isArray(disposal)) {
    // Unwind order (#3572, restores 1.x #1562): later registrations run
    // before earlier ones. Children have already been disposed by the caller,
    // so with LIFO a body that registers cleanup before creating its children
    // tears down after them — the same order a per-component owner gives.
    for (let i = disposal.length - 1; i >= 0; i--) {
      const callable = disposal[i];
      callable.call(callable);
    }
  } else {
    disposal.call(disposal);
  }
  exitDisposal();
}
function childId(owner, consume) {
  let counter = owner;
  while (counter._config & CONFIG_TRANSPARENT && counter._parent) counter = counter._parent;
  if (counter.id != null)
    return formatId(counter.id, consume ? counter._childCount++ : counter._childCount);
  throw new Error("Cannot get child id from owner without an id");
}
/**
 * Allocates and returns the next stable child id for `owner`. Used by
 * hydration plumbing and `createUniqueId`. Not part of the user-facing API.
 *
 * @internal
 */
function getNextChildId(owner) {
  return childId(owner, true);
}
/**
 * The id a freshly-created node inherits: an explicit `options.id` wins;
 * transparent nodes share their parent's id; otherwise the parent's next
 * child id is consumed (or `undefined` outside an id-carrying tree).
 */
function inheritId(options, transparent, parent) {
  return (
    options?.id ??
    (transparent ? parent?.id : parent?.id != null ? getNextChildId(parent) : undefined)
  );
}
/**
 * Returns the *next* child id for `owner` without consuming it. Used by
 * hydration plumbing to peek at the id a future child will receive.
 *
 * @internal
 */
function peekNextChildId(owner) {
  return childId(owner, false);
}
function formatId(prefix, id) {
  const num = id.toString(36),
    len = num.length - 1;
  return prefix + (len ? String.fromCharCode(64 + len) : "") + num;
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
 */
function getObserver() {
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
 */
function getOwner() {
  return context;
}
/**
 * Low-level: registers `fn` as a disposal callback on the current owner.
 * Most code should use `onCleanup()` from `solid-js`, which adds dev-mode
 * checks. `cleanup()` is the unchecked primitive used by internals.
 */
function cleanup(fn) {
  if (!context) return fn;
  if (!context._disposal) context._disposal = fn;
  else if (Array.isArray(context._disposal)) context._disposal.push(fn);
  else context._disposal = [context._disposal, fn];
  return fn;
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
 */
function isDisposed(node) {
  return !!(node._flags & (REACTIVE_DISPOSED | REACTIVE_ZOMBIE));
}
function disposeRootSelf(self = true) {
  disposeChildren(this, self);
}
/**
 * Creates a fresh owner attached as a child of the current owner (or as a
 * detached root if there is none). Used by framework internals to group
 * cleanups; app code should use `createRoot()` (host a reactive scope outside
 * a component) or `runWithOwner()` (re-enter a captured owner).
 *
 * @internal
 */
function createOwner(options) {
  const parent = context;
  const transparent = options?.transparent ?? false;
  // Prod and observe boilerplates (see core.ts computed()). The observe
  // literal carries the `_name` slot the rendering layer fills with the
  // component label (`owner._name = "<App>"`) — a slot, so labelling a root
  // is a plain store rather than a shape fork between labelled and plain roots.
  const owner = {
    id: inheritId(options, transparent, parent),
    _config: transparent ? CONFIG_TRANSPARENT : 0,
    _root: true,
    _parentComputed: parent?._root ? parent._parentComputed : parent,
    _firstChild: null,
    _nextSibling: null,
    _prevSibling: null,
    _disposal: null,
    _queue: parent?._queue ?? globalQueue,
    _context: parent?._context || defaultContext,
    _childCount: 0,
    _x: null,
    _parent: parent,
    dispose: disposeRootSelf,
    _name: undefined
  };
  if (parent && parent._config & CONFIG_CHILDREN_FORBIDDEN) {
    emitDiagnostic({
      code: "PRIMITIVE_IN_FORBIDDEN_SCOPE",
      kind: "lifecycle",
      severity: "error",
      message: PRIMITIVE_IN_FORBIDDEN_SCOPE_MESSAGE,
      ownerId: parent.id,
      ownerName: parent._name
    });
    throw new Error(PRIMITIVE_IN_FORBIDDEN_SCOPE_MESSAGE);
  }
  if (parent) linkChild(parent, owner);
  else registerRoot(owner);
  DEV.hooks.onOwner?.(owner);
  return owner;
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
 */
function createRoot(init, options) {
  const owner = createOwner(options);
  return runWithOwner(owner, () => init(() => owner.dispose()));
}

// https://github.com/stackblitz/alien-signals/blob/v2.0.3/src/system.ts#L100
function unlinkSubs(link) {
  const dep = link._dep;
  const nextDep = link._nextDep;
  const nextSub = link._nextSub;
  const prevSub = link._prevSub;
  if (nextSub !== null) nextSub._prevSub = prevSub;
  else dep._subsTail = prevSub;
  if (prevSub !== null) prevSub._nextSub = nextSub;
  else {
    dep._subs = nextSub;
    if (nextSub === null) {
      // Slot nodes (store leaves) dispatch to the ONE shared hook — no
      // per-node unobserved closure, no NodeExtension to hold it.
      if (dep._config & CONFIG_SLOT_NODE) slotUnobservedHook(dep);
      else dep._x?._unobserved?.();
      // No more subscribers; only tear down if CONFIG_AUTO_DISPOSE is set.
      // A pending node is exempt: its in-flight async work (or the
      // transition holding it) is an observer — tearing down would orphan
      // the work and re-execute it on the next read. The settle path runs
      // this same last-one-out check when that observer releases (the
      // untracked-read dormancy sweep guards on pending identically).
      const c = dep;
      c._fn &&
        c._config & CONFIG_AUTO_DISPOSE &&
        !(c._flags & REACTIVE_ZOMBIE) &&
        !(c._statusFlags & STATUS_PENDING) &&
        unobserved(c);
    }
  }
  return nextDep;
}
function trimStaleDeps(el) {
  const depsTail = el._depsTail;
  let toRemove = depsTail !== null ? depsTail._nextDep : el._deps;
  if (toRemove !== null) {
    do {
      toRemove = unlinkSubs(toRemove);
    } while (toRemove !== null);
    if (depsTail !== null) depsTail._nextDep = null;
    else el._deps = null;
  }
}
// Shared by unobserved() and the disposeChildren child loop. The truthy guard
// (not `!== null`) matters: plain Owners in a child chain have no _deps field,
// and skipping early also avoids adding one (hidden-class churn) via the
// null-out below.
function clearDeps(el) {
  let dep = el._deps;
  if (!dep) return;
  do {
    dep = unlinkSubs(dep);
  } while (dep !== null);
  el._deps = null;
  el._depsTail = null;
}
function unobserved(el) {
  deleteFromHeap(el, queueFor(el));
  clearDeps(el);
  disposeChildren(el, true);
}
/**
 * Deferred dormancy for never-observed auto-dispose computeds (#3078).
 *
 * An untracked top-level read of a subscriber-less observation-lifecycle memo
 * used to call unobserved() inline at the end of read(). That kept the leak
 * closed (the compute links the memo into its deps' sub lists — without a
 * teardown point a never-observed memo is retained by its sources forever;
 * upstream alien-signals has exactly this retention), but it made reads
 * destructive: each read disposed the node, the next read revived it with a
 * full recompute in whatever ambient transition/lane context happened to be
 * current, so consecutive reads could return different answers with no write
 * in between.
 *
 * Instead, reads queue the node here and the scheduler sweeps at the top of
 * the next flush (before runHeap, so a same-tick dirtying is reclaimed
 * instead of recomputed). Reads become idempotent within a tick (the node
 * stays alive and serves its cache, uniform with observed memos) while
 * reclamation still happens within one microtask — the enqueue site arms
 * schedule(), so a flush is guaranteed even when no other work is queued.
 */
const dormantNodes = new Set();
function sweepDormant() {
  if (dormantNodes.size === 0) return;
  for (const el of dormantNodes) {
    // Re-validate at sweep time: the node may have gained a subscriber (its
    // lifecycle is the unlinkSubs cascade now), gone pending (in-flight async
    // is an observer; the settle path re-runs last-one-out), lost its
    // AUTO_DISPOSE bit (owner teardown strips it, #3024), or already been
    // torn down.
    if (
      !el._subs &&
      el._config & CONFIG_AUTO_DISPOSE &&
      !(el._statusFlags & STATUS_PENDING) &&
      !(el._flags & (REACTIVE_DISPOSED | REACTIVE_ZOMBIE))
    ) {
      unobserved(el);
    }
  }
  dormantNodes.clear();
}
// https://github.com/stackblitz/alien-signals/blob/v2.0.3/src/system.ts#L52
function link(dep, sub, pendingObserver = false) {
  // Repeat touches within one pass AND-combine `_pendingObserver`: a probe
  // read (`isPending(() => x())`) beside a value read of the same dep must
  // not relabel the value dependency as probe-only — the value read is what
  // real-error propagation and affects() coverage key off, regardless of
  // read order within the computation.
  const prevDep = sub._depsTail;
  if (prevDep !== null && prevDep._dep === dep) {
    prevDep._pendingObserver &&= pendingObserver;
    return;
  }
  let nextDep = null;
  const isRecomputing = sub._flags & REACTIVE_RECOMPUTING_DEPS;
  if (isRecomputing) {
    nextDep = prevDep !== null ? prevDep._nextDep : sub._deps;
    if (nextDep !== null && nextDep._dep === dep) {
      nextDep._gen = sub._depGen;
      sub._depsTail = nextDep;
      // First touch of this pass: the previous pass's label is stale.
      nextDep._pendingObserver = pendingObserver;
      return;
    }
  }
  // A link stamped with the current pass generation was created or reused
  // in-order during this recompute, i.e. it already sits in the validated
  // [deps.._depsTail] prefix — the O(1) equivalent of scanning the dep list
  // (the old alien-signals `isValidLink` walk, O(n²) when a computation
  // re-reads earlier deps non-consecutively, e.g. store leaf reads).
  const prevSub = dep._subsTail;
  if (
    prevSub !== null &&
    prevSub._sub === sub &&
    (!isRecomputing || prevSub._gen === sub._depGen)
  ) {
    // Gen-matched during a recompute = repeat touch this pass (AND); outside
    // a recompute there is no pass boundary, so the latest read labels it.
    if (isRecomputing) prevSub._pendingObserver &&= pendingObserver;
    else prevSub._pendingObserver = pendingObserver;
    return;
  }
  const newLink =
    (sub._depsTail =
    dep._subsTail =
      {
        _dep: dep,
        _sub: sub,
        _nextDep: nextDep,
        _prevSub: prevSub,
        _nextSub: null,
        _gen: sub._depGen,
        _pendingObserver: pendingObserver
      });
  if (prevDep !== null) prevDep._nextDep = newLink;
  else sub._deps = newLink;
  if (prevSub !== null) prevSub._nextSub = newLink;
  else dep._subs = newLink;
  // New subscriber edge: staged-rewrite skips (§12d) must not miss it.
  bumpNotifyEpoch();
}

// The lazily-created Set is the ONE container for pending sources. Its
// predecessor — a singular slot promoted to a Set on the second source —
// created dual state whose migration invariant was easy to break: a third
// overlapping source landed beside the Set and removePendingSource refused
// to clear it, stranding the Set members' pending forever (#2893).
function addPendingSource(el, source) {
  if (el._x?._pendingSources?.has(source)) return false;
  (ext(el)._pendingSources ??= new Set()).add(source);
  return true;
}
function removePendingSource(el, source) {
  const sources = el._x?._pendingSources;
  if (!sources?.delete(source)) return false;
  if (!sources.size) el._x._pendingSources = undefined;
  return true;
}
function clearPendingSources(el) {
  // This set is node-owned and never shared; dropping the sole reference
  // releases the set and every entry without a redundant clear() walk.
  if (el._x !== null) el._x._pendingSources = undefined;
}
// A rejection-pending only resolves through the settle sweep over the
// SOURCE's subscribers, so it is retryable iff a tracked read created that
// edge: a dep that IS the source, or one whose own pending chain carries it
// (pending sources propagate the origin node, so this covers any depth).
// Also guards branch-local recovery: another dependency may still need the source.
function retryReaches(el, source) {
  for (let d = el._deps; d; d = d._nextDep) {
    const dep = d._dep._firewall || d._dep;
    if (dep === source || dep._x?._pendingSources?.has(source)) return true;
  }
  return false;
}
/**
 * A loading-window node hit an unready source (sync throw in recompute, or a
 * NotReadyError-rejected flight): register for the source's settle — the
 * settlePendingSource walk runs off `_pendingSources` + `_blocked` alone —
 * with NO read-visible pending status, no downstream propagation, no
 * transition, no lane registration. Commit #0 keeps serving.
 */
function parkLoadingWindow(el, e) {
  ext(el)._blocked = true;
  if (e.source) addPendingSource(el, e.source);
  // A settled error is the node's answer ("the error stays the answer until
  // this retry can actually run") — the park must not replace it: reads
  // throw `_error` while STATUS_ERROR is set, and overwriting it here leaks
  // a pending-class NotReadyError from a read-invisible park (#2989).
  if (!(el._statusFlags & STATUS_ERROR)) setPendingError(el, e.source, e);
}
function setPendingError(el, source, error) {
  if (!source) {
    if (el._x !== null) el._x._error = null;
    return;
  }
  if (error instanceof NotReadyError && error.source === source) {
    ext(el)._error = error;
    return;
  }
  const current = el._x?._error;
  if (!(current instanceof NotReadyError) || current.source !== source) {
    ext(el)._error = new NotReadyError(source);
  }
}
function forEachDependent(el, fn) {
  for (let s = el._subs; s !== null; s = s._nextSub) fn(s._sub, s);
  // `?? null`: affects() marks route plain signals (no `_child` slot) through here.
  for (let child = el._x?._child ?? null; child !== null; child = child._nextChild) {
    for (let s = child._subs; s !== null; s = s._nextSub) fn(s._sub, s);
  }
}
// Queue a node to re-run on the next flush (used both when a pending source
// settles and when an `isPending` observer must re-evaluate after a real error):
// shared scheduling helper in heap.ts (tracked effects bypass the heap).
// Settle-time counterpart of unlinkSubs' last-one-out check. A lazy node that
// loses its last subscriber while STATUS_PENDING is exempt from autodispose
// (the in-flight work is an observer), so whatever CLEARS that pending state
// must run the release — otherwise the node stays linked and recomputes
// forever with zero subscribers (#2934). The node's own promise/iterator
// callbacks handle their own release (settleAutodispose in handleAsync); this
// covers derivatively-pending dependents, which have no callbacks of their own.
function releaseIfSettledUnobserved(node) {
  node._fn &&
    node._config & CONFIG_AUTO_DISPOSE &&
    !node._subs &&
    !(node._flags & REACTIVE_ZOMBIE) &&
    !(node._statusFlags & STATUS_PENDING) &&
    unobserved(node);
}
// Error-path sweep: notifyStatus(STATUS_ERROR) clears dependents' pending
// sources through its own recursion (no per-node settle callback), so after
// the propagation completes, walk the same graph for stranded lazy nodes.
// Collect-then-release so unobserved() never unlinks under the walk.
function releaseSettledDependents(el) {
  let candidates;
  const visited = new Set();
  const visit = node => {
    if (visited.has(node)) return;
    visited.add(node);
    if (!node._subs && node._config & CONFIG_AUTO_DISPOSE) (candidates ??= []).push(node);
    forEachDependent(node, visit);
  };
  forEachDependent(el, visit);
  if (candidates) for (const node of candidates) releaseIfSettledUnobserved(node);
}
// Error-dimension twin of settlePendingSource's blocked re-enqueue (#2949):
// a node in STATUS_ERROR that recovers by recomputing to an UNCHANGED value
// fires no value notification — the recovery is completely silent. But a
// dependent that re-ran during the error window consumed its dirty flag and
// committed nothing (the fresh sibling values it read were absorbed into an
// errored run), so its committed value is stale. The propagated error is one
// object identity down the whole dependent tree, and holding it is exactly
// the "blocked on this error" marker — re-enqueue those holders so they
// re-run: fresh values commit and flow, and a dependent with another
// still-broken source simply re-errors. Pending recovery uses
// settlePendingSource to clear inherited status and retry blocked readers.
// Walks the full dependent graph
// (releaseSettledDependents shape): identity holders can sit below an
// intermediate whose own error state has since been scrubbed or replaced
// (e.g. an error boundary's tree node).
function settleErroredDependents(el, error) {
  let scheduled = false;
  const visited = new Set();
  const visit = node => {
    if (visited.has(node)) return;
    visited.add(node);
    if (node._x?._error === error) {
      enqueueSub(node);
      scheduled = true;
    }
    forEachDependent(node, visit);
  };
  forEachDependent(el, visit);
  if (scheduled) schedule();
}
// Retire `source` from pending state along the dependent graph rooted at `el`.
// By default, `el` is the source whose flight settled or was superseded.
// With a distinct `source`, `el` is a recovered computation that dropped it:
// the source may still be pending, so dependents with another path to it stay pending.
function settlePendingSource(el, source = el) {
  // Invariant: walking a settle implies truth exists. A caller reaching this
  // with an uninitialized traversal root (`el`) is announcing a settle that has not
  // happened — parked readers would wake into a value that was never
  // produced (the rc.5 regression: the recompute-side walk fired on a
  // projection driver whose first flight was superseded before any commit
  // reached the observable store). "Uninitialized" alone is not the tell,
  // though: a first landing whose commit is transition-held (streamed
  // hydration rides this) parks its value in `_pendingValue` with the flag
  // still set, and a comparator throw on that landing leaves the node
  // uninitialized but errored — both have real truth to reveal. So does a
  // first landing UNDER an optimistic lane (#3648): asyncWrite's lane branch
  // publishes it as a derived override (`laneOverride`, A17 lanes stage),
  // `_value` stays the never-committed frame and the flag stays set until
  // the lane's transaction commits and promotes the override
  // (resolveOptimisticNodes) — the override IS the node's truth meanwhile,
  // displayed to the lane's readers, and the walk releases dependents into
  // it. Only an uninitialized node with neither a held value, nor an error,
  // nor a displayed derived override is a settle that never happened.
  // Silent in production; loud in dev so a future call site that violates
  // the contract fails in its author's test run instead of wedging a
  // downstream app.
  {
    const sources = el._x?._pendingSources;
    if (
      el._statusFlags & STATUS_UNINITIALIZED &&
      el._pendingValue === NOT_PENDING &&
      !el._x?._error &&
      !(el._config & CONFIG_DERIVED_OVERRIDE && hasActiveOverride(el)) &&
      // A replacement source makes this a cleanup-only transfer: removing
      // self leaves the source and every propagated dependent parked. No
      // sources (or self alone) would release readers without truth.
      !(sources?.size && (sources.size > 1 || !sources.has(el)))
    ) {
      // Reported, not thrown: the walk runs from promise machinery with no
      // caller to surface to, so the message must reach the console here —
      // emitDiagnostic alone leaves only the repair-guide footer (#3648).
      reportDiagnostic(
        emitDiagnostic(
          {
            code: "SETTLE_WALK_UNINITIALIZED_SOURCE",
            kind: "lifecycle",
            severity: "error",
            message:
              "[SETTLE_WALK_UNINITIALIZED_SOURCE] settlePendingSource was called on a source that " +
              "never produced a value. Settling parked readers requires truth to reveal — an " +
              "uninitialized source waking its dependents serves them its initial face instead of " +
              "settled data.",
            ownerId: el.id,
            ownerName: el._name
          },
          el
        )
      );
    }
  }
  // Landing and branch recovery already cleared el's own set. Superseded
  // re-parks can retain an abandoned self entry (source === el), which must
  // retire in the same walk as its propagated copies.
  removePendingSource(el, source);
  let scheduled = false;
  let released;
  const visited = new Set();
  // Companion updates no-op without the verdict layer (null hook).
  const updateCompanions = GlobalQueue._updatePendingSignal;
  const settle = node => {
    if (visited.has(node)) return;
    // A conditional dropped this source, but another dependency can still
    // carry it. Only retire pending state inherited through the recovered
    // branch. Deliberately NOT marked visited on this early return: the
    // carrying dependency may itself be a later branch of this same walk
    // (two unchanged memos converging), and its visit must be free to
    // re-examine this node once that branch has retired the source.
    if (source !== el && retryReaches(node, source)) return;
    if (!removePendingSource(node, source)) return;
    visited.add(node);
    node._time = clock;
    const remaining = node._x?._pendingSources?.values().next().value;
    // STATUS_ERROR + pending sources only coexist via an errored loading
    // window's park (notifyStatus(STATUS_ERROR) clears pending sources
    // otherwise): the settled error stays the answer through the settle —
    // nulling it here would have reads throw `null` until the re-enqueued
    // retry lands, or lose it entirely if that retry parks again (#2989).
    const errored = node._statusFlags & STATUS_ERROR;
    if (remaining) {
      if (!errored) setPendingError(node, remaining);
      updateCompanions?.(node);
    } else {
      node._statusFlags &= ~STATUS_PENDING;
      if (!errored) setPendingError(node);
      updateCompanions?.(node);
      if (node._x?._blocked) {
        enqueueSub(node);
        scheduled = true;
      }
      if (node._x !== null) node._x._blocked = false;
      // Fully settled with nobody watching: release candidate (#2934). Checked
      // again at release time — deferred so unobserved() can't unlink subs
      // lists this walk is still iterating.
      if (!node._subs && node._config & CONFIG_AUTO_DISPOSE) (released ??= []).push(node);
    }
    forEachDependent(node, settle);
  };
  forEachDependent(el, settle);
  // Release before the flush schedule below: unobserved() pulls the node back
  // out of the heap, so the enqueueSub above never recomputes a released node.
  if (released) for (const node of released) releaseIfSettledUnobserved(node);
  if (scheduled) schedule();
}
// Object-thenable detection (Promises/A+ shape).
function isThenable(value) {
  return value != null && typeof value === "object" && typeof value.then === "function";
}
/** Fire and clear a node's iterator-flight cancellation hook (#3122). */
function releaseFlightTeardown(el) {
  const teardown = el._x?._flightTeardown;
  if (teardown != null) {
    el._x._flightTeardown = null;
    teardown();
  }
}
function handleAsync(el, result, setter) {
  let iterator = false;
  let thenable = false;
  if (typeof result === "object" && result !== null) {
    untrack(() => {
      iterator = result[Symbol.asyncIterator];
      thenable = !iterator && isThenable(result);
    });
  }
  if (!thenable && !iterator) {
    if (el._x !== null) el._x._inFlight = null;
    // A sync landing is the first real answer for a loadingValue node.
    el._loading = false;
    return result;
  }
  // Dev-only contract enforcement for `sync: true` nodes. In production these
  // never reach `handleAsync` (the recompute fast path skips the call), but in
  // dev they do — we run the full async-shape probe and diagnose if a Promise
  // / AsyncIterable comes through. The fast-path semantics in production would
  // silently store the unawaited value, which is what the user opted out of by
  // passing `sync: true`; the diagnostic surfaces that mistake immediately.
  if (el._config & CONFIG_SYNC) {
    const message =
      `[SYNC_NODE_RECEIVED_ASYNC] A computed/effect created with \`sync: true\` returned ` +
      `${thenable ? "a Promise" : "an AsyncIterable"}. The value would be stored as-is and ` +
      `never awaited in production; remove \`sync: true\` to use async-aware behavior, or ` +
      `unwrap the value before returning.`;
    emitDiagnostic({
      code: "SYNC_NODE_RECEIVED_ASYNC",
      kind: "lifecycle",
      severity: "error",
      message,
      ownerId: el.id,
      ownerName: el._name
    });
    throw new Error(message);
  }
  // Flight replacement relies on recompute's supersede release for iterator
  // teardown (#3122): every handleAsync call — including the projection
  // self-registration — runs during a recompute of `el`, which has already
  // fired _flightTeardown. A future non-recompute registration path must
  // release it here before overwriting _inFlight.
  ext(el)._inFlight = result;
  // The run that asked this flight read every input without throwing: an
  // input still in flight was masked for it (an active override, A17), so
  // pending state those inputs propagated onto the node earlier does not
  // describe this answer. Drop it — the flight is the node's pending now.
  // The landing retires only the flight's own entry (landStatus, #3373), so
  // an entry that survived here would hold the node past its own answer.
  el._x._pendingSources = undefined;
  // Provenance of the question this flight asks (#3331): the action whose
  // window is registering it, or the flight whose landing is. Its landings
  // propagate under it (asyncWrite) so an override downstream can tell a
  // stale answer from its own.
  const flightOrigin = origin;
  // Attribution hook: a new flight is registered. Fired here (not in the
  // branches below) so every flight shape — plain thenable, iterator, the
  // flattened combinations — is announced exactly once, while the recompute
  // frame that caused it is still on the engine's stack. Not inside a try
  // (#2883 — see attribution-hooks.ts).
  if (attrHooks !== null) attrHooks.flightStart(el, result);
  let syncValue;
  // Settle-time transition re-entry. The loading rail is invisible to
  // transactions (#2933): a boundary-caught first load never registers as an
  // async reporter, so its settle — the boundary's fallback -> content
  // reveal — must flow ambiently. The node can still carry a `_transition`
  // stamp (pending-node bookkeeping rides through the stamping sites), and
  // blindly re-entering that stamped, still-incomplete transaction stashed
  // the reveal with it — a deadlock when the transaction's completion
  // depended on the reveal (#2937). An ESCAPED first load did register and
  // keeps transition scheduling; initialized (value-holding) pending settles
  // are the transaction's reveal machinery and always re-enter.
  const settleTransition = () => {
    let transition = resolveTransition(el);
    // A lane-routed node's landing is revealed by its lane, ahead of the
    // transaction that owns the lane (whose own commit is only the override's
    // confirm/revert). Entering that owner here would fold every transaction
    // waiting on this flight into it at the landing — a reveal that
    // discovered the flight (#3305) would then wait on the owner's action
    // instead of on the flight (#3334). Enter the waiter: the transaction
    // whose blocker this landing clears. Then every transaction waiting on
    // the flight folds in (enterWaiting): a reveal that discovered it
    // completes at its landing (A15) — a stampless node's fresh batch
    // included (its flight started under a batch that committed beneath it,
    // #3305). The fold used to happen as each stamped reader recomputed,
    // which effects no longer do (#3407).
    if (el._x?._optimisticLane) transition = waitingTransition(el) ?? transition;
    if (
      transition &&
      el._statusFlags & STATUS_UNINITIALIZED &&
      !currentTransition(transition)._asyncReporters.has(el)
    ) {
      // Drop the stale stamp too: the plain settle write (setSignal) and the
      // stash-path restamp both re-enter the transaction through it.
      el._transition = null;
      return;
    }
    globalQueue.initTransition(transition);
    enterWaiting(el);
  };
  const handleError = error => {
    if (el._x?._inFlight !== result) return;
    // NotReadyError from rejected promises should be treated as pending, not error
    let stillPending = error instanceof NotReadyError;
    // Dev-only authorship diagnostic (#2987): no edge means a post-`await`
    // FIRST read — untracked, so the source's settle sweep can never find
    // this node and "pending" wedges it (and its boundary) forever while
    // isPending reads false. Fail loud in dev; prod pays no bytes for the
    // forbidden pattern (the wedge stands there, caught during development).
    // Runs BEFORE the loading-window parking below: a non-retryable read is
    // a real error, and the window must not silently park a wedge that can
    // never settle.
    if (stillPending && !retryReaches(el, error.source)) {
      stillPending = false;
      error = new Error(
        "Read of an unresolved async source after an `await`. Reads inside async " +
          "computations only register as dependencies before the first `await`; a source " +
          "first read after it cannot retry when it settles. Read it before the first " +
          "`await` (or restructure so the value is an input)."
      );
    }
    if (stillPending && el._loading) {
      // Loading window: the flight died waiting on an unready source. Keep
      // serving commit #0 — same parking as recompute's catch for sync
      // dependency throws. The dead flight is released so the clock-gated
      // error-retry pull (updateIfNecessary) can also re-ask.
      if (el._x !== null) el._x._inFlight = null;
      parkLoadingWindow(el, error);
      el._time = clock;
      return;
    }
    settleTransition();
    notifyStatus(el, stillPending ? STATUS_PENDING : STATUS_ERROR, error);
    // A NotReady rejection is a landing into another pending source. The
    // rejected flight will never settle its self entry, so transfer ownership
    // after notifyStatus has propagated the replacement source.
    if (stillPending) settlePendingSource(el);
    el._time = clock;
    // A real error settles derivatively-pending dependents (notifyStatus
    // cleared their pending sources), so stranded lazy ones release here —
    // the error twin of settlePendingSource's release (#2934).
    if (!stillPending) releaseSettledDependents(el);
  };
  const asyncWrite = (value, then) => {
    if (el._x?._inFlight !== result) return;
    // If the node was dirtied by a newer write (optimistic override or regular),
    // skip this stale async result — the upcoming flush will recompute the node
    // with the new value, creating a fresh Promise that supersedes this one.
    if (el._flags & (REACTIVE_DIRTY | REACTIVE_OPTIMISTIC_DIRTY)) return;
    // The landing propagates under the flight's provenance (#3331) — through
    // the flush below, which clears it.
    setOrigin(flightOrigin);
    settleTransition();
    const wasUninitialized = !!(el._statusFlags & STATUS_UNINITIALIZED);
    // Captured before clearStatus wipes it: a quiet re-ask's landing may be
    // transition-held below, and the displayed value keeps answering the same
    // question until the hold commits — the classification must survive to
    // that reveal or companion synchronization briefly classifies the held
    // old value as pending, a one-frame pulse to direct observers (#3178).
    // A truthy capture implies `_x` exists, so the restore writes it directly.
    const wasReask = el._x?._reask;
    landStatus(el);
    if (wasReask) el._x._reask = true;
    const lane = resolveLane(el);
    if (lane) lane._pendingAsync.delete(el);
    // Attribution hook: lets the engine snapshot state before the landing
    // branches, so it can tell whether the plain path's setSignal committed a
    // change (and only then classify it as an async landing).
    if (attrHooks !== null) attrHooks.asyncStart(el);
    if (setter) {
      try {
        setter(value);
      } catch (error) {
        handleError(error);
        return;
      }
      if (wasUninitialized) landStatus(el, true);
    } else if (
      el._x?._overrideValue !== undefined &&
      !(lane && el._config & CONFIG_DERIVED_OVERRIDE)
    ) {
      // A derived override's landing UNDER its lane is the lane's own work
      // (the branch below); demoted — its source superseded (A18) — the
      // landing is the truth the correction asked for, and holds and
      // supersedes here like the sync twin (recompute). Otherwise:
      // Optimistic node — resting OR covered by an active override — holds
      // through the shared pending-node path, exactly like a plain async memo,
      // so the commit clears STATUS_UNINITIALIZED (#2806) and elevation to
      // _value happens on this value's OWN transition schedule (A18 as
      // re-ruled 2026-07-07: _value only changes at commit points). With an
      // override active the hold and its eventual commit are unobservable
      // (A17 — every reader sees the override); the revert reveals whatever
      // has committed by then, so corrections reveal atomically with their
      // transition rather than escaping it.
      if (el._pendingValue === NOT_PENDING) queuePendingNode(el);
      el._pendingValue = value;
      // The hold is a companion-visible write like any other (A13/A19): the
      // clearStatus() above computed its verdict before the hold existed, so
      // isPending must re-derive (the value is not final until commit — V1)
      // and latest() must see the fresh in-flight value (V2). Subscribers are
      // only notified when the hold is visible to them: under an active
      // override every reader sees the override (A17), so waking subs would
      // re-show an unchanged view — the revert is the notification point.
      // Under an override the landing is handed to the engine's
      // supersedeOverride (A18 supersession, #3331): own-source truth that
      // differs from the override ends the optimism for the graph now (plain
      // channel, lane demoted); a matching arrival is silent except to an
      // authoritative-view reader (until()'s predicate) waiting on exactly
      // this staged truth (#3164 — without the wake the hold deadlocks: the
      // landing waits on the transaction, the transaction on the action, the
      // action on an until() never re-notified). The hook is installed with
      // the engine, which an active override implies. The propagation runs
      // under this flight's provenance (setOrigin above).
      GlobalQueue._syncCompanions?.(el, value);
      if (!hasActiveOverride(el)) {
        if (attrHooks !== null) attrHooks.asyncEnd(el, undefined, value, true);
        insertSubs(el);
      } else GlobalQueue._supersedeOverride(el, value);
      el._time = clock;
    } else if (lane) {
      // Route through lane's effect queue for independent flushing
      const isEffect = el._type;
      const prevValue = hasActiveOverride(el) ? unwrapOverride(el._x._overrideValue) : el._value;
      const equals = el._equals;
      try {
        // `(prev, next)`, as every other commit path calls the comparator — a
        // user comparator keyed on which side is incoming (dynamic's binding
        // gate) reads the lane landing the same way it reads a sync commit.
        if ((!isEffect && wasUninitialized) || !equals || !equals(prevValue, value)) {
          // Lanes stage (#3479): a memo's landing under its lane is a derived
          // override, as its sync pass's result is (recompute) — `_value`
          // stays the committed truth for readers off the lane.
          if (isEffect) el._value = value;
          else GlobalQueue._laneOverride(el, value, lane);
          el._time = clock;
          // The latest() shadow write gives latest() effects independent lanes; the
          // _pendingSignal update is a no-op repeat of the clearStatus() call above
          // (computePendingState doesn't read _value).
          GlobalQueue._syncCompanions?.(el, value);
          insertSubs(el, true);
        }
      } catch (e) {
        // A user comparator throwing during async resolution has no caller to
        // surface to (we're in promise machinery) — route it through the node's
        // error status so boundaries contain it instead of an unhandled
        // rejection (#2837).
        notifyStatus(el, STATUS_ERROR, e);
      }
      // Attribution hook — unconditional, and OUTSIDE the try: rollup's
      // tryCatchDeoptimization retains anything referenced inside a try even
      // behind a folded true guard, so even a dev-only flag smuggled out of
      // the commit branch leaves prod residue (#2883). The engine instead
      // detects whether this landing committed by comparing the node against
      // its asyncStart snapshot (see attribution.ts).
      if (attrHooks !== null) attrHooks.asyncEnd(el, prevValue, value, true);
    } else {
      try {
        setSignal(el, () => value);
      } catch (e) {
        // Same containment as above: setSignal's comparator throw is the only
        // pre-commit failure here, and there is no user callsite to throw to.
        notifyStatus(el, STATUS_ERROR, e);
      }
      // Attribution hook: this path landed through setSignal, whose write
      // hook already saw any committed change — direct=false lets the engine
      // reclassify that write as an async landing iff it actually committed.
      // Outside the try (#2883 — see attribution-hooks.ts).
      if (attrHooks !== null) attrHooks.asyncEnd(el, undefined, value, false);
    }
    // First real answer landing: the window closes when the answer becomes
    // OBSERVABLE. A direct commit is observable now; a transition-held write
    // (`_pendingValue` set above or inside setSignal) is not — the verdict's
    // held-value branch is window-gated, and commitPendingNode closes the
    // window when the hold commits, so no one-frame isPending pulse can leak
    // to live observers between the landing and its commit (#2990). The
    // quiet re-ask classification follows the same schedule (#3178).
    if (el._pendingValue === NOT_PENDING) {
      el._loading = false;
      if (wasReask) el._x._reask = false;
      // The landing published: the dependency tail the flight's pass left
      // linked goes now (A30, #3410). A transition-held landing has not
      // replaced the committed frame — the committed value still derives
      // from the previous pass's inputs, and a mainline write to one of them
      // must reach this node and join its hold (its stamp) instead of
      // publishing beside the stale derivation (#3461: `b() ? b() : a()`
      // held on `b` dropped `a` at its landing, and `A: 1` then committed
      // beside `Selected: 0`). `commitPendingNode` trims a held landing.
      trimStaleDeps(el);
    }
    settlePendingSource(el);
    schedule();
    flush();
    then?.();
  };
  // A pending node's in-flight promise is an observer: `unlinkSubs` skips
  // autodispose while STATUS_PENDING so subscriber churn can't orphan the
  // work (a lazy async memo would otherwise tear down and re-execute — one
  // fetch per suspended re-read). Settling is that observer's release, so
  // it runs the same last-one-out check the other release sites run.
  // Returns whether the node released, so the iterator branch can stop
  // pulling values instead of pumping an unobserved stream forever (#2935).
  const settleAutodispose = () => {
    if (el._config & CONFIG_AUTO_DISPOSE && !el._subs && !(el._statusFlags & STATUS_PENDING)) {
      unobserved(el);
      return true;
    }
    return false;
  };
  // Consumes an AsyncIterable as this flight's value stream. Two postures:
  // LIVE (called synchronously from this read — the compute returned an
  // iterable directly, or a sync-settled thenable held one), where the
  // initial drain may stash a sync first yield for the caller to return and
  // close registration uses the ambient owner; and DEFERRED (the flattening
  // path — a thenable resolved to an iterable in a later microtask), where
  // there is no caller to serve and no ambient owner: sync-settled steps
  // write through asyncWrite, and close registration goes through the slot
  // the thenable branch pre-registered while it still owned the context.
  // Returns whether a sync answer landed (first yield or empty completion) —
  // meaningful only in the live posture.
  const consumeIterator = (source, registerClose) => {
    const it = source[Symbol.asyncIterator]();
    let hadValue = false;
    let completed = false;
    let initialRead = !registerClose;
    const close = () => {
      if (completed) return;
      completed = true;
      try {
        const returned = it.return?.();
        if (isThenable(returned)) returned.then(undefined, () => {});
      } catch {}
    };
    registerClose ? registerClose(close) : cleanup(close);
    // Flight-identity cancellation (#3122): the registration above is the
    // owner-death backstop, but its disposal list can be zombie-deferred
    // until the SUPERSEDING flight settles. The teardown slot fires at the
    // _inFlight release sites so supersede stops this stream immediately.
    ext(el)._flightTeardown = close;
    // Release check before each next pull: an unobserved lazy node must tear
    // down (its close above runs via disposal, closing the iterator) instead
    // of pumping the stream forever with zero subscribers (#2935).
    const iterateOrRelease = () => {
      if (!settleAutodispose()) iterate();
    };
    const iterate = () => {
      let syncResult,
        syncError,
        resolved = false,
        rejected = false,
        isSync = true;
      // Protocol tolerance, matching `for await`: `await` unwraps whatever
      // next() returns — a thenable OR a bare IteratorResult. Real producers
      // use the bare form as a promise-free fast path when a value is already
      // buffered (seroval's deserialized streams do), so a bare result is
      // assimilated as an already-settled step instead of crashing on `.then`.
      const step = it.next();
      const settled = isThenable(step) ? step : { then: onSettle => void onSettle(step) };
      settled.then(
        r => {
          // The sync stash only serves the INITIAL drain (handleAsync's caller
          // consumes syncValue / throws NotReady from it). A sync-settled step
          // after an async gap — seroval buffering values between pulls, a
          // sync-thenable producer mid-stream — has no caller reading the
          // stash: it must write through the async path or the value is
          // silently dropped. (The deferred posture never has a caller, so
          // initialRead starts false there and everything writes through.)
          if (isSync && initialRead) {
            syncResult = r;
            resolved = true;
            if (r.done) completed = true;
          } else if (el._x?._inFlight !== result) {
            return;
          } else if (!r.done) {
            hadValue = true;
            asyncWrite(r.value, iterateOrRelease);
          } else {
            completed = true;
            if (hadValue) {
              schedule();
              flush();
            } else {
              // Empty completion settles like the immediately-done sync path.
              asyncWrite(undefined);
            }
            settleAutodispose();
          }
        },
        e => {
          if (isSync && initialRead) {
            syncError = e;
            rejected = true;
          } else if (el._x?._inFlight === result) {
            completed = true;
            handleError(e);
            settleAutodispose();
          }
        }
      );
      isSync = false;
      if (rejected) {
        // Match the promise branch, but only rethrow during the initial read.
        completed = true;
        handleError(syncError);
        if (initialRead) throw syncError;
        return true;
      }
      if (resolved && !syncResult.done) {
        syncValue = syncResult.value;
        hadValue = true;
        return iterate();
      }
      return resolved && syncResult.done;
    };
    const immediatelyDone = iterate();
    // Later iterate() calls run from asyncWrite, where rethrowing would be unhandled.
    initialRead = false;
    return hadValue || immediatelyDone;
  };
  // Landed-synchronously verdict for a LIVE iterator drain; null when no live
  // drain ran (plain promise flight, or a deferred flatten). Drives the
  // shared NotReady/loading tail below.
  let liveLanded = null;
  // Flatten one async level: a thenable that RESOLVES to an AsyncIterable —
  // the shape every async stub returning a stream produces — consumes as the
  // stream itself rather than settling on the iterable object. One level
  // only: A+ `then` already collapses nested thenables, so the resolved
  // value is never itself a thenable.
  const flattenIfIterable = (value, registerClose) => {
    let innerIterator = false;
    if (typeof value === "object" && value !== null) {
      untrack(() => {
        innerIterator = value[Symbol.asyncIterator];
      });
    }
    if (!innerIterator) return false;
    const landed = consumeIterator(value, registerClose);
    if (!registerClose) liveLanded = landed;
    return true;
  };
  if (thenable) {
    let resolved = false,
      rejected = false,
      syncError,
      isSync = true;
    // Close registration for the flattening path. Consumption starts in a
    // microtask where the ambient owner is gone (or worse, someone else's),
    // so `cleanup()` can't be used — the close targets el's disposal list
    // directly, exactly where a live cleanup() during this recompute would
    // have put it. Deliberately NOT pre-registered at flight start: a
    // non-null `_disposal` reclassifies the node into recompute's deferred
    // (zombie) disposal path, and plain promise flights — the overwhelming
    // majority — must not pay that. Only a flight that actually flattens
    // becomes disposal-bearing, which is exactly the class a directly
    // returned iterable already occupies.
    const registerDeferredClose = fn => {
      if (!el._disposal) el._disposal = fn;
      else if (Array.isArray(el._disposal)) el._disposal.push(fn);
      else el._disposal = [el._disposal, fn];
    };
    watchAsyncTail(el, result).then(
      v => {
        if (isSync) {
          syncValue = v;
          resolved = true;
        } else if (
          el._x?._inFlight === result &&
          !(el._flags & REACTIVE_DISPOSED) &&
          flattenIfIterable(v, registerDeferredClose)
        );
        else {
          asyncWrite(v);
          settleAutodispose();
        }
      },
      e => {
        if (isSync) {
          syncError = e;
          rejected = true;
        } else {
          handleError(e);
          settleAutodispose();
        }
      }
    );
    isSync = false;
    if (rejected) {
      // Settle through the same status path an async rejection uses, then
      // unwind the in-progress synchronous read so the errored node isn't
      // momentarily read as `undefined`.
      handleError(syncError);
      throw syncError;
    } else if (!resolved) {
      // Loading window: serve commit #0 instead of suspending. No transition
      // is opened — first-flight work on a loadingValue node is loading-class
      // (invisible to boundaries and transitions); the flight itself is
      // already registered in _inFlight and lands through asyncWrite.
      if (el._loading) return el._value;
      globalQueue.initTransition(resolveTransition(el));
      throw new NotReadyError(context);
    } else if (!flattenIfIterable(syncValue)) {
      // Synchronously-resolved promise: the first real answer landed.
      el._loading = false;
    }
    // A sync-resolved promise holding an AsyncIterable flattened LIVE (we
    // are still inside the synchronous read): full initial-drain semantics
    // apply and the shared tail below settles the verdict.
  }
  if (iterator) flattenIfIterable(result);
  if (liveLanded !== null) {
    if (!liveLanded) {
      // Loading window: serve commit #0 (see the promise branch above).
      if (el._loading) return el._value;
      globalQueue.initTransition(resolveTransition(el));
      throw new NotReadyError(context);
    }
    // A sync first yield (or immediate empty completion) is the first real
    // answer; async yields clear inside asyncWrite.
    el._loading = false;
  }
  return syncValue;
}
function clearStatus(el, clearUninitialized = false) {
  if (el._x?._pendingSources) clearPendingSources(el);
  if (el._x?._blocked) if (el._x !== null) el._x._blocked = false;
  // The pending window is over; its quiet classification dies with it.
  // (Unconditional: _reask is baked into the node literals, so this is a
  // plain store to an existing slot — no shape change.)
  if (el._x !== null) el._x._reask = false;
  el._statusFlags = clearUninitialized ? 0 : el._statusFlags & STATUS_UNINITIALIZED;
  if (el._x?._error) setPendingError(el);
  // Update pending signal for isPending() reactivity (companions only exist
  // once the verdict layer created them, which installs the hooks).
  if (el._x?._pendingSignal || el._x?._latestValueComputed) GlobalQueue._updatePendingSignal(el);
  if (
    el._x?._child &&
    el._config & CONFIG_CHILD_COMPANIONS &&
    GlobalQueue._updateChildCompanions !== null
  )
    GlobalQueue._updateChildCompanions(el);
  const notify = statusNotifierOf(el);
  if (notify) notify.call(el);
}
/**
 * Status clear for a flight LANDING (asyncWrite). A landing answers the
 * node's OWN question — it retires the node's self entry, not the pending
 * state its sources propagated onto it. An input re-asked while this flight
 * was up (a second write to the signal feeding `a` while `b`'s first flight
 * is in the air, #3373) marks `b` pending on `a` by propagation, with `b`'s
 * flight still current: nothing superseded it (the re-ask only changed `a`'s
 * status, not yet its value), so the landing arrives, and a full clear made
 * `b` answer with the stale value — the transaction's reporter for `a` found
 * nothing pending below it and committed the newer signal beside the older
 * derived value (`2 / 1`); `isPending(b)` read false for the gap (#3376).
 * With another source still pending the node stays derivatively pending on
 * it; the landed value is written below (the staged answer is still the
 * answer for the inputs it was asked with) and the input's own settle
 * releases it, or its value change recomputes the node into a fresh flight.
 * `_blocked` clears like a full clear: a landing that passed the `_inFlight`
 * guard was not superseded by a re-run (recompute nulls `_inFlight` first),
 * so the flag is the flight's own registration throw — the input settling
 * unchanged must not re-run the node (an extra flight for the same inputs).
 * The node is already STATUS_PENDING in that branch (only notifyStatus fills
 * the set, with status; a loading-window park cannot coexist with a live
 * flight since registration drops the set), so the flags only change when
 * the first landing retires UNINITIALIZED. `_error` must move off self: a
 * reader thrown NotReady(self) would park on a retired entry. Companions
 * keep their verdict (pending before and after; the write re-syncs them).
 */
function landStatus(el, clearUninitialized = false) {
  const sources = el._x?._pendingSources;
  // (The full clear below drops the set whether or not self was retired first.)
  if (sources && (sources.delete(el), sources.size)) {
    el._x._blocked = false;
    if (clearUninitialized) el._statusFlags = STATUS_PENDING;
    setPendingError(el, sources.values().next().value);
  } else clearStatus(el, clearUninitialized);
}
function notifyStatus(el, status, error, blockStatus, lane) {
  // Wrap regular errors to track source node
  if (
    status === STATUS_ERROR &&
    !(error instanceof StatusError) &&
    !(error instanceof NotReadyError)
  )
    error = new StatusError(el, error);
  const pendingSource =
    status === STATUS_PENDING && error instanceof NotReadyError ? error.source : undefined;
  const isSource = pendingSource === el;
  // An optimistic node (a WRITTEN override slot) pending derivatively is a
  // boundary: its override is the answer, pending stops here (A17). A
  // derived override (#3479) is a previous speculative answer on a plain
  // member — pending flows through it as through any memo.
  const isOptimisticBoundary =
    status === STATUS_PENDING &&
    el._x?._overrideValue !== undefined &&
    !(el._config & CONFIG_DERIVED_OVERRIDE) &&
    !isSource;
  const startsBlocking = isOptimisticBoundary && hasActiveOverride(el);
  if (!blockStatus) {
    // Lane before companions: the companion pokes below may create the
    // node's pending-signal lane, whose parent is read from the node's lane
    // at creation. Assigned after them (as it was), a node made pending by
    // propagation before it rode the lane got a parentless companion lane,
    // and the isPending reader that also depends on the node merged it into
    // the held lane — the verdict then waited on the async it reports (#3379).
    if (lane) assignOrMergeLane(el, lane);
    if (status === STATUS_PENDING && pendingSource) {
      addPendingSource(el, pendingSource);
      // A fresh flight from a settled state starts with its inputs unpublished
      // (a replacement flight while still pending keeps the mark: the first
      // flight's committed inputs are still the frame).
      if (!(el._statusFlags & STATUS_PENDING)) el._config &= ~CONFIG_INPUTS_PUBLISHED;
      el._statusFlags = STATUS_PENDING | (el._statusFlags & STATUS_UNINITIALIZED);
      // Preserve the current source on this propagation so render-effect notification
      // can register every distinct pending source with the transition.
      setPendingError(el, pendingSource, error);
    } else {
      clearPendingSources(el);
      el._statusFlags =
        status | (status !== STATUS_ERROR ? el._statusFlags & STATUS_UNINITIALIZED : 0);
      ext(el)._error = error;
    }
    GlobalQueue._updatePendingSignal?.(el);
    if (
      el._x?._child &&
      el._config & CONFIG_CHILD_COMPANIONS &&
      GlobalQueue._updateChildCompanions !== null
    )
      GlobalQueue._updateChildCompanions(el);
  }
  const downstreamBlockStatus = blockStatus || startsBlocking;
  const downstreamLane = blockStatus || isOptimisticBoundary ? undefined : lane;
  const elNotify = statusNotifierOf(el);
  if (elNotify) {
    if (blockStatus && status === STATUS_PENDING) {
      return;
    }
    if (downstreamBlockStatus) {
      elNotify.call(el, status, error);
    } else {
      elNotify.call(el);
    }
    return;
  }
  forEachDependent(el, (sub, link) => {
    sub._time = clock;
    // A pending mark on a kept-tail link re-derives the subscriber instead of
    // marking it (A30, #3494 review; fuzzer latest-1 #2141; #3519 review).
    // Past `_depsTail` lie the committed frame's deps, kept by A30 because
    // that frame still derives from them while the pass that dropped them is
    // held (staged, or unchanged and parked). A source going pending there is
    // a question for the node's NEXT pass, not a fact about its current one:
    // marked, the node was registered as the flight's reporter and its holder
    // entangled with the flight (the A15 arm below) on a dep the held frame
    // never reads — an orphaned fetch held the truth (a hide joined to a
    // parked action, A34), and a manual flight nobody awaited held a gated
    // reader hidden forever (fuzzer branches-1 #1105). Skipped, the committed
    // frame published stale beside its new inputs (`query=1` beside a
    // `selected` derived from `remote(0)`). Re-derived, the pass decides: it
    // reads the dep and registers through its own read, or reads a held input
    // and enters that transaction (A29), or reads neither and is done. Clears
    // and errors still ride every link. A link inside the prefix carries the
    // pass's generation (`link()`), so the test is O(1); mid-pass the prefix
    // is what the pass has read so far, and the heap refuses a recomputing
    // node — a dep it has yet to reach registers through its own read.
    if (status === STATUS_PENDING && link._gen !== sub._depGen) {
      enqueueSub(sub);
      schedule();
      return;
    }
    if (
      (status === STATUS_PENDING &&
        pendingSource &&
        !sub._x?._pendingSources?.has(pendingSource)) ||
      (status !== STATUS_PENDING && (sub._x?._error !== error || sub._x?._pendingSources))
    ) {
      // A pending-observer link is the subscription an `isPending` read created.
      // It exists so the observer re-runs when the source settles, but it must
      // not carry a real (non-NotReadyError) error — the synchronous `isPending`
      // read swallows those, and the async path must match. Re-run the observer
      // so `isPending` re-evaluates (to not-pending) instead of forwarding.
      if (link._pendingObserver && status !== STATUS_PENDING && !(error instanceof NotReadyError)) {
        enqueueSub(sub);
        schedule();
        return;
      }
      // A memo another live transaction HOLDS — pending on its work, or
      // staged by it — made pending by THIS flight cannot reveal before the
      // flight lands: the two settle as one unit (A15, a shared derivation of
      // both — #3443). Propagation marks the held memo without recomputing it
      // (its inputs' values are unchanged), so this is the one moment the
      // entanglement is known; the memo's stamped re-entry at its next pass
      // came too late — the holder's own flight landed first and revealed the
      // inputs beside the stale sum. The stamp alone decides nothing (#3334):
      // a node the transaction once queued but holds nothing of — a switch's
      // shared output whose first flight the second write superseded — must
      // not drag the older flight into the newer reveal. Effects entangle
      // nothing (A15 shared-hole corollary): their reader registers with the
      // flight's transaction at queue notification.
      if (!downstreamBlockStatus)
        sub._transition
          ? pendingSource &&
            !sub._type &&
            (sub._statusFlags & STATUS_PENDING || sub._pendingValue !== NOT_PENDING) &&
            globalQueue.initTransition(sub._transition)
          : queuePendingNode(sub);
      notifyStatus(sub, status, error, downstreamBlockStatus, downstreamLane);
    }
  });
}

// The heap's per-node step. A tracked effect's heap visit is its compute
// phase — empty, like a user effect whose compute reads nothing — and hands
// the callback to the user queue. Routing the wake through the heap, rather
// than straight into the queue at notify time, is what orders the run after
// the commit regardless of which phase the write came from: a write in a
// render-effect callback stages its value for the next pass, but a wake pushed
// directly into the user queue ran in the SAME pass, read the old value, and
// nothing re-notified it when the value landed (#3291).
GlobalQueue._update = el => {
  if (el._type === EFFECT_TRACKED) {
    deleteFromHeap(el, queueFor(el));
    el._modified = true;
    el._queue.enqueue(EFFECT_USER, el._run);
  } else recompute(el);
};
GlobalQueue._dispose = disposeChildren;
const PRIMITIVE_IN_FORBIDDEN_SCOPE_MESSAGE =
  "[PRIMITIVE_IN_FORBIDDEN_SCOPE] Cannot create reactive primitives inside createTrackedEffect or owner-backed onSettled";
const REACTIVE_WRITE_IN_OWNED_SCOPE_SIGNAL_MESSAGE =
  "[REACTIVE_WRITE_IN_OWNED_SCOPE] Writing to reactive state inside an owned scope (component, computation) is not allowed. " +
  "Move the write outside or set the `ownedWrite` option if this is intentional.";
const REACTIVE_WRITE_IN_OWNED_SCOPE_REFRESH_MESSAGE =
  "[REACTIVE_WRITE_IN_OWNED_SCOPE] Calling refresh() inside an owned scope (component, computation) is not allowed. " +
  "Move the invalidation outside pure computation.";
const ASYNC_STORE_SETTER_MESSAGE =
  "[ASYNC_STORE_SETTER] Store setter callback returned a Promise. A store setter is a synchronous transaction: " +
  "the draft closes when the callback returns, so writes after an `await` are lost. " +
  "Move the await into an action() and call the setter from there.";
let tracking = false;
/** @internal verdict-module glue */
function setPendingCheckActive(v) {
  pendingCheckActive = v;
}
/** @internal verdict-module glue */
function setLatestReadActive(v) {
  latestReadActive = v;
}
/** @internal verdict-module glue */
function setContextInternal(v) {
  context = v;
}
let stale = false;
let pendingCheckActive = false;
let latestReadActive = false;
let context = null;
let currentOptimisticLane = null;
/** Notify `node`'s subscribers on `lane`'s channel: they recompute as the
 * lane's passes — a memo publishes a derived override (lanes stage, #3479),
 * an effect runs from the lane's queue, at the park, ahead of the
 * transaction — the display-ahead view. The write itself is already staged
 * (setSignal) and commits with the frame; this walk shows it now. Used by a
 * boundary re-armed from a lane pass (boundaries.ts `_swap`, #3540). */
function notifyOnLane(node, lane) {
  const prev = currentOptimisticLane;
  currentOptimisticLane = lane;
  try {
    insertSubs(node, true);
  } finally {
    currentOptimisticLane = prev;
  }
}
let snapshotCaptureActive = false;
let snapshotSources = null;
function ownerInSnapshotScope(owner) {
  while (owner) {
    if (owner._snapshotScope) return true;
    owner = owner._parent;
  }
  return false;
}
function setSnapshotCapture(active) {
  snapshotCaptureActive = active;
  if (active && !snapshotSources) snapshotSources = new Set();
}
function markSnapshotScope(owner) {
  owner._snapshotScope = true;
}
function releaseSnapshotScope(owner) {
  owner._snapshotScope = false;
  releaseSubtree(owner);
  schedule();
}
function releaseSubtree(owner) {
  let child = owner._firstChild;
  while (child) {
    if (child._snapshotScope) {
      child = child._nextSibling;
      continue;
    }
    if (child._fn) {
      const comp = child;
      comp._config &= ~CONFIG_IN_SNAPSHOT_SCOPE;
      if (comp._flags & REACTIVE_SNAPSHOT_STALE) {
        comp._flags &= ~REACTIVE_SNAPSHOT_STALE;
        comp._flags |= REACTIVE_DIRTY;
        if (dirtyQueue._min > comp._height) dirtyQueue._min = comp._height;
        insertIntoHeap(comp, dirtyQueue);
      }
    }
    releaseSubtree(child);
    child = child._nextSibling;
  }
}
function clearSnapshots() {
  if (snapshotSources) {
    for (const source of snapshotSources) {
      // The extension is a fixed-shape object with `_snapshotValue`
      // pre-initialized to undefined (see ext()), and every reader tests
      // `!== undefined` — assign, don't `delete`: deleting a field pushes the
      // object to dictionary mode for every later read of every field.
      const x = source._x;
      if (x != null) x._snapshotValue = undefined;
      // StoreNode targets share one pre-initialized hidden class (see
      // createStoreProxy) — same rule, and only when present so signal-node
      // sources don't grow the field.
      if (source[STORE_SNAPSHOT_PROPS] !== undefined) source[STORE_SNAPSHOT_PROPS] = undefined;
    }
    snapshotSources = null;
  }
  snapshotCaptureActive = false;
}
function recompute(el, create = false) {
  // §12d: any recompute can clean a marked subscriber — invalidate skips.
  bumpNotifyEpoch();
  const isEffect = el._type;
  // Attribution hook: fired before this run touches the dep list — `_deps`
  // still holds the previous run's links (the subscriptions that could have
  // triggered this run, and the baseline for the engine's subscription diff).
  let devChanged = false;
  if (attrHooks !== null) attrHooks.recomputeStart(el, create);
  // Lane posture is resolved BEFORE the previous frame is parked below: a
  // lane pass parks a lane frame, not a transaction zombie (#3662, #3698;
  // see the parking site), so the decision must be known there. `lane` is applied to
  // `currentOptimisticLane` further down, once the previous posture is saved.
  let isOptimisticDirty = !!(el._flags & REACTIVE_OPTIMISTIC_DIRTY);
  let lane = null;
  if (isOptimisticDirty) {
    lane = GlobalQueue._recomputeLane(el, true);
    // `false` = wake-only lane demotion: recompute plain so a mid-tick
    // latest()/isPending() pull stages instead of direct-committing (#3009).
    // The predicate lives with the engine (recomputeLane).
    if (lane === false) isOptimisticDirty = false;
  } else if (el._config & CONFIG_DERIVED_OVERRIDE) {
    // Lanes stage (#3479): a pass over a live lane member carrying a derived
    // override is the lane's pass whatever channel dirtied it (a boundary
    // reset, an unrelated sync write) — its inputs serve the lane's view, so
    // its result is the lane's and belongs in the override slot. Run plain,
    // A18's sync twin below read that re-derived lane view as a differing
    // truth (a fresh array), superseded the override and demoted the lane;
    // the lane's next pass then dropped the staged "truth" and left the node
    // flagged superseded with nothing to serve (fuzzer latest-1 #2481). A
    // demoted node resolves no lane and stays plain: its pass IS the truth.
    lane = GlobalQueue._recomputeLane(el, true);
    if (lane) isOptimisticDirty = true;
  } else if (activeTransition && !create && activeTransition._optimisticNodes.length) {
    // Lane adoption: parent-deeper-than-owned-child can run before its OPT-dirty
    // child propagates. Walk deps once and inherit the OPT lane so this node
    // recomputes under the right posture and propagates correctly.
    lane = GlobalQueue._recomputeLane(el, false);
    if (lane) isOptimisticDirty = true;
  }
  if (!create) {
    // A stamped memo re-enters its hold: its value is that transaction's work.
    // An effect's pass belongs to whatever dirtied it (A15 corollary: effects
    // don't entangle parallel transactions); it joins its stamp only when the
    // pass observes the held flight — queue notification (#3407).
    if (el._transition && !isEffect && activeTransition !== el._transition)
      globalQueue.initTransition(el._transition);
    deleteFromHeap(el, queueFor(el));
    if (el._x !== null) {
      el._x._inFlight = null;
      // Supersede is where an iterator flight dies (#3122): close it now.
      // Its cleanup(close) registration may sit in a zombie-deferred
      // disposal list that a held transition only drains when the
      // SUPERSEDING flight settles — cancellation must not wait for the
      // work that replaced it. Idempotent with the cleanup-channel close.
      releaseFlightTeardown(el);
    }
    // Tracked effects run after finalizePureQueue, so dispose immediately
    // instead of deferring. Children built by an uncommitted recompute
    // (CONFIG_HELD_CHILDREN) die immediately too: no frame ever showed them.
    // Everything else is the committed frame's. Which frame retires it is
    // decided by who owns the pass, never by the node's kind (A15 lane work
    // and transaction work, ruled 2026-09-28, #3698). Transaction work — a
    // pass under a held transaction — defers them as zombies until this
    // node's commit, a transaction-owned node included (#3404): a parked
    // node's children predate the hold, and tearing them down when the
    // source lands ran cleanups before the transaction's atomic reveal.
    // Lane work — a pass over a lane, effect or memo alike — parks a LANE
    // frame instead (CONFIG_LANE_FRAME, #3662, #3698): the frame it replaces
    // leaves the screen when the lane's queue applies this pass (A30) — not
    // at the action's commit — and a held lane defers that with the frame
    // still displayed. The drain is the lane's first render entry for this
    // pass, pushed before the pass builds the new frame: cleanups before
    // side effects — the retired frame's `onCleanup`s run ahead of every
    // effect callback of the new frame. While the frame waits, the live
    // children were never shown: a superseding pass disposes them here like
    // held children, and the parked frame stays. Zombies exist for
    // transaction work only: #3662 gated the lane frame on `isEffect`, and a
    // memo's lane pass (its value a derived override, A17) parked a
    // transaction zombie that made the memo a pending node of the action,
    // stamped it, and sent its next mainline recompute through the
    // stamped-memo arm above — a `Show` whose `when` getter owns a
    // compiler-emitted memo held an unrelated sync write for the action's
    // lifetime, against the #3460 ruling that a lane never holds a sync write.
    if (isEffect === EFFECT_TRACKED || el._config & (CONFIG_HELD_CHILDREN | CONFIG_LANE_FRAME))
      disposeChildren(el);
    else if (el._firstChild !== null || el._disposal !== null) {
      markDisposal(el);
      const x = ext(el);
      x._pendingDisposal = el._disposal;
      x._pendingFirstChild = el._firstChild;
      el._disposal = null;
      el._firstChild = null;
      el._childCount = 0;
      if (lane) {
        el._config |= CONFIG_LANE_FRAME;
        findLane(lane)._effectQueues[0].push(() => {
          el._config &= ~CONFIG_LANE_FRAME;
          disposeChildren(el, false, true);
        });
      }
      clearSignals(el);
    } else clearSignals(el);
  }
  // A derived override (lanes stage, #3479) is override-covered like a written
  // one: a plain pass over it — its source superseded (A18) — stages the truth
  // and supersedes the override through the sync twin below.
  const hasOverride =
    (el._config & (CONFIG_OPTIMISTIC | CONFIG_DERIVED_OVERRIDE)) !== 0 &&
    el._x?._overrideValue !== NOT_PENDING &&
    el._x?._overrideValue !== undefined;
  const wasUninitialized = !!(el._statusFlags & STATUS_UNINITIALIZED);
  // Capture both error and pending status before the compute clears them.
  // A conditional can drop its pending source and recover to an unchanged
  // value, leaving blocked dependents outside that source’s settle walk.
  const outgoingError = el._statusFlags & STATUS_ERROR ? el._x?._error : undefined;
  const wasPending = (el._statusFlags & STATUS_PENDING) !== 0;
  const outgoingPendingSources = wasPending ? el._x?._pendingSources : undefined;
  // Pending SOURCE-hood, captured before the compute clears status: a node
  // whose own flight parked dependents self-registers in _pendingSources
  // (notifyStatus, isSource). If this recompute supersedes that flight and
  // settles synchronously, those dependents settle HERE — asyncWrite's
  // settlePendingSource walk never runs for a landing that was preempted
  // (#3181).
  const wasPendingSource = el._x?._pendingSources?.has(el);
  // Re-ask classification lives in the verdict module; capture the flag before
  // the recompute wipes _flags below.
  const hadReask = (el._flags & REACTIVE_REASK) !== 0;
  // Captured before the compute clears it on a sync landing: if that landing
  // is transition-held below, the window must stay open until the hold
  // commits (commitPendingNode) — a closed window plus a held value reads as
  // a pending frame to live observers of the verdict (#2990).
  const wasLoading = el._loading;
  // Creation-time A29 (see enterStagedRead): a pass outside a flush that is
  // served a live transaction's staged value records the transaction here
  // and is staged INTO it below — "born held" — instead of committing.
  const prevStagedEntry = stagedEntry;
  stagedEntry = null;
  const oldcontext = context;
  context = el;
  el._depsTail = null;
  el._depGen++;
  // REACTIVE_ZOMBIE is position, not scheduling state: it says the node sits
  // on its owner's `_pendingFirstChild` chain, and `disposeChildren` keys its
  // parent-chain splice off it. A zombie reruns for mainline writes until the
  // commit that disposes it (#3463), so the per-pass wipe here — and in the
  // finally below and in updateIfNecessary — must carry it (#3543): a
  // de-flagged zombie spliced itself out of the LIVE chain at disposal,
  // orphaning the owner's current child, which stayed subscribed forever.
  el._flags = REACTIVE_RECOMPUTING_DEPS | (el._flags & REACTIVE_ZOMBIE);
  el._time = clock;
  let value = el._pendingValue === NOT_PENDING ? el._value : el._pendingValue;
  let oldHeight = el._height;
  let missedWake = false;
  let prevTracking = tracking;
  let prevLane = currentOptimisticLane;
  let prevStrictRead = false;
  {
    prevStrictRead = strictRead;
    strictRead = false;
  }
  tracking = true;
  // A computed's fn establishes its OWN dependencies, so it must never run
  // inside a latest() read window: read() short-circuits through the
  // companion path before dependency linking, so a memo created (eagerly
  // computed) inside latest(fn) came out permanently dependency-less (#2926).
  // latestRead() already suspends the flag for its pull-recomputes; this
  // covers creation-time computes and flushes that run inside the window.
  const prevLatestRead = latestReadActive;
  latestReadActive = false;
  // A memo computes under its OWN lane posture, never the puller's (A31,
  // #3442): its value is one shared slot every reader sees, so a pull from a
  // lane-carrying reader (a probe effect on its companion lane pulling a sync
  // memo) must not run it with that lane's read carve-outs — under a lane, a
  // pending node on no lane serves its committed value instead of throwing,
  // and the memo then published a stale "settled" value, dropped its
  // pending status, and stopped holding its transaction. The branches below
  // re-establish the posture the memo itself owns (OPT-dirty, or adopted
  // through its deps). Effects keep the ambient lane: their runs are the
  // lane's own view.
  if (!isEffect) currentOptimisticLane = null;
  // Lane posture lives with the engine: OPTIMISTIC_DIRTY is only ever set by
  // engine-driven paths, and _optimisticNodes is only pushed by
  // _optimisticWrite, so the hook is installed whenever either gate holds.
  // (Resolved at the top of this pass, ahead of the parking site.)
  if (lane) currentOptimisticLane = lane;
  const isStaleEffect = isEffect && isEffect !== EFFECT_USER;
  const prevStale = stale;
  if (isStaleEffect) stale = true;
  // An effect recorded for this transaction's commit replay (it once read a
  // node the transaction held and showed the committed value) and now
  // recomputing UNDER the transaction sees its staged view: the value this
  // run produces is applied by the commit itself, and the stale recording
  // would publish the frame a second time. Drop it; the reads below re-record
  // if they are served the committed view again (a lane's committed read).
  if (isEffect && activeTransition !== null && activeTransition._gatedSubs.size)
    activeTransition._gatedSubs.delete(el);
  try {
    if (!true && el._config & CONFIG_SYNC);
    else {
      // Snapshot `_inFlight` so we can detect whether `_fn` self-registered an async
      // subscription (e.g. `createProjection` calls `handleAsync` from inside its body
      // with a setter callback). In that case, the outer `handleAsync` call below would
      // clobber the fresh subscription, so we skip it and let the internally-registered
      // iteration drive updates.
      const prevInFlight = el._x?._inFlight;
      const fnResult = el._fn(value);
      const isAsyncResult = typeof fnResult === "object" && fnResult !== null;
      const inFlightChanged = el._x?._inFlight !== prevInFlight;
      value = inFlightChanged || !isAsyncResult ? fnResult : handleAsync(el, fnResult);
      if (!inFlightChanged && !isAsyncResult) {
        if (el._x !== null) el._x._inFlight = null;
        // A sync (non-object) return is the first real answer; async-shaped
        // results clear inside handleAsync at their own landing points, and a
        // self-registered flight (inFlightChanged — projections) clears when
        // its internal handleAsync lands.
        el._loading = false;
      }
    }
    // On a status-free node clearStatus is a guaranteed no-op: every field
    // its body gates on is either _statusFlags or lives in the cold
    // extension — no extension, no status to clear. (_x from an unrelated
    // installer just makes clearStatus a cheap re-verified no-op.)
    // A node born held keeps STATUS_UNINITIALIZED until its transaction
    // commits: it has no committed value, and read() holds its readers.
    if (el._statusFlags !== 0 || el._x !== null) clearStatus(el, create && stagedEntry === null);
    // _optimisticLane is only ever assigned by engine paths (CONFIG_HAS_LANE
    // is their sticky presence mark).
    if (el._config & CONFIG_HAS_LANE && el._x?._optimisticLane) GlobalQueue._laneAsyncSettled(el);
  } catch (e) {
    const notReady = e instanceof NotReadyError;
    if (notReady && el._loading) {
      // Loading window with an unready sync dependency: register for the
      // source's settle (the settlePendingSource walk runs off
      // _pendingSources + _blocked alone) but take NO read-visible pending
      // status, no downstream propagation, no transition, no lane
      // registration — the committed loading value keeps serving. If the
      // node is currently errored the error stays the answer until this
      // retry can actually run.
      parkLoadingWindow(el, e);
    } else {
      // Track pending async in the lane (not the lane's source — it creates the lane
      // but doesn't belong to it). Set lane BEFORE notifyStatus for downstream propagation.
      if (notReady && currentOptimisticLane) GlobalQueue._laneAsyncPending(el);
      let reaskChanged = false;
      if (notReady) {
        ext(el)._blocked = true;
        if (GlobalQueue._applyReask !== null) reaskChanged = GlobalQueue._applyReask(el, hadReask);
      }
      notifyStatus(
        el,
        notReady ? STATUS_PENDING : STATUS_ERROR,
        e,
        undefined,
        notReady ? el._x?._optimisticLane : undefined
      );
      // The replacement source is fully propagated now. If no new flight
      // re-owned self, retire the superseded flight and its dependent copies.
      if (notReady && wasPendingSource && !el._x?._inFlight) settlePendingSource(el);
      // A re-park drops what the earlier pass carried (#3456): a source this
      // pass no longer reaches — its branch switched, or a fresh flight
      // replaced the inputs' pending with its own — stays copied onto
      // dependents that reached it only through here, and its landing walk
      // stops at this node (nothing left to retire) before it finds them. A
      // dependent then waits forever on a flight it has no path to. The
      // re-park twin of the unchanged-value recovery sweep below; dependents
      // with another path keep the source (retryReaches).
      if (notReady && outgoingPendingSources)
        for (const source of outgoingPendingSources)
          if (source !== el && !el._x?._pendingSources?.has(source))
            settlePendingSource(el, source);
      if (reaskChanged) GlobalQueue._repollVerdicts(el);
    }
  } finally {
    tracking = prevTracking;
    latestReadActive = prevLatestRead;
    strictRead = prevStrictRead;
    if (isStaleEffect) stale = prevStale;
    // Consume the missed-wake latch (#3037, set by insertSubs): a dep write
    // landed beneath this pass on a link it had already validated. The wipe
    // below must not key off DIRTY/CHECK — the read-time pull protocol
    // (markNode(c) in read()) marks the running node as part of ordinary
    // bookkeeping, and those marks are correctly discarded here.
    missedWake = (el._flags & REACTIVE_MISSED_WAKE) !== 0;
    // REACTIVE_DISPOSED survives too (#3621): the pass may have disposed its
    // own owner (a memo calling its root's `dispose()`, a cleanup doing so
    // #3601/#3606), and `disposeChildren` set the flag on this node
    // reentrantly. Dropped, the node read as live — `refresh()` re-ran it
    // and `isDisposed()` lied.
    el._flags =
      (el._flags & (REACTIVE_ZOMBIE | REACTIVE_DISPOSED)) |
      (create ? el._flags & REACTIVE_SNAPSHOT_STALE : 0);
    context = oldcontext;
  }
  // The cast re-widens: TS narrowed `stagedEntry` to `null` at the reset
  // above and does not invalidate that across the compute call that
  // `enterStagedRead` runs under. No emitted code.
  const bornHeld = stagedEntry;
  stagedEntry = prevStagedEntry;
  // A node that died during its own pass (#3621) is dead at the end of it,
  // and the pass is void. Its owner's teardown already unlinked its deps,
  // removed it from the heap and ran its cleanups; what remains is what the
  // body did AFTER the `dispose()` call: reads that re-linked the dead node
  // to its sources (unlinked here — the leak that kept it re-running in a
  // torn-down tree), a flight it may have started (retired: the landing
  // checks `_inFlight` identity), and the value it returned. That value is
  // NOT published: a dead node freezes at its last committed value (#3024),
  // so nothing is staged, committed, or propagated to subscribers, and an
  // effect's run is not enqueued (runEffect would refuse it anyway). The
  // attribution frame opened at the top is still closed.
  if (el._flags & REACTIVE_DISPOSED) {
    clearDeps(el);
    if (el._x !== null) el._x._inFlight = null;
    if (attrHooks !== null) attrHooks.recomputeEnd(el, create, false, false, false, false);
    currentOptimisticLane = prevLane;
    return;
  }
  if (!el._x?._error) {
    // Observe-tier fan-in (HUGE_FAN_IN): the validated prefix [_deps.._depsTail]
    // IS this pass's distinct sources — count it here rather than per link. A
    // begin/end bracket around the pass plus a per-link increment measured
    // -5.8% on createRenderEffects:create1to1 (CodSpeed, dev tier) and cost
    // several points of the shape wins elsewhere; this walk is a fraction of
    // the reads that built the list and keeps no module state, so nested
    // pulls need no save/restore. (The stale tail is trimmed at the end of
    // this pass, or at its commit — see recompute's tail.)
    {
      let fanIn = 0;
      for (let d = el._deps; d !== null; d = d._nextDep) {
        fanIn++;
        if (d === el._depsTail) break;
      }
      if (fanIn >= GRAPH_SIZE_WARN_AT) noteFanIn(el, fanIn);
    }
    // INV-11 (#3330): the equality gate compares against the slot this run
    // publishes to. An override-covered node publishes the override; a lane
    // recompute (OPT-dirty) direct-commits `_value` — the lane's own reveal
    // schedule — so a transaction-held `_pendingValue` that already equals
    // the new result is not "unchanged": the screen still shows `_value`.
    // Only a transaction-staged run compares against `_pendingValue`.
    const compareValue = hasOverride
      ? unwrapOverride(el._x?._overrideValue)
      : isOptimisticDirty || el._pendingValue === NOT_PENDING
        ? el._value
        : el._pendingValue;
    let valueChanged = false;
    try {
      valueChanged =
        (!isEffect && wasUninitialized) || !el._equals || !el._equals(compareValue, value);
    } catch (e) {
      // A throwing user comparator is an error of this node's computation.
      // Route it through the same status path as a compute-phase throw so
      // error boundaries contain it; otherwise it unwinds the scheduler
      // flush, bypassing every boundary and wedging the queue (#2837).
      notifyStatus(el, STATUS_ERROR, e);
    }
    // A committed derived change becomes a cause for this node's subscribers,
    // chaining their attribution through this node to the root write.
    if (attrHooks !== null) {
      devChanged = valueChanged && !el._x?._error;
      if (devChanged && !isEffect && !create) attrHooks.derivedChanged(el);
    }
    // Effects use `_equals: false` (no per-effect closure). The side effects that
    // the equals closure used to perform — flagging the effect dirty and enqueueing
    // its runner — happen here instead. `!create` matches the previous `initialized`
    // gate: the explicit recompute(node, true) inside effect() does not enqueue, so
    // effect() can call its runner synchronously for the first run.
    if (isEffect && valueChanged) {
      el._modified = !el._x?._error;
      // Reuse one bound runner per effect — runEffect no-ops on a stale
      // `_modified`, so re-enqueueing the same function is harmless.
      if (!create) {
        el._queue.enqueue(isEffect, (el._boundRunEffect ??= GlobalQueue._runEffect.bind(null, el)));
        // Contested effect (#3322). Effects don't entangle transactions (a
        // shared effect is not shared state), yet they have one value slot:
        // when this write commits under a different transaction
        // (`activeTransition`, null = mainline) than the one that produced the
        // previous value (`_valueTransition`), that view is gone. Rather than
        // merge the two, each commit re-derives the effect against its own
        // committed world (Transition._contested, re-dirtied by
        // finalizePureQueue ahead of the heap run). The previous owner always
        // needs it if still live: its commit is silent (staging already
        // notified) and the value it computed is gone. The new owner needs it
        // too, for the same reason, unless it is mainline — mainline publishes
        // what it computes. A previous owner that was mainline, or already
        // committed, left nothing to protect.
        let prev = el._valueTransition;
        if (prev !== activeTransition) {
          el._valueTransition = activeTransition;
          if (
            prev !== null &&
            (prev = currentTransition(prev)) !== activeTransition &&
            !prev._done
          ) {
            (prev._contested ??= []).push(el);
            if (activeTransition !== null) (activeTransition._contested ??= []).push(el);
          }
        }
      }
    }
    if (el._x?._error);
    else if (valueChanged) {
      const prevVisible = hasOverride ? el._x?._overrideValue : undefined;
      if (
        (create && bornHeld === null) ||
        // Plain sync flush (no transition on either side) commits effect
        // values directly — the pending round-trip (queuePendingNode +
        // commitPendingNodes) exists to sequence transition reveals, and
        // paying it per effect on the plain path is pure overhead.
        // DIRECT_COMMIT effects (resolve/until) commit directly even under
        // their own held transition: their applies deliver on a microtask,
        // not the stashed queues, so a staged value would hand the immediate
        // apply stale state — see CONFIG_DIRECT_COMMIT.
        (isEffect &&
          bornHeld === null &&
          (activeTransition !== el._transition ||
            activeTransition === null ||
            el._config & CONFIG_DIRECT_COMMIT)) ||
        isOptimisticDirty
        // NOTE (stage-3, 2026-08-21): a quiet-world MEMO direct-commit was
        // attempted here and REVERTED — memo staging is load-bearing beyond
        // transitions: mid-batch pulls (latest()/isPending()/read-triggered
        // recomputes before sources commit) must see the fresh value while
        // PLAIN reads stay committed until flush (#3009 purity). The pending
        // round-trip is that separation; it cannot be skipped on any path a
        // pull can reach.
      ) {
        // Lanes stage (#3479): a lane pass on a memo publishes its speculative
        // result as an OVERRIDE — `_value` stays the committed truth, so a
        // reader off the lane (A17's committed view, #3460) sees a whole
        // committed frame: the source's shadow and its derivations together,
        // never a committed shadow beside a speculative memo. The lane's own
        // readers and untracked reads see the override (A17); the revert
        // drops it and re-derives (resolveOptimisticNodes). Effects keep the
        // direct commit — their `_value` is a run result the lane's queues
        // already sequence. Either way the lane pass drops any superseded
        // older hold so its queued commit can't clobber the fresh frame: a
        // hold staged on an earlier, lane-free pass of the SAME transaction
        // is superseded — left in place, the commit published the older
        // frame over the fresh one (#3377). A reversion pass (OPT-dirty with
        // no lane — the override dropped) commits directly: it IS the truth.
        if (isOptimisticDirty && !isEffect && currentOptimisticLane !== null)
          GlobalQueue._laneOverride(el, value, currentOptimisticLane);
        else el._value = value;
        if (isOptimisticDirty) el._pendingValue = NOT_PENDING;
      } else {
        el._pendingValue = value;
        if (bornHeld !== null) {
          // Born held: the pass ran from mainline and derived from this
          // transaction's staged world (enterStagedRead). Its value is the
          // transaction's — staged into it directly, stamped, and committed
          // with it; mainline's batch never sees it. A born-held effect
          // skips its synchronous first run (effect()) and is replayed by
          // the commit like a stale reader that showed the committed frame.
          // (A re-pass under a fresh boundary — the in-flush form — is
          // already the transaction's: restaged, not re-queued.)
          if (el._transition !== bornHeld) {
            el._transition = bornHeld;
            bornHeld._pendingNodes.push(el);
          }
          if (isEffect) bornHeld._gatedSubs.add(el);
          // Under a boundary that has not revealed, a held first value is
          // something not ready under it (#3540): the boundary collects this
          // node as a source and shows its fallback; the source stays
          // collected while born held (CollectionQueue._checkSources) and
          // is released by the commit that initializes it. A boundary that
          // already shows content is not told — it holds like any reader.
          if (underFreshLoadingBoundary(el))
            el._queue.notify(el, STATUS_PENDING, STATUS_PENDING, new NotReadyError(el));
        }
        // A window landing that gets held re-opens the window until the hold
        // commits — the verdict's held-value branch is window-gated (#2990).
        if (wasLoading) el._loading = true;
        // A staged sync recompute is a write path like setSignal/asyncWrite,
        // so sync derivations of held sources stay visible to isPending()/latest()
        // (#2831). Both companion writes are transition-scoped (optimistic) and
        // auto-revert/re-derive at commit. Not gated on an active transition:
        // a plain flush can still become a hold after this recompute — an
        // async memo downstream pends and the batch is adopted into a
        // transaction (scheduler.enterTransition) — and nothing re-derives
        // the companion at adoption, so a memo held that way read
        // isPending() false while its held source read true (#3413).
        if (el._config & CONFIG_HAS_COMPANIONS && GlobalQueue._syncCompanions !== null)
          GlobalQueue._syncCompanions(el, value);
      }
      // insertSubs only walks _subs (no scheduling of its own), so a
      // subscriber-less node has nothing to notify.
      if (
        el._subs !== null &&
        (!hasOverride || isOptimisticDirty || el._x?._overrideValue !== prevVisible)
      )
        insertSubs(el, isOptimisticDirty || hasOverride);
      // A18 supersession, sync twin of asyncWrite's override branch (#3331):
      // this pass published truth that differs from the override (the gate
      // compared against it) into the transaction-held slot. Whether the
      // source is this node's own async or an upstream node it derives from
      // synchronously makes no difference — "the source recomputed". The
      // override stays displayed until the commit; the graph moves to the
      // staged truth now (plain channel, lane demoted). Ordering: "a new
      // value from the source" postdates the override — an override written
      // in this same tick (optimisticWrite stamps `_overrideTime`) is the
      // newer intent over whatever this pass derives from the batch's staged
      // inputs, and is not superseded by it.
      else if (hasOverride && !isOptimisticDirty && el._x._overrideTime !== clock)
        GlobalQueue._supersedeOverride(el, value);
    } else if (hasOverride) {
      // Unchanged value (equals the override) recomputed while the override
      // is active: _value may still be stale, so hold the authoritative value
      // for commit on its own transition's schedule — invisibly (A17/A18).
      if (el._pendingValue === NOT_PENDING) queuePendingNode(el);
      el._pendingValue = value;
      if (wasLoading) el._loading = true; // see the held branch above (#2990)
      // A confirmation after a supersession restores the override as the
      // graph's value and notifies; a plain confirmation wakes only an
      // authoritative-view reader (until()'s predicate, refresh()'s waiter)
      // that observed this node past its override — "authoritative arrival
      // equal to the override" is exactly the acknowledgment it waits for;
      // A17 silence holds for every ordinary subscriber. Both live in the
      // engine's supersedeOverride.
      GlobalQueue._supersedeOverride(el, value);
    } else if (el._height != oldHeight) {
      for (let s = el._subs; s !== null; s = s._nextSub) {
        insertIntoHeapHeight(s._sub, queueFor(s._sub));
      }
    }
    // Silent recovery: errored → unchanged value fires no notification, but
    // dependents still holding the propagated error consumed their dirty flag
    // in an errored run and may sit on stale commits (#2949). Changed-value
    // recoveries ride insertSubs above; a comparator throw re-errored the node
    // (el._x?._error re-set), so this only runs on a genuinely clean recovery.
    if (!valueChanged && !el._x?._error) {
      if (outgoingError !== undefined) settleErroredDependents(el, outgoingError);
      // Self-registration (this node's own superseded flight) is the #3181
      // sweep's business below — retiring it here too would walk twice.
      if (outgoingPendingSources)
        for (const source of outgoingPendingSources)
          if (source !== el) settlePendingSource(el, source);
    }
    // #3181: a synchronous settle supersedes the old landing callback, so
    // recompute owns its pending-source sweep. An uninitialized node without
    // a replacement source still has no truth to reveal and must stay parked.
    if (wasPendingSource && !(el._statusFlags & (STATUS_PENDING | STATUS_UNINITIALIZED))) {
      settlePendingSource(el);
      // The superseded flight will not enter its waiting transactions at
      // landing. Recheck them now so an unchanged value cannot leave their
      // writes parked after the last pending source has settled.
      wakeParked();
    }
  }
  // A REPORTER whose pass stopped reading a source it reported on (a gate
  // closed) stops counting for the transaction waiting on it (A15 / #3426:
  // the hold lasts while a live reporter observes the flight). Nothing else
  // re-judges a parked transaction (see wokenTransitions; the disposal
  // (#3372) and boundary (#3375) twins of this site), so the writes it held
  // stayed staged for as long as the flight stayed up — forever, for one
  // that never lands (fuzzer #3446 P1, spec O3). The event is "this pass
  // dropped a dep" — deps past `_depsTail` (trimmed below, or kept by A30
  // for a staged pass), or a pass that read nothing — not "recovered from
  // pending": a reporter registered by the stale-reader carve-out
  // (heldFromStale, an INITIALIZED source refetching) displays the committed
  // value and is never pending (fuzzer case 79). Every parked transaction,
  // not the reporter's stamp: the transaction waiting on it registered it
  // without stamping it. One idle pass per parked transaction; done ones
  // return at re-entry. Effects only — reporters register from render-effect
  // notification (INV-3).
  // (`_depsTail` was reset at the top of the pass; TS keeps that narrowing.)
  const tail = el._depsTail;
  if (
    isEffect &&
    ((wasPending && !(el._statusFlags & STATUS_PENDING)) ||
      (tail === null ? el._deps !== null : tail._nextDep !== null))
  )
    wakeParked();
  // Dependencies are the committed frame's until it is replaced (A30, #3410; the
  // deps twin of the held children above): a pass that staged its value
  // leaves the previous pass's tail linked for `commitPendingNode` to trim,
  // so a write to a dependency the committed value still derives from
  // reaches this node — and joins its hold if the stage is transaction-held
  // by then (a plain flush decides nothing here: the transaction that holds
  // the pass may open later in the same flush). A pass that published
  // directly (a first pass, a lane's own reveal) trims now. An errored pass
  // (a throw, NotReady included, or a comparator throw above) keeps its full
  // list as before — `_depsTail` marks where it stopped — and the commit
  // skips it by the same `_error`. An effect's frame is the run its value is
  // applied by, not the value slot (#3438): a direct-committed pass that
  // still owes a run (`_modified`) has not replaced what the last run
  // published — the same flush may stash that run into a transaction it
  // opens later — so its tail waits for `runEffect` to trim once the run
  // applies. A pass that changed nothing replaced nothing either (#3469): the
  // same flush may park with its inputs held, and the committed frame still
  // derives from the tail — its trim waits on the flush's verdict (heldTrims).
  // A tracked effect's pass IS its run (it bypasses the heap and runs after
  // the commit): the frame is replaced, trim now.
  if (!el._x?._error && el._pendingValue === NOT_PENDING && !(isEffect && el._modified)) {
    if (create || isOptimisticDirty || isEffect === EFFECT_TRACKED) trimStaleDeps(el);
    else if (el._depsTail?._nextDep ?? el._deps) heldTrims.push(el);
  }
  // Attribution hook: fired before the lane restore so `currentOptimisticLane`
  // still reflects THIS run's posture. The facts distinguish an overlay
  // recompute (optimistic lane, transition replay, transition-held commit)
  // from a plain committed one — the engine must not blame overlay runs as
  // waste or double-count them against plain aggregates.
  if (attrHooks !== null)
    attrHooks.recomputeEnd(
      el,
      create,
      devChanged,
      isOptimisticDirty || currentOptimisticLane !== null,
      activeTransition !== null || el._transition !== null,
      el._pendingValue !== NOT_PENDING
    );
  currentOptimisticLane = prevLane;
  // A parked LANE frame is not a hold (#3662): its drain is the effect's own
  // run, not a commit — the node is neither queued nor stamped for it, and
  // the release below (for transaction zombies) leaves it parked.
  const laneFrame = (el._config & CONFIG_LANE_FRAME) !== 0;
  const needsPendingCommit =
    el._pendingValue !== NOT_PENDING ||
    (!laneFrame &&
      el._x !== null &&
      (el._x._pendingFirstChild !== null || el._x._pendingDisposal !== null)) ||
    (el._statusFlags & (STATUS_PENDING | STATUS_UNINITIALIZED)) !== 0;
  // Override-covered holds (hasOverride) always queue: their commit belongs
  // to their own transition's schedule (A18 re-rule) and is unobservable
  // under the override (A17). Revert no longer commits anything, so an
  // unqueued covered hold would leak (INV-7) once the revert clears
  // _transition.
  //
  // While a pass's result waits on a commit, its children (and `_disposal`)
  // wait with it, and a re-run may tear them down immediately
  // (CONFIG_HELD_CHILDREN, #3404). One exception: a transaction-owned effect
  // recomputed mainline (contested, #3322) published its value directly — a
  // `_pendingValue` left from an earlier held pass is that transaction's,
  // not this one's — so this pass's children are the frame's, and any
  // zombies deferred at the top are superseded on that same frame. Its
  // commit rides the transaction, not this flush: release them here rather
  // than let two generations render at once. A LANE pass is the same case
  // (#3662): it direct-commits ahead of its transaction, so its children are
  // the frame's too. Left flagged for an OLDER frame's zombies, the stamped
  // transaction's same-flush re-run below disposed the lane's freshly built
  // children (an insert's inner effect, its run still queued in the lane)
  // and held their replacements for a commit that never came.
  let held =
    needsPendingCommit &&
    (!create || bornHeld !== null || (el._statusFlags & STATUS_PENDING) !== 0);
  if (held && (!el._transition || hasOverride)) queuePendingNode(el);
  else if (
    held &&
    (activeTransition === null || isOptimisticDirty) &&
    !(el._statusFlags & (STATUS_PENDING | STATUS_UNINITIALIZED))
  ) {
    held = false;
    if (!laneFrame) disposeChildren(el, false, true);
  }
  if (held) el._config |= CONFIG_HELD_CHILDREN;
  else el._config &= ~CONFIG_HELD_CHILDREN;
  // (A born-held pass IS the transaction's staged view — nothing to refresh.)
  if (el._transition && isEffect && activeTransition !== el._transition && bornHeld === null) {
    // The re-run refreshes the transaction's STAGED view (_pendingValue); the
    // value this pass published in _value belongs to the run that just
    // finished. Keep that ownership, or the effect phase parks a
    // mainline-computed value with the transaction (#3412).
    const owner = el._valueTransition;
    runInTransition(el._transition, () => recompute(el));
    el._valueTransition = owner;
  }
  // Missed-wake reschedule (see the finally above): values this pass read
  // before the nested commit are stale, so run again now that the heap will
  // accept the node. Equality gates stop same-value landings from cascading,
  // and a re-run only latches again if another nested commit changes a dep
  // beneath it — convergent unless deps genuinely keep changing.
  if (missedWake) {
    enqueueSub(el);
    schedule();
  }
}
function updateIfNecessary(el) {
  // Never re-enter a node that is currently computing: its dep bookkeeping
  // (_depsTail/_depGen) is live, and a nested recompute would corrupt it.
  // A mid-pass mark stays latched for recompute's own tail to reschedule
  // (#3037); readers meanwhile serve the values the pass has so far.
  // Never recompute a DISPOSED node either: recompute rewrites _flags and
  // would resurrect it (#2983) — readers serve its last value.
  if (el._flags & (REACTIVE_RECOMPUTING_DEPS | REACTIVE_DISPOSED)) return;
  if (el._flags & REACTIVE_CHECK) {
    for (let d = el._deps; d; d = d._nextDep) {
      const dep1 = d._dep;
      const dep = dep1._firewall || dep1;
      if (dep._fn) {
        updateIfNecessary(dep);
      }
      if (el._flags & REACTIVE_DIRTY) {
        break;
      }
    }
  }
  if (
    el._flags & (REACTIVE_DIRTY | REACTIVE_OPTIMISTIC_DIRTY) ||
    (el._x?._error && el._time < clock && !el._x?._inFlight)
  ) {
    recompute(el);
  }
  // The guard above refused an already-disposed node; the recompute it just
  // ran may have disposed it (#3621) — carry the flag, or it comes back alive.
  // The manual-write mask is state, not scheduling (#3612): it says the
  // node's staging is a PROPOSAL, and only the commit (or a later-tick
  // refresh, #3026) lifts it — a pull that recomputed nothing must not, or
  // an isPending()/latest() probe decided whether a later write to a held
  // node was a second proposal or the derivation's `prev`.
  el._flags =
    el._flags &
    (REACTIVE_SNAPSHOT_STALE |
      REACTIVE_IN_HEAP |
      REACTIVE_IN_HEAP_HEIGHT |
      REACTIVE_ZOMBIE |
      REACTIVE_DISPOSED |
      REACTIVE_MANUAL_WRITE);
}
function computed(fn, options) {
  const transparent = options?.transparent ?? false;
  // `in` (not `!== undefined`): an explicit `loadingValue: undefined` on a
  // `T | undefined` node is a real commit #0. The typeof guard tolerates
  // non-object option values that older call shapes force through `as any`.
  const loading = options !== null && typeof options === "object" && "loadingValue" in options;
  // Two literals, one per tier, selected at build time (the observe flag is
  // a literal after replacement; the untaken branch is dead code). The observe
  // literal is the prod literal plus its `_name` slot — a slot in the
  // boilerplate, because a post-construction `self._name = …` forces a
  // hidden-class transition and an out-of-object property store on EVERY node
  // (measured: the whole of the observe tier's creation overhead). Keep the
  // two in sync — the dist artifact test pins observe's key set to prod's
  // plus `_name`.
  const self = {
    id: inheritId(options, transparent, context),
    _config:
      (transparent ? CONFIG_TRANSPARENT : 0) |
      (options?.ownedWrite ? CONFIG_OWNED_WRITE : 0) |
      (!context || options?.lazy ? CONFIG_AUTO_DISPOSE : 0) |
      (options?.sync ? CONFIG_SYNC : 0) |
      (options?._noSnapshot ? CONFIG_NO_SNAPSHOT : 0) |
      // Plumbing is an observe-tier notion (a name and records to
      // withhold); the prod literal never carries the bit.
      (options?._plumbing ? CONFIG_PLUMBING : 0) |
      (snapshotCaptureActive && ownerInSnapshotScope(context) ? CONFIG_IN_SNAPSHOT_SCOPE : 0),
    _equals: options?.equals ?? isEqual,
    _disposal: null,
    _queue: context?._queue ?? globalQueue,
    _context: context?._context ?? defaultContext,
    _childCount: 0,
    _fn: fn,
    _value: loading ? options.loadingValue : undefined,
    _height: 0,
    _nextHeap: undefined,
    _prevHeap: null,
    _deps: null,
    _depsTail: null,
    _depGen: 0,
    _subs: null,
    _subsTail: null,
    _parent: context,
    _nextSibling: null,
    _prevSibling: null,
    _firstChild: null,
    _flags: options?.lazy ? REACTIVE_LAZY : REACTIVE_NONE,
    _statusFlags: loading ? 0 : STATUS_UNINITIALIZED,
    _time: clock,
    _pendingValue: NOT_PENDING,
    _transition: null,
    _notifiedAt: -1,
    _loading: loading,
    _x: null,
    // The slot is always present (hidden class); plumbing leaves it
    // unset, which `ownerPath` skips.
    _name: options?._plumbing ? undefined : (options?.name ?? "computed")
  };
  if (options?.unobserved) ext(self)._unobserved = options.unobserved;
  setupComputedNode(self, options);
  return self;
}
/** Lazily allocate a node's cold extension (ONE shape for signals and
 * computeds — `_x` access stays monomorphic). Installers write through
 * this; hot paths read `el._x?._field` gated by the _config presence bits.
 * Never call ext() just to store a field's default. */
function ext(el) {
  return (el._x ??= {
    _overrideValue: undefined,
    _overrideOwner: undefined,
    _overrideTime: 0,
    _flushedStaged: NOT_PENDING,
    _overrideStamp: 0,
    _optimisticLane: undefined,
    _pendingSignal: undefined,
    _latestValueComputed: undefined,
    _parentSource: undefined,
    _affectsCount: 0,
    _inFlight: null,
    _flightTeardown: null,
    _error: undefined,
    _blocked: undefined,
    _pendingSources: undefined,
    _notifyStatus: undefined,
    _reask: false,
    _child: null,
    _unobserved: undefined,
    _snapshotValue: undefined,
    _pendingDisposal: null,
    _pendingFirstChild: null,
    _companionChildren: undefined
  });
}
/**
 * Build an Effect node with all effect-specific fields baked into a single object literal,
 * so V8 sees the full hidden class shape at construction time. Effects always run in lazy
 * mode (recompute is called explicitly by `effect()`), so we hardcode the lazy bits and skip
 * the auto-dispose CONFIG bit (effect() previously cleared it post-construction).
 */
function createEffectNode(fn, effectFn, errorFn, type, options) {
  const transparent = options?.transparent ?? false;
  // Prod and observe boilerplates — see computed() for why the observe tier
  // gets its `_name` as a literal slot rather than a write after the fact.
  // The default label is the node kind (tracked effects relabel their computed
  // in trackedEffect); the wrappers in signals.ts no longer spread a name into
  // the options to get it.
  const self = {
    id: inheritId(options, transparent, context),
    _config:
      (transparent ? CONFIG_TRANSPARENT : 0) |
      (options?.ownedWrite ? CONFIG_OWNED_WRITE : 0) |
      (options?.sync ? CONFIG_SYNC : 0) |
      (options?._extraConfig ?? 0) |
      (snapshotCaptureActive && ownerInSnapshotScope(context) ? CONFIG_IN_SNAPSHOT_SCOPE : 0),
    _equals: false,
    _disposal: null,
    _queue: context?._queue ?? globalQueue,
    _context: context?._context ?? defaultContext,
    _childCount: 0,
    _fn: fn,
    _value: undefined,
    _height: 0,
    _nextHeap: undefined,
    _prevHeap: null,
    _deps: null,
    _depsTail: null,
    _depGen: 0,
    _subs: null,
    _subsTail: null,
    _parent: context,
    _nextSibling: null,
    _prevSibling: null,
    _firstChild: null,
    _flags: REACTIVE_LAZY,
    _statusFlags: STATUS_UNINITIALIZED,
    _time: clock,
    _pendingValue: NOT_PENDING,
    _transition: null,
    _notifiedAt: -1,
    _loading: false,
    _modified: false,
    _prevValue: undefined,
    _effectFn: effectFn,
    _errorFn: errorFn,
    _cleanup: undefined,
    _type: type,
    _valueTransition: null,
    _x: null,
    _name: options?.name ?? "effect"
  };
  // Effects dispatch status through the SHARED notifier (statusNotifierOf,
  // keyed off _type) — storing it per node forced a full NodeExtension
  // allocation on EVERY effect at creation (an alloc + 19 field stores,
  // +23% effect creation, caught by the creation benches). Only genuinely
  // per-node channels (boundaries) live on _x.
  if (options?.unobserved) ext(self)._unobserved = options.unobserved;
  setupComputedNode(self, lazyOptions);
  return self;
}
/**
 * The shared status notifier for effect nodes, installed once by effect.ts
 * at module evaluation (`this`-dispatched — one function serves every
 * effect, so nodes never store it). Boundary computeds keep their own
 * per-node channel on `_x._notifyStatus`, which takes precedence.
 */
let effectStatusNotify = null;
function setEffectStatusNotify(fn) {
  effectStatusNotify = fn;
}
/** Resolve a node's status notifier: an own `_x` channel (boundaries) wins;
 * effect nodes (`_type` — EFFECT_PURE is 0, and only effect literals carry
 * the field) fall back to the shared notifier. Presence doubles as the
 * "display consumer" membership test in the status walks, exactly as the
 * per-node field did when every effect carried one. */
function statusNotifierOf(el) {
  const own = el._x?._notifyStatus;
  if (own !== undefined) return own;
  return el._type ? (effectStatusNotify ?? undefined) : undefined;
}
const lazyOptions = { lazy: true };
function setupComputedNode(self, options) {
  self._prevHeap = self;
  const parent = context?._root ? context._parentComputed : context;
  if (context && context._config & CONFIG_CHILDREN_FORBIDDEN) {
    emitDiagnostic({
      code: "PRIMITIVE_IN_FORBIDDEN_SCOPE",
      kind: "lifecycle",
      severity: "error",
      message: PRIMITIVE_IN_FORBIDDEN_SCOPE_MESSAGE,
      ownerId: context.id,
      ownerName: context._name
    });
    throw new Error(PRIMITIVE_IN_FORBIDDEN_SCOPE_MESSAGE);
  }
  if (context) linkChild(context, self);
  DEV.hooks.onOwner?.(self);
  if (parent) self._height = parent._height + 1;
  if (GlobalQueue._wireExternalSource !== null) GlobalQueue._wireExternalSource(self);
  !options?.lazy && recompute(self, true);
  if (snapshotCaptureActive && !options?.lazy) {
    if (!(self._statusFlags & STATUS_PENDING) && !(self._config & CONFIG_NO_SNAPSHOT)) {
      ext(self)._snapshotValue = self._value === undefined ? NO_SNAPSHOT : self._value;
      self._config |= CONFIG_HAS_SNAPSHOT;
      snapshotSources.add(self);
    }
  }
}
function signal(v, options, firewall = null) {
  // Prod and observe boilerplates — see computed(). The observe literal adds
  // `_name` and `_owner` (the creating owner, stamped by registerGraph for
  // createSignal nodes so ownerPath can locate signal subjects; null here,
  // and staying null on internal signals — one shape either way).
  const s = {
    _equals: options?.equals ?? isEqual,
    _config:
      (options?.ownedWrite ? CONFIG_OWNED_WRITE : 0) |
      (options?._noSnapshot ? CONFIG_NO_SNAPSHOT : 0),
    _value: v,
    _subs: null,
    _subsTail: null,
    _time: clock,
    _firewall: firewall,
    _nextChild: firewall?._x?._child || null,
    _prevChild: null,
    _pendingValue: NOT_PENDING,
    _transition: null,
    _notifiedAt: -1,
    _x: null,
    _name: options?.name ?? "signal",
    _owner: null
  };
  s._internal = !!firewall;
  if (options?.unobserved) ext(s)._unobserved = options.unobserved;
  if (firewall) linkFirewallChild(firewall, s);
  if (
    snapshotCaptureActive &&
    !(s._config & CONFIG_NO_SNAPSHOT) &&
    !((firewall?._statusFlags ?? 0) & STATUS_PENDING)
  ) {
    ext(s)._snapshotValue = v === undefined ? NO_SNAPSHOT : v;
    s._config |= CONFIG_HAS_SNAPSHOT;
    snapshotSources.add(s);
  }
  return s;
}
// ---------------------------------------------------------------------------
// SLOT SIGNALS (store leaves) — the create-floor diet. Store mounts
// materialize one signal per touched leaf (~13 × rows on dbmon), so per-node
// allocations are mount bytes: the generic path costs an options object, an
// equals closure, an unobserved closure, a NodeExtension to hold it, and
// three post-construction expandos (acc/px/pxv → hidden-class transitions).
// slotSignal bakes everything into ONE literal: `_host`/`_key` backrefs
// replace the closures (equals is a method call — `this` is the node; the
// unobserved sweep dispatches CONFIG_SLOT_NODE to one shared hook), and the
// store's wrap-cache fields are pre-shaped.
/** The shared slot-node unobserved handler — a live binding read directly by
 * the sweep sites (no wrapper frame, no null check: a CONFIG_SLOT_NODE node
 * existing implies the store module loaded and registered the hook). */
let slotUnobservedHook;
/** Install the shared slot-node unobserved handler (store module, once). */
function setSlotUnobserved(fn) {
  slotUnobservedHook = fn;
}
/** Push a new node onto its firewall's child chain (the literal already
 * points `_nextChild` at the old head). Doubly linked so a released leaf
 * unlinks in O(1) — the chain is walked per mark of the projection and
 * would otherwise grow by one node per leaf ever read (#3351). */
function linkFirewallChild(firewall, s) {
  const head = s._nextChild;
  if (head !== null) head._prevChild = s;
  ext(firewall)._child = s;
  firewall._config |= CONFIG_FW_CHILDREN;
}
/** Release a firewall child the store no longer addresses (unobserved sweep
 * dropped it from its target's cache): unlink it from the chain so the
 * projection stops retaining it and its last value. The node keeps its own
 * `_nextChild` so a walk that is mid-chain on it still terminates. It also
 * leaves `_companionChildren` (#3503): the companions themselves are
 * permanent on the node, but the node is unreachable through the store, so
 * the set would only retain it and its last value. */
function unlinkFirewallChild(node) {
  const n = node;
  const fw = n._firewall;
  if (!fw) return;
  const prev = n._prevChild;
  const next = n._nextChild;
  if (prev !== null) prev._nextChild = next;
  else if (fw._x._child === n) fw._x._child = next;
  if (next !== null) next._prevChild = prev;
  n._prevChild = null;
  // #3503: the companion set is the last projection-side reference to a
  // released leaf; leaving it there kept the leaf and its last value alive
  // for the projection's lifetime after every latest()/isPending() reader
  // was disposed.
  fw._x._companionChildren?.delete(n);
}
function slotSignal(v, equals, host, key, acc, firewall = null) {
  // Prod and observe boilerplates — see computed(). The store relabels the
  // observe slot (`store.<key>`) when the attribution engine is installed.
  const s = {
    _equals: equals,
    _config: CONFIG_OWNED_WRITE | CONFIG_SLOT_NODE,
    _value: v,
    _subs: null,
    _subsTail: null,
    _time: clock,
    _firewall: firewall,
    _nextChild: firewall?._x?._child || null,
    _prevChild: null,
    _pendingValue: NOT_PENDING,
    _transition: null,
    _notifiedAt: -1,
    _x: null,
    _host: host,
    _key: key,
    acc,
    px: undefined,
    pxv: undefined,
    _name: "signal"
  };
  s._internal = !!firewall;
  if (firewall) linkFirewallChild(firewall, s);
  if (snapshotCaptureActive && !((firewall?._statusFlags ?? 0) & STATUS_PENDING)) {
    ext(s)._snapshotValue = v === undefined ? NO_SNAPSHOT : v;
    s._config |= CONFIG_HAS_SNAPSHOT;
    snapshotSources.add(s);
  }
  return s;
}
function optimisticSignal(v, options) {
  const s = signal(v, options);
  ext(s)._overrideValue = NOT_PENDING;
  s._config |= CONFIG_OPTIMISTIC;
  return s;
}
function optimisticComputed(fn, options) {
  const c = computed(fn, options);
  ext(c)._overrideValue = NOT_PENDING;
  c._config |= CONFIG_OPTIMISTIC;
  return c;
}
function isEqual(a, b) {
  return a === b;
}
/**
 * When set to a component name string, any reactive read that is not inside a nested tracking
 * scope will log a dev-mode warning. Managed automatically by `untrack(fn, strictReadLabel)`.
 */
let strictRead = false;
/** Dev-only: explicit untrack() nesting, so deliberate post-await reads stay quiet. */
let untrackDepth = 0;
/**
 * Dev-only: > 0 while Solid runs user code that is imperative by construction
 * — an effect callback (effect.ts) or an action body's synchronous slice
 * (action.ts). Both run with no owner, exactly like an async continuation, so
 * the post-await read check (dev.ts) consults this rather than blame the
 * continuation that called flush() or invoked the action. Both sites bracket
 * with try/finally, so a throw cannot leave it raised.
 */
let callbackDepth = 0;
function enterCallback() {
  callbackDepth++;
}
function exitCallback() {
  callbackDepth--;
}
/**
 * Dev-only: > 0 while owner teardown runs cleanups (`_disposal` entries and
 * effect-returned cleanups — owner.ts), for the same reason. Kept apart from
 * `callbackDepth` because its sites cannot use try/finally (the frame would
 * survive into prod): a throwing cleanup leaves it raised, and dev.ts resets
 * it on the next microtask, which teardown — synchronous — never spans.
 */
let disposalDepth = 0;
function enterDisposal() {
  disposalDepth++;
}
function exitDisposal() {
  disposalDepth--;
}
function resetDisposalDepth() {
  disposalDepth = 0;
}
function setStrictRead(v) {
  const prev = strictRead;
  strictRead = v;
  return prev;
}
/**
 * Runs `fn` outside of any reactive tracking — reads inside `fn` will not
 * subscribe the current scope. Returns whatever `fn` returns.
 *
 * Use `untrack` inside a memo or effect when you need to read a signal once
 * without making the surrounding computation depend on its future changes.
 *
 * Pass a `strictReadLabel` string to enable a dev-mode warning: any reactive
 * read inside `fn` that isn't inside a nested tracking scope will log a
 * warning naming the label.
 *
 * @example
 * ```ts
 * createEffect(
 *   () => trigger(),                 // tracks `trigger` only
 *   () => {
 *     const snapshot = untrack(() => state); // read once, untracked
 *     log(snapshot);
 *   }
 * );
 * ```
 */
function untrack(fn, strictReadLabel) {
  if (
    GlobalQueue._externalUntrack === null &&
    !tracking &&
    !strictRead &&
    !strictReadLabel &&
    asyncTailFlights === 0
  )
    return fn();
  const prevTracking = tracking;
  const prevStrictRead = strictRead;
  tracking = false;
  {
    strictRead = strictReadLabel || false;
    untrackDepth++;
  }
  try {
    if (GlobalQueue._externalUntrack !== null) return GlobalQueue._externalUntrack(fn);
    return fn();
  } finally {
    tracking = prevTracking;
    {
      strictRead = prevStrictRead;
      untrackDepth--;
    }
  }
}
/**
 * Set while runtime bookkeeping reads a node inside another node's pass (a
 * loading boundary priming its tree at creation, from whatever pass is
 * mounting it). `context` is that node, but the read is nobody's: the value
 * is probed, never derived from, so nothing the read would normally record
 * on `context` may be recorded — not the untracked-pending re-run link
 * (`read`, `!tracking`; #3528: a boundary's `on` key read this way from
 * `notify` linked the key's source into an unrelated async memo, a cycle that
 * never converged), and not a transaction entry (`enterStagedRead`; #3540: a
 * born-held tree would otherwise pull the mounting pass into the hold).
 */
let spectating = false;
/**
 * Evaluates `fn` untracked, recording nothing on the current `context`: no
 * untracked-pending re-run link, no transaction entry. For bookkeeping reads
 * made on behalf of no node — see `spectating`.
 */
function spectate(fn) {
  const prev = spectating;
  spectating = true;
  try {
    return untrack(fn);
  } finally {
    spectating = prev;
  }
}
/**
 * Bring a computed to a readable state: lazy/disposed nodes are (re)computed;
 * an isPending() probe (`refresh`) additionally pulls the node fully up to
 * date so its status flags reflect the current graph.
 */
function prepareComputed(comp, refresh) {
  if (comp._flags & REACTIVE_LAZY) {
    comp._flags &= ~REACTIVE_LAZY;
    recompute(comp, true);
  } else if (comp._flags & REACTIVE_DISPOSED) {
    // Two disposal lifecycles share the flag (#3024). Observation-lifecycle
    // nodes (CONFIG_AUTO_DISPOSE) are dormant — torn down by unobserved()
    // when the last subscriber left — and reads reawaken them; that is the
    // pay-for-use contract. Owner-lifecycle nodes are dead: recomputing would
    // re-run user code in a torn-down tree (and discard manual writes on
    // derived-writable signals), so reads return the last committed value.
    if (comp._config & CONFIG_AUTO_DISPOSE) {
      const parent = comp._parent;
      if (parent !== null) {
        // A dormant node was off the chain when its owner died, so the strip
        // in disposeChildren missed it: freeze here instead (#3024).
        if (parent._flags & REACTIVE_DISPOSED) {
          comp._config &= ~CONFIG_AUTO_DISPOSE;
          return;
        }
        // A zombie never left its chain: settleAutodispose releases without
        // the !ZOMBIE check its siblings have, so this guard is load-bearing.
        if (!(comp._flags & REACTIVE_ZOMBIE)) linkChild(parent, comp);
      }
      recompute(comp, true);
    }
  } else if (refresh) {
    updateIfNecessary(comp);
  }
}
/**
 * Sentinel returned by readNodeFast when the plain-signal fast path does not
 * apply and the caller must fall back to the full read().
 */
const READ_SLOW = Symbol("read-slow");
/**
 * read()'s plain-signal fast path as a standalone entry for hot callers
 * (store traps). Safe to substitute for read() only because the bail
 * conditions mirror read()'s prelude and fast-path guard exactly: the
 * latestRead and pendingCheck windows run side-effectful hooks before the
 * fast path, `_fn` nodes need prepareComputed, and firewall / override /
 * snapshot / transition / lane / dev-strictRead state all take the full
 * resolution. Anything slow returns READ_SLOW; the caller then calls read().
 */
/**
 * Wake only authoritative-view readers (until() predicates) subscribed to `el`.
 * The A17-silent ack paths — an authoritative arrival equal to the active
 * override — use this so the predicate re-evaluates without re-firing
 * ordinary subscribers whose visible (override) value did not change.
 * Pay-for-use: reached through GlobalQueue._notifyAuthoritativeObservers,
 * installed at first until() call — apps that never use until() shake it.
 */
function notifyAuthoritativeObservers(el) {
  for (let s = el._subs; s !== null; s = s._nextSub) {
    const sub = s._sub;
    if (!(sub._config & CONFIG_AUTHORITATIVE_READ)) continue;
    // Missed-wake latch (#3037), same contract as insertSubs: the reader may
    // itself have pulled this recompute (updateIfNecessary from its own
    // read), and the heap refuses RECOMPUTING nodes — latch so recompute's
    // tail reschedules it with the staged value visible.
    if (sub._flags & REACTIVE_RECOMPUTING_DEPS && s._gen === sub._depGen && s !== sub._depsTail)
      sub._flags |= REACTIVE_MISSED_WAKE;
    enqueueSub(sub);
  }
  schedule();
}
/** Installs the authoritative-reader wakeup hook. Idempotent; called by every
 * creator of a CONFIG_AUTHORITATIVE_READ computation — until() and refresh() —
 * before its first read (same late-binding contract as the optimistic engine;
 * the gating bit is only ever set by such a read, so the `!` call sites are
 * safe once every setter installs, #3303). */
function installAuthoritativeRead() {
  if (GlobalQueue._notifyAuthoritativeObservers === null)
    GlobalQueue._notifyAuthoritativeObservers = notifyAuthoritativeObservers;
}
/**
 * Stale-reader term of the value selections below: a render effect reading a
 * node some OTHER live transaction has staged sees the committed value. The
 * commit is silent — the staging walk was the notification — so a reader
 * that linked AFTER that walk (an effect created during the hold, a store
 * key first read under it) would show the old value past the reveal: record
 * it for the transaction's commit replay (the `_gatedSubs` contract lanes
 * already use). An effect the transaction itself computed re-derives at its
 * commit on its own (parked run, or the contested re-derive, #3322) and is
 * not recorded — replaying it too would publish the frame twice.
 *
 * Flight twin (the pending-branch carve-out): the reader is served the
 * node's committed, pre-flight value and now observes that flight — A15:
 * async work observed by a reader settles as one unit with the writes that
 * asked it — so it joins the transaction's reporters for the node. The
 * reporter the transaction recorded when the flight started may be gone (a
 * keyed remount disposed it, #3374); a completion check that found no live
 * reporter committed the writes ahead of the answer, tearing the new
 * reader's frame (`Count: 1` beside `Details: 0`). Joins an entry the
 * transaction already holds; a flight nobody had observed yet has none (the
 * reader is its first observer — a conditional that just revealed it, #3458)
 * and is notified up the reader's own queue chain under that transaction,
 * the one sanctioned registration site (INV-3): a collecting boundary above
 * the reader consumes it as it would any pending, an unboundaried reader
 * opens the entry — and the transaction, judged complete on its other
 * flights, revealed the inputs beside the reader's pre-flight value
 * otherwise (`Count: 1 | A: 1` beside `B: 0`). A staged signal or a settled
 * node registers nothing. Every reporter dies with its reader
 * (reporterBlocksSource: the read linked it as a dep). The node's own entry
 * is the only one that can matter: a chain's intermediate memo is re-pulled
 * by the read (updateIfNecessary's retry) and enters the transaction, so the
 * reader holds through the normal path; a node with its own flight that is
 * also pending on an upstream re-ask blocks through that flight until it
 * lands, and its landing re-runs the reader into the normal path.
 */
/** The replay half of the stale-of-foreign clause (A15 / A26): a stale reader
 * served the committed value because `txn` holds what it read re-runs at
 * txn's commit, when the value it was denied becomes the frame — unless its
 * own last value already came from that transaction. One registration for
 * the node path (heldFromStale) and the store's backing paths, which have
 * no node to carry the hold (heldFromReader, the adoption hold view). */
function recordStaleReplay(txn, c) {
  const vt = c._valueTransition;
  if (vt == null || currentTransition(vt) !== txn) txn._gatedSubs.add(c);
}
/**
 * The ownership relation (DESIGN-CONSOLIDATION §6, ruled 2026-09-17): is
 * `hold` part of the running pass's world? A plain reader's world is the
 * transaction it runs under, through merges. A lane reader's world is its
 * lane AND the transition that owns the lane — the one asymmetry between a
 * lane and a separate transaction (a lane sees what lands from its parent as
 * its own; a separate transaction would wait for the parent to settle) —
 * see `ownsLane` in lanes.ts, built on this. One relation for the
 * stale-of-foreign clause (heldFromStale), the lane arm (readsHeldCommitted)
 * and the store's backing holds (foreignHold); `serve` has no lane arm of
 * its own, the lane's extra visibility lives here.
 */
function ownsHold(hold) {
  return (
    activeTransition !== null && currentTransition(hold) === currentTransition(activeTransition)
  );
}
function heldFromStale(el, c) {
  const t = el._transition;
  if (t === null || ownsHold(t)) return false;
  const txn = currentTransition(t);
  recordStaleReplay(txn, c);
  const reporters = txn._asyncReporters.get(el);
  if (reporters) reporters.add(c);
  else if (el._statusFlags & STATUS_PENDING)
    runInTransition(txn, () => c._queue.notify(c, STATUS_PENDING, STATUS_PENDING, el._x._error));
  return true;
}
/**
 * A tracked computation about to be served a live transaction's staged value
 * derives from that transaction's world, so it enters the transaction and
 * this pass's result is held with it (A29, #3408). The write side (`setSignal`)
 * and a stamped node's recompute already enter; a reader that only now
 * starts reading the held node — a conditional memo whose branch flipped —
 * was the gap: it published a value derived from the staged world into the
 * mainline frame. Not for a probe (`isPending(() => x())` observes, it does
 * not derive) and a no-op for the ambient batch (`_transition` null) or the
 * transaction already active.
 */
/** The transaction a pass running OUTSIDE a flush was served a staged value
 * from (A29, creation-time form). Inside a flush the pass enters through
 * initTransition; outside one — a memo or effect created from mainline code
 * while a hold is live — entering would leave `activeTransition` and the
 * batch pointed at the transaction for the rest of the synchronous block,
 * so an unrelated write made after the mount was held with someone else's
 * action. The entry is the pass's alone: recompute stages the node into the
 * transaction (born held) and mainline is never touched.
 *
 * A pass under a FRESH loading boundary takes this path inside a flush too
 * (#3540). Born held is right for a plain memo or effect: published, its
 * value would tear the frame. A boundary that has not revealed yet is the
 * exception by definition — its job is to catch what is not ready under it
 * rather than let it hold: the pass is staged into the transaction as
 * above, and the boundary is told (recompute's born-held arm notifies it
 * with a `NotReadyError` sourced at the node) so it shows its fallback now
 * and reveals the staged result at the commit.
 * Entering instead adopted the whole flush into the hold — a `Show` that
 * flipped mainline to mount a `Loading` over a held value waited for the
 * hold with it. A boundary that already shows content keeps the entering
 * path: it has content to keep, and holds like any reader. */
let stagedEntry = null;
/** Is `el` routed to a loading boundary that still shows its fallback — the
 * nearest pending-collecting queue up its chain is uninitialized? (Measured
 * 2026-09-18: relocating the walk behind a `GlobalQueue` slot installed by
 * boundaries.ts saved ~8 B on the core floor and cost boundary-using apps
 * 50–70 B — the indirection's tokens outweigh the walk. Kept inline.) */
function underFreshLoadingBoundary(el) {
  for (let q = el._queue; q !== null; q = q._parent)
    if (q._collectionType & STATUS_PENDING) return !q._initialized;
  return false;
}
function enterStagedRead(el, t = el._transition) {
  if (!t || t === activeTransition || pendingCheckActive) return;
  // A companion (the latest() shadow, the isPending() verdict signal) is the
  // engine's mirror of the flushed world — reading it, or being it, is an
  // observation, not a derivation from the hold: latest(x) never enters x's
  // transaction, and the shadow's own pass never enters either (it would
  // flip activeTransition under the reader that pulled it). (`el` is null for
  // a store backing served under a hold — no node, the transaction is the
  // fold's.)
  if (el?._x?._parentSource || context?._x?._parentSource) return;
  // A bookkeeping read (`spectate`) is nobody's derivation: it compares or
  // probes, and enters nothing — the boundary priming read of a born-held
  // tree must not enter the creator's pass into the hold (#3540).
  if (spectating) return;
  // Verdict machinery (GlobalQueue._verdictPull: companion creation and the
  // latest()/isPending() pulls — the latest() shadow is created before it is
  // marked optimistic, so the bit alone cannot tell) and optimistic nodes
  // (own lane posture, A31) read staged truth by design; they keep the
  // entering path.
  // (`context` is non-null here: every caller selected a value for a reader.)
  const ctx = context;
  const mainline = activeTransition === null && !globalQueue._running;
  // Verdict pulls are observations, not derivations: a latest() /
  // isPending() call from mainline must never enter a transaction (it
  // would capture the rest of the caller's synchronous block).
  if (mainline && GlobalQueue._verdictPull) return;
  if (
    ctx._flags & REACTIVE_RECOMPUTING_DEPS &&
    !(ctx._config & CONFIG_OPTIMISTIC) &&
    (stagedEntry === null || stagedEntry === t) &&
    (mainline || (!GlobalQueue._verdictPull && underFreshLoadingBoundary(ctx)))
  ) {
    stagedEntry = t;
    return;
  }
  globalQueue.initTransition(t);
}
/**
 * Rule 1 (value selection), the full arm: does this reader see a STAGED
 * node's COMMITTED value? One implementation of the rule the fast paths
 * (readNodeFast, read's fast block) carry as their trivial ternary and that
 * every slow site — read's tail, the store's backing selection, the lane and
 * verdict arms — used to restate by hand (docs/DESIGN-CONSOLIDATION.md, move 3b). In order:
 * - no reader at all (an untracked read) — the committed frame;
 * - a reader under an optimistic lane the engine says reads committed
 *   (laneReadsCommitted: another lane's hold, #3460);
 * - nothing staged;
 * - a children-forbidden reader (createTrackedEffect / onSettled: the frame,
 *   never the graph — A32);
 * - a stale reader (render effect) of a FOREIGN transaction's staged write —
 *   committed, no entanglement (heldFromStale registers the replay; a node
 *   born held has no committed frame to fall back to, `noCommitted`);
 * - HELD truth (#3164, CONFIG_HELD_TRUTH) read by a LANE pass: staged
 *   confirming truth — fold-staged onto an armed family, or entangle-stolen
 *   by an awaited until() — is masked from lane passes only, owning
 *   transaction or not. A lane applies its frame display-ahead at the park,
 *   so a lane pass served the truth would paint the confirmation beside the
 *   optimism it confirms (`saving=true` beside the saved row — the #3164
 *   tear); it keeps committed and is re-run by the reveal's post-revert
 *   wake. Every other deriving reader falls through to A29 below: the truth
 *   is a staged value like any other, and the pass that derives from it is
 *   held with it — including the retaining transaction's own passes, which
 *   a superseded override already hands the truth (#3568: masking them
 *   composed the landed `length` with rows still masked to committed).
 *   latest() and authoritative readers (until()'s predicate) tunnel
 *   through — the tunnel that keeps the hold deadlock-free.
 * False means the reader derives from the staged value and enters its
 * transaction (enterStagedRead, A29).
 */
function readerSeesCommitted(el, c, owner, noCommitted) {
  return !!(
    !c ||
    (currentOptimisticLane !== null && GlobalQueue._laneReadsCommitted(el, owner, c)) ||
    el._pendingValue === NOT_PENDING ||
    c._config & CONFIG_CHILDREN_FORBIDDEN ||
    (stale && !noCommitted && heldFromStale(el, c)) ||
    (el._config & CONFIG_HELD_TRUTH &&
      currentOptimisticLane !== null &&
      !latestReadActive &&
      !(c._config & CONFIG_AUTHORITATIVE_READ))
  );
}
/** A28 — set when a node is staged (queuePendingNode) or a held node rewritten
 * (stashHeldRewrite) OUTSIDE a flush; cleared when the next flush begins. The
 * read sites test this one module boolean instead of `globalQueue._running`:
 * inside a flush it is false and the A28 arm costs nothing; outside, only a
 * tick with unflushed writes pays the staged-node check. */
let unflushedStaged = false;
function markUnflushedStaged() {
  unflushedStaged = true;
}
/** A28 — a write becomes visible at flush. Outside a flush, a node holding an
 * AMBIENT staged value (no transaction stamp) was written since the last
 * flush: ambient staging commits at flush end, so nothing else leaves a node
 * in this state; a stamped value is the flushed held world, which A28 says
 * latest() serves. Inside a flush the rule does not apply (A28 (4): promoted
 * within the round). Structural — no marker on the write path. */
function unflushed(el) {
  return unflushedValue(el) !== NOT_PENDING;
}
/** The value an unflushed node serves — the committed value for an ambient
 * write, the flushed staged value for a rewrite of a held node — or
 * NOT_PENDING when nothing is unflushed. Exempt: owned-write nodes (A28 (4):
 * a write issued inside a recompute is promoted at that recompute's end —
 * boundary and loading machinery, until()'s internals, signals declared for
 * in-computation writes) and engine companions (the isPending() verdict
 * signal, the latest() shadow: the system's own writes, made at the source's
 * write to mirror it, installing eagerly — A28, A8). */
function unflushedValue(el, committed = el._value) {
  if (
    globalQueue._running ||
    el._pendingValue === NOT_PENDING ||
    el._config & CONFIG_PROMOTED ||
    el._x?._parentSource
  )
    return NOT_PENDING;
  // Ambient, or adopted by a transaction before any flush carried the staging
  // (CONFIG_ADOPTED_UNFLUSHED): nothing flushed is staged — the committed
  // value answers (the caller's notion of committed: a store node's backing).
  // A held node: unflushed only if rewritten since the last flush (stash).
  if (el._transition === null || el._config & CONFIG_ADOPTED_UNFLUSHED) return committed;
  return el._x === null ? NOT_PENDING : el._x._flushedStaged;
}
/** Held nodes rewritten since the last flush (setSignal); the flush clears
 * their stash — from then on latest() answers with the rewrite. */
const unflushedRewrites = [];
/** Nodes written inside a creation-time recompute (CONFIG_PROMOTED). */
const promotedWrites = [];
/** A28 (5): an optimistic write becomes the ACTIVE override at the flush that
 * carries it. `_overrideTime` is stamped with `clock` at the write and `clock`
 * advances after every flush, so "this tick, outside a flush" is unflushed. */
function unflushedOverride(el) {
  // Companions are optimistic signals written by the engine (see unflushed).
  return !globalQueue._running && el._x?._overrideTime === clock && !el._x?._parentSource;
}
/** Active optimistic override on an armed node (an armed slot idles at
 * NOT_PENDING; undefined = unarmed plain node). The writer's own channels —
 * the draft, `in`/keys inside the setter — compose on this regardless of
 * flush state. */
function hasActiveOverride(el) {
  const x = el._x;
  return x !== null && x._overrideValue !== undefined && x._overrideValue !== NOT_PENDING;
}
/** The override a READER sees: installed, and carried by a flush (A28 (5) —
 * an optimistic write is a write; until its flush no reader sees it). One
 * implementation for read()'s override arm, the verdict channels
 * (latestRead, computePendingState) and the store's selection
 * (docs/DESIGN-CONSOLIDATION.md, move 3b). */
function visibleOverride(el) {
  return hasActiveOverride(el) && !unflushedOverride(el);
}
/** A derivation served the committed value because of an unflushed write
 * (A28) must run again in the flush that carries it — the late-linker case
 * (#3337's reason to defer the walk): it linked after the write walked. */
function markLateLinker(c) {
  // The pass's own tail re-enqueues on this latch (recompute's finally) —
  // a direct enqueue here would be wiped by the pass's flag reset.
  c._flags |= REACTIVE_MISSED_WAKE;
  return true;
}
/** Companion-bearing nodes written outside a flush (setSignal); the flush
 * that carries their writes re-syncs their companions (A28). */
const unflushedCompanions = [];
function resyncUnflushedCompanions() {
  unflushedStaged = false;
  // Length-guarded: the common flush has nothing here, and must allocate nothing.
  // Length-guarded: the common flush has nothing here and allocates nothing.
  if (unflushedRewrites.length !== 0) {
    for (const el of unflushedRewrites) el._x._flushedStaged = NOT_PENDING;
    unflushedRewrites.length = 0;
  }
  if (promotedWrites.length !== 0) {
    for (const el of promotedWrites) el._config &= ~CONFIG_PROMOTED;
    promotedWrites.length = 0;
  }
  if (unflushedCompanions.length !== 0) {
    for (const el of unflushedCompanions)
      GlobalQueue._syncCompanions(
        el,
        el._pendingValue !== NOT_PENDING ? el._pendingValue : el._value
      );
    unflushedCompanions.length = 0;
  }
}
function readNodeFast(el) {
  if (
    latestReadActive ||
    pendingCheckActive ||
    el._fn ||
    el._firewall ||
    el._x?._overrideValue !== undefined ||
    el._x?._snapshotValue !== undefined ||
    activeTransition !== null ||
    currentOptimisticLane !== null ||
    snapshotCaptureActive ||
    // A28: a staged node read outside a flush may serve its committed value;
    // that arm lives on the slow path so this body stays inlinable.
    (unflushedStaged && el._pendingValue !== NOT_PENDING) ||
    strictRead
  )
    return READ_SLOW;
  let c = context;
  if (c?._root) c = c._parentComputed;
  if (c && tracking) link(el, c);
  // Children-forbidden readers (createTrackedEffect / onSettled callbacks) get
  // committed visibility: like the effect half of createEffect and event
  // handlers, effect-phase code never observes its own unsettled write — the
  // write lands in the same flush's continuation (#3006).
  // A stale reader (render effect) recomputing with no transaction active is
  // mainline: a write staged by a live transaction (`_transition` stamped —
  // ambient staging never is) stays masked until that transaction's reveal,
  // the same rule the slow path applies (#3322). Without it a zombie
  // recompute, or a commit-time re-derive of a contested effect, published
  // another transaction's uncommitted value.
  return !c ||
    el._pendingValue === NOT_PENDING ||
    c._config & CONFIG_CHILDREN_FORBIDDEN ||
    (stale && heldFromStale(el, c))
    ? el._value
    : (enterStagedRead(el), el._pendingValue);
}
function read(el) {
  // Handle latest() mode: read from _latestValueComputed
  // Checked before isPending so that isPending(() => latest(x)) checks
  // the _pendingSignal of _latestValueComputed (async in flight) rather
  // than the original node (which stays "pending" while held in a transition).
  if (latestReadActive) return GlobalQueue._latestRead(el);
  if (asyncTailFlights !== 0 && !tracking && untrackDepth === 0 && !pendingCheckActive)
    checkPostAwaitRead(
      el,
      el,
      undefined,
      el._name,
      ((el._firewall || el)._statusFlags & (STATUS_PENDING | STATUS_UNINITIALIZED)) ===
        (STATUS_PENDING | STATUS_UNINITIALIZED)
    );
  let c = context;
  if (c?._root) c = c._parentComputed;
  const computed = el;
  const firewall = el._firewall;
  const owner = firewall || el;
  // Handle isPending() mode: collect pending state while preserving normal read semantics.
  // Probe mode is suspended while preparing the node so nested reads during a
  // recompute don't collect into the probe.
  if (pendingCheckActive) {
    GlobalQueue._pendingCheck(el, c, owner, firewall);
  } else if (typeof computed._fn === "function") {
    prepareComputed(el, false);
  }
  if (
    !computed._fn &&
    owner === el &&
    el._x?._overrideValue === undefined &&
    el._x?._snapshotValue === undefined &&
    activeTransition === null &&
    currentOptimisticLane === null &&
    !snapshotCaptureActive &&
    (!unflushedStaged || el._pendingValue === NOT_PENDING) && // A28, see readNodeFast
    !strictRead
  ) {
    if (c && tracking) link(el, c);
    // Committed visibility for children-forbidden readers and for stale
    // readers of a foreign transaction's staged write — see readNodeFast.
    return !c ||
      el._pendingValue === NOT_PENDING ||
      c._config & CONFIG_CHILDREN_FORBIDDEN ||
      (stale && heldFromStale(el, c))
      ? el._value
      : (enterStagedRead(el), el._pendingValue);
  }
  // The dev component-body safeguard (#2897) must not fire inside an
  // isPending() probe: its plain Error would be swallowed by the probe's
  // catch (which only rethrows NotReadyError), making dev return false where
  // prod propagates NotReady (#2928). Probe reads follow the prod path.
  if (strictRead && !pendingCheckActive && owner._statusFlags & STATUS_PENDING)
    throwPendingUntrackedRead(strictRead, {
      ownerId: c?.id,
      ownerName: c?._name,
      nodeName: owner?._name
    });
  if (c && tracking) {
    link(el, c, pendingCheckActive);
    if (owner._fn) {
      const elQueue = queueFor(el);
      if (owner._height >= elQueue._min) {
        markNode(c);
        markHeap(elQueue);
        updateIfNecessary(owner);
      }
      // Fresh-pull readers (awaitable refresh's waiter) recompute a dirty
      // source inline even when the height gate defers to the flush: the
      // waiter must park on the re-ask's window (or serve its sync answer),
      // never read the PRE-re-ask value as settled. Self-guarded: a clean
      // node no-ops and updateIfNecessary refuses disposed nodes (#2983) —
      // a dead target serves its last value, which is already quiescent.
      else if (c._config & CONFIG_FRESH_READ) updateIfNecessary(owner);
      const height = owner._height;
      // parent check is shallow, might need to be recursive
      if (height >= c._height && el._parent !== c) {
        c._height = height + 1;
      }
    }
  }
  if (owner._statusFlags & STATUS_PENDING) {
    // A reader landing on a pending node throws — the reveal that discovered
    // the flight holds on it (A15: observed async settles as one unit) — with
    // one carve-out: a stale (render) reader of a node pending in some OTHER
    // transaction keeps showing the node's committed value, no entanglement
    // (parallel transactions; the reader is recorded for that transaction's
    // commit replay, `heldFromStale`). The carve-out is sound only while the
    // committed value is coherent with the visible frame, i.e. while the
    // flight's inputs are themselves unpublished: the stamp alone does not
    // say so (it is pending-node bookkeeping), so it is refused when the
    // inputs are on screen — committed by a batch that left the flight in
    // the air (CONFIG_INPUTS_PUBLISHED, #3305) or revealed through a lane
    // (optimistic / latest, #3334) — and the reader holds instead. An
    // UNINITIALIZED node has no committed value to show and holds too
    // (firewall-backed store reads always did; plain memos since the #3043
    // port): falling through served `undefined` as if settled and stranded
    // the reader outside both transactions, so it never re-ran.
    if (
      c &&
      !(
        stale &&
        !(owner._statusFlags & STATUS_UNINITIALIZED) &&
        !(owner._config & CONFIG_INPUTS_PUBLISHED) &&
        !(owner._config & CONFIG_HAS_LANE && GlobalQueue._laneLive(owner)) &&
        heldFromStale(owner, c)
      )
    ) {
      if (c && c._config & CONFIG_CHILDREN_FORBIDDEN) {
        const message =
          "[PENDING_ASYNC_FORBIDDEN_SCOPE] Reading a pending async value inside createTrackedEffect or onSettled will throw. " +
          "Use createEffect instead which supports async-aware reactivity.";
        reportDiagnostic(
          emitDiagnostic(
            {
              code: "PENDING_ASYNC_FORBIDDEN_SCOPE",
              kind: "async",
              severity: "warn",
              message,
              ownerId: c.id,
              ownerName: c._name,
              nodeName: owner?._name
            },
            c
          )
        );
      }
      // Per-lane suspension lives with the engine (a non-null lane implies it
      // is installed): under a lane, only same-lane pending async without an
      // active override throws — plus uninitialized sources regardless of
      // lane (#3276); that check rides laneSuspends so floor bundles don't
      // pay for it.
      if (currentOptimisticLane === null || GlobalQueue._laneSuspends(owner)) {
        // An untracked read of a pending node still re-runs its reader when
        // the node settles — unless nobody is reading (`spectating`, #3528)
        // or the reader is the node itself.
        if (!tracking && !spectating && el !== c) link(el, c);
        throw owner._x?._error;
      }
    } else if (
      !c &&
      owner._statusFlags & STATUS_UNINITIALIZED &&
      // An armed DERIVED override shields the uninitialized state from a
      // read with no reader identity (#3648 follow-up, A18 (d)): a memo
      // whose first landing rode its lane (asyncWrite's lane branch →
      // `laneOverride`) has no `_value` — the flag stays set until the lane's
      // commit promotes the override — yet the override IS the displayed
      // value of a pending node (A18 (c), the screen keeps it until the
      // commit), exactly as an initialized node re-deriving under its override
      // displays it. "Uninitialized must suspend" (#3276, A19 exception 1) was
      // written for a node with NOTHING to show; this node has the override.
      // The arm fires in the body-end window: the source override superseded
      // (A18 body-end, #3427), the memo re-deriving on the plain channel and
      // held, its own slot still armed. Fall through to serve()'s override
      // arm. Readers WITH identity are untouched: a tracked lane reader keeps
      // the override (A17), an off-lane one suspends (#3651, `overrideRead`).
      !(hasActiveOverride(el) && el._config & CONFIG_DERIVED_OVERRIDE)
    ) {
      throw owner._x?._error;
    }
  }
  // `owner` is the computed itself, or the firewall behind a store node —
  // firewall-backed reads follow the same rules (memo parity, #2897 ruling):
  // an errored derive throws for every late reader instead of silently
  // serving node values (the seed, or last-good data after a failed refetch).
  if (owner._fn && owner._statusFlags & STATUS_ERROR) {
    // Only a genuine reactive re-read may retry an errored async source:
    // - tracking: owned/tracked scope only (never events / `untrack` / effect side-effect phase)
    // - !pendingCheckActive: an `isPending` probe observes the error, never refetches
    // - owner._time < clock: only on a later cycle than the one the error was found
    if (tracking && !pendingCheckActive && owner._time < clock) {
      recompute(owner);
      return read(el);
    } else throw owner._x?._error;
  }
  // Ahead of the snapshot serve below: a component body's direct read is
  // wrong in the same way whether the pass is hydrating or not, and the
  // hydration pass is the console nobody is watching (#3675).
  if (strictRead)
    warnStrictReadUntracked(strictRead, {
      ownerId: c?.id,
      ownerName: c?._name,
      nodeName: owner?._name
    });
  if (snapshotCaptureActive && c && c._config & CONFIG_IN_SNAPSHOT_SCOPE) {
    const sv = el._x?._snapshotValue;
    if (sv !== undefined) {
      const snapshot = sv === NO_SNAPSHOT ? undefined : sv;
      const current = el._pendingValue !== NOT_PENDING ? el._pendingValue : el._value;
      if (current !== snapshot) c._flags |= REACTIVE_SNAPSHOT_STALE;
      return snapshot;
    }
  }
  const value = serve(el, c, owner, el._value);
  if (
    !c &&
    owner === el &&
    typeof computed._fn === "function" &&
    el._config & CONFIG_AUTO_DISPOSE &&
    !(owner._statusFlags & STATUS_PENDING) &&
    !el._subs &&
    // An untracked read served a visible override returned before this
    // sweep registration when the arm was inline; keep that.
    !visibleOverride(el)
  ) {
    // Deferred, not inline (#3078): an inline unobserved() here made untracked
    // reads destructive — dispose on this read, full revival recompute on the
    // next — so consecutive reads could answer differently with no write in
    // between (the revival samples the ambient transition/lane context).
    // The sweep at flush finalization re-validates and reclaims; schedule()
    // guarantees that flush happens even if nothing else is queued.
    dormantNodes.add(el);
    schedule();
  }
  return value;
}
/**
 * Rule 1, the one slow implementation (DESIGN-CONSOLIDATION move 3b, step
 * 6c): the value a reader `c` (null = untracked, no pass) is served from
 * `el`, whose committed value is `committed` — the node's own `_value` for
 * a signal or memo, the BACKING for a store property node (single-home rule,
 * O6: committed truth lives in the backing and a node's `_value` is never
 * served for one). Called by read()'s slow tail and by the store's untracked
 * node path (nodeValue); the fast paths (readNodeFast, read's fast block)
 * keep their trivial ternary by design (perf, see the doc). Arms, in order:
 * - the override (A17), routed through the engine for a tracked reader under
 *   a lane or a supersession (A18), an authoritative reader marked instead;
 * - the lane entanglement gate (committed, recorded for replay);
 * - a node born held has nothing for an untracked reader (A19 exception 1);
 * - an unflushed write serves committed and re-runs the reader in the
 *   carrying flush (A28);
 * - readerSeesCommitted, else the staged value and the transaction (A29).
 */
function serve(el, c, owner, committed) {
  if (hasActiveOverride(el)) {
    // A17: the override IS the value for every reader — except an authoritative
    // reader (until()'s predicate carries CONFIG_AUTHORITATIVE_READ): it must
    // observe independently-arriving truth, and serving it the caller's own
    // tentative write would trivially satisfy the predicate. The bit is checked
    // on the reading computation itself, so a shared computed the predicate
    // pulls recomputes as ITSELF (context = the memo, no bit) under the normal
    // view. Fall through to normal value selection (staged `_pendingValue` is
    // authoritative — optimism never lives there); the sticky mark makes the
    // A17-silent "landing equals override" paths notify this node's subs so
    // the reader re-runs when truth arrives.
    // A28 (5): an optimistic write written this tick, outside a flush, is not
    // yet the active override — fall through to the normal selection (the
    // authoritative mark below still applies: until() must wake on landing).
    if (!(c && c._config & CONFIG_AUTHORITATIVE_READ) && !unflushedOverride(el)) {
      // A tracked read of an override is the engine's selection (a lane or a
      // supersession implies the engine): a render effect OFF the override's
      // held lane sees the committed value (#3460, lanes mirror transitions);
      // a node whose own source answered with a DIFFERENT value hands a
      // tracked reader the staged truth (A18 supersession, #3331). Untracked
      // reads display the override.
      if (c && el._config & (CONFIG_HAS_LANE | CONFIG_OVERRIDE_SUPERSEDED))
        return GlobalQueue._overrideRead(el, c);
      return unwrapOverride(el._x?._overrideValue);
    }
    el._config |= CONFIG_AUTHORITATIVE_OBSERVED;
  }
  // Entanglement gate: a reader recomputing under an optimistic lane that reads
  // a pending mid-transition write sees the committed value. Projection-store
  // manual writes use the firewall's manual-write flag to opt into this path.
  // Async drivers are not under an optimistic lane and so bypass this, reading
  // _pendingValue for correct fetching. The sub is recorded for replay at commit
  // so it re-runs with the new committed view. (Gate details live with the
  // engine — a non-null lane implies it is installed.)
  if (
    currentOptimisticLane !== null &&
    activeTransition !== null &&
    c !== null &&
    GlobalQueue._gatedRead(el, owner, c)
  ) {
    return committed;
  }
  // In optimistic lane context, return _value for optimistic/lane-assigned signals
  // and for regular signals in stale mode (render effects). Non-stale readers (user
  // effects) see _pendingValue so that latest() and direct reads stay consistent.
  // (The lane-context clause lives with the engine.) Children-forbidden readers
  // (createTrackedEffect / onSettled callbacks) get committed visibility — see
  // readNodeFast (#3006).
  // A node born held (recompute) has a staged value and no committed one: a
  // stale reader cannot fall back to the committed frame, so it takes the
  // staged value and enters like a tracked reader (A29); an untracked reader
  // has nothing to serve and holds (A19 exception 1) — a bookkeeping read
  // (`spectate`) likewise: it derives nothing, so it cannot enter, and a
  // held-only value is simply not ready to it.
  const noCommitted =
    el._pendingValue !== NOT_PENDING && (el._statusFlags & STATUS_UNINITIALIZED) !== 0;
  if (noCommitted && (!c || spectating)) throw new NotReadyError(null);
  const u = c && unflushedStaged ? unflushedValue(el, committed) : NOT_PENDING;
  if (u !== NOT_PENDING) {
    markLateLinker(c);
    if (pendingCheckActive) GlobalQueue._recordFresh(el, u);
    return u;
  }
  const value = readerSeesCommitted(el, c, owner, noCommitted)
    ? committed
    : (enterStagedRead(el), el._pendingValue);
  // Record that this isPending() probe observed the fresh pending value, so
  // the probe doesn't pair "pending" with the new value (#2831).
  if (pendingCheckActive) GlobalQueue._recordFresh(el, value);
  return value;
}
/**
 * Store-rewrite setter guard: the rewrite parks writes in a pending backing
 * (no setSignal at write time), so the owned-scope write protection must
 * fire at the setter entry instead. Exactly setSignal's guard condition
 * minus the node-specific exemptions (ownedWrite/firewall), which don't
 * apply to plain store setters. Roots are NOT exempt (#3500): a root body is
 * tree construction — every dev component body, every context Provider, the
 * top of `render()`, and the whole SSR pass run directly under one — and a
 * write there re-runs what already read the old value (or on the server,
 * can't). Same rule as setSignal, which never exempted roots.
 */
function devGuardStoreSetterWrite() {
  if (context && !(context._config & CONFIG_CHILDREN_FORBIDDEN)) {
    emitDiagnostic({
      code: "REACTIVE_WRITE_IN_OWNED_SCOPE",
      kind: "write",
      severity: "error",
      message: REACTIVE_WRITE_IN_OWNED_SCOPE_SIGNAL_MESSAGE,
      ownerId: context.id,
      ownerName: context._name,
      data: { operation: "setStore" }
    });
    // the owner name reaches the THROWN message too, not just the
    // diagnostics channel apps don't subscribe to by default (#3157)
    throw new Error(ownedScopeWriteMessage(context));
  }
}
/**
 * Store setter result guard: the callback's return has one meaning — a
 * replacement root to adopt — and a thenable can never be that. It is the
 * signature of `setStore(async d => …)` (or a sync arrow whose helper is
 * async): only the writes before the first `await` were in the transaction;
 * the rest land on a closed draft and vanish. Setters are synchronous
 * transactions; async orchestration is `action()`'s job. Store-specific —
 * a signal may legitimately hold a promise, so its setter has no such rule.
 */
function devGuardStoreSetterResult(result) {
  if (result == null) return;
  if (
    (typeof result === "object" || typeof result === "function") &&
    typeof result.then === "function"
  ) {
    emitDiagnostic({
      code: "ASYNC_STORE_SETTER",
      kind: "write",
      severity: "error",
      message: ASYNC_STORE_SETTER_MESSAGE,
      ownerId: context?.id,
      ownerName: context?._name,
      data: { operation: "setStore" }
    });
    throw new Error(ASYNC_STORE_SETTER_MESSAGE);
  }
}
function ownedScopeWriteMessage(owner) {
  const name = owner._name;
  return name
    ? `${REACTIVE_WRITE_IN_OWNED_SCOPE_SIGNAL_MESSAGE} (in ${name})`
    : REACTIVE_WRITE_IN_OWNED_SCOPE_SIGNAL_MESSAGE;
}
/** A28 — a rewrite of a HELD node outside a flush keeps the staged value the
 * last flush left, for latest()/verdicts, until the next flush carries it
 * (stash, cleared at that flush). Cold: only stamped nodes reach here. */
function stashHeldRewrite(el) {
  if (globalQueue._running) return;
  const x = ext(el);
  if (x._flushedStaged === NOT_PENDING) {
    x._flushedStaged = el._pendingValue;
    unflushedRewrites.push(el);
    unflushedStaged = true;
  }
}
/** A28 (4) — written inside a recompute that runs OUTSIDE a flush (a
 * creation-time compute): promoted at that pass's end, visible to the rest of
 * the block. Cold: only contextual writes reach here. */
function notePromotedWrite(el) {
  if (globalQueue._running || el._config & CONFIG_PROMOTED) return;
  el._config |= CONFIG_PROMOTED;
  promotedWrites.push(el);
}
/** Cold half of setSignal's snapshot arm (see there): first write during
 * capture to a plain signal without a live snapshot records the pre-write
 * value. Only plain user signals qualify. Computeds reach setSignal from an
 * async landing (asyncWrite), and a value arriving from async during the pass
 * REVEALS — the creation-time arm skips pending computeds for the same
 * reason. Firewall leaves belong to a projection whose compute is the tree's
 * own work, captured (or deliberately not) at creation. */
function captureWriteSnapshot(el, current) {
  if (
    el._config & CONFIG_NO_SNAPSHOT ||
    el._fn !== undefined ||
    el._firewall ||
    el._x?._snapshotValue !== undefined
  )
    return;
  ext(el)._snapshotValue = current === undefined ? NO_SNAPSHOT : current;
  el._config |= CONFIG_HAS_SNAPSHOT;
  snapshotSources.add(el);
}
function setSignal(el, v) {
  if (
    !(el._config & CONFIG_OWNED_WRITE) &&
    !(context && context._config & CONFIG_CHILDREN_FORBIDDEN) &&
    context &&
    el._firewall !== context
  ) {
    emitDiagnostic({
      code: "REACTIVE_WRITE_IN_OWNED_SCOPE",
      kind: "write",
      severity: "error",
      message: REACTIVE_WRITE_IN_OWNED_SCOPE_SIGNAL_MESSAGE,
      ownerId: context.id,
      ownerName: context._name,
      nodeName: el._name,
      data: { operation: "setSignal" }
    });
    throw new Error(ownedScopeWriteMessage(context));
  }
  // A write to a held node is a second proposal on a contested node (A34, #3494):
  // the writer's tick reveals with the hold, the same value or another. Inside
  // a flush the round enters now; from mainline the entry waits for the next
  // flush's start (batchJoins) — entering here left activeTransition set for
  // the rest of the caller's block, so a memo created after the write became
  // the transaction's instead of mainline's (A28, A29). Before the equality
  // gate below: repeating the held value proposes it too — and that repeat
  // leaves through the gate, so the join schedules its own flush here; left
  // for the next flush to find, it adopted an unrelated tick (#3519 review).
  // A held DERIVATION is not a proposal (A34 amendment, #3612): the user
  // setters of derived nodes (setMemo, the derived store's setter) classify
  // the write before it reaches here — see heldDerivation — and re-derive
  // under the hold instead of masking; the join stands either way.
  if (el._transition && activeTransition !== el._transition) {
    if (globalQueue._running) globalQueue.initTransition(el._transition);
    else {
      batchJoins.push(el._transition); // dupes: a bare return in initTransition
      schedule();
    }
  }
  // The optimistic write path lives with the engine: only optimisticSignal /
  // optimisticComputed callers and optimistic store nodes carry an
  // _overrideValue slot (flagged by CONFIG_OPTIMISTIC — a masked read of the
  // always-present config instead of a missing-property probe), and every
  // module that installs one installs the engine first.
  if (el._config & CONFIG_OPTIMISTIC) {
    if (!projectionWriteActive) return GlobalQueue._optimisticWrite(el, v);
    // An authoritative store landing on an override-covered node: the store
    // twin of asyncWrite's override branch, decided by the engine (#3331).
    const o = el._x?._overrideValue;
    if (o !== undefined && o !== NOT_PENDING) return GlobalQueue._landOnOverride(el, v);
  }
  const currentValue = el._pendingValue === NOT_PENDING ? el._value : el._pendingValue;
  if (typeof v === "function") v = v(currentValue);
  // Uninitialized check first: the first commit has no previous value, so the
  // user comparator must not run against `undefined` (matches recompute).
  const valueChanged =
    !!(el._statusFlags & STATUS_UNINITIALIZED) || !el._equals || !el._equals(currentValue, v);
  if (!valueChanged) return v;
  // Attribution hook: this committed write is where a re-run chain begins.
  if (attrHooks !== null) attrHooks.write(el, currentValue, v);
  // A write during hydration's snapshot capture to a source that has no
  // snapshot — created BEFORE capture began (module-level state: an identity
  // minted from onSettled in the pass, a preference read from storage) —
  // captures the pre-write value now, so the write is held like any other:
  // in-scope readers keep serving what the server rendered with and replay
  // at release. Left uncaptured, the write cascades live through a claim
  // pass whose DOM writes are skipped, and a component rendered later in the
  // pass reads a value the server never had. Store leaves written here are
  // plain signals and qualify the same way.
  if (snapshotCaptureActive) captureWriteSnapshot(el, currentValue);
  const wasStaged = el._pendingValue !== NOT_PENDING;
  if (!wasStaged) queuePendingNode(el);
  // A28 arms, gated on the loads the write already pays for (a plain ambient
  // rewrite outside a flush — the write-loop shape — costs `_transition` and
  // `context` here and nothing else; the arms themselves are cold helpers so
  // setSignal stays within every setter's inlining budget, ~300 B bytecode).
  else if (el._transition !== null) stashHeldRewrite(el);
  el._pendingValue = v;
  if (context !== null) notePromotedWrite(el);
  // syncCompanions only pokes _pendingSignal/_latestValueComputed — with
  // neither companion present the call is a guaranteed no-op (companions are
  // only ever created, never removed, and creating one installs the hook and
  // sets CONFIG_HAS_COMPANIONS — one masked read replaces two optional-field
  // probes on every write).
  if (el._config & CONFIG_HAS_COMPANIONS && GlobalQueue._syncCompanions !== null) {
    GlobalQueue._syncCompanions(el, v);
    // A28 (2): the verdict computed here is the PRE-flush one (an unflushed
    // write is not pending); the flush that carries the write re-syncs so
    // the companions mirror the flushed world. Only companion nodes pay.
    if (!globalQueue._running) unflushedCompanions.push(el);
  }
  // _time is a computed-only slot (§12e): writing it on a signal would fork
  // the lean shape. Every read site is computed-typed.
  if (el._fn !== undefined) el._time = clock;
  // Staged-rewrite fast path (§12d): a re-write to a node whose subscribers
  // were already walked — and where nothing has recomputed or linked since
  // (epoch) — re-stages the value and stops. The walk is idempotent (subs
  // marked, heap entries flag-guarded, effects queued once); lane and reask
  // contexts change what a walk MEANS, so they always walk.
  if (wasStaged && el._notifiedAt === notifyEpoch && currentOptimisticLane === null && !reaskArmed)
    return v;
  insertSubs(el);
  schedule();
  return v;
}
/**
 * Suppresses automatic recomputation of `el` until the scheduler drains. Used
 * when a manual write should win over dependency changes queued in the same
 * tick. The MANUAL_WRITE flag is cleared by the pending-node drain; projection
 * computeds don't commit values, but they still need the same end-of-tick
 * cleanup point.
 */
function suppressComputedRecompute(el) {
  deleteFromHeap(el, queueFor(el));
  if (!(el._flags & REACTIVE_MANUAL_WRITE) && el._pendingValue === NOT_PENDING) {
    queuePendingNode(el);
    schedule();
  }
  el._flags = (el._flags & -4) | REACTIVE_MANUAL_WRITE;
  el._manualWriteTime = clock;
}
/** A34 amendment (#3612) — is `el`'s staging a DERIVATION another transaction
 * holds: stamped by a transaction that is not the writer's, and not a manual
 * proposal (the mask, on the node or — a store leaf — its firewall)? #2692's
 * "manual write wins" is a rule for one synchronous frame; across a hold the
 * held pass result is nobody's proposal, and a user setter reaching it
 * composes on the committed frame it was written against and becomes `prev`
 * for the transaction's re-derivation (rederiveHeld) instead of replacing it.
 * Writes made under the holding transaction masked the node and keep
 * A34(1)'s last-write-wins. Only the user setters ask; an async landing or a
 * companion writing a stamped node is the transaction's own work. */
function heldDerivation(el) {
  return (
    el._transition !== null &&
    activeTransition !== el._transition &&
    !((el._firewall || el)._flags & REACTIVE_MANUAL_WRITE)
  );
}
/** The held-derivation write's second half: the node re-derives under its
 * hold with the written staging as the pass's `prev`. Nothing is masked. The
 * write took the A34 join (setSignal), which scheduled the flush that drains
 * this; recompute re-enters the stamp. */
function rederiveHeld(el) {
  el._flags |= REACTIVE_DIRTY; // over CHECK: the heap visit recomputes, not re-checks
  enqueueSub(el);
}
/**
 * User-facing setter for the memo form of `createSignal(fn)`. Behaves like
 * `setSignal`, but also cancels any pending recompute of the memo so the
 * manual value wins over a value that would otherwise be produced by an
 * upstream change in the same tick. Across a hold the write is not a
 * proposal: a memo another transaction holds as a pass result composes on the
 * committed value and re-derives under the hold with the write as `prev`
 * (A34 amendment, #3612; heldDerivation).
 */
function setMemo(el, v) {
  const held = heldDerivation(el);
  if (held && typeof v === "function") v = v(el._value);
  const result = setSignal(el, v);
  held ? rederiveHeld(el) : suppressComputedRecompute(el);
  return result;
}
/**
 * Executes `fn` with the given `owner` set as the current owner. Any reactive
 * primitives (`createSignal`, `createMemo`, `createEffect`, `onCleanup`,
 * `cleanup`, etc.) created inside `fn` are attached to that owner, so they
 * are disposed when the owner is disposed.
 *
 * The classic pattern: capture the current owner with `getOwner()` inside a
 * component, then re-enter it from a callback (event handler, async resolve,
 * setTimeout) so disposables created in the callback get cleaned up with the
 * component.
 *
 * @example
 * ```ts
 * function delayed<T>(ms: number, fn: () => T) {
 *   const owner = getOwner();
 *   setTimeout(() => runWithOwner(owner, fn), ms);
 * }
 * ```
 */
function runWithOwner(owner, fn) {
  if (owner && owner._flags & REACTIVE_DISPOSED) {
    const message =
      "[RUN_WITH_DISPOSED_OWNER] runWithOwner called with a disposed owner. Children created inside will never be disposed.";
    reportDiagnostic(
      emitDiagnostic(
        {
          code: "RUN_WITH_DISPOSED_OWNER",
          kind: "owner",
          severity: "warn",
          message,
          ownerId: owner.id,
          ownerName: owner._name
        },
        owner
      )
    );
  }
  const oldContext = context;
  const prevTracking = tracking;
  context = owner;
  tracking = false;
  try {
    return fn();
  } finally {
    context = oldContext;
    tracking = prevTracking;
  }
}
function staleValues(fn, set = true) {
  const prevStale = stale;
  stale = set;
  try {
    return fn();
  } finally {
    stale = prevStale;
  }
}
/**
 * Core marking half of `refresh()` (the public wrapper lives in signals.ts —
 * it validates the target, marks through here, then builds the quiescence
 * promise on the resolve()/until() effect machinery). Flags the node's next
 * recompute as a quiet re-ask and schedules it; no-ops for non-derived or
 * disposed targets and for same-tick manual writes.
 */
function markRefresh(node) {
  if (
    context &&
    !((node._config ?? 0) & CONFIG_OWNED_WRITE) &&
    !(context._config & CONFIG_CHILDREN_FORBIDDEN)
  ) {
    emitDiagnostic({
      code: "REACTIVE_WRITE_IN_OWNED_SCOPE",
      kind: "write",
      severity: "error",
      message: REACTIVE_WRITE_IN_OWNED_SCOPE_REFRESH_MESSAGE,
      ownerId: context.id,
      ownerName: context._name,
      nodeName: node._name,
      data: { operation: "refresh" }
    });
    throw new Error(REACTIVE_WRITE_IN_OWNED_SCOPE_REFRESH_MESSAGE);
  }
  if (typeof node._fn === "function" && !(node._flags & REACTIVE_DISPOSED)) {
    if (node._flags & REACTIVE_MANUAL_WRITE) {
      // A manual write in the CURRENT tick wins over the refresh (#2692).
      // A mask stamped in an earlier tick only survives because a
      // transaction (action) is holding the pending drain open; there the
      // refresh is a later, explicit re-ask and lifts the mask — otherwise
      // any setStore early in an action silently swallows every refresh()
      // for the rest of the transaction (#3026).
      if (node._manualWriteTime === clock) return;
      node._flags &= ~REACTIVE_MANUAL_WRITE;
      // The lift falls through to the re-ask classification below. The held
      // write's value change already rides the transaction; the refetch it
      // asks for is the same question with unchanged inputs. Skipping the
      // mark here classified that refetch as a NEW question, which pends
      // every leaf (3.1) — an action doing setStore + yield + refresh(store)
      // lit up every sibling row, and affects() could not narrow it (a mark
      // only turns pending on). Same-question motion stays silent (3.4);
      // the written slot and any declared mark carry the pending instead.
    }
    // A refresh with no value-change dirt already queued is a re-ask of the
    // same question: mark it so the recompute classifies any resulting
    // pending window as quiet (not pending). If the node is already dirty
    // from a real input change, the question changed — don't mark.
    // REACTIVE_IN_HEAP counts as dirt: insertSubs schedules subscribers by
    // heap insertion alone (no DIRTY/CHECK flag), so a same-batch value
    // change followed by refresh() must not be laundered into a quiet re-ask.
    if (!(node._flags & (REACTIVE_DIRTY | REACTIVE_CHECK | REACTIVE_IN_HEAP))) {
      node._flags |= REACTIVE_REASK;
      armReaskClear();
    }
    node._flags = (node._flags & ~REACTIVE_CHECK) | REACTIVE_DIRTY;
    // A refresh() self-invalidation is a root cause too — the target's next
    // run has no changed dep to point at, so it points here instead.
    if (attrHooks !== null) attrHooks.refreshed(node);
    insertIntoHeap(node, queueFor(node));
    schedule();
  }
}

export {
  insertIntoHeap as $,
  laneHeld as A,
  CONFIG_AUTHORITATIVE_OBSERVED as B,
  ContextNotFoundError as C,
  findLane as D,
  EFFECT_RENDER as E,
  sourceObserved as F,
  GlobalQueue as G,
  resolveLane as H,
  stale as I,
  readsHeldCommitted as J,
  currentOptimisticLane as K,
  enterStagedRead as L,
  currentTransition as M,
  NoOwnerError as N,
  OVERRIDE_UNDEFINED as O,
  assignOrMergeLane as P,
  queuePendingNode as Q,
  REACTIVE_DIRTY as R,
  STATUS_UNINITIALIZED as S,
  latestReadActive as T,
  REACTIVE_MANUAL_WRITE as U,
  REACTIVE_OPTIMISTIC_DIRTY as V,
  LANE_RUN as W,
  attrHooks as X,
  EFFECT_USER as Y,
  REACTIVE_DISPOSED as Z,
  dispose as _,
  setSignal as a,
  CONFIG_AUTHORITATIVE_READ as a$,
  queueFor as a0,
  visibleOverride as a1,
  unflushedValue as a2,
  context as a3,
  REACTIVE_RECOMPUTING_DEPS as a4,
  markLateLinker as a5,
  prepareComputed as a6,
  tracking as a7,
  link as a8,
  enqueueSub as a9,
  staleValues as aA,
  CONFIG_AUTO_DISPOSE as aB,
  CONFIG_CHILDREN_FORBIDDEN as aC,
  EFFECT_TRACKED as aD,
  setEffectCallback as aE,
  enterCallback as aF,
  exitCallback as aG,
  setTrackedQueueCallback as aH,
  _hitUnhandledAsync as aI,
  resetUnhandledAsync as aJ,
  setOrigin as aK,
  isThenable as aL,
  actionStepDepth as aM,
  flush as aN,
  enterActionStep as aO,
  exitActionStep as aP,
  ROOT_ERROR_HOOK as aQ,
  registerGraph as aR,
  runWithOwner as aS,
  setMemo as aT,
  dirtyQueue as aU,
  $REFRESH as aV,
  installAuthoritativeRead as aW,
  markRefresh as aX,
  createRoot as aY,
  getObserver as aZ,
  CONFIG_DIRECT_COMMIT as a_,
  setLatestReadActive as aa,
  setContextInternal as ab,
  optimisticComputed as ac,
  CONFIG_HAS_COMPANIONS as ad,
  unflushed as ae,
  CONFIG_ADOPTED_UNFLUSHED as af,
  CONFIG_CHILD_COMPANIONS as ag,
  runAsTransitionBatch as ah,
  unflushedCompanions as ai,
  setPendingCheckActive as aj,
  setStrictRead as ak,
  strictRead as al,
  optimisticSignal as am,
  activeAffectsMarks as an,
  pendingCheckActive as ao,
  STATUS_ERROR as ap,
  setEffectStatusNotify as aq,
  unwrapStatusError as ar,
  haltReactivity as as,
  StatusError as at,
  trimStaleDeps as au,
  createEffectNode as av,
  recompute as aw,
  reportDiagnostic as ax,
  emitDiagnostic as ay,
  computed as az,
  NOT_PENDING as b,
  isExcluded as b$,
  entangleConfirmingTransitions as b0,
  TimeoutError as b1,
  untrack as b2,
  Queue as b3,
  CONFIG_FRESH_READ as b4,
  forEachDependent as b5,
  statusNotifierOf as b6,
  shiftAffectsMarks as b7,
  SUPPORTS_PROXY as b8,
  setSlotUnobserved as b9,
  handleAsync as bA,
  createTransition as bB,
  CONFIG_HELD_TRUTH as bC,
  createOwner as bD,
  spectate as bE,
  transitions as bF,
  reporterBlocksSource as bG,
  wakeParked as bH,
  notifyOnLane as bI,
  REACTIVE_ZOMBIE as bJ,
  queueRearm as bK,
  OBSERVE as bL,
  clearSnapshots as bM,
  enforceLoadingBoundary as bN,
  getNextChildId as bO,
  markSnapshotScope as bP,
  peekNextChildId as bQ,
  releaseSnapshotScope as bR,
  resetErrorHalt as bS,
  setConsoleFooter as bT,
  setSnapshotCapture as bU,
  setAttributionHooks as bV,
  liveRootOwners as bW,
  ownerPath as bX,
  isSuppressed as bY,
  CONFIG_PLUMBING as bZ,
  anyExcluded as b_,
  devGuardStoreSetterWrite as ba,
  devGuardStoreSetterResult as bb,
  projectionWriteActive as bc,
  setProjectionWriteActive as bd,
  DEV as be,
  isEqual as bf,
  rederiveHeld as bg,
  suppressComputedRecompute as bh,
  readNodeFast as bi,
  READ_SLOW as bj,
  throwPendingUntrackedRead as bk,
  warnStrictReadUntracked as bl,
  unlinkFirewallChild as bm,
  CONFIG_OWNED_WRITE as bn,
  ownsHold as bo,
  deferSlotRelease as bp,
  serve as bq,
  slotSignal as br,
  recordStaleReplay as bs,
  setStoreCommitHook as bt,
  heldDerivation as bu,
  asyncTailFlights as bv,
  untrackDepth as bw,
  checkPostAwaitRead as bx,
  isDisposed as by,
  scheduleWithheld as bz,
  cleanup as c,
  GRAPH_SIZE_WARN_AT as c0,
  noteFanOut as c1,
  REACTIVE_CHECK as d,
  resolveTransition as e,
  activeTransition as f,
  getOwner as g,
  globalQueue as h,
  ext as i,
  clock as j,
  getOrCreateLane as k,
  CONFIG_HAS_LANE as l,
  insertSubs as m,
  schedule as n,
  origin as o,
  STATUS_PENDING as p,
  CONFIG_DERIVED_OVERRIDE as q,
  read as r,
  signal as s,
  CONFIG_OPTIMISTIC as t,
  unwrapOverride as u,
  CONFIG_OVERRIDE_SUPERSEDED as v,
  hasActiveOverride as w,
  NotReadyError as x,
  activeLanes as y,
  signalLanes as z
};
