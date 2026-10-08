import { currentOrigin, withOrigin, withInteraction, attrHooks } from "./attribution-hooks.js";

import { context } from "./core.js";

/** First warning when a change reaches (or a pass tracks) this many edges. */ const GRAPH_SIZE_WARN_AT = 2e3;

/** Re-warn once the count has grown by this much since the last warning. */ const GRAPH_SIZE_WARN_EVERY = 500;

const diagnosticListeners = new Set;

const diagnosticCaptures = new Set;

let diagnosticSequence = 0;

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
 */ function setConsoleFooter(e) {
    return;
}

const diagnostics = {
    subscribe(e) {
        diagnosticListeners.add(e);
        return () => diagnosticListeners.delete(e);
    },
    emit(e, n = null) {
        return emitDiagnostic(e, n);
    },
    capture() {
        const e = [];
        diagnosticCaptures.add(e);
        return {
            get events() {
                return e;
            },
            clear() {
                e.length = 0;
            },
            stop() {
                diagnosticCaptures.delete(e);
                return [ ...e ];
            }
        };
    }
};

const attributionSlot = {
    get installed() {
        return attrHooks;
    },
    withInteraction: withInteraction,
    withOrigin: withOrigin,
    currentOrigin: currentOrigin
};

const RECORDS = Symbol.for("@solidjs/signals/observe/records");

function recordsChannel() {
    const e = globalThis;
    if (e[RECORDS]) return e[RECORDS];
    const n = new Map;
    const t = new Map;
    return e[RECORDS] = {
        subscribe(e, o, r) {
            const i = n.get(e);
            // Set semantics: one entry per function, however often it is passed —
            // the first subscription's options stand for it.
                        if (i === undefined || !i.includes(o)) {
                n.set(e, i === undefined ? [ o ] : [ ...i, o ]);
                if (r !== undefined && r.bodies) {
                    let n = t.get(e);
                    if (n === undefined) t.set(e, n = new Set);
                    n.add(o);
                }
            }
            return () => {
                const r = n.get(e);
                if (r === undefined || !r.includes(o)) return;
                const i = r.filter(e => e !== o);
                if (i.length > 0) n.set(e, i); else n.delete(e);
                const s = t.get(e);
                if (s !== undefined && s.delete(o) && s.size === 0) t.delete(e);
            };
        },
        observed(e, o) {
            return o === "bodies" ? t.has(e) : n.has(e);
        },
        emit(e, t, o) {
            const r = n.get(e);
            if (r === undefined) return;
            // A throwing listener is reported and the rest still hear the record.
            // The try/catch per call allocates nothing unless something throws.
                        for (let e = 0; e < r.length; e++) {
                try {
                    r[e](t, o);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };
}

const OBSERVE = {
    diagnostics: diagnostics,
    records: recordsChannel(),
    attribution: attributionSlot,
    // Replaced by solid-js's server entry (see `ServerObserve`); on the
    // client the slot stays this placeholder. The cast: the interface is
    // empty HERE and gains its members by augmentation downstream.
    server: {},
    exclude(e) {
        markedOwners.set(e, true);
        hasExclusions = true;
    },
    include(e) {
        // No flag flip: with nothing excluded there is nothing to re-admit,
        // and the walk stays short-circuited.
        markedOwners.set(e, false);
    },
    isExcluded: isExcluded,
    ownerPath: ownerPath
};

// --- Excluded owners ---------------------------------------------------------------

// An observer that lives inside the observed app (an adapter's panel,
// devtools) marks its root; both channels check the subject's owner chain —
// the same walk `ownerPath` already makes — and stay silent under it. An
// observer that WRAPS the app (a toolbar around it) excludes its own root
// and includes the app's back: one map, `true` excluded / `false` included,
// and the nearest marker up the chain decides. The flag short-circuits the
// walk for the common case of no exclusions (an include with nothing
// excluded changes no verdict, so it does not flip it).
const markedOwners = new WeakMap;

let hasExclusions = false;

/** Events built for an excluded subject: never delivered, never reported. */ const suppressedEvents = new WeakSet;

function isExcluded(e) {
    if (!hasExclusions || !e) return false;
    let n = "_parent" in e ? e : e.ie ?? null;
    for (;n !== null; n = n._parent) {
        const e = markedOwners.get(n);
        if (e !== undefined) return e;
    }
    return false;
}

/** For engines that cache the verdict per node: is anything excluded at all? */ function anyExcluded() {
    return hasExclusions;
}

/** Was `entry` built for an excluded subject? Once-per-key reporters must not spend their slot on it. */ function isSuppressed(e) {
    return suppressedEvents.has(e);
}

const DEV = undefined;

/**
 * Root-first names of the owners enclosing `subject` (inclusive when the
 * subject is itself a named owner). Signals hop to their registering owner
 * (`_owner`, set by registerGraph). Unnamed owners are skipped so the path
 * reads as the component tree plus the scope: `<App> › <TodoRow> › effect`.
 * Public as `OBSERVE.ownerPath`; the core's own sites import it directly.
 */ function ownerPath(e) {
    if (!e) return undefined;
    let n = "_parent" in e ? e : e.ie ?? null;
    const t = [];
    for (;n !== null; n = n._parent) {
        const e = n._name;
        if (typeof e === "string" && e.length) t.push(e);
    }
    return t.length ? t.reverse() : undefined;
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
 */ function emitDiagnostic(e, n = context) {
    const t = {
        sequence: ++diagnosticSequence,
        ...e
    };
    // The observer's own subtree: build the entry (the caller may throw its
    // message) but tell nobody.
        if (isExcluded(n)) {
        suppressedEvents.add(t);
        return t;
    }
    if (t.ownerPath === undefined) {
        const e = ownerPath(n);
        if (e) t.ownerPath = e;
    }
    const o = n ?? undefined;
    if (o !== undefined) eventSubjects.set(t, o);
    for (const e of diagnosticListeners) e(t, o);
    for (const e of diagnosticCaptures) e.push(t);
    return t;
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
 */ const eventSubjects = new WeakMap;

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
 */ function reportDiagnostic(e) {
    return;
}

/**
 * Observe-tier: stamp a signal with its creating owner so `ownerPath` can
 * locate signal subjects. The per-owner `_signals` list and the devtools
 * `onGraph` hook are dev-tier — the observe build pays one property write.
 */ function registerGraph(e, n) {
    e.ie = n;
}

/**
 * Observe-tier: the live top-level roots — owners created with no parent
 * (`render()`'s root, a `createRoot()` at module scope, a devtools panel).
 * Held weakly so an undisposed root nothing references still collects; a
 * root a subscription keeps alive is exactly the leak `graphSize()` exists
 * to count. Registered by `createOwner` and released by its disposal, so
 * the cost is one Set write per top-level root, never per node.
 */ const liveRoots = new Set;

const rootRefs = new WeakMap;

const rootReaper = typeof FinalizationRegistry === "function" ? new FinalizationRegistry(e => liveRoots.delete(e)) : null;

function registerRoot(e) {
    // Observe-tier bodies: folded to a bare return in prod so the mangler and
    // the bundle never see the walk.
    if (typeof WeakRef !== "function") return;
    const n = new WeakRef(e);
    rootRefs.set(e, n);
    liveRoots.add(n);
    rootReaper?.register(e, n, n);
}

function unregisterRoot(e) {
    const n = rootRefs.get(e);
    if (n === undefined) return;
    rootRefs.delete(e);
    liveRoots.delete(n);
    rootReaper?.unregister(n);
}

/**
 * The live top-level roots, for a walk of the owner tree (the engine's
 * `graphSize`): dead refs are dropped as they are met. Empty in prod.
 */ function liveRootOwners() {
    const e = [];
    for (const n of liveRoots) {
        const t = n.deref();
        if (t === undefined) liveRoots.delete(n); else e.push(t);
    }
    return e;
}

/**
 * Graph-size warnings are once per node, re-warning only when the count has
 * grown by GRAPH_SIZE_WARN_EVERY since the last one — off-node, so the
 * pathological handful of nodes that ever reach the threshold are the only
 * ones that cost anything, and no node carries a bookkeeping field for it.
 */ const graphSizeWarnedAt = new WeakMap;

function shouldWarnGraphSize(e, n) {
    const t = graphSizeWarnedAt.get(e);
    if (t !== undefined && n < t + GRAPH_SIZE_WARN_EVERY) return false;
    graphSizeWarnedAt.set(e, n);
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
 */ function noteFanOut(e, n, t) {
    if (!shouldWarnGraphSize(e, n)) return;
    const o = e._name;
    const r = `[HUGE_FAN_OUT] ${o ? `Signal "${o}"` : "A signal"} changed with ${n} subscribers — ` + `every one re-runs this flush. If many independent computations read the same value ` + `(for example every row of a list comparing against one selected id), prefer a per-key ` + `store or projection so only the items whose result flipped update.`;
    reportDiagnostic(emitDiagnostic({
        code: "HUGE_FAN_OUT",
        kind: "graph",
        severity: "warn",
        message: r,
        nodeName: o,
        ownerId: e.id,
        ownerName: o,
        data: t === undefined ? {
            count: n
        } : {
            count: n,
            write: t
        }
    }, e));
}

/**
 * Observe-tier: a recompute pass of `node` tracked `count` distinct sources
 * (its trimmed dep list, walked once at the end of the pass — see recompute;
 * no per-link work, no pass bracket). Fires from GRAPH_SIZE_WARN_AT up.
 */ function noteFanIn(e, n) {
    if (!shouldWarnGraphSize(e, n)) return;
    const t = e._name;
    const o = `[HUGE_FAN_IN] ${t ? `Computation "${t}"` : "A computation"} tracked ${n} sources. ` + `It will re-run when any of them change. Narrow the read or split the derivation so each ` + `computation tracks only what it needs.`;
    reportDiagnostic(emitDiagnostic({
        code: "HUGE_FAN_IN",
        kind: "graph",
        severity: "warn",
        message: o,
        nodeName: t,
        ownerId: e.id,
        ownerName: t,
        data: {
            count: n
        }
    }, e));
}

export { DEV, GRAPH_SIZE_WARN_AT, GRAPH_SIZE_WARN_EVERY, OBSERVE, anyExcluded, emitDiagnostic, isExcluded, isSuppressed, liveRootOwners, noteFanIn, noteFanOut, ownerPath, registerGraph, registerRoot, reportDiagnostic, setConsoleFooter, unregisterRoot };