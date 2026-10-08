import { createEffect, createSignal, flush, getOwner, isDisposed, onSettled, untrack } from 'solid-js';
import { isServer, Portal } from '@solidjs/web';
import { describe, it, expect, vi } from 'vitest';
import { createRenderer, describeConformance, popupConformanceTests, createTestInteractions, firePointer, fireEvent, advanceTimers, advanceFrame, flushMicrotasks, expectDiagnostic } from '../../packages/solid/test';
import { ConformantFixture, PopupFixture } from './fixtures';
import type { FixtureProps, FixtureState } from './fixtures';

describeConformance<FixtureState, FixtureProps>((props) => <ConformantFixture {...props} />, {
  initialProps: { active: false }, refInstanceof: HTMLDivElement, testRenderPropWith: 'input',
  state: { change: { active: true }, assert: (state, changed) => expect(untrack(() => state.active)).toBe(changed), class: (state) => state.active ? 'active' : 'inactive', before: 'inactive', after: 'active' },
});
popupConformanceTests({ createComponent: (props) => <PopupFixture {...props} />, triggerMouseAction: 'click', expectedPopupRole: 'dialog', browserIssue: 'bsolid-harness-browser-replay' });

describe('Harness runtime contract', () => {
  const { render, renderProps } = createRenderer();
  it('queries portalled content through the declared baseElement', async () => {
    const view = await render(() => <Portal><button>Portalled</button></Portal>);
    const button = view.getByRole('button', { name: 'Portalled' });
    expect(view.container.contains(button)).toBe(false);
    expect(view.baseElement.contains(button)).toBe(true);
    view.unmount();
    expect(button.isConnected).toBe(false);
  });
  it('keeps interaction prop getters stable across a live update with setup running once', async () => {
    let setups = 0;
    const observed: unknown[] = [];
    const view = await renderProps((props: { title: string }) => {
      setups++;
      const api = createTestInteractions(() => [{ reference: { title: props.title } }]);
      createEffect(() => props.title, () => { observed.push(api.getReferenceProps); });
      return <button {...api.getReferenceProps()}>Stable</button>;
    }, { title: 'before' });
    const button = view.getByRole('button');
    expect(button).toHaveAttribute('title', 'before');
    await view.setProps({ title: 'after' });
    expect(button).toHaveAttribute('title', 'after');
    expect(view.getByRole('button')).toBe(button);
    expect(setups).toBe(1);
    expect(observed).toHaveLength(2);
    expect(observed[1]).toBe(observed[0]);
  });
  it('uses client/development primitives and real staged propagation', async () => {
    expect(isServer).toBe(false);
    let set!: (value: number | ((previous: number) => number)) => void;
    let read!: () => number;
    const effects: number[] = [];
    const cleanups: number[] = [];
    const view = await render(() => {
      const [value, setValue] = createSignal(0);
      set = setValue; read = value;
      createEffect(value, (next) => { effects.push(next); return () => { cleanups.push(next); }; });
      return <output>{value()}</output>;
    });
    expect(effects).toEqual([0]);
    set((value) => value + 1); set((value) => value + 1);
    expect(untrack(read)).toBe(0);
    expect(view.getByRole('status').textContent).toBe('0');
    flush();
    expect(view.getByRole('status').textContent).toBe('2');
    expect(effects).toEqual([0, 2]);
    expect(cleanups).toEqual([0]);
    view.unmount();
    expect(cleanups).toEqual([0, 2]);
  });
  it('preserves source getter receivers, raw DOM identity and explicit undefined patches', async () => {
    const raw = document.createElement('div');
    const initial = { prefix: 'first', get label() { return this.prefix; }, raw, title: 'title' as string | undefined };
    let observed: HTMLElement | undefined;
    const view = await renderProps((props) => {
      observed = untrack(() => props.raw);
      return <input aria-label={props.label} title={props.title} />;
    }, initial);
    const input = view.getByRole('textbox');
    expect(observed).toBe(raw);
    input.focus();
    await view.setProps({ title: undefined });
    expect(input).not.toHaveAttribute('title');
    expect(input).toHaveAccessibleName('first');
    expect(view.getByRole('textbox')).toBe(input);
    expect(document.activeElement).toBe(input);
  });
  it('owns setup resources; ref callbacks are ownerless and their returns are ignored', async () => {
    const ignored = vi.fn();
    const disposed = vi.fn();
    let owner: ReturnType<typeof getOwner>;
    let node: HTMLInputElement | undefined;
    let refOwner: ReturnType<typeof getOwner> | undefined;
    const view = await render(() => {
      owner = getOwner();
      onSettled(() => { expect(node?.isConnected).toBe(true); return disposed; });
      return <input ref={(element) => { node = element; refOwner = getOwner(); return ignored; }} />;
    });
    expect(refOwner).toBeNull();
    view.unmount();
    view.unmount();
    expect(disposed).toHaveBeenCalledTimes(1);
    expect(ignored).not.toHaveBeenCalled();
    expect(isDisposed(owner!)).toBe(true);
  });
  it('cleans attached resources on conditional removal and replacement, including detached nodes', async () => {
    const calls = vi.fn();
    const cleanups = vi.fn();
    function OwnedRef() {
      let node!: HTMLButtonElement;
      onSettled(() => {
        node.addEventListener('harness-resource', calls);
        return () => { node.removeEventListener('harness-resource', calls); cleanups(); };
      });
      return <button ref={(element) => { node = element; }}>Owned</button>;
    }
    const view = await renderProps((props: { visible: boolean }) => <>{props.visible && <OwnedRef />}</>, { visible: true });
    const first = view.getByRole('button');
    first.dispatchEvent(new Event('harness-resource'));
    expect(calls).toHaveBeenCalledTimes(1);
    await view.setProps({ visible: false });
    expect(cleanups).toHaveBeenCalledTimes(1);
    first.dispatchEvent(new Event('harness-resource'));
    expect(calls).toHaveBeenCalledTimes(1);
    await view.setProps({ visible: true });
    const second = view.getByRole('button');
    expect(second).not.toBe(first);
    second.dispatchEvent(new Event('harness-resource'));
    expect(calls).toHaveBeenCalledTimes(2);
    view.unmount();
    expect(cleanups).toHaveBeenCalledTimes(2);
    second.dispatchEvent(new Event('harness-resource'));
    expect(calls).toHaveBeenCalledTimes(2);
  });
  it('disposes sibling mounts automatically at the test boundary', async () => {
    await render(() => <div>one</div>);
    await render(() => <div>two</div>);
    expect([...document.body.children].map((child) => child.textContent).join('')).toBe('onetwo');
  });
  it('starts the next case with no rendered nodes', () => expect(document.body.childElementCount).toBe(0));
  it('captures native currentTarget and deterministic pointer timestamps', async () => {
    const received: { currentTarget: EventTarget | null; time: number; pointer: string; x: number }[] = [];
    const view = await render(() => <button onPointerDown={(event) => received.push({ currentTarget: event.currentTarget, time: event.timeStamp, pointer: event.pointerType, x: event.clientX })}>Pointer</button>);
    const node = view.getByRole('button');
    firePointer.down(node, { pointerType: 'pen', timeStamp: 100, clientX: 15 });
    expect(received).toEqual([{ currentTarget: node, time: 100, pointer: 'pen', x: 15 }]);
    expect(() => firePointer.down(node, { timeStamp: 0 })).toThrow('timeStamp');
    expect(() => firePointer.down(node, { timeStamp: Infinity })).toThrow('timeStamp');
  });
  it('awaits per-keystroke input using native onInput', async () => {
    const values: string[] = [];
    const view = await render(() => <input onInput={(event) => values.push(event.currentTarget.value)} />);
    await view.user.type(view.getByRole('textbox'), 'abc');
    expect(values).toEqual(['a', 'ab', 'abc']);
  });
  it('distinguishes microtasks, timeouts and RAF', async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    Promise.resolve().then(() => events.push('microtask'));
    setTimeout(() => events.push('timeout'), 5);
    requestAnimationFrame(() => events.push('frame'));
    await flushMicrotasks();
    expect(events).toEqual(['microtask']);
    await advanceTimers(5);
    expect(events).toEqual(['microtask', 'timeout']);
    await advanceFrame();
    expect(events).toEqual(['microtask', 'timeout', 'frame']);
  });
  it('expects STRICT_READ_UNTRACKED only in this narrowly named diagnostic case', async () => {
    function DiagnosticSnapshot(props: { value: number }) {
      const value = props.value; // Deliberately wrong component-setup read; assert the real diagnostic.
      return <output>{value}</output>;
    }
    await expectDiagnostic({ code: 'STRICT_READ_UNTRACKED', message: /STRICT_READ_UNTRACKED/ }, async () => {
      await renderProps((props: { value: number }) => <DiagnosticSnapshot {...props} />, { value: 1 });
    });
  });
  it('native preventDefault changes dispatch result independently of handler execution', async () => {
    const called = vi.fn();
    const view = await render(() => <button onClick={(event) => { event.preventDefault(); called(event.defaultPrevented); }}>Cancel</button>);
    expect(fireEvent.click(view.getByRole('button'))).toBe(false);
    expect(called).toHaveBeenCalledWith(true);
  });
});
