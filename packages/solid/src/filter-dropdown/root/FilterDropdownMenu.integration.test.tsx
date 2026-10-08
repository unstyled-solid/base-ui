import { For } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, screen, sourceCase, waitFor } from '../../../test';
import * as Menu from '../../menu/index.parts';

const source = 'packages/react/src/filter-dropdown/root/FilterDropdownRoot.test.tsx';
const { render, renderProps } = createRenderer();
function Popup(props: { children?: JSX.Element }) {
  return <Menu.Portal><Menu.Positioner><Menu.Popup>{props.children}</Menu.Popup></Menu.Positioner></Menu.Portal>;
}
function Results(props: { items: string[]; filter?: null; auto?: boolean | 'always' }) {
  return <Menu.FilterProvider filter={props.filter} autoHighlight={props.auto}><Menu.Root defaultOpen>
    <Menu.Trigger>Actions</Menu.Trigger><Popup><Menu.Input aria-label="Filter actions" /><Menu.List>
      <For each={props.items}>{item => <Menu.Item>{item}</Menu.Item>}</For>
    </Menu.List><Menu.Empty>No matches</Menu.Empty></Popup>
  </Menu.Root></Menu.FilterProvider>;
}

describe('FilterDropdown actual Menu integration', () => {
  for (const filter of [null, undefined] as const) {
    sourceCase({ source, case: filter === null ? 'filter=null clears a stale highlight when the item set changes' : 'clears a stale highlight when items change with an empty query', environment: 'jsdom' }, async () => {
      const view = await renderProps<{ items: string[] }>(props => <Results items={props.items} filter={filter} />, { items: ['A', 'B', 'C'] });
      const input = screen.getByRole('searchbox');
      await waitFor(() => expect(input).toHaveFocus());
      if (filter === null) fireEvent.input(input, { target: { value: 'q' } });
      await view.user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('menuitem', { name: 'C' }).id);
      await view.setProps({ items: filter === null ? ['X', 'Y', 'Z'] : ['C', 'B', 'A'] });
      await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'));
    });
  }
  sourceCase({ source, case: 'filter=null keeps autoHighlight seeding the first item', environment: 'jsdom' }, async () => {
    const view = await renderProps<{ items: string[] }>(props => <Results items={props.items} filter={null} auto />, { items: ['A', 'B'] });
    const input = screen.getByRole('searchbox');
    fireEvent.input(input, { target: { value: 'q' } });
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('menuitem', { name: 'A' }).id));
    await view.setProps({ items: [] });
    await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'));
    expect(screen.getByRole('status')).toHaveTextContent('No matches');
    await view.setProps({ items: ['X', 'Y'] });
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('menuitem', { name: 'X' }).id));
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('controlled rejection keeps committed matches and native input text; cancellation keeps the highlight', async () => {
    const changed = vi.fn((_value: string, details: Menu.FilterProvider.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Menu.FilterProvider value="can" onValueChange={changed}><Menu.Root defaultOpen>
      <Menu.Trigger>Actions</Menu.Trigger><Popup><Menu.Input /><Menu.List><Menu.Item>Canada</Menu.Item><Menu.Item>Mexico</Menu.Item></Menu.List></Popup>
    </Menu.Root></Menu.FilterProvider>);
    const input = screen.getByRole('searchbox');
    await waitFor(() => expect(input).toHaveFocus());
    await view.user.keyboard('{ArrowDown}');
    const canada = screen.getByRole('menuitem', { name: 'Canada' });
    fireEvent.input(input, { target: { value: 'mex' } });
    await waitFor(() => expect(input).toHaveValue('can'));
    expect(changed).toHaveBeenCalledWith('mex', expect.objectContaining({ reason: 'input-change', isCanceled: true }));
    expect(screen.getByRole('menuitem')).toBe(canada);
    expect(input).toHaveAttribute('aria-activedescendant', canada.id);
  });
  it('matching items retain their DOM identity while a nonmatching item is appended', async () => {
    const view = await renderProps<{ items: string[] }>(props => <Results items={props.items} auto />, { items: ['Canada', 'Cambodia'] });
    const input = screen.getByRole('searchbox');
    await view.user.type(input, 'ca');
    const canada = screen.getByRole('menuitem', { name: 'Canada' });
    await view.user.keyboard('{ArrowDown}');
    const highlighted = input.getAttribute('aria-activedescendant');
    await view.setProps({ items: ['Canada', 'Cambodia', 'Mexico'] });
    expect(screen.getByRole('menuitem', { name: 'Canada' })).toBe(canada);
    expect(screen.queryByRole('menuitem', { name: 'Mexico' })).toBeNull();
    expect(input.getAttribute('aria-activedescendant')).toBe(highlighted);
  });
});
