import { isServer, resolveSSRNode, type JSX } from '@solidjs/web';
/** Solid values, not React elements: arrays recurse, zero is content, empty strings are not. */
export function isRenderableNode(node: unknown): boolean {
  if (node == null || typeof node === 'boolean' || node === '') return false;
  if (Array.isArray(node)) return node.some(isRenderableNode);
  return true;
}
/** Inspect the rendered host without cloning JSX or invoking child functions ownerlessly. */
export function hasRenderableChildren(node: Node | null): boolean {
  return !!node && Array.from(node.childNodes).some((child) => child.nodeType === 1 || (child.nodeType === 3 && child.textContent !== ''));
}
export function getRenderedHost(value: unknown): HTMLElement | null {
  if (Array.isArray(value)) {
    for (const child of value) { const node = getRenderedHost(child); if (node) return node; }
  }
  return value !== null && typeof value === 'object' && 'nodeType' in value && value.nodeType === 1 ? value as HTMLElement : null;
}
/** Server JSX is serialized rather than a DOM node. Ignore hydration comments,
 * and inspect the outer host's children while respecting quoted attribute `>`s. */
export function hasServerRenderableChildren(value: JSX.Element): boolean {
  if (!isServer) return false;
  const html: string = String(resolveSSRNode(value)).replace(/<!--[\s\S]*?-->/g, '');
  if (html[0] !== '<' || !/^<[a-z]/i.test(html)) return false;
  let quote = '', start = -1;
  for (let index = 1; index < html.length; index++) {
    const character = html[index];
    if (quote) { if (character === quote) quote = ''; }
    else if (character === '"' || character === "'") quote = character;
    else if (character === '>') { start = index + 1; break; }
  }
  const end = html.lastIndexOf('</');
  return start >= 0 && end > start;
}
