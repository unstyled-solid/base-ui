import { renderToString } from '@solidjs/web';
import { describe, expect, it } from 'vitest';
import { OTPField } from '../index';
import { Field } from '../../field';

describe('OTPField SSR', () => {
  it.each([
    ['numeric', '\\d{6}'], ['alpha', '[a-zA-Z]{6}'], ['alphanumeric', '[a-zA-Z0-9]{6}'], ['none', undefined],
  ] as const)('renders %s native hidden constraints before slots mount', async (validationType, pattern) => {
    const html = await renderToString(() => <OTPField.Root length={6} required name="otp" form="verify" validationType={validationType} />);
    expect(html).toContain('name="otp"');
    expect(html).toContain('form="verify"');
    expect(html).toContain('minlength="6"');
    expect(html).toContain('maxlength="6"');
    expect(html).toContain('required');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('autocomplete="one-time-code"');
    if (pattern) expect(html).toContain(`pattern="${pattern}"`);
    else expect(html).not.toContain('pattern=');
  });

  it('uses render-order IDs and normalizes overlong values during SSR', async () => {
    const html = await renderToString(() => <OTPField.Root length={3} defaultValue="1a234" id="code" name="otp">
      <div><OTPField.Input /><OTPField.Input /></div><OTPField.Separator /><OTPField.Input />
    </OTPField.Root>);
    expect(html).toContain('id="code"');
    expect(html).toContain('id="code-2"');
    expect(html).toContain('id="code-3"');
    expect(html).toContain('value="123"');
  });

  it('uses native Solid request-scoped IDs rather than the React 17 fallback', async () => {
    const fixture = () => <OTPField.Root length={2}><OTPField.Input /><OTPField.Input /></OTPField.Root>;
    const first = await renderToString(fixture, { renderId: 'otp-first' });
    const second = await renderToString(fixture, { renderId: 'otp-second' });
    const ids = (html: string) => [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(ids(first).length).toBeGreaterThanOrEqual(2);
    expect(new Set(ids(first)).size).toBe(ids(first).length);
    expect(ids(first).some((id) => ids(second).includes(id))).toBe(false);
  });

  it('projects the Field-owned name and provider fallback native label association before hydration', async () => {
    const html = await renderToString(() => <Field.Root name="field-code">
      <Field.Label id="field-label">Verification code</Field.Label>
      <Field.Description id="field-description">Enter the code</Field.Description>
      <OTPField.Root length={2} id="field-input" name="root-code" defaultValue="1a2" required aria-describedby="external">
        <OTPField.Input /><OTPField.Input />
      </OTPField.Root>
    </Field.Root>);
    expect(html).toContain('name="field-code"');
    expect(html).not.toContain('name="root-code"');
    // Pinned useLabelableId:79-82 gives the provider fallback precedence
    // before client registration, keeping label/first slot associated in SSR.
    const firstId = html.match(/<input[^>]*\bid="([^"]+)"/)?.[1];
    expect(firstId).toBeTruthy();
    expect(html).toContain(`for="${firstId}"`);
    expect(html).toContain(`id="${firstId}-2"`);
    expect(html).toContain('aria-describedby="external"');
    // Shared label/description IDs register in client effects in React too.
    expect(html).not.toContain('aria-labelledby="field-label"');
    expect(html).toContain('value="12"');
    expect(html).toContain('pattern="\\d{2}"');
  });
});
