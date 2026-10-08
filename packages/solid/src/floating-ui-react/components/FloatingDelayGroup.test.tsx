import { describe, expect, it, vi } from 'vitest';
import { createEffect, createSignal, untrack, type Accessor } from 'solid-js';
import { createRenderer, advanceTimers } from '../../../test';
import { createFloatingRoot } from './createFloatingRoot';
import { FloatingDelayGroup, createDelayGroup } from './FloatingDelayGroup';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { settle } from '../../tooltip/Tooltip.test-utils';

// Behavioral source: pinned React FloatingDelayGroup.test.tsx (group delays,
// timeoutMs, unrelated consumers, inactive and last-closed consumer disposal).
interface Control {
  open: Accessor<boolean>;
  request(value: boolean): void;
  group: ReturnType<typeof createDelayGroup>;
  frames: { open: boolean; instant: boolean }[];
  changes: { open: boolean; reason: string }[];
  phaseRuns: number;
}
function Member(props: { id: string; controls: Record<string, Control> }) {
  const [open, setOpen] = createSignal(false);
  const changes: Control['changes'] = [];
  const root = createFloatingRoot({
    state: { get open() { return open(); }, floatingId: props.id, transitionStatus: undefined,
      domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null },
    onOpenChange(value, details) { changes.push({ open: value, reason: details.reason }); setOpen(value); },
  });
  const group = createDelayGroup(root, { open });
  const control: Control = { open, group, frames: [], changes, phaseRuns: 0,
    request: value => root.setOpen(value, createChangeEventDetails('trigger-hover')) };
  props.controls[props.id] = control;
  createEffect(() => ({ open: open(), instant: group.isInstantPhase }), value => { control.frames.push(value); });
  createEffect(() => group.isInstantPhase, () => { control.phaseRuns++; });
  return <span data-testid={props.id}>{String(group.isInstantPhase)}</span>;
}

describe('FloatingDelayGroup source-grounded derivation', () => {
  const render = (controls: Record<string, Control>, timeoutMs = 100) => createRenderer().renderProps(
    (props: { first: boolean; second: boolean; closeDelay: number }) => <FloatingDelayGroup delay={{ open: 1000, close: props.closeDelay }} timeoutMs={timeoutMs}>
      {props.first && <Member id="one" controls={controls} />}
      {props.second && <Member id="two" controls={controls} />}
      <Member id="three" controls={controls} />
    </FloatingDelayGroup>, { first: true, second: true, closeDelay: 100 });

  it('derives sibling instant entry and normal close in the same frames as open, without notifying unrelated consumers', async () => {
    vi.useFakeTimers();
    const controls: Record<string, Control> = {};
    const view = await render(controls);
    const one = controls.one!, two = controls.two!, three = controls.three!;
    const unrelatedRuns = three.phaseRuns;
    one.request(true); await settle();
    expect(one.frames.at(-1)).toEqual({ open: true, instant: false });
    two.frames.length = 0;
    two.request(true); await settle();
    expect(two.frames).toEqual([{ open: true, instant: true }]);
    expect(one.changes.at(-1)).toEqual({ open: false, reason: 'none' });
    expect(one.frames.at(-1)).toEqual({ open: false, instant: true });
    two.frames.length = 0;
    two.request(false); await settle();
    expect(two.frames).toEqual([{ open: false, instant: false }]);
    expect(untrack(() => two.group.activeIdRef.current)).toBe('two');
    await advanceTimers(100);
    expect(untrack(() => two.group.activeIdRef.current)).toBeNull();
    expect(untrack(() => two.group.delayRef.current)).toEqual({ open: 1000, close: 100 });
    expect(three.phaseRuns).toBe(unrelatedRuns);
    view.unmount(); await advanceTimers(0);
  });

  it('cancels timeout reset on reentry or takeover, updates close delay live and restores initial delay after expiry', async () => {
    vi.useFakeTimers();
    const controls: Record<string, Control> = {};
    const view = await render(controls);
    const one = controls.one!, two = controls.two!;
    one.request(true); await settle();
    await view.setProps({ closeDelay: 250 });
    expect(untrack(() => one.group.delayRef.current)).toEqual({ open: 0, close: 250 });
    one.request(false); await settle(); await advanceTimers(99);
    one.request(true); await settle(); await advanceTimers(1);
    expect(untrack(() => one.group.activeIdRef.current)).toBe('one');
    expect(untrack(() => one.group.isInstantPhase)).toBe(false);
    one.request(false); await settle(); await advanceTimers(99);
    two.request(true); await settle(); await advanceTimers(1);
    expect(untrack(() => two.group.activeIdRef.current)).toBe('two');
    expect(untrack(() => two.group.isInstantPhase)).toBe(true);
    two.request(false); await settle(); await advanceTimers(100);
    expect(untrack(() => two.group.delayRef.current)).toEqual({ open: 1000, close: 250 });
    view.unmount(); await advanceTimers(0);
  });

  it('keeps the active context on inactive disposal and the reset timer on last-closed disposal', async () => {
    vi.useFakeTimers();
    const controls: Record<string, Control> = {};
    const view = await render(controls);
    const one = controls.one!, three = controls.three!;
    one.request(true); await settle();
    await view.setProps({ second: false });
    expect(untrack(() => three.group.activeIdRef.current)).toBe('one');
    one.request(false); await settle(); await advanceTimers(50);
    await view.setProps({ first: false });
    expect(untrack(() => three.group.activeIdRef.current)).toBe('one');
    await advanceTimers(49);
    expect(untrack(() => three.group.delayRef.current)).toEqual({ open: 0, close: 100 });
    await advanceTimers(1);
    expect(untrack(() => three.group.activeIdRef.current)).toBeNull();
    expect(untrack(() => three.group.delayRef.current)).toEqual({ open: 1000, close: 100 });
    view.unmount(); await advanceTimers(0);
  });

  it('resets immediately on an accepted close with timeoutMs=0 and on open active disposal', async () => {
    vi.useFakeTimers();
    const controls: Record<string, Control> = {};
    const view = await render(controls, 0);
    const one = controls.one!, three = controls.three!;
    one.request(true); await settle(); one.request(false); await settle();
    expect(untrack(() => three.group.activeIdRef.current)).toBeNull();
    one.request(true); await settle();
    await view.setProps({ first: false });
    expect(untrack(() => three.group.activeIdRef.current)).toBeNull();
    expect(untrack(() => three.group.delayRef.current)).toEqual({ open: 1000, close: 100 });
    view.unmount(); await advanceTimers(0);
  });

  it('does not expire a trigger-owned window while its floating root is still open', async () => {
    vi.useFakeTimers();
    let setRootOpen!: (open: boolean) => void, setTriggerOpen!: (open: boolean) => void;
    let group!: ReturnType<typeof createDelayGroup>;
    function Consumer() {
      const [rootOpen, writeRoot] = createSignal(false), [triggerOpen, writeTrigger] = createSignal(false);
      setRootOpen = writeRoot; setTriggerOpen = writeTrigger;
      const root = createFloatingRoot({ state: { get open() { return rootOpen(); }, floatingId: 'shared', transitionStatus: undefined,
        domReferenceElement: null, referenceElement: null, positionReference: null, floatingElement: null } });
      group = createDelayGroup(root, { open: triggerOpen });
      return <span>{String(group.isInstantPhase)}</span>;
    }
    const view = await createRenderer().render(() => <FloatingDelayGroup delay={1000} timeoutMs={100}><Consumer /></FloatingDelayGroup>);
    setRootOpen(true); setTriggerOpen(true); await settle();
    setTriggerOpen(false); await settle(); await advanceTimers(100);
    expect(untrack(() => group.activeIdRef.current)).toBe('shared');
    expect(untrack(() => group.delayRef.current)).toEqual({ open: 0, close: 1000 });
    view.unmount(); await advanceTimers(0);
  });
});
