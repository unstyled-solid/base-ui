// Solid-only probes. Component-specific regressions are in issue18-consumers.dom.test.tsx.
import { afterEach, expect, test } from 'vitest';
import { createContext, createRoot, createSignal, flush, onCleanup, useContext } from 'solid-js';
import { render, type JSX } from '@solidjs/web';
import userEvent from '@testing-library/user-event';

const disposers: (() => void)[] = [];
afterEach(() => { disposers.splice(0).reverse().forEach(dispose => dispose()); document.body.replaceChildren(); });
function mount(fn: () => JSX.Element) {
  const host = document.createElement('div'); document.body.append(host);
  disposers.push(render(fn, host)); return host;
}

test.each(['switch', 'radio'])('%s exact conditional value spread preserves native value/attribute/form reset', kind => {
  let setValue!: (value: string | undefined) => void;
  let setDisabled!: (value: boolean) => void;
  const host = mount(() => {
    const [value, writeValue] = createSignal<string | undefined>(undefined);
    const [disabled, writeDisabled] = createSignal(false);
    setValue = writeValue; setDisabled = writeDisabled;
    const props = { get value() { return value(); } };
    // Match the two source ternaries and surrounding spread order. No compensating effect.
    const validationProps = () => ({ 'aria-invalid': undefined });
    return <form>{kind === 'switch'
      ? <input {...validationProps()} type="checkbox" checked name="choice" disabled={disabled()}
          {...(props.value !== undefined ? { value: props.value } : {})} onChange={() => {}} />
      : <input type="radio" name="choice" aria-hidden="true"
          {...(props.value === undefined ? {} : { value: props.value })}
          checked disabled={disabled()} onChange={() => {}} />}</form>;
  });
  const input = host.querySelector('input')!;
  const form = host.querySelector('form')!;
  for (const value of [undefined, 'explicit', undefined, '', undefined, 'again', undefined]) {
    setValue(value); flush();
    expect(host.querySelector('input')).toBe(input);
    expect(input.value).toBe(value ?? 'on');
    expect(input.getAttribute('value')).toBe(value ?? null);
    input.checked = true;
    expect(new FormData(form).get('choice')).toBe(value ?? 'on');
    form.reset(); expect(input.value).toBe(value ?? 'on');
  }
  setDisabled(true); flush(); expect(new FormData(form).has('choice')).toBe(false);
});

test('assignment refs and nested ref arrays preserve ordering, context and ignored cleanup returns', () => {
  const Context = createContext('missing'); const calls: string[] = []; let assigned!: HTMLInputElement;
  const first = () => { calls.push(`first:${useContext(Context)}`); return () => calls.push('returned cleanup'); };
  const second = () => { calls.push(`second:${useContext(Context)}`); };
  function App() { onCleanup(() => calls.push('owned cleanup')); return <><input ref={assigned} /><input ref={[first, [second]]} /></>; }
  const host = mount(() => <Context value="provided"><App /></Context>);
  expect(assigned).toBe(host.firstChild); expect(calls).toEqual(['first:provided', 'second:provided']);
  disposers.pop()!(); expect(calls).toEqual(['first:provided', 'second:provided', 'owned cleanup']);
});

test('native bound event tuple receives payload and currentTarget', () => {
  const calls: unknown[][] = []; const payload = { id: 1 };
  const host = mount(() => <button onClick={[(data, event) => calls.push([data, event.currentTarget]), payload]}>bound</button>);
  host.querySelector('button')!.click(); expect(calls).toEqual([[payload, host.firstChild]]);
});

test('readonly preventDefault is supplied by user-event keyboard simulation, not ordinary native keyboard delegation', async () => {
  const descriptors: (PropertyDescriptor | undefined)[] = [];
  const host = mount(() => <input onKeyDown={event => { descriptors.push(Object.getOwnPropertyDescriptor(event, 'preventDefault')); event.preventDefault(); }} />);
  const input = host.querySelector('input')!; input.focus();
  const native = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
  input.dispatchEvent(native); expect(descriptors.shift()).toBeUndefined(); expect(native.defaultPrevented).toBe(true);
  await userEvent.setup({ document }).keyboard('{Tab}');
  expect(descriptors).toHaveLength(1);
  expect(descriptors[0]).toMatchObject({ writable: false, configurable: false });
  expect(input.value).toBe('');
});

test.each([false, true])('chained microtasks=%s determine whether the second callback sees committed first write', async chained => {
  let read!: () => number; let write!: (value: number) => void;
  disposers.push(createRoot(dispose => { [read, write] = createSignal(0); return dispose; }));
  const seen: number[] = [];
  await new Promise<void>(resolve => {
    const second = () => { seen.push(read()); resolve(); };
    queueMicrotask(() => { write(1); if (chained) queueMicrotask(second); });
    if (!chained) queueMicrotask(second);
  });
  expect(seen).toEqual([chained ? 1 : 0]);
  expect(read()).toBe(1);
});
