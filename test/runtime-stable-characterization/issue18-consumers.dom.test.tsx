// Consumer behavior, intentionally separate from the Solid-only characterization.
import { afterEach, expect, test, vi } from 'vitest';
import { createContext, createEffect, createRoot, createSignal, flush, For, useContext } from 'solid-js';
import { render, type JSX } from '@solidjs/web';
import { createMergedRefsN } from '../../packages/solid/src/utils/createMergedRefs';
import { ComboboxRoot } from '../../packages/solid/src/combobox/root/ComboboxRoot';
import { ComboboxList } from '../../packages/solid/src/combobox/list/ComboboxList';
import { ComboboxCollection } from '../../packages/solid/src/combobox/collection/ComboboxCollection';
import { createAnimationsFinished } from '../../packages/solid/src/internals/createAnimationsFinished';
import { resetAnimationFrameScheduler } from '../../packages/solid/src/utils/createAnimationFrame';
import { CompositeList } from '../../packages/solid/src/internals/composite/list/CompositeList';
import { createCompositeListItem } from '../../packages/solid/src/internals/composite/list/createCompositeListItem';
import { OTPFieldRoot } from '../../packages/solid/src/otp-field/root/OTPFieldRoot';
import { OTPFieldInput } from '../../packages/solid/src/otp-field/input/OTPFieldInput';

const disposers: (() => void)[] = [];
afterEach(() => { disposers.splice(0).reverse().forEach(dispose => dispose()); resetAnimationFrameScheduler(); vi.restoreAllMocks(); document.body.replaceChildren(); });
function mount(fn: () => JSX.Element) {
  const host = document.createElement('div'); document.body.append(host);
  disposers.push(render(fn, host)); return host;
}

test('merged refs lose provider context on attachment, callback replacement and disposal', () => {
  const Context = createContext('missing'); const calls: string[] = []; let replace!: () => void;
  function App() {
    const [alternate, setAlternate] = createSignal(false); replace = () => setAlternate(true);
    function readContext() {
      // Catch the observed consumer error at its source so this negative probe
      // does not halt the runtime or contaminate subsequent test cases.
      try { return useContext(Context); } catch (error) {
        expect((error as Error).message).toBe('Context can only be accessed under a reactive root.');
        return 'NoOwnerError';
      }
    }
    const a = (node: HTMLElement | null) => calls.push(`a:${node ? 'attach' : 'detach'}:${readContext()}`);
    const b = (node: HTMLElement | null) => calls.push(`b:${node ? 'attach' : 'detach'}:${readContext()}`);
    const refs = createMergedRefsN<HTMLElement>(() => [alternate() ? b : a]);
    return <div ref={refs} />;
  }
  const host = mount(() => <Context value="provided"><App /></Context>); const node = host.firstChild;
  replace(); flush(); expect(host.firstChild).toBe(node);
  disposers.pop()!();
  expect(calls).toEqual(['a:attach:NoOwnerError', 'a:detach:NoOwnerError', 'b:attach:NoOwnerError', 'b:detach:NoOwnerError']);
});

test.each(['ordinary', 'default', 'rest', 'explicit-collection', 'explicit-rest', 'explicit-zero', 'provider'])('Combobox list child convention: %s', mode => {
  const Context = createContext('missing');
  function ProviderChild() { return <span>{useContext(Context)}</span>; }
  const ordinary = (item: string) => <span>{String(item)}</span>;
  const withDefault = (item = 'fallback') => <span>{item}</span>;
  const withRest = (...args: any[]) => <span>{String(args[0] ?? 'no item')}</span>;
  const zero = () => <span>constant</span>;
  const host = mount(() => <ComboboxRoot items={['alpha', 'beta']}>
    <ComboboxList>{mode === 'ordinary' ? ordinary : mode === 'default' ? withDefault : mode === 'rest' ? withRest
      : mode === 'explicit-collection' ? <ComboboxCollection>{withDefault}</ComboboxCollection>
      : mode === 'explicit-rest' ? <ComboboxCollection>{withRest}</ComboboxCollection>
      : mode === 'explicit-zero' ? <ComboboxCollection>{zero}</ComboboxCollection>
      : <Context value="provided"><ProviderChild /></Context>}</ComboboxList>
  </ComboboxRoot>);
  expect(host.textContent).toBe(mode === 'ordinary' || mode === 'explicit-collection' || mode === 'explicit-rest' ? 'alphabeta'
    : mode === 'explicit-zero' ? 'constantconstant'
    : mode === 'default' ? 'fallback' : mode === 'rest' ? 'no item' : 'provided');
});

test('merged ref callbacks retain setup-captured context through replacement and teardown', () => {
  const Context = createContext('missing'); const calls: string[] = []; let replace!: () => void;
  function App() {
    const context = useContext(Context);
    const [alternate, setAlternate] = createSignal(false); replace = () => setAlternate(true);
    const callback = (name: string) => (node: HTMLElement | null) => calls.push(`${name}:${node ? 'attach' : 'detach'}:${context}`);
    const first = callback('first'); const second = callback('second');
    const ref = createMergedRefsN<HTMLElement>(() => [alternate() ? second : first]);
    return <div ref={ref} />;
  }
  mount(() => <Context value="provided"><App /></Context>);
  replace(); flush(); disposers.pop()!();
  expect(calls).toEqual(['first:attach:provided', 'first:detach:provided', 'second:attach:provided', 'second:detach:provided']);
});

test.each([false, true])('animation completion batch=%s preserves its documented checkpoint distinction', async batch => {
  let tick!: FrameRequestCallback;
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => { tick = callback; return 1; });
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
  const node = document.createElement('div'); node.getAnimations = () => [];
  let read!: () => number; let write!: (value: number) => void;
  let first!: ReturnType<typeof createAnimationsFinished>; let second!: ReturnType<typeof createAnimationsFinished>;
  disposers.push(createRoot(dispose => { [read, write] = createSignal(0);
    first = createAnimationsFinished(() => node, false, batch); second = createAnimationsFinished(() => node, false, batch); return dispose; }));
  const seen: number[] = [];
  const done = new Promise<void>(resolve => { first(() => write(1)); second(() => { seen.push(read()); resolve(); }); });
  tick(0); await done;
  expect(seen).toEqual([batch ? 0 : 1]);
});

test.each(['abort', 'dispose'])('animation completion honors %s after finish promise but before delivery', async cancel => {
  let tick!: FrameRequestCallback;
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => { tick = callback; return 1; });
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
  const node = document.createElement('div'); node.getAnimations = () => [];
  const controller = new AbortController(); const callback = vi.fn(); let run!: ReturnType<typeof createAnimationsFinished>;
  const dispose = createRoot(dispose => { run = createAnimationsFinished(() => node); return dispose; }); disposers.push(dispose);
  run(callback, controller.signal); tick(0);
  await Promise.resolve(); // Promise.all([]) settled and enqueued the deferred delivery.
  if (cancel === 'abort') controller.abort(); else dispose();
  await new Promise<void>(resolve => queueMicrotask(resolve));
  expect(callback).not.toHaveBeenCalled();
});

test('CompositeList count publication temporarily lags length; deferred connected-node check sees settled count', async () => {
  const observed: number[][] = []; const deferred: number[][] = []; let resize!: () => void;
  const elements = { current: [] as (HTMLElement | null)[] };
  function Item() { const item = createCompositeListItem(); return <input ref={item.ref} />; }
  mount(() => {
    const [length, setLength] = createSignal(2); const [count, setCount] = createSignal(0);
    resize = () => setLength(1);
    createEffect(() => [length(), count()] as const, ([length, count]) => {
      observed.push([length, count]);
      if (count && count !== length) queueMicrotask(() => deferred.push([length, elements.current.filter(node => node?.isConnected).length]));
    });
    return <CompositeList elementsRef={elements} onMapChange={map => setCount(map.size)}>
      <For each={Array.from({ length: length() }, (_, index) => index)}>{() => <Item />}</For>
    </CompositeList>;
  });
  observed.length = 0; resize(); flush();
  await new Promise<void>(resolve => queueMicrotask(resolve));
  expect(observed).toContainEqual([1, 2]); expect(observed.at(-1)).toEqual([1, 1]);
  expect(deferred).toEqual([[1, 1]]);
});

test('OTP dynamic length and slots emit no transient warning but still report a real mismatch', async () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  let resize!: (length: number, slots: number) => void;
  mount(() => {
    const [length, setLength] = createSignal(2); const [slots, setSlots] = createSignal(2);
    resize = (nextLength, nextSlots) => { setLength(nextLength); setSlots(nextSlots); };
    return <OTPFieldRoot length={length()}><For each={Array.from({ length: slots() }, (_, index) => index)}>{() => <OTPFieldInput />}</For></OTPFieldRoot>;
  });
  resize(1, 1); flush(); await new Promise<void>(resolve => queueMicrotask(resolve));
  expect(warning.mock.calls).toEqual([]);
  resize(3, 1); flush(); await new Promise<void>(resolve => queueMicrotask(resolve));
  expect(warning.mock.calls).toHaveLength(1);
  expect(String(warning.mock.calls[0][0])).toContain('`length` must match the number of rendered');
});
