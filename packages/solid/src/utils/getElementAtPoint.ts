type ElementFromPointRoot = Node & Partial<Pick<Document, 'elementFromPoint'>>;
/** Pass getRootNode() so a shadow root can resolve its own hit-test target. */
export function getElementAtPoint(root: ElementFromPointRoot | null | undefined, x: number, y: number) {
  return typeof root?.elementFromPoint === 'function' ? root.elementFromPoint(x, y) : null;
}
