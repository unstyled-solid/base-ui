import { expect, it } from 'vitest';
import { renderToString } from '@solidjs/web';
import { CSPProvider } from './CSPProvider';
import { PrehydrationScript } from '../internals/PrehydrationScript';
import { styleDisableScrollbar } from '../utils/styles';
it('CSPProvider SSR preserves nonce, server script body and style suppression', () => {
  const html = renderToString(() => <CSPProvider nonce="nonce-value"><PrehydrationScript script="globalThis.prehydrationProbe = 1;" />{styleDisableScrollbar.getElement()}</CSPProvider>);
  expect(html).toContain('nonce="nonce-value"');
  expect(html).toContain('globalThis.prehydrationProbe = 1;');
  expect(html).toContain('scrollbar-width:none');
  const suppressed = renderToString(() => <CSPProvider disableStyleElements>{styleDisableScrollbar.getElement()}</CSPProvider>);
  expect(suppressed).not.toContain('<style');
});
