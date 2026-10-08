import { expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Tabs } from '../index';

it.each([false, true])('SSR renders selection without client panel registrations (keepMounted=%s)', (keepMounted) => {
  // Source: mountedTabPanels starts empty; useIsoLayoutEffect never registers
  // panels on the server, even when keepMounted renders all panel elements.
  const html = renderToString(() => <Tabs.Root value="a"><Tabs.List>
    <Tabs.Tab value="a">A</Tabs.Tab><Tabs.Tab value="b">B</Tabs.Tab>
  </Tabs.List><Tabs.Panel value="a" keepMounted={keepMounted}>Panel A</Tabs.Panel>
    <Tabs.Panel value="b" keepMounted={keepMounted}>Panel B</Tabs.Panel>
  </Tabs.Root>);
  expect(html).toContain('Panel A');
  expect(html.includes('Panel B')).toBe(keepMounted);
  expect(html).not.toContain('aria-controls=');
  expect(html).not.toContain('aria-labelledby=');
});
