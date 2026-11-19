// Runtime characterization only: deliberately imports no Base UI implementation.
import { afterEach, expect, test } from 'vitest';
import { $PROXY, children, createContext, createEffect, createRoot, createSignal, createStore, flush, getOwner, merge, omit, onCleanup, Show, useContext } from 'solid-js';
import { insert, isServer, render } from '@solidjs/web';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const disposers: (() => void)[] = [];
function owned(fn: () => void) { return createRoot(dispose => { fn(); return dispose; }); }
afterEach(() => { disposers.splice(0).reverse().forEach(fn => fn()); document.body.replaceChildren(); });
function mount(fn: () => any) {
  const host = document.createElement('div'); document.body.append(host);
  const dispose = render(fn, host); disposers.push(dispose);
  return { host, dispose };
}

test('actual client runtime is pinned 2.0.3', () => {
  expect(require('solid-js/package.json').version).toBe('2.0.3');
  expect(isServer).toBe(false);
});

test('refs receive neither null nor returned cleanup on conditional removal or disposal', () => {
  const calls: unknown[] = []; let hide!: () => void;
  const { host, dispose } = mount(() => {
    const [shown, setShown] = createSignal(true); hide = () => setShown(false);
    return <Show when={shown()}><input ref={node => { calls.push(node); return () => calls.push('returned cleanup'); }} /></Show>;
  });
  const input = host.firstChild; expect(calls).toEqual([input]);
  hide(); flush(); expect(host.childNodes.length).toBe(0); expect(calls).toEqual([input]);
  dispose(); expect(calls).toEqual([input]);
});

test('native ref retains creating context rather than a null owner', () => {
  const Context = createContext('fallback'); let owner: unknown; let context: unknown;
  mount(() => <Context value="provided"><input ref={() => { owner = getOwner(); context = useContext(Context); }} /></Context>);
  expect(owner).not.toBeNull(); expect(context).toBe('provided');
});

test.each(['text', 'checkbox', 'radio'])('removing a spread value restores native %s input baseline', type => {
  let clear!: () => void;
  const { host } = mount(() => {
    const [props, setProps] = createSignal<Record<string, string>>({ value: 'explicit' });
    clear = () => setProps({}); return <input type={type} {...props()} />;
  });
  const input = host.firstChild as HTMLInputElement; expect(input.value).toBe('explicit');
  clear(); flush(); expect(input.value).toBe(type === 'text' ? '' : 'on');
});

test('defaultValue updates the reset baseline without replacing a dirty text value', () => {
  let change!: () => void;
  const { host } = mount(() => { const [value, setValue] = createSignal('initial'); change = () => setValue('later'); return <form><input defaultValue={value()} /></form>; });
  const input = host.querySelector('input')!; expect(input.value).toBe('initial');
  input.value = 'edited'; change(); flush();
  expect(input.value).toBe('edited'); expect(input.defaultValue).toBe('later');
  host.querySelector('form')!.reset(); expect(input.value).toBe('later');
});

test('delegated input skips disabled node while native listener and ancestor receive event', () => {
  const calls: string[] = [];
  const { host } = mount(() => <div onInput={() => calls.push('ancestor')}><input disabled onInput={() => calls.push('delegated')} /></div>);
  const input = host.querySelector('input')!; input.addEventListener('input', () => calls.push('native'));
  input.dispatchEvent(new Event('input', { bubbles: true })); expect(calls).toEqual(['native', 'ancestor']);
  input.disabled = false; calls.length = 0;
  input.dispatchEvent(new Event('input', { bubbles: true })); expect(calls).toEqual(['native', 'delegated', 'ancestor']);
});

test('keyed replacement constructs before predecessor cleanup', () => {
  const calls: string[] = []; let replace!: () => void;
  function Item(props: { id: string }) { calls.push(`setup ${props.id}`); onCleanup(() => calls.push(`cleanup ${props.id}`)); return <span>{props.id}</span>; }
  mount(() => { const [id, setId] = createSignal('a'); replace = () => setId('b'); return <Show when={id()} keyed>{id => <Item id={id} />}</Show>; });
  replace(); flush(); expect(calls).toEqual(['setup a', 'setup b', 'cleanup a']);
});

test('signal updaters accumulate pending writes; store and effect ownership remain committed until flush', () => {
  let run!: () => void; const effects: string[] = [];
  const root = owned(() => {
    const [value, setValue] = createSignal(0); const [store, setStore] = createStore({ value: 0 });
    createEffect(() => store.value, value => { effects.push(`apply ${value}`); return () => effects.push(`cleanup ${value}`); });
    run = () => { setValue(v => v + 1); setValue(v => v + 1); setStore(draft => { draft.value = 2; });
      expect(value()).toBe(0); expect(store.value).toBe(0); expect(effects).toEqual(['apply 0']);
      flush(); expect(value()).toBe(2); expect(store.value).toBe(2); expect(effects).toEqual(['apply 0', 'cleanup 0', 'apply 2']); };
  });
  disposers.push(root); flush(); run(); root(); expect(effects.at(-1)).toBe('cleanup 2');
});

test('ref-written state remains staged with insert before render flush', () => {
  let read!: () => HTMLElement | null; const host = document.createElement('div');
  const root = owned(() => { const [node, setNode] = createSignal<HTMLElement | null>(null); read = node; insert(host, <div ref={node => { setNode(node); }} />); });
  disposers.push(root); expect(read()).toBeNull(); flush(); expect(read()).toBe(host.firstChild);
});

test('context children can be unbranded zero-arity functions and native children resolves them', () => {
  const Context = createContext('fallback');
  const root = owned(() => {
    const child = <Context value="provided"><span>child</span></Context>;
    expect(typeof child).toBe('function'); expect((child as unknown as Function).length).toBe(0);
    expect((child as any).toArray).toBeUndefined();
    const resolved = children(() => child); expect((resolved() as HTMLElement).textContent).toBe('child');
  }); disposers.push(root);
});

test('merge preserves explicit undefined and live source getter receivers through omit', () => {
  const root = owned(() => {
    const source = { value: 1, get doubled() { return this.value * 2; } };
    const result = omit(merge({ masked: 'default' }, source, { masked: undefined }), 'value');
    expect(result.masked).toBeUndefined(); expect('masked' in result).toBe(true);
    expect(result.doubled).toBe(2); source.value = 3; expect(result.doubled).toBe(6);
  }); disposers.push(root);
});

test.each([false, true])('foreign changing-key proxy with $PROXY=%s through merge/omit', branded => {
  const root = owned(() => {
    let bag: Record<string, string> = { first: 'a' };
    const proxy: Record<string | symbol, any> = new Proxy({}, {
      ownKeys: () => Object.keys(bag),
      has: (_, key) => branded && key === $PROXY || key in bag,
      get: (_, key) => branded && key === $PROXY ? proxy : bag[key as string],
      getOwnPropertyDescriptor: (_, key) => key in bag ? { configurable: true, enumerable: true, get: () => bag[key as string] } : undefined,
    });
    const result = omit(merge({ fixed: 'fixed' }, proxy), 'fixed');
    expect(Object.keys(result)).toEqual(['first']);
    bag = { second: 'b' };
    expect(Object.keys(result)).toEqual(branded ? ['second'] : ['first']);
    if (branded) expect(result.second).toBe('b');
  }); disposers.push(root);
});

test('ordinary input delegation does not install an own preventDefault method', () => {
  let descriptor: PropertyDescriptor | undefined;
  const { host } = mount(() => <input onInput={event => { descriptor = Object.getOwnPropertyDescriptor(event, 'preventDefault'); event.preventDefault(); }} />);
  const event = new Event('input', { bubbles: true, cancelable: true });
  host.querySelector('input')!.dispatchEvent(event);
  expect(descriptor).toBeUndefined(); expect(event.defaultPrevented).toBe(true);
});
