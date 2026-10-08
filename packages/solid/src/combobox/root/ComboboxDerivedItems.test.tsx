import { describe, it, expect, vi } from 'vitest';
import { createRenderer } from '../../../test';
import { createDerivedItems, type DerivedItemsOptions } from './createDerivedItems';
import { createComboboxItems } from '../items/createItems';
const users = [{ id: 1, name: 'Alice', role: 'engineer' }, { id: 2, name: 'Bob', role: 'designer' }, { id: 3, name: 'Carol', role: 'designer' }];
type User = (typeof users)[number];
const items = createComboboxItems(users, { getValue: (user) => user.id, getLabel: (user) => user.name });
describe('Combobox derived source/value domains', () => {
  const { renderProps, render } = createRenderer();
  const initial: DerivedItemsOptions<User, number> = { items, query: '', selectionMode: 'single', selectedValue: null, queryChanged: true };
  function Probe(props: DerivedItemsOptions<User, number>) {
    const derived = createDerivedItems(props);
    return <><output data-testid="items">{JSON.stringify(derived.filteredItems)}</output><output data-testid="values">{JSON.stringify(derived.flatFilteredValues)}</output><output data-testid="label">{derived.label(props.selectedValue as number)}</output><output data-testid="has">{String(derived.hasItems)}</output></>;
  }
  it('filters by collection labels and projects selection values', async () => {
    const view = await renderProps(Probe, initial);
    await view.setProps({ query: 'bo' });
    expect(view.getByTestId('items').textContent).toBe(JSON.stringify([users[1]]));
    expect(view.getByTestId('values').textContent).toBe('[2]');
  });
  for (const policy of ['custom', 'null'] as const) {
    it(`defers ${policy} query reads until construction finishes and retains live selected-label bypass`, async () => {
      const source = [{ label: 'I' }, { label: 'other' }];
      const filter = vi.fn((item: (typeof source)[number], query: string, label?: (item: (typeof source)[number]) => string) => label?.(item) === query);
      const view = await renderProps((props: { query: string; locale: string; label: string }) => {
        let initialized = false;
        const derived = createDerivedItems({
          items: source, selectedValue: source[0], selectionMode: 'single', queryChanged: false,
          filter: policy === 'custom' ? filter : null,
          get query() {
            if (!initialized) throw new Error('query read before root initialization');
            return props.query;
          },
          get locale() { return props.locale; },
          itemToStringLabel: item => item === source[0] ? props.label : item.label,
        });
        initialized = true;
        return <output>{`${derived.filteredItems === source}:${derived.filteredItems.map(item => item === source[0] ? props.label : item.label).join(',')}`}</output>;
      }, { query: 'i', locale: 'en', label: 'I' });
      expect(view.getByText('true:I,other')).toBeInTheDocument();
      expect(filter).not.toHaveBeenCalled();
      await view.setProps({ locale: 'tr' });
      expect(view.getByText(policy === 'custom' ? 'false:' : 'true:I,other')).toBeInTheDocument();
      if (policy === 'custom') expect(filter).toHaveBeenCalledWith(source[0], 'i', expect.any(Function));
      await view.setProps({ label: 'i' });
      expect(view.getByText('true:i,other')).toBeInTheDocument();
      filter.mockClear();
      await view.setProps({ query: 'other' });
      expect(view.getByText(policy === 'custom' ? 'false:other' : 'true:i,other')).toBeInTheDocument();
      if (policy === 'custom') expect(filter).toHaveBeenCalledWith(source[1], 'other', expect.any(Function));
      else expect(filter).not.toHaveBeenCalled();
      await view.setProps({ query: 'i', locale: 'en' });
      expect(view.getByText('true:i,other')).toBeInTheDocument();
    });
  }
  it('passes source fields to custom filtering and short-circuits at the limit', async () => {
    const filter = vi.fn((user: User) => user.role === 'designer');
    const view = await renderProps(Probe, { ...initial, query: 'x', filter, limit: 1 });
    expect(view.getByTestId('values').textContent).toBe('[2]');
    expect(filter.mock.calls.map(([user]) => user)).toEqual([users[0], users[1]]);
  });
  it('limits across groups and drops empty groups', async () => {
    const groups = [{ name: 'A', items: [users[0]] }, { name: 'B', items: users.slice(1) }];
    const grouped = createComboboxItems(groups, { getValue: (u: User) => u.id, getLabel: (u) => u.name });
    const view = await renderProps(Probe, { ...initial, items: grouped, query: 'o', limit: 1 });
    expect(view.getByTestId('items').textContent).toBe(JSON.stringify([{ name: 'B', items: [users[1]] }]));
    expect(view.getByTestId('values').textContent).toBe('[2]');
  });
  it('treats undefined data as absent and renders external results', async () => {
    const pending = createComboboxItems(undefined as User[] | undefined, { getValue: (u) => u.id, getLabel: (u) => u.name });
    const view = await renderProps(Probe, { ...initial, items: pending, filteredItems: [users[1]], selectedValue: 2 });
    expect(view.getByTestId('has').textContent).toBe('false'); expect(view.getByTestId('values').textContent).toBe('[2]');
    expect(view.getByTestId('label').textContent).toBe('Bob');
    await view.setProps({ items }); expect(view.getByTestId('has').textContent).toBe('true');
  });
  it('isolates shared collections and degrades stale windows to raw IDs', async () => {
    const shared = createComboboxItems([] as User[], { getValue: (u) => u.id, getLabel: (u) => u.name });
    const view = await renderProps((props: { results: User[] }) => <div><section data-testid="a"><Probe {...initial} items={shared} filteredItems={props.results} selectedValue={1} /></section><section data-testid="b"><Probe {...initial} items={shared} filteredItems={[{ ...users[0], name: 'Alicia' }]} selectedValue={1} /></section></div>, { results: [users[0]] });
    expect(view.getByTestId('a').querySelector('[data-testid="label"]')?.textContent).toBe('Alice');
    await view.setProps({ results: [] });
    expect(view.getByTestId('a').querySelector('[data-testid="label"]')?.textContent).toBe('1');
    expect(view.getByTestId('b').querySelector('[data-testid="label"]')?.textContent).toBe('Alicia');
  });
  it('relabels an unchanged selection from fresh metadata and prefers owned data', async () => {
    const external = createComboboxItems([] as User[], { getValue: (u) => u.id, getLabel: (u) => u.name });
    const view = await renderProps(Probe, { ...initial, items: external, filteredItems: [users[0]], selectedValue: 1 });
    await view.setProps({ filteredItems: [{ ...users[0], name: 'Anna' }] });
    expect(view.getByTestId('label').textContent).toBe('Anna');
    await view.setProps({ items }); expect(view.getByTestId('label').textContent).toBe('Alice');
  });
  it('preserves full selection-label query browsing but respects unresolved external selections', async () => {
    const view = await renderProps<DerivedItemsOptions<User, number>>(Probe, { ...initial, query: 'Bob', selectedValue: 2, queryChanged: false, filteredItems: [] });
    expect(view.getByTestId('values').textContent).toBe('[1,2,3]');
    await view.setProps({ selectedValue: 99, itemToStringLabel: () => 'Bob', filteredItems: [users[2]] });
    expect(view.getByTestId('values').textContent).toBe('[3]');
  });
  it('filter=null retains source items and getLabel beats root fallback', async () => {
    const view = await renderProps(Probe, { ...initial, query: 'unmatched', filter: null, selectedValue: 2, itemToStringLabel: () => 'fallback' });
    expect(view.getByTestId('values').textContent).toBe('[1,2,3]'); expect(view.getByTestId('label').textContent).toBe('Bob');
  });
  it('reads default filter setup once per query scan, while labels remain live', async () => {
    const data = Array.from({ length: 200 }, (_, id) => ({ id, name: `Entry ${id}` }));
    let policyReads = 0;
    let localeReads = 0;
    const labels = vi.fn((user: (typeof data)[number]) => user.name);
    const view = await renderProps((props: { query: string }) => {
      const derived = createDerivedItems<(typeof data)[number], (typeof data)[number]>({
        items: data, selectionMode: 'none', selectedValue: null, queryChanged: true,
        get query() { return props.query; },
        get filter() { policyReads++; return undefined; },
        get locale() { localeReads++; return 'en'; },
        itemToStringLabel: labels,
      });
      return <output>{derived.flatFilteredValues.length}</output>;
    }, { query: 'Entry' });
    expect(policyReads).toBe(1);
    expect(localeReads).toBe(1);
    expect(labels).toHaveBeenCalledTimes(200);
    await view.setProps({ query: 'missing' });
    expect(policyReads).toBe(1);
    expect(localeReads).toBe(1);
    expect(labels).toHaveBeenCalledTimes(400);
    expect(view.getByText('0')).toBeInTheDocument();
  });
  it('shares locale setup across queries and bypass while preserving source identity', async () => {
    const source = ['Résumé', 'apple', 'banana'];
    const locale = new Intl.Locale('en-CA');
    const nextLocale = new Intl.Locale('fr-CA');
    const setup = vi.spyOn(locale, 'toString');
    const nextSetup = vi.spyOn(nextLocale, 'toString');
    let derived!: ReturnType<typeof createDerivedItems<string, string>>;
    const view = await renderProps((props: { query: string; locale: Intl.Locale; changed: boolean }) => {
      derived = createDerivedItems<string, string>({
        items: source, selectionMode: 'single', selectedValue: 'apple',
        get query() { return props.query; },
        get queryChanged() { return props.changed; },
        get locale() { return props.locale; },
      });
      return <output>{derived.filteredItems.join(',')}</output>;
    }, { query: '', locale, changed: false });
    expect(derived.filteredItems).toBe(source);
    const initialSetupCalls = setup.mock.calls.length;
    expect(initialSetupCalls).toBeGreaterThan(0);
    await view.setProps({ query: 'apple' });
    expect(derived.filteredItems).toBe(source);
    expect(setup).toHaveBeenCalledTimes(initialSetupCalls);
    await view.setProps({ query: 'resume', changed: true });
    expect(view.getByText('Résumé')).toBeInTheDocument();
    expect(setup).toHaveBeenCalledTimes(initialSetupCalls);
    await view.setProps({ locale: nextLocale });
    expect(view.getByText('Résumé')).toBeInTheDocument();
    expect(nextSetup).toHaveBeenCalled();
    setup.mockRestore();
    nextSetup.mockRestore();
  });
  it('keeps sparse custom-filter visits, group order and early limit semantics', async () => {
    const sparse = ['a', , 'b'] as string[];
    const visits = vi.fn(() => true);
    const view = await renderProps((props: { filter?: typeof visits; limit: number }) => {
      const derived = createDerivedItems<string, string>({
        items: [{ name: 'first', items: sparse }, { name: 'second', items: ['c'] }],
        query: 'x', queryChanged: true, selectionMode: 'none', selectedValue: null,
        get filter() { return props.filter; }, get limit() { return props.limit; },
      });
      return <output>{JSON.stringify(derived.filteredItems)}</output>;
    }, { filter: visits, limit: 2 });
    expect(visits.mock.calls).toHaveLength(2);
    expect(view.getByText('[{"name":"first","items":["a",null]}]')).toBeInTheDocument();
    await view.setProps({ filter: undefined, limit: -1 });
    expect(view.getByText('[]')).toBeInTheDocument();
  });
  it('does not rescan live labels when the effective query is unchanged', async () => {
    const source = Array.from({ length: 10000 }, (_, id) => ({ id, name: `Item ${id}` }));
    const labels = vi.fn((item: (typeof source)[number]) => item.name);
    const view = await renderProps((props: { query: string }) => {
      const derived = createDerivedItems({
        items: source, selectionMode: 'none', selectedValue: null, queryChanged: true,
        get query() { return props.query.trim(); }, itemToStringLabel: labels,
      });
      return <output>{derived.filteredItems.length}</output>;
    }, { query: '999' });
    expect(labels).toHaveBeenCalledTimes(10000);
    await view.setProps({ query: '999 ' });
    expect(labels).toHaveBeenCalledTimes(10000);
    source[0].name = 'Item 999';
    await view.setProps({ query: '99' });
    expect(labels).toHaveBeenCalledTimes(20000);
  });
  it('visits sparse flat custom inputs and stops at the accepted-item limit', async () => {
    const source = ['a', , 'b', 'c'] as string[];
    const visits = vi.fn(() => true);
    const view = await renderProps((props: { limit: number }) => {
      const derived = createDerivedItems<string, string>({
        items: source, query: 'x', selectionMode: 'none', selectedValue: null,
        queryChanged: true, filter: visits, get limit() { return props.limit; },
      });
      return <output>{JSON.stringify(derived.filteredItems)}</output>;
    }, { limit: -1 });
    expect(visits.mock.calls).toHaveLength(4);
    expect(view.getByText('["a",null,"b","c"]')).toBeInTheDocument();
    visits.mockClear();
    await view.setProps({ limit: 2 });
    expect(visits.mock.calls).toHaveLength(2);
    expect(view.getByText('["a",null]')).toBeInTheDocument();
  });
});
