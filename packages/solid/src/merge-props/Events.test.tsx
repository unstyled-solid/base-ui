import { describe, it, expect, vi } from 'vitest';
import { $PROXY, createSignal, merge, omit, untrack } from 'solid-js';
import { createRenderer } from '../../test/createRenderer';
import { mergeProps, mergePropsN, isNativeEvent, isDefaultPrevented, makeEventPreventable } from './mergeProps';
import type { BaseUIEvent } from '../internals/types';
import { createChangeEventDetails, createGenericEventDetails } from '../internals/createBaseUIEventDetails';
import { createEnhancedClickHandler } from '../utils/createEnhancedClickHandler';
import { createMixedToggleClickHandler } from '../utils/createMixedToggleClickHandler';
import { dispatchClickWithModifiers } from '../utils/dispatchClickWithModifiers';

const { render, renderProps } = createRenderer();
describe('Events: native source merge semantics', () => {
  it('merges event handlers including disjoint keydown and paste handlers', () => {
    const theirs = { onClick: vi.fn(), onKeyDown: vi.fn() };
    const ours = { onClick: vi.fn(), onPaste: vi.fn() };
    const props = mergeProps<any>(ours, theirs);
    props.onClick(new MouseEvent('click'));
    props.onKeyDown(new KeyboardEvent('keydown'));
    props.onPaste(new Event('paste'));
    expect(theirs.onClick.mock.invocationCallOrder[0]).toBeLessThan(ours.onClick.mock.invocationCallOrder[0]!);
    expect(theirs.onClick).toHaveBeenCalledOnce();
    expect(ours.onClick).toHaveBeenCalledOnce();
    expect(theirs.onKeyDown).toHaveBeenCalledOnce();
    expect(ours.onPaste).toHaveBeenCalledOnce();
  });
  it('merges undefined event handlers between two live handlers', () => {
    const log: string[] = [];
    mergeProps<any>({ onClick: () => log.push('3') }, { onClick: undefined }, { onClick: () => log.push('1') }).onClick(new MouseEvent('click'));
    expect(log).toEqual(['1', '3']);
  });
  it('makes a first-position handler preventable in mergePropsN', () => {
    const props = mergePropsN<any>([{ onMouseDown: (event: BaseUIEvent<Event>) => event.preventBaseUIHandler() }, { id: 'test-button' }]);
    const event = new MouseEvent('mousedown');
    props.onMouseDown(event);
    expect((event as unknown as BaseUIEvent<Event>).baseUIHandlerPrevented).toBe(true);
  });
  it('preserves exact source style, class and ordinary prop precedence edge cases', () => {
    expect(mergeProps<any>({ style: { color: 'blue', backgroundColor: 'blue' } }, { style: { color: 'red' } }).style).toEqual({ color: 'red', backgroundColor: 'blue' });
    expect(mergeProps<any>({}, { style: { color: 'red' } }).style).toEqual({ color: 'red' });
    expect(mergeProps<any>({}, {}).style).toBeUndefined();
    expect(mergeProps<any>({ class: 'internal-class' }, { class: 'external-class' }).class).toBe('external-class internal-class');
    expect(mergeProps<any>({}, { class: 'external-class' }).class).toBe('external-class');
    expect(mergeProps<any>({ title: 'internal title 2' }, { title: 'internal title 1' }, {}).title).toBe('internal title 1');
  });
  it.each(['outer', 'middle'] as const)('prevents remaining handlers after %s prevention', (position) => {
    const log: string[] = [];
    const props = mergeProps<any>(
      { onClick: () => log.push('2') },
      { onClick: (event: BaseUIEvent<Event>) => { if (position === 'middle') event.preventBaseUIHandler(); log.push('1'); } },
      { onClick: (event: BaseUIEvent<Event>) => { if (position === 'outer') event.preventBaseUIHandler(); else log.push('0'); } },
    );
    props.onClick(new MouseEvent('click'));
    expect(log).toEqual(position === 'outer' ? [] : ['0', '1']);
  });
  it('forwards all arguments and order for lone and merged open callbacks and native handlers', () => {
    const handler = vi.fn(), details = { reason: 'test' };
    mergeProps<any>({}, { onOpenChange: handler }).onOpenChange(true, details);
    expect(handler).toHaveBeenCalledWith(true, details);
    const log: unknown[] = [];
    mergeProps<any>({ onOpenChange: (...args: unknown[]) => log.push(['ours', ...args]) }, { onOpenChange: (...args: unknown[]) => log.push(['theirs', ...args]) }).onOpenChange(true, details);
    expect(log).toEqual([['theirs', true, details], ['ours', true, details]]);
    const pointerLog: string[][] = [];
    mergeProps<any>({ onMouseDown: (_event: Event, value: { reason: string }) => pointerLog.push(['ours', value.reason]) }, { onMouseDown: (_event: Event, value: { reason: string }) => pointerLog.push(['theirs', value.reason]) }).onMouseDown(new MouseEvent('mousedown'), { reason: 'pointer' });
    expect(pointerLog).toEqual([['theirs', 'pointer'], ['ours', 'pointer']]);
  });
  it.each(['single', 'merged', 'empty'] as const)('calls a props getter exactly once with the %s preceding props', (mode) => {
    let observed: unknown;
    const getter = vi.fn((props) => { observed = { ...props }; return props; });
    if (mode === 'single') mergeProps<any>({ id: '2', class: 'test-class' }, getter, { id: '1', role: 'button' });
    else if (mode === 'merged') mergeProps<any>({ role: 'button', class: 'test-class' }, { role: 'tab' }, getter, { id: 'one' });
    else mergeProps<any>(getter, { id: '1' });
    expect(getter).toHaveBeenCalledOnce();
    expect(observed).toEqual(mode === 'single' ? { id: '2', class: 'test-class' } : mode === 'merged' ? { role: 'tab', class: 'test-class' } : {});
  });
  it('allows props getter handlers to check baseUIHandlerPrevented manually', () => {
    const log: string[] = [];
    mergeProps<any>({ onClick: () => log.push('first-handler') }, (props) => ({ onClick(event: BaseUIEvent<Event>) {
      event.preventBaseUIHandler(); log.push('getter-handler');
      if (!event.baseUIHandlerPrevented) props.onClick(new MouseEvent('click'));
    } }), { onClick: () => log.push('last-handler') }).onClick(new MouseEvent('click'));
    expect(log).toEqual(['last-handler', 'getter-handler']);
  });
  it.each(['merge', 'omit', 'nested'] as const)('preserves changing keys and shadowing through native %s after enumeration and repeated reads', async (mode) => {
    let update!: (stage: number) => void;
    let custom!: Record<string, any>, native!: Record<string, any>;
    const calls: string[] = [];
    const view = await render(() => {
      const [stage, setStage] = createSignal(0);
      update = setStage;
      const changing = merge(() => stage() === 0 ? {}
        : stage() === 1 ? { 'data-dirty': '', title: 'override' }
        : stage() === 2 ? { title: undefined } : {});
      custom = mergeProps<any>({ title: 'default', class: 'inner', style: { color: 'red' }, onClick: () => calls.push('inner') },
        changing, { class: 'outer', style: { color: 'blue' }, onClick: () => calls.push('outer') });
      native = mode === 'merge' ? merge(custom, { 'data-host': 'yes' })
        : mode === 'omit' ? omit(custom, 'style')
        : merge(omit(merge(custom, { 'data-host': 'yes' }), 'style'), { type: 'button' });
      return <button {...native}>Merged</button>;
    });
    const host = view.getByRole('button');
    untrack(() => {
      expect($PROXY in custom).toBe(true);
      expect(Reflect.get(custom, $PROXY)).toBe(custom);
      expect(Reflect.ownKeys(custom)).not.toContain($PROXY);
      Object.keys(native);
      for (let index = 0; index < 32; index++) expect(native['data-dirty']).toBeUndefined();
    });
    expect(host).toHaveAttribute('title', 'default');
    update(1); await Promise.resolve();
    expect(host).toHaveAttribute('data-dirty', '');
    expect(host).toHaveAttribute('title', 'override');
    update(2); await Promise.resolve();
    expect(host).not.toHaveAttribute('data-dirty');
    expect(host).not.toHaveAttribute('title');
    untrack(() => { expect('title' in native).toBe(true); expect(native.title).toBeUndefined(); });
    update(3); await Promise.resolve();
    expect(host).toHaveAttribute('title', 'default');
    update(1); await Promise.resolve();
    expect(host).toHaveAttribute('data-dirty', '');
    expect(view.getByRole('button')).toBe(host);
    expect(host).toHaveAttribute('class', 'outer inner');
    if (mode === 'merge') expect(host.style.color).toBe('blue');
    else expect(host).not.toHaveAttribute('style');
    await view.user.click(host);
    expect(calls).toEqual(['outer', 'inner']);
  });

  it('enumerates ordinary source bags without recursively walking previous merge layers', () => {
    let membershipReads = 0;
    const sources = Array.from({ length: 16 }, (_, index) => new Proxy({ [`key${index}`]: index }, {
      has(target, key) { membershipReads++; return Reflect.has(target, key); },
    }));
    const merged = mergePropsN<any>(sources);
    expect(Object.keys(merged)).toHaveLength(16);
    // At most one membership walk per descriptor, rather than nested walks
    // through each accumulated view. This gate measures work, not wall time.
    expect(membershipReads).toBeLessThanOrEqual(16 * 16);
    expect(merged.key0).toBe(0);
    expect(merged.key15).toBe(15);
  });
  it('executes right to left and returns the rightmost result', () => {
    const log: number[] = [];
    const props = mergeProps<any>({ onClick: () => { log.push(1); return 1; } }, { onClick: () => { log.push(2); return 2; } }, { onClick: () => { log.push(3); return 3; } });
    expect(props.onClick(new MouseEvent('click'))).toBe(3);
    expect(log).toEqual([3, 2, 1]);
  });
  it.each(['onClick', 'onMouseDown', 'onContextMenu', 'onKeyDown'])('makes first and single %s handlers preventable', (key) => {
    for (const props of [mergeProps<any>({ [key]: (e: BaseUIEvent<Event>) => e.preventBaseUIHandler() }, {}), mergePropsN<any>([undefined, { [key]: (e: BaseUIEvent<Event>) => e.preventBaseUIHandler() }])]) {
      const event = new Event('test'); props[key](event);
      expect((event as BaseUIEvent<Event>).baseUIHandlerPrevented).toBe(true);
    }
  });
  it('handler prevention is independent from native default and details cancellation', () => {
    const inner = vi.fn();
    const event = new MouseEvent('click', { cancelable: true });
    mergeProps<any>({ onClick: inner }, { onClick: (e: Event) => e.preventDefault() }).onClick(event);
    expect(inner).toHaveBeenCalledOnce();
    const details = createChangeEventDetails('trigger-press', event);
    details.cancel(); details.allowPropagation();
    expect(details.isCanceled).toBe(true); expect(details.isPropagationAllowed).toBe(true);
    expect('baseUIHandlerPrevented' in event).toBe(false);
    inner.mockClear();
    mergeProps<any>({ onClick: inner }, { onClick: (e: BaseUIEvent<Event>) => e.preventBaseUIHandler() }).onClick(event);
    expect(inner).not.toHaveBeenCalled();
  });
  it('records noncancelable focus prevention intent without altering native cancellation or Base UI prevention', () => {
    const native = new FocusEvent('focus', { cancelable: false });
    const inner = vi.fn((event: Event) => expect(isDefaultPrevented(event)).toBe(true));
    mergeProps<any>({ onFocus: inner }, { onFocus: (event: Event) => event.preventDefault() }).onFocus(native);
    expect(inner).toHaveBeenCalledOnce();
    expect(native.defaultPrevented).toBe(false);
    expect(makeEventPreventable(native).baseUIHandlerPrevented).toBeUndefined();
    expect(createChangeEventDetails('none', native).isCanceled).toBe(false);
  });
  it('preserves readonly native preventDefault methods and native keyboard cancellation', () => {
    const native = new KeyboardEvent('keydown', { cancelable: true });
    const preventDefault = native.preventDefault.bind(native);
    Object.defineProperty(native, 'preventDefault', { value: preventDefault, writable: false, configurable: false });
    mergeProps<any>({ onKeyDown: (event: Event) => event.preventDefault() }).onKeyDown(native);
    expect(native.preventDefault).toBe(preventDefault);
    expect(native.defaultPrevented).toBe(true); expect(isDefaultPrevented(native)).toBe(true);
  });
  it('accepts the native structural bound-handler declaration and preserves data/currentTarget/prevention', async () => {
    const inner = vi.fn(), seen: unknown[] = [];
    const view = await render(() => {
      const binding = { 0(data: string, event: BaseUIEvent<MouseEvent>) { seen.push(data, event.currentTarget); event.preventBaseUIHandler(); }, 1: 'bound' };
      return <button {...mergeProps<'button'>({ onClick: inner }, { onClick: binding })}>Bound</button>;
    });
    const node = view.getByRole('button'); await view.user.click(node);
    expect(seen).toEqual(['bound', node]); expect(inner).not.toHaveBeenCalled();
  });
  it.each([true, 13, 'value', 'newValue', { key: 'value' }, { type: 'fake', preventDefault() {} }, ['value'], () => 'value'])('value callbacks keep all arguments and are never branded: %s', (value) => {
    const a = vi.fn(), b = vi.fn(); const details = { reason: 'test' };
    mergeProps<any>({ onValueChange: a }, { onValueChange: b }).onValueChange(value, details);
    expect(a).toHaveBeenCalledWith(value, details); expect(b).toHaveBeenCalledWith(value, details);
    expect(b.mock.invocationCallOrder[0]).toBeLessThan(a.mock.invocationCallOrder[0]!);
    if (value && typeof value === 'object') expect('preventBaseUIHandler' in value).toBe(false);
  });
  it('merges undefined handlers but masks ordinary defaults, never merging refs', () => {
    const first = vi.fn(), second = vi.fn();
    const result = mergeProps<any>({ id: 'default', onClick: first, ref: first }, { id: undefined, onClick: undefined, ref: second });
    expect(result.id).toBeUndefined(); expect(result.ref).toBe(second);
    result.onClick(new MouseEvent('click')); expect(first).toHaveBeenCalledOnce();
  });
  it('merges class in reverse order and styles with rightmost keys', () => {
    const result = mergeProps<any>({ class: 'a', style: { color: 'red', margin: '0' } }, { class: 'b', style: { color: 'blue' } }, { class: 'c', style: undefined });
    expect(result.class).toBe('c b a'); expect(result.style).toEqual({ color: 'blue', margin: '0' });
    expect(mergeProps<any>({}, {}).class).toBeUndefined();
    expect(mergeProps<any>({}, { class: ['x', { y: true }] }).class).toEqual(['x', { y: true }]);
  });
  it('getter stages replace props and own manual chaining, without mutating shared results', () => {
    const seen = vi.fn((props) => ({ title: props.id }));
    const shared = { class: 'base' };
    expect({ ...mergeProps<any>({ id: 'one' }, { id: 'two' }, seen) }).toEqual({ title: 'two' });
    expect(seen).toHaveBeenCalledOnce();
    expect(mergeProps<any>(() => shared, { class: 'outer' }).class).toBe('outer base');
    expect({ ...mergeProps<any>(() => shared, { class: 'next' }) }).toEqual({ class: 'next base' });
    expect(shared).toEqual({ class: 'base' });
    expect(shared.class).toBe('base');
    const log: string[] = [];
    mergeProps<any>({ onClick: () => log.push('inner') }, (props) => ({ onClick: (event: BaseUIEvent<Event>) => { event.preventBaseUIHandler(); log.push('getter'); props.onClick(event); } }), { onClick: () => log.push('outer') }).onClick(new Event('click'));
    expect(log).toEqual(['outer', 'getter', 'inner']);
  });
  it('accepts only the exact result of the props getter', () => {
    const result = mergeProps<any>({ id: 'two', role: 'tab' }, { id: 'one' }, () => ({ class: 'test-class' }));
    expect(result).toEqual({ class: 'test-class' });
  });
  it('preserves source getter receivers and updates already-bound callback props', async () => {
    let set!: (value: string) => void; const calls: string[] = [];
    const view = await render(() => {
      const [label, update] = createSignal('before'); set = update;
      const source = { get label() { return label(); }, get title() { return this.label; }, get onClick() { return () => calls.push(this.label); } };
      const merged = mergeProps<'button'>(source, {});
      return <button {...merged}>click</button>;
    });
    const button = view.getByRole('button'); await view.user.click(button);
    set('after'); await Promise.resolve(); await view.user.click(button);
    expect(view.getByRole('button')).toBe(button); expect(calls).toEqual(['before', 'after']); expect(button.title).toBe('after');
  });
  it('brands iframe events without replacing their currentTarget or composedPath', () => {
    const iframe = document.createElement('iframe'); document.body.append(iframe);
    try {
      const win = iframe.contentWindow!; const event = new (win as unknown as { MouseEvent: typeof MouseEvent }).MouseEvent('click');
      expect(isNativeEvent(event)).toBe(true);
      const props = mergeProps<any>({}, { onClick: (e: BaseUIEvent<Event>) => { expect(e).toBe(event); e.preventBaseUIHandler(); } });
      props.onClick(event); expect(event.composedPath()).toEqual([]);
    } finally { iframe.remove(); }
  });
  it('preserves source custom transaction properties and generic detail shape', () => {
    const event = new KeyboardEvent('keydown'); const details = createChangeEventDetails('keyboard', event, undefined, { index: 3 });
    expect(details.event).toBe(event); expect(details.index).toBe(3);
    expect(createGenericEventDetails('keyboard', event)).toEqual({ reason: 'keyboard', event });
  });
  it('enhanced pointer fallback and keyboard clicks invoke the current handler', async () => {
    const calls: string[] = [];
    const view = await renderProps((props: { prefix: string }) => {
      const handlers = createEnhancedClickHandler(() => (_, kind) => calls.push(`${props.prefix}:${kind}`));
      return <button {...handlers}>click</button>;
    }, { prefix: 'a' });
    const button = view.getByRole('button');
    button.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'pen', bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { detail: 1, bubbles: true }));
    await view.setProps({ prefix: 'b' }); button.click();
    expect(calls).toEqual(['a:pen', 'a:pen', 'b:keyboard']);
  });
  it('mixed toggle suppresses the opening press tail and cleans document listeners', async () => {
    const inner = vi.fn();
    const view = await render(() => {
      const mixed = createMixedToggleClickHandler({ mouseDownAction: 'open', open: false });
      return <button {...mergeProps<'button'>({ onClick: inner }, mixed)}>click</button>;
    });
    const button = view.getByRole('button');
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); button.click();
    expect(inner).not.toHaveBeenCalled(); button.click(); expect(inner).toHaveBeenCalledOnce();
  });
  it('modifier dispatch retains native activation and modifier state', async () => {
    const calls: boolean[] = [];
    const view = await render(() => <input type="checkbox" onClick={(e) => calls.push(e.ctrlKey)} />);
    const input = view.getByRole('checkbox') as HTMLInputElement;
    dispatchClickWithModifiers(input, { ctrlKey: true, altKey: false, metaKey: false, shiftKey: false });
    expect(input.checked).toBe(true); expect(calls).toEqual([true]);
  });
});
