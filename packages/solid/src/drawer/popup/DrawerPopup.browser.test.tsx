import { describe, expect } from 'vitest';
import { screen } from '@solidjs/testing-library';
import { createRenderer, browserCase, waitFor } from '../../../test';
import { Drawer } from '../index';

describe('Drawer nested popup animation geometry', () => {
  const { render } = createRenderer();
  const source = 'packages/react/src/drawer/popup/DrawerPopup.test.tsx';
  for (const reopen of [false, true]) browserCase({ source, case: reopen ? 'restores a fixed height before nested state when reopening a nested drawer' : 'keeps a fixed height applied while a nested drawer closes', environment: 'browser', issue: 'bsolid-review-drawer.1' }, async () => {
    const disabled = globalThis.BASE_UI_ANIMATIONS_DISABLED;
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    const css = `
      @keyframes drawer-review-exit { to { opacity: 0; } }
      .drawer-review-parent { height: var(--drawer-height, auto); overflow: hidden; transition: height 100ms linear; }
      .drawer-review-parent[data-nested-drawer-open] { height: var(--drawer-frontmost-height, var(--drawer-height)); }
      .drawer-review-parent-content { display: block; height: 160px; }
      .drawer-review-child-content { display: block; height: 64px; }
      .drawer-review-child[data-ending-style] { animation: drawer-review-exit 100ms; }
    `;
    const view = await render(() => <><style>{css}</style><Drawer.Root open modal={false}>
      <Drawer.Portal><Drawer.Viewport><Drawer.Popup class="drawer-review-parent" data-testid="parent">
        <div class="drawer-review-parent-content" />
        <Drawer.Root modal={false}><Drawer.Trigger>Open nested</Drawer.Trigger><Drawer.Portal><Drawer.Viewport>
          <Drawer.Popup class="drawer-review-child" data-testid="child"><div class="drawer-review-child-content" /><Drawer.Close>Close nested</Drawer.Close></Drawer.Popup>
        </Drawer.Viewport></Drawer.Portal></Drawer.Root>
      </Drawer.Popup></Drawer.Viewport></Drawer.Portal>
    </Drawer.Root></>);
    const mutations: { nested: boolean; height: string }[] = [];
    const parent = screen.getByTestId('parent');
    const observer = new MutationObserver(() => mutations.push({ nested: parent.hasAttribute('data-nested-drawer-open'), height: parent.style.getPropertyValue('--drawer-height') }));
    try {
      await view.user.click(screen.getByRole('button', { name: 'Open nested' }));
      await waitFor(() => expect(parent).toHaveAttribute('data-nested-drawer-open'));
      expect(parent.style.getPropertyValue('--drawer-height')).not.toBe('');
      observer.observe(parent, { attributes: true, attributeFilter: ['data-nested-drawer-open', 'style'] });
      await view.user.click(screen.getByRole('button', { name: 'Close nested' }));
      await waitFor(() => expect(screen.getByTestId('child')).toHaveAttribute('data-ending-style'));
      expect(parent).not.toHaveAttribute('data-nested-drawer-open');
      expect(parent.style.getPropertyValue('--nested-drawers')).toBe('0');
      expect(parent.style.getPropertyValue('--drawer-height')).not.toBe('');
      await waitFor(() => expect(mutations.some(item => !item.nested && item.height !== '')).toBe(true));
      await waitFor(() => expect(screen.queryByTestId('child')).toBeNull());
      if (reopen) {
        mutations.length = 0;
        await view.user.click(screen.getByRole('button', { name: 'Open nested' }));
        await waitFor(() => expect(parent).toHaveAttribute('data-nested-drawer-open'));
        await waitFor(() => expect(mutations.find(item => item.nested)).toBeDefined());
        expect(mutations.find(item => item.nested)!.height).not.toBe('');
      }
    } finally { observer.disconnect(); view.unmount(); globalThis.BASE_UI_ANIMATIONS_DISABLED = disabled; }
  });
});
