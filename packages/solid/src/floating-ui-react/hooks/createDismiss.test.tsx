import { expect, it } from 'vitest';
import { createSignal, flush, onSettled } from 'solid-js';
import { createRenderer, fireEvent, firePointer } from '../../../test';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createDismiss } from './createDismiss';
import { createFloatingTree } from '../components/createFloatingTree';
import type { FloatingRootContext } from '../../internals/contracts/floating';

it('createDismiss honors cancellation and ignores pre-open intentional press tails', async () => {
  let setOpen!: (value: boolean) => void;
  let requests = 0;
  const view = await createRenderer().render(() => {
    const [open, change] = createSignal(false); setOpen = change;
    const [floating, report] = createSignal<HTMLElement | null>(null);
    const root = createFloatingRoot({ state: { get open() { return open(); }, transitionStatus: undefined,
      domReferenceElement: null, referenceElement: null, positionReference: null,
      get floatingElement() { return floating(); }, floatingId: undefined },
      onOpenChange(_, details) { requests++; details.cancel(); } });
    createDismiss(root, { outsidePressEvent: 'intentional' });
    return <><button>Outside</button><div ref={report}>Popup</div></>;
  });
  const outside = view.getByRole('button');
  firePointer.down(outside, { pointerType: 'mouse', timeStamp: 10 });
  setOpen(true); flush();
  fireEvent.click(outside, { detail: 1 });
  expect(requests).toBe(0);
  firePointer.down(outside, { pointerType: 'mouse', timeStamp: 20 });
  fireEvent.click(outside, { detail: 1 });
  expect(requests).toBe(1);
  expect(fireEvent.keyDown(document, { key: 'Escape' })).toBe(true);
  expect(requests).toBe(2);
});

// Pinned useDismiss.test.tsx bubbles.outsidePress (true/false/mixed), with
// distinct geometry-context views as published by the real positioning API.
it.each([true, false])('resolves outside-press bubbling=%s through shared root metadata', async bubbles => {
  const calls: string[] = [];
  const view = await createRenderer().renderProps<{ cancel: boolean }>(props => {
    const tree = createFloatingTree();
    const [parentOpen, setParentOpen] = createSignal(true);
    const [childOpen, setChildOpen] = createSignal(true);
    const [parentElement, setParentElement] = createSignal<HTMLElement | null>(null);
    const [childElement, setChildElement] = createSignal<HTMLElement | null>(null);
    const makeRoot = (open: () => boolean, floating: () => HTMLElement | null, change: (open: boolean) => void, name: string) => createFloatingRoot({
      state: { get open() { return open(); }, get floatingElement() { return floating(); }, transitionStatus: undefined,
        domReferenceElement: null, referenceElement: null, positionReference: null, floatingId: undefined },
      onOpenChange(next, details) { calls.push(name); if (props.cancel) details.cancel(); else change(next); },
    });
    const parent = makeRoot(parentOpen, parentElement, setParentOpen, 'parent');
    const child = makeRoot(childOpen, childElement, setChildOpen, 'child');
    const parentView: FloatingRootContext = Object.create(parent);
    const childView: FloatingRootContext = Object.create(child);
    onSettled(() => {
      const parentNode = { id: 'parent', parentId: null, context: parentView };
      const childNode = { id: 'child', parentId: 'parent', context: childView };
      tree.addNode(parentNode); tree.addNode(childNode);
      return () => { tree.removeNode(childNode); tree.removeNode(parentNode); };
    });
    createDismiss(parent, { externalTree: tree });
    createDismiss(child, { externalTree: tree, bubbles: { outsidePress: bubbles } });
    return <><button>Outside</button><div ref={setParentElement} data-open={String(parentOpen())}>Parent</div>
      <div ref={setChildElement} data-open={String(childOpen())}>Child</div></>;
  }, { cancel: true });
  const press = () => {
    firePointer.down(view.getByRole('button'), { pointerType: 'touch', timeStamp: 10 });
    fireEvent.mouseDown(view.getByRole('button'));
    flush();
  };
  // Child participation protects its parent even across a portal boundary.
  firePointer.down(view.getByText('Child'), { pointerType: 'touch', timeStamp: 5 });
  fireEvent.mouseDown(view.getByText('Child'));
  expect(calls).toEqual([]);
  press();
  expect(calls).toEqual(bubbles ? ['parent', 'child'] : ['child']);
  expect(view.getByText('Parent')).toHaveAttribute('data-open', 'true');
  expect(view.getByText('Child')).toHaveAttribute('data-open', 'true');
  await view.setProps({ cancel: false });
  calls.length = 0;
  press();
  expect(calls).toEqual(bubbles ? ['parent', 'child'] : ['child']);
  expect(view.getByText('Child')).toHaveAttribute('data-open', 'false');
  expect(view.getByText('Parent')).toHaveAttribute('data-open', String(!bubbles));
  if (!bubbles) {
    press();
    expect(view.getByText('Parent')).toHaveAttribute('data-open', 'false');
  }
});
