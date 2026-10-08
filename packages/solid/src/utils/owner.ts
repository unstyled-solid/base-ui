export { getWindow as ownerWindow } from '@floating-ui/utils/dom';

export function ownerDocument(node: Node | null | undefined) {
  return (node?.nodeType === 9 ? node as Document : node?.ownerDocument) || document;
}
