import { expect, it, vi } from 'vitest';
import { renderToString } from '@solidjs/web';
import { createMediaQuery } from './index';
it('MediaQuery SSR uses declared server snapshots without browser subscriptions', () => {
  function Fixture() {
    const value = createMediaQuery('@media (wide)', { ssrMatchMedia: (query) => ({ matches: query === '(wide)' }) });
    return <output>{String(value())}</output>;
  }
  expect(renderToString(() => <Fixture />)).toContain('true');
});
it('MediaQuery uses ssrMatchMedia for the server snapshot', () => {
  const ssrMatchMedia = vi.fn(() => ({ matches: true }));
  function Fixture() {
    const matches = createMediaQuery('(min-width: 600px)', { ssrMatchMedia });
    return <span>{String(matches())}</span>;
  }
  const html = renderToString(() => <Fixture />);
  expect(ssrMatchMedia).toHaveBeenCalledWith('(min-width: 600px)');
  expect(html).toContain('true');
});
it('MediaQuery uses client matchMedia as the server snapshot only with noSsr', () => {
  const matchMedia = vi.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia;
  function Fixture(props: { noSsr?: boolean }) {
    const matches = createMediaQuery('(min-width: 600px)', { matchMedia, defaultMatches: false, get noSsr() { return props.noSsr; } });
    return <span>{String(matches())}</span>;
  }
  expect(renderToString(() => <Fixture noSsr />)).toContain('true');
  expect(renderToString(() => <Fixture />)).toContain('false');
});
