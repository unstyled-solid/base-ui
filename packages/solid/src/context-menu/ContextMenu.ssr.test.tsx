import { describe, expect, it } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { ContextMenuRoot } from './root/ContextMenuRoot';
import { ContextMenuTrigger } from './trigger/ContextMenuTrigger';

// Source: ContextMenuRoot.tsx (no host DOM), ContextMenuTrigger.tsx state
// mapping/default div. This runs the real Menu root in the server environment.
describe('ContextMenu server projection', () => {
  for (const open of [false, true]) {
    it(`renders the pointer surface without a DOM realm (defaultOpen=${open})`, () => {
      expect(isServer).toBe(true);
      const html = renderToString(() => <ContextMenuRoot defaultOpen={open}>
        <ContextMenuTrigger class="surface">{'<Surface>'}</ContextMenuTrigger>
      </ContextMenuRoot>, { renderId: `context-${open}-` });
      expect(html).toContain('<div');
      expect(html).toContain('class="surface"');
      expect(html).toContain('&lt;Surface>');
      expect(html).toContain('-webkit-touch-callout:none');
      expect(html.includes('data-popup-open')).toBe(open);
      expect(html.includes('data-pressed')).toBe(open);
      expect(html).not.toContain('aria-haspopup');
      expect(html).not.toContain('aria-expanded');
    });
  }
});
