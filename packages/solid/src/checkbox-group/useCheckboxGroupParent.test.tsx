import { createSignal, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, within } from '../../test';
import { createChangeEventDetails } from '../internals/createBaseUIEventDetails';
import { createCheckboxGroupParent, type UseCheckboxGroupParentReturnValue } from './useCheckboxGroupParent';

// Canonical helper cases: packages/react/src/checkbox-group/useCheckboxGroupParent.test.tsx.
// Helper algorithm fixture; paired component and public-wrapper replay stays in the group suites.
describe('useCheckboxGroupParent', () => {
  const { render } = createRenderer();
  async function fixture(initial: readonly string[] = [], all: readonly string[] = ['a', 'b', 'c']) {
    let parent!: UseCheckboxGroupParentReturnValue;
    let cancel = false;
    let notify = vi.fn();
    const proposals: string[][] = [];
    const view = await render(() => {
      const [value, setValue] = createSignal<readonly string[]>(initial);
      parent = createCheckboxGroupParent({
        allValues: all,
        get value() { return value(); },
        onValueChange(next, details) {
          proposals.push(next);
          notify(next, details);
          if (cancel) details.cancel();
          if (!details.isCanceled) setValue(next);
        },
      });
      const parentProps = parent.getParentProps();
      return <>
        <button aria-checked={parentProps.indeterminate ? 'mixed' : parentProps.checked ? 'true' : 'false'} aria-controls={parentProps['aria-controls']}
          onClick={(event) => parentProps.onCheckedChange(!parentProps.checked, createChangeEventDetails('none', event))}>parent</button>
        {all.map((item) => {
          const child = parent.getChildProps(item);
          return <button data-testid={`child-${item}`} aria-checked={child.checked ? 'true' : 'false'}
            onClick={(event) => child.onCheckedChange(!child.checked, createChangeEventDetails('none', event))}>{item || 'empty'}</button>;
        })}
        <output>{value().join(',')}</output>
      </>;
    });
    const queries = within(view.container);
    return { view, parent, proposals, veto: (next: boolean) => { cancel = next; }, replaceCallback: (next: typeof notify) => { notify = next; },
      parentButton: queries.getByText('parent'), child: (v: string) => queries.getByTestId(`child-${v}`) };
  }
  it('controls all children without mutating the defaults', async () => {
    const initial = Object.freeze([] as string[]);
    const f = await fixture(initial);
    await f.view.user.click(f.parentButton);
    expect(f.proposals).toEqual([['a', 'b', 'c']]);
    for (const v of ['a', 'b', 'c']) expect(f.child(v)).toHaveAttribute('aria-checked', 'true');
    await f.view.user.click(f.parentButton);
    expect(f.proposals[1]).toEqual([]);
    expect(initial).toEqual([]);
  });
  it('initializes mixed selection and updates children once per request', async () => {
    const f = await fixture(['a']);
    expect(f.parentButton).toHaveAttribute('aria-checked', 'mixed');
    await f.view.user.click(f.child('b'));
    await f.view.user.click(f.child('c'));
    expect(f.proposals).toEqual([['a', 'b'], ['a', 'b', 'c']]);
    expect(f.parentButton).toHaveAttribute('aria-checked', 'true');
  });
  it('restores the partial snapshot after mixed -> all -> none -> mixed', async () => {
    const f = await fixture();
    await f.view.user.click(f.child('a'));
    for (let n = 0; n < 3; n += 1) await f.view.user.click(f.parentButton);
    expect(f.proposals).toEqual([['a'], ['a', 'b', 'c'], [], ['a']]);
    expect(f.parentButton).toHaveAttribute('aria-checked', 'mixed');
  });
  it('restores the accepted child array itself, including callback edits during restore', async () => {
    const f = await fixture();
    await f.view.user.click(f.child('a'));
    const accepted = f.proposals[0];
    f.replaceCallback(vi.fn((next: string[]) => {
      if (next === accepted && next.length === 1) next.push('b');
    }));
    for (let n = 0; n < 3; n += 1) await f.view.user.click(f.parentButton);
    expect(f.proposals[3]).toBe(accepted);
    expect(f.proposals[3]).toEqual(['a', 'b']);
    for (let n = 0; n < 3; n += 1) await f.view.user.click(f.parentButton);
    expect(f.proposals[6]).toBe(accepted);
    expect(f.proposals[6]).toEqual(['a', 'b']);
  });
  it('does not advance the parent cycle when a group vetoes', async () => {
    const f = await fixture(['a']);
    f.veto(true);
    await f.view.user.click(f.parentButton);
    await f.view.user.click(f.parentButton);
    expect(f.proposals).toEqual([['a', 'b', 'c'], ['a', 'b', 'c']]);
    f.veto(false);
    await f.view.user.click(f.parentButton);
    expect(f.parentButton).toHaveAttribute('aria-checked', 'true');
  });
  it('does not pollute the restore snapshot when a group vetoes a child', async () => {
    const f = await fixture(['a', 'b', 'c']);
    f.veto(true);
    await f.view.user.click(f.child('a'));
    await f.view.user.click(f.parentButton);
    expect(f.proposals).toEqual([['b', 'c'], []]);
  });
  it.each([false, true])('preserves disabled child state (initially checked=%s)', async (checked) => {
    const f = await fixture(checked ? ['a'] : []);
    const unregister = f.parent.registerDisabled('a', true);
    await f.view.user.click(f.parentButton);
    expect(f.proposals[0]).toEqual(checked ? ['a', 'b', 'c'] : ['b', 'c']);
    await f.view.user.click(f.parentButton);
    expect(f.proposals[1]).toEqual(checked ? ['a'] : []);
    unregister();
  });
  it('retains surviving duplicate disabled registrations', async () => {
    const f = await fixture();
    const first = f.parent.registerDisabled('a', true);
    const second = f.parent.registerDisabled('a', true);
    second(); second();
    await f.view.user.click(f.parentButton);
    expect(f.proposals[0]).toEqual(['b', 'c']);
    first();
  });
  it('supports empty-string and prototype-name values', async () => {
    const f = await fixture([], ['', 'constructor']);
    await f.view.user.click(f.child(''));
    expect(f.proposals[0]).toEqual(['']);
    await f.view.user.click(f.parentButton);
    expect(f.proposals[1]).toEqual(['', 'constructor']);
  });
  it('orders mounted child IDs by allValues and preserves duplicate survivors', async () => {
    const f = await fixture();
    const unregisterB = f.parent.registerChildId('b', 'b-first');
    const unregisterA = f.parent.registerChildId('a', 'custom-a');
    const unregisterB2 = f.parent.registerChildId('b', 'b-second');
    expect(untrack(() => f.parent.getParentProps()['aria-controls'])).toBe('custom-a b-first b-second');
    unregisterB2(); unregisterB2();
    expect(untrack(() => f.parent.getParentProps()['aria-controls'])).toBe('custom-a b-first');
    unregisterA(); unregisterB();
    expect(untrack(() => f.parent.getParentProps()['aria-controls'])).toBeUndefined();
  });
  it('does not read IDs off Object.prototype', async () => {
    const f = await fixture([], ['a', 'constructor']);
    const unregister = f.parent.registerChildId('a', 'a-id');
    expect(untrack(() => f.parent.getParentProps()['aria-controls'])).toBe('a-id');
    unregister();
  });
  it('same-ID registrations have independent cleanup tokens', async () => {
    const f = await fixture();
    const first = f.parent.registerChildId('a', 'same');
    const second = f.parent.registerChildId('a', 'same');
    first();
    expect(untrack(() => f.parent.getParentProps()['aria-controls'])).toBe('same');
    second();
  });
  it('keeps omitted defaults isolated between independent groups', async () => {
    const a = await fixture();
    const b = await fixture();
    await a.view.user.click(a.child('a'));
    expect(b.parentButton).toHaveAttribute('aria-checked', 'false');
    await b.view.user.click(b.parentButton);
    expect(a.parentButton).toHaveAttribute('aria-checked', 'mixed');
  });
  it('reads current callbacks rather than capturing an old callback', async () => {
    const f = await fixture();
    const current = vi.fn();
    f.replaceCallback(current);
    await f.view.user.click(f.parentButton);
    expect(current).toHaveBeenCalledTimes(1);
  });
  it('resets the restore cycle explicitly', async () => {
    const f = await fixture(['a']);
    await f.view.user.click(f.parentButton);
    f.parent.reset([]);
    await f.view.user.click(f.parentButton);
    expect(f.proposals[1]).toEqual([]);
    await f.view.user.click(f.parentButton);
    expect(f.proposals[2]).toEqual(['a', 'b', 'c']);
  });
});
