import { describe, it, expect, vi } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { NavigationMenuRoot } from './NavigationMenuRoot';
import { useNavigationMenuRootContext } from './NavigationMenuRootContext';
function Value() {
  const root = useNavigationMenuRootContext();
  return <span data-open={String(root.open)}>{String(root.value)}</span>;
}
describe('NavigationMenuRoot SSR request ownership', () => {
  for (const value of [0, false, '']) {
    it(`renders falsy default ${JSON.stringify(value)} as open without client effects`, async () => {
      expect(isServer).toBe(true);
      const changed = vi.fn(); const complete = vi.fn(); const actions = { current: null as NavigationMenuRoot.Actions | null };
      const html = await renderToString(() => <NavigationMenuRoot defaultValue={value} onValueChange={changed} onOpenChangeComplete={complete} actionsRef={actions}><Value /></NavigationMenuRoot>, { renderId: `nav-${typeof value}` });
      expect(html).toContain('<nav'); expect(html).toContain('data-open="true"');
      expect(actions.current).toBeNull(); expect(changed).not.toHaveBeenCalled(); expect(complete).not.toHaveBeenCalled();
    });
  }
  it('isolates values and nested tree ownership across overlapping requests', async () => {
    const [first, second] = await Promise.all([
      renderToString(() => <NavigationMenuRoot defaultValue="first"><Value /><NavigationMenuRoot defaultValue="nested-first"><Value /></NavigationMenuRoot></NavigationMenuRoot>, { renderId: 'nav-first' }),
      renderToString(() => <NavigationMenuRoot defaultValue="second"><Value /><NavigationMenuRoot defaultValue="nested-second"><Value /></NavigationMenuRoot></NavigationMenuRoot>, { renderId: 'nav-second' }),
    ]);
    expect(first).toContain('nested-first'); expect(first).not.toContain('second');
    expect(second).toContain('nested-second'); expect(second).not.toContain('first');
    expect(first.match(/<nav/g)).toHaveLength(1); expect(second.match(/<nav/g)).toHaveLength(1);
    expect(first).toContain('<div'); expect(second).toContain('<div');
  });
});
