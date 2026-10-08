import { describe, expect, it } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { CSPContext } from '../../internals/csp-context';
import { Tabs } from '../index';

describe('Tabs SSR', () => {
  function Fixture(props: { value?: number | null; prehydrate?: boolean }) {
    return <CSPContext value={{ nonce: 'tabs-test-nonce' }}><Tabs.Root value={props.value}>
      <Tabs.List><Tabs.Tab value={0}>Zero</Tabs.Tab><Tabs.Tab value={1}>One</Tabs.Tab>
        <Tabs.Indicator renderBeforeHydration={props.prehydrate} />
      </Tabs.List><Tabs.Panel value={0}>Panel zero</Tabs.Panel><Tabs.Panel value={1}>Panel one</Tabs.Panel>
    </Tabs.Root></CSPContext>;
  }
  it('emits the CSP-nonced positioning script only when requested', () => {
    expect(isServer).toBe(true);
    const html = renderToString(() => <Fixture value={0} prehydrate />, { renderId: 'tabs-' });
    expect(html).toMatch(/<script[^>]*nonce="tabs-test-nonce"/);
    expect(html).toContain('document.currentScript');
    expect(html).toContain('--active-tab-');
    expect(renderToString(() => <Fixture value={0} />)).not.toContain('<script');
    expect(renderToString(() => <Fixture value={null} prehydrate />)).not.toContain('<script');
  });
  it('preserves explicit selection and deterministic request-local IDs', () => {
    const render = (renderId: string) => renderToString(() => <Fixture value={1} />, { renderId });
    const first = render('first-');
    expect(first).toContain('Panel one');
    expect(first).not.toContain('Panel zero');
    expect(render('first-')).toBe(first);
    expect(render('second-')).not.toBe(first);
  });
});
