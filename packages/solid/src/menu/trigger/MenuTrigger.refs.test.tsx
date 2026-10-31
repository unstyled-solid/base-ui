import { expect, it, vi } from 'vitest';
import { createRenderer, screen } from '../../../test';
import * as Menu from '../index.parts';
import { createRenderElement } from '../../internals/createRenderElement';
import { createButton } from '../../internals/use-button';
import { createSignal, flush } from 'solid-js';

const { renderProps } = createRenderer();

it('does not reread unchanged trigger refs when only open state changes', async () => {
  const first = vi.fn();
  const second = vi.fn();
  const readRef = vi.fn();
  let replaceRef!: () => void;
  const view = await renderProps((props: { open: boolean }) => {
    const [ref, setRef] = createSignal(() => first);
    replaceRef = () => { setRef(() => second); };
    const triggerProps = {
      get ref() { readRef(); return ref(); },
    };
    return <Menu.Root open={props.open}><Menu.Trigger {...triggerProps}>Open</Menu.Trigger></Menu.Root>;
  }, { open: false });
  const trigger = screen.getByRole('button', { name: 'Open' });
  readRef.mockClear();
  for (const open of [true, false, true, false]) {
    await view.setProps({ open });
    expect(screen.getByRole('button', { name: 'Open' })).toBe(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', String(open));
  }
  expect(first.mock.calls).toEqual([[trigger]]);
  const unchangedRefReads = readRef.mock.calls.length;
  replaceRef();
  flush();
  expect(first.mock.calls).toEqual([[trigger], [null]]);
  expect(second.mock.calls).toEqual([[trigger]]);
  expect(unchangedRefReads).toBe(0);
});

it('shared renderer control: stable button prop sources do not reread refs for state attributes', async () => {
  const ref = vi.fn();
  const readRef = vi.fn();
  function Control(props: { open: boolean }) {
    const button = createButton();
    return createRenderElement('button', {}, {
      state: { get open() { return props.open; } },
      get ref() { readRef(); return ref; },
      props: [{ children: 'Control' }, button.getButtonProps],
    });
  }
  const view = await renderProps((props: { open: boolean }) => <Control open={props.open} />, { open: false });
  const trigger = screen.getByRole('button', { name: 'Control' });
  readRef.mockClear();
  for (const open of [true, false, true, false]) {
    await view.setProps({ open });
    expect(screen.getByRole('button', { name: 'Control' })).toBe(trigger);
    expect(trigger.hasAttribute('data-open')).toBe(open);
  }
  expect(ref.mock.calls).toEqual([[trigger]]);
  expect(readRef).not.toHaveBeenCalled();
});
