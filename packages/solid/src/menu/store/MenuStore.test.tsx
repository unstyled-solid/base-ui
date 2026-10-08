import { describe, expect, it } from 'vitest';
import { createEffect, createSignal, flush, untrack } from 'solid-js';
import { createRenderer } from '../../../test';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { createMenuStore, type MenuStore, type MenuTriggerData } from './MenuStore';
import type { MenubarContext } from '../host/MenuHostContexts';

describe('Menu store policy (React MenuRoot/useOpenInteractionType @ 19511bb)', () => {
  it('resets the method in the effective close frame, preserves controlled refusal, and reopens without a stale method', async () => {
    let store!: MenuStore;
    const frames: [boolean, string | null][] = [];
    const view = await createRenderer().renderProps((props: { open: boolean }) => {
      store = createMenuStore({ get open() { return props.open; }, parent: { type: undefined }, rootId: 'root', floatingId: 'popup' });
      createEffect(() => [store.state.open, store.state.openMethod] as [boolean, string | null], frame => { frames.push(frame); });
      return <output>{store.state.openMethod ?? 'none'}</output>;
    }, { open: false });
    store.setOpenMethod('keyboard'); flush();
    await view.setProps({ open: true });
    store.setOpen(false, createChangeEventDetails('escape-key'));
    flush();
    expect(view.getByRole('status')).toHaveTextContent('keyboard');
    frames.length = 0;
    await view.setProps({ open: false });
    expect(frames).toEqual([[false, null]]);
    await view.setProps({ open: true });
    expect(view.getByRole('status')).toHaveTextContent('none');
  });

  it('keeps trigger metadata live through payload re-registration, replacement, stale cleanup and ID migration', async () => {
    let store!: MenuStore<number>;
    let setDelay!: (value: number) => void;
    let data!: MenuTriggerData;
    const metadataFrames: unknown[] = [];
    const view = await createRenderer().render(() => {
      const [delay, writeDelay] = createSignal(10); setDelay = writeDelay;
      store = createMenuStore<number>({ defaultOpen: true, defaultTriggerId: 'one', parent: { type: undefined }, rootId: 'root', floatingId: 'popup' });
      data = { parent: { type: undefined }, tree: store.context.localTree, nodeId: 'node', parentNodeId: null,
        get closeDelay() { return delay(); }, keyboardEventRelay: undefined };
      createEffect(() => [store.state.parent, store.state.floatingNodeId, store.state.floatingTreeRoot], frame => { metadataFrames.push(frame); });
      return <output>{store.state.floatingNodeId}:{store.state.closeDelay}:{store.state.payload}</output>;
    });
    const trigger = document.createElement('button'); trigger.id = 'one';
    const old = store.registerTrigger('one', trigger, 1, data); flush();
    const parent = untrack(() => store.state.parent);
    metadataFrames.length = 0;
    const next = store.registerTrigger('one', trigger, 2, data); old(); flush();
    expect(metadataFrames).toEqual([]);
    expect(untrack(() => store.state.parent)).toBe(parent);
    expect(view.getByRole('status')).toHaveTextContent('node:10:2');
    setDelay(20); flush();
    expect(view.getByRole('status')).toHaveTextContent('node:20:2');
    const replacement = { ...data, nodeId: 'replacement' };
    const removeReplacement = store.registerTrigger('one', trigger, 3, replacement); next(); flush();
    expect(view.getByRole('status')).toHaveTextContent('replacement:20:3');
    removeReplacement();
    store.registerTrigger('two', trigger, 4, data); flush();
    await Promise.resolve(); flush();
    expect(untrack(() => store.state.activeTriggerId)).toBe('two');
    expect(view.getByRole('status')).toHaveTextContent('node:20:4');
  });

  it('derives detached common-host policy and follows the selected trigger host without copying its live metadata', async () => {
    let store!: MenuStore;
    const host = (rootId: string): MenubarContext => ({ rootId, disabled: false, modal: false, orientation: 'horizontal',
      contentElement: null, setContentElement() {}, hasSubmenuOpen: false, setHasSubmenuOpen() {}, allowMouseUpTriggerRef: { current: true } });
    let disabled = () => false;
    const first = { ...host('first-host'), get disabled() { return disabled(); } }, second = host('second-host');
    const view = await createRenderer().renderProps<{ triggerId: string | undefined; disabled: boolean }>((props) => {
      disabled = () => props.disabled;
      store = createMenuStore({ get triggerId() { return props.triggerId; }, parent: { type: undefined }, rootId: 'root', floatingId: 'popup' });
      return <output>{store.state.rootId}:{String(store.state.disabled)}:{store.state.floatingNodeId}</output>;
    }, { triggerId: undefined, disabled: false });
    const one = document.createElement('button'), two = document.createElement('button');
    const relay = () => {};
    const data: MenuTriggerData = { parent: { type: 'menubar', context: first }, tree: store.context.localTree,
      nodeId: 'one-node', parentNodeId: 'one-parent', closeDelay: 10, keyboardEventRelay: relay };
    const removeOne = store.registerTrigger('one', one, undefined, data); flush();
    expect(view.getByRole('status')).toHaveTextContent('first-host:false:');
    await view.setProps({ triggerId: 'one' });
    expect(view.getByRole('status')).toHaveTextContent('first-host:false:one-node');
    expect(untrack(() => store.state.keyboardEventRelay)).toBe(relay);
    expect(untrack(() => store.context.allowMouseUpTriggerRef)).toBe(first.allowMouseUpTriggerRef);
    await view.setProps({ disabled: true });
    expect(view.getByRole('status')).toHaveTextContent('first-host:true:one-node');
    store.registerTrigger('two', two, undefined, { ...data, parent: { type: 'menubar', context: second }, nodeId: 'two-node' }); flush();
    expect(untrack(() => store.state.disabled)).toBe(true);
    await view.setProps({ triggerId: 'two' });
    expect(view.getByRole('status')).toHaveTextContent('second-host:false:two-node');
    expect(untrack(() => store.context.allowMouseUpTriggerRef)).toBe(second.allowMouseUpTriggerRef);
    removeOne(); flush();
    expect(view.getByRole('status')).toHaveTextContent('second-host:false:two-node');
  });

});
