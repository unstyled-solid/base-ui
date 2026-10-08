import { createEffect, createMemo, untrack, type Accessor } from 'solid-js';
import type { FloatingRootContext } from '../../internals/contracts/floating';
import { createHoverInteractionSharedState, applySafePolygonPointerEventsMutation, clearSafePolygonPointerEventsMutation, isInteractiveElement } from './createHoverInteractionSharedState';
import { getDelay, isClickLikeOpenEvent, isHoverOpenEvent, isInsideEnabledTrigger } from './hoverShared';
import { createFloatingParentNodeId, createFloatingTreeAccessor } from '../components/FloatingTree';
import { getNodeChildren } from '../utils/nodes';
import { closest, contains, getTarget } from '../utils/element';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createTimeout } from '../../utils/createTimeout';
export interface UseHoverFloatingInteractionProps { enabled?: boolean | undefined; closeDelay?: number | (() => number) | undefined; nodeId?: string | undefined }
export function createHoverFloatingInteraction(input: FloatingRootContext | Accessor<FloatingRootContext>, options: UseHoverFloatingInteractionProps = {}): void {
  const context = () => typeof input === 'function' ? input() : input;
  const state = createHoverInteractionSharedState(input), treeAccessor = createFloatingTreeAccessor(), parent = createFloatingParentNodeId(), childClosed = createTimeout();
  createEffect(() => ({ root: context(), tree: treeAccessor(), enabled: options.enabled ?? true, open: context().state.open, floating: context().state.floatingElement, reference: context().state.domReferenceElement, nodeId: options.nodeId,
    handle: state.handleCloseOptions, parentId: parent() }), (next) => {
    if (!next.open) untrack(() => { state.pointerType = undefined; state.restTimeoutPending = false; state.interactedInside = false; clearSafePolygonPointerEventsMutation(state); });
    if (!next.enabled || !next.floating) return;
    const root = next.root, floating = next.floating, tree = next.tree;
    untrack(() => {
      if (next.open && next.handle?.blockPointerEvents && isHoverOpenEvent(root.data.openEvent?.type) && next.reference && 'style' in next.reference) {
        const parentFloating = next.parentId && tree?.nodes.find((node) => node.id === next.parentId)?.context?.state.floatingElement;
        const scope = next.handle.getScope?.() ?? (parentFloating && parentFloating !== floating ? parentFloating : null) ?? closest(next.reference, '[data-rootownerid]') as HTMLElement | null ?? floating.ownerDocument.body;
        applySafePolygonPointerEventsMutation(state, { scopeElement: scope, referenceElement: next.reference as HTMLElement, floatingElement: floating });
      }
    });
    return () => untrack(() => clearSafePolygonPointerEventsMutation(state));
  });
  // Listener ownership is independent of open/reference/style updates. Preserve
  // a pending descendant-close subscription across coarse root invalidations.
  const listenerTarget = createMemo(() => ({ root: context(), tree: treeAccessor(), enabled: options.enabled ?? true,
    floating: context().state.floatingElement, nodeId: options.nodeId, parentId: parent() }), {
    equals: (a, b) => a.root === b.root && a.tree === b.tree && a.enabled === b.enabled &&
      a.floating === b.floating && a.nodeId === b.nodeId && a.parentId === b.parentId,
  });
  createEffect(listenerTarget, (next) => {
    if (!next.enabled || !next.floating) return;
    const root = next.root, floating = next.floating, tree = next.tree;
    const clickLike = () => isClickLikeOpenEvent(root.data.openEvent?.type, state.interactedInside);
    const parentHasChildren = () => !!(parent() && tree && getNodeChildren(tree.nodes, parent()!).length);
    const close = (event: MouseEvent) => {
      const request = () => { if (options.enabled !== false && context() === root && !clickLike()) { root.setOpen(false, createChangeEventDetails('trigger-hover', event)); tree?.events.emit('floating.closed', event); } };
      const delay = getDelay(options.closeDelay, 'close', state.pointerType); if (delay) state.openChangeTimeout.start(delay, request); else { state.openChangeTimeout.clear(); request(); }
    };
    const nodeClosed = (event: MouseEvent) => {
      if (!parent() || !tree) return;
      childClosed.start(0, () => untrack(() => {
        // The child's accepted close is still staged when it emits. Test the
        // committed tree in this zero task, after allowing parent re-entry.
        if (parentHasChildren()) return;
        tree?.events.off('floating.closed', nodeClosed);
        if (options.enabled !== false && context() === root && !clickLike()) {
          root.setOpen(false, createChangeEventDetails('trigger-hover', event));
          tree?.events.emit('floating.closed', event);
        }
      }));
    };
    const enter = () => { state.openChangeTimeout.clear(); childClosed.clear(); tree?.events.off('floating.closed', nodeClosed); clearSafePolygonPointerEventsMutation(state); };
    const leave = (event: MouseEvent) => {
      if (parentHasChildren()) { tree?.events.on('floating.closed', nodeClosed); return; }
      if (isInsideEnabledTrigger(event.relatedTarget, root.triggerElements)) return;
      const nodeId = tree?.nodes.find((node) => node.context === root)?.id ?? next.nodeId;
      if (nodeId && tree && getNodeChildren(tree.nodes, nodeId, false).some((node) => contains(node.context?.state.floatingElement, event.relatedTarget as Element | null))) return;
      if (state.handler) { state.handler(event); return; }
      clearSafePolygonPointerEventsMutation(state);
      if (isHoverOpenEvent(root.data.openEvent?.type) && !clickLike()) close(event);
    };
    const interact = (event: PointerEvent) => { const target = getTarget(event) as Element | null; state.interactedInside = isInteractiveElement(target) && closest(target, '[aria-haspopup]') !== null; };
    floating.addEventListener('mouseenter', enter); floating.addEventListener('mouseleave', leave); floating.addEventListener('pointerdown', interact, true);
    return () => { floating.removeEventListener('mouseenter', enter); floating.removeEventListener('mouseleave', leave); floating.removeEventListener('pointerdown', interact, true); tree?.events.off('floating.closed', nodeClosed); childClosed.clear(); };
  });
}
