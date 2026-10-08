import { renderToString } from '@solidjs/web';
import { describe, it, expect } from 'vitest';
import { Combobox } from '../index';
import { AriaCombobox } from './AriaCombobox';
describe('Combobox server external windows', () => {
  it('resolves a server-rendered defaultValue label from its root-local external window', async () => {
    const items = Combobox.createItems([] as { id: string; name: string }[], { getValue: (item) => item.id, getLabel: (item) => item.name });
    const html = await renderToString(() => <Combobox.Root items={items} filteredItems={[{ id: '1', name: 'Alice' }]} defaultValue="1"><Combobox.Input /></Combobox.Root>, { renderId: 'combobox-external' });
    expect(html).toContain('value="Alice"'); expect(html).toContain('role="combobox"'); expect(html).toContain('aria-expanded="false"');
  });
  it('keeps shared collection windows isolated across concurrent render requests', async () => {
    const items = Combobox.createItems([] as { id: string; name: string }[], { getValue: (item) => item.id, getLabel: (item) => item.name });
    const [a, b] = await Promise.all(['Alice', 'Alicia'].map((name) => renderToString(() => <Combobox.Root items={items} filteredItems={[{ id: '1', name }]} defaultValue="1"><Combobox.Input /></Combobox.Root>, { renderId: name })));
    expect(a).toContain('value="Alice"'); expect(b).toContain('value="Alicia"');
  });
  it('projects each selected value with its serializer and omits the validation control name', async () => {
    const html = await renderToString(() => <Combobox.Root multiple defaultValue={[1, 2]} name="users" form="external" itemToStringValue={(id: number) => `user-${id}`}><Combobox.Input /></Combobox.Root>);
    expect(html.match(/name="users"/g)).toHaveLength(2);
    expect(html).toContain('value="user-1"'); expect(html).toContain('value="user-2"'); expect(html.match(/form="external"/g)).toHaveLength(4);
  });
  it('none mode gives the visible server input sole form-name ownership', async () => {
    const html = await renderToString(() => <AriaCombobox selectionMode="none" name="search" defaultInputValue="query"><Combobox.Input /></AriaCombobox>);
    expect(html.match(/name="search"/g)).toHaveLength(1);
    expect(html).toContain('value="query"'); expect(html).toContain('aria-autocomplete="list"');
  });
});
