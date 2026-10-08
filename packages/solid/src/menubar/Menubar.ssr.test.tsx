import { expect, it, vi } from 'vitest';
import { renderToString } from '@solidjs/web';
import { Menubar } from './Menubar';

it('Menubar SSR projects source host defaults without calling native refs', () => {
  const ref = vi.fn();
  const html = renderToString(() => <Menubar id="file-menubar" ref={ref}>File</Menubar>);
  expect(html).toContain('role="menubar"');
  expect(html).toContain('id="file-menubar"');
  expect(html).toContain('aria-orientation="horizontal"');
  expect(html).toContain('data-orientation="horizontal"');
  expect(html).toContain('data-modal');
  expect(html).not.toContain('data-has-submenu-open');
  expect(html).not.toContain('disabled');
  expect(ref).not.toHaveBeenCalled();
});

it('Menubar SSR projects custom native host props and state on independent roots', () => {
  const vertical = renderToString(() => <Menubar id="vertical-menubar" orientation="vertical" modal={false}
    render={(props, state) => <div {...props} ref={(node) => props.ref?.(node)} data-render-modal={String(state.modal)} />}>Edit</Menubar>);
  const horizontal = renderToString(() => <Menubar id="horizontal-menubar" />);
  expect(vertical).toContain('aria-orientation="vertical"');
  expect(vertical).toContain('data-render-modal="false"');
  expect(vertical).not.toContain('data-modal');
  expect(horizontal).toContain('aria-orientation="horizontal"');
  expect(horizontal).toContain('data-modal');
  expect(horizontal).not.toContain('vertical-menubar');
});
