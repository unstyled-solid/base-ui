import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { advanceTimers, createRenderer, flushMicrotasks } from '../../../test';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createFocus } from './createFocus';

it('does not cancel queued blur when the active reference publishes in the same turn', async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  let publishReference!: (node: Element) => void;
  const view = await createRenderer().render(() => {
    const [reference, setReference] = createSignal<Element | null>(null);
    publishReference = setReference;
    const root = createFloatingRoot({ state: {
      open: true, transitionStatus: undefined,
      get referenceElement() { return reference(); }, get domReferenceElement() { return reference(); },
      positionReference: null, floatingElement: null, floatingId: undefined,
    }, onOpenChange: changed });
    const focus = createFocus(root);
    return <><button {...focus.reference}>Trigger</button><button>Outside</button></>;
  });
  const trigger = view.getByRole('button', { name: 'Trigger' });
  trigger.focus();
  view.getByRole('button', { name: 'Outside' }).focus();
  publishReference(trigger);
  await flushMicrotasks();
  await advanceTimers(0);
  expect(changed.mock.calls.map(([open]) => open)).toEqual([true, false]);
  expect(changed.mock.calls[1]![1].event.type).toBe('focusout');
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
