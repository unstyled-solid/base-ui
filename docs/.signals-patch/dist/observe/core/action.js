import { setOrigin, globalQueue, activeTransition, currentTransition, schedule, actionStepDepth, flush, enterActionStep, exitActionStep } from "./scheduler.js";

import { isThenable } from "./async.js";

import "./core.js";

import "./dev.js";

import { attrHooks } from "./attribution-hooks.js";

/** Invocation order across all actions — the provenance every slice of an
 * action runs under (scheduler `origin`): the flights and overrides its
 * ambient windows issue are stamped with it, so a later action's override
 * can tell this action's late answer from its own (#3331). */ let actionSeq = 0;

function restoreTransition(t, e, r) {
    const n = setOrigin(t);
    globalQueue.initTransition(e);
    const i = r();
    // A nested action resuming synchronously (its body yielded a non-thenable)
    // runs this inside the OUTER action's slice: draining here would park the
    // shared transaction and detach the outer body's remaining writes (the
    // flush() rule, scheduler.ts). The outer step's own return drains.
        if (actionStepDepth === 0) flush();
    setOrigin(n);
    return i;
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
 */ function action(t) {
    return (...e) => new Promise((r, n) => {
        const i = t(...e);
        const o = ++actionSeq;
        // The first slice's window runs to the scheduled flush, which clears
        // the provenance with the window — no restore here.
                setOrigin(o);
        globalQueue.initTransition();
        let s = activeTransition;
        s.tt.push(i);
        s.et = true;
        const done = (t, e, o = false) => {
            s = currentTransition(s);
            const u = s.tt.indexOf(i);
            if (u >= 0) s.tt.splice(u, 1);
            // Re-adopt through initTransition like every other resumption site:
            // a bare setActiveTransition leaves globalQueue._batch as a detached
            // ambient batch, and anything registered before the scheduled flush
            // (held writes on a merging transition, optimistic overrides,
            // affects() marks) lands there with nothing to ever finalize it.
                        globalQueue.initTransition(s);
            schedule();
            o ? n(e) : r(t);
        };
        const step = (e, r) => {
            let n;
            // Attribution hooks bracket the synchronous slice of generator body
            // this step runs (up to the next yield): writes inside are the
            // action's. Both sites sit outside the try (attribution-hooks.ts).
                        if (attrHooks !== null) attrHooks.actionStepStart(i, t.name || undefined);
            // The body is on the stack between these brackets: flush() is
            // refused inside (FLUSH_IN_ACTION, scheduler.ts).
                        enterActionStep();
            try {
                n = r ? i.throw(e) : i.next(e);
            } catch (t) {
                exitActionStep();
                if (attrHooks !== null) attrHooks.actionStepEnd(i);
                return done(undefined, t, true);
            }
            exitActionStep();
            if (attrHooks !== null) attrHooks.actionStepEnd(i);
            // A rejected iterator result (async generators) means the error already
            // escaped the generator body — it is completed, and throwing back in
            // would just reject again forever. Settle instead.
                        if (isThenable(n)) return void n.then(run, t => done(undefined, t, true));
            run(n);
        };
        const run = t => {
            if (t.done) return done(t.value);
            // Thenable assimilation can itself throw synchronously (a `then`
            // getter, or a `then()` method that throws — #2918). Match `await`
            // semantics: the failure is thrown back into the generator at the
            // yield point (catchable there); if uncaught, step()'s guard settles
            // the action so its iterator never leaks in the transition. The
            // settled flag implements A+ 2.3.3.3.4.1: a throw after the thenable
            // already called a callback is ignored.
                        let e = false;
            try {
                if (isThenable(t.value)) return void t.value.then(t => {
                    if (e) return;
                    e = true;
                    restoreTransition(o, s, () => step(t));
                }, t => {
                    if (e) return;
                    e = true;
                    restoreTransition(o, s, () => step(t, true));
                });
            } catch (t) {
                if (e) return;
                e = true;
                return void restoreTransition(o, s, () => step(t, true));
            }
            restoreTransition(o, s, () => step(t.value));
        };
        step();
    });
}

export { action };