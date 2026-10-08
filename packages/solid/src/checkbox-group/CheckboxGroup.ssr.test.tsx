import { renderToString, type JSX } from '@solidjs/web';
import { describe, expect, it } from 'vitest';
import { CheckboxGroup } from './CheckboxGroup';
import { CheckboxRoot } from '../checkbox/root/CheckboxRoot';
import { Field } from '../field';

describe('CheckboxGroup SSR', () => {
  it('serializes default selection without claiming unmounted child IDs', () => {
    const html = renderToString(() => <CheckboxGroup defaultValue={['a']} allValues={['a', 'b']} id="group">
      <CheckboxRoot parent /><CheckboxRoot value="a" /><CheckboxRoot value="b" />
    </CheckboxGroup>);
    expect(html).toContain('role="group"'); expect(html).toContain('id="group"');
    expect(html).toContain('aria-checked="mixed"'); expect(html).toContain('aria-checked="true"');
    expect(html).not.toContain('aria-controls');
  });
  it.each([false, true])('shared field IDs are unique and labels remain associated (%s)', (nativeButton) => {
    const html = renderToString(() => <Field.Root name="fruits"><Field.Label>Fruits</Field.Label><CheckboxGroup allValues={['a', 'b']}>
      <CheckboxRoot parent nativeButton={nativeButton} render={nativeButton ? (props) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} /> : undefined} />
      <CheckboxRoot value="a" nativeButton={nativeButton} render={nativeButton ? (props) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} /> : undefined} />
      <CheckboxRoot value="b" nativeButton={nativeButton} render={nativeButton ? (props) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} /> : undefined} />
    </CheckboxGroup></Field.Root>);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(ids).toHaveLength(nativeButton ? 4 : 7); expect(new Set(ids).size).toBe(ids.length);
  });
  it.each([false, true])('item labels reach their own input/button during SSR (%s)', (nativeButton) => {
    const html = renderToString(() => <Field.Root name="fruits"><CheckboxGroup allValues={['a']}>
      <Field.Item><Field.Label>Fruit</Field.Label><CheckboxRoot value="a" nativeButton={nativeButton}
        render={nativeButton ? (props) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} /> : undefined} /></Field.Item>
    </CheckboxGroup></Field.Root>);
    const target = html.match(/for="([^"]+)"/)?.[1];
    expect(target).toBeTruthy(); expect(html).toContain(`id="${target}"`);
    expect(html).not.toContain('aria-controls');
  });
});
