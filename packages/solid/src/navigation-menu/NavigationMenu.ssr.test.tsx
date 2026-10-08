import { describe, expect, it, vi } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { NavigationMenu } from './index';
describe('NavigationMenu SSR', () => {
  for (const keepMounted of [true, false]) {
    it(`renders content for crawlers only when keepMounted=${keepMounted}`, async () => {
      expect(isServer).toBe(true);
      const changed = vi.fn();
      const html = await renderToString(() => <NavigationMenu.Root onValueChange={changed}>
        <NavigationMenu.List><NavigationMenu.Item>
          <NavigationMenu.Trigger>Overview</NavigationMenu.Trigger>
          <NavigationMenu.Content keepMounted={keepMounted} data-testid="crawler-content"><NavigationMenu.Link href="/guide">Guide</NavigationMenu.Link></NavigationMenu.Content>
        </NavigationMenu.Item></NavigationMenu.List>
        <NavigationMenu.Portal><NavigationMenu.Positioner><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>
      </NavigationMenu.Root>, { renderId: `nav-${keepMounted}` });
      expect(html).toContain('<nav'); expect(html).toContain('<ul');
      if (keepMounted) { expect(html).toContain('crawler-content'); expect(html).toContain('hidden'); expect(html).toContain('/guide'); }
      else expect(html).not.toContain('crawler-content');
      expect(changed).not.toHaveBeenCalled();
    });
  }
});
