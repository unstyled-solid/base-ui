import { getOwner, onCleanup } from 'solid-js';
import type { FloatingTreeType, FloatingRootContext, FloatingNodeType, FloatingTreeEventMap } from '../../internals/contracts/floating';
import { createEventEmitter } from '../utils/createEventEmitter';
/**
 * Native mapping of upstream `new FloatingTreeStore()`: call
 * `createFloatingTree()` (or its `FloatingTreeStore()` alias), without `new`.
 * `nodes` replaces `nodesRef.current`; events and identity-based registration
 * are retained. Owned factories clean up with their Solid owner; detached
 * factories expose explicit `dispose()`.
 */
export function createFloatingTree<Context = FloatingRootContext, Events extends object = FloatingTreeEventMap>(): FloatingTreeType<Context, Events> & { dispose(): void } {
  const nodes: FloatingNodeType<Context>[] = [];
  const events = createEventEmitter<Events>();
  const listeners = new Set<() => void>();
  const notify = () => { for (const listener of listeners) listener(); };
  const dispose = () => { nodes.length = 0; notify(); listeners.clear(); events.clear(); };
  // Handle fallbacks are imperative factories permitted outside render. Owned
  // trees dispose automatically; detached factories can dispose explicitly.
  if (getOwner()) onCleanup(dispose);
  return {
    nodes, events, dispose,
    addNode(node) { if (!nodes.includes(node)) { nodes.push(node); notify(); } },
    removeNode(node) { const index = nodes.indexOf(node); if (index !== -1) { nodes.splice(index, 1); notify(); } },
    subscribeNodes(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
}
