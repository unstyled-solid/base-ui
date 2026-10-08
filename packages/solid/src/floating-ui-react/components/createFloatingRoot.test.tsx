import { expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { createFloatingRoot } from './createFloatingRoot';
import { createFloatingTree } from './createFloatingTree';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createFloatingNodeId, FloatingTree } from './FloatingTree';
it('createFloatingRoot cancellation precedes dispatch and click provenance outranks hover', async () => {
  let root!: ReturnType<typeof createFloatingRoot>;
  const events: boolean[] = [];
  let canceled = true;
  const view = await createRenderer().render(() => {
    root = createFloatingRoot({ state: { open: false, transitionStatus: undefined, domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined },
      onOpenChange(_, details) { if (canceled) details.cancel(); } });
    const tree = createFloatingTree();
    const node = { id: 'node', parentId: null, context: root }; tree.addNode(node); tree.addNode(node);
    expect(tree.nodes).toEqual([node]);
    tree.removeNode(node); expect(tree.nodes).toEqual([]);
    root.events.on('openchange', ({ open }) => events.push(open));
    return <div />;
  });
  root.setOpen(false, createChangeEventDetails('escape-key', new KeyboardEvent('keydown')));
  expect(events).toEqual([]);
  canceled = false;
  const click = new MouseEvent('click');
  root.setOpen(true, createChangeEventDetails('trigger-press', click));
  root.setOpen(true, createChangeEventDetails('trigger-hover', new MouseEvent('mouseenter')));
  expect(root.data.openEvent).toBe(click);
  expect(events).toEqual([true, true]);
  view.unmount();
  root.setOpen(false, createChangeEventDetails('none'));
  expect(events).toEqual([true, true]);
});

it('floating nodes migrate between live provider trees and remove from their original attachment', async () => {
  const first = createFloatingTree(), second = createFloatingTree();
  function Node() { const id = createFloatingNodeId(); return <output>{id()}</output>; }
  const view = await createRenderer().renderProps((props: { second: boolean }) => <FloatingTree externalTree={props.second ? second : first}><Node /></FloatingTree>, { second: false });
  expect(first.nodes).toHaveLength(1); expect(second.nodes).toHaveLength(0);
  const nodeId = first.nodes[0]!.id;
  await view.setProps({ second: true });
  expect(first.nodes).toHaveLength(0); expect(second.nodes).toHaveLength(1); expect(second.nodes[0]!.id).toBe(nodeId);
  view.unmount(); expect(second.nodes).toHaveLength(0);
  first.dispose(); second.dispose();
});
