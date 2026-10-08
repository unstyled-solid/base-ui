import { createRoot, flush, getOwner, runWithOwner } from 'solid-js';
import { describe, it, expect, vi } from 'vitest';
import { createRenderer } from '../../test/createRenderer';
import { createMergedRefs, createMergedRefsN, type InputRef, type MergedRef } from './createMergedRefs';
import { resolveRef } from './resolveRef';

describe('Lifecycle merged refs', () => {
  const { renderProps } = createRenderer();
  it('forks nested native arrays; replaces and disposes raw attachments exactly once without a renderer null', () => {
    const a = document.createElement('div'); const b = document.createElement('div');
    const cell = { current: null as HTMLDivElement | null };
    const ignoredReturn = vi.fn();
    const ref = vi.fn((_node: HTMLDivElement | null) => { expect(getOwner()).toBe(null); return ignoredReturn; });
    let merged!: MergedRef<HTMLDivElement>;
    const dispose = createRoot((dispose) => { merged = createMergedRefs<HTMLDivElement>([ref], cell); return dispose; });
    runWithOwner(null, () => { merged(a); merged(a); });
    expect(merged.current).toBe(a); expect(cell.current).toBe(a);
    flush(); expect(ref).toHaveBeenCalledTimes(1);
    runWithOwner(null, () => merged(b));
    expect(ref.mock.calls.map(([node]) => node)).toEqual([a, null, b]);
    dispose(); dispose();
    expect(ref.mock.calls.map(([node]) => node)).toEqual([a, null, b, null]);
    expect(cell.current).toBe(null); expect(merged.current).toBe(null);
    expect(ignoredReturn).not.toHaveBeenCalled();
    merged(a); expect(cell.current).toBe(null);
  });
  it('adds, changes and removes live refs while retaining the same host', async () => {
    const a = vi.fn(); const b = vi.fn();
    const view = await renderProps<{ refs: InputRef<HTMLDivElement>[] }>((props) => {
      const merged = createMergedRefsN(() => props.refs);
      return <div ref={merged} data-testid="host" />;
    }, { refs: [] });
    const node = view.getByTestId('host');
    await view.setProps({ refs: [a] }); expect(a).toHaveBeenLastCalledWith(node);
    await view.setProps({ refs: [b] }); expect(a).toHaveBeenLastCalledWith(null); expect(b).toHaveBeenLastCalledWith(node);
    await view.setProps({ refs: [] }); expect(b).toHaveBeenLastCalledWith(null);
    expect(view.getByTestId('host')).toBe(node);
    view.unmount(); expect(a).toHaveBeenCalledTimes(2); expect(b).toHaveBeenCalledTimes(2);
  });
  it('resolves live accessors, direct nodes, null, undefined and internal cells', () => {
    const node = document.createElement('input'); const cell = { current: null as HTMLInputElement | null };
    expect(resolveRef(() => cell.current)).toBe(null);
    cell.current = node;
    expect(resolveRef(() => cell.current)).toBe(node); expect(resolveRef(cell)).toBe(node);
    expect(resolveRef(node)).toBe(node); expect(resolveRef(null)).toBe(null); expect(resolveRef(undefined)).toBe(undefined);
  });
  it('delivers live consumer ref replacement and cleanup untracked and ownerless', async () => {
    const calls: string[] = [];
    const view = await renderProps((props: { label: string; alternate: boolean }) => {
      const first = (node: HTMLElement | null) => { expect(getOwner()).toBe(null); calls.push(`${props.label}:${node ? 'attach' : 'detach'}:first`); };
      const second = (node: HTMLElement | null) => { expect(getOwner()).toBe(null); calls.push(`${props.label}:${node ? 'attach' : 'detach'}:second`); };
      const merged = createMergedRefsN<HTMLElement>(() => [props.alternate ? second : first]);
      return <div ref={merged} />;
    }, { label: 'before', alternate: false });
    await view.setProps({ label: 'after', alternate: true });
    view.unmount();
    expect(calls).toEqual(['before:attach:first', 'after:detach:first', 'after:attach:second', 'after:detach:second']);
  });
});
