import { expect, it } from 'vitest';
import { flush } from 'solid-js';
import { createRenderer, screen, waitFor } from '../../test';
import * as Menu from '../menu/index.parts';
import { Menubar } from './Menubar';

// Filtering remains Menu-owned; this suite only verifies the host handoff.
const { render } = createRenderer();
it.each(['horizontal', 'vertical'] as const)('Menubar preserves %s filterable trigger navigation', async (orientation) => {
  const { user } = await render(() => <Menubar orientation={orientation}>
    <Menu.FilterProvider><Menu.Root>
      <Menu.Trigger>File</Menu.Trigger>
      <Menu.Portal><Menu.Positioner><Menu.Popup>
        <Menu.Input aria-label="Filter file actions" />
        <Menu.List><Menu.Item>New file</Menu.Item><Menu.Item>Open file</Menu.Item></Menu.List>
      </Menu.Popup></Menu.Positioner></Menu.Portal>
    </Menu.Root></Menu.FilterProvider>
    <Menu.Root><Menu.Trigger>Edit</Menu.Trigger>
      <Menu.Portal><Menu.Positioner><Menu.Popup><Menu.Item>Copy</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal>
    </Menu.Root>
  </Menubar>);
  const file = screen.getByRole('menuitem', { name: 'File' });
  const edit = screen.getByRole('menuitem', { name: 'Edit' });
  file.focus(); flush();
  await user.keyboard(orientation === 'vertical' ? '{ArrowDown}' : '{ArrowRight}');
  await waitFor(() => expect(edit).toHaveFocus());
  expect(screen.queryByRole('searchbox')).toBeNull();
  file.focus(); flush();
  await user.keyboard(orientation === 'vertical' ? '{ArrowRight}' : '{ArrowDown}');
  const input = await screen.findByRole('searchbox');
  await waitFor(() => expect(input).toHaveFocus());
  expect(screen.getByRole('menuitem', { name: 'New file' })).toHaveAttribute('data-highlighted');
});
