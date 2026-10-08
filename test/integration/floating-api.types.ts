import { FloatingTreeStore } from '../../packages/solid/src/floating-ui-react';
import { createBaseUIFloating } from '../../packages/solid/src/floating-ui-react/hooks/createFloating';
import type { FloatingContext, ExtendedRefs, UseFloatingOptions, FloatingRootContext, ReferenceType } from '../../packages/solid/src/floating-ui-react/types';

type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
export type RequiredRoot = Assert<Equal<{} extends Pick<UseFloatingOptions, 'rootContext'> ? true : false, false>>;
export type NativeFactory = Assert<Equal<typeof FloatingTreeStore extends abstract new (...args: never[]) => unknown ? true : false, false>>;
export type ReferenceRead = Assert<Equal<ExtendedRefs['reference'], ReferenceType | null>>;
export type GeometryCoordinate = Assert<Equal<FloatingContext['x'], number>>;
export type CallbackDetails = Assert<Equal<Parameters<FloatingContext['onOpenChange']>, Parameters<FloatingRootContext['setOpen']>>>;

export function consume(rootContext: FloatingRootContext) {
  const tree = FloatingTreeStore();
  const position = createBaseUIFloating({ rootContext, externalTree: tree, nodeId: 'consumer' });
  const context: FloatingContext = position.context;
  context.refs.setPositionReference({ getBoundingClientRect: () => new DOMRect() });
  const reference: ReferenceType | null = context.refs.reference;
  const floating: HTMLElement | null = context.refs.floating;
  const domReference: Element | null = context.refs.domReference;
  return { reference, floating, domReference, context, tree };
}
