import { renderToString } from '@solidjs/web';
import { describe, expect, it } from 'vitest';
import { Toggle } from '../toggle/Toggle';
import * as Toolbar from '../toolbar/index.parts';
import { ToggleGroup } from './ToggleGroup';

describe('ToggleGroup SSR source DOM', () => {
  it('serializes standalone selection and state without control-prop leakage', () => {
    const html = renderToString(() => <ToggleGroup defaultValue={['two']} multiple orientation="vertical">
      <Toggle value="one">One</Toggle><Toggle value="two">Two</Toggle>
    </ToggleGroup>);
    expect(html).toContain('role="group"');
    expect(html).toContain('data-orientation="vertical"');
    expect(html).toContain('data-multiple');
    expect(html).toMatch(/<button[^>]*aria-pressed="false"[^>]*>One/);
    expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*>Two/);
    expect(html).not.toContain('aria-orientation');
    expect(html).not.toMatch(/\s(?:value|defaultvalue|multiple|orientation|loopfocus|state|refs|props)=/);
  });

  it('serializes the real Toolbar composition and inherited disabled state', () => {
    const html = renderToString(() => <Toolbar.Root orientation="vertical">
      <Toolbar.Group disabled><ToggleGroup defaultValue={['one']}>
        <Toggle value="one">One</Toggle>
      </ToggleGroup></Toolbar.Group>
    </Toolbar.Root>);
    expect(html).toContain('role="toolbar"');
    expect(html).toContain('aria-orientation="vertical"');
    expect(html.match(/role="group"/g)).toHaveLength(2);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('data-disabled');
    expect(html).toMatch(/<button[^>]*\sdisabled(?:="")?[^>]*>One/);
  });
});
