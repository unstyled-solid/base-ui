import type { FloatingNodeType } from '../../internals/contracts/floating';
export function getNodeChildren(nodes: readonly FloatingNodeType[], id: string | undefined, onlyOpenChildren = true): FloatingNodeType[] {
  const result: FloatingNodeType[] = [];
  const visited = new Set<FloatingNodeType>();
  function visit(parent: string | undefined) {
    for (const child of nodes) {
      if (child.parentId !== parent || visited.has(child)) continue;
      visited.add(child);
      if (!onlyOpenChildren || child.context?.state.open) result.push(child);
      visit(child.id);
    }
  }
  visit(id);
  return result;
}
export function getNodeAncestors(nodes: readonly FloatingNodeType[], id: string | undefined): FloatingNodeType[] {
  const result: FloatingNodeType[] = [];
  let parent = nodes.find((node) => node.id === id)?.parentId;
  const seen = new Set<string>();
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    const node = nodes.find((current) => current.id === parent);
    if (!node) break;
    result.push(node); parent = node.parentId;
  }
  return result;
}
