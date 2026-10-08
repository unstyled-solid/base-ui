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
const $OWNER = Symbol(0);

/** raw → target for UNOWNED backings (user-ingested, adopted); owned
 * backings resolve through their `$OWNER` stamp. Boundary mechanism (O8). */ const storeNextLookup = new WeakMap;

/** A backing the store allocated and may mutate in place. */ function isOwned(e) {
    return e[$OWNER] !== undefined;
}

/** raw → target within a family (`null` = plain stores / the global map).
 * The stamp answers for backings owned by a target OF THAT FAMILY; anything
 * else (user objects, adoptees, another family's backings the family
 * re-registered for its own wrapper) resolves through the family's map. */ function lookupTarget(e, o) {
    const t = e[$OWNER];
    return t !== undefined && t.fam === o ? t : (o?.map ?? storeNextLookup).get(e);
}

function devAssertNeverUserMutation(e) {
    return;
}

let optHooks = null;

function setOptHooks(e) {
    optHooks = e;
}

/** Sticky descendants flag walk (§6d): reconcile's keyed pruning descends
 * only where subscriptions exist at/below. Nodes AND patches count. */ function markDescendants(e) {
    let o = e;
    while (o && !o.d) {
        o.d = true;
        o = o.u;
    }
}

export { $OWNER, devAssertNeverUserMutation, isOwned, lookupTarget, markDescendants, optHooks, setOptHooks, storeNextLookup };