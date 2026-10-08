export { ContextNotFoundError, NoOwnerError, NotReadyError, TimeoutError } from "./core/error.js";

export { clearSnapshots, isEqual, markSnapshotScope, releaseSnapshotScope, runWithOwner, setSnapshotCapture, untrack } from "./core/core.js";

export { enableExternalSource } from "./core/external.js";

export { createOwner, createRoot, getNextChildId, getObserver, getOwner, isDisposed, peekNextChildId } from "./core/owner.js";

export { createContext, getContext, setContext } from "./core/context.js";

export { $REFRESH, SUPPORTS_PROXY } from "./core/constants.js";

import "./core/invariants.js";

export { setConsoleFooter } from "./core/dev.js";

export { ROOT_ERROR_HOOK, enforceLoadingBoundary, flush, resetErrorHalt } from "./core/scheduler.js";

export { isPending, latest } from "./core/verdict.js";

import "./core/effect.js";

export { action } from "./core/action.js";

export { configureClientErrors } from "./core/error-hooks.js";

export { createEffect, createMemo, createOptimistic, createReaction, createRenderEffect, createSignal, createTrackedEffect, onCleanup, onSettled, refresh, resolve, until } from "./signals.js";

export { affects } from "./affects.js";

export { mapArray, repeat } from "./map.js";

export { createStore, deep, reconcile, snapshot } from "./store/index.js";

export { createErrorBoundary, createLoadingBoundary, createRevealOrder, flatten } from "./boundaries.js";

export { $PROXY, $RECORD, $TARGET, $TRACK, isWrappable } from "./store/store.js";

export { MergeView, OmitView, SOURCE_MEMO, SOURCE_MERGE, SOURCE_OMIT, SOURCE_PLAIN, SOURCE_PROXY, hasStaticKeys, isStatic, merge, mergeSources, mergeView, omit, omitView, resolvedTable, sourceGet, sourceHas, sourceKeys, sourceOwners, viewOf } from "./store/utils.js";

export { createOptimisticStoreNext as createOptimisticStore } from "./store/next/optimistic.js";

export { createProjectionNext as createProjection } from "./store/next/projection.js";

export { storeHasFamily, storeHasOptimisticFamily, storeIsShallow } from "./store/next/store.js";

export { storePath } from "./store/storePath.js";

/**
 * Observe tier (diagnostics channel, attribution hook slot + interaction
 * frame): dev and observe builds. The attribution engine itself is the
 * `@solidjs/signals/attribution` entry.
 */ const OBSERVE = undefined;

/** Dev tier (devtools hooks, graph traversal, console reporting): dev builds only. */ const DEV = undefined;

export { DEV, OBSERVE };