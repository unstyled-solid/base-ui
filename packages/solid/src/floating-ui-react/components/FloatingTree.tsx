import { createContext, createEffect, untrack, useContext, type Accessor } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import { createFloatingTree } from './createFloatingTree';
import { createBaseUiId } from '../../internals/createBaseUiId';
import type { FloatingNodeType, FloatingRootContext, FloatingTreeType } from '../../internals/contracts/floating';
export const FloatingTreeContext = createContext<FloatingTreeType | null>(null);
export const FloatingNodeContext = createContext<FloatingNodeType | null>(null);
const treeSources = new WeakMap<object, Accessor<FloatingTreeType>>();
/** Resolve the actual tree in compute, so attachment cleanup never follows a
 * live provider facade into a replacement tree. */
export function createFloatingTreeAccessor<Events extends object = import('../../internals/contracts/floating').FloatingTreeEventMap>(external?: Accessor<FloatingTreeType<FloatingRootContext, Events> | undefined>): Accessor<FloatingTreeType<FloatingRootContext, Events> | null> {
  const inherited = useContext(FloatingTreeContext);
  return () => {
    let tree = external?.() ?? inherited;
    while (tree && treeSources.has(tree)) tree = treeSources.get(tree)!();
    return tree as FloatingTreeType<FloatingRootContext, Events> | null;
  };
}
export function createFloatingParentNodeId(): Accessor<string | null> {
  const node = useContext(FloatingNodeContext);
  return () => node?.id ?? null;
}
/** A current imperative lookup; use the accessor seam for reactive parent ownership. */
export function useFloatingParentNodeId(): string | null { return untrack(createFloatingParentNodeId()); }
export function useFloatingTree<Events extends object = import('../../internals/contracts/floating').FloatingTreeEventMap>(external?: FloatingTreeType<FloatingRootContext, Events>): FloatingTreeType<FloatingRootContext, Events> | null {
  return external ?? useContext(FloatingTreeContext) as FloatingTreeType<FloatingRootContext, Events> | null;
}
export interface FloatingTreeProps { children?: JSX.Element; externalTree?: FloatingTreeType | undefined }
export function FloatingTree(props: FloatingTreeProps): JSX.Element {
  const local = createFloatingTree();
  const tree = new Proxy(local, { get(_, key) { const current = props.externalTree ?? local; return Reflect.get(current, key, current); } });
  treeSources.set(tree, () => props.externalTree ?? local);
  return <FloatingTreeContext value={tree}>{props.children}</FloatingTreeContext>;
}
export interface FloatingNodeProps { children?: JSX.Element; id: string | undefined; context?: FloatingRootContext | undefined }
export function FloatingNode(props: FloatingNodeProps): JSX.Element {
  const parent = useContext(FloatingNodeContext);
  const node = { get id() { return props.id; }, get parentId() { return parent?.id ?? null; }, get context() { return props.context; } };
  return <FloatingNodeContext value={node}>{props.children}</FloatingNodeContext>;
}
export function createFloatingNodeId(external?: FloatingTreeType, context?: Accessor<FloatingRootContext | undefined>): Accessor<string> {
  const tree = createFloatingTreeAccessor(() => external);
  const parent = useContext(FloatingNodeContext);
  const id = createBaseUiId();
  if (!isServer) createEffect(() => ({ tree: tree(), id: id(), parentId: parent?.id ?? null, context: context?.() }), (next) => {
    const node: FloatingNodeType = { id: next.id, parentId: next.parentId, context: next.context };
    next.tree?.addNode(node);
    return () => next.tree?.removeNode(node);
  }, { transparent: true });
  return id;
}
export { createFloatingNodeId as useFloatingNodeId };
