import { describe, expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Field } from './index';

describe('Field SSR', () => {
  it('renders the native control value without inventing a missing label', () => {
    const html = renderToString(() => <Field.Root><Field.Control name="email" defaultValue="initial" /></Field.Root>);
    expect(html).toContain('<input');
    expect(html).toContain('value="initial"');
    expect(html).toContain('name="email"');
    expect(html).not.toContain('aria-labelledby');
  });

  it('renders generated IDs and explicit disabled invalidity', () => {
    const html = renderToString(() => <Field.Root disabled invalid><Field.Label>Label</Field.Label><Field.Control /><Field.Description>Help</Field.Description></Field.Root>);
    expect(html).toMatch(/<label[^>]*id="[^"]+"/);
    expect(html).toMatch(/<input[^>]*id="[^"]+"/);
    expect(html).toContain('data-invalid');
    expect(html).toContain('data-disabled');
    expect(html).not.toContain('aria-invalid');
  });
});
