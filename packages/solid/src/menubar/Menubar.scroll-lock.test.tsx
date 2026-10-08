import { expect } from 'vitest';
import { flush } from 'solid-js';
import { browserCase, createRenderer, fireEvent, screen, waitFor } from '../../test';
import * as Menu from '../menu/index.parts';
import { Menubar } from './Menubar';

const { render } = createRenderer();
const source = 'packages/react/src/menubar/Menubar.test.tsx';
function locked(doc: Document) {
  return doc.documentElement.style.overflow === 'hidden' ||
    doc.documentElement.hasAttribute('data-base-ui-scroll-locked') || doc.body.style.overflow === 'hidden';
}
function touch(element: HTMLElement) {
  fireEvent.pointerDown(element, { pointerType: 'touch' });
  fireEvent.mouseDown(element);
  flush();
}
function TouchMenu(props: { name: string; width: string }) {
  return <Menu.Root>
    <Menu.Trigger data-testid={`${props.name}-trigger`}>{props.name}</Menu.Trigger>
    <Menu.Portal><Menu.Positioner style={{ width: props.width }} data-testid={`${props.name}-menu`}>
      <Menu.Popup><Menu.Item>Open</Menu.Item></Menu.Popup>
    </Menu.Positioner></Menu.Portal>
  </Menu.Root>;
}
for (const wide of [true, false]) {
  browserCase({ source, case: `touch scroll lock width=${wide ? 'viewport' : '240px'}`, environment: 'browser', issue: 'bsolid-browser' }, async () => {
    await render(() => <Menubar modal style={{ display: 'flex' }}>
      <TouchMenu name="file" width={wide ? 'calc(100vw - 10px)' : '240px'} />
    </Menubar>);
    touch(screen.getByTestId('file-trigger'));
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(locked(menu.ownerDocument)).toBe(wide));
  });
}
browserCase({ source, case: 'touch scroll-lock handoff between top-level menus', environment: 'browser', issue: 'bsolid-browser' }, async () => {
  await render(() => <Menubar modal style={{ display: 'flex' }}>
    <TouchMenu name="file" width="calc(100vw - 10px)" />
    <TouchMenu name="edit" width="240px" />
  </Menubar>);
  const first = screen.getByTestId('file-trigger');
  touch(first);
  await screen.findByTestId('file-menu');
  await waitFor(() => expect(locked(first.ownerDocument)).toBe(true));
  touch(screen.getByTestId('edit-trigger'));
  await screen.findByTestId('edit-menu');
  await waitFor(() => expect(screen.queryByTestId('file-menu')).toBeNull());
  await waitFor(() => expect(locked(first.ownerDocument)).toBe(false));
});
