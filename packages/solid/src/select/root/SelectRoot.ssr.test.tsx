import { describe, expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Select } from '../index';

describe('Select server model and relationships', () => {
  it('resolves closed labels and projects single native submission without mounting a portal', () => {
    const html = renderToString(() => <Select.Root id="font" name="font" value="sans" items={{ sans: 'Sans-serif' }}>
      <Select.Label>Font</Select.Label><Select.Trigger><Select.Value /></Select.Trigger>
      <Select.Portal><Select.Positioner><Select.Popup><Select.Item value="sans">Sans-serif</Select.Item></Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>);
    expect(html).toContain('Sans-serif');
    expect(html).toContain('id="font-label"');
    expect(html).toContain('id="font"');
    expect(html).not.toContain('aria-labelledby=');
    expect(html).not.toContain('role="listbox"');
    expect(html).toContain('name="font"');
    expect(html).toContain('value="sans"');
  });
  it('projects readonly multiple objects per item on the server', () => {
    const html = renderToString(() => <Select.Root multiple value={[{ code: 'US' }, { code: 'CA' }] as const} name="country" form="external" itemToStringValue={item => item.code} />);
    expect(html.match(/name="country"/g)).toHaveLength(2);
    expect(html).toContain('value="US"'); expect(html).toContain('value="CA"');
    expect(html.match(/form="external"/g)).toHaveLength(3);
  });
});
