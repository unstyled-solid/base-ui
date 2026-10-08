let attrHooks = null;

/**
 * The installed engine, registered on `globalThis` as well (the records
 * channel's reason, see `Records`): a wire layer bundled without a framework
 * import — `@solidjs/web`'s server-function client — stamps the records it
 * emits through the engine's `currentOrigin`, and this is its reach. The
 * module binding stays the core's own read (one null check per hook site);
 * the registration mirrors it.
 */ const INSTALLED = Symbol.for("@solidjs/signals/observe/attribution");

function setAttributionHooks(t) {
    attrHooks = t;
    globalThis[INSTALLED] = t ?? undefined;
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
 */ function withInteraction(t, n) {
    // Pin the engine for the frame: a handler that disables it mid-way must
    // still close the frame it opened (the engine tolerates a close after
    // disable()), and one that enables it mid-way opened no frame to close.
    const o = attrHooks;
    if (o === null) return n();
    o.interactionStart(t);
    let i;
    try {
        return i = n();
    } finally {
        o.interactionEnd(i);
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
 */ function withOrigin(t, n) {
    const o = attrHooks;
    if (o === null) return n();
    o.originStart(t);
    try {
        return n();
    } finally {
        o.originEnd();
    }
}

/**
 * The provenance a root write performed now would carry, as the installed
 * engine sees it (`AttributionHooks.currentOrigin`); `undefined` with no
 * engine, or when nothing is in effect. Reachable as
 * `OBSERVE.attribution.currentOrigin` — how a runtime stamps a fact of its
 * own (a server-function call) with the interaction or navigation it ran
 * for, so an observer joins the two by identity.
 */ function currentOrigin() {
    const t = attrHooks;
    return t === null ? undefined : t.currentOrigin();
}

export { attrHooks, currentOrigin, setAttributionHooks, withInteraction, withOrigin };