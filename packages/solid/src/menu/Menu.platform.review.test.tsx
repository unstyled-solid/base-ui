import { expect, it, vi } from 'vitest';
import { createRenderer, screen, waitFor } from '../../test';
import * as Menu from './index.parts';

vi.mock('../utils/platform', async () => {
  const actual = await vi.importActual<typeof import('../utils/platform')>('../utils/platform');
  return { platform: { ...actual.platform, engine: { ...actual.platform.engine, webkit: true } } };
});
const { render } = createRenderer();

it('WebKit virtual selection follows the input without corrupting checkbox or radio state', async () => {
  const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup>
    <Menu.Input aria-label="Query" /><Menu.List><Menu.CheckboxItem defaultChecked>Flag</Menu.CheckboxItem><Menu.RadioGroup defaultValue="a"><Menu.RadioItem value="a">A</Menu.RadioItem></Menu.RadioGroup><Menu.LinkItem href="#docs">Docs</Menu.LinkItem></Menu.List>
  </Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root></Menu.FilterProvider>);
  const input = screen.getByRole('searchbox');
  await waitFor(() => expect(input).toHaveFocus());
  const checkbox = screen.getByRole('menuitemcheckbox'); const radio = screen.getByRole('menuitemradio');
  await view.user.keyboard('{ArrowDown}');
  expect(checkbox.getAttribute('aria-selected')).toBe('true'); expect(checkbox.getAttribute('aria-checked')).toBe('true');
  await view.user.keyboard('{ArrowDown}');
  expect(checkbox.getAttribute('aria-selected')).toBe('false'); expect(radio.getAttribute('aria-selected')).toBe('true'); expect(radio.getAttribute('aria-checked')).toBe('true');
  await view.user.keyboard('{ArrowDown}');
  expect(screen.getByRole('menuitem', { name: 'Docs' }).getAttribute('aria-selected')).toBe('true');
  expect(input).toHaveFocus();
});

it('plain WebKit menus do not publish aria-selected', async () => {
  await render(() => <Menu.Root defaultOpen><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item>Copy</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>);
  expect(screen.getByRole('menuitem')).not.toHaveAttribute('aria-selected');
});

it('WebKit ordinary item selection follows the active descendant', async () => {
  const view = await render(() => <Menu.FilterProvider><Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Input aria-label="Query" /><Menu.List><Menu.Item>Apple</Menu.Item><Menu.Item>Banana</Menu.Item></Menu.List></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root></Menu.FilterProvider>);
  const input = screen.getByRole('searchbox'), apple = screen.getByRole('menuitem', { name: 'Apple' }), banana = screen.getByRole('menuitem', { name: 'Banana' });
  await waitFor(() => expect(input).toHaveFocus());
  expect(apple).toHaveAttribute('aria-selected', 'false');
  await view.user.keyboard('{ArrowDown}');
  expect(apple).toHaveAttribute('aria-selected', 'true');
  expect(banana).toHaveAttribute('aria-selected', 'false');
  expect(input).toHaveAttribute('aria-activedescendant', apple.id);
  await view.user.keyboard('{ArrowDown}');
  expect(apple).toHaveAttribute('aria-selected', 'false');
  expect(banana).toHaveAttribute('aria-selected', 'true');
});
