import { describe, expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Autocomplete } from '../index';
import { Field } from '../../field/index';

// Source: Root.test.tsx's three server-render/form-ownership scenarios.
// Separate server compilation; these are prehydration assertions, not hydration parity.
describe('Autocomplete SSR form ownership', () => {
  it.each([false, true])('renders only the visible input name before hydration, inline=%s', async (inline) => {
    const html = await renderToString(() => <form><Field.Root name="search">
      <Autocomplete.Root defaultValue="alpha" inline={inline} items={['alpha']}>
        <Autocomplete.Input data-testid="visible" />
        <Autocomplete.Trigger>Open</Autocomplete.Trigger>
        {inline ? <Autocomplete.List><Autocomplete.Item value="alpha">alpha</Autocomplete.Item></Autocomplete.List>
          : <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup>
            <Autocomplete.List><Autocomplete.Item value="alpha">alpha</Autocomplete.Item></Autocomplete.List>
          </Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>}
      </Autocomplete.Root>
    </Field.Root></form>);
    const inputs = html.match(/<input\b[^>]*>/g) ?? [];
    expect(inputs.filter((input) => /\bname="search"/.test(input))).toHaveLength(1);
    expect(inputs.find((input) => input.includes('data-testid="visible"'))).toContain('name="search"');
  });

  it('renders default popup text without a form name before hydration', async () => {
    const html = await renderToString(() => <form><Field.Root name="search">
      <Autocomplete.Root defaultValue="alpha" items={['alpha']}>
        <Autocomplete.Trigger><Autocomplete.Value /></Autocomplete.Trigger>
        <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup>
          <Autocomplete.Input data-testid="popup-input" />
          <Autocomplete.List><Autocomplete.Item value="alpha">alpha</Autocomplete.Item></Autocomplete.List>
        </Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
      </Autocomplete.Root>
    </Field.Root></form>);
    expect(html).toContain('alpha');
    expect(html).not.toContain('name="search"');
    expect(html).not.toContain('data-testid="popup-input"');
    expect(html).toMatch(/<input\b[^>]*value="alpha"/);
  });

  it.each([0, ['one', 'two'] as const])('serializes source numeric/text-array default %j with one visible form owner', async (value) => {
    const html = await renderToString(() => <form><Autocomplete.Root defaultValue={value} name="search">
      <Autocomplete.Input /><output><Autocomplete.Value>{(text) => text}</Autocomplete.Value></output>
    </Autocomplete.Root></form>);
    expect(html.match(/name="search"/g)).toHaveLength(1);
    expect(html).toContain(`value="${String(value)}"`);
    expect(html.replace(/<!--[\s\S]*?-->/g, '')).toMatch(new RegExp(`<output[^>]*>${String(value)}</output>`));
  });
});
