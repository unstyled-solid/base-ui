import { expect, it, vi } from 'vitest';
import { createSignal, flush } from 'solid-js';
import { createRenderer, fireEvent, flushMicrotasks, advanceFrame, advanceTimers, waitFor } from '../../../test';
import { Dialog } from '../../dialog';
import { createFloatingRoot } from './createFloatingRoot';
import { FloatingFocusManager } from './FloatingFocusManager';

it('FloatingFocusManager owns initial focus, return focus and modal marking', async () => {
  vi.useFakeTimers();
  let setOpen!: (value: boolean) => void;
  let trigger!: HTMLButtonElement;
  let popup!: HTMLDivElement;
  const view = await createRenderer().render(() => {
    const [open, change] = createSignal(false); setOpen = change;
    const [element, report] = createSignal<HTMLElement | null>(null);
    const [reference, reportReference] = createSignal<Element | null>(null);
    const root = createFloatingRoot({ state: { get open() { return open(); }, transitionStatus: undefined,
      get domReferenceElement() { return reference(); }, get referenceElement() { return reference(); }, positionReference: null,
      get floatingElement() { return element(); }, floatingId: 'dialog' } });
    return <><button ref={(node) => { trigger = node; reportReference(node); }}>Trigger</button>
      <FloatingFocusManager context={root}><div role="dialog" ref={(node) => { popup = node; report(node); }}><button>Content</button></div></FloatingFocusManager></>;
  });
  trigger.focus();
  setOpen(true);
  await flushMicrotasks();
  await advanceFrame();
  expect(popup.querySelector('button')).toHaveFocus();
  expect(trigger).toHaveAttribute('aria-hidden', 'true');
  setOpen(false);
  await flushMicrotasks();
  expect(trigger).toHaveFocus();
  expect(trigger).not.toHaveAttribute('aria-hidden');
  view.unmount();
  await advanceTimers(0);
  await advanceFrame();
});

it('unchanged model invalidation preserves the opening return target without delivering cleanup callbacks', async () => {
  vi.useFakeTimers();
  let setOpen!: (value: boolean) => void;
  let trigger!: HTMLButtonElement;
  let popup!: HTMLDivElement;
  const returned = vi.fn(() => true);
  const view = await createRenderer().renderProps((props: { revision: number }) => {
    const [open, change] = createSignal(false); setOpen = change;
    const [element, report] = createSignal<HTMLElement | null>(null);
    const [reference, reportReference] = createSignal<Element | null>(null);
    const root = createFloatingRoot({ state: {
      get open() { props.revision; return open(); }, transitionStatus: undefined,
      get domReferenceElement() { props.revision; return reference(); },
      get referenceElement() { return reference(); }, positionReference: null,
      get floatingElement() { props.revision; return element(); }, floatingId: 'stable-dialog',
    } });
    return <><button ref={node => { trigger = node; reportReference(node); }}>Trigger</button>
      <FloatingFocusManager context={root} openInteractionType={null} returnFocus={returned} explicitReturnFocus={false}>
        <div role="dialog" ref={node => { popup = node; report(node); }}><button>Content</button></div>
      </FloatingFocusManager></>;
  }, { revision: 0 });
  trigger.focus(); setOpen(true);
  await flushMicrotasks(); await advanceFrame();
  expect(popup.querySelector('button')).toHaveFocus();
  returned.mockClear();
  await view.setProps({ revision: 1 });
  expect(returned).not.toHaveBeenCalled();
  expect(popup.querySelector('button')).toHaveFocus();
  setOpen(false); await flushMicrotasks();
  expect(returned).toHaveBeenCalledOnce();
  expect(trigger).toHaveFocus();
  view.unmount(); await advanceTimers(0); await advanceFrame();
});

it('modal empty-content Tab trapping follows the popup keyboard handler', async () => {
  let popup!: HTMLDivElement;
  const handled = vi.fn((event: KeyboardEvent) => { if (event.shiftKey) event.stopPropagation(); });
  const view = await createRenderer().render(() => {
    const [element, report] = createSignal<HTMLElement | null>(null);
    const root = createFloatingRoot({ state: { open: true, transitionStatus: undefined,
      domReferenceElement: null, referenceElement: null, positionReference: null,
      get floatingElement() { return element(); }, floatingId: 'empty-menu' } });
    return <FloatingFocusManager context={root} initialFocus={false} returnFocus={false}>
      <div role="menu" tabindex={-1} ref={node => { popup = node; report(node); }} onKeyDown={handled} />
    </FloatingFocusManager>;
  });
  popup.focus();
  const reverse = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
  fireEvent(popup, reverse);
  expect(handled).toHaveBeenCalledWith(reverse);
  expect(reverse.defaultPrevented).toBe(false);
  const forward = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
  fireEvent(popup, forward);
  expect(handled).toHaveBeenCalledWith(forward);
  expect(forward.defaultPrevented).toBe(true);
  expect(popup).toHaveFocus();
  view.unmount();
});

it.each([false, true])('queued return respects later focus handoff, explicit target=%s', async explicit => {
  let setOpen!: (value: boolean) => void;
  let trigger!: HTMLButtonElement, handoff!: HTMLButtonElement, content!: HTMLButtonElement;
  const view = await createRenderer().render(() => {
    const [open, change] = createSignal(false); setOpen = change;
    const [element, report] = createSignal<HTMLElement | null>(null);
    const [reference, reportReference] = createSignal<Element | null>(null);
    const root = createFloatingRoot({ state: { get open() { return open(); }, transitionStatus: undefined,
      get domReferenceElement() { return reference(); }, get referenceElement() { return reference(); }, positionReference: null,
      get floatingElement() { return element(); }, floatingId: 'handoff-dialog' } });
    return <><button ref={node => { trigger = node; reportReference(node); }}>Trigger</button><button ref={node => { handoff = node; }}>Next owner</button>
      <FloatingFocusManager context={root} modal={false} initialFocus={false} returnFocus={explicit ? () => trigger : true}>
        <div role="dialog" ref={report}><button ref={node => { content = node; }}>Content</button></div>
      </FloatingFocusManager></>;
  });
  trigger.focus(); setOpen(true); await flushMicrotasks();
  content.focus();
  setOpen(false); flush();
  // A navigation relay chooses a new owner before the queued return executes.
  handoff.focus(); await flushMicrotasks();
  expect(explicit ? trigger : handoff).toHaveFocus();
  view.unmount();
});

it.each(['consumer-handoff', 'closing'] as const)('child-removal restoration respects %s', async (policy) => {
  const view = await createRenderer().renderProps((props: { open: boolean; show: boolean }) => <>
    <input aria-label="Next consumer" />
    <Dialog.Root open={props.open} modal={false}><Dialog.Portal><Dialog.Popup finalFocus={false}>
      {props.show && <input aria-label="Removed child" />}
    </Dialog.Popup></Dialog.Portal></Dialog.Root>
  </>, { open: true, show: true });
  const child = view.getByRole('textbox', { name: 'Removed child' });
  await waitFor(() => expect(child).toHaveFocus());
  const popup = view.getByRole('dialog');
  const consumer = view.getByRole('textbox', { name: 'Next consumer' });
  if (policy === 'consumer-handoff') consumer.focus();
  await view.setProps({ show: false, open: policy !== 'closing' });
  await waitFor(() => expect(child).not.toBeInTheDocument());
  expect(popup).not.toHaveFocus();
  if (policy === 'consumer-handoff') expect(consumer).toHaveFocus();
});
