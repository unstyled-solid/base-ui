import { contains } from '../../floating-ui-react/utils/element';
import type { NavigationMenuRootContext } from '../root/NavigationMenuRootContext';
export function isOutsideMenuEvent(event: { currentTarget: HTMLElement; relatedTarget: EventTarget | null }, root: NavigationMenuRootContext) {
  const target = event.relatedTarget as Element | null;
  const children = new Set<string | undefined>([root.nodeId]);
  // The tree is not necessarily insertion-ordered by depth.
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of root.tree.nodes) {
      if (node.parentId != null && children.has(node.parentId) && !children.has(node.id)) { children.add(node.id); changed = true; }
    }
  }
  const inChild = root.tree.nodes.some((node) => node.id !== root.nodeId && children.has(node.id) && contains(node.context?.state.floatingElement, target));
  return !contains(root.popupElement, event.currentTarget) && !contains(root.popupElement, target) && !contains(root.rootElement, target) && !inChild;
}
