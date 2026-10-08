import { registerFold, now, FALLBACK_FLASH_MS, formatOrigin, nodeName } from "./attribution.js";

import { ownerPath } from "./dev.js";

/**
 * `feedback()` — what the user waited on, as ranked tables. Folded from the
 * records the engine already keeps (holds, the interaction on each re-run,
 * navigations) and two censuses the engine reports as they happen (flights
 * started/landed/abandoned per async source; fallback shows per boundary).
 *
 * Its own module on purpose: the tables register with the engine's fold seam
 * when this module is evaluated, so an observe-tier consumer that only
 * subscribes to records never ships them. Reset with the engine on
 * `enable()`/`disable()`.
 */ const feedbackSources = new Map;

const feedbackInteractions = new Map;

const feedbackNavigations = new Map;

const flightStats = new Map;

const fallbackStats = new Map;

function flightBucket(e) {
    let n = flightStats.get(e);
    if (n === undefined) {
        n = {
            source: nodeName(e),
            flights: 0,
            landed: 0,
            abandoned: 0,
            landedMs: 0,
            worstMs: 0
        };
        flightStats.set(e, n);
    }
    return n;
}

function trackFallback(e, n, t) {
    let s = fallbackStats.get(e);
    if (s === undefined) {
        s = {
            row: {
                boundary: "boundary",
                shows: 0,
                shownMs: 0,
                worstMs: 0,
                flashes: 0
            },
            shownAt: null
        };
        fallbackStats.set(e, s);
    }
    // The first show can fire before the subtree exists; name on first sight.
        if (s.row.boundary === "boundary" && n !== undefined) {
        const e = ownerPath(n);
        if (e !== undefined) s.row.boundary = e.join(" › ");
    }
    if (t) {
        if (s.shownAt === null) {
            s.shownAt = now();
            s.row.shows++;
        }
        return;
    }
    if (s.shownAt === null) return;
    const i = now() - s.shownAt;
    s.shownAt = null;
    s.row.shownMs += i;
    if (i > s.row.worstMs) s.row.worstMs = i;
    if (i < FALLBACK_FLASH_MS) s.row.flashes++;
}

function interactionBucket(e) {
    const n = formatOrigin(e);
    let t = feedbackInteractions.get(n);
    if (t === undefined) {
        t = {
            row: {
                interaction: n,
                dispatches: 0,
                runs: 0,
                selfMs: 0,
                worstDispatchMs: 0,
                holds: 0,
                heldMs: 0,
                silentMs: 0,
                worstHoldMs: 0
            },
            dispatches: new Map
        };
        feedbackInteractions.set(n, t);
    }
    const s = e.at ?? 0;
    if (!t.dispatches.has(s)) {
        t.dispatches.set(s, 0);
        t.row.dispatches++;
    }
    return t;
}

function recordFeedbackRun(e) {
    if (e.interaction === undefined) return;
    const n = interactionBucket(e.interaction);
    n.row.runs++;
    n.row.selfMs += e.selfMs;
    const t = e.interaction.at ?? 0;
    const s = n.dispatches.get(t) + e.selfMs;
    n.dispatches.set(t, s);
    if (s > n.row.worstDispatchMs) n.row.worstDispatchMs = s;
}

function recordFeedbackHold(e) {
    const n = [ ...e.blockers ].sort();
    const t = n.join("\0");
    let s = feedbackSources.get(t);
    if (s === undefined) {
        s = {
            row: {
                sources: n,
                holds: 0,
                heldMs: 0,
                worstMs: 0,
                silent: 0,
                silentMs: 0,
                latestOnly: 0,
                long: 0,
                longMs: 0,
                acknowledgedBy: [],
                interactions: [],
                writes: [],
                actions: 0
            },
            acks: new Map,
            interactions: new Map,
            writes: new Set
        };
        feedbackSources.set(t, s);
    }
    const i = s.row;
    const o = e.silent;
    i.holds++;
    i.heldMs += e.holdMs;
    if (e.holdMs > i.worstMs) i.worstMs = e.holdMs;
    if (o) {
        i.silent++;
        i.silentMs += e.holdMs;
    } else if (e.acknowledgements.length > 0 && e.acknowledgements.every(e => e.kind === "latest")) i.latestOnly++;
    if (e.long) {
        i.long++;
        i.longMs += e.tailMs;
    }
    if (e.action) i.actions++;
    for (const n of e.acknowledgements) {
        const e = `${n.kind}:${n.source}`;
        s.acks.set(e, (s.acks.get(e) ?? 0) + 1);
    }
    for (const n of e.heldWrites) s.writes.add(n.name);
    if (e.interaction !== undefined) {
        const n = formatOrigin(e.interaction);
        s.interactions.set(n, (s.interactions.get(n) ?? 0) + 1);
        const t = interactionBucket(e.interaction);
        t.row.holds++;
        t.row.heldMs += e.holdMs;
        if (o) t.row.silentMs += e.holdMs;
        if (e.holdMs > t.row.worstHoldMs) t.row.worstHoldMs = e.holdMs;
    }
}

function recordFeedbackNavigation(e) {
    const n = e.name ?? e.to;
    if (n === undefined) return;
    let t = feedbackNavigations.get(n);
    if (t === undefined) {
        t = {
            name: n,
            navigations: 0,
            settledMs: 0,
            worstMs: 0,
            held: 0,
            heldMs: 0,
            silent: 0,
            superseded: 0,
            redirected: 0
        };
        feedbackNavigations.set(n, t);
    }
    t.navigations++;
    if (e.redirects !== undefined) t.redirected++;
    if (e.outcome === "superseded") {
        t.superseded++;
        return;
    }
    const s = e.settledMs;
    t.settledMs += s;
    if (s > t.worstMs) t.worstMs = s;
    if (e.outcome === "held") {
        t.held++;
        t.heldMs += e.hold?.holdMs ?? s;
        if (e.hold !== undefined && e.hold.silent) t.silent++;
    }
}

function rankedCounts(e, n) {
    return [ ...e ].sort((e, n) => n[1] - e[1]).map(([e, t]) => ({
        [n]: e,
        holds: t
    }));
}

registerFold({
    rerun: (e, n) => recordFeedbackRun(n),
    hold: recordFeedbackHold,
    navigation: recordFeedbackNavigation,
    flightStart(e, n) {
        const t = flightBucket(e);
        t.flights++;
        if (n) t.abandoned++;
    },
    flightLanded(e, n) {
        const t = flightBucket(e);
        t.landed++;
        t.landedMs += n;
        if (n > t.worstMs) t.worstMs = n;
    },
    fallback: trackFallback,
    reset() {
        feedbackSources.clear();
        feedbackInteractions.clear();
        feedbackNavigations.clear();
        flightStats.clear();
        fallbackStats.clear();
    }
});

/**
 * What the user waited on, folded from holds and the interaction on each
 * re-run: `sources` ranks async sources by the silent time writes spent held
 * behind them (with which affordances answered, how often, and which
 * interactions were held); `interactions` ranks user events by the total time
 * they cost — re-run work caused (long-flush hazard) beside time held
 * (silent-hold hazard). Facts at every duration; SILENT_HOLD is the
 * thresholded verdict. Three more tables round out the picture: `navigations`
 * ranks routes by the time spent held navigating to them (folded from settled
 * navigations), `flights` counts each async source's flights and how many
 * were abandoned before landing (the re-ask storm), and `fallbacks` measures
 * how long each loading boundary showed its fallback and how often that was a
 * flash.
 */ function feedback() {
    const e = [ ...feedbackNavigations.values() ].map(e => ({
        ...e
    })).sort((e, n) => n.heldMs - e.heldMs || n.settledMs - e.settledMs);
    const n = [ ...flightStats.values() ].map(e => ({
        ...e
    })).sort((e, n) => n.abandoned - e.abandoned || n.flights - e.flights);
    const t = [ ...fallbackStats.values() ].map(e => ({
        ...e.row
    })).sort((e, n) => n.flashes - e.flashes || n.shownMs - e.shownMs);
    const s = [ ...feedbackSources.values() ].map(e => ({
        ...e.row,
        acknowledgedBy: rankedCounts(e.acks, "by"),
        interactions: rankedCounts(e.interactions, "interaction"),
        writes: [ ...e.writes ]
    })).sort((e, n) => n.silentMs - e.silentMs || n.heldMs - e.heldMs);
    // Ranked by the total time the user spent on it: held plus synchronous work.
        const i = [ ...feedbackInteractions.values() ].map(e => ({
        ...e.row
    })).sort((e, n) => n.heldMs + n.selfMs - (e.heldMs + e.selfMs));
    return {
        sources: s,
        interactions: i,
        navigations: e,
        flights: n,
        fallbacks: t
    };
}

export { feedback };