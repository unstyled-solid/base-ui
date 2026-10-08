import { expect, it, vi } from 'vitest';
import { renderToString } from '@solidjs/web';
import { createRenderElement } from './createRenderElement';

it('server disabled rendering evaluates neither the host nor its children or prop getter', () => {
  const render = vi.fn(() => <div>hidden-host</div>), children = vi.fn(() => 'hidden-content');
  const getter = vi.fn(() => ({ get children() { return children(); } }));
  const html = renderToString(() => createRenderElement('div', { render }, { enabled: false, props: [getter] }));
  expect(html).not.toContain('hidden-host'); expect(html).not.toContain('hidden-content');
  expect(render).not.toHaveBeenCalled(); expect(getter).not.toHaveBeenCalled(); expect(children).not.toHaveBeenCalled();
});
