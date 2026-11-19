import { createRoot, createSignal, flush, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { expect, it, vi } from 'vitest';
import { createRenderer } from '../../../test';
import { createPopup, type PopupModel } from './createPopup';
import { createMenuStore } from '../../menu/store/MenuStore';
import { createPopupInteractionProps } from './createPopupInteractionProps';

it('attaches live popup handlers after setup and preserves reactive updates and host identity', async () => {
  const first = vi.fn(), second = vi.fn();
  let model!: PopupModel<unknown>;
  const view = await createRenderer().renderProps((props: { changed: boolean }) => {
    model = createPopup({});
    model.setInteractionProps({ get reference() { return { onClick: props.changed ? second : first }; } });
    // This fixture installs only native-compatible spy handlers, without Base UI event extensions.
    return <button {...model.state.activeTriggerProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>}>Trigger</button>;
  }, { changed: false });
  const button = view.getByRole('button');
  button.click();
  expect(first).toHaveBeenCalledOnce();
  await view.setProps({ changed: true });
  expect(view.getByRole('button')).toBe(button);
  button.click();
  expect(second).toHaveBeenCalledOnce();
});

it('retains the live menu filter bag across reactive changes', () => {
  let dispose!: () => void;
  let menu!: ReturnType<typeof createMenuStore>;
  let update!: (value: string) => void;
  createRoot(stop => {
    dispose = stop;
    const [label, setLabel] = createSignal('first');
    update = setLabel;
    menu = createMenuStore({ parent: { type: undefined }, rootId: 'menu', floatingId: 'popup' });
    menu.setFilterTriggerProps({ get 'aria-label'() { return label(); } });
  });
  try {
    flush();
    expect(untrack(() => menu.state.filterTriggerProps['aria-label'])).toBe('first');
    update('second'); flush();
    expect(untrack(() => menu.state.filterTriggerProps['aria-label'])).toBe('second');
  } finally { dispose(); }
});

it('clears interactions when the installing child is disposed before the popup owner', () => {
  let dispose!: () => void;
  let remove!: () => void;
  let model!: PopupModel<unknown>;
  createRoot(stop => {
    dispose = stop;
    model = createPopup({});
    createRoot(stopChild => {
      remove = stopChild;
      createPopupInteractionProps(model, { activeTriggerProps: { 'aria-label': 'attached' } });
    });
  });
  try {
    flush();
    expect(untrack(() => model.state.activeTriggerProps['aria-label'])).toBe('attached');
    remove(); flush();
    expect(untrack(() => model.state.activeTriggerProps)).toEqual({});
  } finally { dispose(); }
});

it('does not attach pending interaction bags after owner disposal', () => {
  let model!: PopupModel<unknown>;
  createRoot(dispose => {
    model = createPopup({});
    model.setInteractionProps({ reference: { 'aria-label': 'disposed' } });
    dispose();
  });
  flush();
  expect(untrack(() => model.state.activeTriggerProps)).toEqual({});
  model.setInteractionProps({ reference: { 'aria-label': 'late' } });
  flush();
  expect(untrack(() => model.state.activeTriggerProps)).toEqual({});
});
