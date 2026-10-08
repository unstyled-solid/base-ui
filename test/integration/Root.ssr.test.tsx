import { describe, expect, it } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { DirectionProvider, CSPProvider, Form, Field, Input, Toolbar, ToggleGroup, Toggle, ScrollArea } from '../../packages/solid/src/index';
import { NumberField } from 'baseui-solid2/number-field';

describe('Root integration server smoke', () => {
  it('renders the real root and a subpath together without a browser global', () => {
    expect(isServer).toBe(true);
    expect(typeof document).toBe('undefined');
    const html = renderToString(() => <CSPProvider nonce="root-nonce"><DirectionProvider direction="rtl">
      <Form><Field.Root name="username"><Field.Label>Username</Field.Label><Input defaultValue="Alice" /></Field.Root>
        <Field.Root name="quantity"><NumberField.Root defaultValue={5}><NumberField.Input /></NumberField.Root></Field.Root>
        <Toolbar.Root><ToggleGroup defaultValue={['one']}><Toggle value="one">one</Toggle></ToggleGroup></Toolbar.Root>
      </Form>
    </DirectionProvider></CSPProvider>, { renderId: 'integration-' });
    expect(html).toContain('name="username"');
    expect(html).toContain('value="Alice"');
    expect(html).toContain('value="5"');
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-pressed="true"');
    const id = /<input[^>]*\bid="([^"]+)"/.exec(html)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`for="${id}"`);
  });

  it('keeps actual ScrollArea SSR style policy and nonce request-local through the root provider', () => {
    function Fixture(props: { nonce: string; disable: boolean }) {
      return <CSPProvider nonce={props.nonce} disableStyleElements={props.disable}>
        <ScrollArea.Root><ScrollArea.Viewport><ScrollArea.Content>Content</ScrollArea.Content></ScrollArea.Viewport></ScrollArea.Root>
      </CSPProvider>;
    }
    const first = renderToString(() => <Fixture nonce="first-request" disable={false} />, { renderId: 'first-' });
    const disabled = renderToString(() => <Fixture nonce="disabled-request" disable />, { renderId: 'disabled-' });
    const last = renderToString(() => <Fixture nonce="last-request" disable={false} />, { renderId: 'last-' });
    expect(first).toContain('nonce="first-request"');
    expect(first).toContain('data-base-ui-style="base-ui-disable-scrollbar"');
    expect(disabled).not.toContain('<style');
    expect(last).toContain('nonce="last-request"');
    expect(last).not.toContain('first-request');
  });
});
