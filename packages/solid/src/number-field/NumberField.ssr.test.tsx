import { renderToString } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { NumberFieldRoot } from './root/NumberFieldRoot';
import { NumberFieldInput } from './input/NumberFieldInput';

describe('NumberField locale SSR source fixtures', () => {
  it.each(['en-US', 'de-DE', 'fr-FR', 'ar-EG', 'fa-IR'])('formats on the server in %s without calling refs or callbacks', async (locale) => {
    const client = vi.fn();
    const html = await renderToString(() => <NumberFieldRoot value={1234.56} locale={locale} name="amount" inputRef={client} onValueChange={client}>
      <NumberFieldInput ref={client} />
    </NumberFieldRoot>, { renderId: `number-${locale}` });
    expect(html).toContain('type="text"');
    const expected = new Intl.NumberFormat(locale).format(1234.56);
    expect(html).toContain(`value="${expected}"`);
    expect(html).toContain('type="number"');
    expect(html).toContain('value="1234.56"');
    expect(client).not.toHaveBeenCalled();
  });
});
