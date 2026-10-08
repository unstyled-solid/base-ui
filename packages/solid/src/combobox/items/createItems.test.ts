import { describe, it, expect, vi } from 'vitest';
import { expectDiagnostic } from '../../../test';
import { createComboboxItems } from './createItems';
import type { ItemCollection } from './itemCollection';
import { defaultItemEquality } from '../../internals/itemEquality';
const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Carol' }];
type User = (typeof users)[number];
const internal = <I, V>(value: unknown) => value as ItemCollection<I, V>;

describe('Combobox.createItems lazy collection (upstream createItems.test.tsx)', () => {
  it.each(['flat', 'grouped'] as const)('does not call the accessors when creating a %s collection', (shape) => {
    const getValue = vi.fn((user: User) => user.id); const getLabel = vi.fn((user: User) => user.name);
    createComboboxItems(shape === 'flat' ? users : [{ items: users }], { getValue, getLabel });
    expect(getValue).not.toHaveBeenCalled(); expect(getLabel).not.toHaveBeenCalled();
  });
  it('only projects leaf items, lazily resolves labels, and retains projection identity', () => {
    const getValue = vi.fn((user: User) => user.id); const getLabel = vi.fn((user: User) => user.name);
    const c = internal<User, number>(createComboboxItems([{ items: users }], { getValue, getLabel }));
    const project = c.value;
    expect(c.label(3, defaultItemEquality)).toBe('Carol');
    expect(getValue.mock.calls.map(([user]) => user)).toEqual(users);
    expect(getLabel.mock.calls.map(([user]) => user)).toEqual([users[2]]);
    expect(c.hasValue(2, defaultItemEquality)).toBe(true);
    expect(getValue).toHaveBeenCalledTimes(3); expect(c.value).toBe(project);
  });
  it('preserves undefined data distinctly from loaded empty data', () => {
    const options = { getValue: (user: User) => user.id, getLabel: (user: User) => user.name };
    expect(internal<User, number>(createComboboxItems(undefined, options)).data).toBeUndefined();
    expect(internal<User, number>(createComboboxItems([], options)).data).toEqual([]);
  });
  it('keeps nullish entries out of accessors', () => {
    const getValue = vi.fn((user: User) => user.id); const getLabel = vi.fn((user: User) => user.name);
    const c = internal<User, number>(createComboboxItems([null, users[1], undefined] as unknown as User[], { getValue, getLabel }));
    expect(c.label(2, defaultItemEquality)).toBe('Bob');
    expect(getValue).toHaveBeenCalledTimes(1); expect(getLabel).toHaveBeenCalledTimes(1);
    expect(c.value(null as unknown as User)).toBeNull();
  });
  it('uses custom comparer lookup and fallback without caching labels', () => {
    let label = 'Bob';
    const c = internal<User, number>(createComboboxItems(users, { getValue: (u) => u.id, getLabel: () => label }));
    const equal = (a: number, b: number) => a % 10 === b % 10;
    expect(c.label(12, equal)).toBe('Bob'); label = 'Robert';
    expect(c.label(12, equal)).toBe('Robert');
    expect(c.label(99, equal, (v) => `missing ${v}`)).toBe('missing 99');
  });
  it('diagnoses duplicate-derived values and always resolves the first label', async () => {
    const c = internal<User, number>(createComboboxItems([users[0], { id: 1, name: 'Clone' }], { getValue: (u) => u.id, getLabel: (u) => u.name }));
    await expectDiagnostic({ message: /Two items passed to createItems\(\) derived the value 1/, count: 1 }, () => {
      expect(c.label(99, defaultItemEquality)).toBe('99');
      expect(c.label(1, defaultItemEquality)).toBe('Alice');
    });
  });
  it.each([0, '', false, 10n] as const)('supports primitive derived value %s', (value) => {
    const c = internal<{ value: typeof value }, typeof value>(createComboboxItems([{ value }], { getValue: (u) => u.value, getLabel: () => 'label' }));
    expect(c.label(value, defaultItemEquality)).toBe('label'); expect(c.hasValue(value, defaultItemEquality)).toBe(true);
  });
});
