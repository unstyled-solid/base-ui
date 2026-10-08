import { describe, expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Collapsible } from '../index';

describe('Collapsible SSR', () => {
  it('suppresses initial authored keyframes without client measurement', async () => {
    const html = await renderToString(() => <Collapsible.Root defaultOpen>
      <Collapsible.Trigger>Toggle</Collapsible.Trigger>
      <Collapsible.Panel style={{ 'animation-name': 'entrance', 'animation-duration': '100ms' }}>Contents</Collapsible.Panel>
    </Collapsible.Root>, { renderId: 'collapsible-open' });
    expect(html).toContain('Contents');
    expect(html).toContain('animation-name:none');
    expect(html).toContain('animation-duration:100ms');
    expect(html).toContain('--collapsible-panel-height:auto');
    expect(html).not.toContain('data-starting-style');
  });
  it('omits closed content unless retained, and preserves native find-in-page hidden value', async () => {
    const html = await renderToString(() => <>
      <Collapsible.Root><Collapsible.Panel>Unmounted</Collapsible.Panel></Collapsible.Root>
      <Collapsible.Root><Collapsible.Panel hiddenUntilFound>Searchable</Collapsible.Panel></Collapsible.Root>
    </>, { renderId: 'collapsible-closed' });
    expect(html).not.toContain('Unmounted');
    expect(html).toContain('Searchable');
    expect(html).toContain('hidden="until-found"');
  });
});
