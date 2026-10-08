import { registerFold, rootsOf } from "./attribution.js";

/**
 * `costs()` — the cost tables: scopes ranked by the self-time they burn,
 * root writes ranked by the downstream re-run time they cause. Folded from
 * every `RerunEvent` as the engine records it.
 *
 * Its own module on purpose: the tables register with the engine's fold seam
 * when this module is evaluated, so an observe-tier consumer that only
 * subscribes to records (an APM adapter) never ships the accumulation or the
 * tables; a consumer that imports `costs` gets both. Reset with the engine on
 * `enable()`/`disable()`.
 */ const scopeCosts = new Map;

const writeCosts = new Map;

function recordCosts(s, o) {
    let t = scopeCosts.get(s);
    if (t === undefined) {
        t = {
            name: o.nodeName,
            kind: o.nodeKind,
            runs: 0,
            selfMs: 0,
            wastedMs: 0,
            overlayMs: 0
        };
        scopeCosts.set(s, t);
    }
    t.runs++;
    t.selfMs += o.selfMs;
    if (o.phase !== "plain") t.overlayMs += o.selfMs; else if (!o.changed && !o.held) t.wastedMs += o.selfMs;
    const e = new Set;
    rootsOf(o.causes, e);
    for (const s of e) {
        let t = writeCosts.get(s);
        if (t === undefined) writeCosts.set(s, t = {
            name: s,
            runs: 0,
            downstreamMs: 0
        });
        t.runs++;
        t.downstreamMs += o.selfMs;
    }
}

registerFold({
    rerun: recordCosts,
    reset() {
        scopeCosts.clear();
        writeCosts.clear();
    }
});

/**
 * Aggregated cost tables since `enable()`: `scopes` ranked by self-time
 * (with `wastedMs` = time spent on unchanged-value runs), `writes` ranked by
 * total downstream re-run time each root write caused.
 */ function costs() {
    return {
        scopes: [ ...scopeCosts.values() ].sort((s, o) => o.selfMs - s.selfMs),
        writes: [ ...writeCosts.values() ].sort((s, o) => o.downstreamMs - s.downstreamMs)
    };
}

export { costs };