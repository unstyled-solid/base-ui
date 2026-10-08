import { renderToString } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { Form } from './Form';
import { Field } from '../field';

describe('Form SSR', () => {
  it('renders native Form defaults and overrides without attaching imperative actions', () => {
    const actionsRef = vi.fn();
    const html = renderToString(() => <Form actionsRef={actionsRef} action="/submit" method="post">Child</Form>);
    expect(html).toContain('<form');
    // HTML attribute names are case-insensitive; RC13 preserves this prop's casing.
    expect(html).toMatch(/\bnovalidate\b/i);
    expect(html).toContain('action="/submit"');
    expect(html).toContain('method="post"');
    expect(html).toContain('Child');
    expect(actionsRef).not.toHaveBeenCalled();
    const native = renderToString(() => <Form noValidate={false} />);
    expect(native).not.toMatch(/\bnovalidate\b/i);
    const masked = renderToString(() => <Form noValidate={undefined} />);
    expect(masked).not.toMatch(/\bnovalidate\b/i);
  });

  it('projects initial external errors and native Field values under the Form provider', () => {
    const html = renderToString(() => <Form errors={{ name: 'Server error' }}>
      <Field.Root name="name"><Field.Control defaultValue="initial" /><Field.Error /></Field.Root>
    </Form>);
    expect(html).toContain('<form');
    expect(html).toContain('name="name"');
    expect(html).toContain('value="initial"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('Server error');
  });
});
