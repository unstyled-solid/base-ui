import { expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { createRenderer, waitFor } from '../../../test';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createFocus } from './createFocus';
import { mergeProps } from '../../merge-props/mergeProps';

it.each([0, 25])('createFocus retains trusted bubbling native events exactly once, delay=%s', async delay => {
  const events: FocusEvent[] = [];
  const changed = vi.fn();
  const order: string[] = [];
  const view = await createRenderer().render(() => {
    const [reference, setReference] = createSignal<Element | null>(null);
    const root = createFloatingRoot({ state: {
      open: false, transitionStatus: undefined,
      get domReferenceElement() { return reference(); },
      get referenceElement() { return reference(); },
      positionReference: null, floatingElement: null, floatingId: undefined,
    }, onOpenChange(value, details) { order.push('change'); changed(value, details); } });
    const focus = createFocus(root, { delay });
    const props = mergeProps<'div'>(focus.reference, {
      onFocusIn(event) { events.push(event); order.push('consumer-in'); },
      onFocusOut(event) { events.push(event); order.push('consumer-out'); },
    });
    expect(focus.reference?.onFocus).toBeUndefined();
    expect(focus.reference?.onBlur).toBeUndefined();
    return <><div {...props} ref={setReference}><input aria-label="Read only trigger" readonly /></div><button>Next</button></>;
  });
  const input = view.getByRole('textbox');
  expect(input).toHaveAttribute('readonly');
  await userEvent.keyboard('{Tab}');
  expect(input).toHaveFocus();
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  const opening = changed.mock.calls[0][1];
  expect(opening.event).toBe(events[0]);
  expect(opening.event.type).toBe('focusin');
  expect(opening.event.isTrusted).toBe(true);
  expect(opening.event.bubbles).toBe(true);
  expect(opening.event.cancelable).toBe(false);
  expect(opening.trigger).toBe(input.parentElement);
  expect(opening.reason).toBe('trigger-focus');
  expect(order).toEqual(['consumer-in', 'change']);
  await userEvent.keyboard('{Tab}');
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
  const closing = changed.mock.calls[1][1];
  expect(changed.mock.calls.map(([value]) => value)).toEqual([true, false]);
  expect(closing.event).toBe(events[1]);
  expect(closing.event.type).toBe('focusout');
  expect(closing.event.relatedTarget).toBe(view.getByRole('button'));
  expect(closing.trigger).toBeUndefined();
  expect(order).toEqual(['consumer-in', 'change', 'consumer-out', 'change']);
  view.unmount();
});

it('createFocus consumer prevention and details cancellation remain distinct on the same native event', async () => {
  const changed = vi.fn();
  const accepted = vi.fn();
  let prevent = true;
  let observed: FocusEvent | undefined;
  const view = await createRenderer().render(() => {
    const root = createFloatingRoot({ state: {
      open: false, transitionStatus: undefined, domReferenceElement: null,
      referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined,
    }, onOpenChange(value, details) { details.cancel(); changed(value, details); } });
    root.events.on('openchange', accepted);
    const focus = createFocus(root);
    return <><button {...mergeProps<'button'>(focus.reference, {
      onFocusIn(event) { observed = event; if (prevent) event.preventBaseUIHandler(); },
      onFocusOut(event) { event.preventBaseUIHandler(); },
    })}>Trigger</button><button>Next</button></>;
  });
  await userEvent.keyboard('{Tab}');
  expect(changed).not.toHaveBeenCalled();
  expect(observed?.type).toBe('focusin');
  await userEvent.keyboard('{Tab}');
  prevent = false;
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  expect(changed).toHaveBeenCalledOnce();
  expect(changed.mock.calls[0][1].event).toBe(observed);
  expect(changed.mock.calls[0][1].isCanceled).toBe(true);
  expect(observed?.defaultPrevented).toBe(false);
  expect(accepted).not.toHaveBeenCalled();
  view.unmount();
});

it('createFocus disabled source option omits both interaction bags', async () => {
  const view = await createRenderer().render(() => {
    const root = createFloatingRoot({ state: {
      open: false, transitionStatus: undefined, domReferenceElement: null,
      referenceElement: null, positionReference: null, floatingElement: null, floatingId: undefined,
    } });
    const focus = createFocus(root, { enabled: false });
    expect(focus.reference).toBeUndefined();
    expect(focus.trigger).toBeUndefined();
    return <button>Disabled interaction</button>;
  });
  view.unmount();
});
