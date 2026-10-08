import { expect, it, vi } from 'vitest';
import { untrack } from 'solid-js';
import { waitFor } from '@testing-library/dom';
import { createRenderer, flushMicrotasks } from '../../../test';
import { createBaseUIFloating } from './createFloating';
import { createFloatingRootContext } from './createFloatingRootContext';
import { FloatingTree, createFloatingNodeId } from '../components/FloatingTree';
import { FloatingTreeStore } from '../index';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { FloatingContext, FloatingNodeType, UseFloatingReturn } from '../types';

it('retains pinned useFloating root identity, live context geometry and distinct DOM/virtual refs', async () => {
  const reference = document.createElement('button'), floating = document.createElement('div');
  const onOpenChange = vi.fn();
  let api!: UseFloatingReturn;
  let root!: ReturnType<typeof createFloatingRootContext>;
  const view = await createRenderer().renderProps((props: { open: boolean; placement: 'top' | 'bottom' }) => {
    root = createFloatingRootContext({ get open() { return props.open; }, elements: { reference, floating }, onOpenChange });
    api = createBaseUIFloating({ rootContext: root, get placement() { return props.placement; }, nodeId: 'node' });
    return <output>{api.context.placement}:{String(api.context.open)}:{api.context.x}</output>;
  }, { open: true, placement: 'bottom' });
  await flushMicrotasks();
  untrack(() => {
    const context: FloatingContext = api.context;
    expect(context.rootStore).toBe(root);
    expect(api.rootStore).toBe(root);
    expect(context.data).toBe(root.data);
    expect(context.events).toBe(root.events);
    expect(root.data.floatingContext).toBe(context);
    expect(context.refs).toBe(api.refs);
    expect(context.elements).toBe(api.elements);
    expect(context.refs.floating).toBe(floating);
    expect(context.refs.domReference).toBe(reference);
    expect(context.floatingId).toBe(root.state.floatingId);
    expect(context.nodeId).toBe('node');
    expect(context.update).toBe(api.update);
    expect(context.middlewareData).toBe(api.middlewareData);
    expect(context.floatingStyles).toEqual(api.floatingStyles);
    expect(context.y).toBe(api.y);
    expect(context.strategy).toBe(api.strategy);
    expect(context.isPositioned).toBe(api.isPositioned);
  });
  const virtual = { getBoundingClientRect: () => new DOMRect(1, 2, 3, 4) };
  api.refs.setPositionReference(virtual);
  await flushMicrotasks();
  untrack(() => {
    expect(api.context.refs.reference).toBe(virtual);
    expect(api.elements.reference).toBe(virtual);
    expect(root.state.domReferenceElement).toBe(reference);
    expect(api.refs.domReference).toBe(reference);
  });
  const details = createChangeEventDetails('none');
  api.context.onOpenChange(false, details);
  expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, details);
  await view.setProps({ open: false, placement: 'top' });
  await flushMicrotasks();
  await waitFor(() => expect(view.getByRole('status')).toHaveTextContent('top:false:'));
  view.unmount();
  expect(root.data.floatingContext).toBeUndefined();
});

it('publishes the full context to an external tree and cleans up captured nodes on replacement', async () => {
  const first = FloatingTreeStore(), second = FloatingTreeStore();
  const firstNode: FloatingNodeType = { id: 'node', parentId: null };
  const secondNode: FloatingNodeType = { id: 'node', parentId: null };
  first.addNode(firstNode); second.addNode(secondNode);
  let api!: UseFloatingReturn;
  const view = await createRenderer().renderProps((props: { second: boolean }) => {
    const root = createFloatingRootContext();
    api = createBaseUIFloating({ rootContext: root, nodeId: 'node', get externalTree() { return props.second ? second : first; } });
    return null;
  }, { second: false });
  expect(firstNode.context).toBe(api.context);
  await view.setProps({ second: true });
  expect(firstNode.context).toBeUndefined();
  expect(secondNode.context).toBe(api.context);
  second.removeNode(secondNode);
  expect(secondNode.context).toBeUndefined();
  const replacement: FloatingNodeType = { id: 'node', parentId: null };
  second.addNode(replacement);
  expect(replacement.context).toBe(api.context);
  view.unmount();
  expect(replacement.context).toBeUndefined();
  expect(secondNode.context).toBeUndefined();
  first.dispose(); second.dispose();
});

it('publishes to the inherited tree after native node registration', async () => {
  const tree = FloatingTreeStore();
  let api!: UseFloatingReturn;
  function Child() {
    const id = createFloatingNodeId();
    const root = createFloatingRootContext();
    api = createBaseUIFloating({ rootContext: root, get nodeId() { return id(); } });
    return null;
  }
  const view = await createRenderer().render(() => <FloatingTree externalTree={tree}><Child /></FloatingTree>);
  expect(tree.nodes).toHaveLength(1);
  expect(tree.nodes[0]?.context).toBe(api.context);
  view.unmount();
  expect(tree.nodes).toHaveLength(0);
  tree.dispose();
});
