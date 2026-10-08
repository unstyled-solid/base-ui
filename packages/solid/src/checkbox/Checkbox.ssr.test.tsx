import { isServer, renderToString, type JSX } from '@solidjs/web';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './index';
import { Field } from '../field';

describe('Checkbox SSR', () => {
  it('serializes native input and unchecked fallback without client effects', () => {
    expect(isServer).toBe(true);
    const html = renderToString(() => <Checkbox.Root name="terms" uncheckedValue="off" />);
    expect(html).toContain('<span'); expect(html).toContain('role="checkbox"');
    expect(html).toContain('aria-checked="false"'); expect(html).toContain('type="checkbox"');
    expect(html).toContain('type="hidden"'); expect(html).toContain('value="off"');
    expect(html).toContain('aria-hidden="true"');
  });
  it('serializes mixed style hooks and indicator state', () => {
    const html = renderToString(() => <Checkbox.Root checked indeterminate><Checkbox.Indicator>Mixed</Checkbox.Indicator></Checkbox.Root>);
    expect(html).toContain('aria-checked="mixed"'); expect(html).toContain('Mixed');
    expect(html).toContain('data-indeterminate'); expect(html).not.toContain('data-checked');
  });
  it.each([false, true])('indicator mount policy is source-compatible (keepMounted=%s)', (keepMounted) => {
    const html = renderToString(() => <Checkbox.Root><Checkbox.Indicator keepMounted={keepMounted}>checkbox-indicator-content</Checkbox.Indicator></Checkbox.Root>);
    expect(html.includes('checkbox-indicator-content')).toBe(keepMounted);
  });
  it.each([
    { checked: false, indeterminate: false, keepMounted: false, mounted: false },
    { checked: true, indeterminate: false, keepMounted: false, mounted: true },
    { checked: false, indeterminate: true, keepMounted: false, mounted: true },
    { checked: false, indeterminate: false, keepMounted: true, mounted: true },
    { checked: true, indeterminate: false, keepMounted: true, mounted: true },
    { checked: false, indeterminate: true, keepMounted: true, mounted: true },
  ])('matches the source checked/indeterminate/keepMounted server matrix %#', ({ checked, indeterminate, keepMounted, mounted }) => {
    const html = renderToString(() => <Checkbox.Root checked={checked} indeterminate={indeterminate}>
      <Checkbox.Indicator keepMounted={keepMounted} data-testid="indicator">indicator-server-matrix</Checkbox.Indicator>
    </Checkbox.Root>);
    expect(html.includes('indicator-server-matrix')).toBe(mounted);
    expect(html.includes('data-testid="indicator"')).toBe(mounted);
  });
  it.each([false, true])('field label association precedes explicit-id registration (nativeButton=%s)', (nativeButton) => {
    const html = renderToString(() => <Field.Root><Field.Label>Label</Field.Label>
      <Checkbox.Root id="explicit" nativeButton={nativeButton} render={nativeButton ? (props) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} /> : undefined} />
    </Field.Root>);
    const target = html.match(/for="([^"]+)"/)?.[1];
    expect(target).toBeTruthy(); expect(html).toContain(`id="${target}"`);
    expect(target).not.toBe('explicit');
  });
});
