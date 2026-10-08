import { createContext, createRoot, createSignal, flush, getOwner, useContext, DEV } from 'solid-js';
import { isServer } from '@solidjs/web';
import { cleanup, fireEvent, render } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { Bootstrap } from './Bootstrap';

afterEach(() => { cleanup(); });

test('Bootstrap: staged updates, current callbacks and live render state retain one host', async () => {
  expect(isServer).toBe(false);
  expect(DEV).toBeDefined();
  const effects: number[] = [];
  const cleanups: number[] = [];
  const disposed = vi.fn();
  const settled = vi.fn();
  const callback = vi.fn();
  let change!: () => void;
  let renders = 0;
  const refs: HTMLButtonElement[] = [];
  let refOwner: ReturnType<typeof getOwner> | undefined;
  const view = render(() => {
    const [count, setCount] = createSignal(0);
    const [handler, setHandler] = createSignal<(event: MouseEvent) => void>(() => () => {});
    change = () => {
      setCount((value) => value + 1);
      setCount((value) => value + 1);
      setHandler(() => callback);
      expect(count()).toBe(0);
    };
    return <Bootstrap count={count()} class={['proof', { active: count() > 0 }]}
      onActivate={(event) => handler()(event)}
      onRef={(element) => { refs.push(element); refOwner = getOwner(); }}
      onEffect={(value) => effects.push(value)} onCleanup={(value) => cleanups.push(value)}
      onSettled={settled} onDispose={disposed}
      render={(props, state) => {
        renders += 1;
        return <button {...props} data-count={state.count} />;
      }} />;
  });
  const button = view.getByRole('button');
  expect(button.textContent).toBe('Count: 0');
  expect(refOwner).toBeNull();
  expect(effects).toEqual([0]);
  expect(settled).toHaveBeenCalledTimes(1);
  change();
  expect(button.textContent).toBe('Count: 0');
  flush(); // Intentional synchronous test observation, never production scheduling policy.
  expect(view.getByRole('button')).toBe(button);
  expect(button.textContent).toBe('Count: 2');
  expect(button.getAttribute('data-count')).toBe('2');
  expect(button.className).toBe('proof active');
  expect(renders).toBe(1);
  expect(refs).toEqual([button]);
  await userEvent.setup().click(button);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(effects).toEqual([0, 2]);
  expect(cleanups).toEqual([0]);
  view.unmount();
  expect(cleanups).toEqual([0, 2]);
  expect(disposed).toHaveBeenCalledTimes(1);
});

test('Bootstrap: required context throws, optional context is null, direct provider stays live', () => {
  const Required = createContext<{ readonly label: string }>();
  const Optional = createContext<{ label: string } | null>(null);
  createRoot((dispose) => {
    try {
      expect(useContext(Optional)).toBeNull();
      expect(() => useContext(Required)).toThrow();
    } finally { dispose(); }
  });
  let change!: () => void;
  function Child() {
    const context = useContext(Required);
    return <button onClick={() => change()}>{context.label}</button>;
  }
  const view = render(() => {
    const [label, setLabel] = createSignal('first');
    change = () => { setLabel('second'); };
    return <Required value={{ get label() { return label(); } }}><Child /></Required>;
  });
  const button = view.getByRole('button');
  fireEvent.click(button);
  flush();
  expect(view.getByRole('button')).toBe(button);
  expect(button.textContent).toBe('second');
});
