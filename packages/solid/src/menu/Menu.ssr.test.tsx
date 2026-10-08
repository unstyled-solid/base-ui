import { expect, it } from 'vitest';
import { isServer, renderToString } from '@solidjs/web';
import { MenuGroup } from './group/MenuGroup';
import { MenuGroupLabel } from './group-label/MenuGroupLabel';
import { MenuRadioGroup } from './radio-group/MenuRadioGroup';
import * as Menu from './index.parts';
it('Menu groups render server HTML with escaped labels and independent ID namespaces', () => {
  expect(isServer).toBe(true);
  const fixture = () => <MenuGroup><MenuGroupLabel>{'<Actions>'}</MenuGroupLabel><MenuRadioGroup disabled><span>Choices</span></MenuRadioGroup></MenuGroup>;
  const first = renderToString(fixture, { renderId: 'menu-A-' });
  const second = renderToString(fixture, { renderId: 'menu-B-' });
  expect(first).toContain('role="group"');
  expect(first).toContain('aria-hidden="true"');
  expect(first).toContain('&lt;Actions>');
  expect(first).not.toContain('<Actions>');
  expect(first).toContain('aria-disabled="true"');
  const id = (html: string) => /\bid="([^"]+)"/.exec(html)?.[1];
  expect(id(first)).toBeTruthy();
  expect(id(first)).not.toBe(id(second));
  expect(renderToString(fixture, { renderId: 'menu-A-' })).toBe(first);
});
it('Menu root, items and native links have complete server semantics without partial ids', () => {
  const html = renderToString(() => <Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Menu.Positioner><Menu.Popup>
    <Menu.Item>Copy</Menu.Item><Menu.LinkItem href="#docs">Docs</Menu.LinkItem>
    <Menu.CheckboxItem defaultChecked>Flag<Menu.CheckboxItemIndicator /></Menu.CheckboxItem>
    <Menu.RadioGroup defaultValue="a"><Menu.RadioItem value="a">A<Menu.RadioItemIndicator /></Menu.RadioItem></Menu.RadioGroup>
    <Menu.Arrow />
  </Menu.Popup></Menu.Positioner></Menu.Root>, { renderId: 'menu-root-' });
  expect(html).toContain('role="menu"');
  expect(html).toContain('role="menuitemcheckbox"');
  expect(html).toContain('role="menuitemradio"');
  expect(html).toContain('href="#docs"');
  expect(html).toContain('aria-checked="true"');
  expect(html).toContain('data-checked');
  expect(html).not.toContain('id="undefined');
  expect(html).not.toContain('data-starting-style');
});
it('Menu filter server pass uses dialog/list semantics and independent stable id namespaces', () => {
  const fixture = () => <Menu.FilterProvider><Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Menu.Positioner><Menu.Popup>
    <Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Copy</Menu.Item><Menu.CheckboxItem defaultChecked>Flag</Menu.CheckboxItem></Menu.List>
  </Menu.Popup></Menu.Positioner></Menu.Root></Menu.FilterProvider>;
  const first = renderToString(fixture, { renderId: 'menu-filter-A-' });
  const second = renderToString(fixture, { renderId: 'menu-filter-B-' });
  expect(first).toContain('role="dialog"');
  expect(first).toContain('aria-haspopup="dialog"');
  expect(first).toContain('role="menu"');
  expect(first).toContain('type="text"');
  expect(first).toContain('role="searchbox"');
  expect(first).toContain('inputmode="search"');
  expect(first).not.toContain('aria-selected');
  expect(first).not.toContain('id="undefined');
  expect(second).not.toBe(first);
  expect(renderToString(fixture, { renderId: 'menu-filter-A-' })).toBe(first);
});
it.each([false, true])('Menu payload callbacks render under their provider on the server (filtered=%s)', filtered => {
  function Content() {
    return <Menu.Root<{ label: string }> defaultOpen>{({ payload }) => <>
      <output>{payload?.label ?? 'No payload'}</output><Menu.Item>Action</Menu.Item>
    </>}</Menu.Root>;
  }
  const html = renderToString(() => filtered ? <Menu.FilterProvider><Content /></Menu.FilterProvider> : <Content />);
  expect(html).toContain('No payload');
  expect(html).toContain('role="menuitem"');
  expect(html).not.toContain('id="undefined');
});
