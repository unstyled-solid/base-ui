import { renderToString } from '@solidjs/web';
import { expect, it } from 'vitest';
import { Accordion } from './index';

function Fixture() {
  return <Accordion.Root defaultValue={['a']}>
    <Accordion.Item value="a"><Accordion.Header><Accordion.Trigger>Heading</Accordion.Trigger></Accordion.Header>
      <Accordion.Panel style={{ 'animation-name': 'accordion-slide', 'animation-duration': '100ms' }}>Content</Accordion.Panel>
    </Accordion.Item>
  </Accordion.Root>;
}

it('Accordion SSR links generated IDs before client effects and suppresses initial inline animation', async () => {
  const html = await renderToString(() => <Fixture />, { renderId: 'accordion-a' });
  const trigger = html.match(/<button\b[^>]*>/)?.[0] ?? '';
  const panel = html.match(/<div\b[^>]*role="region"[^>]*>/)?.[0] ?? '';
  const triggerId = trigger.match(/\bid="([^"]+)"/)?.[1];
  const panelId = panel.match(/\bid="([^"]+)"/)?.[1];
  expect(triggerId).toBeTruthy();
  expect(panelId).toBeTruthy();
  expect(trigger).toContain(`aria-controls="${panelId}"`);
  expect(panel).toContain(`aria-labelledby="${triggerId}"`);
  expect(trigger).toContain('data-panel-open');
  expect(trigger).not.toMatch(/\sdata-open(?:=|\s|>)/);
  expect(html).not.toContain('data-value');
  expect(panel).toMatch(/animation-name:\s*none/);
  expect(panel).toMatch(/animation-duration:\s*100ms/);
  expect(panel).toMatch(/--accordion-panel-height:\s*auto/);
});

it('Accordion SSR keeps separate render namespaces isolated', async () => {
  const [first, second] = await Promise.all([
    renderToString(() => <Fixture />, { renderId: 'accordion-first' }),
    renderToString(() => <Fixture />, { renderId: 'accordion-second' }),
  ]);
  const firstIds = [...first.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const secondIds = [...second.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  expect(firstIds.length).toBeGreaterThanOrEqual(2);
  expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
});

it('Accordion SSR retains hidden-until-found and root/panel keepMounted precedence', async () => {
  const html = await renderToString(() => <Accordion.Root hiddenUntilFound>
    <Accordion.Item><Accordion.Panel>Searchable</Accordion.Panel></Accordion.Item>
    <Accordion.Item><Accordion.Panel hiddenUntilFound={false}>Absent</Accordion.Panel></Accordion.Item>
    <Accordion.Item><Accordion.Panel hiddenUntilFound={false} keepMounted>Kept</Accordion.Panel></Accordion.Item>
  </Accordion.Root>);
  expect(html).toContain('hidden="until-found"');
  expect(html).toContain('Searchable');
  expect(html).toContain('Kept');
  expect(html).not.toContain('Absent');
});
