import { describe, expect, it } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { ScrollArea } from './index';
import { CSPContext } from '../internals/csp-context/CSPContext';

describe('ScrollArea SSR', () => {
  const app = () => <ScrollArea.Root><ScrollArea.Viewport><ScrollArea.Content>content</ScrollArea.Content></ScrollArea.Viewport>
    <ScrollArea.Scrollbar keepMounted><ScrollArea.Thumb /></ScrollArea.Scrollbar><ScrollArea.Corner /></ScrollArea.Root>;
  it('renders inert nonfocusable viewport and kept track without DOM measurement', () => {
    expect(isServer).toBe(true);
    const html = renderToString(app, { renderId: 'scroll-area-ssr' });
    expect(html).toContain('content');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-orientation="vertical"');
    expect(html).not.toContain('data-has-overflow');
  });
  it('isolates viewport identifiers between requests and applies CSP controls', () => {
    const first = renderToString(app, { renderId: 'scroll-area-first' });
    const second = renderToString(app, { renderId: 'scroll-area-second' });
    const identifier = /data-id="([^"]+-viewport)"/;
    expect(first.match(identifier)?.[1]).toBeTruthy();
    expect(first.match(identifier)?.[1]).not.toBe(second.match(identifier)?.[1]);
    const disabled = renderToString(() => <CSPContext value={{ disableStyleElements: true }}>{app()}</CSPContext>);
    expect(disabled).not.toContain('<style');
  });
});
