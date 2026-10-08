import { nodeName, attribution, nodeIdOf } from "./attribution.js";

import { $REFRESH } from "./constants.js";

/**
 * Point queries over the engine's live state — the devtools/console view of
 * one scope. Their own module so a records-only consumer never ships them;
 * they read the engine's ring buffer and the graph, and register nothing.
 */
/** The node behind a memo/effect accessor, or the raw node passed through. */ function nodeOf(n) {
    return n?.[$REFRESH] ?? n;
}

/**
 * Re-run history for one scope — pass a memo/effect accessor or raw node,
 * or a scope's name as a string (an out-of-process consumer such as the
 * diagnostics bridge holds no node, only the `nodeName` the records
 * carry). Records name their scope by `nodeId`; a node that has never run
 * under the engine has none, and no history. By name, every scope of that
 * name answers. A view of `history("rerun")`, so it shares that buffer's
 * gate: runs nothing wanted a record of (no `rerun` listener, fold or log
 * at the time) left no record and are not here — a console session that
 * wants them subscribes or imports a fold first.
 */ function why(n) {
    const t = attribution.history("rerun");
    if (typeof n === "string") return t.filter(t => t.nodeName === n);
    const o = nodeIdOf(nodeOf(n));
    if (o === undefined) return [];
    return t.filter(n => n.nodeId === o);
}

/**
 * Current dependency names of one scope — the devtools subscription view.
 * Read from the graph, not a record, so it answers with or without an
 * audience for re-run records (and with the engine disabled).
 */ function subscriptions(n) {
    const t = nodeOf(n);
    const o = [];
    for (let n = t?.Ee ?? null; n !== null; n = n.Ie) o.push(nodeName(n.De));
    return o;
}

export { subscriptions, why };