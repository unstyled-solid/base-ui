import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, fireEvent, advanceTimers } from '../../../test';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createHoverReferenceInteraction } from './createHoverReferenceInteraction';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
it('createHoverReferenceInteraction does not let a delayed hover override a later click-open', async () => {
  vi.useFakeTimers();
  let root!: ReturnType<typeof createFloatingRoot>;
  const requests: string[] = [];
  const view = await createRenderer().render(() => {
    const [open, setOpen] = createSignal(false), [reference, setReference] = createSignal<Element | null>(null);
    root = createFloatingRoot({ state: { get open() { return open(); }, transitionStatus: undefined,
      get domReferenceElement() { return reference(); }, get referenceElement() { return reference(); }, positionReference: null, floatingElement: null, floatingId: undefined },
      onOpenChange(next, details) { requests.push(details.reason); setOpen(next); } });
    const hover = createHoverReferenceInteraction(root, { delay: 100, move: false });
    return <button ref={setReference} {...hover}>Trigger</button>;
  });
  const node = view.getByRole('button');
  fireEvent.mouseEnter(node);
  root.setOpen(true, createChangeEventDetails('trigger-press', new MouseEvent('click'), node));
  await advanceTimers(100);
  expect(requests).toEqual(['trigger-press']);
  view.unmount();
  await advanceTimers(0);
});

it('disposing one hover trigger cancels its delayed job while another trigger keeps the shared state alive', async () => {
  vi.useFakeTimers();
  const requests = vi.fn();
  function Trigger(props: { root: ReturnType<typeof createFloatingRoot>; name: string }) {
    const [element, setElement] = createSignal<Element | null>(null);
    const hover = createHoverReferenceInteraction(props.root, { triggerElement: element, delay: 100, move: false });
    return <button ref={setElement} {...hover}>{props.name}</button>;
  }
  const view = await createRenderer().renderProps((props: { first: boolean }) => {
    const root = createFloatingRoot({ state: { open: false, transitionStatus: undefined, domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined }, onOpenChange: requests });
    return <>{props.first && <Trigger root={root} name="First" />}<Trigger root={root} name="Second" /></>;
  }, { first: true });
  fireEvent.mouseEnter(view.getByRole('button', { name: 'First' }));
  await view.setProps({ first: false }); await advanceTimers(100);
  expect(requests).not.toHaveBeenCalled();
  fireEvent.mouseEnter(view.getByRole('button', { name: 'Second' })); await advanceTimers(100);
  expect(requests).toHaveBeenCalledOnce();
  view.unmount(); await advanceTimers(0);
});
