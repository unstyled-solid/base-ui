import { describe, expect, vi } from 'vitest';
import { browserCase, createRenderer, fireEvent, firePointer, waitFor } from '../../test';
import { Dialog } from './index';
import type { JSX } from '@solidjs/web';

const source = 'packages/react/src/dialog/root/DialogRoot.test.tsx';
const { render } = createRenderer();
const replay = (name: string, body: () => Promise<void>) => browserCase({ source, case: name, environment: 'browser', issue: 'bsolid-integration' }, body);

// Public consumer imports are confined to their individual browser replay bodies.
// Missing integration exports cannot pull unrelated families into production Dialog.
describe('Dialog cross-family source replay', () => {
  for (const kind of ['contained triggers', 'detached triggers', 'multiple detached triggers'] as const) {
    for (const family of ['menu', 'select'] as const) {
      replay(`source ${kind}: open parent then dismiss nested ${family} through internal backdrops`, async () => {
        const Menu = await import('../menu/index.parts');
        const Select = await import('../select/index.parts');
        const handle = Dialog.createHandle();
        const Trigger = () => <Dialog.Trigger handle={kind === 'contained triggers' ? undefined : handle}>Open</Dialog.Trigger>;
        const Nested = () => family === 'menu'
          ? <Menu.Root><Menu.Trigger>Open nested</Menu.Trigger><Menu.Portal><Menu.Positioner data-testid="nested-positioner">
            <Menu.Popup><Menu.Item>Item</Menu.Item></Menu.Popup>
          </Menu.Positioner></Menu.Portal></Menu.Root>
          : <Select.Root><Select.Trigger>Open nested</Select.Trigger><Select.Portal><Select.Positioner data-testid="nested-positioner">
            <Select.Popup><Select.Item value="item">Item</Select.Item></Select.Popup>
          </Select.Positioner></Select.Portal></Select.Root>;
        const view = await render(() => <>
          {kind !== 'contained triggers' && <Trigger />}
          {kind === 'multiple detached triggers' && <Dialog.Trigger handle={handle}>Open another</Dialog.Trigger>}
          <Dialog.Root handle={kind === 'contained triggers' ? undefined : handle}>
            {kind === 'contained triggers' && <Trigger />}<Dialog.Portal><Dialog.Popup data-testid="parent">
              <Nested />
            </Dialog.Popup></Dialog.Portal>
          </Dialog.Root>
        </>);
        await view.user.click(view.getByText('Open'));
        await view.findByRole('dialog');
        await view.user.click(view.getByText('Open nested'));
        await view.findByRole(family === 'menu' ? 'menu' : 'listbox');
        await view.user.click(view.getByTestId('nested-positioner').previousElementSibling as HTMLElement);
        await waitFor(() => expect(view.queryByRole(family === 'menu' ? 'menu' : 'listbox')).toBeNull());
        expect(view.getByRole('dialog')).toBeInTheDocument();
        await view.user.click(view.getByTestId('parent').previousElementSibling?.previousElementSibling as HTMLElement);
        await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      });
    }
    replay(`source ${kind}: menu-item dialog Escape preserves its parent menu`, async () => {
      const Menu = await import('../menu/index.parts');
      const handle = Dialog.createHandle();
      const Trigger = () => <Menu.Item closeOnClick={false} nativeButton render={(props) => <Dialog.Trigger {...props}
        id={typeof props.id === 'string' ? props.id : undefined} handle={kind === 'contained triggers' ? undefined : handle} />}>Open dialog</Menu.Item>;
      function DialogContent(): JSX.Element {
        return <>
          {kind !== 'contained triggers' && <Trigger />}
          {kind === 'multiple detached triggers' && <Dialog.Trigger handle={handle}>Open another</Dialog.Trigger>}
          <Dialog.Root handle={kind === 'contained triggers' ? undefined : handle}>
            {kind === 'contained triggers' && <Trigger />}<Dialog.Portal><Dialog.Popup /></Dialog.Portal>
          </Dialog.Root>
        </>;
      }
      const view = await render(() => <Menu.Root><Menu.Trigger>Open menu</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup>
        <DialogContent />
      </Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>);
      await view.user.click(view.getByText('Open menu'));
      await view.findByRole('menu');
      await view.user.click(view.getByRole('menuitem', { name: 'Open dialog' }));
      await view.findByRole('dialog');
      await view.user.keyboard('[Escape]');
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      expect(view.getByRole('menu')).toBeInTheDocument();
    });
  }
  for (const family of ['menu', 'select'] as const) {
    replay(`dismissing nested modal ${family} leaves parent dialog open`, async () => {
      // Keep the two generic Root signatures distinct rather than making a
      // non-callable union of Menu.Root and Select.Root.
      const Menu = await import('../menu/index.parts');
      const Select = await import('../select/index.parts');
      const Nested = () => family === 'menu'
        ? <Menu.Root><Menu.Trigger>Open nested</Menu.Trigger><Menu.Portal>
          <Menu.Positioner data-testid="nested-positioner"><Menu.Popup><Menu.Item>Item</Menu.Item></Menu.Popup></Menu.Positioner>
        </Menu.Portal></Menu.Root>
        : <Select.Root><Select.Trigger>Open nested</Select.Trigger><Select.Portal>
          <Select.Positioner data-testid="nested-positioner"><Select.Popup><Select.Item value="item">Item</Select.Item></Select.Popup></Select.Positioner>
        </Select.Portal></Select.Root>;
      const view = await render(() => <Dialog.Root defaultOpen>
        <Dialog.Portal><Dialog.Backdrop data-testid="dialog-backdrop" /><Dialog.Popup>
          <Nested />
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      await view.user.click(view.getByText('Open nested'));
      await view.findByRole(family === 'menu' ? 'menu' : 'listbox');
      const backdrop = view.getByTestId('nested-positioner').previousElementSibling as HTMLElement;
      await view.user.click(backdrop);
      await waitFor(() => expect(view.queryByRole(family === 'menu' ? 'menu' : 'listbox')).toBeNull());
      expect(view.getByRole('dialog')).toBeInTheDocument();
      await view.user.click(view.getByTestId('dialog-backdrop'));
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    });
  }

  replay('Escape in a nested dialog does not close its parent menu', async () => {
    const Menu = await import('../menu/index.parts');
    const view = await render(() => <Menu.Root><Menu.Trigger>Open menu</Menu.Trigger>
      <Menu.Portal><Menu.Positioner><Menu.Popup>
        <Dialog.Root><Menu.Item closeOnClick={false} nativeButton
          render={(props) => <Dialog.Trigger {...props} id={typeof props.id === 'string' ? props.id : undefined} />}>Open dialog</Menu.Item>
          <Dialog.Portal><Dialog.Popup><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
        </Dialog.Root>
      </Menu.Popup></Menu.Positioner></Menu.Portal>
    </Menu.Root>);
    await view.user.click(view.getByText('Open menu'));
    await view.findByRole('menu');
    await view.user.click(view.getByRole('menuitem', { name: 'Open dialog' }));
    await view.findByRole('dialog');
    await view.user.keyboard('[Escape]');
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    expect(view.getByRole('menu')).toBeInTheDocument();
  });

  replay('unmounted detached menu-item trigger returns focus to the menu trigger', async () => {
    const Menu = await import('../menu/index.parts');
    const handle = Dialog.createHandle();
    const view = await render(() => <>
      <Menu.Root><Menu.Trigger>Open menu</Menu.Trigger><Menu.Portal><Menu.Positioner><Menu.Popup>
        <Menu.Item nativeButton render={(props) => <Dialog.Trigger {...props} id={typeof props.id === 'string' ? props.id : undefined} handle={handle} />}>Open dialog</Menu.Item>
      </Menu.Popup></Menu.Positioner></Menu.Portal></Menu.Root>
      <Dialog.Root handle={handle}><Dialog.Portal><Dialog.Popup><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>
    </>);
    const menuTrigger = view.getByText('Open menu');
    await view.user.click(menuTrigger);
    const menu = await view.findByRole('menu');
    await waitFor(() => expect(menu).toHaveFocus());
    await view.user.click(view.getByRole('menuitem', { name: 'Open dialog' }));
    await waitFor(() => expect(view.queryByRole('menu')).toBeNull());
    await view.findByRole('dialog');
    await view.user.keyboard('[Escape]');
    await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(menuTrigger).toHaveFocus());
  });

  replay('first outside press after NumberField pointer-lock scrub dismisses', async () => {
    const NumberField = await import('../number-field/index.parts');
    const original = Element.prototype.requestPointerLock;
    const lock = vi.fn(() => Promise.resolve());
    try {
      Element.prototype.requestPointerLock = lock;
      const view = await render(() => <Dialog.Root defaultOpen modal={false}>
        <Dialog.Portal><Dialog.Popup>
          <NumberField.Root defaultValue={100}>
            <NumberField.ScrubArea data-testid="scrub"><span>Amount</span></NumberField.ScrubArea>
            <NumberField.Input aria-label="Amount" />
          </NumberField.Root>
        </Dialog.Popup></Dialog.Portal>
      </Dialog.Root>);
      const scrub = view.getByTestId('scrub');
      firePointer.down(scrub, { pointerType: 'mouse', button: 0, timeStamp: 100 });
      fireEvent.mouseDown(scrub, { button: 0 });
      firePointer.up(document.body, { pointerType: 'mouse', button: 0, timeStamp: 120 });
      fireEvent.mouseUp(document.body, { button: 0 });
      await Promise.resolve();
      await view.user.click(document.body);
      await waitFor(() => expect(view.queryByRole('dialog')).toBeNull());
      expect(lock).toHaveBeenCalledTimes(1);
    } finally { Element.prototype.requestPointerLock = original; }
  });

  replay('non-scrollable ScrollArea does not let trapped focus escape', async () => {
    const ScrollArea = await import('../scroll-area/index.parts');
    const view = await render(() => <><button>Outside before</button>
      <Dialog.Root defaultOpen modal="trap-focus"><Dialog.Portal><Dialog.Popup>
        <ScrollArea.Root style={{ width: '200px', height: '200px' }}>
          <ScrollArea.Viewport style={{ width: '100%', height: '100%' }}><div style={{ width: '100px', height: '100px' }}>Content</div></ScrollArea.Viewport>
        </ScrollArea.Root>
      </Dialog.Popup></Dialog.Portal></Dialog.Root><button>Outside after</button>
    </>);
    const popup = view.getByRole('dialog');
    await waitFor(() => expect(popup.contains(document.activeElement)).toBe(true));
    for (const shift of [false, false, true]) {
      await view.user.tab({ shift });
      expect(popup.contains(document.activeElement)).toBe(true);
    }
    expect(view.getByText('Outside before')).not.toHaveFocus();
    expect(view.getByText('Outside after')).not.toHaveFocus();
  });
});
