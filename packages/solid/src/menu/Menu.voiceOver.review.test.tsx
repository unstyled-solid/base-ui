import { expect, it, vi } from 'vitest';
import { createRenderer, screen, waitFor } from '../../test';
import * as Menu from './index.parts';

vi.mock('../utils/platform', async () => {
  const actual = await vi.importActual<typeof import('../utils/platform')>('../utils/platform');
  return { platform: { ...actual.platform, screenReader: { ...actual.platform.screenReader, voiceOver: true } } };
});
const { render } = createRenderer();

it('VoiceOver ArrowRight entry follows Tab and Enter root opening', async () => {
  const view = await render(() => <Menu.Root><Menu.Trigger>Open menu</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.SubmenuRoot><Menu.SubmenuTrigger>More</Menu.SubmenuTrigger><Menu.Portal><Menu.Positioner><Menu.Popup data-testid="submenu"><Menu.Item>Alpha</Menu.Item><Menu.Item>Beta</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.SubmenuRoot></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>);
  await view.user.keyboard('{Tab}');
  await view.user.keyboard('{Enter}');
  const trigger = await screen.findByRole('menuitem', { name: 'More' });
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await view.user.keyboard('{ArrowRight}');
  await screen.findByTestId('submenu');
  await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus());
  expect(trigger).not.toHaveAttribute('aria-expanded');
  expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
});

it('VoiceOver keyboard submenu entry omits expanded state while retaining haspopup', async () => {
  const view = await render(() => <Menu.Root defaultOpen><Menu.Trigger>Actions</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.SubmenuRoot><Menu.SubmenuTrigger openOnHover={false}>More</Menu.SubmenuTrigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item>Leaf</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.SubmenuRoot></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>);
  const trigger = screen.getByRole('menuitem', { name: 'More' }); trigger.focus();
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await view.user.keyboard('{ArrowRight}');
  await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Leaf' })).toHaveFocus());
  expect(trigger).not.toHaveAttribute('aria-expanded'); expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
});

it('VoiceOver Enter entry omits expanded state after focusing the submenu item', async () => {
  const view = await render(() => <Menu.Root><Menu.Trigger>Open menu</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.SubmenuRoot><Menu.SubmenuTrigger>More</Menu.SubmenuTrigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item>Alpha</Menu.Item><Menu.Item>Beta</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.SubmenuRoot></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>);
  await view.user.keyboard('{Tab}{Enter}');
  const trigger = await screen.findByRole('menuitem', { name: 'More' });
  await waitFor(() => expect(trigger).toHaveFocus());
  await view.user.keyboard('{Enter}');
  await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus());
  expect(trigger).not.toHaveAttribute('aria-expanded');
});

it('VoiceOver pointer entry retains expanded state', async () => {
  const view = await render(() => <Menu.Root><Menu.Trigger>Open menu</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.SubmenuRoot><Menu.SubmenuTrigger>More</Menu.SubmenuTrigger><Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item>Alpha</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.SubmenuRoot></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>);
  await view.user.click(screen.getByRole('button', { name: 'Open menu' }));
  const trigger = await screen.findByRole('menuitem', { name: 'More' });
  await view.user.click(trigger);
  await screen.findByRole('menuitem', { name: 'Alpha' });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
});
