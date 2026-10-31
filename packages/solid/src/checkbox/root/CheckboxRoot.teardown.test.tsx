import { createSignal, For, Show } from 'solid-js';
import { expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { Checkbox } from '../index';

it.each(['replace', 'remove', 'filter', 'hide'] as const)(
  'keeps sibling controls reactive after row teardown: %s',
  async (operation) => {
    const rows = [{ id: 'campaign' }, { id: 'other' }];
    const view = await createRenderer().renderProps((props: {
      rows: { id: string }[];
      visible: boolean;
    }) => {
      const [checked, setChecked] = createSignal(false);
      return <>
        <Show when={props.visible}>
          <For each={props.rows}>{(row) => (
            <Checkbox.Root checked={true} aria-label={row.id}>
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
          )}</For>
        </Show>
        <Checkbox.Root aria-label="sibling" checked={checked()} onCheckedChange={setChecked} />
      </>;
    }, { rows, visible: true });
    const original = view.getByRole('checkbox', { name: 'campaign' });
    const other = view.getByRole('checkbox', { name: 'other' });
    await view.setProps(operation === 'hide' ? { visible: false } : {
      rows: operation === 'replace' ? [{ id: 'campaign' }, { id: 'other' }]
        : operation === 'remove' ? [] : rows.filter((row) => row.id !== 'campaign'),
    });
    expect(original.isConnected).toBe(false);
    if (operation === 'replace') {
      expect(view.getByRole('checkbox', { name: 'campaign' })).toHaveAttribute('aria-checked', 'true');
    } else {
      expect(view.queryByRole('checkbox', { name: 'campaign' })).toBeNull();
    }
    if (operation === 'filter') expect(view.getByRole('checkbox', { name: 'other' })).toBe(other);
    const sibling = view.getByRole('checkbox', { name: 'sibling' });
    await view.user.click(sibling);
    expect(sibling).toHaveAttribute('aria-checked', 'true');
    await view.user.click(sibling);
    expect(sibling).toHaveAttribute('aria-checked', 'false');
  },
);
