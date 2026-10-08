import { describe, expect, it } from 'vitest';
import { attribution } from 'solid-js/attribution';
import { createRenderer } from '../../../test';
import { Autocomplete } from '../../autocomplete';
import { Combobox } from '../index';

describe('Collection row ownership', () => {
  const { render, renderProps } = createRenderer();
  it('renders all source collection items in an initially empty query', async () => {
    const view = await render(() => <Combobox.Root items={['alpha', 'beta', 'alpine']} defaultOpen>
      <Combobox.Input /><Combobox.Portal><Combobox.Positioner><Combobox.Popup><Combobox.List>
        <Combobox.Collection>{(item: string) => <Combobox.Item value={item} data-testid={`item-${item}`}>{item}</Combobox.Item>}</Combobox.Collection>
      </Combobox.List></Combobox.Popup></Combobox.Positioner></Combobox.Portal>
    </Combobox.Root>);
    expect(view.getByTestId('item-alpha')).toBeInTheDocument();
    expect(view.getByTestId('item-beta')).toBeInTheDocument();
    expect(view.getByTestId('item-alpine')).toBeInTheDocument();
  });
  it('renders nothing when a nested group does not provide items', async () => {
    const view = await render(() => <Combobox.Root defaultOpen>
      <Combobox.Portal><Combobox.Positioner><Combobox.Popup><Combobox.List><Combobox.Group data-testid="group">
        <Combobox.Collection>{(item: string) => <span>{item}</span>}</Combobox.Collection>
      </Combobox.Group></Combobox.List></Combobox.Popup></Combobox.Positioner></Combobox.Portal>
    </Combobox.Root>);
    expect(view.getByTestId('group')).toBeEmptyDOMElement();
  });
  it('keeps grouped providers and live row identity, and supplies updated numeric indices', async () => {
    const a = { value: 'a', label: 'Alpha' };
    const b = { value: 'b', label: 'Beta' };
    const view = await renderProps((props: { items: typeof a[]; label: string }) =>
      <Autocomplete.Root items={[{ items: props.items }]} inline>
        <Autocomplete.List>
          <Autocomplete.Group items={props.items} data-testid="group">
            <Autocomplete.GroupLabel>{props.label}</Autocomplete.GroupLabel>
            <Autocomplete.Collection>{(item: typeof a, index) =>
              <Autocomplete.Item value={item} data-testid={item.value}>
                {props.label}:{item.label}:{index}
              </Autocomplete.Item>
            }</Autocomplete.Collection>
          </Autocomplete.Group>
        </Autocomplete.List>
      </Autocomplete.Root>, { items: [a, b], label: 'Initial' });
    const row = view.getByTestId('a');
    const group = view.getByTestId('group');
    expect(group.getAttribute('aria-labelledby')).toBeTruthy();
    expect(row.textContent).toBe('Initial:Alpha:0');
    await view.setProps({ label: 'Updated' });
    expect(view.getByTestId('a')).toBe(row);
    expect(row.textContent).toBe('Updated:Alpha:0');
    expect(view.getByTestId('group')).toBe(group);
    expect(document.getElementById(group.getAttribute('aria-labelledby')!)?.textContent).toBe('Updated');
    // The public callback takes a number, not an accessor. A changed index
    // intentionally reevaluates its callback; unrelated live JSX does not.
    await view.setProps({ items: [b, a] });
    expect(view.getByTestId('a').textContent).toBe('Updated:Alpha:1');
    await view.setProps({ items: [a] });
    expect(view.queryByTestId('b')).toBeNull();
    expect(view.getByTestId('a').textContent).toBe('Updated:Alpha:0');
  });
  it('resolves grouped row output under its owner without provider-wide hidden subscriptions', async () => {
    const release = attribution.enable();
    try {
      const items = Array.from({ length: 10 }, (_, index) => ({ value: index, label: `Command ${index}` }));
      const view = await renderProps((props: { label: string }) =>
        <Autocomplete.Root items={[{ items }]} inline>
          <Autocomplete.List>
            <Autocomplete.Group items={items}>
              <Autocomplete.GroupLabel>Commands</Autocomplete.GroupLabel>
              <Autocomplete.Collection>{(item: (typeof items)[number]) =>
                <Autocomplete.Item value={item} data-testid={`command-${item.value}`}>
                  <span>{item.label}</span><span>{props.label}</span>
                </Autocomplete.Item>
              }</Autocomplete.Collection>
            </Autocomplete.Group>
          </Autocomplete.List>
        </Autocomplete.Root>, { label: 'Application' });
      const row = view.getByTestId('command-0');
      expect(view.getAllByRole('option')).toHaveLength(10);
      await view.setProps({ label: 'Command' });
      expect(view.getByTestId('command-0')).toBe(row);
      expect(row.textContent).toBe('Command 0Command');
      // The harness rejects every unexpected structured diagnostic, with
      // attribution installed before construction and the live update.
      view.unmount();
    } finally { release(); }
  });
});
