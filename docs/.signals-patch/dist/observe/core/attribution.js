import { setAttributionHooks } from "./attribution-hooks.js";

import { NOT_PENDING, CONFIG_PLUMBING, CONFIG_DERIVED_OVERRIDE } from "./constants.js";

import { OBSERVE, liveRootOwners, emitDiagnostic, ownerPath, reportDiagnostic, isSuppressed, anyExcluded, isExcluded, GRAPH_SIZE_WARN_AT, noteFanOut } from "./dev.js";

/** A fallback shown for less than this is a flash: feedback for a wait too short to need it. */ const FALLBACK_FLASH_MS = 150;

/**
 * Under an owner the observer marked as its own (`OBSERVE.exclude`, and not
 * re-admitted by a nearer `OBSERVE.include`), or framework plumbing itself
 * (`CONFIG_PLUMBING` — the HMR memo between a component's root and its
 * body, which is nobody's node): the engine records nothing about the node.
 * Plumbing is a bit read and excludes the node alone, not what it owns; the
 * observer exclusion is cached per node once any exists, before that a flag
 * read.
 */ function excludedNode(e) {
    if ((e.C & CONFIG_PLUMBING) !== 0) return true;
    if (!anyExcluded()) return false;
    const n = e;
    if (n.$e === undefined) n.$e = isExcluded(e);
    return n.$e;
}

let attributionActive = false;

let changeSeq = 0;

let runSeq = 0;

const defaultOptions = {
    log: true,
    // Tier-dependent (see `AttributionOptions.values`): dev output is for the
    // developer at the console and shows everything; an observe build is a
    // production artifact and carries no user data unless a holder asks. The
    // literal folds per build — the observe engine ships `"none"` only.
    values: "none",
    checks: true,
    stacks: false,
    historyLimit: 200,
    hotRuns: {
        count: 120,
        windowMs: 1e3
    },
    wideDeps: 30,
    hotTime: {
        budgetMs: 8,
        windowMs: 1e3
    },
    unstableMemos: 4,
    wastedRecompute: {
        minRuns: 5,
        ratio: .8,
        budgetMs: 2,
        windowMs: 1e3
    },
    fanOut: 250,
    waterfalls: {
        minFlightMs: 50
    },
    holds: {
        infoMs: 100,
        warnMs: 200
    },
    longHolds: {
        infoMs: 500,
        warnMs: 1e3
    },
    graphGrowth: {
        visits: 3,
        ratio: 1.25
    },
    abandonedFlights: {
        count: 3,
        windowMs: 1e3
    },
    fallbackFlashes: true,
    optimisticReverts: true,
    stackedHolds: {
        count: 3
    }
};

let options = {
    ...defaultOptions
};

let history = [];

/**
 * The engine's records go out on the core's channel, `OBSERVE.records` —
 * the one every runtime emits on — under the types `RecordTypes` declares
 * for it (`rerun`, `create`, `effect`, `flush`, `flight`, `fallback`,
 * `interaction`, `hold`, `navigation`, `graph`), each with the live node as
 * `live` where the record has one. `records.observed(type)` is the
 * pre-check the listener-gated records cost nothing without; the channel
 * is process-wide and the subscriptions on it are the consumer's, so the
 * engine neither holds nor clears listeners of its own.
 */ const records = OBSERVE.records;

/** @internal The engine's clock: `performance.now()` where it exists. */ const now = typeof performance !== "undefined" ? () => performance.now() : () => Date.now();

const frames = [];

const folds = [];

/** @internal */ function registerFold(e) {
    folds.push(e);
}

/** @internal Root cause names of a cause chain — the writes/landings/refreshes the chain bottoms out in. */ function rootsOf(e, n) {
    for (const t of e) {
        if (t.kind === "derived" && t.causes && t.causes.length > 0) rootsOf(t.causes, n); else n.add(t.name);
    }
}

function nodeName(e) {
    return e._name ?? "anonymous";
}

/** The record vocabulary for a computation's kind: effects carry a `_type`, memos do not. */ function nodeKind(e) {
    return e.He ? "effect" : "memo";
}

/**
 * Whether a re-run record has an audience — a listener on the channel, an
 * imported fold (`costs`/`feedback`), or the console log. Read at recompute
 * START (the subscription diff needs the deps as they were), so a listener
 * arriving mid-run hears the next one. Without an audience the engine still
 * runs every check and keeps every per-node fact; only the record — its
 * cause list copy, dep diff, previews — is not built, and `history("rerun")`
 * stays empty.
 */ function wantsRerun() {
    return options.log || folds.length > 0 || records.observed("rerun");
}

/**
 * A short preview of a written value for a record — only ever called under
 * `values: "full"` (`stampWrite`, OPTIMISTIC_REVERTED): the other levels
 * carry no previews, and the check is made at the call site so the value is
 * not even looked at.
 */ function preview(e) {
    if (e === null) return "null";
    switch (typeof e) {
      case "undefined":
        return "undefined";

      case "string":
        return JSON.stringify(e.length > 40 ? e.slice(0, 40) + "…" : e);

      case "number":
      case "boolean":
      case "bigint":
        return String(e);

      case "function":
        return "[function]";

      case "symbol":
        return e.toString();

      default:
        return Array.isArray(e) ? `Array(${e.length})` : `[${e.constructor?.name ?? "object"}]`;
    }
}

function captureStack() {
    if (!options.stacks) return undefined;
    const e = (new Error).stack?.split("\n") ?? [];
    // Drop the message line and every frame inside the reactive core; the first
    // remaining frames are the user code that performed the write.
        return e.slice(1).filter(e => !/(?:^|[/\\])(?:packages[/\\])?signals[/\\](src|dist)[/\\]/.test(e)).slice(0, 3).map(e => e.trim());
}

/** Sentinel for "no value transition to record" (refresh() stamps). */ const NO_VALUES = Symbol("no-values");

// --- Provenance -------------------------------------------------------------

// Who performed a write is not a graph fact — the graph only sees the write.
// The engine keeps an ambient answer: a stack of imperative frames the core
// announces (effect callbacks, action steps) and the interaction the web
// runtime declares around event dispatch. A write stamps the innermost frame;
// frames nested under an interaction carry it. Effects run in a later flush
// than the click that caused them, so their frame inherits the interaction
// from the run's cause chain instead (recorded at recomputeEnd).
const EXTERNAL_ORIGIN = {
    kind: "external"
};

const originFrames = [];

/** Per action invocation (keyed by its iterator): the interaction its first step ran under. */ const actionInteractions = new WeakMap;

/**
 * The interaction frame the core's `withInteraction` opened (via the
 * `interactionStart`/`interactionEnd` hooks) for the duration of a handler.
 * Frames nest strictly, so the enclosing one is kept on a stack to restore.
 * The core pins the engine per frame: an `interactionEnd` can arrive after
 * `disable()` cleared the stack, so popping an empty stack is tolerated.
 */ let currentInteraction = null;

const interactionStack = [];

/**
 * The element label an interaction record carries, from the one the runtime
 * described (`tag`, then `#id` or `[name=…]`, then the element's text in
 * quotes — `button#next "Next →"`), cut to what `options.values` allows: the
 * text is the part after the first ` "`; under `"labels"` it stays on a
 * `button` or an `a`, under `"none"` never. The ref's own string is never
 * mutated — the runtime's object is the runtime's.
 */ function targetLabel(e) {
    const n = options.values;
    if (n === "full") return e;
    const t = e.indexOf(' "');
    if (t === -1) return e;
    if (n === "labels") {
        const n = e.slice(0, t);
        const o = n.search(/[#[]/);
        const i = o === -1 ? n : n.slice(0, o);
        if (i === "button" || i === "a") return e;
    }
    return e.slice(0, t);
}

function interactionStart(e) {
    interactionStack.push(currentInteraction);
    // One clock read: the frame opens now; the interaction began at `ref.at`
    // when the runtime dated it (the event's own timestamp), else now too.
        const n = now();
    const t = {
        kind: "interaction",
        name: e.type,
        at: e.at ?? n
    };
    if (e.target) t.target = targetLabel(e.target);
    currentInteraction = t;
    openInteraction(t, n);
}

function interactionEnd(e) {
    const n = currentInteraction;
    currentInteraction = interactionStack.length ? interactionStack.pop() : null;
    if (n !== null) closeInteraction(n, e);
}

/** The interaction an origin runs under (itself, when it is one). */ function interactionOf(e) {
    if (e === undefined) return undefined;
    return e.kind === "interaction" ? e : e.interaction;
}

/** The interaction a cause list traces back to — root writes only, derived links walked. */ function interactionIn(e) {
    for (const n of e) {
        const e = n.kind === "derived" ? n.causes !== undefined ? interactionIn(n.causes) : undefined : interactionOf(n.origin);
        if (e !== undefined) return e;
    }
    return undefined;
}

function currentOrigin() {
    const e = originFrames[originFrames.length - 1];
    if (e !== undefined) return e;
    return currentInteraction ?? EXTERNAL_ORIGIN;
}

/** The root origin a cause list traces back to — the stamp of the nearest root write, derived links walked. */ function originIn(e) {
    for (const n of e) {
        const e = n.kind === "derived" ? n.causes !== undefined ? originIn(n.causes) : undefined : n.origin;
        if (e !== undefined && e.kind !== "external") return e;
    }
    return undefined;
}

/**
 * The `currentOrigin` hook: what a runtime recording its own fact right now
 * (a server-function call) should stamp it with. Inside a recompute the
 * fact belongs to the change that caused the run — a `createAsync` calling
 * the server on a navigation's write is the navigation's, and through it the
 * click's — walked down past create runs the way `trackFlightStart` does,
 * since a node born inside a parent's run inherits the parent's causality.
 * Outside one — or when the causes were themselves external (a memo a
 * handler pulls, stale from a timer's write) — it is the write's answer
 * (`currentOrigin`), minus the external sentinel: "none known" is
 * `undefined` on a record, as `HoldEvent.origin` has it. The objects
 * returned are the engine's own frames, so the caller's record joins
 * `InteractionEvent.origin` / `NavigationEvent.origin` by identity.
 */ function ambientOrigin() {
    for (let e = frames.length - 1; e >= 0; e--) {
        const n = frames[e].causes;
        if (n !== null) {
            const e = originIn(n);
            if (e !== undefined) return e;
            break;
        }
    }
    const e = currentOrigin();
    return e === EXTERNAL_ORIGIN ? undefined : e;
}

const effectFrames = new WeakMap;

/**
 * The nodes of the open effect frames, innermost last — parallel to the
 * `effect` entries of `originFrames`, so the frame on top resolves to its
 * node without a map. A stack, not a single slot: a render effect created
 * inside a callback runs its own callback synchronously.
 */ const effectStack = [];

/**
 * A write just stamped `origin`. If it is the innermost effect frame (a
 * root write's origin is always the innermost open frame, see `stampWrite`)
 * and no earlier write registered it, register it now with the node on top
 * of the effect stack. An origin that is an effect frame but not the top is
 * inherited — reached through an earlier write's record — and that write
 * registered it.
 */ function noteEffectOrigin(e) {
    if (e.kind !== "effect" || effectFrames.has(e)) return;
    if (originFrames[originFrames.length - 1] !== e) return;
    const n = effectStack[effectStack.length - 1];
    if (n !== undefined) effectFrames.set(e, {
        node: n,
        causes: n.Ke
    });
}

/** The interaction the innermost open frame runs under, else the ambient one. */ function enclosingInteraction() {
    const e = originFrames[originFrames.length - 1];
    return (e !== undefined ? interactionOf(e) : undefined) ?? currentInteraction ?? undefined;
}

function pushFrame(e, n, t, o) {
    const i = {
        kind: e
    };
    if (n) i.name = n;
    const s = t ?? currentInteraction ?? undefined;
    if (s !== undefined) i.interaction = s;
    if (o !== undefined) {
        const e = o;
        if (e.Ye !== undefined) i.run = e.Ye;
        // The frame → node map is filled by the first write inside the callback
        // (noteEffectOrigin), not here: most callbacks never write.
                effectStack.push(o);
    }
    originFrames.push(i);
}

function popFrame(e) {
    // Frames are strictly nested; a mismatch means enable() landed mid-frame
    // (the opener never pushed) — leave the stack alone rather than pop a stranger.
    const n = originFrames[originFrames.length - 1];
    if (n !== undefined && n.kind === e) {
        originFrames.pop();
        if (e === "effect") effectStack.pop();
    }
}

/**
 * `withOrigin` opened a declared frame. The frame object IS the origin every
 * write inside stamps, and the key the navigation record hangs off (see
 * "Navigations" below), so a hold or re-run that later resolves a write's
 * origin lands on the same record. It runs under the interaction of the frame
 * it opened inside — a `navigate()` from an action step, whose ambient
 * interaction is long gone but whose frame remembers it — else the ambient
 * one (a link click's handler).
 */ function originStart(e) {
    // A redirect hop re-enters the pending navigation's frame — the same object,
    // so its writes stamp the same origin and replace the pending write without
    // superseding it (see "Navigations").
    if (e.redirect !== undefined && e.redirect > 0) {
        const n = lastOpenNavigation();
        if (n !== undefined) {
            redirectNavigation(n, e);
            originFrames.push(n.event.origin);
            return;
        }
    }
    // The initial navigation is the document's: its request is the time origin
    // unless the router says otherwise, and it left nowhere.
        const n = e.initial === true;
    const t = {
        kind: e.kind,
        at: e.at ?? (n ? 0 : now())
    };
    if (!n && e.from !== undefined) t.from = e.from;
    // Declared beats ambient: a router that awaited before writing hands back
    // the origin it captured in the request (`undefined` when the request ran
    // under none — still a declaration); what is on the stack now is whatever
    // happened to be running.
        const o = "interaction" in e ? interactionOf(e.interaction) : enclosingInteraction();
    if (o !== undefined) t.interaction = o;
    originFrames.push(t);
    openNavigation(t, e);
}

function originEnd() {
    const e = originFrames[originFrames.length - 1];
    popFrame("navigation");
    if (e !== undefined && e.kind === "navigation") closeNavigation(e);
}

/** `click on button#next "Next →"`, `effect "syncTitle"`, `action "save"`, `navigation to /users/:id`, … */ function formatOrigin(e) {
    switch (e.kind) {
      case "interaction":
        return `${e.name} on ${e.target ?? "an element"}`;

      case "effect":
        return `effect${e.name ? ` "${e.name}"` : ""}`;

      case "action":
        return `action${e.name ? ` "${e.name}"` : ""}`;

      case "async":
        return `async landing${e.name ? ` on "${e.name}"` : ""}`;

      case "navigation":
        {
            // The route pattern is the name consumers group by; the concrete path
            // follows when it adds information, then the destinations a redirect
            // chain abandoned on the way.
            const n = e.name ?? e.to;
            if (n === undefined) return "navigation";
            const t = [];
            if (e.to !== undefined && e.to !== n) t.push(e.to);
            const o = navStates.get(e)?.event.redirects;
            if (o !== undefined) t.push(`redirected from ${o.map(e => e.to ?? e.name ?? "?").join(" → ")}`);
            const i = navStates.get(e)?.event.initial === true;
            return `${i ? "initial " : ""}navigation to ${n}${t.length > 0 ? ` (${t.join(", ")})` : ""}`;
        }

      default:
        return "outside the reactive system";
    }
}

/** Record a root change (setSignal / refresh / async landing) on the node. */
/** Live subscriber count, walked on demand — the core keeps no counter. */ function countSubscribers(e) {
    let n = 0;
    for (let t = e.u; t !== null; t = t.Pe) n++;
    return n;
}

/**
 * HUGE_FAN_OUT from the engine's lower `fanOut` threshold (see dev.ts): a
 * committed root invalidation reaching hundreds of subscribers re-runs all
 * of them this flush. Counts the subscriber list itself (an engine-only
 * walk, on the write; the core keeps no per-node count — a live `_subCount`
 * was a post-construction field that forked node shapes). Stops at
 * GRAPH_SIZE_WARN_AT, where the always-on core check takes over, so the two
 * never fire for the same write; the once-per-node dedupe is the core's.
 */ function checkFanOut(e, n) {
    const t = options.fanOut;
    if (typeof t !== "number") return;
    const o = countSubscribers(e);
    if (o < t || o >= GRAPH_SIZE_WARN_AT) return;
    noteFanOut(e, o, n);
}

function stampWrite(e, n, t = NO_VALUES, o = NO_VALUES) {
    const i = {
        seq: ++changeSeq,
        kind: n,
        name: nodeName(e),
        nodeId: devId(e)
    };
    // The previews are the record's one look at the written values: under
    // any level but `"full"` they are not taken, so the record never carries
    // them (nor does the `HeldWrite` copied from it, nor a sentence built on it).
        if (o !== NO_VALUES && options.values === "full") {
        i.prev = t === NO_VALUES ? undefined : preview(t);
        i.value = preview(o);
    }
    i.origin = n === "async" ? asyncOrigin(e) : currentOrigin();
    i.at = now();
    i.stack = captureStack();
    const s = e.ze;
    e.ze = i;
    noteNavigationWrite(s, i);
    noteInteractionWrite(i.origin, excludedNode(e));
    if (n === "write") trackEffectWrite(e, i, o);
    // stampWrite is the single funnel for committed root invalidations (sync
    // writes, refresh(), async landings), which makes it the one place the
    // engine's fan-out check needs to live.
        checkFanOut(e, n);
}

/** Record a derived change (memo produced a new value) with its causes. */ function stampDerived(e, n) {
    e.ze = {
        seq: ++changeSeq,
        kind: "derived",
        name: nodeName(e),
        nodeId: devId(e),
        causes: n
    };
}

/**
 * Collect the deps whose committed change is newer than this node's previous
 * run. Called at recompute entry, while `_deps` still holds the previous
 * run's links. A refresh() stamp on the node itself also counts — that is a
 * self-invalidation, not a dep change.
 */ function collectCauses(e) {
    const n = e.Xe ?? 0;
    const t = [];
    const o = e.ze;
    if (o !== undefined && o.seq > n && o.kind === "refresh") t.push(o);
    for (let o = e.Ee; o !== null; o = o.Ie) {
        const e = o.De.ze;
        if (e !== undefined && e.seq > n) t.push(e);
    }
    return t;
}

/** Advance the node's seen-cursor to the present. Call after every run. */ function markSeen(e) {
    e.Xe = changeSeq;
}

/**
 * Snapshot the dep identities of the node's last pass (call before a run
 * replaces them, or after it to read the fresh set). The validated prefix
 * [`_deps`..`_depsTail`] is that pass's set; links past the tail are a
 * previous pass's, kept linked while the frame they fed is still the
 * committed one (A30 — a staged memo pass, or an effect pass whose run is
 * still owed) and not part of the subscription diff.
 */ function captureDeps(e) {
    const n = [];
    for (let t = e.Ee; t !== null; t = t.Ie) {
        n.push(t.De);
        if (t === e.Je) break;
    }
    return n;
}

/**
 * Wide-scope warning — the coarse-read / helper-leak signature: one scope
 * subscribed to dozens of sources re-runs when ANY of them change. Fired from
 * recordRerun for re-runs and directly from recompute for creation runs (a
 * memo can be born too wide). Re-warns only on 50% further growth.
 */ function checkDepWidth(e) {
    const n = options.wideDeps;
    if (n === false) return;
    let t = 0;
    const o = [];
    for (let n = e.Ee; n !== null; n = n.Ie) {
        t++;
        if (o.length < 12) o.push(nodeName(n.De));
        if (n === e.Je) break;
 // the validated prefix, as captureDeps
        }
    const i = e;
    if (t < n || t < (i.en ?? 0) * 1.5) return;
    i.en = t;
    const s = `[WIDE_SCOPE_DEPS] ${nodeKind(e)} "${nodeName(e)}" is subscribed to ${t} sources — ` + `it re-runs when any of them change. Narrow its reads or split it into smaller memos. ` + `Sources: ${o.join(", ")}${t > o.length ? ", …" : ""}`;
    reportDiagnostic(emitDiagnostic({
        code: "WIDE_SCOPE_DEPS",
        kind: "perf",
        severity: "warn",
        message: s,
        nodeName: nodeName(e),
        data: {
            depCount: t,
            deps: o
        }
    }, e));
}

const hotCauses = new Map;

const HOT_FANOUT_FIRST_MILESTONE = 5;

/**
 * Hot-scope warning — flags a scope that re-ran more than `count` times
 * inside one `windowMs` window. Warned once per window, with the most recent
 * cause chain named so the leaking signal is identified in the message.
 * Fan-out spam is folded per root cause (see HotCauseWindow above).
 */ function checkHotRuns(e, n) {
    const t = options.hotRuns;
    if (t === false) return;
    const o = e;
    const i = Date.now();
    if (o.nn === undefined || i - o.nn > t.windowMs) {
        o.nn = i;
        o.tn = 0;
        o.sn = false;
    }
    o.tn = (o.tn ?? 0) + 1;
    if (o.sn || o.tn < t.count) return;
    o.sn = true;
    // Root-cause key: the set of originating writes behind this scope's latest
    // re-run. Scopes hot from the SAME roots share one aggregation window.
        const s = new Set;
    rootsOf(n, s);
    const r = s.size > 0 ? [ ...s ].sort().join(", ") : "(untracked)";
    let a = hotCauses.get(r);
    if (a === undefined || i - a.winStart > t.windowMs) {
        a = {
            winStart: i,
            scopes: 0,
            runs: 0,
            nextMilestone: HOT_FANOUT_FIRST_MILESTONE
        };
        hotCauses.set(r, a);
    }
    a.scopes++;
    a.runs += o.tn;
    if (a.scopes === 1) {
        const s = n.map(e => `"${e.name}" (${e.kind})`).join(", ");
        const r = `[HOT_SCOPE_RERUNS] ${nodeKind(e)} "${nodeName(e)}" re-ran ${o.tn} times ` + `in ${Math.max(1, i - o.nn)}ms — a hot signal is likely leaking into this ` + `scope. Latest cause: ${s || "(untracked pull)"}`;
        reportDiagnostic(emitDiagnostic({
            code: "HOT_SCOPE_RERUNS",
            kind: "perf",
            severity: "warn",
            message: r,
            nodeName: nodeName(e),
            data: {
                runs: o.tn,
                windowMs: t.windowMs,
                causes: n.map(e => e.name)
            }
        }, e));
        return;
    }
    // Additional scopes hot from the same cause: silent until a milestone —
    // the culprit is the cause, and it has already been named once.
        if (a.scopes < a.nextMilestone) return;
    a.nextMilestone *= 10;
    const c = `[HOT_SCOPE_FANOUT] ${a.scopes} scopes have gone hot (${a.runs} re-runs) within ` + `${t.windowMs}ms, all driven by ${r} — one hot cause is re-running a large part ` + `of the graph. Per-scope warnings are suppressed; fix the cause. If consumers ask keyed ` + `questions of it, invert it: a store used as a map keyed by id, one key per consumer.`;
    // The subject is the shared CAUSE, not this victim scope — no single owner
    // path locates it, so the event carries none.
        reportDiagnostic(emitDiagnostic({
        code: "HOT_SCOPE_FANOUT",
        kind: "perf",
        severity: "warn",
        message: c,
        nodeName: r,
        data: {
            cause: r,
            scopes: a.scopes,
            runs: a.runs,
            windowMs: t.windowMs
        }
    }, null));
}

/**
 * Time-budget warning — the counterpart of checkHotRuns for the
 * few-but-expensive scope: warns when one scope's summed self-time within a
 * window exceeds the budget. Warned once per window.
 */ function checkHotTime(e, n, t) {
    const o = options.hotTime;
    if (o === false) return;
    const i = e;
    const s = now();
    if (i.rn === undefined || s - i.rn > o.windowMs) {
        i.rn = s;
        i.an = 0;
        i.cn = false;
    }
    i.an = (i.an ?? 0) + n;
    if (i.cn || i.an < o.budgetMs) return;
    i.cn = true;
    const r = t.map(e => `"${e.name}" (${e.kind})`).join(", ");
    const a = `[HOT_SCOPE_TIME] ${nodeKind(e)} "${nodeName(e)}" spent ` + `${i.an.toFixed(1)}ms of compute inside one ${o.windowMs}ms window ` + `(budget ${o.budgetMs}ms). Latest cause: ${r || "(untracked pull)"}`;
    reportDiagnostic(emitDiagnostic({
        code: "HOT_SCOPE_TIME",
        kind: "perf",
        severity: "warn",
        message: a,
        nodeName: nodeName(e),
        data: {
            spentMs: i.an,
            budgetMs: o.budgetMs,
            windowMs: o.windowMs,
            causes: t.map(e => e.name)
        }
    }, e));
}

/**
 * A scope whose equality gate closes almost every time: it re-ran because
 * an input changed, computed, compared equal to its last value and told
 * nobody — the run was pure cost. `costs().wastedMs` sums this; the finding
 * names it while it happens, with the input that keeps triggering it. The
 * fix is upstream: an equality boundary on the part of the input the scope
 * depends on, or a narrower read. Plain runs only — a held or overlay run
 * may be replayed and is never blamed as waste.
 */ function checkWastedRecompute(e, n, t, o, i, s) {
    const r = options.wastedRecompute;
    if (r === false || t !== "plain") return;
    // This runs on every re-run: fields on the node (one property read each,
    // like hotRuns) and the run's own `at` — no clock read, no map lookup.
        const a = e;
    if (a.dn === undefined || n - a.dn > r.windowMs) {
        a.dn = n;
        a.fn = 0;
        a.un = 0;
        a.ln = 0;
        a.hn = false;
    }
    a.fn = a.fn + 1;
    if (!o) {
        a.un = a.un + 1;
        a.ln = a.ln + i;
    }
    if (a.hn || a.fn < r.minRuns || a.un / a.fn < r.ratio || a.ln < r.budgetMs) return;
    a.hn = true;
    const c = {
        runs: a.fn,
        wasted: a.un,
        wastedMs: a.ln
    };
    const d = s.map(e => `"${e.name}" (${e.kind})`).join(", ");
    const f = `[WASTED_RECOMPUTE] ${nodeKind(e)} "${nodeName(e)}" re-ran ${c.runs} times in ` + `${r.windowMs}ms and ${c.wasted} of those produced the same value — ` + `${c.wastedMs.toFixed(1)}ms of compute the equality gate then discarded. Its inputs ` + `change without changing its result: put an equality boundary upstream (a memo over the ` + `part of the input it reads, or an \`equals\` on the source), or read a narrower slice ` + `(the property, not the object). Latest cause: ${d || "(untracked pull)"}`;
    reportDiagnostic(emitDiagnostic({
        code: "WASTED_RECOMPUTE",
        kind: "perf",
        severity: "warn",
        message: f,
        nodeName: nodeName(e),
        data: {
            runs: c.runs,
            wasted: c.wasted,
            wastedMs: c.wastedMs,
            windowMs: r.windowMs,
            causes: s.map(e => e.name)
        }
    }, e));
}

function recordRerun(e, n, t, o, i, s) {
    const r = n.causes;
    const a = e;
    const c = a.Ke;
    const d = n.interaction;
    if (excludedNode(e)) {
        // The observer's own computation: keep the per-node bookkeeping its
        // effect phase reads (see effectRunStart) and record nothing.
        a.pn = d;
        a.Ye = undefined;
        a.Ke = r;
        return;
    }
    // The facts every run leaves on the node, record or not: the run sequence
    // (`ChangeOrigin.run` joins an effect-phase write to it), the run count,
    // and what the effect phase inherits — it runs later in the flush with no
    // cause list of its own, so it takes this run's interaction and causes
    // (see effectRunStart / pushFrame).
        const f = ++runSeq;
    const u = a.mn = (a.mn ?? 0) + 1;
    a.pn = d;
    a.Ye = f;
    a.Ke = r;
    noteInteractionRun(d, t.selfMs, false);
    if (openFlush !== null) noteFlushRun(openFlush, false, d);
    // The checks read the facts, not the record, so they run with or without
    // an audience for it.
        const l = nodeKind(e);
    if (l === "effect") checkEffectCycle(e, r);
    checkRelayTear(e, r, c);
    checkHotRuns(e, r);
    checkHotTime(e, t.selfMs, r);
    checkWastedRecompute(e, n.start, i, o, t.selfMs, r);
    checkDepWidth(e);
    // The record: built only when something wanted it at run start (see
    // `wantsRerun`) — a listener, a fold, the log.
        const h = n.prevDeps;
    if (h === null) return;
    // Subscription diff: `prevDeps` was captured at run entry; `_deps` now
    // holds the fresh set. A changed set is the "helper edit changed distant
    // call sites" signal — surfaced per-event and in the console format.
        const p = captureDeps(e);
    const m = new Set(h);
    const g = new Set(p);
    const w = [];
    const v = [];
    for (const e of p) if (!m.has(e)) w.push(nodeName(e));
    for (const e of h) if (!g.has(e)) v.push(nodeName(e));
    const k = {
        run: f,
        at: n.start,
        nodeRuns: u,
        nodeKind: l,
        nodeName: nodeName(e),
        nodeId: devId(e),
        causes: r,
        depCount: p.length,
        depsAdded: w,
        depsRemoved: v,
        selfMs: t.selfMs,
        totalMs: t.totalMs,
        changed: o,
        phase: i,
        held: s
    };
    if (d !== undefined) k.interaction = d;
    history.push(k);
    if (history.length > options.historyLimit) history.shift();
    for (const n of folds) n.rerun?.(e, k);
    records.emit("rerun", k, e);
    if (options.log) logRerun(k);
}

function formatCause(e, n, t) {
    const o = "  ".repeat(n + 1);
    let i = `${o}← ${e.kind === "derived" ? "memo" : "signal"} "${e.name}" ${e.kind === "derived" ? "changed" : e.kind} (#${e.seq})`;
    if (e.prev !== undefined) i += ` ${e.prev} → ${e.value}`;
    if (e.origin !== undefined && e.origin.kind !== "external") {
        i += ` — ${formatOrigin(e.origin)}`;
        const n = e.origin.interaction;
        if (n !== undefined) i += ` (under ${formatOrigin(n)})`;
    }
    t.push(i);
    if (e.stack) for (const n of e.stack) t.push(`${o}    ${n}`);
    if (e.causes && n < 10) {
        for (const o of e.causes) formatCause(o, n + 1, t);
    }
}

function formatRerun(e) {
    const n = [ `[why-run] ${e.nodeKind} "${e.nodeName}" ran (run ${e.nodeRuns}, ` + `${e.selfMs.toFixed(2)}ms${e.changed ? "" : ", unchanged"}` + `${e.phase === "plain" ? "" : `, ${e.phase}`}${e.held ? ", held" : ""})` + (e.causes.length === 0 ? " — no tracked cause (pull or retry)" : "") ];
    for (const t of e.causes) formatCause(t, 0, n);
    if (e.depsAdded.length > 0 || e.depsRemoved.length > 0) {
        const t = [ ...e.depsAdded.map(e => `+"${e}"`), ...e.depsRemoved.map(e => `-"${e}"`) ].join(" ");
        n.push(`  deps changed: ${t} (${e.depCount} total)`);
    }
    return n.join("\n");
}

/**
 * Console face of a re-run: the headline as a collapsed group with the
 * why-chain and dep delta inside, so a busy console stays scannable (one line
 * per run, evidence a click away). Consoles without grouping get the text.
 */ function logRerun(e) {
    const n = formatRerun(e);
    const t = n.indexOf("\n");
    if (t === -1 || typeof console.groupCollapsed !== "function") {
        console.log(n);
        return;
    }
    console.groupCollapsed(n.slice(0, t));
    console.log(n.slice(t + 1));
    console.groupEnd();
}

/**
 * Values eligible for the unstable-output check: plain objects and arrays
 * only. Promises, iterators, Dates, Maps, class instances etc. all have no
 * (or unrepresentative) own enumerable keys, so a shallow compare would
 * false-positive on them — a fresh Promise is a genuinely new value.
 */ function isPlainShape(e) {
    if (e === null || typeof e !== "object") return false;
    if (Array.isArray(e)) return true;
    const n = Object.getPrototypeOf(e);
    return n === Object.prototype || n === null;
}

/** Shallow structural equivalence, capped so hot paths stay cheap. */ const UNSTABLE_KEY_CAP = 64;

function shallowEquivalent(e, n) {
    const t = Array.isArray(e);
    if (t !== Array.isArray(n)) return false;
    if (t) {
        const t = e;
        const o = n;
        if (t.length !== o.length || t.length > UNSTABLE_KEY_CAP) return false;
        for (let e = 0; e < t.length; e++) if (t[e] !== o[e]) return false;
        return true;
    }
    const o = Object.keys(e);
    if (o.length > UNSTABLE_KEY_CAP || o.length !== Object.keys(n).length) return false;
    for (const t of o) {
        if (!(t in n) || e[t] !== n[t]) return false;
    }
    return true;
}

/**
 * Unstable-output warning — the fan-out amplifier signature: a memo whose
 * committed value is referentially new but structurally identical run after
 * run has an equality gate that never closes, so ALL its subscribers re-run
 * on EVERY upstream change. Checked only on plain (non-overlay) changed runs;
 * a genuinely different value (or a non-plain shape) resets the streak.
 */ function checkUnstableOutput(e, n, t) {
    const o = options.unstableMemos;
    // typeof guard: an explicit `unstableMemos: undefined` in enable() options
    // clobbers the default through the spread — treat any non-number as off.
        if (typeof o !== "number") return;
    const i = e;
    if (n === t || // paranoia: changed runs should never hit this
    !isPlainShape(n) || !isPlainShape(t) || !shallowEquivalent(n, t)) {
        i.gn = 0;
        i.wn = false;
        return;
    }
    i.gn = (i.gn ?? 0) + 1;
    if (i.wn || i.gn < o) return;
    i.wn = true;
    const s = Array.isArray(t) ? "array" : "object";
    const r = `[UNSTABLE_MEMO_OUTPUT] memo "${nodeName(e)}" produced a new-but-equivalent ${s} on ` + `${i.gn} consecutive runs — its equality gate never closes, so every ` + `subscriber re-runs on every upstream change. Return stable references or pass an ` + `\`equals\` option.`;
    reportDiagnostic(emitDiagnostic({
        code: "UNSTABLE_MEMO_OUTPUT",
        kind: "perf",
        severity: "warn",
        message: r,
        nodeName: nodeName(e),
        data: {
            runs: i.gn,
            shape: s
        }
    }, e));
}

const EFFECT_CYCLE_MAX_HOPS = 6;

const reportedCycles = new Set;

let nextDevId = 0;

const devIds = new WeakMap;

function devId(e) {
    let n = devIds.get(e);
    if (n === undefined) devIds.set(e, n = ++nextDevId);
    return n;
}

/** @internal The id the engine's records name `node` by, if it has one yet — read without assigning. */ function nodeIdOf(e) {
    return devIds.get(e);
}

function rootWrites(e, n) {
    for (const t of e) {
        if (t.kind === "derived") {
            if (t.causes !== undefined) rootWrites(t.causes, n);
        } else n.push(t);
    }
}

/**
 * The effect writes leading from an earlier run of `target` to the run whose
 * `causes` these are, in causal order (target's own write first), or null.
 */ function findEffectCycle(e, n, t, o) {
    const i = [];
    rootWrites(n, i);
    for (const n of i) {
        const i = n.origin;
        if (i === undefined || i.kind !== "effect") continue;
        const s = effectFrames.get(i);
        if (s === undefined) continue;
        if (s.node === e) return [ {
            effect: s.node,
            write: n
        } ];
        if (o >= EFFECT_CYCLE_MAX_HOPS || t.has(s.node) || s.causes === undefined) continue;
        t.add(s.node);
        const r = findEffectCycle(e, s.causes, t, o + 1);
        if (r !== null) {
            r.push({
                effect: s.node,
                write: n
            });
            return r;
        }
    }
    return null;
}

/** Names of the memos between a direct cause of a run and `write`, root-first. */ function derivedPath(e, n, t) {
    for (const o of e) {
        if (o === n) return true;
        if (o.kind === "derived" && o.causes !== undefined) {
            t.unshift(o.name);
            if (derivedPath(o.causes, n, t)) return true;
            t.shift();
        }
    }
    return false;
}

function describeWrite(e) {
    if (e.kind === "refresh") return `refreshed "${e.name}"`;
    const n = e.prev !== undefined ? ` (${e.prev} → ${e.value})` : "";
    return `wrote "${e.name}"${n}`;
}

function checkEffectCycle(e, n) {
    const t = findEffectCycle(e, n, new Set([ e ]), 0);
    if (t === null) return;
    const o = t.map(e => devId(e.effect)).sort((e, n) => e - n).join(",");
    if (reportedCycles.has(o)) return;
    reportedCycles.add(o);
    const i = t.length + 1;
    let s;
    if (t.length === 1) {
        const [{write: o}] = t;
        const i = [];
        derivedPath(n, o, i);
        const r = i.length > 0 ? ` through ${i.map(e => `memo "${e}"`).join(" → ")}` : "";
        s = `[EFFECT_WRITES_OWN_SOURCE] effect "${nodeName(e)}" re-ran because of its own write: it ` + `${describeWrite(o)}, which fed back into its inputs${r}. Two flushes to settle, ` + `and the screen rendered the pre-write value in between. The written value is a function ` + `of what the effect reads — compute it in a memo (or normalize where the source is ` + `written) instead of correcting it after the fact.`;
    } else {
        const e = t.map(e => `"${nodeName(e.effect)}"`);
        const n = t.map((n, t) => `effect ${e[t]}${t > 0 ? " re-ran and" : ""} ${describeWrite(n.write)}`).join("; ");
        s = `[EFFECT_WRITES_OWN_SOURCE] effects ${[ ...e, e[0] ].join(" → ")} relay writes in a ` + `cycle: ${n}; which fed back into effect ${e[0]}'s inputs — ${i} flushes to ` + `settle after each change, each rendering an intermediate state. Every relayed value is a ` + `function of the original inputs: derive them in memos and drop the writes.`;
    }
    const r = t.length === 1 ? "warn" : "info";
    emitDiagnostic({
        code: "EFFECT_WRITES_OWN_SOURCE",
        kind: "perf",
        severity: r,
        message: s,
        nodeName: nodeName(e),
        data: {
            effects: t.map(e => nodeName(e.effect)),
            writes: t.map(e => ({
                effect: nodeName(e.effect),
                kind: e.write.kind,
                name: e.write.name,
                prev: e.write.prev,
                value: e.write.value
            })),
            flushes: i
        }
    }, e);
}

const RELAY_WARN_AT = 3;

const relays = new Map;

const copyWrites = new WeakSet;

const copyReported = new WeakSet;

/** The node each root write record was stamped on (records are serializable and cannot hold it). */ const recordNodes = new WeakMap;

/**
 * Write-side bookkeeping for the relay heuristics: who has written this
 * signal, and whether an effect just copied its compute output into it.
 */ function trackEffectWrite(e, n, t) {
    const o = e;
    const i = n.origin;
    if (i !== undefined) noteEffectOrigin(i);
    const s = i !== undefined && i.kind === "effect" ? effectFrames.get(i) : undefined;
    const r = s === undefined ? 0 : devId(s.node);
    recordNodes.set(n, e);
    o.vn = o.vn === undefined || o.vn === r ? r : null;
    if (s !== undefined && t !== undefined && t === s.node.ce) {
        copyWrites.add(n);
        o.kn = o.Sn === r ? (o.kn ?? 0) + 1 : 1;
        o.Sn = r;
        if (o.kn >= 2 && o.vn === r) checkCopyEffect(s.node, e);
    } else o.kn = 0;
}

/** The effect's source whose current value the compute output is, if any (the prop-to-state port). */ function passthroughSource(e) {
    for (let n = e.Ee; n !== null; n = n.Ie) if (n.De.ce === e.ce) return nodeName(n.De);
    return undefined;
}

/** The repair for a write that is the effect's compute output. */ function copyRepair(e, n) {
    const t = passthroughSource(e);
    return t !== undefined ? `The written value is "${t}" itself: read "${t}" where "${n}" is read ` + `(or createMemo it if a stable derivation is needed) and delete the effect.` : `The written value is the effect's compute output — by contract a pure function of ` + `what it tracks: make "${n}" a memo of that computation and delete the effect.`;
}

function checkCopyEffect(e, n) {
    if (copyReported.has(n)) return;
    copyReported.add(n);
    const t = nodeName(n);
    const o = `[EFFECT_RELAY_TEAR] effect "${nodeName(e)}" writes its compute output into ` + `"${t}" on every run, and nothing else writes "${t}" — it is derived state kept ` + `one flush late: everything reading it paints a frame behind everything reading the ` + `source. ${copyRepair(e, t)}`;
    reportDiagnostic(emitDiagnostic({
        code: "EFFECT_RELAY_TEAR",
        kind: "perf",
        severity: "warn",
        message: o,
        nodeName: nodeName(e),
        data: {
            relay: nodeName(e),
            wrote: t,
            copy: true,
            passthrough: passthroughSource(e) ?? null,
            soleWriter: true
        }
    }, e));
}

/**
 * `victim` re-ran with `causes`; its previous run had `prevCauses`. A tear is
 * a re-run whose root writes ALL came from effects (no independent outside
 * cause) and at least one of which was made by a run that shares a root
 * write with the victim's previous run.
 */ function checkRelayTear(e, n, t) {
    if (t === undefined || n.length === 0) return;
    const o = [];
    rootWrites(n, o);
    if (o.length === 0) return;
    let i;
    let s;
    let r;
    for (const n of o) {
        const o = n.origin;
        if (o === undefined || o.kind !== "effect") return;
        const a = effectFrames.get(o);
        // Own-source cycles are EFFECT_WRITES_OWN_SOURCE's; a create-run relay
        // is initial sync, not a tear for one change.
                if (a === undefined || a.node === e || a.causes === undefined) return;
        if (r === undefined) {
            const e = [];
            rootWrites(a.causes, e);
            const o = [];
            rootWrites(t, o);
            const c = e.find(e => o.includes(e));
            if (c !== undefined) {
                r = c;
                i = a;
                s = n;
            }
        }
    }
    if (r === undefined || i === undefined || s === undefined) return;
    const a = `${devId(i.node)}:${s.name}`;
    let c = relays.get(a);
    if (c === undefined) relays.set(a, c = {
        count: 0,
        warned: false
    });
    c.count++;
    const d = copyWrites.has(s);
    const f = recordNodes.get(s);
    const u = f !== undefined && f.vn === devId(i.node);
    // Derivable outright: the value is the compute output and nothing else
    // writes the signal. A copy INTO a signal that has other writers is the
    // "reset editable state from a source" shape — the tear is real, but a memo
    // is not the answer, so it stays advisory like any other non-derivable tear.
        const l = d && u;
    const h = l || c.count >= RELAY_WARN_AT ? "warn" : "info";
    // First sighting always reports (advisory); afterwards only the escalation.
        if (c.count > 1 && (h !== "warn" || c.warned)) return;
    // One verdict per derivable signal: the copy report (checkCopyEffect) and
    // the tear report carry the same repair.
        if (l && f !== undefined) {
        if (copyReported.has(f)) return;
        copyReported.add(f);
    }
    if (h === "warn") c.warned = true;
    const p = e.He ? "effect" : "memo";
    const m = nodeName(i.node);
    const g = l ? copyRepair(i.node, s.name) : d ? `The written value is the effect's compute output, but "${s.name}" has other ` + `writers — editable state reset from a source. If the reset is the intent, the tear ` + `is its cost; if "${s.name}" only ever mirrors the source, drop the local copy ` + `and read the source.` : u ? `Nothing else writes "${s.name}" — it is derived state: make it a memo over what ` + `the effect reads and every reader gets it in the same flush.` : `If "${s.name}" is computed from what the effect reads, make it a memo so readers ` + `get it in the same flush; if the write reads something outside the graph (layout, ` + `time), the tear is the cost of measuring.`;
    const w = `[EFFECT_RELAY_TEAR] ${p} "${nodeName(e)}" ran twice for one write of ` + `"${r.name}": once in the flush where "${r.name}" changed, and again after ` + `effect "${m}" relayed it by writing "${s.name}" — the first frame showed the ` + `new "${r.name}" with the stale "${s.name}"` + (c.count > 1 ? ` (${c.count} times so far)` : "") + `. ${g}`;
    emitDiagnostic({
        code: "EFFECT_RELAY_TEAR",
        kind: "perf",
        severity: h,
        message: w,
        nodeName: nodeName(e),
        data: {
            victim: nodeName(e),
            root: r.name,
            relay: m,
            wrote: s.name,
            copy: d,
            passthrough: d ? passthroughSource(i.node) ?? null : null,
            soleWriter: u,
            occurrences: c.count
        }
    }, e);
}

// --- Immutable updates in stores ---------------------------------------------

// `draft.user = { ...draft.user, name }` / `draft.items = [...draft.items,
// x]` / `draft.items = draft.items.filter(...)` — the React habit of
// producing a fresh container to change one leaf. The store tracks leaves, so
// a fresh container is pure cost: every reader of `user` (any path below it)
// re-runs for the one leaf that moved, where a draft mutation would re-run
// only the readers of `name`. The store's notify sees both containers at the
// write and reports a leaf census (identity on unwrapped values, capped); the
// verdict is the whole detector: a replacement whose leaves are mostly the
// SAME values is a spread-copy, and one whose leaves are mostly different is
// new data (reconcile's job — and UNSTABLE_LIST_IDENTITY's, downstream). Once
// per store path.
const immutableReported = new Set;

function checkImmutableUpdate(e, n, t, o, i, s) {
    if (immutableReported.has(e) || t < 2) return;
    // Push/filter/splice copies change the length by a little; a wholesale
    // resize is a different operation even if some items survive.
        if (n && Math.abs(i - t) > Math.max(1, t >> 2)) return;
    // At least half the leaves carried over unchanged, and at least one did.
        if (o === 0 || o * 2 < t) return;
    const r = t - o;
    const a = n ? "array" : "object";
    const c = n ? `mutate the draft in place (push/splice/index assignment) so only the touched ` + `indices notify` : `assign the leaf on the draft (\`${e}.<key> = …\`) so only readers of that key re-run`;
    const d = `[IMMUTABLE_UPDATE_IN_STORE] "${e}" was replaced with a fresh ${a} whose ` + `${n ? "items" : "leaves"} are mostly the same values (${o} of ${t} unchanged` + `${r > 0 ? `, ${r} changed` : ""}) — a spread-copy update. The store already ` + `tracks ${n ? "items" : "leaves"}; a new container makes every reader of "${e}" ` + `re-run for the ${r === 1 ? "one that" : "few that"} moved. Instead, ${c}. For ` + `data arriving from outside (a fetch result), merge it with reconcile(data, key)(${e}).`;
    // The subject is the store's own owner, not the writer's context: the
    // finding is about the store, and its writes legitimately arrive from
    // outside the graph (an event handler, an adapter). Falls back to the
    // ambient context (emitDiagnostic's default) when the store recorded none.
        const f = emitDiagnostic({
        code: "IMMUTABLE_UPDATE_IN_STORE",
        kind: "perf",
        severity: "warn",
        message: d,
        nodeName: e,
        data: {
            path: e,
            shape: a,
            total: t,
            unchanged: o,
            changed: r
        }
    }, s);
    // Paths are not unique across stores: an excluded owner's store (an
    // adapter's own "store.list") must not spend the app's once-per-path slot.
        if (isSuppressed(f)) return;
    immutableReported.add(e);
}

// --- Unstable list identity -----------------------------------------------------

// `<For>` keyed by identity (the default) treats every new object as a new
// row. When a re-fetch hands back fresh objects for the same records, or a
// spread-copy rebuilds the array, most rows are disposed and recreated —
// DOM, state, focus, and all — for data that did not change. mapArray knows
// exactly which items exited and entered; pairing them (by `id` when the
// items carry one, else by position) and sampling shallow equivalence turns
// that into a verdict: churn that replaced equivalent records is unstable
// identity, not a new list. A key function that still churns has the same
// disease one level up (its keys are not stable). Once per list.
const LIST_CHURN_SAMPLE = 8;

const listIdentityWarned = new WeakSet;

function recordId(e) {
    if (e === null || typeof e !== "object") return undefined;
    const n = e;
    return n.id ?? n.key ?? n.yn ?? undefined;
}

function checkListIdentity(e, n, t, o, i) {
    if (listIdentityWarned.has(e)) return;
    // Most of the list turned over, and the turnover was a swap (rows out ≈ rows in).
        if (t.length < 2 || t.length * 2 < o) return;
    if (Math.abs(n.length - t.length) > Math.max(1, t.length >> 2)) return;
    // Pair exited with entered: by record id when present, else by position.
        const s = new Map;
    for (const e of n) {
        const n = recordId(e);
        if (n !== undefined) s.set(n, e);
    }
    let r = 0;
    let a = 0;
    const c = Math.max(1, Math.floor(t.length / LIST_CHURN_SAMPLE));
    for (let e = 0; e < t.length && r < LIST_CHURN_SAMPLE; e += c) {
        const o = t[e];
        const i = recordId(o);
        const c = i !== undefined ? s.get(i) : n[e];
        if (c === undefined || !isPlainShape(c) || !isPlainShape(o)) continue;
        r++;
        if (shallowEquivalent(c, o)) a++;
    }
    if (r === 0 || a * 2 < r) return;
    listIdentityWarned.add(e);
    const d = nodeName(e);
    const f = i ? `The key function returned different keys for equivalent records — return a stable ` + `field (\`keyed: item => item.id\`), not the object or a computed value that changes ` + `with the fetch.` : `Key the list by a stable field (\`keyed: item => item.id\`), or merge the data into ` + `a store with reconcile(data, "id") so the same records keep the same identity.`;
    const u = `[UNSTABLE_LIST_IDENTITY] list "${d}" recreated ${t.length} of ${o} rows on ` + `an update where the entering items are equivalent to the ones they replaced ` + `(${a} of ${r} sampled pairs identical field-for-field) — fresh objects ` + `for the same records, so identity keying threw away every row's DOM and state and ` + `rebuilt it. ${f}`;
    reportDiagnostic(emitDiagnostic({
        code: "UNSTABLE_LIST_IDENTITY",
        kind: "perf",
        severity: "warn",
        message: u,
        nodeName: d,
        data: {
            removed: n.length,
            created: t.length,
            length: o,
            sampled: r,
            equivalent: a,
            keyed: i
        }
    }, e));
}

/** Provenance of an async landing: the flight, under the interaction that started it. */ function asyncOrigin(e) {
    const n = {
        kind: "async",
        name: nodeName(e)
    };
    const t = liveFlights.get(e)?.interaction;
    if (t !== undefined) n.interaction = t;
    return n;
}

// WeakMaps: an errored/abandoned flight must not leak its node or block GC.
const liveFlights = new WeakMap;

const landedFlights = new WeakMap;

/**
 * Flight-object identity → earliest known start. Fed by markFlight() (the
 * cooperative preload/cache declaration — populated even while attribution
 * is disabled, so navigation-time marks survive a later enable()) and by
 * first sightings at registration.
 */ const flightOrigins = new WeakMap;

let waterfallLog = [];

/** Deepest landed-flight cause reachable through a cause list (derived links included). */ function flightCauseIn(e) {
    let n = null;
    for (const t of e) {
        let e = null;
        if (t.kind === "async") e = landedFlights.get(t) ?? null; else if (t.kind === "derived" && t.causes) e = flightCauseIn(t.causes);
        if (e !== null && (n === null || e.chain.length > n.chain.length)) n = e;
    }
    return n;
}

/**
 * The nearest enclosing frame with causes: create runs carry null (a node
 * born inside a parent's recompute inherits the parent's causality — the
 * boundary-reveal case, and the lazy sibling whose first pull is gated behind
 * an earlier not-ready read), so walk down to the first re-run frame.
 */ function enclosingCauses() {
    for (let e = frames.length - 1; e >= 0; e--) {
        const n = frames[e].causes;
        if (n !== null) return n;
    }
    return null;
}

/** The flight's face as a record, at the moment it landed or was superseded. */ function emitFlight(e, n, t, o) {
    if (excludedNode(e)) return;
    const i = {
        nodeId: devId(e),
        nodeName: nodeName(e),
        at: n.origin,
        durationMs: t - n.origin,
        outcome: o
    };
    const s = ownerPath(e);
    if (s !== undefined) i.ownerPath = s;
    if (n.interaction !== undefined) i.interaction = n.interaction;
    records.emit("flight", i, e);
}

function trackFlightStart(e, n) {
    const t = now();
    const o = flightOrigins.get(n) ?? t;
    if (o === t) flightOrigins.set(n, t);
    // Census: a flight still in the air when the node starts another was
    // superseded — its answer will be discarded.
        const i = liveFlights.get(e);
    for (const n of folds) n.flightStart?.(e, i !== undefined);
    if (i !== undefined) {
        if (records.observed("flight")) emitFlight(e, i, t, "abandoned");
        checkAbandonedFlights(e, i);
    }
    const s = enclosingCauses();
    const r = {
        origin: o,
        startSeq: changeSeq,
        chain: []
    };
    // Provenance: the flight belongs to whatever interaction caused the
    // recompute that started it (a create run under a click's handler — a
    // freshly mounted async node — inherits the ambient interaction instead).
        const a = s !== null ? interactionIn(s) : currentInteraction ?? undefined;
    if (a !== undefined) r.interaction = a;
    if (options.waterfalls !== false && s !== null) {
        let e = flightCauseIn(s);
        // The sequentiality test. A marked/previously-seen flight whose origin
        // predates the upstream landing was in the air alongside it: parallel.
                if (e !== null && o < e.landedAt) e = null;
        if (e !== null) r.chain = [ ...e.chain, {
            name: e.name,
            ms: e.ms
        } ];
    }
    liveFlights.set(e, r);
}

/**
 * Flight landed (whether or not the value committed — the wall time was
 * spent either way). Attach the measurement to the landing's fresh "async"
 * stamp so downstream flights can chain through it, then judge the chain.
 */ function finalizeFlight(e) {
    const n = liveFlights.get(e);
    if (n === undefined) return;
    liveFlights.delete(e);
    const t = now();
    const o = t - n.origin;
    for (const n of folds) n.flightLanded?.(e, o);
    if (records.observed("flight")) emitFlight(e, n, t, "landed");
    const i = e.ze;
    // Only a stamp this landing produced may carry the measurement — a stale
    // async record from a previous landing must not be re-labeled.
        if (i !== undefined && i.kind === "async" && i.seq > n.startSeq) landedFlights.set(i, {
        name: nodeName(e),
        ms: o,
        chain: n.chain,
        landedAt: t
    });
    checkWaterfall(e, n.chain, o);
}

function checkWaterfall(e, n, t) {
    const o = options.waterfalls;
    if (o === false) return;
    if (n.length > 0) {
        waterfallLog.push({
            chain: [ ...n, {
                name: nodeName(e),
                ms: t
            } ],
            sequentialMs: n.reduce((e, n) => e + n.ms, t)
        });
        if (waterfallLog.length > options.historyLimit) waterfallLog.shift();
    }
    // The verdict: trailing run of links that were each a real wait. A fast
    // tail (settled preload/cache hit) or a fast upstream breaks the sequence.
        if (t < o.minFlightMs) return;
    let i = 1;
    let s = t;
    for (let e = n.length - 1; e >= 0 && n[e].ms >= o.minFlightMs; e--) {
        i++;
        s += n[e].ms;
    }
    if (i < 2) return;
    const r = e;
    if ((r.Nn ?? 0) >= i) return;
    r.Nn = i;
    const a = [ ...n.slice(n.length - (i - 1)), {
        name: nodeName(e),
        ms: t
    } ];
    const c = a.map(e => `"${e.name}" (${e.ms.toFixed(0)}ms)`).join(" → ");
    const d = `[ASYNC_WATERFALL] ${i} sequential async flights — ${c} — ` + `${s.toFixed(0)}ms serialized: each began only after the previous resolved ` + `(as far as this graph can see). If a later request doesn't need the earlier ` + `response, derive both from the same inputs so they start together; if the ` + `dependency is intrinsic, preload the dependent data or join the requests ` + `server-side. If this work WAS already started elsewhere (a preloader or request ` + `cache), have that layer stamp its promises with attribution.markFlight() ` + `from "@solidjs/signals/attribution".`;
    // Depth 2 is advisory-only (structured consumers see it; the console does
    // not): a 2-chain can be an intrinsic data dependency or an unmarked
    // preload. A 3+ chain that survived the origin test is near-certainly
    // structural — that one earns the console.
        const f = i > 2 ? "warn" : "info";
    emitDiagnostic({
        code: "ASYNC_WATERFALL",
        kind: "perf",
        severity: f,
        message: d,
        nodeName: nodeName(e),
        data: {
            chain: a.map(e => ({
                name: e.name,
                ms: e.ms
            })),
            sequentialMs: s
        }
    }, e);
}

const holdStates = new WeakMap;

let activeHold = null;

let holdLog = [];

/** Companions are optimistic nodes too; `_parentSource` marks them. So is a
 * memo carrying a DERIVED override (lanes stage, #3479) — a lane pass's
 * result, not a write anyone made: neither is an acknowledgement. */ function isCompanion(e) {
    return !!e.o && e.o.$n !== undefined || (e.C & CONFIG_DERIVED_OVERRIDE) !== 0;
}

const HOLD_CENSUS_CAP = 1e4;

function acknowledge(e, n, t, o) {
    const i = `${n}:${t}`;
    const s = e.acknowledgements.get(i);
    const r = o !== null ? ownerPath(o) : undefined;
    // A later census (a merged transition, the settle pass) may find the
    // reader an earlier one missed.
        if (s === undefined) e.acknowledgements.set(i, r !== undefined ? {
        kind: n,
        source: t,
        reader: r
    } : {
        kind: n,
        source: t
    }); else if (r !== undefined) s.reader ??= r;
}

function censusRegistrations(e, n) {
    const t = {
        left: HOLD_CENSUS_CAP
    };
    for (const o of e.bn) if (!isCompanion(o)) acknowledge(n, "optimistic", nodeName(o), reachesEffect(o, t));
    for (const t of e.En) acknowledge(n, "optimistic", t?._name ?? "store", null);
    for (const o of e.A) acknowledge(n, "affects", nodeName(o), reachesEffect(o, t));
}

/**
 * Does anything that paints read `companion` — an effect, through however many
 * memos? A subscriber alone is not acknowledgement: memos compute eagerly, so a
 * router's `createMemo(() => isPending(location))` subscribes to the companion
 * whether or not the app ever renders the memo. Only an effect is the screen.
 * Returns the first effect found (the reader), or null.
 */ function reachesEffect(e, n) {
    const t = new Set([ e ]);
    const o = [ e ];
    while (o.length > 0 && n.left-- > 0) {
        const e = o.pop();
        for (let n = e.u; n !== null; n = n.Pe) {
            const e = n.Ae;
            if (e.He) return e;
            if (!t.has(e)) {
                t.add(e);
                o.push(e);
            }
        }
    }
    return null;
}

/** Companions an effect reads, anywhere downstream of the hold's nodes. */ function censusCompanions(e, n) {
    const t = new Set;
    const o = [ ...e ];
    const i = {
        left: HOLD_CENSUS_CAP
    };
    while (o.length > 0 && t.size < HOLD_CENSUS_CAP) {
        const e = o.pop();
        if (t.has(e)) continue;
        t.add(e);
        const s = e.o;
        if (s) {
            let t;
            if (s.xe !== undefined && (t = reachesEffect(s.xe, i))) acknowledge(n, "isPending", nodeName(e), t);
            if (s.Me !== undefined && (t = reachesEffect(s.Me, i))) acknowledge(n, "latest", nodeName(e), t);
            for (let e = s.i ?? null; e !== null; e = e.ge ?? null) o.push(e);
        }
        for (let n = e.u; n !== null; n = n.Pe) o.push(n.Ae);
    }
}

function holdState(e) {
    let n = holdStates.get(e);
    if (n === undefined) {
        n = {
            start: now(),
            flushes: 0,
            blockers: new Set,
            acknowledgements: new Map,
            painted: 0,
            action: false
        };
        holdStates.set(e, n);
    }
    return n;
}

function trackHoldStart(e) {
    // Navigations and interactions learn they are held regardless of hold
    // tracking: their settle must wait for the transition either way (see flushEnd).
    markNavigationsHeld(e);
    markInteractionsHeld(e);
    if (options.holds === false) return;
    const n = holdState(e);
    n.flushes++;
    if (e.tt.length > 0) n.action = true;
    for (const [t, o] of e.ae) if (o.size > 0) n.blockers.add(t);
    censusRegistrations(e, n);
    activeHold = n;
}

function trackHoldMerge(e, n) {
    mergeInteractionsHeld(e, n);
    const t = holdStates.get(n);
    if (t === undefined) return;
    holdStates.delete(n);
    const o = holdState(e);
    if (t.start < o.start) o.start = t.start;
    o.flushes += t.flushes;
    o.painted += t.painted;
    o.action ||= t.action;
    for (const e of t.blockers) o.blockers.add(e);
    for (const [e, n] of t.acknowledgements) if (!o.acknowledgements.has(e)) o.acknowledgements.set(e, n);
}

function trackHoldSettled(e) {
    const n = holdStates.get(e);
    if (n === undefined) {
        // No hold was recorded (the transition completed in its first flush, or
        // hold tracking is off): navigations and interactions staged in it still
        // settle here.
        settleNavigations(e, undefined);
        settleInteractionsHeld(e, undefined);
        return;
    }
    holdStates.delete(e);
    // Root writes only: a memo in _pendingNodes is a derived hold, and the
    // question is whether the USER's input went unanswered.
        const t = [];
    let o = null;
    let i;
    let s;
    let r = -Infinity;
    for (const n of e.In) {
        if (typeof n.Se === "function" || isCompanion(n)) continue;
        const e = n.ze;
        if (e === undefined || e.kind !== "write") continue;
        if (o === null) o = n;
        const a = {
            name: nodeName(n),
            prev: e.prev,
            value: e.value
        };
        if (e.origin !== undefined) a.origin = e.origin;
        t.push(a);
        // Earliest interaction among the held writes: the user has been waiting
        // since the first thing they did that this transaction is holding.
                const c = interactionOf(e.origin);
        if (c !== undefined && (i === undefined || c.at < i.at)) i = c;
        // The declared frame the writes belong to — earliest navigation, by the
        // same reasoning.
                if (e.origin?.kind === "navigation" && (s === undefined || e.origin.at < s.at)) s = e.origin;
        // Latest write: a signal written twice while held carries the later
        // stamp, so this is the user's final input, not their first.
                if (e.at !== undefined && e.at > r) r = e.at;
    }
    if (t.length === 0) {
        settleNavigations(e, undefined);
        settleInteractionsHeld(e, undefined);
        return;
    }
    censusRegistrations(e, n);
    censusCompanions([ ...e.In, ...n.blockers ], n);
    const a = now();
    // The hold began no later than its first parked flush; an interaction stamp
    // reaches further back (dispatch). A node rewritten mid-hold keeps only its
    // latest record, so the surviving interaction may be a later one — the
    // flush clock keeps the first wait from being forgotten.
        const c = Math.min(n.start, i !== undefined ? i.at : Infinity);
    const d = a - c;
    const f = r === -Infinity ? d : Math.min(d, a - r);
    const u = [ ...n.acknowledgements.values() ];
    // The verdicts, stamped on the record so a consumer — in-process or
    // offline — applies the engine's own tiering rather than a threshold of
    // its own: silent is duration-free (the finding adds the floor); long is
    // the tail against `longHolds.infoMs` as the options stand at settle.
        const l = options.longHolds;
    const h = {
        at: c,
        holdMs: d,
        tailMs: f,
        flushes: n.flushes,
        heldWrites: t,
        blockers: [ ...n.blockers ].map(nodeName),
        acknowledgements: u,
        paintedDuringHold: n.painted,
        action: n.action,
        silent: n.painted === 0 && u.length === 0,
        long: l !== false && l !== undefined && f >= l.infoMs
    };
    if (i !== undefined) h.interaction = i;
    if (s !== undefined) h.origin = s;
    holdLog.push(h);
    if (holdLog.length > options.historyLimit) holdLog.shift();
    // Bottom-up delivery: the hold, then the navigations it held, then the
    // interactions those belong to — each record complete when its parent is.
    // `live` is the first held root write's signal: the subject the findings
    // below name.
        records.emit("hold", h, o);
    checkStackedHolds(e, h, o);
    settleNavigations(e, h);
    settleInteractionsHeld(e, h);
    for (const e of folds) e.hold?.(h);
    if (h.silent) checkSilentHold(h, o); else checkLongHold(h, o);
}

function describeHeldWrites(e) {
    return e.heldWrites.map(e => e.prev !== undefined ? `"${e.name}" (${e.prev} → ${e.value})` : `"${e.name}"`).join(", ");
}

function describeBlockers(e, n) {
    return e.blockers.length > 0 ? ` ${n} ${e.blockers.map(e => `"${e}"`).join(", ")}` : "";
}

/**
 * The boundary repair, shared by LONG_HOLD and a long SILENT_HOLD: a wait
 * this long should show a fallback, not a stale screen. A `Loading` boundary
 * lifts the write out of the hold only when it has not revealed yet or its
 * `on` prop changed — a revealed boundary with no `on` IS the stale screen.
 */ function boundaryRepair(e) {
    const n = e.heldWrites[0]?.name ?? "key";
    return `A wait this long is past what a stale screen should carry: show a fallback instead. Put ` + `the reader behind a Loading boundary keyed on what changed — <Loading on={${n}()} ` + `fallback={…}> — so the write commits at once and the fallback shows where the data lands; ` + `a boundary that has already revealed keeps the old content unless \`on\` changes. If the ` + `data itself is the problem, preload it or cache it so the wait never gets this long.`;
}

function holdData(e) {
    const n = {
        holdMs: e.holdMs,
        tailMs: e.tailMs,
        flushes: e.flushes,
        heldWrites: e.heldWrites.map(e => e.name),
        blockers: e.blockers,
        action: e.action
    };
    if (e.interaction !== undefined) n.interaction = {
        type: e.interaction.name,
        target: e.interaction.target
    };
    if (e.origin?.kind === "navigation") n.navigation = navigationData(e.origin);
    return n;
}

/**
 * Who the verdict sentence starts from: the interaction, with the navigation
 * it performed in parentheses — `click on a.nav (navigation to /users/:id)`;
 * the navigation alone when nothing user-dispatched is known (a redirect);
 * empty when neither is.
 */ function holdActor(e) {
    const n = e.origin !== undefined ? formatOrigin(e.origin) : "";
    if (e.interaction !== undefined) return `${formatOrigin(e.interaction)}${n ? ` (${n})` : ""}`;
    return n;
}

function checkSilentHold(e, n) {
    const t = options.holds;
    if (t === false) return;
    if (e.holdMs < t.infoMs) return;
    const o = e.holdMs.toFixed(0);
    const i = describeHeldWrites(e);
    const s = describeBlockers(e, "waiting on");
    // With the interaction (or navigation) stamped the sentence starts from
    // what the user did; without it, from the writes.
        const r = holdActor(e);
    const a = r ? `${r} ` : "";
    let c = e.action ? `[SILENT_HOLD] ${a}${a ? "started an action that" : "an action"} held ${i} for ` + `${o}ms${s} and the screen showed nothing for the whole round-trip: no optimistic ` + `value, no isPending() reader, no affects() mark, and no effect ran while it was held. ` + `Pair the action with a createOptimistic/createOptimisticStore write for the expected ` + `outcome (it reverts on failure), or co-write a createOptimistic(false) "saving" flag ` + `the UI reads.` : `[SILENT_HOLD] ${a}${a ? "wrote" : "writes to"} ${i}${a ? "; the write was" : " were"} ` + `held ${o}ms${s} and the screen showed nothing for the wait: no ` + `isPending()/latest() reader downstream, no optimistic value, no affects() mark, and no ` + `effect ran while it was held — the interaction was dead for ${o}ms. Show the wait: ` + `read isPending(() => ${e.blockers[0] ?? "source"}()) to render a busy state, or ` + `latest(${e.heldWrites[0].name}) to reveal the new input immediately while the data ` + `catches up. The hold itself is correct — do not "fix" this by moving the write off the ` + `async path.`;
    const d = e.long;
    if (d) c += ` ${boundaryRepair(e)}`;
    const f = e.holdMs >= t.warnMs ? "warn" : "info";
    const u = holdData(e);
    u.long = d;
    emitDiagnostic({
        code: "SILENT_HOLD",
        kind: "responsiveness",
        severity: f,
        message: c,
        nodeName: nodeName(n),
        data: u
    }, n);
}

function checkLongHold(e, n) {
    const t = options.longHolds;
    if (t === false || t === undefined) return;
    if (e.tailMs < t.infoMs) return;
    const o = e.tailMs.toFixed(0);
    const i = describeHeldWrites(e);
    const s = describeBlockers(e, "waiting on");
    const r = holdActor(e);
    const a = r ? `${r} ` : "";
    const c = e.acknowledgements.length > 0 ? `${e.acknowledgements.map(e => `"${e.kind}:${e.source}"`).join(", ")} said it was pending` : `an effect painted meanwhile`;
    const d = e.tailMs < e.holdMs - 1 ? ` after the last input (${e.holdMs.toFixed(0)}ms in all)` : "";
    const f = `[LONG_HOLD] ${a}${a ? "wrote" : "writes to"} ${i}; the screen kept the old ` + `content for ${o}ms${d}${s} — ${c}, but the hold ran on well past ` + `the point where "loading" over stale content reads as broken. ${boundaryRepair(e)}`;
    const u = e.tailMs >= t.warnMs ? "warn" : "info";
    const l = holdData(e);
    l.acknowledgements = e.acknowledgements;
    emitDiagnostic({
        code: "LONG_HOLD",
        kind: "responsiveness",
        severity: u,
        message: f,
        nodeName: nodeName(n),
        data: l
    }, n);
}

/**
 * The person saw the guess, then the correction. An optimistic value is a
 * promise the UI makes about the outcome; when the outcome differs — the
 * action failed and the override lifted back to the old value, or the
 * source answered with something else — the screen changes twice for one
 * intent. Expected on failure and correct by construction (the override
 * reverts; that is the feature), so `info`: a count that grows for one
 * source is what says the guess, or the failure rate, is wrong. Judged by
 * the node's own equality, so a structurally equal replacement is not a
 * revert.
 */ function checkOptimisticRevert(e, n, t, o) {
    // The runtime's own optimistic nodes are not guesses the person saw: an
    // `isPending()` companion goes true while pending and back to false at
    // commit by design — the acknowledgement SILENT_HOLD asks for — and a
    // derived override promotes rather than reverts. Same predicate the hold
    // census uses to skip them.
    if (!options.optimisticReverts || isCompanion(e)) return;
    // Method call, as every commit path does: store slot nodes share one
    // comparator that reads `this._host` (#3687).
        const i = e.Fe;
    if (i && i.call(e, n, t)) return;
    const s = nodeName(e);
    // The two values are user data: quoted only under `values: "full"`; the
    // other levels say what happened without saying what was shown.
        const r = options.values === "full";
    const a = o === "superseded" ? "settled to" : "reverted to";
    const c = `[OPTIMISTIC_REVERTED] the optimistic value of ${s} ` + (r ? `showed ${preview(n)}; it ${a} ${preview(t)}.` : `${o === "superseded" ? "was superseded by the settled value" : "reverted at settle"}.`) + ` The person saw the guess, then the correction. A revert on failure is the feature; one ` + `that recurs says the guess is wrong for this input or the action fails often — show the ` + `failure where the value renders (the action's catch, an Errored boundary) rather than ` + `letting the value snap back on its own.`;
    const d = {
        source: s,
        how: o
    };
    if (r) {
        d.shown = preview(n);
        d.truth = preview(t);
    }
    emitDiagnostic({
        code: "OPTIMISTIC_REVERTED",
        kind: "responsiveness",
        severity: "info",
        message: c,
        nodeName: s,
        data: d
    }, e);
}

// --- Graph growth -----------------------------------------------------------------
/** Per route: the graph's size at its last `visits` settles, oldest first. */ const routeCounts = new Map;

/**
 * The live graph's size — a walk, not a counter: nothing is charged at node
 * creation, disposal, write or re-run; the engine asks at a navigation's
 * settle. Two passes. The owner tree from the registered top-level roots
 * gives `owners` and seeds the computations. Then each computation's
 * dependency links give `edges` and the `signals` and computations they
 * reach, and each newly met source's subscriber list gives the computations
 * that read it — including one created with no owner, which no chain holds
 * and only its sources keep alive: the subscription leak a heap snapshot
 * finds. Measured at 5–10 ns per link; a 50k-owner graph walks in under a
 * millisecond. Dormant nodes are spliced out of their chain and are not
 * counted unless a subscription still reaches them.
 */ function graphSize() {
    const e = liveRootOwners();
    const n = {
        roots: e.length,
        owners: 0,
        computations: 0,
        signals: 0,
        edges: 0
    };
    const t = new Set;
    // A worklist, not recursion: a subscriber chain can be thousands deep.
        const o = [];
    const i = [];
    const meet = e => {
        if (t.has(e)) return;
        t.add(e);
        if (typeof e.Se === "function") n.computations++; else n.signals++;
        o.push(e);
    };
    for (const t of e) {
        n.owners++;
        // Iterative: a deep tree must not grow the call stack.
                let e = t.On;
        for (;;) {
            while (e !== null) {
                n.owners++;
                if (typeof e.Se === "function") meet(e);
                if (e.On !== null) i.push(e);
                e = e._n;
            }
            const t = i.pop();
            if (t === undefined) break;
            e = t.On;
        }
    }
    for (let e = 0; e < o.length; e++) {
        const t = o[e];
        // Whoever reads this node: owned computations are already known; an
        // ownerless one is met only here.
                for (let e = t.u; e !== null; e = e.Pe) meet(e.Ae);
        if (typeof t.Se === "function") for (let e = t.Ee; e !== null; e = e.Ie) {
            n.edges++;
            meet(e.De);
        }
    }
    return n;
}

/**
 * settleNavigation: the app has finished moving to a route — count the live
 * graph. One record per settle for a listener; the growth check compares
 * this settle of the route with its previous ones. A count that climbs on
 * consecutive visits is something the previous visit left behind: a
 * `createRoot` in an effect with no dispose, a subscription a component
 * registered outside its owner. Nothing here runs per node; the walk is
 * the cost, at navigation cadence.
 */ const GRAPH_SERIES = [ "owners", "computations", "signals", "edges" ];

function trackGraph(e) {
    const n = options.graphGrowth;
    if (n === false && !records.observed("graph")) return;
    const t = graphSize();
    const o = e.name ?? e.to;
    const i = {
        at: now(),
        ...t,
        navigation: e
    };
    if (o !== undefined) i.route = o;
    records.emit("graph", i, undefined);
    if (n === false || o === undefined) return;
    let s = routeCounts.get(o);
    if (s === undefined) routeCounts.set(o, s = []);
    s.push(t);
    if (s.length > n.visits) s.shift();
    if (s.length < n.visits) return;
    // Any series climbing on every visit to the ratio is growth; which ones
    // did says what leaked — computations with owners flat is an ownerless
    // effect per visit, edges alone is a subscription per visit to something
    // long-lived, owners is an undisposed root.
        const r = GRAPH_SERIES.filter(e => {
        for (let n = 1; n < s.length; n++) if (s[n][e] <= s[n - 1][e]) return false;
        return s[s.length - 1][e] >= s[0][e] * n.ratio;
    });
    if (r.length === 0) return;
    // The count is the whole graph's, so a leak shows at every route's settle;
    // the first route to complete its climb reports, naming the others seen.
        const a = [ ...routeCounts.keys() ];
    const c = r.map(e => `${e} ${s.map(n => n[e]).join(" → ")}`).join("; ");
    const d = r.includes("owners") ? "a createRoot() in an effect or handler with no dispose, or a Portal or panel mounted per visit" : r.includes("computations") ? "an effect or memo created with no owner (a module-level or callback createEffect) that only its sources keep alive" : "a subscription per visit to something long-lived — a global store or signal read by a computation that outlives the visit";
    const f = `[GRAPH_GROWTH] the live graph grew on ${n.visits} consecutive visits to ${o}: ${c} ` + `(${t.roots} roots)${a.length > 1 ? `, across visits to ${a.join(", ")}` : ""}. Each ` + `visit left something behind that the next did not reclaim — the shape says ${d}. Dispose ` + `what a visit creates (onCleanup, or return the disposer from onSettled) and own it under the ` + `route's component so leaving the route tears it down.`;
    const u = {
        route: o,
        grew: r,
        history: s.map(e => ({
            ...e
        })),
        roots: t.roots,
        routes: a
    };
    if (e.interaction !== undefined) u.interaction = {
        type: e.interaction.name,
        target: e.interaction.target
    };
    reportDiagnostic(emitDiagnostic({
        code: "GRAPH_GROWTH",
        kind: "perf",
        severity: "warn",
        message: f,
        data: u
    }, null));
    // Judged once for the graph, not once per route: the next verdict needs
    // another `visits` climbing settles.
        routeCounts.clear();
}

// --- Feedback-table findings -----------------------------------------------------
/** Per async source: abandoned flights inside the current window. Engine-side; the node carries nothing. */ const abandonWindows = new WeakMap;

/**
 * One source abandoning flight after flight inside a window: every input
 * asked again and the earlier answers were thrown away — the
 * request-per-keystroke signature `feedback().flights[].abandoned` counts,
 * as a finding while it happens. Warned once per window per source.
 */ function checkAbandonedFlights(e, n) {
    const t = options.abandonedFlights;
    if (t === false || excludedNode(e)) return;
    const o = Date.now();
    let i = abandonWindows.get(e);
    if (i === undefined || o - i.start > t.windowMs) {
        i = {
            start: o,
            count: 0,
            warned: false
        };
        abandonWindows.set(e, i);
    }
    i.count++;
    if (i.warned || i.count < t.count) return;
    i.warned = true;
    const s = nodeName(e);
    const r = n.interaction !== undefined ? ` (${formatOrigin(n.interaction)} started the first)` : "";
    const a = `[ABANDONED_FLIGHTS] "${s}" abandoned ${i.count} flights in ${t.windowMs}ms` + `${r}: each was superseded by the next before it landed, so every input asked again and the ` + `answers were discarded. Put a debounced or equality-gated derivation between the input and ` + `the fetch, or key the fetch on what changes rather than on every keystroke; a preload the ` + `flights share (markFlight) reads as one flight, not many.`;
    const c = {
        source: s,
        abandoned: i.count,
        windowMs: t.windowMs
    };
    if (n.interaction !== undefined) c.interaction = {
        type: n.interaction.name,
        target: n.interaction.target
    };
    emitDiagnostic({
        code: "ABANDONED_FLIGHTS",
        kind: "responsiveness",
        severity: "warn",
        message: a,
        nodeName: s,
        data: c
    }, e);
}

/**
 * A fallback that appeared and vanished: the other end of the SILENT_HOLD
 * spectrum — feedback for a wait too short to need it, which reads as a
 * flicker. `info`, once per flash; `feedback().fallbacks[].flashes` is the
 * count. The repair is a preload, a cache, or lifting the fetch above the
 * boundary so the data is there before the boundary asks.
 */ function checkFallbackFlash(e, n, t) {
    if (e !== undefined && excludedNode(e)) return;
    const o = e !== undefined ? ownerPath(e)?.join(" › ") : undefined;
    const i = t !== undefined ? `${formatOrigin(t)}: ` : "";
    const s = `[FALLBACK_FLASH] ${i}the Loading fallback${o ? ` at ${o}` : ""} showed for ` + `${n.toFixed(0)}ms — a spinner that appeared and vanished, feedback for a wait too short ` + `to need it. Preload or cache the data so it is there before the boundary asks, or lift the ` + `read above the boundary; a fallback under ${FALLBACK_FLASH_MS}ms reads as a flicker.`;
    const r = {
        shownMs: n
    };
    if (t !== undefined) r.interaction = {
        type: t.name,
        target: t.target
    };
    emitDiagnostic({
        code: "FALLBACK_FLASH",
        kind: "responsiveness",
        severity: "info",
        message: s,
        data: r
    }, e ?? null);
}

/**
 * Several interactions waiting in one hold when it commits: the person kept
 * clicking or typing while the first answer was in the air, and all of them
 * waited on the same source. The pile is the symptom; the hold's own verdict
 * (SILENT_HOLD / LONG_HOLD) is the cause, so the repair is the same
 * acknowledgement, plus a control that does not accept the repeat.
 */ function checkStackedHolds(e, n, t) {
    const o = options.stackedHolds;
    if (o === false) return;
    let i = 0;
    for (const n of openInteractions) if (n.heldIn.has(e)) i++;
    if (i < o.count) return;
    const s = describeBlockers(n, "waiting on");
    const r = `[STACKED_HOLDS] ${i} interactions queued behind one hold${s} for ` + `${n.holdMs.toFixed(0)}ms: the person kept ${n.interaction?.name === "input" ? "typing" : "clicking"} ` + `while the first answer was in the air, and every repeat waited on the same source. ` + `Acknowledge the wait where the control is (isPending() to disable or dim it) so the repeats ` + `stop, or debounce the input; the hold itself is judged by SILENT_HOLD/LONG_HOLD.`;
    const a = holdData(n);
    a.interactions = i;
    emitDiagnostic({
        code: "STACKED_HOLDS",
        kind: "responsiveness",
        severity: "warn",
        message: r,
        nodeName: nodeName(t),
        data: a
    }, t);
}

const navStates = new WeakMap;

/** Opened, not yet settled. */ const openNavs = new Set;

let navigationLog = [];

/** Drains completed since enable() — the clock `writeDrain` reads. */ let drainSeq = 0;

/**
 * Copy what the router currently says onto the frame (what writes stamped —
 * `formatOrigin` reads it) and the event. Called when the frame opens, when a
 * redirect re-describes it, and when the record settles, so a description
 * refined during the hold is what every consumer ends up reading.
 */ function syncNavigation(e) {
    const {event: n, ref: t} = e;
    const o = n.origin;
    if (t.name === undefined) {
        delete o.name;
        delete n.name;
    } else o.name = n.name = t.name;
    if (t.to === undefined) {
        delete o.to;
        delete n.to;
    } else o.to = n.to = t.to;
    if (t.params === undefined) {
        delete o.params;
        delete n.params;
    } else o.params = n.params = t.params;
}

function openNavigation(e, n) {
    const t = {
        at: e.at,
        writes: 0,
        origin: e
    };
    if (n.initial === true) t.initial = true;
    if (e.from !== undefined) t.from = e.from;
    if (e.interaction !== undefined) t.interaction = e.interaction;
    const o = {
        event: t,
        ref: n,
        open: 1,
        held: false,
        writeDrain: drainSeq
    };
    syncNavigation(o);
    navStates.set(e, o);
    openNavs.add(o);
    navigationLog.push(t);
    if (navigationLog.length > options.historyLimit) navigationLog.shift();
    noteInteractionNavigation(t);
}

/** The navigation a redirect hop folds onto: the most recently opened one still pending. */ function lastOpenNavigation() {
    let e;
    for (const n of openNavs) e = n;
    return e;
}

/** A redirect re-describes `state`: the current destination becomes a hop it abandoned. */ function redirectNavigation(e, n) {
    const t = e.event;
    // As the router last described the destination being left behind.
        syncNavigation(e);
    const o = {
        at: n.at ?? now()
    };
    if (t.name !== undefined) o.name = t.name;
    if (t.to !== undefined) o.to = t.to;
    if (t.params !== undefined) o.params = t.params;
    (t.redirects ??= []).push(o);
    e.ref = n;
    e.open++;
    syncNavigation(e);
}

function closeNavigation(e) {
    const n = navStates.get(e);
    if (n === undefined || --n.open > 0) return;
    syncNavigation(n);
    // Nothing to wait for: no write survived the equality gate (navigating to
    // where we already are), or a drain inside the frame already committed
    // them (`flush(() => setLocation(…))`) with no hold.
        if (n.event.writes === 0 || !n.held && drainSeq > n.writeDrain) settleNavigation(n, "committed");
}

/** stampWrite: the record replacing `prior` on a node was just stamped. */ function noteNavigationWrite(e, n) {
    const t = n.origin;
    if (t.kind === "navigation") {
        const e = navStates.get(t);
        if (e !== undefined) {
            e.event.writes++;
            e.writeDrain = drainSeq;
        }
    }
    // The node now carries a different frame's record: whatever `prior`'s
    // navigation was waiting to show on it will never land as that navigation.
        const o = e?.origin;
    if (o !== undefined && o !== t && o.kind === "navigation") {
        const e = navStates.get(o);
        if (e !== undefined && openNavs.has(e)) settleNavigation(e, "superseded");
    }
}

/** holdStart: `t`'s staged writes are parked — their navigations settle with `t`. */ function markNavigationsHeld(e) {
    if (openNavs.size === 0) return;
    for (const n of e.In) {
        const e = n.ze?.origin;
        if (e?.kind !== "navigation") continue;
        const t = navStates.get(e);
        if (t !== undefined) t.held = true;
    }
}

/** transitionSettled: `t` commits — the navigations whose writes it staged are done. */ function settleNavigations(e, n) {
    if (openNavs.size === 0) return;
    for (const t of e.In) {
        const e = t.ze?.origin;
        if (e?.kind !== "navigation") continue;
        const o = navStates.get(e);
        if (o === undefined || !openNavs.has(o)) continue;
        // A navigation whose frame is still open when its transition commits
        // (`until()` inside the frame) settles here too: its writes are through.
                settleNavigation(o, o.held ? "held" : "committed", n);
    }
}

let openFlush = null;

function noteFlushRun(e, n, t) {
    if (n) e.created++; else e.runs++;
    if (t === undefined || e.interaction === null) return;
    if (e.interaction === undefined) e.interaction = t; else if (e.interaction !== t) e.interaction = null;
}

function trackFlushStart() {
    if (!records.observed("flush")) return;
    openFlush = {
        at: now(),
        runs: 0,
        created: 0,
        held: false,
        interaction: undefined
    };
}

/** The key for swaps no transaction carries — an object, so the map below can be weak. */ const DRAIN = {
    drain: true
};

const openFallbacks = new WeakMap;

// Weak on the transaction: one that is dropped without settling or merging
// (its boundary disposed, its queues discarded) takes its staged opens with it.
const stagedFallbacks = new WeakMap;

/** Bumped by `resetTracking` — the engine's install generation. */ let trackingGen = 0;

function trackFallback(e, n, t, o) {
    if (t) {
        // Folds count showings too, and the flash finding needs the show's
        // clock: an open is kept for any of the three audiences.
        const t = records.observed("fallback");
        if (!t && folds.length === 0 && options.fallbackFlashes === false) return;
        // The wait is the enclosing recompute's cause's interaction — the read
        // that registered the pending source runs inside one — else the ambient.
                const i = enclosingCauses();
        const s = o ?? DRAIN;
        const r = {
            at: now(),
            gen: trackingGen,
            record: t,
            boundary: e,
            tree: n,
            interaction: i !== null ? interactionIn(i) : currentInteraction ?? undefined,
            staged: s
        };
        openFallbacks.set(e, r);
        const a = stagedFallbacks.get(s);
        if (a === undefined) stagedFallbacks.set(s, [ r ]); else a.push(r);
        return;
    }
    const i = openFallbacks.get(e);
    if (i === undefined) return;
    openFallbacks.delete(e);
    if (i.staged !== null) {
        // Cleared before its commit: never on screen.
        const e = stagedFallbacks.get(i.staged);
        e.splice(e.indexOf(i), 1);
        if (e.length === 0) stagedFallbacks.delete(i.staged);
        return;
    }
    if (i.gen !== trackingGen) return;
    // The hide has the subtree the first show may have lacked.
        const s = n ?? i.tree;
    for (const n of folds) n.fallback?.(e, s, false);
    const r = now() - i.at;
    if (options.fallbackFlashes !== false && r < FALLBACK_FLASH_MS) checkFallbackFlash(s, r, i.interaction);
    if (!i.record) return;
    const a = {
        at: i.at,
        shownMs: r
    };
    const c = s !== undefined ? ownerPath(s) : undefined;
    if (c !== undefined) a.ownerPath = c;
    if (i.interaction !== undefined) a.interaction = i.interaction;
    records.emit("fallback", a, s);
}

/** flushEnd: the drain's committed swaps have rendered — those fallbacks are on screen from here. */ function displayFallbacks() {
    const e = stagedFallbacks.get(DRAIN);
    if (e === undefined) return;
    stagedFallbacks.delete(DRAIN);
    const n = now();
    for (const t of e) {
        t.staged = null;
        t.at = n;
        if (t.gen === trackingGen) for (const e of folds) e.fallback?.(t.boundary, t.tree, true);
    }
}

/** transitionSettled (`from` a transaction, into this drain) and
 * transitionMerged (`from` the outgoing, into the surviving transaction):
 * the swaps staged under `from` now land with `into`. */ function rebaseFallbacks(e, n) {
    const t = stagedFallbacks.get(e);
    if (t === undefined) return;
    stagedFallbacks.delete(e);
    for (const e of t) e.staged = n;
    const o = stagedFallbacks.get(n);
    if (o === undefined) stagedFallbacks.set(n, t); else o.push(...t);
}

/** flushEnd: every open, closed, unheld navigation's (and interaction's) writes just committed. */ function trackFlushEnd() {
    // The drain's own record first: the interactions it settles below waited on it.
    const e = openFlush;
    if (e !== null) {
        openFlush = null;
        const n = {
            at: e.at,
            durationMs: now() - e.at,
            runs: e.runs,
            created: e.created,
            held: e.held
        };
        if (e.interaction != null) n.interaction = e.interaction;
        records.emit("flush", n, undefined);
    }
    drainSeq++;
    // The swaps this drain committed have rendered.
        displayFallbacks();
    for (const e of openNavs) if (e.open === 0 && !e.held) settleNavigation(e, "committed");
    for (const e of openInteractions) maybeSettleInteraction(e);
}

function settleNavigation(e, n, t) {
    if (!openNavs.has(e)) return;
    openNavs.delete(e);
    syncNavigation(e);
    const o = e.event;
    o.settledMs = now() - o.at;
    o.outcome = n;
    if (t !== undefined) o.hold = t;
    // The initial declaration is not a navigation the person waited on: its
    // `settledMs` is document start → router built, which would read as the
    // route's responsiveness in the feedback tables. Consumers get the record.
        if (o.initial !== true) for (const e of folds) e.navigation?.(o);
    records.emit("navigation", o, undefined);
    trackGraph(o);
    // The interaction that performed it may have been waiting only on this.
        const i = openInteractionOf(o.interaction);
    if (i !== undefined) maybeSettleInteraction(i);
}

const interactionStates = new WeakMap;

/** Opened, not yet settled. */ const openInteractions = new Set;

let interactionLog = [];

function openInteraction(e, n) {
    const t = {
        name: e.name,
        at: e.at,
        handlerMs: 0,
        writes: 0,
        runs: 0,
        created: 0,
        runMs: 0,
        holds: [],
        navigations: [],
        origin: e
    };
    if (e.target !== undefined) t.target = e.target;
    // The runtime may date the frame from the event's own timestamp (before
    // any queued task ran); the gap to here is the input delay the browser's
    // INP counts first.
        if (n > t.at) t.inputDelayMs = n - t.at;
    const o = {
        event: t,
        open: true,
        opened: n,
        writeDrain: drainSeq,
        heldIn: new Set,
        held: false,
        excludedWrites: 0,
        awaiting: false,
        actioned: false
    };
    interactionStates.set(e, o);
    openInteractions.add(o);
    interactionLog.push(t);
    if (interactionLog.length > options.historyLimit) interactionLog.shift();
}

/**
 * How long the record waits on a handler's returned promise before settling
 * without it: a promise that never settles (a hung request, a listener
 * awaiting an event that never comes) must not keep the record open forever.
 */ const ASYNC_HANDLER_CAP_MS = 1e4;

/** interactionEnd: the handler returned. */ function closeInteraction(e, n) {
    const t = interactionStates.get(e);
    if (t === undefined) return;
    t.open = false;
    const o = now();
    t.event.handlerMs = o - t.opened;
    // `async () => { await save(); set(…) }` returns a promise and continues
    // past the frame; the person's wait is that continuation. The record stays
    // open until it settles (or the cap), then judges whether anything on
    // screen could have shown the wait.
        const i = n !== null && (typeof n === "object" || typeof n === "function") && typeof n.then === "function" ? n : null;
    if (i !== null) {
        t.awaiting = true;
        let e = false;
        let n;
        const settle = () => {
            if (e) return;
            e = true;
            if (n !== undefined) clearTimeout(n);
            if (!openInteractions.has(t)) return;
            t.awaiting = false;
            const i = now();
            t.event.continuationMs = i - o;
            checkUntrackedAsyncHandler(t);
            maybeSettleInteraction(t, i);
        };
        n = setTimeout(settle, ASYNC_HANDLER_CAP_MS);
        // A pending cap must not hold a Node process (tests, SSR harnesses) open.
                n.unref?.();
        // Both branches: a rejected handler promise still ended the wait.
                i.then(settle, settle);
        return;
    }
    maybeSettleInteraction(t, o);
}

/**
 * The handler awaited past its frame with nothing in the graph carrying the
 * wait: no root write before the `await` (a pending flag, an optimistic
 * value) and no action step (an action's steps stay attributed across
 * yields, and its holds are judged by SILENT_HOLD). From the person's side
 * the click did nothing for `continuationMs`; from the engine's side the
 * wait is invisible — no hold opened, so no hold could be acknowledged.
 * Thresholds are the hold thresholds: it is the same wait.
 */ function checkUntrackedAsyncHandler(e) {
    const n = options.holds;
    if (n === false) return;
    const t = e.event;
    const o = t.continuationMs;
    if (e.actioned || t.writes > 0 || o < n.infoMs) return;
    const i = formatOrigin(t.origin);
    const s = `[UNTRACKED_ASYNC_HANDLER] ${i}'s handler awaited ${o.toFixed(0)}ms past its frame with no ` + `write before the await: no hold opened, so nothing on screen could show the wait — the ` + `interaction was dead for ${o.toFixed(0)}ms. Make the async work an action() (its steps stay ` + `attributed across yields and its hold is judged), or write the pending state first: a ` + `createOptimistic(false) "saving" flag the UI reads.`;
    const r = o >= n.warnMs ? "warn" : "info";
    const a = {
        interaction: {
            type: t.name,
            target: t.target
        },
        continuationMs: o,
        capped: o >= ASYNC_HANDLER_CAP_MS
    };
    emitDiagnostic({
        code: "UNTRACKED_ASYNC_HANDLER",
        kind: "responsiveness",
        severity: r,
        message: s,
        data: a
    }, null);
}

/** The open record a frame runs under, if any. */ function openInteractionOf(e) {
    const n = interactionOf(e);
    if (n === undefined) return undefined;
    const t = interactionStates.get(n);
    return t !== undefined && openInteractions.has(t) ? t : undefined;
}

/** stampWrite: a root write stamped `origin`. */ function noteInteractionWrite(e, n) {
    const t = openInteractionOf(e);
    if (t === undefined) return;
    if (n) {
        t.excludedWrites++;
        return;
    }
    t.event.writes++;
    t.writeDrain = drainSeq;
}

/** recordRerun / a create run: work attributed to the interaction. */ function noteInteractionRun(e, n, t) {
    const o = openInteractionOf(e);
    if (o === undefined) return;
    o.event[t ? "created" : "runs"]++;
    o.event.runMs += n;
}

/** openNavigation: a navigation frame opened under the interaction. */ function noteInteractionNavigation(e) {
    const n = openInteractionOf(e.interaction);
    if (n !== undefined) n.event.navigations.push(e);
}

/** holdStart: `t` parked writes — the interactions that performed them wait for `t`. */ function markInteractionsHeld(e) {
    if (openInteractions.size === 0) return;
    for (const n of e.In) {
        const t = openInteractionOf(n.ze?.origin);
        if (t !== undefined) {
            t.heldIn.add(e);
            t.held = true;
        }
    }
}

/** transitionMerged: whoever waited for `outgoing` now waits for `target`. */ function mergeInteractionsHeld(e, n) {
    for (const t of openInteractions) if (t.heldIn.delete(n)) t.heldIn.add(e);
}

/** transitionSettled: `t` committed — its holders' writes are through. */ function settleInteractionsHeld(e, n) {
    if (openInteractions.size === 0) return;
    for (const t of openInteractions) {
        if (!t.heldIn.delete(e)) continue;
        if (n !== undefined) t.event.holds.push(n);
        maybeSettleInteraction(t);
    }
}

function maybeSettleInteraction(e, n = now()) {
    const t = e.event;
    if (e.open || e.awaiting || e.heldIn.size > 0) return;
    // A drain must have committed the last write (the handler's, or a redirect
    // hop's after the click's own drain) — the handler returning is not the
    // screen having it.
        if (t.writes > 0 && drainSeq <= e.writeDrain) return;
    for (const e of t.navigations) if (e.outcome === undefined) return;
    openInteractions.delete(e);
    // Every write went to an excluded subject and nothing of the app's ran: the
    // click was on the observer's own UI (a devtools panel's button). Not a
    // fact about the app — forget it rather than report a dead interaction.
        if (t.writes === 0 && e.excludedWrites > 0 && t.runs === 0 && t.created === 0) {
        const e = interactionLog.indexOf(t);
        if (e !== -1) interactionLog.splice(e, 1);
        return;
    }
    t.settledMs = n - t.at;
    t.outcome = t.writes === 0 ? "idle" : e.held ? "held" : "committed";
    records.emit("interaction", t, undefined);
}

/** The serializable face of a navigation origin for diagnostic `data`. */ function navigationData(e) {
    const n = {};
    if (e.name !== undefined) n.name = e.name;
    if (e.to !== undefined) n.to = e.to;
    if (e.from !== undefined) n.from = e.from;
    if (e.params !== undefined) n.params = e.params;
    return n;
}

// The engine's implementation of the core's dev hook points. Installed by
// enable(), uninstalled by disable() — while uninstalled the core pays one
// null check per site and nothing else.
let asyncStartSeq = 0;

let asyncStartTime = 0;

let asyncStartValue;

const engineHooks = {
    interactionStart: interactionStart,
    interactionEnd: interactionEnd,
    originStart: originStart,
    originEnd: originEnd,
    flushStart() {
        trackFlushStart();
    },
    flushEnd() {
        trackFlushEnd();
    },
    recomputeStart(e, n) {
        const t = n ? null : collectCauses(e);
        frames.push({
            start: now(),
            childMs: 0,
            causes: t,
            // The record's dep diff needs the deps as they were: captured here,
            // and only when the record will have an audience (see wantsRerun).
            prevDeps: n || !wantsRerun() ? null : captureDeps(e),
            // Mirror recompute's own prev-value resolution: an earlier run in the
            // same flush may still be holding in _pendingValue.
            prevValue: e._e !== NOT_PENDING ? e._e : e.ce,
            // A create run inherits the interaction of whatever is building it: the
            // enclosing recompute (a parent's fn creating children) or, at the top
            // of the recompute stack, the effect callback / handler frame.
            interaction: t !== null ? interactionIn(t) : frames.length > 0 ? frames[frames.length - 1].interaction : enclosingInteraction()
        });
    },
    derivedChanged(e) {
        const n = frames[frames.length - 1];
        stampDerived(e, n !== undefined && n.causes !== null ? n.causes : []);
    },
    recomputeEnd(e, n, t, o, i, s) {
        const r = frames.pop();
        // enable() can land mid-recompute: no opening frame, nothing to report.
                if (r === undefined) return;
        const a = now() - r.start;
        if (frames.length > 0) frames[frames.length - 1].childMs += a;
        const c = Math.max(0, a - r.childMs);
        // Effect-output honesty: effects run with `_equals: false`, so core
        // reports EVERY effect recompute as changed — which made effect waste
        // invisible to costs() (and compiled JSX bindings are effects: the
        // fan-out waste a naive selected-row produces is all effects). The
        // engine re-derives the fact from its own snapshot: an identical
        // committed compute output is an unchanged run. `undefined` outputs are
        // exempt — a side-effect-only compute's work IS its effect phase, and
        // identity of `undefined` proves nothing.
                if (t && r.causes !== null && e.He) {
            const n = e._e !== NOT_PENDING ? e._e : e.ce;
            if (n !== undefined && n === r.prevValue) t = false;
        }
        // Unstable-output check: memos only, non-create, plain runs with a
        // committed change. The fresh value sits in `_pendingValue` for held
        // plain-flush memo commits and in `_value` for direct ones. Overlay runs
        // are excluded — an optimistic re-derive legitimately produces fresh
        // equivalents while the lane settles.
                if (r.causes !== null && t && !o && !i && !e.He) checkUnstableOutput(e, r.prevValue, e._e !== NOT_PENDING ? e._e : e.ce);
        if (r.causes !== null) recordRerun(e, r, {
            selfMs: c,
            totalMs: a
        }, t, o ? "optimistic" : i ? "held" : "plain", s); else if (!excludedNode(e)) {
            // Creation runs still get the wide-scope check: a memo can be born with
            // its coarse-read problem already in place — and their time is charged
            // to the interaction building them (the interaction record's `created`).
            checkDepWidth(e);
            noteInteractionRun(r.interaction, c, true);
            // The first effect callback runs with no re-run record to inherit from;
            // hand it the interaction that built the node (see effectRunStart).
                        e.pn = r.interaction;
            if (openFlush !== null) noteFlushRun(openFlush, true, r.interaction);
            if (records.observed("create")) {
                const n = {
                    at: r.start,
                    nodeKind: nodeKind(e),
                    nodeName: nodeName(e),
                    nodeId: devId(e),
                    depCount: captureDeps(e).length,
                    selfMs: c,
                    totalMs: a,
                    phase: o ? "optimistic" : i ? "held" : "plain",
                    held: s
                };
                if (r.interaction !== undefined) n.interaction = r.interaction;
                records.emit("create", n, e);
            }
        }
        markSeen(e);
    },
    write(e, n, t) {
        stampWrite(e, "write", n, t);
    },
    refreshed(e) {
        stampWrite(e, "refresh");
    },
    flightStart(e, n) {
        trackFlightStart(e, n);
    },
    asyncStart(e) {
        asyncStartSeq = e.ze?.seq ?? 0;
        asyncStartTime = e.Ge;
        asyncStartValue = e.ce;
    },
    asyncEnd(e, n, t, o) {
        if (o) {
            // Core calls this unconditionally (hook calls cannot live inside its
            // try blocks — see attribution-hooks.ts), so committed-ness is detected
            // here against the asyncStart snapshot: a direct commit moves `_value`
            // (or `_time`, for a same-reference commit under `equals: false`), and
            // a transition hold parks the value in `_pendingValue`. A landing the
            // equality gate swallowed moves none of them and must leave no stamp.
            const o = e.ce !== asyncStartValue || e.Ge !== asyncStartTime || e._e === t;
            if (o) stampWrite(e, "async", n === undefined ? NO_VALUES : n, t);
            // Flight over either way — an equality-swallowed landing still spent
            // the wall time (finalizeFlight only chains through a fresh stamp).
                        finalizeFlight(e);
            return;
        }
        // Landed through setSignal: reclassify its "write" stamp as an async
        // landing — but only if it actually stamped (the value changed) since
        // asyncStart; a no-change landing must leave no fresh stamp behind.
                const i = e.ze;
        if (i !== undefined && i.seq > asyncStartSeq && i.kind === "write") stampWrite(e, "async", NO_VALUES, t);
        finalizeFlight(e);
    },
    effectRunStart(e) {
        pushFrame("effect", nodeName(e), e.pn, e);
        // The frame's own `at` doubles as the record's start: set only while
        // listened, so a listener arriving mid-callback finds no start and the
        // end emits nothing for it — and an unlistened callback pays no clock read.
                if (records.observed("effect")) originFrames[originFrames.length - 1].at = now();
    },
    effectRunEnd(e) {
        const n = originFrames[originFrames.length - 1];
        if (n !== undefined && n.kind === "effect" && n.at !== undefined) {
            if (!excludedNode(e)) {
                const t = {
                    at: n.at,
                    durationMs: now() - n.at,
                    nodeId: devId(e),
                    nodeName: nodeName(e)
                };
                if (n.run !== undefined) t.run = n.run;
                if (n.interaction !== undefined) t.interaction = n.interaction;
                records.emit("effect", t, e);
            }
        }
        popFrame("effect");
        if (activeHold !== null) activeHold.painted++;
    },
    actionStepStart(e, n) {
        // Steps after a yield resume from a promise callback with no ambient
        // interaction; the one that started the action (its first step) is the
        // action's interaction for every step.
        let t = actionInteractions.get(e);
        if (t === undefined && !actionInteractions.has(e)) {
            t = currentInteraction ?? undefined;
            actionInteractions.set(e, t);
            // The handler's async work is an action's: tracked across yields.
                        const n = t !== undefined ? interactionStates.get(t) : undefined;
            if (n !== undefined) n.actioned = true;
        }
        pushFrame("action", n, t);
    },
    actionStepEnd() {
        popFrame("action");
    },
    holdStart(e) {
        if (openFlush !== null) openFlush.held = true;
        trackHoldStart(e);
    },
    holdEnd() {
        activeHold = null;
    },
    transitionSettled(e) {
        trackHoldSettled(e);
        rebaseFallbacks(e, DRAIN);
    },
    transitionMerged(e, n) {
        trackHoldMerge(e, n);
        rebaseFallbacks(n, e);
    },
    storeReplaced(e, n, t, o, i, s) {
        checkImmutableUpdate(e, n, t, o, i, s);
    },
    listChurn(e, n, t, o, i) {
        checkListIdentity(e, n, t, o, i);
    },
    boundaryFallback(e, n, t, o) {
        // The folds hear the show at its display (see trackFallback), not here.
        trackFallback(e, n, t, o ?? null);
    },
    optimisticReverted(e, n, t, o) {
        checkOptimisticRevert(e, n, t, o);
    },
    currentOrigin() {
        return ambientOrigin();
    }
};

const holds = [];

/**
 * The windows: what a consumer reads back — the ring buffers, the once-only
 * warning memories (so a new window can warn again), the hot-cause windows,
 * the folds' tables. Reset by every `enable()` (each opens a fresh window)
 * and by the last `disable()`. Never touches the live tracking state —
 * open frames, open interactions and navigations, the active hold,
 * `drainSeq` — which belongs to whoever is mid-flight when a second
 * consumer arrives.
 */ function resetWindows() {
    history = [];
    waterfallLog = [];
    holdLog = [];
    navigationLog = [];
    interactionLog = [];
    reportedCycles.clear();
    relays.clear();
    immutableReported.clear();
    hotCauses.clear();
    for (const e of folds) e.reset?.();
}

/** The live tracking state — reset only when the engine is (un)installed. */ function resetTracking() {
    frames.length = 0;
    activeHold = null;
    openFlush = null;
    stagedFallbacks.delete(DRAIN);
    trackingGen++;
    openNavs.clear();
    openInteractions.clear();
    routeCounts.clear();
    drainSeq = 0;
    originFrames.length = 0;
    effectStack.length = 0;
    interactionStack.length = 0;
    currentInteraction = null;
}

/**
 * One hold's request in full: the defaults for what it left unsaid (an
 * explicit `undefined` is unsaid), and `checks: false` folding its five cost
 * checks off before anyone else's request is considered.
 */ function resolveHold(e) {
    const n = {
        ...defaultOptions
    };
    if (e !== undefined) {
        for (const t of Object.keys(e)) {
            const o = e[t];
            if (o !== undefined) n[t] = o;
        }
    }
    if (!n.checks) {
        n.hotRuns = false;
        n.hotTime = false;
        n.wideDeps = false;
        n.unstableMemos = false;
        n.fanOut = false;
        n.wastedRecompute = false;
    }
    return n;
}

/** `values` levels by how much they carry: the merge takes the lowest. */ const VALUES_RANK = {
    none: 0,
    labels: 1,
    full: 2
};

/**
 * The more demanding of two settings for one key: `true` over `false`, the
 * larger `historyLimit`, a threshold config over `false`, and between two
 * configs the field values that fire sooner — the lower count, budget or
 * millisecond bound, the longer `windowMs`. For `values` "more demanding"
 * is LESS data: the level that carries the least wins, so a holder that
 * must not see user data is never overruled by one that wants it.
 */ function demanding(e, n, t) {
    if (e === "values") return VALUES_RANK[n] <= VALUES_RANK[t] ? n : t;
    if (typeof n === "boolean") return n || t;
    if (e === "historyLimit") return Math.max(n, t);
    if (n === false) return t;
    if (t === false) return n;
    if (typeof n === "number") return Math.min(n, t);
    const o = {};
    for (const e in n) {
        const i = n[e];
        const s = t[e];
        o[e] = e === "windowMs" ? Math.max(i, s) : Math.min(i, s);
    }
    return o;
}

/**
 * Recompute the options in effect: each live hold's request resolved, then
 * combined per key by the most demanding value — the one that has the
 * engine observe more, report more or keep more. A hold says what it wants
 * and can only add to what another hold asked for, never take it away, so
 * the result does not depend on the order the holds were taken: the console
 * log prints while any holder wants it, a check runs while any holder wants
 * it and at the most sensitive threshold anyone asked for, the ring buffer
 * is the largest requested, and records carry the least user data any
 * holder allows (`values`). With no hold outstanding the defaults stand.
 */ function applyOptions() {
    if (holds.length === 0) {
        options = {
            ...defaultOptions
        };
        return;
    }
    const e = resolveHold(holds[0].opts);
    for (let n = 1; n < holds.length; n++) {
        const t = resolveHold(holds[n].opts);
        for (const n in e) e[n] = demanding(n, e[n], t[n]);
    }
    options = e;
}

/** The last hold is gone (or `disable()` was called): uninstall and clear everything. */ function uninstall() {
    holds.length = 0;
    applyOptions();
    attributionActive = false;
    resetWindows();
    resetTracking();
    setAttributionHooks(null);
}

const attribution = {
    enable(e) {
        const n = {
            opts: e
        };
        holds.push(n);
        applyOptions();
        resetWindows();
        if (!attributionActive) {
            attributionActive = true;
            resetTracking();
            setAttributionHooks(engineHooks);
        }
        return () => {
            const e = holds.indexOf(n);
            if (e === -1) return;
            holds.splice(e, 1);
            if (holds.length === 0) uninstall(); else applyOptions();
        };
    },
    disable() {
        uninstall();
    },
    history(e) {
        let n;
        switch (e) {
          case "rerun":
            n = history;
            break;

          case "waterfall":
            n = waterfallLog;
            break;

          case "hold":
            n = holdLog;
            break;

          case "navigation":
            n = navigationLog;
            break;

          case "interaction":
            n = interactionLog;
            break;

          default:
            throw new Error(`attribution.history: unknown record type "${String(e)}"`);
        }
        // The buffers are typed by their variable; the switch is the proof.
                return n;
    },
    markFlight(e, n = now()) {
        // Earliest wins: re-marking (a cache re-serving the same promise) must
        // not move the origin later.
        const t = flightOrigins.get(e);
        if (t === undefined || n < t) flightOrigins.set(e, n);
    }
};

export { FALLBACK_FLASH_MS, attribution, formatOrigin, formatRerun, graphSize, nodeIdOf, nodeName, now, registerFold, rootsOf };