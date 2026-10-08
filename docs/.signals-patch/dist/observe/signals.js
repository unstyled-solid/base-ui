import { TimeoutError } from "./core/error.js";

import { computed, optimisticComputed, setSignal, optimisticSignal, runWithOwner, setMemo, signal, installAuthoritativeRead, markRefresh, read, untrack } from "./core/core.js";

import { cleanup, createRoot, getOwner, dispose, getObserver } from "./core/owner.js";

import { globalQueue, dirtyQueue, Queue, entangleConfirmingTransitions, activeTransition } from "./core/scheduler.js";

import { CONFIG_AUTO_DISPOSE, CONFIG_CHILDREN_FORBIDDEN, EFFECT_USER, $REFRESH, CONFIG_DIRECT_COMMIT, CONFIG_AUTHORITATIVE_READ, CONFIG_FRESH_READ } from "./core/constants.js";

import "./core/invariants.js";

import { registerGraph } from "./core/dev.js";

import "./core/verdict.js";

import { effect, trackedEffect } from "./core/effect.js";

import { installOptimisticEngine } from "./core/optimistic.js";

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
 */ function onCleanup(e) {
    return cleanup(e);
}

function accessor(e) {
    const t = read.bind(null, e);
    t[$REFRESH] = e;
    return t;
}

function createSignal(e, t) {
    if (typeof e === "function") {
        const r = computed(e, t);
        r.C &= ~CONFIG_AUTO_DISPOSE;
        return [ accessor(r), setMemo.bind(null, r) ];
    }
    const r = signal(e, t);
    registerGraph(r, getOwner());
    return [ accessor(r), setSignal.bind(null, r) ];
}

function createMemo(e, t) {
    return accessor(computed(e, t));
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
 */ function createEffect(e, t, r) {
    effect(e, t.effect || t, t.error, {
        user: true,
        ...r
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
 */ function createRenderEffect(e, t, r) {
    effect(e, t, undefined, r);
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
 */ function createTrackedEffect(e, t) {
    trackedEffect(e, t);
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
 */ function createReaction(e, t) {
    let r = undefined;
    cleanup(() => r?.());
    const n = getOwner();
    // The currently armed effect node. `track()` replaces the previous
    // subscription (1.x semantics): without disposing the superseded arm, its
    // sources stayed live (firing the callback for replaced dependencies), each
    // accumulated arm delivered its own fire, and un-fired arms leaked as live
    // effect nodes until the owner disposed (#2861).
        let i;
    return o => {
        if (i) {
            dispose(i);
            i = undefined;
        }
        runWithOwner(n, () => {
            effect(() => (o(), i = getOwner()), t => {
                i = undefined;
                r?.();
                const n = (e.effect || e)?.();
                if (false && n !== undefined && typeof n !== "function") ;
                r = n;
                dispose(t);
            }, e.error, {
                ...t,
                user: true,
                defer: true
            });
        });
    };
}

/** Delivers effect applies on a microtask instead of queueing them (#2930). */ class MicrotaskQueue extends Queue {
    enqueue(e, t) {
        queueMicrotask(() => t(e));
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
 */ function resolve(e) {
    return new Promise((t, r) => {
        createRoot(n => {
            // Deliver effect applies on a microtask instead of the owner queue: an
            // incomplete transition stashes its effect queues until it settles, but
            // an action yielding this promise is itself what keeps the transition
            // open — the stashed res() deadlocked the action (#2930). The compute
            // still runs in place (under the transaction's view when created inside
            // an action step), and status/boundary notifications keep their normal
            // route through the inherited queue.
            const i = getOwner();
            const o = new MicrotaskQueue;
            o._parent = i.T;
 // notify() forwards up the normal chain
                        i.T = o;
            // A user effect rather than a bare computed: computeds are pull-based and
            // are only re-enqueued when a pending source *resolves* — a rejection just
            // marks them errored, so nothing would re-run and the promise would never
            // settle (#2842). The effect's error channel is notified on rejection.
                        effect(e, e => {
                t(e);
                n();
            }, e => {
                // The error arm already unwraps StatusError (#2840) — `err` is the
                // user's original error, matching what error boundaries expose.
                r(e);
                n();
            }, 
            // DIRECT_COMMIT: a source settling INTO the held transaction (e.g. a
            // refresh this action issued) stages its landing; the effect's own
            // recompute must not stage too, or the microtask apply reads the
            // stale mainline value and resolves with old data.
            {
                user: true,
                Qt: CONFIG_DIRECT_COMMIT
            });
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
 */ function refresh(e) {
    const t = e?.[$REFRESH];
    if (!t) {
        return Promise.resolve(undefined);
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
    
    // An authoritative reader is woken through a late-bound hook when the truth
    // lands EQUAL to a standing override (the A17-silent path). Every setter of
    // that reader bit must install it — until() does, and this waiter is the
    // other one (#3303: refresh of an optimistic in an app that never called
    // until() dereferenced the null hook).
        installAuthoritativeRead();
    markRefresh(t);
    const r = new Promise((r, n) => {
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
            let i = null;
            const make = () => effect(() => {
                if (i === null) {
                    i = getOwner();
                    const e = new MicrotaskQueue;
                    e._parent = i.T;
                    i.T = e;
                }
                return read(t);
            }, t => {
                r(typeof e === "function" ? t : e);
                dispose(i);
            }, e => {
                n(e);
                dispose(i);
            }, {
                user: true,
                Qt: CONFIG_DIRECT_COMMIT | CONFIG_AUTHORITATIVE_READ | CONFIG_FRESH_READ
            });
            make();
        });
    });
    // Fire-and-forget refresh must not turn a failed refetch into an unhandled
    // rejection; awaiting callers attach their own handlers to `promise`.
        r.catch(() => {});
    return r;
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
 */ function until(e, t) {
    // Late-bind the wakeup hook for the A17-silent ack paths (pay-for-use:
    // apps that never call until() never retain it).
    installAuthoritativeRead();
    // Flip-entanglement (#3164 follow-up): the transaction this until() holds
    // open (the action's, when yielded from one). The predicate is the user's
    // declaration of what confirms it — when a foreign transition's staged
    // write flips it truthy, that transition merges here and reveals at the
    // joint settle instead of painting the confirmation under live optimism.
        const r = activeTransition;
    return new Promise((n, i) => {
        const o = t?.signal;
        if (o?.aborted) return i(o.reason);
        createRoot(c => {
            // Same delivery contract as resolve() (#2930): effect applies ride a
            // microtask so the promise can settle while the transaction the caller
            // yielded it into is still open — that transaction being open is the
            // entire point of the hold.
            const u = getOwner();
            const s = new MicrotaskQueue;
            s._parent = u.T;
            u.T = s;
            let f;
            let a;
            const settle = e => {
                if (f !== undefined) clearTimeout(f);
                if (a !== undefined) o.removeEventListener("abort", a);
                e();
                c();
            };
            effect(r === null ? e : () => {
                const t = e();
                // Runs inside the compute (pure phase): the confirming
                // transition's stamps are live and its commit hasn't run, so
                // the merge lands before any reveal. Falsy evaluations skip —
                // non-flipping updates were never named as the confirmation.
                                if (t) entangleConfirmingTransitions(getObserver(), r);
                return t;
            }, e => {
                // Falsy is "not yet": keep the subscription live and wait for the
                // next evaluation. Only a truthy settled value resolves.
                if (e) settle(() => n(e));
            }, e => settle(() => i(e)), 
            // AUTHORITATIVE_READ: overrides invisible to the predicate.
            // DIRECT_COMMIT: truth that stages into the held transaction (a
            // refresh the action issued) must flow through to the microtask
            // apply — a staged effect value would deadlock the hold on data
            // the hold itself is keeping uncommitted.
            {
                user: true,
                Qt: CONFIG_AUTHORITATIVE_READ | CONFIG_DIRECT_COMMIT
            });
            if (t?.timeout !== undefined) f = setTimeout(() => settle(() => i(new TimeoutError)), t.timeout);
            if (o !== undefined) {
                a = () => settle(() => i(o.reason));
                o.addEventListener("abort", a, {
                    once: true
                });
            }
        });
    });
}

function createOptimistic(e, t) {
    // Install before the node exists: only engine-installed programs can carry
    // an _overrideValue slot (same runtime-install pattern as
    // GlobalQueue._clearOptimisticStore in createOptimisticStore).
    installOptimisticEngine();
    if (typeof e === "function") {
        const r = optimisticComputed(e, t);
        r.C &= ~CONFIG_AUTO_DISPOSE;
        return [ accessor(r), setSignal.bind(null, r) ];
    }
    const r = optimisticSignal(e, t);
    registerGraph(r, getOwner());
    return [ accessor(r), setSignal.bind(null, r) ];
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
 */ function onSettled(e) {
    const t = getOwner();
    t && !(t.C & CONFIG_CHILDREN_FORBIDDEN) ? trackedEffect(() => untrack(e), {
        name: "onSettled"
    }) : globalQueue.enqueue(EFFECT_USER, function fire() {
        // Settled means derived. A settle that reverts optimism (or replays
        // gated reads) only enqueues the affected subscribers; the pass after
        // the commit re-derives them. Fired in the commit pass, the callback
        // read the optimistic source already reverted beside a sync memo of it
        // still holding the optimistic value — reads do not pull (#3411). Fall
        // to the next pass while the heap has work; `run` swapped the queue,
        // so this lands there, and `enqueue` keeps the drain alive.
        if (dirtyQueue.EE >= dirtyQueue.st) return globalQueue.enqueue(EFFECT_USER, fire);
        // Unowned, out-of-band fire (no owner, or a children-forbidden one this
        // one-shot must not bind to): a returned cleanup has no lifecycle to
        // attach to. Reject it in dev; in production the return is simply
        // dropped — never bound to an unrelated owner or run eagerly.
                e();
    });
}

export { accessor, createEffect, createMemo, createOptimistic, createReaction, createRenderEffect, createSignal, createTrackedEffect, onCleanup, onSettled, refresh, resolve, until };